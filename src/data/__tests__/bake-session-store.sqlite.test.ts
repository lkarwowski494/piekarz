/** Zapis trwającego wypieku w bazie i jego parsowanie [M1-audytor-generalny-019]. */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import type { BakeSession } from '../bake-session-store';
import type { ActiveBakeState } from '../sqlite-schema';
import { LEGACY_STEPS_V1 } from '../../core/legacy-steps-v1';
import { planBakeSteps } from '../../core/bake-steps';
import { RYE_STAGE_TEMPLATES } from '../../core/rye-stages';
import type { DoughRecipeResult } from '../../core/domain-rules';

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
  version: 2,
  steps: LEGACY_STEPS_V1,
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
    // [M1-audytor-generalny-030] przekazany wypiek żytni startuje z etapami roli 06
    const rye = pickBakeSession({ ...bake, id: 'bake_rye', isHighRye: true }, session);
    expect(rye?.steps.map((s) => s.id)).toEqual(RYE_STAGE_TEMPLATES.map((tp) => tp.id));
    expect(pickBakeSession({ ...bake, id: 'bake_rye', isHighRye: true }, null)?.recipeName).toBe(bake.recipeName);
  });

  it('isSessionStep checks every field of a saved step (030)', () => {
    const { isSessionStep } = require('../bake-session-store') as typeof import('../bake-session-store');
    const ok = LEGACY_STEPS_V1[0];
    expect(isSessionStep(ok)).toBe(true);
    expect(isSessionStep({ ...ok, plannedStart: 5, plannedEnd: 10 })).toBe(true);
    expect(isSessionStep({ ...ok, id: '' })).toBe(false);
    expect(isSessionStep({ ...ok, category: 'fold' })).toBe(false);
    expect(isSessionStep({ ...ok, durationMin: 0 })).toBe(false);
    // etap żytni bez odpowiednika w planie: brak czasu to null, nie zgadnięta liczba (030)
    expect(isSessionStep({ ...ok, durationMin: null })).toBe(true);
    expect(isSessionStep({ ...ok, durationMin: 'brak' })).toBe(false);
    expect(isSessionStep({ ...ok, isPassive: 'nie' })).toBe(false);
    expect(isSessionStep({ ...ok, plannedEnd: 'jutro' })).toBe(false);
    expect(isSessionStep(null)).toBe(false);
  });

  it('isHighRyeBake and stepsForBake: Harmonogram snapshot, plan from the bake start, rye stages with plan times (030)', () => {
    const { isHighRyeBake, stepsForBake, isActiveBakeState } = require('../bake-session-store') as typeof import('../bake-session-store');
    const rye: DoughRecipeResult = {
      targetDoughWeightGrams: 1000, baseFlourWeightGrams: 520, flours: [{ name: 'Mąka żytnia 2000', percentage: 100, weightGrams: 520 }],
      waterGrams: 390, saltGrams: 10, starterGrams: 80, starterFlourGrams: 40, starterWaterGrams: 40, yeastGrams: 0,
      totalFlourGrams: 560, totalWaterGrams: 430, overallHydrationPercent: 76.8, sumCheckGrams: 1000, isHighRye: true,
    };
    expect(isHighRyeBake(bake)).toBe(false);
    expect(isHighRyeBake({ ...bake, isHighRye: true })).toBe(true);
    expect(isHighRyeBake({ ...bake, calculatedRecipe: rye })).toBe(true);
    expect(isHighRyeBake({ ...bake, isHighRye: false, calculatedRecipe: rye })).toBe(false);
    expect(stepsForBake({ ...bake, calculatedRecipe: rye })).toEqual(planBakeSteps({ startAt: bake.startedAt, isHighRye: true, ambientTempC: 22 }));
    expect(stepsForBake({ ...bake, isHighRye: true }).map((s) => s.id)).toEqual(RYE_STAGE_TEMPLATES.map((tp) => tp.id));
    // migawka Harmonogramu dla żyta: etapy roli 06 z czasami etapów tej samej kategorii z migawki
    const wheatSnap = stepsForBake(bake);
    const ryeFromSnap = stepsForBake({ ...bake, isHighRye: true, steps: wheatSnap });
    expect(ryeFromSnap.find((s) => s.id === 'rye_shape')?.durationMin).toBe(wheatSnap.find((s) => s.category === 'final_shape')?.durationMin);
    // rozrost w formie: 240 min ze źródła (ZYT-ETA-007), nie garowanie z lodówką z planu pszennego [audyt-niezalezny D-7]
    expect(ryeFromSnap.find((s) => s.id === 'rye_proof')?.durationMin).toBe(240);
    expect(stepsForBake(bake)).toEqual(planBakeSteps({ startAt: bake.startedAt, isHighRye: false, ambientTempC: 22 }));
    const snap = LEGACY_STEPS_V1.slice(0, 2);
    expect(stepsForBake({ ...bake, steps: snap })).toBe(snap);
    expect(isActiveBakeState({ ...bake, steps: snap, isHighRye: false })).toBe(true);
    expect(isActiveBakeState({ ...bake, steps: [] })).toBe(false);
    expect(isActiveBakeState({ ...bake, isHighRye: 'tak' })).toBe(false);
  });
});
