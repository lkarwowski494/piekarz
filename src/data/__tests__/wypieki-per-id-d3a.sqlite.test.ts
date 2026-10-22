/**
 * D3a: warstwa danych wielu wypieków per id (przegląd danych D1, P2-3 i wyścig zapisu kroku po końcu wypieku) na kopii
 * bazy buildu 1014 po migracji v6 [M3 D3a]. Zapis kroku, koniec i przerwanie dotyczą jednego wiersza; drugi trwający
 * wypiek zostaje nietknięty, a zapis kroku po końcu wypieku nie przywraca go jako trwającego.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1014 } from './helpers/baza-1014';
import type { BakeSession } from '../bake-session-store';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const wiersze = () => {
  const raw = openRaw(APP_DB());
  const r = raw.prepare('SELECT id, session_json FROM bake_sessions ORDER BY id').all() as Array<{ id: string; session_json: string }>;
  raw.close();
  return r.map((w) => ({ id: w.id, s: JSON.parse(w.session_json) as BakeSession }));
};
const idSesji = () => {
  const raw = openRaw(APP_DB());
  const r = (raw.prepare('SELECT id FROM bake_sessions ORDER BY id').all() as Array<{ id: string }>).map((w) => w.id);
  raw.close();
  return r;
};
/** Wersja wiersza (updated_at) prosto z bazy. */
const wersja = (id: string): number => {
  const raw = openRaw(APP_DB());
  const r = raw.prepare('SELECT updated_at AS u FROM bake_sessions WHERE id = ?').get(id) as { u: number } | undefined;
  raw.close();
  return r?.u ?? -1;
};

async function dwaWypieki() {
  zalozBaze1014(APP_DB(), 'v2-pauza');
  const app = restartApp();
  await app.schema.initDatabase();
  expect(app.status.getStorageState()).toBe('ok');
  const sesje = require('../bake-sessions-store') as typeof import('../bake-sessions-store');
  const [chleb] = await sesje.loadActiveBakeSessions();
  const pizza: BakeSession = {
    ...chleb,
    recipeName: 'Pizza',
    stepIdx: 1,
    timerEndsAt: 1_800_000_900_000,
    pausedLeftSec: null,
    bake: chleb.bake ? { ...chleb.bake, id: 'bake_pizza', recipeName: 'Pizza' } : null,
  };
  expect(await sesje.saveActiveBakeSession(pizza)).toEqual({ ok: true });
  expect(idSesji()).toEqual(['bake_live', 'bake_pizza']);
  return { app, sesje, chleb, pizza };
}

describe('D3a: wiele wypieków per id w warstwie danych', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('BR-KAL-016 Koniec jednego: koniec pizzy (sessionId) zapisuje wpis i kasuje tylko jej wiersz; chleb na tym samym kroku z tym samym zegarem', async () => {
    const { app, chleb } = await dwaWypieki();
    const przed = wiersze().find((w) => w.id === 'bake_live')?.s;
    await app.store.finishBake({ id: 'bake_wpis_pizzy', recipeName: 'Pizza', startedAt: 1, finishedAt: 2, ratingStars: 4 }, [], { sessionId: 'bake_pizza' });
    expect(idSesji()).toEqual(['bake_live']);
    const po = wiersze()[0].s;
    expect(po).toEqual(przed);
    expect({ stepIdx: po.stepIdx, timerEndsAt: po.timerEndsAt, pausedLeftSec: po.pausedLeftSec }).toEqual({
      stepIdx: chleb.stepIdx,
      timerEndsAt: chleb.timerEndsAt,
      pausedLeftSec: chleb.pausedLeftSec,
    });
    expect((await app.store.getBakeLogs()).map((b) => b.id)).toContain('bake_wpis_pizzy');
  });

  it('wyścig: zapis kroku po końcu wypieku nie przywraca go jako trwającego (wiersz musi istnieć)', async () => {
    const { app, sesje, pizza } = await dwaWypieki();
    // Spóźniony zapis kroku z ekranu (efekt zapisu po zmianie kroku); D3a-fix: zapis z wersją odczytu
    const w = wersja('bake_pizza');
    await app.store.finishBake({ id: 'bake_wpis_pizzy', recipeName: 'Pizza', startedAt: 1, finishedAt: 2 }, [], { sessionId: 'bake_pizza' });
    const wynik = await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 2 }, w);
    expect(wynik).toEqual({ ok: false, error: { kind: 'brak', id: 'bake_pizza' } });
    expect(idSesji()).toEqual(['bake_live']);
  });

  it('wyścig: zapis kroku po przerwaniu wypieku też go nie przywraca; zapis kroku trwającego zmienia tylko jego wiersz', async () => {
    const { sesje, chleb, pizza } = await dwaWypieki();
    const w = await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 3 }, wersja('bake_pizza'));
    expect(w).toEqual({ ok: true, wersja: wersja('bake_pizza') });
    expect(wiersze().map((x) => [x.id, x.s.stepIdx])).toEqual([['bake_live', chleb.stepIdx], ['bake_pizza', 3]]);
    await sesje.deleteBakeSession('bake_pizza');
    expect(await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 4 }, w.ok ? w.wersja : 0)).toEqual({ ok: false, error: { kind: 'brak', id: 'bake_pizza' } });
    expect(idSesji()).toEqual(['bake_live']);
  });

  it('P1-1 obrona danych: zapis kroku ze starszego stanu (druga instancja ekranu) nie cofa postępu', async () => {
    const { sesje, pizza } = await dwaWypieki();
    const odczyt = wersja('bake_pizza'); // obie instancje przeczytały ten sam stan
    const gora: import('../bake-sessions-store').ZapisWersji = await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 3 }, odczyt);
    expect(gora.ok).toBe(true);
    const dol = await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 2 }, odczyt);
    expect(dol).toEqual({ ok: false, error: { kind: 'nieaktualny', id: 'bake_pizza' } });
    expect(wiersze().find((x) => x.id === 'bake_pizza')?.s.stepIdx).toBe(3);
    // Wersja rośnie przy każdym zapisie, także w tej samej milisekundzie
    const w2 = await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 4 }, gora.ok ? gora.wersja : 0);
    const w3 = await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 5 }, w2.ok ? w2.wersja : 0);
    expect(w3.ok && w2.ok && w3.wersja > w2.wersja).toBe(true);
    const lista = await sesje.loadActiveBakeSessionsZWersja();
    expect(lista.map((x) => [x.sesja.bake?.id, x.wersja])).toEqual([['bake_live', wersja('bake_live')], ['bake_pizza', wersja('bake_pizza')]]);
  });

  it('P2-1: utworzenie wypieku, którego wiersz już jest (np. nieczytelny przy odczycie), niczego nie nadpisuje', async () => {
    const { sesje, pizza } = await dwaWypieki();
    await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 4 }, wersja('bake_pizza'));
    const przed = wiersze();
    expect(await sesje.utworzWypiek({ ...pizza, stepIdx: 0 })).toEqual({ ok: false, error: { kind: 'istnieje', id: 'bake_pizza' } });
    expect(wiersze()).toEqual(przed);
  });

  it('P2-2: limit 2 trwających przy utworzeniu; wiersz z nieczytelnym JSON-em nie liczy się do limitu', async () => {
    const { sesje, pizza } = await dwaWypieki();
    const trzeci = (id: string): BakeSession => ({ ...pizza, bake: pizza.bake ? { ...pizza.bake, id } : null });
    expect(await sesje.utworzWypiek(trzeci('bake_trzeci'))).toEqual({ ok: false, error: { kind: 'limit', status: 'active', max: 2 } });
    const raw = openRaw(APP_DB());
    raw.prepare("UPDATE bake_sessions SET session_json = '{ZEPSUTE' WHERE id = 'bake_live'").run();
    raw.close();
    const r = await sesje.utworzWypiek(trzeci('bake_trzeci'));
    expect(r).toEqual({ ok: true, wersja: wersja('bake_trzeci') });
    expect(idSesji()).toEqual(['bake_live', 'bake_pizza', 'bake_trzeci']);
  });

  it('P1-1 obrona danych: drugi koniec tego samego wypieku (druga instancja) nie zapisuje drugiego wpisu ani nie odlicza mąki drugi raz', async () => {
    const { app } = await dwaWypieki();
    await app.store.saveFlourInventoryItem({ id: 'flour_d3a', name: 'Mąka pszenna 750', stockGrams: 1000, updatedAt: 1 });
    const maka = [{ name: 'Mąka pszenna 750', weightGrams: 300 }];
    expect(await app.store.finishBake({ id: 'wpis_1', recipeName: 'Pizza', startedAt: 1, finishedAt: 2 }, maka, { sessionId: 'bake_pizza', wymagajSesji: true })).toBe('zapisano');
    expect(await app.store.finishBake({ id: 'wpis_2', recipeName: 'Pizza', startedAt: 1, finishedAt: 3 }, maka, { sessionId: 'bake_pizza', wymagajSesji: true })).toBe('nie-trwa');
    const ids = (await app.store.getBakeLogs()).map((b) => b.id);
    expect(ids).toContain('wpis_1');
    expect(ids).not.toContain('wpis_2');
    expect((await app.store.getFlourInventory()).find((f) => f.id === 'flour_d3a')?.stockGrams).toBe(700);
    // Bez wymagania sesji (wypiek, którego pierwszy zapis się nie udał) koniec zapisuje wpis jak dotąd
    expect(await app.store.finishBake({ id: 'wpis_3', recipeName: 'X', startedAt: 1, finishedAt: 4 }, [], { sessionId: 'bake_niezapisany' })).toBe('zapisano');
  });

  it('P2-3: saveBakeSession (zapis jednego wypieku, testy i dane przykładowe) przy dwóch trwających nie kasuje drugiego', async () => {
    const { chleb } = await dwaWypieki();
    const legacy = require('../bake-session-store') as typeof import('../bake-session-store');
    await legacy.saveBakeSession({ ...chleb, stepIdx: 2 });
    expect(wiersze().map((w) => [w.id, w.s.stepIdx])).toEqual([['bake_live', 2], ['bake_pizza', 1]]);
  });

  it('przerwanie jednego (deleteBakeSession) nieczytelny wiersz zapisuje do pliku ratunkowego przed skasowaniem, inne zostają', async () => {
    const { sesje } = await dwaWypieki();
    const raw = openRaw(APP_DB());
    raw.prepare("UPDATE bake_sessions SET session_json = '{ZEPSUTE_PIZZA' WHERE id = 'bake_pizza'").run();
    raw.close();
    restartApp();
    await (require('../bake-sessions-store') as typeof sesje).deleteBakeSession('bake_pizza');
    expect(idSesji()).toEqual(['bake_live']);
    const surowe = [...mockFiles.entries()]
      .filter(([k]) => /kopie-ratunkowe\/uszkodzone-wiersze-[^/]+\.json$/.test(k))
      .flatMap(([, v]) => (JSON.parse(String(v)).wiersze as Array<{ surowe: string }>).map((w) => w.surowe));
    expect(surowe).toContain('{ZEPSUTE_PIZZA');
  });

  it('koniec wypieku bez sessionId nie kasuje żadnej sesji (bez „wszystkich trwających”)', async () => {
    const { app } = await dwaWypieki();
    await app.store.finishBake({ id: 'bake_bez_sesji', recipeName: 'X', startedAt: 1, finishedAt: 2 }, []);
    expect(idSesji()).toEqual(['bake_live', 'bake_pizza']);
  });
});

describe('D3a: ekrany nie używają API jednej sesji (P2-3)', () => {
  const root = path.join(__dirname, '..', '..', '..');
  const pliki = (dir: string): string[] =>
    fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return e.name === '__tests__' ? [] : pliki(p);
      return /\.tsx?$/.test(e.name) ? [p] : [];
    });

  it('app/ i src/ (poza testami i warstwą sesji) nie wołają loadBakeSession/saveBakeSession ani finishBake z clearSession', () => {
    const zle = [...pliki('app'), ...pliki('src')]
      .filter((p) => !/bake-sessions?-store\.ts$/.test(p))
      .filter((p) => /\b(loadBakeSession|saveBakeSession)\b|clearSession/.test(fs.readFileSync(path.join(root, p), 'utf8')));
    expect(zle).toEqual([]);
  });
});
