/**
 * D5: zaplanowane wypieki w warstwie danych na prawdziwym SQLite (node:sqlite) [M3 D5; BR-KAL-009, D-108]. Plan niesie
 * dane wypieku (`bake`, pole opcjonalne w JSON-ie wiersza, bez zmiany schematu); start planu zamienia JEDEN wiersz
 * `planned` w `active` jedną instrukcją z limitem trwających (2), więc drugi plan zostaje, a przy limicie nic się nie
 * zmienia. Plan bez wiersza (usunięty) daje `brak`, nie tworzy wypieku.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath } from './helpers/node-sqlite-adapter';
import type { BakeSession } from '../bake-session-store';
import type { PlannedBake } from '../bake-sessions-store';
import type { SessionStep } from '../../core/bake-steps';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const H = 3_600_000;
const T0 = 1_800_000_000_000;

const wiersze = () => {
  const raw = openRaw(APP_DB());
  const r = raw.prepare('SELECT id, status, session_json, updated_at FROM bake_sessions ORDER BY id').all() as Array<{ id: string; status: string; session_json: string; updated_at: number }>;
  raw.close();
  return r;
};

const krok = (id: string, start: number, min: number, isPassive = false): SessionStep => ({
  id, name: id, category: 'mix', durationMin: min, isPassive, instructions: '', plannedStart: start, plannedEnd: start + min * 60_000,
});
function plan(id: string, nazwa: string, start: number): PlannedBake {
  const steps = [krok('mix', start, 30), krok('bake', start + 5 * H, 45)];
  return {
    version: 1, id, recipeName: nazwa, plannedStartAt: start, steps,
    bake: { id, recipeName: nazwa, startedAt: start, currentStageId: 'mix', steps, starterId: 'z', zaczetyZDostepem: true },
  };
}
function sesja(p: PlannedBake, teraz: number): BakeSession {
  return { version: 2, steps: [...p.steps], stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: null, pausedLeftSec: null, recipeName: p.recipeName, startedAt: teraz, bake: { ...(p.bake ?? { id: p.id, recipeName: p.recipeName, startedAt: teraz, currentStageId: 'mix' }), startedAt: teraz } };
}

async function swiezaBaza() {
  const app = restartApp();
  await app.schema.initDatabase();
  expect(app.status.getStorageState()).toBe('ok');
  return require('../bake-sessions-store') as typeof import('../bake-sessions-store');
}

describe('D5: plany w bake_sessions', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('BR-KAL-009 Dwa plany: plan z danymi wypieku wraca z bazy bez zmian; start jednego nie usuwa drugiego', async () => {
    const api = await swiezaBaza();
    const sob = plan('plan_sob', 'Chleb', T0 + 48 * H);
    const pt = plan('plan_pt', 'Pizza', T0 + 24 * H);
    expect(await api.savePlannedBake(sob)).toEqual({ ok: true });
    expect(await api.savePlannedBake(pt)).toEqual({ ok: true });
    // Kolejność: planowany start rosnąco, potem id (nie czas zapisu; ten bywa równy co do ms) [M3 TZ Matrix]
    expect(await api.loadPlannedBakes()).toEqual([pt, sob]);

    const teraz = T0 + 48 * H + 60_000;
    const r = await api.zacznijZaplanowany(sesja(sob, teraz));
    expect(r.ok).toBe(true);
    expect(wiersze().map((w) => [w.id, w.status])).toEqual([['plan_pt', 'planned'], ['plan_sob', 'active']]);
    const [trwa] = await api.loadActiveBakeSessionsZWersja();
    expect(trwa.sesja.bake?.id).toBe('plan_sob');
    expect(trwa.sesja.bake?.starterId).toBe('z');
    expect(r.ok && r.wersja).toBe(trwa.wersja);
    expect((await api.loadPlannedBakes()).map((p) => p.id)).toEqual(['plan_pt']);
  });

  it('BR-KAL-009 Kolejność planów to planowany start, potem id, także gdy zapisano je w tej samej milisekundzie', async () => {
    const api = await swiezaBaza();
    const spy = jest.spyOn(Date, 'now').mockReturnValue(T0);
    try {
      await api.savePlannedBake(plan('plan_a', 'Późny', T0 + 48 * H));
      await api.savePlannedBake(plan('plan_b', 'Wczesny', T0 + 24 * H));
      await api.savePlannedBake(plan('plan_c', 'Wczesny drugi', T0 + 24 * H));
    } finally {
      spy.mockRestore();
    }
    expect((await api.loadPlannedBakes()).map((p) => p.id)).toEqual(['plan_b', 'plan_c', 'plan_a']);
  });

  it('BR-KAL-009 start przy 2 trwających: limit, plan zostaje zaplanowany, trwające bez zmian', async () => {
    const api = await swiezaBaza();
    const sob = plan('plan_sob', 'Chleb', T0);
    await api.savePlannedBake(sob);
    for (const id of ['a', 'b']) {
      expect(await api.saveActiveBakeSession({ ...sesja(plan(id, id, T0), T0), bake: { id, recipeName: id, startedAt: T0, currentStageId: 'mix' } })).toEqual({ ok: true });
    }
    const przed = wiersze();
    expect(await api.zacznijZaplanowany(sesja(sob, T0 + H))).toEqual({ ok: false, error: { kind: 'limit', status: 'active', max: 2 } });
    expect(wiersze()).toEqual(przed);
  });

  it('start usuniętego planu: `brak`, nic nie powstaje (plan nie wraca jako trwający)', async () => {
    const api = await swiezaBaza();
    const sob = plan('plan_sob', 'Chleb', T0);
    await api.savePlannedBake(sob);
    await api.deleteBakeSession('plan_sob');
    expect(await api.zacznijZaplanowany(sesja(sob, T0))).toEqual({ ok: false, error: { kind: 'brak', id: 'plan_sob' } });
    expect(wiersze()).toEqual([]);
  });

  it('plan z danymi wypieku o innym id albo zepsutymi jest nieczytelny (null), nie zgadnięty', async () => {
    const api = await swiezaBaza();
    const sob = plan('plan_sob', 'Chleb', T0);
    expect(api.parsePlannedBake(JSON.stringify(sob))).toEqual(sob);
    expect(api.parsePlannedBake(JSON.stringify({ ...sob, bake: { ...sob.bake, id: 'inny' } }))).toBeNull();
    expect(api.parsePlannedBake(JSON.stringify({ ...sob, bake: { id: 'plan_sob' } }))).toBeNull();
    // plan bez danych wypieku (zapis D1) czyta się jak dotąd
    const { bake: _b, ...bezDanych } = sob;
    expect(api.parsePlannedBake(JSON.stringify(bezDanych))).toEqual(bezDanych);
  });
});
