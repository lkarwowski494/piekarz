/**
 * Migracja baz z wydanych buildów TestFlight bez strat (liczności przed i po)
 * [M1-audytor-generalny-020; 05-architekt-011]. Schematy: fixtures/schema-<commit>.sql (DDL z git show).
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts } from './helpers/node-sqlite-adapter';

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const USER_TABLES = ['bakes', 'starters', 'flour_inventory', 'app_access', 'app_settings', 'lesson_progress'] as const;

function seed(sha: string): Record<string, number> {
  const raw = openRaw(APP_DB());
  raw.exec(fs.readFileSync(path.join(__dirname, 'fixtures', `schema-${sha}.sql`), 'utf8'));
  const tables = new Set((raw.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>).map((t) => t.name));
  const hasSensory = (raw.prepare('PRAGMA table_info(bakes)').all() as Array<{ name: string }>).some((c) => c.name === 'sensory_profile');

  for (let n = 1; n <= 3; n++) {
    raw.prepare('INSERT INTO bakes (id, recipe_name, started_at, finished_at, ambient_temp, actual_ddt, rating_stars, notes, crumb_score, crust_score, taste_profile) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(`bake_${n}`, `Chleb ${n}`, 1000 + n, 2000 + n, 22.5, 25.5, 4, `notatka ${n}`, 4, 5, 'sour');
  }
  if (hasSensory) {
    raw.prepare("UPDATE bakes SET sensory_profile = ? WHERE id = 'bake_1'")
      .run(JSON.stringify({ crustCrispness: 4, crumbElasticity: 3, acidity: 4, openCrumb: 5, caramelization: 3 }));
  }
  for (let n = 1; n <= 2; n++) {
    raw.prepare('INSERT INTO starters (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(`starter_${n}`, `Zakwas ${n}`, 'Żytnia 2000', 100, 1, 'FRIDGE', 2);
    raw.prepare('INSERT INTO flour_inventory (id, name, stock_grams, updated_at) VALUES (?, ?, ?, ?)').run(`flour_${n}`, `Mąka ${n}`, 1000 * n, 1);
  }
  const formula = JSON.stringify({ flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 });
  for (let n = 1; n <= 2; n++) {
    raw.prepare('INSERT INTO recipes (id, name, formula_json, target_ddt, is_built_in, created_at) VALUES (?, ?, ?, 25, 0, ?)').run(`recipe_user_${n}`, `Moja ${n}`, formula, n);
  }
  raw.prepare("INSERT INTO app_access (id, trial_started_at, trial_days, subscription_tier, completed_bakes_count) VALUES ('current_user', 1, 7, 'none', 3)").run();
  if (tables.has('app_settings')) {
    raw.prepare("INSERT INTO app_settings (key, value) VALUES ('baker_ritual_profile', 'beginner'), ('unit_system', 'metric')").run();
  }
  if (tables.has('lesson_progress')) {
    raw.prepare('INSERT INTO lesson_progress (level_id, completed_at) VALUES (1, 1), (2, 2)').run();
  }
  const before = tableCounts(raw);
  before.user_recipes = (raw.prepare('SELECT count(*) AS c FROM recipes WHERE is_built_in = 0').get() as { c: number }).c;
  raw.close();
  return before;
}

describe.each(['70fd81a', 'adfe1fa', 'b21c194'])('TestFlight database from build %s migrates without loss (020)', (sha) => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('counts of user tables are equal before and after; version 5; integrity and foreign keys ok (BR-DANE-001 Aktualizacja aplikacji)', async () => {
    const before = seed(sha);
    const app = restartApp();
    await app.schema.initDatabase();
    expect(app.status.getStorageState()).toBe('ok');

    const raw = openRaw(APP_DB());
    const after = tableCounts(raw);
    for (const t of USER_TABLES) {
      if (before[t] !== undefined) expect({ table: t, count: after[t] }).toEqual({ table: t, count: before[t] });
    }
    expect((raw.prepare('SELECT count(*) AS c FROM recipes WHERE is_built_in = 0').get() as { c: number }).c).toBe(before.user_recipes);
    expect(raw.prepare('PRAGMA user_version').get()).toEqual({ user_version: 6 }); // bieżąca wersja: v6 (D-102) [M3 D1]
    expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    raw.close();

    // Wartości przeżywają, nie tylko liczności
    const logs = await app.store.getBakeLogs();
    expect(logs.find((b) => b.id === 'bake_2')).toEqual(
      expect.objectContaining({ recipeName: 'Chleb 2', ambientTemp: 22.5, actualDDT: 25.5, notes: 'notatka 2', crumbScore: 4, tasteProfile: 'sour' })
    );
    // app_access zostaje w bazie bez migracji; aplikacja go nie czyta (009), wartości przeżywają w pliku.
    const rawAfter = openRaw(APP_DB());
    expect(rawAfter.prepare("SELECT completed_bakes_count AS c FROM app_access WHERE id = 'current_user'").get()).toEqual({ c: 3 });
    rawAfter.close();
  });
});
