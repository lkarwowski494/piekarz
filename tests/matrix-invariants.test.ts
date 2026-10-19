// ============================================================================
// Piekarz (Crust) — Stateful Sequence Invariant Verification (BR-TEST-006..010)
// fast-check z gwarantowanym krokiem otwierającym i assertStateInvariants(state).
// ============================================================================

import * as fc from 'fast-check';
import { calculateDoughRecipe, DoughRecipeResult } from '../src/core/domain-rules';
import { StoredRecipe } from '../src/data/db';

export interface AppBakeState {
  currentRecipe: StoredRecipe;
  activeBatch: DoughRecipeResult | null;
  stageIndex: number;
  timerSecondsRemaining: number;
  startersCount: number;
  completedBakes: number;
}

/**
 * assertStateInvariants(state) — Inwarianty integralności stanu piekarza
 */
export function assertStateInvariants(state: AppBakeState): void {
  // 1. Gwarancja istnienia co najmniej jednego zakwasu w pamięci
  expect(state.startersCount).toBeGreaterThanOrEqual(1);

  // 2. Licznik ukończonych wypieków jest nieujemny
  expect(state.completedBakes).toBeGreaterThanOrEqual(0);

  // 3. Pozycja etapu na stolnicy mieści się w dozwolonym zakresie (0 do 7)
  expect(state.stageIndex).toBeGreaterThanOrEqual(0);
  expect(state.stageIndex).toBeLessThanOrEqual(7);

  // 4. Timer nigdy nie ma ujemnych sekund
  expect(state.timerSecondsRemaining).toBeGreaterThanOrEqual(0);

  // 5. Jeśli ciasto jest aktywne na stolnicy — inwarianty bilansu masy i procentu piekarskiego
  if (state.activeBatch !== null) {
    const batch = state.activeBatch;
    expect(batch.targetDoughWeightGrams).toBeGreaterThan(0);
    expect(batch.baseFlourWeightGrams).toBeGreaterThan(0);
    expect(batch.waterGrams).toBeGreaterThan(0);
    expect(batch.starterGrams).toBeGreaterThan(0);
    expect(Math.abs(batch.totalFlourGrams - (batch.baseFlourWeightGrams + batch.starterFlourGrams))).toBeLessThanOrEqual(1);
    expect(Math.abs(batch.totalWaterGrams - (batch.waterGrams + batch.starterWaterGrams))).toBeLessThanOrEqual(1);
    // ≤ 1 g: DEC-11 (a), bloker BRD C4a nr 1 [M1-audytor-generalny-040]
    expect(Math.abs(batch.sumCheckGrams - batch.targetDoughWeightGrams)).toBeLessThanOrEqual(1);
  }
}

describe('Stateful Random Sequence Property Verification (BR-TEST-006..010)', () => {
  // Gwarantowany krok otwierający (Opening Step)
  const createInitialState = (): AppBakeState => ({
    currentRecipe: {
      id: 'r_master_boule',
      name: 'Pain de Campagne',
      formula: {
        flours: [
          { name: 'Mąka pszenna chlebowa', percentage: 80 },
          { name: 'Mąka żytnia typ 720', percentage: 20 },
        ],
        waterPercentage: 70,
        saltPercentage: 2.0,
        starterPercentage: 20,
        starterHydration: 100,
        targetDoughWeightGrams: 850,
      },
      targetDDT: 24,
      isBuiltIn: true,
      createdAt: Date.now(),
    },
    activeBatch: null,
    stageIndex: 0,
    timerSecondsRemaining: 0,
    startersCount: 1, // Stefan
    completedBakes: 0,
  });

  type Action =
    | { type: 'START_BAKE'; targetWeight: number; hydration: number; starterPct: number }
    | { type: 'ADVANCE_STAGE' }
    | { type: 'SET_TIMER'; seconds: number }
    | { type: 'TICK_TIMER'; deltaSeconds: number }
    | { type: 'FINISH_BAKE' }
    | { type: 'ADD_STARTER' }
    | { type: 'DELETE_STARTER' }
    | { type: 'RESCALE_DOUGH'; newWeight: number };

  const actionArb: fc.Arbitrary<Action> = fc.oneof(
    fc.record({
      targetWeight: fc.integer({ min: 300, max: 4000 }),
      hydration: fc.integer({ min: 60, max: 85 }),
      starterPct: fc.integer({ min: 10, max: 30 }),
    }).map((d): Action => ({ type: 'START_BAKE', ...d })),
    fc.constant<Action>({ type: 'ADVANCE_STAGE' }),
    fc.integer({ min: 60, max: 7200 }).map((seconds): Action => ({ type: 'SET_TIMER', seconds })),
    fc.integer({ min: 10, max: 10000 }).map((deltaSeconds): Action => ({ type: 'TICK_TIMER', deltaSeconds })),
    fc.constant<Action>({ type: 'FINISH_BAKE' }),
    fc.constant<Action>({ type: 'ADD_STARTER' }),
    fc.constant<Action>({ type: 'DELETE_STARTER' }),
    fc.integer({ min: 400, max: 5000 }).map((newWeight): Action => ({ type: 'RESCALE_DOUGH', newWeight }))
  );

  it('maintains all application state invariants over 500 randomized multi-step action sequences', () => {
    fc.assert(
      fc.property(
        fc.array(actionArb, { minLength: 1, maxLength: 40 }),
        (cmds) => {
          // Gwarantowany krok otwierający
          let state = createInitialState();
          assertStateInvariants(state);

          for (const act of cmds) {
            switch (act.type) {
              case 'START_BAKE': {
                const batch = calculateDoughRecipe({
                  targetDoughWeightGrams: act.targetWeight,
                  flours: state.currentRecipe.formula.flours,
                  waterPercentage: act.hydration,
                  saltPercentage: state.currentRecipe.formula.saltPercentage,
                  starterPercentage: act.starterPct,
                  starterHydration: state.currentRecipe.formula.starterHydration ?? 100,
                  extraYeastPercentage: 0,
                });
                state.activeBatch = batch;
                state.stageIndex = 1;
                state.timerSecondsRemaining = 1800; // 30 min autolyse
                break;
              }
              case 'ADVANCE_STAGE': {
                if (state.activeBatch !== null) {
                  state.stageIndex = Math.min(state.stageIndex + 1, 7);
                  state.timerSecondsRemaining = 1200;
                }
                break;
              }
              case 'SET_TIMER': {
                state.timerSecondsRemaining = act.seconds;
                break;
              }
              case 'TICK_TIMER': {
                state.timerSecondsRemaining = Math.max(0, state.timerSecondsRemaining - act.deltaSeconds);
                break;
              }
              case 'FINISH_BAKE': {
                if (state.activeBatch !== null) {
                  state.completedBakes += 1;
                  state.activeBatch = null;
                  state.stageIndex = 0;
                  state.timerSecondsRemaining = 0;
                }
                break;
              }
              case 'ADD_STARTER': {
                state.startersCount += 1;
                break;
              }
              case 'DELETE_STARTER': {
                if (state.startersCount > 1) {
                  state.startersCount -= 1;
                }
                break;
              }
              case 'RESCALE_DOUGH': {
                if (state.activeBatch !== null) {
                  state.activeBatch = calculateDoughRecipe({
                    targetDoughWeightGrams: act.newWeight,
                    flours: state.currentRecipe.formula.flours,
                    waterPercentage: state.activeBatch.overallHydrationPercent,
                    saltPercentage: 2.0,
                    starterPercentage: 20,
                    starterHydration: 100,
                    extraYeastPercentage: 0,
                  });
                }
                break;
              }
            }

            // Inwarianty sprawdzane po KAŻDYM pojedynczym kroku!
            assertStateInvariants(state);
          }
        }
      ),
      { numRuns: 500 }
    );
  });
});
