/**
 * Kopia przed migracją jest kompletna przy WAL, a nieudana migracja nie podmienia bazy i nie jest przemilczana
 * [M1-audytor-generalny-004; 08-programista-001, 05-architekt-010, 12-niezawodnosc-002, 12-niezawodnosc-005].
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath, control, tableCounts } from './helpers/node-sqlite-adapter';

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');

/** Baza w wersji 2 (przed migracją 3) w trybie WAL z 5 wypiekami jeszcze w pliku -wal. */
function seedVersion2InWal() {
  const raw = openRaw(APP_DB());
  raw.exec(`PRAGMA journal_mode = WAL;
    PRAGMA wal_autocheckpoint = 0;
    CREATE TABLE bakes (id TEXT PRIMARY KEY NOT NULL, recipe_name TEXT NOT NULL, started_at INTEGER NOT NULL, finished_at INTEGER, ambient_temp REAL, actual_ddt REAL, rating_stars INTEGER, notes TEXT, crumb_score INTEGER, crust_score INTEGER, taste_profile TEXT, sensory_profile TEXT);
    CREATE TABLE starters (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, flour_type TEXT NOT NULL, hydration REAL NOT NULL DEFAULT 100.0, birth_date INTEGER NOT NULL, storage_state TEXT NOT NULL DEFAULT 'ROOM_TEMP', last_fed_at INTEGER, feeding_ratio TEXT DEFAULT '1:1:1');
    CREATE TABLE recipes (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, formula_json TEXT NOT NULL, target_ddt REAL NOT NULL DEFAULT 25.0, notes TEXT, is_built_in INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
    CREATE TABLE app_access (id TEXT PRIMARY KEY NOT NULL, trial_started_at INTEGER NOT NULL, trial_days INTEGER NOT NULL DEFAULT 14, subscription_tier TEXT NOT NULL DEFAULT 'none', subscription_expires_at INTEGER, completed_bakes_count INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL, description TEXT NOT NULL);
    PRAGMA user_version = 2;`);
  const ins = raw.prepare('INSERT INTO bakes (id, recipe_name, started_at) VALUES (?, ?, ?)');
  for (let n = 1; n <= 5; n++) ins.run(`bake_${n}`, `Chleb ${n}`, n);
  // Połączenie zostaje otwarte: wiersze są w pliku -wal, nie w pliku .db.
  return raw;
}

const preMigrationCopies = () =>
  fs.readdirSync(path.dirname(APP_DB())).filter((f) => /^backup_pre_migration.*\.db$/.test(f));

describe('Pre-migration backup and migration failure (004)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('the pre-migration copy (VACUUM INTO) holds 5/5 bakes from a WAL database', async () => {
    const holder = seedVersion2InWal();
    expect(fs.existsSync(APP_DB() + '-wal')).toBe(true);

    const app = restartApp();
    await app.schema.initDatabase();
    holder.close();

    const copies = preMigrationCopies();
    expect(copies).toHaveLength(1);
    const copy = openRaw(path.join(path.dirname(APP_DB()), copies[0]));
    expect(tableCounts(copy).bakes).toBe(5);
    expect(copy.prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 });
    expect(copy.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    copy.close();
  });

  it('a failed migration keeps the open database (5/5 bakes, version 2), is reported and offers the copy for export (BR-DANE-001 Nieudana migracja)', async () => {
    seedVersion2InWal().close();
    const copySpy = jest.spyOn(FileSystem, 'copyAsync');
    control().failWritesMatching = /schema_migrations/;

    const app = restartApp();
    await app.schema.initDatabase();

    expect(app.status.getStorageState()).toBe('unavailable');
    expect(app.status.getStorageError()).toContain('SQLITE_FULL');
    const rescue = app.status.getRescueFile();
    expect(rescue).not.toBeNull();
    expect(fs.existsSync(String(rescue))).toBe(true);
    // Żadnego kopiowania pliku na otwartą bazę
    expect(copySpy.mock.calls.filter(([o]) => String(o.to).endsWith('piekarz.db'))).toEqual([]);
    copySpy.mockRestore();

    control().failWritesMatching = null;
    const raw = openRaw(APP_DB());
    expect(tableCounts(raw).bakes).toBe(5);
    expect(raw.prepare('PRAGMA user_version').get()).toEqual({ user_version: 2 });
    raw.close();
  });

  it('a database that is already current is not copied again', async () => {
    const first = restartApp();
    await first.schema.initDatabase();
    const before = preMigrationCopies().length;
    const second = restartApp();
    await second.schema.initDatabase();
    expect(preMigrationCopies().length).toBe(before);
  });
});
