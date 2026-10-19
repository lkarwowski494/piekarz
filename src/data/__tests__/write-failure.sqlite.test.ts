/**
 * Nieudany zapis nie udaje sukcesu [M1-audytor-generalny-003; 05-architekt-003, 08-programista-003,
 * 12-niezawodnosc-003]. Prawdziwy SQLite z wymuszonym błędem zapisu (SQLITE_FULL) i błędem otwarcia.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp, control } from './helpers/node-sqlite-adapter';
import type { StoredBakeLog, StoredFlourInventoryItem, StoredRecipe, StoredStarter } from '../db';

const starter: StoredStarter = {
  id: 'starter_user_1',
  name: 'Zakwas Ani',
  flourType: 'Żytnia 2000',
  hydration: 100,
  birthDate: 1600000000000,
  storageState: 'ROOM_TEMP',
  lastFedAt: 1700000000000,
};
const recipe: StoredRecipe = {
  id: 'recipe_user_1',
  name: 'Mój chleb',
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
  createdAt: 1600000000000,
};
const bake: StoredBakeLog = { id: 'bake_1', recipeName: 'Chleb', startedAt: 1700000000000 };
const flour: StoredFlourInventoryItem = { id: 'flour_user_1', name: 'Mąka 750', stockGrams: 1000, updatedAt: 1 };

describe('Failed writes are reported, not hidden (003)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('with a full disk every user-data write rejects, memory does not pretend, and earlier data survives a restart', async () => {
    const first = restartApp();
    await first.schema.initDatabase();
    await first.store.saveStarter(starter);
    await first.store.saveRecipe(recipe);
    await first.store.saveFlourInventoryItem(flour);

    control().failWrites = true;
    const fed = { ...starter, lastFedAt: 1800000000000 };
    await expect(first.store.saveStarter(fed)).rejects.toBeInstanceOf(first.status.StorageWriteError);
    await expect(first.store.saveRecipe({ ...recipe, id: 'recipe_user_2' })).rejects.toBeInstanceOf(first.status.StorageWriteError);
    await expect(first.store.saveBakeLog(bake)).rejects.toBeInstanceOf(first.status.StorageWriteError);
    await expect(first.store.saveFlourInventoryItem({ ...flour, stockGrams: 1 })).rejects.toBeInstanceOf(first.status.StorageWriteError);
    await expect(first.store.deleteStarter(starter.id)).rejects.toBeInstanceOf(first.status.StorageWriteError);
    await expect(first.store.deleteRecipe(recipe.id)).rejects.toBeInstanceOf(first.status.StorageWriteError);
    await expect(first.store.deleteFlourInventoryItem(flour.id)).rejects.toBeInstanceOf(first.status.StorageWriteError);

    // W tej samej sesji ekran nie widzi niezapisanych zmian
    expect((await first.store.getStarters()).find((s) => s.id === starter.id)?.lastFedAt).toBe(1700000000000);
    expect(await first.store.getBakeLogs()).toEqual([]);

    control().failWrites = false;
    const second = restartApp();
    await second.schema.initDatabase();
    expect(await second.store.getStarters()).toEqual([starter]);
    expect((await second.store.getRecipes()).filter((r) => !r.isBuiltIn).map((r) => r.id)).toEqual(['recipe_user_1']);
    expect((await second.store.getFlourInventory()).find((f) => f.id === flour.id)?.stockGrams).toBe(1000);
  });

  it('writeOrThrow wraps a SQLite error in StorageWriteError and passes results through', async () => {
    const { status } = restartApp();
    await expect(status.writeOrThrow(async () => 7)).resolves.toBe(7);
    const err = await status.writeOrThrow(async () => {
      throw new Error('SQLITE_FULL: database or disk is full');
    }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(status.StorageWriteError);
    expect((err as Error).message).toBe('SQLITE_FULL: database or disk is full');
  });

  it('subscribeStorageState notifies on unavailable and reset, and stops after unsubscribe', () => {
    const { status } = restartApp();
    const seen: string[] = [];
    const off = status.subscribeStorageState((s) => seen.push(s));
    status.markStorageUnavailable('x');
    status.resetStorageState();
    off();
    status.markStorageUnavailable('y');
    expect(seen).toEqual(['unavailable', 'ok']);
  });

  it('when the database cannot be opened, storage is marked unavailable instead of silently using demo data', async () => {
    control().failOpen = true;
    const app = restartApp();
    expect(app.status.getStorageState()).toBe('ok');
    await app.schema.initDatabase();
    expect(app.status.getStorageState()).toBe('unavailable');
    expect(app.status.getStorageError()).toContain('unable to open database file');
  });
});
