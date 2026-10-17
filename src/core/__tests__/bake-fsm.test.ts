// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Unit Tests for Finite State Machine (FSM) Bake Lifecycle (ADR-004)
// ============================================================================

import {
  bakeTransition,
  BakeTransitionError,
  INITIAL_BAKE_STATE,
  isBakeActive,
  PHASE_DEFAULT_DURATIONS_MIN,
  PHASE_METADATA_PL,
  BakeFSMContext,
} from '../bake-fsm';
import { BakePhase } from '../domain/types';

describe('Bake FSM (ADR-004 Deterministyczna Maszyna Stanów Wypieku)', () => {
  it('has valid metadata and default durations for all 13 phases', () => {
    const allPhases: BakePhase[] = [
      'IDLE',
      'AUTOLYSE',
      'MIXING_BASSINAGE',
      'BULK_FERMENTATION',
      'PRE_SHAPE',
      'BENCH_REST',
      'FINAL_SHAPE',
      'COLD_RETARD',
      'SCORING',
      'BAKING_STEAM',
      'BAKING_VENT',
      'COOLING',
      'COMPLETED',
    ];

    for (const phase of allPhases) {
      expect(PHASE_METADATA_PL[phase]).toBeDefined();
      expect(PHASE_METADATA_PL[phase].name.length).toBeGreaterThan(0);
      expect(PHASE_DEFAULT_DURATIONS_MIN[phase]).toBeDefined();
    }
  });

  it('runs the complete 12-stage bread baking cycle to completion', () => {
    let state: BakeFSMContext = { ...INITIAL_BAKE_STATE };
    expect(state.phase).toBe('IDLE');
    expect(isBakeActive(state.phase)).toBe(false);

    const now = 1700000000000;

    // 1. START_BAKE -> AUTOLYSE
    state = bakeTransition(
      state,
      { type: 'START_BAKE', recipeId: 'rec_sourdough', ddt: 26, ambientTemp: 23 },
      now
    );
    expect(state.phase).toBe('AUTOLYSE');
    expect(state.recipeId).toBe('rec_sourdough');
    expect(state.ddt).toBe(26);
    expect(state.stepTargetDurationMin).toBe(45);
    expect(isBakeActive(state.phase)).toBe(true);

    // 2. AUTOLYSE -> MIXING_BASSINAGE
    state = bakeTransition(state, { type: 'NEXT_STEP' }, now + 45 * 60000);
    expect(state.phase).toBe('MIXING_BASSINAGE');
    expect(state.stepTargetDurationMin).toBe(15);

    // 3. MIXING_BASSINAGE -> BULK_FERMENTATION
    state = bakeTransition(state, { type: 'NEXT_STEP' }, now + 60 * 60000);
    expect(state.phase).toBe('BULK_FERMENTATION');
    expect(state.foldIndex).toBe(0);

    // Fold 1..3
    state = bakeTransition(state, { type: 'RECORD_FOLD', foldIndex: 1 }, now + 90 * 60000);
    expect(state.foldIndex).toBe(1);
    state = bakeTransition(state, { type: 'RECORD_FOLD', foldIndex: 2 }, now + 120 * 60000);
    expect(state.foldIndex).toBe(2);
    state = bakeTransition(state, { type: 'RECORD_FOLD', foldIndex: 3 }, now + 150 * 60000);
    expect(state.foldIndex).toBe(3);

    // 4. BULK_FERMENTATION -> PRE_SHAPE
    state = bakeTransition(state, { type: 'NEXT_STEP' }, now + 240 * 60000);
    expect(state.phase).toBe('PRE_SHAPE');
    expect(state.stepTargetDurationMin).toBe(15);

    // 5. PRE_SHAPE -> BENCH_REST
    state = bakeTransition(state, { type: 'NEXT_STEP' });
    expect(state.phase).toBe('BENCH_REST');
    expect(state.stepTargetDurationMin).toBe(20);

    // 6. BENCH_REST -> FINAL_SHAPE
    state = bakeTransition(state, { type: 'NEXT_STEP' });
    expect(state.phase).toBe('FINAL_SHAPE');
    expect(state.stepTargetDurationMin).toBe(15);

    // 7. FINAL_SHAPE -> COLD_RETARD
    state = bakeTransition(state, { type: 'NEXT_STEP' });
    expect(state.phase).toBe('COLD_RETARD');
    expect(state.stepTargetDurationMin).toBe(720);

    // 8. COLD_RETARD -> SCORING
    state = bakeTransition(state, { type: 'NEXT_STEP' });
    expect(state.phase).toBe('SCORING');
    expect(state.stepTargetDurationMin).toBe(5);

    // 9. SCORING -> BAKING_STEAM
    state = bakeTransition(state, { type: 'NEXT_STEP' });
    expect(state.phase).toBe('BAKING_STEAM');
    expect(state.stepTargetDurationMin).toBe(20);

    // 10. BAKING_STEAM -> BAKING_VENT via DUTCH_OVEN_LID_OFF
    state = bakeTransition(state, { type: 'DUTCH_OVEN_LID_OFF' });
    expect(state.phase).toBe('BAKING_VENT');
    expect(state.stepTargetDurationMin).toBe(25);

    // 11. BAKING_VENT -> COOLING
    state = bakeTransition(state, { type: 'NEXT_STEP' });
    expect(state.phase).toBe('COOLING');
    expect(state.stepTargetDurationMin).toBe(120);

    // 12. COOLING -> COMPLETED via FINISH_BAKE
    state = bakeTransition(state, {
      type: 'FINISH_BAKE',
      crumbScore: 5,
      crustScore: 4,
      taste: 'tangy_lactic',
      notes: 'Doskonałe otwarcie ucha i elastyczny miękisz.',
    });
    expect(state.phase).toBe('COMPLETED');
    expect(state.evaluation?.crumbScore).toBe(5);
    expect(state.evaluation?.taste).toBe('tangy_lactic');
    expect(isBakeActive(state.phase)).toBe(false);

    // Reset from COMPLETED -> IDLE
    state = bakeTransition(state, { type: 'NEXT_STEP' });
    expect(state.phase).toBe('IDLE');
  });

  it('allows aborting bake from any active stage back to IDLE', () => {
    let state: BakeFSMContext = {
      phase: 'BULK_FERMENTATION',
      recipeId: 'rec_country',
      foldIndex: 2,
      startedAt: 1000,
    };

    state = bakeTransition(state, { type: 'ABORT_BAKE' });
    expect(state.phase).toBe('IDLE');
    expect(state.foldIndex).toBe(0);
    expect(state.recipeId).toBeUndefined();
  });

  it('throws BakeTransitionError when attempting illegal transitions', () => {
    const idleState: BakeFSMContext = { phase: 'IDLE', foldIndex: 0 };

    // Cannot NEXT_STEP when IDLE
    expect(() => bakeTransition(idleState, { type: 'NEXT_STEP' })).toThrow(
      BakeTransitionError
    );

    // Cannot DUTCH_OVEN_LID_OFF when in AUTOLYSE
    const autolyseState: BakeFSMContext = { phase: 'AUTOLYSE', foldIndex: 0 };
    expect(() =>
      bakeTransition(autolyseState, { type: 'DUTCH_OVEN_LID_OFF' })
    ).toThrow(BakeTransitionError);

    // Cannot START_BAKE when already baking
    expect(() =>
      bakeTransition(autolyseState, {
        type: 'START_BAKE',
        recipeId: 'xyz',
        ddt: 25,
        ambientTemp: 22,
      })
    ).toThrow(BakeTransitionError);
  });
});
