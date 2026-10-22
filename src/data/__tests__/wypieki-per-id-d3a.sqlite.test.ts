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
const idSesji = () => wiersze().map((w) => w.id);

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
    await app.store.finishBake({ id: 'bake_wpis_pizzy', recipeName: 'Pizza', startedAt: 1, finishedAt: 2 }, [], { sessionId: 'bake_pizza' });
    // Spóźniony zapis kroku z ekranu (efekt zapisu po zmianie kroku)
    const wynik = await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 2 });
    expect(wynik).toEqual({ ok: false, error: { kind: 'brak', id: 'bake_pizza' } });
    expect(idSesji()).toEqual(['bake_live']);
  });

  it('wyścig: zapis kroku po przerwaniu wypieku też go nie przywraca; zapis kroku trwającego zmienia tylko jego wiersz', async () => {
    const { sesje, chleb, pizza } = await dwaWypieki();
    expect(await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 3 })).toEqual({ ok: true });
    expect(wiersze().map((w) => [w.id, w.s.stepIdx])).toEqual([['bake_live', chleb.stepIdx], ['bake_pizza', 3]]);
    await sesje.deleteBakeSession('bake_pizza');
    expect(await sesje.zapiszPostepWypieku({ ...pizza, stepIdx: 4 })).toEqual({ ok: false, error: { kind: 'brak', id: 'bake_pizza' } });
    expect(idSesji()).toEqual(['bake_live']);
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
