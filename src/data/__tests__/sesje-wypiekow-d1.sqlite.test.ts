/**
 * Warstwa danych listy sesji po migracji v6 (D1-1 tabela bake_sessions) i zapis recipe_id we wpisie wypieku
 * (zasada wspólna 10: UPSERT zamiast INSERT OR REPLACE) [M3 D1, etap 2].
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1014 } from './helpers/baza-1014';
import type { BakeSession } from '../bake-session-store';
import type { StoredBakeLog } from '../db';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const recipeIdWpisu = (id: string) => {
  const raw = openRaw(APP_DB());
  const r = raw.prepare('SELECT recipe_id FROM bakes WHERE id = ?').get(id);
  raw.close();
  return r;
};
const idSesji = () => {
  const raw = openRaw(APP_DB());
  const r = (raw.prepare('SELECT id FROM bake_sessions ORDER BY id').all() as Array<{ id: string }>).map((w) => w.id);
  raw.close();
  return r;
};

async function start() {
  zalozBaze1014(APP_DB(), 'v2-pauza');
  const app = restartApp();
  await app.schema.initDatabase();
  expect(app.status.getStorageState()).toBe('ok');
  // Najpierw schemat v6 (na kodzie sprzed D1 test pada tu, a nie na imporcie modułu)
  const r = openRaw(APP_DB());
  const kol = (r.prepare('PRAGMA table_info(bakes)').all() as Array<{ name: string }>).map((c) => c.name);
  const tab = r.prepare("SELECT count(*) AS c FROM sqlite_master WHERE name = 'bake_sessions'").get();
  r.close();
  expect({ recipeId: kol.includes('recipe_id'), tab }).toEqual({ recipeId: true, tab: { c: 1 } });
  const sesje = require('../bake-sessions-store') as typeof import('../bake-sessions-store');
  const legacy = require('../bake-session-store') as typeof import('../bake-session-store');
  const [pierwsza] = await sesje.loadActiveBakeSessions();
  return { app, sesje, legacy, pierwsza };
}

const zReceptura = (s: BakeSession, recipeId: string): BakeSession => ({ ...s, bake: s.bake ? { ...s.bake, recipeId } : null });

describe('D1: sesje wypieków i recipe_id', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('koniec wypieku zapisuje recipe_id z receptury sesji, a ocena po wypieku (saveBakeLog bez recipeId) go nie zeruje', async () => {
    const { app, sesje, pierwsza } = await start();
    expect(await sesje.saveActiveBakeSession(zReceptura(pierwsza, 'recipe_user_1'))).toEqual({ ok: true });
    const log: StoredBakeLog = { id: 'bake_koniec', recipeName: 'Mój chleb', startedAt: pierwsza.startedAt, finishedAt: pierwsza.startedAt + 1 };
    await app.store.finishBake(log, [], { sessionId: 'bake_live' });
    expect(recipeIdWpisu('bake_koniec')).toEqual({ recipe_id: 'recipe_user_1' });
    expect(idSesji()).toEqual([]);

    // ocena i notatka później: ten sam wpis bez pola recipeId
    await app.store.saveBakeLog({ ...log, ratingStars: 2, notes: 'za kwaśny' });
    expect(recipeIdWpisu('bake_koniec')).toEqual({ recipe_id: 'recipe_user_1' });
    const wpis = (await app.store.getBakeLogs()).find((b) => b.id === 'bake_koniec');
    expect(wpis).toEqual(expect.objectContaining({ ratingStars: 2, notes: 'za kwaśny', recipeId: 'recipe_user_1' }));
  });

  it('dzisiejszy zapis „jednej sesji” (clearSession) też przenosi recipe_id i kasuje sesję; stary wypiek bez receptury ma NULL (D1-7)', async () => {
    const { app, legacy, pierwsza } = await start();
    await app.store.finishBake({ id: 'bake_stary', recipeName: 'Stary', startedAt: 1, finishedAt: 2 }, [], { clearSession: true });
    expect(recipeIdWpisu('bake_stary')).toEqual({ recipe_id: null });
    expect(await legacy.loadBakeSession()).toBeNull();

    await legacy.saveBakeSession(zReceptura(pierwsza, 'recipe_user_2'));
    await app.store.finishBake({ id: 'bake_nowy', recipeName: 'Nowy', startedAt: 3, finishedAt: 4 }, [], { clearSession: true });
    expect(recipeIdWpisu('bake_nowy')).toEqual({ recipe_id: 'recipe_user_2' });
    expect(idSesji()).toEqual([]);
  });

  it('przerwanie jednego wypieku kasuje tylko jego wiersz', async () => {
    const { sesje, pierwsza } = await start();
    const druga: BakeSession = { ...pierwsza, bake: pierwsza.bake ? { ...pierwsza.bake, id: 'bake_drugi' } : null };
    expect(await sesje.saveActiveBakeSession(druga)).toEqual({ ok: true });
    await sesje.deleteBakeSession('bake_live');
    expect(idSesji()).toEqual(['bake_drugi']);
  });

  it('ekrany jednej sesji (loadBakeSession/saveBakeSession) widzą listę jako jedną sesję: zapis innego wypieku zastępuje trwający jak dotąd, null czyści', async () => {
    const { legacy, pierwsza } = await start();
    expect((await legacy.loadBakeSession())?.bake?.id).toBe('bake_live');
    const nowy: BakeSession = { ...pierwsza, stepIdx: 0, bake: pierwsza.bake ? { ...pierwsza.bake, id: 'bake_nowy' } : null };
    await legacy.saveBakeSession(nowy);
    expect(idSesji()).toEqual(['bake_nowy']);
    expect(await legacy.loadBakeSession()).toEqual(nowy);
    await legacy.saveBakeSession(null);
    expect(idSesji()).toEqual([]);
  });

  it('D1-6: gdy plik ratunkowy starej sesji się nie zapisze, migracja nie rusza (baza zostaje v5 z sesją), następny start migruje', async () => {
    zalozBaze1014(APP_DB(), 'v2-pauza');
    const zapis = jest.mocked(FileSystem.writeAsStringAsync);
    const oryginal = zapis.getMockImplementation();
    if (!oryginal) throw new Error('mock writeAsStringAsync bez implementacji (jest.setup.js)'); // [M3 D1b, P2-6]
    zapis.mockImplementation(async (uri: string, tresc: string) => {
      if (uri.includes('sesja-przed-migracja-')) throw new Error('ENOSPC: no space left on device');
      mockFiles.set(uri, tresc);
    });
    const app = restartApp();
    try {
      await app.schema.initDatabase();
    } finally {
      zapis.mockImplementation(oryginal);
    }
    expect(app.status.getStorageState()).toBe('unavailable');
    expect(app.status.getRescueFile()).toMatch(/backup_pre_migration-v5-/);
    const raw = openRaw(APP_DB());
    expect(raw.prepare('PRAGMA user_version').get()).toEqual({ user_version: 5 });
    expect(raw.prepare("SELECT count(*) AS c FROM app_settings WHERE key = 'active_bake_session' AND value <> ''").get()).toEqual({ c: 1 });
    expect(raw.prepare("SELECT count(*) AS c FROM sqlite_master WHERE name = 'bake_sessions'").get()).toEqual({ c: 0 });
    raw.close();

    const again = restartApp();
    await again.schema.initDatabase();
    expect(again.status.getStorageState()).toBe('ok');
    expect(idSesji()).toEqual(['bake_live']);
    // Kopie przed migracją: jedna z nieudanej próby i jedna z udanej (sprzątanie powyżej 2: d1b-przeglad-danych) [M3 D1b, P2-6]
    expect(require('node:fs').readdirSync(require('node:path').dirname(APP_DB())).filter((f: string) => f.startsWith('backup_pre_migration-v5-'))).toHaveLength(2);
  });

  it('uszkodzony wiersz sesji jest pomijany i trafia do pliku ratunkowego, inne sesje czytają się dalej', async () => {
    const { sesje, pierwsza } = await start();
    const raw = openRaw(APP_DB());
    raw.prepare("INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at) VALUES ('zly', 'active', '{\"version\": 2, ZEPSUTE', 0, 0)").run();
    raw.close();
    expect((await sesje.loadActiveBakeSessions()).map((s) => s.bake?.id)).toEqual([pierwsza.bake?.id]);
    const { uszkodzoneWiersze } = require('../uszkodzone-wiersze') as typeof import('../uszkodzone-wiersze');
    expect(uszkodzoneWiersze()).toEqual([{ tabela: 'bake_sessions', id: 'zly', surowe: '{"version": 2, ZEPSUTE' }]);
  });

  it('sesja v1/v2 bez danych wypieku (bake: null) dostaje stały id ID_SESJI_BEZ_WYPIEKU i wraca po migracji', async () => {
    const raw = openRaw(APP_DB());
    raw.exec(require('./helpers/baza-1014').zrzutBazy1014());
    const v1 = JSON.parse(String(require('./helpers/baza-1014').surowaSesja1014('v1')));
    raw.prepare('UPDATE app_settings SET value = ? WHERE key = ?').run(JSON.stringify({ ...v1, bake: null }), 'active_bake_session');
    raw.close();
    const app = restartApp();
    await app.schema.initDatabase();
    const { ID_SESJI_BEZ_WYPIEKU } = require('../bake-session-store') as typeof import('../bake-session-store');
    expect(idSesji()).toEqual([ID_SESJI_BEZ_WYPIEKU]);
    const [s] = await (require('../bake-sessions-store') as typeof import('../bake-sessions-store')).loadActiveBakeSessions();
    expect({ stepIdx: s.stepIdx, timerEndsAt: s.timerEndsAt, bake: s.bake }).toEqual({ stepIdx: v1.stepIdx, timerEndsAt: v1.timerEndsAt, bake: null });
  });

  it('status wiersza tylko active albo planned (CHECK), a plan i limit mają typowany wynik zapisu', async () => {
    const { sesje, pierwsza } = await start();
    const statusy: import('../bake-sessions-store').StatusSesji[] = ['active', 'planned'];
    const raw = openRaw(APP_DB());
    for (const st of [...statusy, 'done']) {
      const wstaw = () => raw.prepare("INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at) VALUES (?, ?, '{}', 1, 1)").run(`s_${st}`, st);
      if (st === 'done') expect(wstaw).toThrow(/CHECK/);
      else expect(wstaw).not.toThrow();
    }
    raw.prepare("DELETE FROM bake_sessions WHERE id LIKE 's\\_%' ESCAPE '\\'").run();
    raw.close();
    const wynik: import('../bake-sessions-store').ZapisSesji = await sesje.savePlannedBake({ version: 1, id: 'plan_r', recipeName: 'Z recepturą', recipeId: 'recipe_user_1', plannedStartAt: 5, steps: pierwsza.steps });
    expect(wynik).toEqual({ ok: true });
    expect(await sesje.loadPlannedBakes()).toEqual([{ version: 1, id: 'plan_r', recipeName: 'Z recepturą', recipeId: 'recipe_user_1', plannedStartAt: 5, steps: pierwsza.steps }]);
  });

  it('migracja wywołana drugi raz na danych (przeniesSesjeV6) nic nie zmienia; plik przed migracją z tą samą treścią nie dubluje się (zapiszSesjePrzedMigracja)', async () => {
    zalozBaze1014(APP_DB(), 'v2-pauza');
    const app = restartApp();
    const db = await app.schema.getDb();
    if (!db) throw new Error('brak bazy');
    const m = require('../migracja-v6') as typeof import('../migracja-v6');
    await m.zapiszSesjePrzedMigracja(db);
    await m.zapiszSesjePrzedMigracja(db);
    expect([...mockFiles.keys()].filter((k) => k.includes('sesja-przed-migracja-'))).toHaveLength(1);
    await app.schema.initDatabase();
    const przed = idSesji();
    await m.przeniesSesjeV6(db);
    expect(idSesji()).toEqual(przed);
    expect(przed).toEqual(['bake_live']);
  });

  it('zakonczSesjeWTransakcji: bez sessionId i clearSession nic nie kasuje; z sessionId zwraca recepturę i kasuje wiersz; zakonczSesjeWPamieci filtruje pamięć', async () => {
    const { app, sesje, pierwsza } = await start();
    await sesje.saveActiveBakeSession(zReceptura(pierwsza, 'recipe_user_3'));
    const db = await app.schema.getDb();
    if (!db) throw new Error('brak bazy');
    const wyniki: Array<string | undefined> = [];
    await db.withTransactionAsync(async () => {
      wyniki.push(await sesje.zakonczSesjeWTransakcji(db, {}));
      wyniki.push(await sesje.zakonczSesjeWTransakcji(db, { sessionId: 'bake_live' }));
    });
    expect(wyniki).toEqual([undefined, 'recipe_user_3']);
    expect(idSesji()).toEqual([]);

    app.schema.memStore.bakeSessions = [
      { id: 'a', status: 'active', session_json: '{}', created_at: 1, updated_at: 1 },
      { id: 'p', status: 'planned', session_json: '{}', created_at: 1, updated_at: 1 },
    ];
    sesje.zakonczSesjeWPamieci({ clearSession: true });
    expect(app.schema.memStore.bakeSessions.map((w) => w.id)).toEqual(['p']);
    sesje.zakonczSesjeWPamieci({ sessionId: 'p' });
    expect(app.schema.memStore.bakeSessions).toEqual([]);
  });
});

describe('D1: pola v6 w kopii (parsowanie i reguła importu)', () => {
  const parsery = () => require('../row-parsers') as typeof import('../row-parsers');

  it('parseStalyDzien i dzienZKolumn: null zostaje null, zakres 1–7 i 0–1439, zły kształt = brak pola (undefined)', () => {
    const { parseStalyDzien } = parsery();
    expect(parseStalyDzien(null)).toBeNull();
    expect(parseStalyDzien({ weekday: 7, minuteOfDay: 600 })).toEqual({ weekday: 7, minuteOfDay: 600 });
    expect(parseStalyDzien({ weekday: 1, minuteOfDay: 0 })).toEqual({ weekday: 1, minuteOfDay: 0 });
    for (const zly of [undefined, { weekday: 0, minuteOfDay: 600 }, { weekday: 8, minuteOfDay: 1 }, { weekday: 3, minuteOfDay: 1440 }, { weekday: 2.5, minuteOfDay: 1 }, { weekday: '3', minuteOfDay: 1 }, { weekday: 3 }]) {
      expect(parseStalyDzien(zly)).toBeUndefined();
    }
    const { dzienZKolumn } = pola();
    expect(dzienZKolumn(7, 600)).toEqual({ weekday: 7, minuteOfDay: 600 });
    expect(dzienZKolumn(null, null)).toBeNull();
    expect(dzienZKolumn(3, null)).toBeNull();
  });

  it('parsePlannedBake: poprawny plan, a zła wersja, brak kroków, zły krok albo recipeId nie-tekst dają null', () => {
    const { parsePlannedBake } = require('../bake-sessions-store') as typeof import('../bake-sessions-store');
    const { LEGACY_STEPS_V1 } = require('../../core/legacy-steps-v1') as typeof import('../../core/legacy-steps-v1');
    const plan = { version: 1, id: 'p1', recipeName: 'Plan', plannedStartAt: 10, steps: [...LEGACY_STEPS_V1] };
    expect(parsePlannedBake(JSON.stringify(plan))).toEqual(plan);
    expect(parsePlannedBake(JSON.stringify({ ...plan, recipeId: 'r1' }))).toEqual({ ...plan, recipeId: 'r1' });
    for (const zly of [{ ...plan, version: 2 }, { ...plan, steps: [] }, { ...plan, steps: [{ id: 'x' }] }, { ...plan, recipeId: 5 }, { ...plan, plannedStartAt: 'jutro' }]) {
      expect(parsePlannedBake(JSON.stringify(zly))).toBeNull();
    }
    expect(parsePlannedBake('{zepsute')).toBeNull();
  });

  it('wpisPoImporcie i dzienPoImporcie: pole z kopii (także null) rozstrzyga, brak pola bierze wartość z telefonu', () => {
    const { wpisPoImporcie, dzienPoImporcie } = pola();
    const tel = { recipeId: new Map<string, string | null>([['b1', 'r_tel']]), dzien: new Map([['s1', { weekday: 2, minuteOfDay: 60 }]]) };
    const wpis: StoredBakeLog = { id: 'b1', recipeName: 'Chleb', startedAt: 1 };
    expect(wpisPoImporcie(wpis, tel).recipeId).toBe('r_tel');
    expect(wpisPoImporcie({ ...wpis, recipeId: null }, tel).recipeId).toBeNull();
    expect(wpisPoImporcie({ ...wpis, recipeId: 'r_kopia' }, tel).recipeId).toBe('r_kopia');
    expect(wpisPoImporcie({ ...wpis, id: 'nowy' }, tel).recipeId).toBeNull();
    const zakwas = { id: 's1', name: 'Z', flourType: 'Ż', hydration: 100, birthDate: 1, storageState: 'FRIDGE' as const };
    expect(dzienPoImporcie(zakwas, tel)).toEqual({ weekday: 2, minuteOfDay: 60 });
    expect(dzienPoImporcie({ ...zakwas, fridgeFeedDay: null }, tel)).toBeNull();
    expect(dzienPoImporcie({ ...zakwas, id: 's2' }, tel)).toBeNull();
  });
});

describe('D1: czytajNowePola i zapiszStalyDzien na bazie', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('zapis stałego dnia w transakcji i odczyt mapy z telefonu; zapis profilu zakwasu (saveStarter) dnia nie zeruje', async () => {
    const { app } = await start();
    const db = await app.schema.getDb();
    if (!db) throw new Error('brak bazy');
    const { zapiszStalyDzien, czytajNowePola } = pola();
    await db.withTransactionAsync(() => zapiszStalyDzien(db, 'starter_lodowka', { weekday: 6, minuteOfDay: 480 }));
    const tel = await czytajNowePola(db);
    expect(tel.dzien.get('starter_lodowka')).toEqual({ weekday: 6, minuteOfDay: 480 });
    expect(tel.dzien.get('starter_blat')).toBeNull();
    expect(tel.recipeId.get('bake_1')).toBeNull();
    const zakwas = (await app.store.getStarters()).find((s) => s.id === 'starter_lodowka');
    if (!zakwas) throw new Error('brak zakwasu');
    expect(zakwas.fridgeFeedDay).toEqual({ weekday: 6, minuteOfDay: 480 });
    await app.store.saveStarter({ ...zakwas, name: 'Nowa nazwa', fridgeFeedDay: undefined });
    expect((await czytajNowePola(db)).dzien.get('starter_lodowka')).toEqual({ weekday: 6, minuteOfDay: 480 });
  });
});

const pola = () => require('../nowe-pola-kopii') as typeof import('../nowe-pola-kopii');
