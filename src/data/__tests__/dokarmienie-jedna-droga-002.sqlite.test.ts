/**
 * Jedna droga zapisu dokarmienia [M1-audytor-generalny-002; 05-architekt-501]: usunięte albo poprawione dokarmienie
 * nie wraca po zapisie profilu lub stałego dnia zakwasu (obiekt odczytany przed zmianą dziennika). Prawdziwy SQLite.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, control } from './helpers/node-sqlite-adapter';
import type { StoredStarter, StoredStarterEntry } from '../db';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const T1 = 1700000000000;
const T2 = T1 + 6 * 3600000;

const zakwas: StoredStarter = { id: 'starter_user_1', name: 'Zakwas', flourType: 'Żytnia 2000', hydration: 100, birthDate: 1600000000000, storageState: 'FRIDGE' };
const wpis = (id: string, at: number): StoredStarterEntry => ({ id, starterId: zakwas.id, kind: 'feeding', occurredAt: at, feedRatio: '1:2:2', signs: [], createdAt: at, updatedAt: at });

function wpisyWBazie(): Array<{ id: string; occurred_at: number }> {
  const files = control().opened;
  const raw = openRaw(files[files.length - 1]);
  const w = raw.prepare("SELECT id, occurred_at FROM starter_entries WHERE kind = 'feeding' ORDER BY occurred_at").all() as Array<{ id: string; occurred_at: number }>;
  raw.close();
  return w.map((x) => ({ id: x.id, occurred_at: Number(x.occurred_at) }));
}

async function start() {
  const app = restartApp();
  const wpisy = require('../starter-entries-store') as typeof import('../starter-entries-store');
  await app.schema.initDatabase();
  await app.store.saveStarter(zakwas);
  await wpisy.addStarterEntry(wpis('w1', T1));
  await wpisy.addStarterEntry(wpis('w2', T2));
  const stary = (await app.store.getStarters()).find((s) => s.id === zakwas.id);
  if (!stary) throw new Error('brak zakwasu');
  expect(stary.lastFedAt).toBe(T2);
  return { app, wpisy, stary };
}

describe('M1-audytor-generalny-002: dokarmienie tylko przez dziennik', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('usunięte dokarmienie nie wraca po zapisie profilu obiektem sprzed usunięcia', async () => {
    const { app, wpisy, stary } = await start();
    await wpisy.deleteStarterEntry('w2');
    await app.store.saveStarter({ ...stary, name: 'Zakwas po edycji' });
    expect(wpisyWBazie()).toEqual([{ id: 'w1', occurred_at: T1 }]);
  });

  it('poprawa godziny dokarmienia: zapis stałego dnia obiektem sprzed poprawy zostawia 2 wpisy', async () => {
    const { app, wpisy, stary } = await start();
    await wpisy.updateStarterEntry({ ...wpis('w2', T2 - 3600000), updatedAt: T2 + 1 });
    await app.store.saveStarter({ ...stary, fridgeFeedDay: { weekday: 6, minuteOfDay: 480 } });
    expect(wpisyWBazie()).toEqual([{ id: 'w1', occurred_at: T1 }, { id: 'w2', occurred_at: T2 - 3600000 }]);
  });

  it('trwała kontrola: saveStarter z lastFedAt nie wstawia wierszy do starter_entries', async () => {
    const { app } = await start();
    await app.store.saveStarter({ ...zakwas, id: 'starter_user_2', lastFedAt: T2 + 3600000, feedingRatio: '1:5:5' });
    const files = control().opened;
    const raw = openRaw(files[files.length - 1]);
    const n = raw.prepare("SELECT count(*) AS c FROM starter_entries WHERE starter_id = 'starter_user_2'").get() as { c: number };
    raw.close();
    expect(Number(n.c)).toBe(0);
  });
});
