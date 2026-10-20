/**
 * M1-audytor-generalny-104 (ADR-008, T1 i T2 roli 05): migracja v5 (dziennik wpisów zakwasu) na kopii bazy każdej
 * wydanej wersji (fixtures 70fd81a, adfe1fa, b21c194: user_version 0; ebd8471 = b1013: 3) i bazy v4 z migracji 1–4.
 * Liczności przed = po, każde last_fed_at jako wpis feeding, integrity_check, foreign_key_check, kopia przed migracją,
 * drugi start bez zmian; błąd w v5 wycofuje całość.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts, control } from './helpers/node-sqlite-adapter';

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
type Raw = ReturnType<typeof openRaw>;

const columns = (raw: Raw, table: string) => (raw.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map((c) => c.name);
const hasTable = (raw: Raw, name: string) =>
  (raw.prepare("SELECT count(*) AS c FROM sqlite_master WHERE type='table' AND name = ?").get(name) as { c: number }).c === 1;

function seedStarters(raw: Raw, withRatio: boolean): void {
  const ins = raw.prepare('INSERT INTO starters (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  ins.run('starter_1', 'Zakwas 1', 'Żytnia 2000', 100, 1, 'FRIDGE', 1_700_000_000_000);
  ins.run('starter_2', 'Zakwas 2', 'Pszenna 750', 100, 1, 'ROOM_TEMP', 1_700_000_500_000);
  ins.run('starter_3', 'Bez dokarmienia', 'Żytnia', 100, 1, 'ROOM_TEMP', null);
  if (withRatio) raw.prepare("UPDATE starters SET last_feed_ratio = '1:5:5' WHERE id = 'starter_2'").run();
  raw.prepare('INSERT INTO bakes (id, recipe_name, started_at) VALUES (?, ?, ?)').run('bake_1', 'Chleb', 1);
  raw.prepare('INSERT INTO flour_inventory (id, name, stock_grams, updated_at) VALUES (?, ?, ?, ?)').run('flour_1', 'Mąka', 1000, 1);
}

function seedRelease(sha: string): Record<string, number> {
  const raw = openRaw(APP_DB());
  raw.exec(fs.readFileSync(path.join(__dirname, 'fixtures', `schema-${sha}.sql`), 'utf8'));
  seedStarters(raw, false);
  const before = tableCounts(raw);
  raw.close();
  return before;
}

/** Baza v4: migracje 1–4 z kodu (aplikacja z v4 nie trafiła do tagu, ale istnieje w buildach testowych). */
async function seedV4(): Promise<Record<string, number>> {
  const app = restartApp();
  const v4 = app.schema.SCHEMA_MIGRATIONS.filter((m) => m.version <= 4);
  const sqlite = jest.requireMock('expo-sqlite') as { openDatabaseAsync: (n: string, o?: unknown, d?: string) => Promise<Parameters<(typeof v4)[number]['run']>[0]> };
  const db = await sqlite.openDatabaseAsync('piekarz.db', undefined, '/Library/SQLite');
  await db.execAsync('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL, description TEXT NOT NULL);');
  for (const m of v4) {
    await m.run(db);
    await db.runAsync('INSERT INTO schema_migrations (version, applied_at, description) VALUES (?, ?, ?);', m.version, 'x', m.description);
  }
  await db.execAsync('PRAGMA user_version = 4;');
  await db.closeAsync();
  const raw = openRaw(APP_DB());
  seedStarters(raw, true);
  const before = tableCounts(raw);
  raw.close();
  return before;
}

const CASES: Array<[string, number, () => Promise<Record<string, number>>]> = [
  ['70fd81a', 0, async () => seedRelease('70fd81a')],
  ['adfe1fa', 0, async () => seedRelease('adfe1fa')],
  ['b21c194', 0, async () => seedRelease('b21c194')],
  ['ebd8471', 3, async () => seedRelease('ebd8471')],
  ['v4', 4, seedV4],
];

describe.each(CASES)('baza z wydanego buildu %s migruje do v5 bez strat (104, ADR-008)', (_sha, fromVersion, seed) => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('liczności przed = po, wpis feeding dla każdego last_fed_at, integralność i klucze obce, kopia przed migracją', async () => {
    const before = await seed();
    const app = restartApp();
    await app.schema.initDatabase();
    expect(app.status.getStorageState()).toBe('ok');

    const raw = openRaw(APP_DB());
    expect(hasTable(raw, 'starter_entries')).toBe(true);
    const after = tableCounts(raw);
    for (const t of Object.keys(before)) {
      if (t !== 'recipes' && t !== 'schema_migrations') expect({ table: t, count: after[t] }).toEqual({ table: t, count: before[t] });
    }
    expect(after.starter_entries).toBe(2);
    const entries = raw.prepare('SELECT id, starter_id AS s, kind, occurred_at AS at, feed_ratio AS r, signs FROM starter_entries ORDER BY id').all();
    expect(entries).toEqual([
      { id: 'v5-starter_1', s: 'starter_1', kind: 'feeding', at: 1_700_000_000_000, r: null, signs: '[]' },
      { id: 'v5-starter_2', s: 'starter_2', kind: 'feeding', at: 1_700_000_500_000, r: fromVersion === 4 ? '1:5:5' : null, signs: '[]' },
    ]);
    expect(columns(raw, 'starters')).toEqual(expect.arrayContaining(['setup_started_at', 'setup_completed_at']));
    expect(raw.prepare('PRAGMA user_version').get()).toEqual({ user_version: 5 });
    expect(raw.prepare('SELECT version FROM schema_migrations WHERE version = 5').get()).toEqual({ version: 5 });
    expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    const plan = raw
      .prepare("EXPLAIN QUERY PLAN SELECT occurred_at FROM starter_entries WHERE starter_id = 'starter_1' AND kind = 'feeding' ORDER BY occurred_at DESC LIMIT 1")
      .all() as Array<{ detail: string }>;
    expect(plan.map((p) => p.detail).join(' ')).toMatch(/USING COVERING INDEX idx_starter_entries_starter_kind_at/);
    raw.close();

    const backups = fs.readdirSync(path.dirname(APP_DB())).filter((f) => f.startsWith(`backup_pre_migration-v${fromVersion}-`));
    expect(backups).toHaveLength(1);

    // Zakwasy pokazują to samo ostatnie dokarmienie co przed migracją
    const starters = await app.store.getStarters();
    expect(starters.map((s) => [s.id, s.lastFedAt, s.feedingRatio])).toEqual([
      ['starter_1', 1_700_000_000_000, undefined],
      ['starter_2', 1_700_000_500_000, fromVersion === 4 ? '1:5:5' : undefined],
      ['starter_3', undefined, undefined],
    ]);

    // Drugi start niczego nie zmienia
    const again = restartApp();
    await again.schema.initDatabase();
    const raw2 = openRaw(APP_DB());
    expect(tableCounts(raw2)).toEqual(after);
    expect(raw2.prepare('PRAGMA user_version').get()).toEqual({ user_version: 5 });
    raw2.close();
  });
});

describe('błąd w migracji 5 wycofuje całość (104, T2)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('MigrationError, wersja i dane bez zmian, brak tabeli i kolumn v5, stan unavailable z kopią', async () => {
    const before = seedRelease('ebd8471');
    control().failWritesMatching = /starter_entries/;
    const app = restartApp();
    await app.schema.initDatabase();
    expect(app.status.getStorageState()).toBe('unavailable');
    expect(app.status.getRescueFile()).toMatch(/backup_pre_migration-v3-/);
    control().failWritesMatching = null;

    const raw = openRaw(APP_DB());
    // v4 to osobna, zatwierdzona transakcja; v5 wycofana w całości
    expect(raw.prepare('PRAGMA user_version').get()).toEqual({ user_version: 4 });
    expect(hasTable(raw, 'starter_entries')).toBe(false);
    expect(columns(raw, 'starters')).not.toContain('setup_started_at');
    const after = tableCounts(raw);
    for (const t of ['starters', 'bakes', 'flour_inventory']) expect(after[t]).toBe(before[t]);
    expect(raw.prepare('SELECT count(*) AS c FROM schema_migrations WHERE version = 5').get()).toEqual({ c: 0 });
    raw.close();
  });
});
