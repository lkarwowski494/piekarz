/**
 * Moduł spiżarni wydzielony z sqlite-store (M2 p8, refactor przed M1-audytor-generalny-003/120/121/124):
 * zapis wiersza mąki i pamięć po zapisie.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import type { StoredFlourInventoryItem } from '../db';

const flour: StoredFlourInventoryItem = { id: 'flour_user_1', name: 'Mąka 750', stockGrams: 1000, updatedAt: 1 };

describe('flour-store', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('writeFlourRow zapisuje wiersz, który odczyt spiżarni zwraca bez zmian, a drugi zapis go aktualizuje', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    const flourStore = require('../flour-store') as typeof import('../flour-store');
    const db = await app.schema.getDb();
    if (!db) throw new Error('brak bazy');
    await flourStore.writeFlourRow(db, flour);
    await flourStore.writeFlourRow(db, { ...flour, stockGrams: 400, updatedAt: 2 });
    const rows = (await flourStore.getFlourInventory()).filter((f) => f.id === flour.id);
    expect(rows).toEqual([{ ...flour, stockGrams: 400, updatedAt: 2, brand: null, proteinPct: null }]);
  });

  it('rememberFlour podmienia pozycję o tym samym id, a nową dopisuje', () => {
    const app = restartApp();
    const flourStore = require('../flour-store') as typeof import('../flour-store');
    app.schema.memStore.flourInventory = [];
    flourStore.rememberFlour(flour);
    flourStore.rememberFlour({ ...flour, stockGrams: 10 });
    flourStore.rememberFlour({ ...flour, id: 'flour_user_2' });
    expect(app.schema.memStore.flourInventory.map((f) => [f.id, f.stockGrams])).toEqual([
      ['flour_user_1', 10],
      ['flour_user_2', 1000],
    ]);
  });
});
