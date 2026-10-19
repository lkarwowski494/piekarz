import { restoreTimerState, stepDurationSec, validStepIdx } from '../bake-session';
import { BAKE_STEPS, DUTCH_OVEN_PHASES } from '../baking-phases';

// [M1-audytor-generalny-019] zegar z zapisanych znaczników czasu
describe('bake-session timer restore (019)', () => {
  const base = { stepIdx: 2, dutchOvenPhase: 'lid_on' as const };

  it('stepDurationSec uses the step timer, and the current phase for the Dutch oven step', () => {
    expect(stepDurationSec(2, 'lid_on')).toBe(BAKE_STEPS[2].timerMin * 60);
    const dutch = BAKE_STEPS.findIndex((s) => s.id === 'step_8');
    expect(stepDurationSec(dutch, 'lid_off')).toBe(DUTCH_OVEN_PHASES.lid_off.durationMin * 60);
  });

  it('a running timer resumes with the time left until timerEndsAt', () => {
    expect(restoreTimerState({ ...base, timerEndsAt: 10_000 + 1_740_000, pausedLeftSec: null }, 10_000)).toEqual({
      timeLeftSec: 1740,
      isRunning: true,
      isCompleted: false,
    });
  });

  it('a timer that ended while the app was killed is shown as completed', () => {
    expect(restoreTimerState({ ...base, timerEndsAt: 5_000, pausedLeftSec: null }, 9_000)).toEqual({
      timeLeftSec: 0,
      isRunning: false,
      isCompleted: true,
    });
  });

  it('a paused timer keeps its remaining seconds; no saved value means the full step', () => {
    expect(restoreTimerState({ ...base, timerEndsAt: null, pausedLeftSec: 321 }, 0).timeLeftSec).toBe(321);
    expect(restoreTimerState({ ...base, timerEndsAt: null, pausedLeftSec: null }, 0).timeLeftSec).toBe(BAKE_STEPS[2].timerMin * 60);
  });

  it('validStepIdx accepts only integer indices inside the step list', () => {
    expect(validStepIdx(0)).toBe(0);
    expect(validStepIdx(BAKE_STEPS.length - 1)).toBe(BAKE_STEPS.length - 1);
    expect(validStepIdx(BAKE_STEPS.length)).toBeNull();
    expect(validStepIdx(-1)).toBeNull();
    expect(validStepIdx(1.5)).toBeNull();
    expect(validStepIdx('2')).toBeNull();
  });
});
