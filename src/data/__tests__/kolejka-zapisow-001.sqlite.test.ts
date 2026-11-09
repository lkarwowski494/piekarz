/**
 * Zapisy przez jedną kolejkę na jednym połączeniu [M1-audytor-generalny-001; 05-architekt-001, 05-architekt-502,
 * 08-programista-001]. Prawdziwy SQLite (node:sqlite): równoległy zapis nie może wejść do cudzej transakcji ani jej
 * wycofać — nieudany import wraca w całości, a „Usuń wszystkie dane” i zapis zakwasu nie łamią atomowości.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts, control } from './helpers/node-sqlite-adapter';
import type { StoredBakeLog, StoredStarter } from '../db';
import type { PiekarzBackupData } from '../../lib/backup';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;

const starter = (n: number, lastFedAt?: number): StoredStarter => ({
  id: `starter_user_${n}`,
  name: `Zakwas ${n}`,
  flourType: 'Żytnia 2000',
  hydration: 100,
  birthDate: 1600000000000,
  storageState: 'ROOM_TEMP',
  ...(lastFedAt ? { lastFedAt, feedingRatio: '1:2:2' } : {}),
});
const bake = (n: number): StoredBakeLog => ({
  id: `bake_${n}`,
  recipeName: `Chleb ${n}`,
  startedAt: 1700000000000 + n * 60000,
  finishedAt: 1700000000000 + n * 60000 + 3600000,
});

function liczności() {
  const files = control().opened;
  const raw = openRaw(files[files.length - 1] ?? dbFilePath());
  const c = tableCounts(raw);
  raw.close();
  return { bakes: c.bakes, starters: c.starters, starter_entries: c.starter_entries, app_settings: c.app_settings };
}

async function start() {
  const app = restartApp();
  await app.schema.initDatabase();
  await app.store.saveStarter(starter(1, 1700000000000));
  await app.store.saveBakeLog({ ...bake(1), finishedAt: undefined });
  await app.store.saveBakeLog({ ...bake(2), finishedAt: undefined });
  return app;
}

const kopia: PiekarzBackupData = {
  bakes: [bake(10), bake(11), bake(12)],
  starters: [starter(10, 1700000100000), starter(11, 1700000200000)],
  customRecipes: [],
};

describe('M1-audytor-generalny-001: jedna kolejka zapisów', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('nieudany import przy równoległym zapisie zakwasu wraca w całości; zakwas zapisany albo zgłoszony', async () => {
    const app = await start();
    const przed = liczności();
    control().failWritesMatching = /INTO bakes/i; // błąd w środku importu (po DELETE i zakwasach)

    const imp = app.store.restoreFromBackupData(kopia);
    const zap = app.store.saveStarter(starter(2));
    const [wImp, wZap] = await Promise.allSettled([imp, zap]);
    control().failWritesMatching = null;

    expect(wImp.status).toBe('rejected');
    const po = liczności();
    const dodany = wZap.status === 'fulfilled' ? 1 : 0;
    expect(po).toEqual({ ...przed, starters: przed.starters + dodany });
  });

  it('dwa równoległe zapisy zakwasu kończą się sukcesem, każdy z jednym wpisem dokarmienia', async () => {
    const app = await start();
    const przed = liczności();
    const wyniki = await Promise.allSettled([
      app.store.saveStarter(starter(3, 1700000300000)),
      app.store.saveStarter(starter(4, 1700000400000)),
    ]);
    expect(wyniki.map((w) => w.status)).toEqual(['fulfilled', 'fulfilled']);
    expect(liczności()).toEqual({ ...przed, starters: przed.starters + 2, starter_entries: przed.starter_entries + 2 });
  });

  it('ustawienie zapisane w trakcie nieudanego importu nie ginie z jego wycofaniem', async () => {
    const app = await start();
    const przed = liczności();
    control().failWritesMatching = /INTO bakes/i;
    const imp = app.store.restoreFromBackupData(kopia);
    const ust = app.store.setAppSetting('test_klucz_001', 'tak');
    const [wImp, wUst] = await Promise.allSettled([imp, ust]);
    control().failWritesMatching = null;

    expect(wImp.status).toBe('rejected');
    expect(wUst.status).toBe('fulfilled');
    expect(liczności()).toEqual({ ...przed, app_settings: przed.app_settings + 1 });
  });

  it('„Usuń wszystkie dane” przy równoległym zapisie zakwasu: wszystko albo nic, bez połowicznego stanu', async () => {
    const app = await start();
    const { usunWszystkieDane } = require('../usun-wszystko') as typeof import('../usun-wszystko');
    const przed = liczności();
    const [wUs, wZap] = await Promise.allSettled([usunWszystkieDane(), app.store.saveStarter(starter(5))]);
    const po = liczności();
    expect(wUs.status).toBe('fulfilled');
    // Kolejka: zapis zakwasu przed albo po czyszczeniu, nigdy w środku; tabele użytkownika puste albo z jednym zakwasem
    const zostal = wZap.status === 'fulfilled' && po.starters === 1 ? 1 : 0;
    expect(po.bakes).toBe(0);
    expect(po.starters).toBe(zostal);
    expect(przed.bakes).toBe(2);
  });
});
