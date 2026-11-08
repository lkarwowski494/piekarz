/**
 * Partia danych p9 (D-221), etap przed STOP [M3 p9a]: kopia bazy buildu 1021 (schemat v6, u właściciela) i zgodność
 * wydanego odczytu z danymi, które p9b może dopisać bez zmiany schematu (plan: docs/plan-danych-p9-2026-11-04.md §1, §4).
 * Kod src/data i src/lib/backup.ts jest dziś taki sam jak w 1017–1021 (`git diff v1.0.0-b1017 HEAD` pusty), więc te
 * testy sprawdzają parser wydanego buildu: co odczyta 1021, gdy właściciel wróci do niego z TestFlight po p9b.
 * Testy są zielone przed p9b i mają zostać zielone po p9b. Prawdziwy SQLite (node:sqlite).
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts } from './helpers/node-sqlite-adapter';
import { zalozBaze1021, WERSJA_SCHEMATU_1021 } from './helpers/baza-1021';
import { kopia1014 } from './helpers/baza-1014';

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
type Raw = ReturnType<typeof openRaw>;

const schemat = (raw: Raw) =>
  (raw.prepare("SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type, name").all() as Array<{ type: string; name: string; sql: string }>)
    .map((o) => ({ type: o.type, name: o.name, sql: o.sql.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim() }));
const sesjaJson = (raw: Raw, id: string) => JSON.parse((raw.prepare('SELECT session_json AS j FROM bake_sessions WHERE id = ?').get(id) as { j: string }).j) as Record<string, unknown>;

describe('p9a: kopia bazy buildu 1021 (v6)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('zrzut ma schemat wydanych migracji 1–6 z kodu: wydanej migracji się nie edytuje', async () => {
    const app = restartApp();
    const wydane = app.schema.SCHEMA_MIGRATIONS.filter((m) => m.version <= WERSJA_SCHEMATU_1021);
    expect(wydane.map((m) => m.version)).toEqual([1, 2, 3, 4, 5, 6]);
    const sqlite = jest.requireMock('expo-sqlite') as { openDatabaseAsync: (n: string, o?: unknown, d?: string) => Promise<Parameters<(typeof wydane)[number]['run']>[0]> };
    const db = await sqlite.openDatabaseAsync('z-migracji.db', undefined, '/Library/SQLite');
    await db.execAsync('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL, description TEXT NOT NULL);');
    for (const m of wydane) await m.run(db);
    await db.closeAsync();

    zalozBaze1021(APP_DB());
    const zMigracji = openRaw(dbFilePath('z-migracji.db', '/Library/SQLite'));
    const zFixture = openRaw(APP_DB());
    expect(schemat(zFixture)).toEqual(schemat(zMigracji));
    zMigracji.close();
    zFixture.close();
  });

  it('baza 1021: spójna, wersja 6, WAL, liczności, trwający i zaplanowany wypiek, wpis z recipe_id, stały dzień', () => {
    const liczby = zalozBaze1021(APP_DB());
    expect(liczby).toEqual({
      app_access: 0, app_settings: 7, bake_sessions: 2, bakes: 4, flour_inventory: 2, lesson_progress: 2, pending_ops: 0,
      recipes: 17, schema_migrations: 6, starter_entries: 5, starters: 2,
    });
    const raw = openRaw(APP_DB());
    expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    expect(raw.prepare('PRAGMA user_version').get()).toEqual({ user_version: 6 });
    expect(raw.prepare('PRAGMA journal_mode').get()).toEqual({ journal_mode: 'wal' });
    expect(raw.prepare('SELECT id, status FROM bake_sessions ORDER BY id').all()).toEqual([{ id: 'bake_live', status: 'active' }, { id: 'plan_sobota', status: 'planned' }]);
    expect(raw.prepare("SELECT recipe_id FROM bakes WHERE id = 'bake_4'").get()).toEqual({ recipe_id: 'spelt_ancient_seeded' });
    expect(raw.prepare("SELECT fridge_feed_weekday AS d, fridge_feed_minute AS m FROM starters WHERE id = 'starter_lodowka'").get()).toEqual({ d: 7, m: 540 });
    raw.close();
  });
});

describe('p9a: zgodność wydanego odczytu (1017–1021) z polami p9b w JSON-ie sesji', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('sesja i plan z polami wersji i trybu (opcja Z2 a) czyta wydany parser, a zapis postępu ich nie gubi', async () => {
    zalozBaze1021(APP_DB());
    const r0 = openRaw(APP_DB());
    const trwa = sesjaJson(r0, 'bake_live');
    const plan = sesjaJson(r0, 'plan_sobota');
    const zPolami = (b: unknown) => ({ ...(b as Record<string, unknown>), wersja: 'drozdze', tryb: 'piekarnik' });
    r0.prepare('UPDATE bake_sessions SET session_json = ? WHERE id = ?').run(JSON.stringify({ ...trwa, bake: zPolami(trwa.bake) }), 'bake_live');
    r0.prepare('UPDATE bake_sessions SET session_json = ? WHERE id = ?').run(JSON.stringify({ ...plan, bake: zPolami(plan.bake) }), 'plan_sobota');
    const przed = tableCounts(r0);
    r0.close();

    const app = restartApp();
    await app.schema.initDatabase();
    expect(app.status.getStorageState()).toBe('ok');
    const sesje = require('../bake-sessions-store') as typeof import('../bake-sessions-store');
    const [w] = await sesje.loadActiveBakeSessionsZWersja();
    expect(w.sesja.bake).toEqual(expect.objectContaining({ wersja: 'drozdze', tryb: 'piekarnik' }));
    const [p] = await sesje.loadPlannedBakes();
    expect(p.bake).toEqual(expect.objectContaining({ wersja: 'drozdze', tryb: 'piekarnik' }));

    expect(await sesje.zapiszPostepWypieku({ ...w.sesja, stepIdx: w.sesja.stepIdx + 1 }, w.wersja)).toEqual(expect.objectContaining({ ok: true }));
    const raw = openRaw(APP_DB());
    expect(sesjaJson(raw, 'bake_live').bake).toEqual(expect.objectContaining({ wersja: 'drozdze', tryb: 'piekarnik' }));
    expect(tableCounts(raw)).toEqual({ ...przed, schema_migrations: przed.schema_migrations + 1 }); // start migruje v6 → v7 (D-251)
    raw.close();
  });

  it('krok z kategorią spoza listy wydanego buildu: 1021 nie odczyta sesji (warunek dla p9b: kroki planu drożdżowego z istniejących kategorii)', async () => {
    zalozBaze1021(APP_DB());
    const r0 = openRaw(APP_DB());
    const trwa = sesjaJson(r0, 'bake_live');
    const kroki = trwa.steps as Array<Record<string, unknown>>;
    r0.prepare('UPDATE bake_sessions SET session_json = ? WHERE id = ?').run(JSON.stringify({ ...trwa, steps: [{ ...kroki[0], category: 'degas' }, ...kroki.slice(1)] }), 'bake_live');
    r0.close();

    const app = restartApp();
    await app.schema.initDatabase();
    const sesje = require('../bake-sessions-store') as typeof import('../bake-sessions-store');
    expect(await sesje.loadActiveBakeSessions()).toEqual([]);
    const raw = openRaw(APP_DB());
    expect(raw.prepare('SELECT count(*) AS c FROM bake_sessions').get()).toEqual({ c: 2 }); // wiersz zostaje w bazie, nie znika
    raw.close();
  });
});

describe('p9a: import kopii z p9b w wydanym kodzie (właściciel wraca do 1021 i importuje plik)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('nieznane klucze ustawień i pola wpisu są pomijane bez błędu; liczności i znane pola z kopii', async () => {
    zalozBaze1021(APP_DB());
    // Lista kluczy kopii zamrożona z buildu 1021 (zgoda D-250): kod bieżący przenosi nowe klucze (R6) [M3 p9b]
    jest.doMock('../ustawienia-kopii', () => jest.requireActual('./helpers/ustawienia-kopii-1021'));
    const app = restartApp();
    await app.schema.initDatabase();
    const koperta = JSON.parse(kopia1014()) as { state: { bakes: Array<Record<string, unknown>>; settings?: Record<string, unknown> } };
    koperta.state.bakes = koperta.state.bakes.map((b) => ({ ...b, leaven: 'yeast' }));
    koperta.state.settings = { ...(koperta.state.settings ?? {}), maszyna: '{"v":1,"makaMaxG":620}', wersje_receptur: '{"graham_bread_honey":"drozdze"}' };
    const kopia = app.backup.parseAndValidateBackup(JSON.stringify(koperta));
    expect(kopia.skippedRows).toBe(0);
    await app.store.restoreFromBackupData(kopia.state);

    const raw = openRaw(APP_DB());
    expect(raw.prepare("SELECT count(*) AS c FROM app_settings WHERE key IN ('maszyna', 'wersje_receptur')").get()).toEqual({ c: 0 });
    expect(raw.prepare('SELECT count(*) AS c FROM bakes').get()).toEqual({ c: koperta.state.bakes.length });
    expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    raw.close();
    jest.dontMock('../ustawienia-kopii');
  });
});
