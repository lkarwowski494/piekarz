/**
 * Partia D1b: znaleziska P2 niezależnego przeglądu danych D1 (audit/M3-2026-10-22/weryfikacja/d1-przeglad-danych.md,
 * poza repo) na kopii bazy buildu 1014 [M3 D1b].
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1014, KLUCZ_SESJI_1014 } from './helpers/baza-1014';
import type { BakeSession } from '../bake-session-store';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const kopieV5 = () => fs.readdirSync(path.dirname(APP_DB())).filter((f) => /^backup_pre_migration-v5-\d+\.db$/.test(f)).sort();
const idSesji = () => {
  const raw = openRaw(APP_DB());
  const r = (raw.prepare('SELECT id FROM bake_sessions ORDER BY id').all() as Array<{ id: string }>).map((w) => w.id);
  raw.close();
  return r;
};
/** Surowe treści w plikach ratunkowych uszkodzonych wierszy (Backup/kopie-ratunkowe/uszkodzone-wiersze-*.json). */
const wPlikuUszkodzonych = (): string[] =>
  [...mockFiles.entries()]
    .filter(([k]) => /kopie-ratunkowe\/uszkodzone-wiersze-[^/]+\.json$/.test(k))
    .flatMap(([, v]) => (JSON.parse(String(v)).wiersze as Array<{ surowe: string }>).map((w) => w.surowe));

async function migruj() {
  zalozBaze1014(APP_DB(), 'v2-pauza');
  const app = restartApp();
  await app.schema.initDatabase();
  expect(app.status.getStorageState()).toBe('ok');
  const sesje = require('../bake-sessions-store') as typeof import('../bake-sessions-store');
  const [pierwsza] = await sesje.loadActiveBakeSessions();
  return { app, sesje, pierwsza };
}
const inny = (s: BakeSession, id: string): BakeSession => ({ ...s, stepIdx: 0, bake: s.bake ? { ...s.bake, id } : null });

/** Zapis pliku przez mock z awarią dla pasujących ścieżek; przywrócenie zawsze, także po błędzie asercji. */
function zAwariaZapisu<T>(wzor: RegExp, fn: () => Promise<T>): Promise<T> {
  const zapis = jest.mocked(FileSystem.writeAsStringAsync);
  const oryginal = zapis.getMockImplementation();
  if (!oryginal) throw new Error('mock writeAsStringAsync bez implementacji (jest.setup.js)');
  zapis.mockImplementation(async (uri: string, tresc: string) => {
    if (wzor.test(uri)) throw new Error('ENOSPC: no space left on device');
    mockFiles.set(uri, tresc);
  });
  return fn().finally(() => zapis.mockImplementation(oryginal));
}

/** readDirectoryAsync i deleteAsync dla katalogu bazy na prawdziwym dysku (kopie VACUUM INTO pisze SQLite, nie mock). */
function prawdziweKopieNaDysku(): () => void {
  const dir = jest.mocked(FileSystem.readDirectoryAsync);
  const del = jest.mocked(FileSystem.deleteAsync);
  const [d0, x0] = [dir.getMockImplementation(), del.getMockImplementation()];
  if (!d0 || !x0) throw new Error('mock FileSystem bez implementacji (jest.setup.js)');
  const sciezka = (uri: string) => uri.replace(/^file:\/\//, '');
  const naDysku = (uri: string) => sciezka(uri).startsWith(path.dirname(APP_DB()));
  dir.mockImplementation(async (uri: string) => (naDysku(uri) ? fs.readdirSync(sciezka(uri)) : d0(uri)));
  del.mockImplementation(async (uri: string, o?: { idempotent?: boolean }) => (naDysku(uri) ? fs.rmSync(sciezka(uri), { force: true }) : x0(uri, o)));
  return () => {
    dir.mockImplementation(d0);
    del.mockImplementation(x0);
  };
}

describe('D1b: znaleziska przeglądu danych D1', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('P2-1: zapis kroku innego wypieku w trakcie transakcji końca wypieku nie cofa jej (bez własnego BEGIN)', async () => {
    const { app, sesje, pierwsza } = await migruj();
    const db = await app.schema.getDb();
    if (!db) throw new Error('brak bazy');
    const run = db.runAsync.bind(db);
    let wtracony: Promise<unknown> | null = null;
    // Zapis z ekranu wpada dokładnie między instrukcje transakcji finishBake (to samo połączenie, jak w aplikacji)
    db.runAsync = (async (sql: string, ...ps: Parameters<typeof run>[1][]) => {
      if (/INTO bakes/.test(sql) && !wtracony) {
        wtracony = sesje.saveActiveBakeSession(inny(pierwsza, 'bake_pizza')).catch((e: unknown) => e);
        await wtracony;
      }
      return run(sql, ...ps);
    }) as typeof db.runAsync;
    // D3a-fix: finishBake zwraca wynik ('zapisano' albo 'nie-trwa', P1-1)
    await expect(app.store.finishBake({ id: 'bake_koniec', recipeName: 'Mój chleb mieszany', startedAt: 1, finishedAt: 2 }, [], { sessionId: 'bake_live' })).resolves.toBe('zapisano');
    expect(await wtracony).toEqual({ ok: true });
    db.runAsync = run;
    const raw = openRaw(APP_DB());
    expect(raw.prepare("SELECT count(*) AS c FROM bakes WHERE id = 'bake_koniec'").get()).toEqual({ c: 1 });
    raw.close();
    expect(idSesji()).toEqual(['bake_pizza']);
  });

  it('P2-1: limit trwających działa jedną instrukcją (nadmiar odrzucony, aktualizacja istniejącego przechodzi)', async () => {
    const { sesje, pierwsza } = await migruj();
    expect(await sesje.saveActiveBakeSession(inny(pierwsza, 'bake_b'))).toEqual({ ok: true });
    expect(await sesje.saveActiveBakeSession(inny(pierwsza, 'bake_c'))).toEqual({ ok: false, error: { kind: 'limit', status: 'active', max: 2 } });
    expect(await sesje.saveActiveBakeSession({ ...pierwsza, stepIdx: 3 })).toEqual({ ok: true });
    expect(idSesji()).toEqual(['bake_b', 'bake_live']);
  });

  it('P2-2: ponawiana migracja (D1-6) zostawia najwyżej 2 kopie VACUUM INTO tej wersji; udana migracja też', async () => {
    zalozBaze1014(APP_DB(), 'v2-pauza');
    const przywroc = prawdziweKopieNaDysku();
    try {
      for (let n = 0; n < 3; n++) {
        const app = restartApp();
        await zAwariaZapisu(/sesja-przed-migracja-/, () => app.schema.initDatabase());
        expect(app.status.getStorageState()).toBe('unavailable');
        expect(app.status.getRescueFile()).toBe(path.join(path.dirname(APP_DB()), kopieV5().slice(-1)[0] ?? 'brak'));
        await new Promise((r) => setTimeout(r, 5)); // nowa nazwa kopii (czas w ms)
      }
      const { KOPIE_PRZED_MIGRACJA_NA_WERSJE } = require('../kopie-przed-migracja') as typeof import('../kopie-przed-migracja');
      expect(kopieV5()).toHaveLength(KOPIE_PRZED_MIGRACJA_NA_WERSJE);
      const app = restartApp();
      await app.schema.initDatabase();
      expect(app.status.getStorageState()).toBe('ok');
      const kopie = kopieV5();
      expect(kopie).toHaveLength(KOPIE_PRZED_MIGRACJA_NA_WERSJE);
      const najnowsza = openRaw(path.join(path.dirname(APP_DB()), kopie[1]));
      expect(najnowsza.prepare('PRAGMA user_version').get()).toEqual({ user_version: 5 });
      expect(najnowsza.prepare('SELECT count(*) AS c FROM app_settings WHERE key = ?').get(KLUCZ_SESJI_1014)).toEqual({ c: 1 });
      najnowsza.close();
    } finally {
      przywroc();
    }
  });

  it('P2-2: sprzatnijKopiePrzedMigracja zostawia KOPIE_PRZED_MIGRACJA_NA_WERSJE najnowszych kopii tej wersji, inne wersje i pliki nietknięte; kopiaPrzedMigracja robi kopię i sprząta', async () => {
    const k = require('../kopie-przed-migracja') as typeof import('../kopie-przed-migracja');
    expect(k.KOPIE_PRZED_MIGRACJA_NA_WERSJE).toBe(2);
    const dir = path.dirname(APP_DB());
    fs.mkdirSync(dir, { recursive: true });
    for (const n of ['backup_pre_migration-v5-100.db', 'backup_pre_migration-v5-300.db', 'backup_pre_migration-v5-200.db', 'backup_pre_migration-v2-50.db', 'inny.db', 'backup_pre_migration-v5-400.db-wal']) {
      fs.writeFileSync(path.join(dir, n), 'x');
    }
    const przywroc = prawdziweKopieNaDysku();
    try {
      const nowa = path.join(dir, 'backup_pre_migration-v5-400.db');
      fs.writeFileSync(nowa, 'x');
      expect((await k.sprzatnijKopiePrzedMigracja(nowa, 5)).sort()).toEqual(['backup_pre_migration-v5-100.db', 'backup_pre_migration-v5-200.db']);
      expect(fs.readdirSync(dir).sort()).toEqual(['backup_pre_migration-v2-50.db', 'backup_pre_migration-v5-300.db', 'backup_pre_migration-v5-400.db', 'backup_pre_migration-v5-400.db-wal', 'inny.db']);

      zalozBaze1014(APP_DB(), 'v2-pauza');
      const db = await restartApp().schema.getDb();
      if (!db) throw new Error('brak bazy');
      const kopia = await k.kopiaPrzedMigracja(db, 5);
      const r = openRaw(kopia);
      expect(r.prepare('PRAGMA user_version').get()).toEqual({ user_version: 5 });
      r.close();
      expect(kopieV5()).toEqual(['backup_pre_migration-v5-400.db', path.basename(kopia)].sort());
    } finally {
      przywroc();
    }
  });

  // Zmiana D3a: zapis innego wypieku już nie kasuje cudzych wierszy (P2-3), więc kasowanie bez odczytu sprawdzamy na
  // przerwaniu jednego (deleteBakeSession) zamiast na „zastąpieniu”; drugi trwający zostaje
  it('P2-4: nieczytelny wiersz trwający, którego nikt w tym uruchomieniu nie czytał, trafia do pliku ratunkowego przed skasowaniem (przerwanie jednego i null)', async () => {
    await migruj();
    const wstaw = (id: string, json: string) => {
      const raw = openRaw(APP_DB());
      raw.prepare("INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at) VALUES (?, 'active', ?, 9, 9)").run(id, json);
      raw.close();
    };
    wstaw('zly_1', '{"version": 2, ZEPSUTE_1');
    // Nowy proces: nic nie czytało listy przed zapisem z ekranu
    restartApp();
    await (require('../bake-sessions-store') as typeof import('../bake-sessions-store')).deleteBakeSession('zly_1');
    expect(idSesji()).toEqual(['bake_live']);
    expect(wPlikuUszkodzonych()).toContain('{"version": 2, ZEPSUTE_1');

    wstaw('zly_2', '{"version": 2, ZEPSUTE_2');
    restartApp();
    await (require('../bake-session-store') as typeof import('../bake-session-store')).saveBakeSession(null);
    expect(idSesji()).toEqual([]);
    expect(wPlikuUszkodzonych()).toContain('{"version": 2, ZEPSUTE_2');
  });

  // D3a: koniec wypieku po id (clearSession usunięte, P2-3); nieczytelny kończony wiersz nadal trafia do pliku ratunkowego
  it('P2-4: koniec wypieku (sessionId) zapisuje nieczytelny kończony wiersz do pliku ratunkowego, zanim go skasuje; inny trwający zostaje', async () => {
    await migruj();
    const raw = openRaw(APP_DB());
    raw.prepare("INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at) VALUES ('zly_3', 'active', '{ZEPSUTE_3', 9, 9)").run();
    raw.close();
    const app = restartApp();
    await app.store.finishBake({ id: 'bake_k', recipeName: 'K', startedAt: 1, finishedAt: 2 }, [], { sessionId: 'zly_3' });
    expect(idSesji()).toEqual(['bake_live']);
    expect(wPlikuUszkodzonych()).toContain('{ZEPSUTE_3');
  });

  it('P2-5: stara wartość klucza sesji, która nie jest tekstem (BLOB), trafia do pliku ratunkowego przed migracją i na listę uszkodzonych', async () => {
    zalozBaze1014(APP_DB(), 'v2-pauza');
    const raw = openRaw(APP_DB());
    raw.prepare('UPDATE app_settings SET value = ? WHERE key = ?').run(new Uint8Array([1, 2, 3]), KLUCZ_SESJI_1014);
    raw.close();
    const app = restartApp();
    await app.schema.initDatabase();
    expect(app.status.getStorageState()).toBe('ok');
    const pliki = [...mockFiles.keys()].filter((k) => /kopie-ratunkowe\/sesja-przed-migracja-[^/]+\.json$/.test(k));
    expect(pliki).toHaveLength(1);
    expect(JSON.parse(String(mockFiles.get(pliki[0]))).surowe).toBe('[1,2,3]');
    const { uszkodzoneWiersze } = require('../uszkodzone-wiersze') as typeof import('../uszkodzone-wiersze');
    expect(uszkodzoneWiersze()).toEqual([{ tabela: 'app_settings', id: KLUCZ_SESJI_1014, surowe: '[1,2,3]' }]);
    expect(idSesji()).toEqual([]);
  });

  // Zmienione w D3a, jak zapowiadał ten test przy D1b: ekrany przeszły na sessionId i deleteBakeSession(id), a zapis
  // jednego wypieku nie zastępuje drugiego (P2-3). Pełny zestaw: wypieki-per-id-d3a.sqlite.test.ts.
  it('P2-3 (od D3a): przy dwóch trwających zapis i koniec jednego nie ruszają drugiego', async () => {
    const { app, sesje, pierwsza } = await migruj();
    expect(await sesje.saveActiveBakeSession(inny(pierwsza, 'bake_drugi'))).toEqual({ ok: true });
    const legacy = require('../bake-session-store') as typeof import('../bake-session-store');
    expect((await legacy.loadBakeSession())?.bake?.id).toBe('bake_live'); // najstarszy
    await legacy.saveBakeSession(pierwsza);
    expect(idSesji()).toEqual(['bake_drugi', 'bake_live']);
    await app.store.finishBake({ id: 'bake_x', recipeName: 'X', startedAt: 1, finishedAt: 2 }, [], { sessionId: 'bake_live' });
    expect(idSesji()).toEqual(['bake_drugi']);
  });
});
