/**
 * Baza nowsza niż aplikacja (powrót do starszego buildu) [M1-audytor-generalny-061; 05-architekt-012].
 * Kopia bazy każdej wydanej wersji z PRAGMA user_version ponad najnowszą znaną: start daje typowany stan
 * „newer” (tylko do odczytu), zapisy i kopie są odrzucane typowanym błędem, plik bazy zostaje bajt w bajt.
 * Wersje: fixtures/schema-<commit>.sql (70fd81a, adfe1fa, b21c194: v0; ebd8471 = b1013: v3), bieżąca v4
 * i „v5”: v4 z kolumną i tabelą, jakie mógłby dodać przyszły build.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts } from './helpers/node-sqlite-adapter';
import type { StoredBakeLog, StoredRecipe, StoredStarter } from '../db';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const sha256 = (file: string) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const FORMULA = { flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 };

function seedRows(raw: ReturnType<typeof openRaw>): void {
  for (let n = 1; n <= 3; n++) {
    raw.prepare('INSERT INTO bakes (id, recipe_name, started_at, finished_at, notes) VALUES (?, ?, ?, ?, ?)').run(`bake_${n}`, `Chleb ${n}`, 1000 + n, 2000 + n, `notatka ${n}`);
  }
  for (let n = 1; n <= 2; n++) {
    raw.prepare('INSERT INTO starters (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(`starter_${n}`, `Zakwas ${n}`, 'Żytnia 2000', 100, 1, 'FRIDGE', 2);
    raw.prepare('INSERT INTO recipes (id, name, formula_json, target_ddt, is_built_in, created_at) VALUES (?, ?, ?, 25, 0, ?)').run(`recipe_user_${n}`, `Moja ${n}`, JSON.stringify(FORMULA), n);
    raw.prepare('INSERT INTO flour_inventory (id, name, stock_grams, updated_at) VALUES (?, ?, ?, ?)').run(`flour_${n}`, `Mąka ${n}`, 1000 * n, 1);
  }
}

/** Baza danej wersji z danymi, potem user_version ponad najnowszą znaną; zwraca nową wersję. */
async function newerDb(version: string): Promise<number> {
  const { SCHEMA_MIGRATIONS } = restartApp().schema;
  const latest = Math.max(...SCHEMA_MIGRATIONS.map((m) => m.version));
  const current = version === 'v4' || version === 'v5';
  if (current) {
    const app = restartApp();
    await app.schema.initDatabase();
    await (await app.schema.getDb())?.closeAsync();
  }
  const raw = openRaw(APP_DB());
  if (!current) raw.exec(fs.readFileSync(path.join(__dirname, 'fixtures', `schema-${version}.sql`), 'utf8'));
  seedRows(raw);
  if (version === 'v5') {
    // Jak przyszły build: nowa kolumna i nowa tabela z danymi, których ta aplikacja nie zna
    raw.exec("ALTER TABLE bakes ADD COLUMN future_note TEXT; UPDATE bakes SET future_note = 'z nowszej wersji';");
    raw.exec("CREATE TABLE future_table (id TEXT PRIMARY KEY NOT NULL); INSERT INTO future_table VALUES ('f1'), ('f2');");
  }
  raw.exec(`PRAGMA user_version = ${latest + 1};`);
  raw.close();
  return latest + 1;
}

const bake: StoredBakeLog = { id: 'bake_new', recipeName: 'Nowy', startedAt: 5000, finishedAt: 9000 };
const starter: StoredStarter = { id: 'starter_1', name: 'Zmieniony', flourType: 'Żytnia 2000', hydration: 80, birthDate: 1, storageState: 'ROOM_TEMP' };
const recipe: StoredRecipe = { id: 'recipe_new', name: 'Nowa', formula: FORMULA, targetDDT: 25, isBuiltIn: false, createdAt: 7 };

describe.each(['70fd81a', 'adfe1fa', 'b21c194', 'ebd8471', 'v4', 'v5'])('baza nowsza niż aplikacja, wersja źródłowa %s', (version) => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('start: stan „newer”, zapisy odrzucone typowanym błędem, plik i liczności bez zmian, odczyt działa', async () => {
    const newVersion = await newerDb(version);
    const shaBefore = sha256(APP_DB());
    const rawBefore = openRaw(APP_DB());
    const countsBefore = tableCounts(rawBefore);
    rawBefore.close();
    expect(sha256(APP_DB())).toBe(shaBefore);

    const app = restartApp();
    await expect(app.schema.initDatabase()).resolves.toBeUndefined();
    // (1) typowany stan zamiast cichego startu
    expect(app.status.getStorageState()).toBe('newer');

    // (2) każda próba zapisu odrzucona typowanym błędem
    const attempts: Array<[string, () => Promise<unknown>]> = [
      ['receptura', () => app.store.saveRecipe(recipe)],
      ['wpis wypieku', () => app.store.saveBakeLog(bake)],
      ['koniec wypieku', () => app.store.finishBake(bake, [{ name: 'Mąka 1', weightGrams: 100 }])],
      ['zakwas', () => app.store.saveStarter(starter)],
      ['usunięcie receptury', () => app.store.deleteRecipe('recipe_user_1')],
      ['ustawienie', () => app.store.setAppSetting('unit_system', 'imperial')],
      ['lekcja', () => app.store.toggleLessonProgress(3)],
      ['import kopii', () => app.store.restoreFromBackupData({ bakes: [], starters: [], customRecipes: [] })],
      ['kopia przed importem', () => app.backup.safetyBackup('import', { bakes: [], starters: [], customRecipes: [] })],
    ];
    for (const [what, run] of attempts) {
      const err = await run().then(() => null, (e: unknown) => e);
      expect({ what, name: err instanceof Error ? err.name : String(err) }).toEqual({ what, name: 'StorageReadOnlyError' });
      expect({ what, typed: err instanceof app.status.StorageWriteError }).toEqual({ what, typed: true });
    }
    // kopia automatyczna po wypieku nie powstaje (nie nadpisuje puli 10)
    expect(await app.backup.autoBackup({ bakes: [bake], starters: [], customRecipes: [] })).toBeNull();
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
    expect([...mockFiles.keys()].filter((k) => /piekarz-(kopia|przed)-/.test(k))).toEqual([]);

    // (4) odczyt działa. Prawdziwa baza nowsza ma co najmniej kolumny v4 (migracje tylko dodają), więc
    // pełny odczyt sprawdzamy na v4 i v5; stare schematy z podniesioną wersją nie mają kolumn v2–v4.
    const reads = await Promise.all([app.store.getBakeLogs(), app.store.getStarters(), app.store.getRecipes()]);
    if (version === 'v4' || version === 'v5') {
      const [bakes, starters, recipes] = reads;
      expect(bakes.map((b) => b.id).sort()).toEqual(['bake_1', 'bake_2', 'bake_3']);
      expect(bakes.find((b) => b.id === 'bake_2')?.notes).toBe('notatka 2');
      expect(starters.map((s) => s.name).sort()).toEqual(['Zakwas 1', 'Zakwas 2']);
      expect(recipes.filter((r) => !r.isBuiltIn).map((r) => r.id).sort()).toEqual(['recipe_user_1', 'recipe_user_2']);
    }
    expect(await app.store.getAppSetting('unit_system')).not.toBe('imperial');

    // (3) plik bazy bajt w bajt, liczności, spójność i wersja bez zmian
    await (await app.schema.getDb())?.closeAsync();
    expect(sha256(APP_DB())).toBe(shaBefore);
    const raw = openRaw(APP_DB());
    expect(tableCounts(raw)).toEqual(countsBefore);
    expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    expect(raw.prepare('PRAGMA user_version').get()).toEqual({ user_version: newVersion });
    raw.close();
    if (process.env.PIEKARZ_DOWOD) console.log(`061 ${version}: user_version ${newVersion}, liczności ${JSON.stringify(countsBefore)}, SHA-256 ${shaBefore}`);
  });
});
