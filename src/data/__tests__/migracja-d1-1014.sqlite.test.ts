/**
 * Migracja D1 (schemat v6) na kopii bazy buildu 1014 [M3 D1; zasada wspólna 10; moduł dane-uzytkownika].
 * Projekt: audit/M3-2026-10-22/role/08-d1/projekt-d1.md (wariant B: tabela bake_sessions, wiersz na wypiek, UPSERT).
 * Etap 1: testy czerwone z powodu braku migracji v6 (pierwsza asercja: user_version 6 / nowa tabela / nowe kolumny).
 * Kontrakt nowego kodu (etap 2) opisany typami niżej; moduły bake-sessions-store i limity-wypiekow jeszcze nie istnieją,
 * dlatego sięga się do nich dopiero po asercji schematu.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts, control } from './helpers/node-sqlite-adapter';
import { zalozBaze1014, surowaSesja1014, kopia1014, KLUCZ_SESJI_1014, type WariantSesji1014 } from './helpers/baza-1014';
import type { BakeSession } from '../bake-session-store';
import type { StoredBakeLog } from '../db';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
type Raw = ReturnType<typeof openRaw>;

const WERSJA_D1 = 6;
const kolumny = (raw: Raw, t: string) => (raw.prepare(`PRAGMA table_info(${t})`).all() as Array<{ name: string }>).map((c) => c.name);
const maTabele = (raw: Raw, t: string) => (raw.prepare("SELECT count(*) AS c FROM sqlite_master WHERE type='table' AND name = ?").get(t) as { c: number }).c === 1;
const wersja = (raw: Raw) => (raw.prepare('PRAGMA user_version').get() as { user_version: number }).user_version;
const sesjeWBazie = (raw: Raw) => raw.prepare('SELECT id, status, session_json FROM bake_sessions ORDER BY created_at, id').all() as Array<{ id: string; status: string; session_json: string }>;
const plikiRatunkoweSesji = () => [...mockFiles.keys()].filter((k) => /kopie-ratunkowe\/sesja-przed-migracja-[^/]+\.json$/.test(k));

/** Kontrakt etapu 2 (propozycja z projektu D1). */
interface PlannedBake { version: 1; id: string; recipeName: string; recipeId?: string; plannedStartAt: number; steps: BakeSession['steps'] }
type Zapis = { ok: true } | { ok: false; error: { kind: 'limit'; status: 'active' | 'planned'; max: number } };
interface SesjeApi {
  loadActiveBakeSessions(): Promise<BakeSession[]>;
  saveActiveBakeSession(s: BakeSession): Promise<Zapis>;
  loadPlannedBakes(): Promise<PlannedBake[]>;
  savePlannedBake(p: PlannedBake): Promise<Zapis>;
}
const sesjeApi = () => require('../bake-sessions-store') as SesjeApi;
const limity = () => require('../../core/limity-wypiekow') as { MAX_TRWAJACYCH_WYPIEKOW: number; MAX_ZAPLANOWANYCH_WYPIEKOW: number };

/** Start aplikacji z migracją na kopii bazy 1014; pierwsza asercja: schemat D1 (czerwień etapu 1). */
async function migruj(wariant: WariantSesji1014 = 'v2-pauza') {
  const przed = zalozBaze1014(APP_DB(), wariant);
  const app = restartApp();
  await app.schema.initDatabase();
  const raw = openRaw(APP_DB());
  const st = kolumny(raw, 'starters');
  const po = {
    wersja: wersja(raw),
    bakeSessions: maTabele(raw, 'bake_sessions'),
    recipeId: kolumny(raw, 'bakes').includes('recipe_id'),
    stalyDzien: st.includes('fridge_feed_weekday') && st.includes('fridge_feed_minute'),
  };
  raw.close();
  expect(po).toEqual({ wersja: WERSJA_D1, bakeSessions: true, recipeId: true, stalyDzien: true });
  expect(app.status.getStorageState()).toBe('ok');
  return { app, przed };
}

const parsuj = (raw: string | null) => (require('../bake-session-store') as typeof import('../bake-session-store')).parseBakeSession(raw ?? undefined);

describe('D1: migracja v6 na kopii bazy buildu 1014', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it.each<WariantSesji1014>(['v2-pauza', 'v2-zytnia', 'v1'])(
    'BR-KAL-009 Aktualizacja z wersji z jednym planem: sesja %s wraca na tym samym kroku, z tym samym zegarem i pauzą; liczności bez strat',
    async (wariant) => {
      const stara = parsuj(surowaSesja1014(wariant));
      expect(stara).not.toBeNull();
      const { app, przed } = await migruj(wariant);

      const raw = openRaw(APP_DB());
      const po = tableCounts(raw);
      for (const t of Object.keys(przed)) {
        if (t === 'app_settings') expect(po[t]).toBe(przed[t] - 1); // tylko klucz starej sesji
        else if (t === 'schema_migrations') expect(po[t]).toBe(przed[t] + 1);
        else expect({ t, n: po[t] }).toEqual({ t, n: przed[t] });
      }
      expect(raw.prepare('SELECT count(*) AS c FROM app_settings WHERE key = ?').get(KLUCZ_SESJI_1014)).toEqual({ c: 0 });
      const wiersze = sesjeWBazie(raw);
      expect(wiersze.map((w) => [w.id, w.status])).toEqual([[stara?.bake?.id, 'active']]);
      expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
      expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
      raw.close();

      const [s] = await sesjeApi().loadActiveBakeSessions();
      expect({ stepIdx: s.stepIdx, timerEndsAt: s.timerEndsAt, pausedLeftSec: s.pausedLeftSec, phase: s.dutchOvenPhase, steps: s.steps, startedAt: s.startedAt, bake: s.bake })
        .toEqual({ stepIdx: stara?.stepIdx, timerEndsAt: stara?.timerEndsAt, pausedLeftSec: stara?.pausedLeftSec, phase: stara?.dutchOvenPhase, steps: stara?.steps, startedAt: stara?.startedAt, bake: stara?.bake });
      // dane obok sesji bez zmian: wypieki z ocenami, zakwas w lodówce z dziennikiem
      expect((await app.store.getBakeLogs()).map((b) => [b.id, b.ratingStars])).toEqual([['bake_3', 5], ['bake_2', 2], ['bake_1', 4]]);
      expect((await app.store.getStarters()).find((x) => x.id === 'starter_lodowka')).toEqual(expect.objectContaining({ storageState: 'FRIDGE', feedingRatio: '1:5:5' }));
    }
  );

  it('przed migracją: kopia bazy VACUUM INTO (backup_pre_migration-v5-*) i surowa stara sesja w pliku ratunkowym', async () => {
    await migruj('v2-pauza');
    const kopie = fs.readdirSync(path.dirname(APP_DB())).filter((f) => f.startsWith('backup_pre_migration-v5-'));
    expect(kopie).toHaveLength(1);
    const kopia = openRaw(path.join(path.dirname(APP_DB()), kopie[0]));
    expect(wersja(kopia)).toBe(5);
    expect(kopia.prepare('SELECT value FROM app_settings WHERE key = ?').get(KLUCZ_SESJI_1014)).toEqual({ value: surowaSesja1014('v2-pauza') });
    kopia.close();
    const pliki = plikiRatunkoweSesji();
    expect(pliki).toHaveLength(1);
    expect(JSON.parse(String(mockFiles.get(pliki[0])))).toEqual(expect.objectContaining({ format: 'piekarz-sesja-przed-migracja', klucz: KLUCZ_SESJI_1014, surowe: surowaSesja1014('v2-pauza') }));
  });

  it('uszkodzona sesja 1014: surowa treść w pliku ratunkowym, brak sesji po migracji, reszta bazy cała', async () => {
    const { przed } = await migruj('uszkodzona');
    const raw = openRaw(APP_DB());
    expect(sesjeWBazie(raw)).toEqual([]);
    const po = tableCounts(raw);
    for (const t of ['bakes', 'starters', 'starter_entries', 'recipes', 'flour_inventory', 'lesson_progress']) expect({ t, n: po[t] }).toEqual({ t, n: przed[t] });
    raw.close();
    const pliki = plikiRatunkoweSesji();
    expect(pliki).toHaveLength(1);
    expect(JSON.parse(String(mockFiles.get(pliki[0]))).surowe).toBe(surowaSesja1014('uszkodzona'));
  });

  it.each<WariantSesji1014>(['pusta', 'brak'])('sesja %s: migracja bez wiersza sesji i bez pliku ratunkowego', async (wariant) => {
    await migruj(wariant);
    const raw = openRaw(APP_DB());
    expect(sesjeWBazie(raw)).toEqual([]);
    expect(raw.prepare('SELECT count(*) AS c FROM app_settings WHERE key = ?').get(KLUCZ_SESJI_1014)).toEqual({ c: 0 });
    raw.close();
    expect(plikiRatunkoweSesji()).toEqual([]);
  });

  it('idempotencja: drugi start nic nie zmienia (liczności, sesja, kopia przed migracją, plik ratunkowy)', async () => {
    await migruj('v2-pauza');
    const r1 = openRaw(APP_DB());
    const po1 = tableCounts(r1);
    const sesje1 = sesjeWBazie(r1);
    r1.close();
    const again = restartApp();
    await again.schema.initDatabase();
    const r2 = openRaw(APP_DB());
    expect(tableCounts(r2)).toEqual(po1);
    expect(sesjeWBazie(r2)).toEqual(sesje1);
    expect(wersja(r2)).toBe(WERSJA_D1);
    r2.close();
    expect(fs.readdirSync(path.dirname(APP_DB())).filter((f) => f.startsWith('backup_pre_migration-'))).toHaveLength(1);
    expect(plikiRatunkoweSesji()).toHaveLength(1);
  });

  it('błąd w połowie migracji v6: wycofanie całości, baza jak w 1014 (wersja 5, stara sesja), plik ratunkowy już jest', async () => {
    const przed = zalozBaze1014(APP_DB(), 'v2-pauza');
    control().failWritesMatching = /bake_sessions/;
    const app = restartApp();
    await app.schema.initDatabase();
    control().failWritesMatching = null;
    expect(app.status.getStorageState()).toBe('unavailable');
    expect(app.status.getRescueFile()).toMatch(/backup_pre_migration-v5-/);
    const raw = openRaw(APP_DB());
    expect(wersja(raw)).toBe(5);
    expect(maTabele(raw, 'bake_sessions')).toBe(false);
    expect(kolumny(raw, 'bakes')).not.toContain('recipe_id');
    expect(raw.prepare('SELECT value FROM app_settings WHERE key = ?').get(KLUCZ_SESJI_1014)).toEqual({ value: surowaSesja1014('v2-pauza') });
    expect(tableCounts(raw)).toEqual(przed);
    raw.close();
    expect(plikiRatunkoweSesji()).toHaveLength(1);
  });
});

describe('D1: kilka sesji po migracji', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  const druga = (s: BakeSession, id: string, nazwa: string): BakeSession => ({
    ...s, stepIdx: 0, timerEndsAt: null, pausedLeftSec: null, recipeName: nazwa, startedAt: s.startedAt + 3_600_000,
    bake: s.bake ? { ...s.bake, id, recipeName: nazwa, startedAt: s.startedAt + 3_600_000 } : null,
  });

  it('BR-KAL-016 Koniec jednego: koniec pierwszego z dwóch wypieków nie rusza drugiego (ten sam krok i zegar), wpis i sesja w jednej transakcji', async () => {
    const { app } = await migruj('v2-pauza');
    const api = sesjeApi();
    const [pierwsza] = await api.loadActiveBakeSessions();
    expect(await api.saveActiveBakeSession(druga(pierwsza, 'bake_pizza', 'Pizza'))).toEqual({ ok: true });
    const r1 = openRaw(APP_DB());
    const pizzaPrzed = sesjeWBazie(r1).find((w) => w.id === 'bake_pizza');
    r1.close();

    const log: StoredBakeLog = { id: 'bake_live', recipeName: 'Mój chleb mieszany', startedAt: pierwsza.startedAt, finishedAt: pierwsza.startedAt + 8 * 3_600_000, ratingStars: 4 };
    const finish = app.store.finishBake as unknown as (l: StoredBakeLog, f: Array<{ name: string; weightGrams: number }>, o: { sessionId: string }) => Promise<void>;
    await finish(log, [], { sessionId: 'bake_live' });

    const r2 = openRaw(APP_DB());
    expect(sesjeWBazie(r2)).toEqual([pizzaPrzed]);
    expect(r2.prepare('SELECT count(*) AS c FROM bakes').get()).toEqual({ c: 4 });
    r2.close();

    // błąd zapisu wpisu wycofuje też skasowanie sesji
    await api.saveActiveBakeSession(druga(pierwsza, 'bake_3x', 'Trzeci po końcu'));
    control().failWritesMatching = /INTO bakes/;
    await expect(finish({ ...log, id: 'bake_pizza' }, [], { sessionId: 'bake_pizza' })).rejects.toThrow();
    control().failWritesMatching = null;
    const r3 = openRaw(APP_DB());
    expect(sesjeWBazie(r3).map((w) => w.id).sort()).toEqual(['bake_3x', 'bake_pizza']);
    r3.close();
  });

  it('BR-ETAP-006 limit 2 trwających i BR-KAL-009 limit 5 zaplanowanych: nadmiar odrzucony, istniejące bez zmian; limity z jednego modułu', async () => {
    await migruj('v2-pauza');
    const api = sesjeApi();
    const { MAX_TRWAJACYCH_WYPIEKOW, MAX_ZAPLANOWANYCH_WYPIEKOW } = limity();
    expect([MAX_TRWAJACYCH_WYPIEKOW, MAX_ZAPLANOWANYCH_WYPIEKOW]).toEqual([2, 5]);
    const [pierwsza] = await api.loadActiveBakeSessions();
    expect(await api.saveActiveBakeSession(druga(pierwsza, 'bake_b', 'B'))).toEqual({ ok: true });
    const r1 = openRaw(APP_DB());
    const przed = sesjeWBazie(r1);
    r1.close();
    expect(await api.saveActiveBakeSession(druga(pierwsza, 'bake_c', 'C'))).toEqual({ ok: false, error: { kind: 'limit', status: 'active', max: 2 } });
    // aktualizacja istniejącej (ten sam id) nie jest nadmiarem
    expect(await api.saveActiveBakeSession({ ...pierwsza, stepIdx: 2 })).toEqual({ ok: true });

    for (let n = 1; n <= 5; n++) {
      expect(await api.savePlannedBake({ version: 1, id: `plan_${n}`, recipeName: `Plan ${n}`, plannedStartAt: pierwsza.startedAt + n * 86_400_000, steps: pierwsza.steps })).toEqual({ ok: true });
    }
    expect(await api.savePlannedBake({ version: 1, id: 'plan_6', recipeName: 'Plan 6', plannedStartAt: pierwsza.startedAt + 6 * 86_400_000, steps: pierwsza.steps }))
      .toEqual({ ok: false, error: { kind: 'limit', status: 'planned', max: 5 } });

    const r2 = openRaw(APP_DB());
    const po = sesjeWBazie(r2);
    r2.close();
    expect(po.filter((w) => w.status === 'active').map((w) => w.id)).toEqual(przed.map((w) => w.id));
    expect(po.filter((w) => w.status === 'planned').map((w) => w.id)).toEqual(['plan_1', 'plan_2', 'plan_3', 'plan_4', 'plan_5']);
    expect((await api.loadPlannedBakes()).map((p) => p.id)).toEqual(['plan_1', 'plan_2', 'plan_3', 'plan_4', 'plan_5']);
  });

  it('„Usuń wszystkie dane” czyści trwające i zaplanowane; kopia przed czyszczeniem nie niesie sesji ani planów', async () => {
    await migruj('v2-pauza');
    const api = sesjeApi();
    const [pierwsza] = await api.loadActiveBakeSessions();
    await api.savePlannedBake({ version: 1, id: 'plan_1', recipeName: 'Plan', plannedStartAt: pierwsza.startedAt + 86_400_000, steps: pierwsza.steps });
    const { usunWszystkieDane } = require('../usun-wszystko') as typeof import('../usun-wszystko');
    await usunWszystkieDane();
    const raw = openRaw(APP_DB());
    expect(sesjeWBazie(raw)).toEqual([]);
    raw.close();
    expect(await api.loadActiveBakeSessions()).toEqual([]);
    const kopia = [...mockFiles.keys()].find((k) => /piekarz-przed-czyszczeniem-[^/]+\.json$/.test(k));
    const tresc = String(mockFiles.get(String(kopia)));
    for (const zakazane of ['bake_live', 'plan_1', 'session_json', KLUCZ_SESJI_1014]) expect(tresc).not.toContain(zakazane);
  });
});

describe('D1: kopia zapasowa po migracji', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  /** Nowe pola ustawione w telefonie po migracji (surowo, bo ekranów jeszcze nie ma). */
  function ustawNowePola() {
    const raw = openRaw(APP_DB());
    raw.prepare("UPDATE bakes SET recipe_id = 'recipe_user_1' WHERE id = 'bake_1'").run();
    raw.prepare("UPDATE starters SET fridge_feed_weekday = 7, fridge_feed_minute = 600 WHERE id = 'starter_lodowka'").run();
    raw.close();
  }

  it('BR-KAL-010 eksport nowej wersji: recipeId w wypiekach i stały dzień karmienia w zakwasach (jawny null), format v2, bez sesji i planów', async () => {
    const { app } = await migruj('v2-pauza');
    ustawNowePola();
    const dane = await app.store.collectBackupData();
    const env = app.backup.buildBackup(dane);
    expect(env.schemaVersion).toBe(2); // pola opcjonalne: build 1014 importuje nową kopię, pomijając nowe pola
    const tekst = JSON.stringify(env);
    const plik: unknown = JSON.parse(tekst);
    const stan = (plik as { state: { bakes: Array<Record<string, unknown>>; starters: Array<Record<string, unknown>> } }).state;
    expect(stan.bakes.map((b) => [b.id, b.recipeId])).toEqual([['bake_3', null], ['bake_2', null], ['bake_1', 'recipe_user_1']]);
    expect(stan.starters.map((s) => [s.id, s.fridgeFeedDay])).toEqual(expect.arrayContaining([['starter_lodowka', { weekday: 7, minuteOfDay: 600 }], ['starter_blat', null]]));
    for (const zakazane of ['bake_live', 'session_json', KLUCZ_SESJI_1014]) expect(tekst).not.toContain(zakazane);

    // drugi telefon: import nowej kopii przenosi nowe pola
    useTempDbDir();
    const nowy = restartApp();
    await nowy.schema.initDatabase();
    await nowy.store.restoreFromBackupData(nowy.backup.parseAndValidateBackup(tekst).state);
    const raw = openRaw(APP_DB());
    expect(raw.prepare("SELECT recipe_id FROM bakes WHERE id = 'bake_1'").get()).toEqual({ recipe_id: 'recipe_user_1' });
    expect(raw.prepare("SELECT fridge_feed_weekday AS d, fridge_feed_minute AS m FROM starters WHERE id = 'starter_lodowka'").get()).toEqual({ d: 7, m: 600 });
    raw.close();
  });

  it('BR-KAL-010 import kopii z 1014 (bez nowych pól) nie zmienia nowych pól w telefonie ani sesji', async () => {
    await migruj('v2-pauza');
    ustawNowePola();
    const app = restartApp();
    await app.schema.initDatabase();
    const r0 = openRaw(APP_DB());
    const sesjePrzed = sesjeWBazie(r0);
    r0.close();
    const kopia = app.backup.parseAndValidateBackup(kopia1014());
    expect(kopia.skippedRows).toBe(0);
    await app.store.restoreFromBackupData(kopia.state);
    const raw = openRaw(APP_DB());
    expect(raw.prepare("SELECT recipe_id FROM bakes WHERE id = 'bake_1'").get()).toEqual({ recipe_id: 'recipe_user_1' });
    expect(raw.prepare("SELECT fridge_feed_weekday AS d, fridge_feed_minute AS m FROM starters WHERE id = 'starter_lodowka'").get()).toEqual({ d: 7, m: 600 });
    expect(sesjeWBazie(raw)).toEqual(sesjePrzed);
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    raw.close();
  });

  it('rodzaj_drozdzy w kopii: eksport go niesie, import przenosi, kopia 1014 bez klucza zostawia wybór w telefonie', async () => {
    // Bez asercji schematu: brak klucza w KLUCZE_USTAWIEN_KOPII to osobna przyczyna czerwieni (D-100, D1 e)
    zalozBaze1014(APP_DB(), 'v2-pauza');
    const app = restartApp();
    await app.schema.initDatabase();
    await app.store.setAppSetting('rodzaj_drozdzy', 'suche');
    const dane = await app.store.collectBackupData();
    expect(dane.settings?.rodzaj_drozdzy).toBe('suche');
    const tekst = JSON.stringify(app.backup.buildBackup(dane));

    useTempDbDir();
    const nowy = restartApp();
    await nowy.schema.initDatabase();
    await nowy.store.restoreFromBackupData(nowy.backup.parseAndValidateBackup(tekst).state);
    expect(await nowy.store.getAppSetting('rodzaj_drozdzy')).toBe('suche');
    await nowy.store.restoreFromBackupData(nowy.backup.parseAndValidateBackup(kopia1014()).state);
    expect(await nowy.store.getAppSetting('rodzaj_drozdzy')).toBe('suche');
  });
});
