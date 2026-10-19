import { restoreTimerState, stepDurationSec, validStepIdx } from '../bake-session';
import { DUTCH_OVEN_PHASES } from '../baking-phases';
import { LEGACY_STEPS_V1 } from '../legacy-steps-v1';

// [M1-audytor-generalny-019] zegar z zapisanych znaczników czasu; kroki z sesji [M1-audytor-generalny-030]
describe('bake-session timer restore (019)', () => {
  const steps = LEGACY_STEPS_V1;
  const base = { steps, stepIdx: 2, dutchOvenPhase: 'lid_on' as const };

  it('stepDurationSec uses the step timer, and the current phase for the Dutch oven step', () => {
    expect(stepDurationSec(steps[2], 'lid_on')).toBe(steps[2].durationMin * 60);
    const dutch = steps.find((s) => s.category === 'bake');
    expect(stepDurationSec(dutch, 'lid_off')).toBe(DUTCH_OVEN_PHASES.lid_off.durationMin * 60);
    expect(stepDurationSec(undefined, 'lid_on')).toBe(0);
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
    expect(restoreTimerState({ ...base, timerEndsAt: null, pausedLeftSec: null }, 0).timeLeftSec).toBe(steps[2].durationMin * 60);
  });

  it('validStepIdx accepts only integer indices inside the session step list', () => {
    expect(validStepIdx(0, steps)).toBe(0);
    expect(validStepIdx(steps.length - 1, steps)).toBe(steps.length - 1);
    expect(validStepIdx(steps.length, steps)).toBeNull();
    expect(validStepIdx(2, steps.slice(0, 2))).toBeNull();
    expect(validStepIdx(-1, steps)).toBeNull();
    expect(validStepIdx(1.5, steps)).toBeNull();
    expect(validStepIdx('2', steps)).toBeNull();
  });
});
