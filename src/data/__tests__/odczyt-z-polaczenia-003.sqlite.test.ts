/**
 * Odczyt z podanego połączenia daje to samo co odczyt z bazy aplikacji [M1-audytor-generalny-003; 12-niezawodnosc-001].
 * Zmiana strukturalna przed importem pakietu awaryjnego: czytelnicy receptur, zakwasów, wpisów zakwasu i spiżarni
 * przyjmują połączenie, żeby odczytać osobną bazę z pakietu tą samą ścieżką co kopia zapasowa. Prawdziwy SQLite.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1021 } from './helpers/baza-1021';

describe('Czytelnicy z połączeniem (003, zmiana strukturalna)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('czytajReceptury, readStarters, czytajWpisyZakwasow i czytajMaki dają to samo co getRecipes, getStarters, getAllStarterEntries i getFlourInventory', async () => {
    zalozBaze1021(dbFilePath('piekarz.db', '/Library/SQLite'));
    const app = restartApp();
    await app.schema.initDatabase();
    const db = await app.schema.getDb();
    if (!db) throw new Error('brak bazy');
    const { czytajReceptury } = require('../recipes-store') as typeof import('../recipes-store');
    const { czytajMaki } = require('../flour-store') as typeof import('../flour-store');
    const { czytajWpisyZakwasow, getAllStarterEntries } = require('../starter-entries-store') as typeof import('../starter-entries-store');

    expect(await czytajReceptury(db)).toEqual(await app.store.getRecipes());
    expect(await app.store.readStarters(db)).toEqual(await app.store.getStarters());
    expect(await czytajWpisyZakwasow(db)).toEqual(await getAllStarterEntries());
    expect(await czytajMaki(db)).toEqual(await app.store.getFlourInventory());
    expect((await app.store.readStarters(db)).length).toBe(2);
    expect((await czytajMaki(db)).length).toBe(2);
  });

  it('zbierzDaneZBazy (odczyt pakietu awaryjnego) daje ten sam stan co collectBackupData na bazie aplikacji', async () => {
    zalozBaze1021(dbFilePath('piekarz.db', '/Library/SQLite'));
    const app = restartApp();
    await app.schema.initDatabase();
    const db = await app.schema.getDb();
    if (!db) throw new Error('brak bazy');
    const { zbierzDaneZBazy } = require('../dane-z-bazy') as typeof import('../dane-z-bazy');
    const stan = await zbierzDaneZBazy(db);
    expect(stan).toEqual(await app.store.collectBackupData());
    expect({ bakes: stan.bakes.length, starters: stan.starters.length }).toEqual({ bakes: 4, starters: 2 });
  });

  it('czytajReceptury: pusta tabela daje null (getRecipes wraca wtedy do receptur wbudowanych z pamięci)', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    const db = await app.schema.getDb();
    if (!db) throw new Error('brak bazy');
    await db.runAsync('DELETE FROM recipes;');
    const { czytajReceptury } = require('../recipes-store') as typeof import('../recipes-store');
    expect(await czytajReceptury(db)).toBeNull();
  });
});
