/**
 * Kopia bazy buildu 1014 do testu migracji D1 [M3 D1, etap 1]: fixture tests/fixtures/baza-1014-f42c0d8.sql ma schemat
 * wydanych migracji 1–5 (których się nie edytuje), jest spójna i niesie dane, na których sprawdza się migrację:
 * trwającą sesję v2 na kroku z minutnikiem i pauzą (warianty: żytnia, v1, uszkodzona, pusta, brak), 3 wypieki
 * z ocenami, 2 zakwasy (jeden w lodówce) z wpisami, receptury własne, spiżarnię, lekcje i ustawienia.
 * Eksport JSON z tego samego stanu czyta się bez pominiętych wierszy. Prawdziwy SQLite (node:sqlite).
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import { useTempDbDir, restartApp, openRaw, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1014, surowaSesja1014, kopia1014, KLUCZ_SESJI_1014, WERSJA_SCHEMATU_1014, SESJA_USZKODZONA, type WariantSesji1014 } from './helpers/baza-1014';

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
type Raw = ReturnType<typeof openRaw>;

const schemat = (raw: Raw) =>
  (raw.prepare("SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type, name").all() as Array<{ type: string; name: string; sql: string }>)
    .map((o) => ({ type: o.type, name: o.name, sql: o.sql.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim() }));
const kolumna = (raw: Raw, sql: string) => (raw.prepare(sql).all() as Array<Record<string, unknown>>).map((r) => Object.values(r)[0]);

describe('kopia bazy buildu 1014 (D1, etap 1)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('zrzut ma schemat wydanych migracji 1–5 z kodu: wydanej migracji się nie edytuje', async () => {
    const app = restartApp();
    const wydane = app.schema.SCHEMA_MIGRATIONS.filter((m) => m.version <= WERSJA_SCHEMATU_1014);
    expect(wydane.map((m) => m.version)).toEqual([1, 2, 3, 4, 5]);
    const sqlite = jest.requireMock('expo-sqlite') as { openDatabaseAsync: (n: string, o?: unknown, d?: string) => Promise<Parameters<(typeof wydane)[number]['run']>[0]> };
    const db = await sqlite.openDatabaseAsync('z-migracji.db', undefined, '/Library/SQLite');
    await db.execAsync('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL, description TEXT NOT NULL);');
    for (const m of wydane) await m.run(db);
    await db.closeAsync();

    zalozBaze1014(APP_DB());
    const zMigracji = openRaw(dbFilePath('z-migracji.db', '/Library/SQLite'));
    const zFixture = openRaw(APP_DB());
    expect(schemat(zFixture)).toEqual(schemat(zMigracji));
    zMigracji.close();
    zFixture.close();
  });

  it('baza 1014: spójna, wersja 5, WAL, liczności, zakwas w lodówce i trwająca sesja v2 na kroku z minutnikiem z pauzą', () => {
    const liczby = zalozBaze1014(APP_DB());
    expect(liczby).toEqual({
      app_access: 0, app_settings: 7, bakes: 3, flour_inventory: 2, lesson_progress: 2, pending_ops: 0,
      recipes: 17, schema_migrations: 5, starter_entries: 5, starters: 2,
    });
    const raw = openRaw(APP_DB());
    expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    expect(raw.prepare('PRAGMA user_version').get()).toEqual({ user_version: 5 });
    expect(raw.prepare('PRAGMA journal_mode').get()).toEqual({ journal_mode: 'wal' });
    expect(kolumna(raw, 'SELECT count(*) FROM bakes WHERE rating_stars IS NOT NULL AND finished_at IS NOT NULL')).toEqual([3]);
    expect(kolumna(raw, "SELECT id FROM starters WHERE storage_state = 'FRIDGE'")).toEqual(['starter_lodowka']);
    expect(kolumna(raw, 'SELECT count(*) FROM recipes WHERE is_built_in = 0')).toEqual([2]);
    const wartosc = kolumna(raw, `SELECT value FROM app_settings WHERE key = '${KLUCZ_SESJI_1014}'`)[0];
    raw.close();

    expect(wartosc).toBe(surowaSesja1014('v2-pauza'));
    const sesja: unknown = JSON.parse(String(wartosc));
    expect(sesja).toEqual(expect.objectContaining({ version: 2, stepIdx: 1, timerEndsAt: null, pausedLeftSec: 1234, recipeName: 'Mój chleb mieszany' }));
    const krok = (sesja as { steps: Array<{ durationMin: number | null }> }).steps[1];
    expect(krok.durationMin).toBeGreaterThan(0);
  });

  it.each<[WariantSesji1014, string | null]>([
    ['v2-zytnia', 'Razowiec po restarcie'],
    ['v1', 'Chleb sprzed aktualizacji'],
    ['uszkodzona', null],
    ['pusta', null],
    ['brak', null],
  ])('wariant sesji %s w kopii bazy 1014', (wariant, nazwa) => {
    zalozBaze1014(APP_DB(), wariant);
    const raw = openRaw(APP_DB());
    const wiersze = kolumna(raw, `SELECT value FROM app_settings WHERE key = '${KLUCZ_SESJI_1014}'`);
    raw.close();
    if (wariant === 'brak') expect(wiersze).toEqual([]);
    else expect(wiersze).toEqual([surowaSesja1014(wariant)]);
    if (wariant === 'uszkodzona') expect(wiersze[0]).toBe(SESJA_USZKODZONA);
    if (nazwa !== null) expect(JSON.parse(String(wiersze[0])).recipeName).toBe(nazwa);
  });

  it('eksport JSON z buildu 1014: ten sam stan co baza, bez sesji wypieku, czyta się bez pominiętych wierszy', () => {
    zalozBaze1014(APP_DB());
    const raw = openRaw(APP_DB());
    const ids = (t: string, warunek = '') => kolumna(raw, `SELECT id FROM ${t} ${warunek} ORDER BY id`);
    const wBazie = { bakes: ids('bakes'), starters: ids('starters'), wpisy: ids('starter_entries'), receptury: ids('recipes', 'WHERE is_built_in = 0'), maki: ids('flour_inventory') };
    raw.close();

    const tekst = kopia1014();
    expect(tekst).not.toContain(KLUCZ_SESJI_1014);
    const { backup } = restartApp();
    const kopia = backup.parseAndValidateBackup(tekst);
    expect(kopia.schemaVersion).toBe(2);
    expect(kopia.skippedRows).toBe(0);
    const posort = (xs: Array<{ id: string }>) => xs.map((x) => x.id).sort();
    expect({
      bakes: posort(kopia.state.bakes),
      starters: posort(kopia.state.starters),
      wpisy: posort(kopia.state.starterEntries ?? []),
      receptury: posort(kopia.state.customRecipes),
      maki: posort(kopia.state.flourInventory ?? []),
    }).toEqual(wBazie);
    expect(kopia.state.settings).toEqual({
      godziny_snu: 'early_bird', has_completed_onboarding: 'true', language: 'pl', przypomnienia_karmienia: '1', selected_baking_vessel: 'dutch_oven', unit_system: 'metric',
    });
    expect(kopia.state.lessonProgress?.map((l) => l.levelId)).toEqual([1, 2]);
    expect(fs.existsSync(path.join(__dirname, '..', '..', '..', 'tests', 'fixtures', 'kopia-1014-f42c0d8.json'))).toBe(true);
  });
});
