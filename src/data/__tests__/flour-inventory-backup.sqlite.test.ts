/**
 * M1-audytor-generalny-097 (F-30, F-33; 05-architekt-fix-p5-005): spiżarnia mąk (zapasy) jest w pliku kopii
 * i wraca przy imporcie; kopia bez spiżarni (v1) nie kasuje zapasów w telefonie.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import type { StoredFlourInventoryItem } from '../db';

const flour = (id: string, stockGrams: number, extra: Partial<StoredFlourInventoryItem> = {}): StoredFlourInventoryItem => ({
  id, name: `Mąka ${id}`, stockGrams, updatedAt: 1000, ...extra,
});

describe('097: zapasy mąk w eksporcie i imporcie kopii (F-33)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('eksport → import przenosi zapasy (liczności i wartości) na „nowy telefon”', async () => {
    let app = restartApp();
    await app.schema.initDatabase();
    await app.store.saveFlourInventoryItem(flour('a', 750, { brand: 'Młyn', proteinPct: 12.5 }));
    await app.store.saveFlourInventoryItem(flour('b', 0));
    const json = JSON.stringify(app.backup.buildBackup(await app.store.collectBackupData()));
    expect(JSON.parse(json).state.flourInventory).toHaveLength(2);

    // Nowy telefon: pusta baza
    useTempDbDir();
    app = restartApp();
    await app.schema.initDatabase();
    const parsed = app.backup.parseAndValidateBackup(json);
    expect(parsed.skippedRows).toBe(0);
    await app.store.restoreFromBackupData(parsed.state);

    app = restartApp();
    await app.schema.initDatabase();
    const inv = await app.store.getFlourInventory();
    expect(inv.map((x) => [x.id, x.name, x.stockGrams, x.updatedAt])).toEqual([
      ['a', 'Mąka a', 750, 1000],
      ['b', 'Mąka b', 0, 1000],
    ]);
    expect(inv.find((x) => x.id === 'a')).toEqual(expect.objectContaining({ brand: 'Młyn', proteinPct: 12.5 }));
  });

  it('kopia v1 bez spiżarni nie kasuje zapasów w telefonie; zły wiersz spiżarni pominięty i policzony', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    await app.store.saveFlourInventoryItem(flour('zostaje', 500));
    const v1 = JSON.stringify({ format: 'piekarz-backup', schemaVersion: 1, exportedAt: 'x', state: { bakes: [], starters: [], customRecipes: [] } });
    await app.store.restoreFromBackupData(app.backup.parseAndValidateBackup(v1).state);
    expect((await app.store.getFlourInventory()).map((x) => x.id)).toEqual(['zostaje']);

    const v2 = JSON.stringify({
      format: 'piekarz-backup', schemaVersion: 2, exportedAt: 'x',
      state: { bakes: [], starters: [], customRecipes: [], starterEntries: [], flourInventory: [flour('ok', 100), { id: 'zly', name: 'X' }] },
    });
    const parsed = app.backup.parseAndValidateBackup(v2);
    expect(parsed.state.flourInventory?.map((x) => x.id)).toEqual(['ok']);
    expect(parsed.skippedRows).toBe(1);
  });

  it('parseFlourInventoryRow: zapas ≥ 0 i znacznik czasu wymagane; brak marki zostaje brakiem', () => {
    const { parseFlourInventoryRow } = require('../row-parsers') as typeof import('../row-parsers');
    expect(parseFlourInventoryRow({ id: 'a', name: 'A', stockGrams: 0, brand: null, updatedAt: 1 })).toEqual({
      id: 'a', name: 'A', stockGrams: 0, brand: undefined, proteinPct: undefined, updatedAt: 1,
    });
    expect(parseFlourInventoryRow({ id: 'a', name: 'A', stockGrams: -1, updatedAt: 1 })).toBeNull();
    expect(parseFlourInventoryRow({ id: 'a', name: 'A', stockGrams: 5 })).toBeNull();
  });

  it('kopia bezpieczeństwa (collectBackupData) zawiera zapasy', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    await app.store.saveFlourInventoryItem(flour('a', 750));
    expect((await app.store.collectBackupData()).flourInventory?.map((x) => x.id)).toEqual(['a']);
  });
});
