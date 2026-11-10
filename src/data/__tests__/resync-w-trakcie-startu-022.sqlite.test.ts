/**
 * Uzgadnianie powiadomień w trakcie startu nie psuje startu [M1-audytor-generalny-022; 05-architekt-503]: powrót aplikacji
 * na pierwszy plan (AppState „active” w app/_layout.tsx → resyncNotifications) w trakcie kopii przed migracją v7 na bazie
 * z buildu 1021 czytał kolumnę jeszcze nieistniejącą, a odczytNieudany zostawiał stan „unavailable” (ekran błędu bazy).
 * Prawdziwy SQLite; wywołanie przesunięte o k kroków pętli zdarzeń jak w sondzie audytu (sonda-start2). Badana jest
 * ścieżka nasłuchu z app/_layout.tsx (poStarcieBazy → resyncNotifications przy „ok”); ostatni test pilnuje, że _layout jej używa.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import { useTempDbDir, restartApp, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1021 } from './helpers/baza-1021';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const notif = (Notifications as unknown as { __mock: { iosStatus: number } }).__mock;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');

describe('M1-audytor-generalny-022: resyncNotifications w trakcie initDatabase (baza 1021)', () => {
  it('stan po starcie „ok” przy uzgadnianiu na każdym kroku pętli zdarzeń (zgoda granted)', async () => {
    const zle: string[] = [];
    for (let k = 0; k <= 40; k += 2) {
      useTempDbDir();
      mockFiles.clear();
      notif.iosStatus = 2;
      zalozBaze1021(APP_DB());
      const app = restartApp();
      const { resyncNotifications } = require('../../lib/notifications') as typeof import('../../lib/notifications');
      const init = app.schema.initDatabase();
      for (let i = 0; i < k; i++) await Promise.resolve();
      const uzgodnienie = app.status.poStarcieBazy().then((s) => (s === 'ok' ? resyncNotifications() : undefined)); // jak app/_layout.tsx
      await init;
      await uzgodnienie;
      const stan = app.status.getStorageState();
      if (stan !== 'ok') zle.push(`k=${k}: ${stan} (${app.status.getStorageError() ?? ''})`);
    }
    expect(zle).toEqual([]);
  });

  it('poStarcieBazy: w trakcie startu czeka na koniec, po starcie zwraca stan od razu', async () => {
    useTempDbDir();
    zalozBaze1021(APP_DB());
    const app = restartApp();
    const czeka = app.status.poStarcieBazy();
    const init = app.schema.initDatabase();
    await expect(czeka).resolves.toBe('ok');
    await init;
    await expect(app.status.poStarcieBazy()).resolves.toBe('ok');
  });

  it('powrót z tła w app/_layout.tsx uzgadnia dopiero po poStarcieBazy() i przy stanie „ok”', () => {
    const layout = fs.readFileSync(path.join(__dirname, '../../../app/_layout.tsx'), 'utf8');
    const nasluch = layout.slice(layout.indexOf("AppState.addEventListener('change'"), layout.indexOf("AppState.addEventListener('change'") + 600);
    expect(nasluch).toMatch(/poStarcieBazy\(\)\.then\(\(stan\) => \(stan === 'ok' \? resyncNotifications\(\)/);
  });
});
