/** Zapis trwającego wypieku w bazie i jego parsowanie [M1-audytor-generalny-019]. */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import type { BakeSession } from '../bake-session-store';
import type { ActiveBakeState } from '../sqlite-schema';

const bake: ActiveBakeState = {
  id: 'bake_live',
  recipeName: 'Chleb',
  startedAt: 1,
  currentStageId: 'mix',
  ambientTempC: 22,
  actualDdtC: 25,
  recipeFormula: {
    flours: [{ name: 'Mąka 750', percentage: 100 }],
    waterPercentage: 70,
    saltPercentage: 2,
    starterPercentage: 20,
    targetDoughWeightGrams: 1000,
  },
};
const session: BakeSession = {
  stepIdx: 3,
  dutchOvenPhase: 'lid_on',
  timerEndsAt: 123456,
  pausedLeftSec: null,
  recipeName: 'Chleb',
  startedAt: 1,
  bake,
};

describe('bake-session-store (019)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('saveBakeSession survives a restart; saving null clears it', async () => {
    const first = restartApp();
    await first.schema.initDatabase();
    const store1: typeof import('../bake-session-store') = require('../bake-session-store');
    await store1.saveBakeSession(session);

    const second = restartApp();
    await second.schema.initDatabase();
    const store2: typeof import('../bake-session-store') = require('../bake-session-store');
    expect(await store2.loadBakeSession()).toEqual(session);
    await store2.saveBakeSession(null);
    expect(await store2.loadBakeSession()).toBeNull();
    expect(store2.BAKE_SESSION_KEY).toBe('active_bake_session');
  });

  it('parseBakeSession rejects damaged or out-of-range records instead of guessing', () => {
    const { parseBakeSession } = require('../bake-session-store') as typeof import('../bake-session-store');
    expect(parseBakeSession(JSON.stringify(session))).toEqual(session);
    expect(parseBakeSession(undefined)).toBeNull();
    expect(parseBakeSession('')).toBeNull();
    expect(parseBakeSession('{nie json')).toBeNull();
    expect(parseBakeSession(JSON.stringify({ ...session, stepIdx: 99 }))).toBeNull();
    expect(parseBakeSession(JSON.stringify({ ...session, dutchOvenPhase: 'x' }))).toBeNull();
    expect(parseBakeSession(JSON.stringify({ ...session, timerEndsAt: 'jutro' }))).toBeNull();
    expect(parseBakeSession(JSON.stringify({ ...session, bake: { ...bake, ambientTempC: null } }))).toBeNull();
    expect(parseBakeSession(JSON.stringify({ ...session, bake: null }))).toEqual({ ...session, bake: null });
  });

  it('isActiveBakeState checks nested recipe data', () => {
    const { isActiveBakeState } = require('../bake-session-store') as typeof import('../bake-session-store');
    expect(isActiveBakeState(bake)).toBe(true);
    expect(isActiveBakeState({ ...bake, recipeFormula: { flours: 'x' } })).toBe(false);
    expect(isActiveBakeState({ ...bake, calculatedRecipe: { flours: [] } })).toBe(false);
  });

  it('pickBakeSession: a new bake handed over in memory wins; after a restart the saved one returns', () => {
    const { pickBakeSession } = require('../bake-session-store') as typeof import('../bake-session-store');
    expect(pickBakeSession(null, session)).toBe(session);
    expect(pickBakeSession(bake, session)).toBe(session);
    const fresh = pickBakeSession({ ...bake, id: 'bake_new', recipeName: 'Nowy' }, session);
    expect(fresh).toEqual(expect.objectContaining({ stepIdx: 0, timerEndsAt: null, recipeName: 'Nowy' }));
    expect(pickBakeSession(null, null)).toBeNull();
  });
});
