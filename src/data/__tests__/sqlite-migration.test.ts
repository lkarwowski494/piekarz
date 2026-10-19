/**
 * Migracje i zapis na prawdziwym SQLite (node:sqlite) [M1-audytor-generalny-005; 08-programista-006,
 * 08-programista-014, 07-jakosc-002]. Każda asercja wykonuje się zawsze — bez gałęzi „gdy brak bazy”.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import {
  useTempDbDir,
  control,
  restartApp,
  openRaw,
  dbFilePath,
  tableCounts,
  IOS_DEFAULT_DIR,
} from './helpers/node-sqlite-adapter';
import { SCHEMA_MIGRATIONS } from '../sqlite-schema';
import { PRE_MIGRATION_BACKUP_NAME } from '../../lib/backup';
import type { StoredBakeLog, StoredRecipe, StoredStarter } from '../db';

const APP_DB = () => dbFilePath('piekarz.db', '/var/mobile/Containers/Data/Application/TEST/Library/SQLite');

const customRecipe: StoredRecipe = {
  id: 'recipe_user_legacy_v1',
  name: 'Mój żytni chleb dziadka 1930',
  formula: {
    flours: [{ name: 'Mąka żytnia typ 720', percentage: 100 }],
    waterPercentage: 70,
    saltPercentage: 2,
    starterPercentage: 20,
    starterHydration: 100,
    targetDoughWeightGrams: 1000,
  },
  targetDDT: 27,
  notes: 'Tradycyjny przepis rodzinny',
  isBuiltIn: false,
  createdAt: 1600000000000,
};

const customStarter: StoredStarter = {
  id: 'starter_legacy_v1',
  name: 'Zakwas San Francisco 1849',
  flourType: 'Pszenna razowa',
  hydration: 100,
  birthDate: 1500000000000,
  storageState: 'FRIDGE',
  lastFedAt: 1600000000000,
};

const bake = (n: number): StoredBakeLog => ({
  id: `bake_${n}`,
  recipeName: `Chleb ${n}`,
  startedAt: 1700000000000 + n * 1000,
  finishedAt: 1700000100000 + n * 1000,
  ratingStars: 4,
});

describe('SQLite Schema Migrations & Zero Data Loss Axiom (TASK-R05-01, TASK-R05-02, TASK-R05-03)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('defines 4 atomic forward migrations with monotonically increasing versions', () => {
    expect(SCHEMA_MIGRATIONS.length).toBe(4);
    expect(SCHEMA_MIGRATIONS[0].version).toBe(1);
    expect(SCHEMA_MIGRATIONS[1].version).toBe(2);
    expect(SCHEMA_MIGRATIONS[2].version).toBe(3);
    expect(SCHEMA_MIGRATIONS[3].version).toBe(4);
  });

  it('getDb opens a real SQLite file in Library/SQLite (not the memory fallback)', async () => {
    const { schema } = restartApp();
    const db = await schema.getDb();
    expect(db).not.toBeNull();
    // Aplikacja przenosi bazę z Documents/SQLite (domyślny katalog) do prywatnego Library/SQLite.
    expect(IOS_DEFAULT_DIR).toContain('Documents/SQLite');
    expect(control().opened).toEqual([APP_DB()]);
  });

  it('initDatabase on a new install migrates to user_version 4 with every column of migrations 2, 3 and 4', async () => {
    const { schema } = restartApp();
    await schema.initDatabase();

    const raw = openRaw(APP_DB());
    const v = raw.prepare('PRAGMA user_version').get() as { user_version: number };
    expect(v.user_version).toBe(4);
    const applied = raw.prepare('SELECT version FROM schema_migrations ORDER BY version').all() as Array<{ version: number }>;
    expect(applied.map((r) => r.version)).toEqual([1, 2, 3, 4]);

    const cols = (table: string) =>
      (raw.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map((c) => c.name);
    expect(cols('bakes')).toEqual(expect.arrayContaining(['crumb_score', 'crust_score', 'taste_profile', 'sensory_profile']));
    expect(cols('starters')).toEqual(expect.arrayContaining(['feeding_ratio', 'last_feed_ratio']));
    expect(cols('app_access')).toContain('signature');
    raw.close();
  });

  it('applySchemaMigrations on an already migrated database is a no-op (no duplicate migration rows)', async () => {
    const { schema } = restartApp();
    await schema.initDatabase();
    const db = await schema.getDb();
    expect(db).not.toBeNull();
    await schema.applySchemaMigrations(db as NonNullable<typeof db>);
    const raw = openRaw(APP_DB());
    expect(raw.prepare('SELECT count(*) AS c FROM schema_migrations').get()).toEqual({ c: 4 });
    raw.close();
  });

  it('preserves 100% of user data when migrations are executed (database at version 1)', async () => {
    // Baza w wersji 1: tylko migracja 1, potem dane użytkownika.
    const raw = openRaw(APP_DB());
    raw.exec(
      `CREATE TABLE recipes (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, formula_json TEXT NOT NULL, target_ddt REAL NOT NULL DEFAULT 25.0, notes TEXT, is_built_in INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
       CREATE TABLE starters (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, flour_type TEXT NOT NULL, hydration REAL NOT NULL DEFAULT 100.0, birth_date INTEGER NOT NULL, storage_state TEXT NOT NULL DEFAULT 'ROOM_TEMP', last_fed_at INTEGER);
       CREATE TABLE bakes (id TEXT PRIMARY KEY NOT NULL, recipe_name TEXT NOT NULL, started_at INTEGER NOT NULL, finished_at INTEGER, ambient_temp REAL, actual_ddt REAL, rating_stars INTEGER, notes TEXT);
       CREATE TABLE app_access (id TEXT PRIMARY KEY NOT NULL, trial_started_at INTEGER NOT NULL, trial_days INTEGER NOT NULL DEFAULT 14, subscription_tier TEXT NOT NULL DEFAULT 'none', subscription_expires_at INTEGER, completed_bakes_count INTEGER NOT NULL DEFAULT 0);
       PRAGMA user_version = 1;`
    );
    raw
      .prepare('INSERT INTO recipes (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)')
      .run(customRecipe.id, customRecipe.name, JSON.stringify(customRecipe.formula), customRecipe.targetDDT, customRecipe.notes ?? null, customRecipe.createdAt);
    raw
      .prepare('INSERT INTO starters (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(customStarter.id, customStarter.name, customStarter.flourType, customStarter.hydration, customStarter.birthDate, customStarter.storageState, customStarter.lastFedAt ?? null);
    raw.prepare('INSERT INTO bakes (id, recipe_name, started_at, finished_at) VALUES (?, ?, ?, ?)').run('bake_v1', 'Chleb v1', 1, 2);
    raw.close();

    const { schema, store } = restartApp();
    await schema.initDatabase();

    const after = openRaw(APP_DB());
    expect((after.prepare('PRAGMA user_version').get() as { user_version: number }).user_version).toBe(4);
    const counts = tableCounts(after);
    expect(counts.starters).toBe(1);
    expect(counts.bakes).toBe(1);
    expect(counts.recipes).toBeGreaterThan(1); // własna + wbudowane
    after.close();

    const recipes = await store.getRecipes();
    expect(recipes.find((r) => r.id === customRecipe.id)?.name).toBe('Mój żytni chleb dziadka 1930');
    const starters = await store.getStarters();
    expect(starters.find((s) => s.id === customStarter.id)?.name).toBe('Zakwas San Francisco 1849');
    expect((await store.getBakeLogs()).map((b) => b.id)).toEqual(['bake_v1']);
  });

  it('writes reach the database file and survive an app restart', async () => {
    const first = restartApp();
    await first.schema.initDatabase();
    await first.store.saveRecipe(customRecipe);
    await first.store.saveStarter(customStarter);
    await first.store.saveBakeLog(bake(1));

    const second = restartApp();
    await second.schema.initDatabase();
    expect((await second.store.getRecipes()).some((r) => r.id === customRecipe.id)).toBe(true);
    expect((await second.store.getStarters()).map((s) => s.id)).toContain(customStarter.id);
    expect((await second.store.getBakeLogs()).map((b) => b.id)).toEqual(['bake_1']);
  });

  it('restoreFromBackupData inserts the bakes into SQLite (history survives a restart)', async () => {
    const first = restartApp();
    await first.schema.initDatabase();
    await first.store.restoreFromBackupData({
      bakes: [bake(1), bake(2)],
      starters: [customStarter],
      customRecipes: [customRecipe],
    });

    const second = restartApp();
    await second.schema.initDatabase();
    const logs = await second.store.getBakeLogs();
    expect(logs.map((b) => b.id).sort()).toEqual(['bake_1', 'bake_2']);
    expect((await second.store.getStarters()).map((s) => s.id)).toEqual([customStarter.id]);
  });

  it('performs pre-migration backup before schema changes (copy next to the database file)', async () => {
    const { schema } = restartApp();
    expect(schema.preMigrationBackupPath('/var/mobile/X/Library/SQLite/piekarz.db', 2, 123)).toBe(
      `/var/mobile/X/Library/SQLite/${PRE_MIGRATION_BACKUP_NAME}-v2-123.db`
    );
    await schema.initDatabase();
    const dir = require('node:path').dirname(APP_DB());
    const copies = (require('node:fs').readdirSync(dir) as string[]).filter((f) => f.startsWith(PRE_MIGRATION_BACKUP_NAME));
    expect(copies).toHaveLength(1);
    expect(copies[0]).toMatch(/^backup_pre_migration-v0-\d+\.db$/);
  });
});
