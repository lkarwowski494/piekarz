// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Unit Tests for Live Activity & Dynamic Island Bridge
// ============================================================================

import {
  buildDutchOvenLiveActivityState,
  buildFoldLiveActivityState,
} from '../live-activity';

describe('ActivityKit Live Activity & Dynamic Island Bridge', () => {
  it('builds phase 1 Dutch Oven steam state with lid on and 240°C target', () => {
    const started = 1000000;
    const now = started + 10 * 60 * 1000; // 10 min into 20 min stage (50%)
    const state = buildDutchOvenLiveActivityState('steam', started, 20, now);

    expect(state.phase).toBe('dutch_oven_steam');
    expect(state.temperatureC).toBe(240);
    expect(state.isLidOn).toBe(true);
    expect(state.progressPercent).toBe(50);
    expect(state.callToActionPl).toContain('pokrywkę');
  });

  it('builds phase 2 Dutch Oven venting state with lid off and 210°C target', () => {
    const started = 1000000;
    const now = started + 25 * 60 * 1000; // Complete 25 min stage (100%)
    const state = buildDutchOvenLiveActivityState('vent', started, 25, now);

    expect(state.phase).toBe('dutch_oven_vent');
    expect(state.temperatureC).toBe(210);
    expect(state.isLidOn).toBe(false);
    expect(state.progressPercent).toBe(100);
  });

  it('builds coil fold Live Activity state with fold counter and progress', () => {
    const started = 2000000;
    const now = started + 15 * 60 * 1000; // 15 min into 30 min fold interval (50%)
    const state = buildFoldLiveActivityState(2, 3, started, 30, now);

    expect(state.phase).toBe('bulk_fold');
    expect(state.stageNamePl).toBe('Składanie ciasta (2/3)');
    expect(state.stageNameEn).toBe('Coil Fold (2/3)');
    expect(state.progressPercent).toBe(50);
  });
});
