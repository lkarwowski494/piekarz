/**
 * Partia danych p9 (D-221): testy przed kodem p9b dla opcji REKOMENDOWANYCH w planie (docs/plan-danych-p9-2026-11-04.md):
 * Z3 a — kolumna bakes.leaven (wersja wypieku w Dzienniku, migracja v7, samo ADD COLUMN), Z1 b i Z4 a — klucze
 * `wersje_receptur` i `maszyna` w app_settings i w kopii [M3 p9a].
 * Czerwone dziś z właściwego powodu: pierwsza asercja to wersja schematu / lista kluczy kopii. Przy innej decyzji
 * właściciela test zastępuje się przed kodem p9b (zapisany powód), nie dopasowuje po kodzie.
 * Kopia: tests/fixtures/baza-1021-39f3890.sql (schemat v6 u właściciela) i baza-1014-f42c0d8.sql (v5). Prawdziwy SQLite.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts, control } from './helpers/node-sqlite-adapter';
import { zalozBaze1021 } from './helpers/baza-1021';
import { zalozBaze1014, kopia1014 } from './helpers/baza-1014';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
type Raw = ReturnType<typeof openRaw>;

const WERSJA_P9 = 7;
const KOLUMNA = 'leaven';
const wersja = (raw: Raw) => (raw.prepare('PRAGMA user_version').get() as { user_version: number }).user_version;
const kolumny = (raw: Raw, t: string) => (raw.prepare(`PRAGMA table_info(${t})`).all() as Array<{ name: string }>).map((c) => c.name);
const sesje = (raw: Raw) => raw.prepare('SELECT id, status, session_json FROM bake_sessions ORDER BY id').all();

/** Start aplikacji na kopii; pierwsza asercja: schemat v7 z kolumną (czerwień p9a). */
async function migruj(zaloz: (plik: string) => Record<string, number>) {
  const przed = zaloz(APP_DB());
  const r0 = openRaw(APP_DB());
  const sesjePrzed = r0.prepare("SELECT count(*) AS c FROM sqlite_master WHERE name = 'bake_sessions'").get() as { c: number };
  const sesjeStare = sesjePrzed.c === 1 ? sesje(r0) : [];
  r0.close();
  const app = restartApp();
  await app.schema.initDatabase();
  const raw = openRaw(APP_DB());
  expect({ wersja: wersja(raw), kolumna: kolumny(raw, 'bakes').includes(KOLUMNA) }).toEqual({ wersja: WERSJA_P9, kolumna: true });
  raw.close();
  expect(app.status.getStorageState()).toBe('ok');
  return { app, przed, sesjeStare };
}

describe('p9b (przed kodem): migracja v7 na kopii bazy buildu 1021', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('v6 → v7: liczności bez strat, stare wpisy z pustą wersją, sesje bez zmian, integrity_check i foreign_key_check', async () => {
    const { przed, sesjeStare } = await migruj(zalozBaze1021);
    const raw = openRaw(APP_DB());
    const po = tableCounts(raw);
    for (const t of Object.keys(przed)) {
      expect({ t, n: po[t] }).toEqual({ t, n: t === 'schema_migrations' ? przed[t] + 1 : przed[t] });
    }
    expect(raw.prepare(`SELECT count(*) AS c FROM bakes WHERE ${KOLUMNA} IS NULL`).get()).toEqual({ c: przed.bakes });
    expect(raw.prepare("SELECT recipe_id FROM bakes WHERE id = 'bake_4'").get()).toEqual({ recipe_id: 'spelt_ancient_seeded' });
    expect(sesje(raw)).toEqual(sesjeStare);
    expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    raw.close();
  });

  it('kolumna przyjmuje tylko zamkniętą listę wartości (CHECK) i NULL', async () => {
    await migruj(zalozBaze1021);
    const raw = openRaw(APP_DB());
    raw.prepare(`UPDATE bakes SET ${KOLUMNA} = 'yeast' WHERE id = 'bake_4'`).run();
    raw.prepare(`UPDATE bakes SET ${KOLUMNA} = 'sourdough' WHERE id = 'bake_1'`).run();
    expect(() => raw.prepare(`UPDATE bakes SET ${KOLUMNA} = 'drozdze' WHERE id = 'bake_2'`).run()).toThrow(/CHECK/);
    raw.close();
  });

  it('przed migracją kopia VACUUM INTO backup_pre_migration-v6-*; drugi start niczego nie zmienia', async () => {
    const { app } = await migruj(zalozBaze1021);
    const kopie = require('node:fs').readdirSync(require('node:path').dirname(APP_DB())) as string[];
    expect(kopie.filter((n) => /^backup_pre_migration-v6-\d+\.db$/.test(n))).toHaveLength(1);
    const r1 = openRaw(APP_DB());
    const raz = { liczby: tableCounts(r1), sesje: sesje(r1) };
    r1.close();
    expect(app.status.getStorageState()).toBe('ok');
    const znow = restartApp();
    await znow.schema.initDatabase();
    const r2 = openRaw(APP_DB());
    expect({ liczby: tableCounts(r2), sesje: sesje(r2), wersja: wersja(r2) }).toEqual({ ...raz, wersja: WERSJA_P9 });
    r2.close();
    const kopie2 = require('node:fs').readdirSync(require('node:path').dirname(APP_DB())) as string[];
    expect(kopie2.filter((n) => /^backup_pre_migration-v6-\d+\.db$/.test(n))).toHaveLength(1);
  });

  it('błąd w środku migracji v7: wycofanie całości, baza jak w 1021 (wersja 6, bez kolumny), ekran błędu z kopią', async () => {
    const przed = zalozBaze1021(APP_DB());
    control().failWritesMatching = /INSERT INTO schema_migrations/;
    const app = restartApp();
    await app.schema.initDatabase();
    control().failWritesMatching = null;
    expect(app.status.getStorageState()).toBe('unavailable');
    expect(app.status.getRescueFile()).toMatch(/backup_pre_migration-v6-/);
    const raw = openRaw(APP_DB());
    expect(wersja(raw)).toBe(6);
    expect(kolumny(raw, 'bakes')).not.toContain(KOLUMNA);
    expect(tableCounts(raw)).toEqual(przed);
    raw.close();
  });

  it('v5 (build 1014–1016) → v7 jednym startem: liczności bez strat poza przeniesioną sesją (v6)', async () => {
    const { przed } = await migruj((p) => zalozBaze1014(p, 'v2-pauza'));
    const raw = openRaw(APP_DB());
    const po = tableCounts(raw);
    expect(po.schema_migrations).toBe(przed.schema_migrations + 2);
    expect(po.bake_sessions).toBe(1);
    for (const t of ['bakes', 'starters', 'starter_entries', 'recipes', 'flour_inventory', 'lesson_progress']) expect({ t, n: po[t] }).toEqual({ t, n: przed[t] });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    raw.close();
  });
});

describe('p9b (przed kodem): nowe dane w kopii, eksporcie i imporcie', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('BR-MASZ-002 Dane maszyny zapamiętane, BR-DANE-003: klucze maszyna i wersje_receptur na liście kopii; eksport je niesie, import przenosi, kopia z 1014 ich nie zmienia', async () => {
    restartApp();
    expect((require('../ustawienia-kopii') as typeof import('../ustawienia-kopii')).KLUCZE_USTAWIEN_KOPII).toEqual(expect.arrayContaining(['maszyna', 'wersje_receptur']));
    zalozBaze1021(APP_DB());
    const a = restartApp();
    await a.schema.initDatabase();
    await a.store.setAppSetting('maszyna', '{"v":1,"makaMaxG":620,"ciastoMaxG":1000,"drozdzeSucheMaxG":10,"uklad":"plyny_najpierw"}');
    await a.store.setAppSetting('wersje_receptur', '{"graham_bread_honey":"drozdze"}');
    const tekst = JSON.stringify(a.backup.buildBackup(await a.store.collectBackupData()));

    useTempDbDir();
    const b = restartApp();
    await b.schema.initDatabase();
    await b.store.restoreFromBackupData(b.backup.parseAndValidateBackup(tekst).state);
    expect(await b.store.getAppSetting('maszyna')).toContain('"makaMaxG":620');
    await b.store.restoreFromBackupData(b.backup.parseAndValidateBackup(kopia1014()).state);
    expect(await b.store.getAppSetting('wersje_receptur')).toBe('{"graham_bread_honey":"drozdze"}');
  });

  it('wersja wypieku w kopii: eksport jawnie (także null), import przenosi; kopia sprzed p9 bez pola zostawia wartość z telefonu', async () => {
    await migruj(zalozBaze1021);
    const r0 = openRaw(APP_DB());
    r0.prepare(`UPDATE bakes SET ${KOLUMNA} = 'yeast' WHERE id = 'bake_1'`).run();
    r0.close();
    const app = restartApp();
    await app.schema.initDatabase();
    const koperta = app.backup.buildBackup(await app.store.collectBackupData());
    const wpisy = koperta.state.bakes as unknown as Array<Record<string, unknown>>;
    expect(wpisy.find((b) => b.id === 'bake_1')?.[KOLUMNA]).toBe('yeast');
    expect(wpisy.find((b) => b.id === 'bake_2')).toHaveProperty(KOLUMNA, null);
    await app.store.restoreFromBackupData(app.backup.parseAndValidateBackup(kopia1014()).state);
    const raw = openRaw(APP_DB());
    expect(raw.prepare(`SELECT ${KOLUMNA} AS w FROM bakes WHERE id = 'bake_1'`).get()).toEqual({ w: 'yeast' });
    raw.close();
  });
});
