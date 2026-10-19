/**
 * Kopia automatyczna po wypieku zawiera całą historię z bazy [M1-audytor-generalny-001; 05-architekt-001,
 * 08-programista-011, 12-niezawodnosc-001]. Prawdziwy SQLite (node:sqlite), restart przez resetModules.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import type { StoredBakeLog, StoredRecipe, StoredStarter } from '../db';
import type { PiekarzBackupEnvelope } from '../../lib/backup';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;

const bake = (n: number, finished: boolean): StoredBakeLog => ({
  id: `bake_${n}`,
  recipeName: `Chleb ${n}`,
  startedAt: 1700000000000 + n * 60000,
  finishedAt: finished ? 1700000000000 + n * 60000 + 3600000 : undefined,
});
const starter = (n: number): StoredStarter => ({
  id: `starter_user_${n}`,
  name: `Zakwas ${n}`,
  flourType: 'Żytnia 2000',
  hydration: 100,
  birthDate: 1600000000000,
  storageState: 'ROOM_TEMP',
});
const recipe = (n: number): StoredRecipe => ({
  id: `recipe_user_${n}`,
  name: `Receptura ${n}`,
  formula: {
    flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }],
    waterPercentage: 70,
    saltPercentage: 2,
    starterPercentage: 20,
    starterHydration: 100,
    targetDoughWeightGrams: 1000,
  },
  targetDDT: 25,
  isBuiltIn: false,
  createdAt: 1600000000000 + n,
});

async function latestAutoBackup(): Promise<PiekarzBackupEnvelope> {
  for (let i = 0; i < 200; i++) {
    const names = [...mockFiles.keys()].filter((k) => /\/piekarz-kopia-[^/]+\.json$/.test(k)).sort();
    if (names.length) return JSON.parse(mockFiles.get(names[names.length - 1]) as string);
    await new Promise((r) => setImmediate(r));
  }
  throw new Error('Brak kopii automatycznej');
}

describe('Auto-backup after a finished bake is built from the database (001)', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('after a restart, the backup of the 7th bake holds 7/7 bakes, 2/2 starters and 3/3 user recipes', async () => {
    const first = restartApp();
    await first.schema.initDatabase();
    for (let n = 1; n <= 6; n++) await first.store.saveBakeLog(bake(n, false));
    for (let n = 1; n <= 2; n++) await first.store.saveStarter(starter(n));
    for (let n = 1; n <= 3; n++) await first.store.saveRecipe(recipe(n));
    expect(mockFiles.size).toBe(0);

    const second = restartApp();
    await second.schema.initDatabase();
    await second.store.saveBakeLog(bake(7, true));

    const { state } = await latestAutoBackup();
    expect(state.bakes.map((b) => b.id).sort()).toEqual(['bake_1', 'bake_2', 'bake_3', 'bake_4', 'bake_5', 'bake_6', 'bake_7']);
    expect(state.starters.map((s) => s.id).sort()).toEqual(['starter_user_1', 'starter_user_2']);
    expect(state.customRecipes.map((r) => r.id).sort()).toEqual(['recipe_user_1', 'recipe_user_2', 'recipe_user_3']);
  });

  it('collectBackupData excludes built-in recipes and the demo starter that is not in the database', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    await app.store.saveBakeLog(bake(1, false));
    const data = await app.store.collectBackupData();
    expect(data.bakes.map((b) => b.id)).toEqual(['bake_1']);
    expect(data.starters).toEqual([]);
    expect(data.customRecipes).toEqual([]);
  });
});
