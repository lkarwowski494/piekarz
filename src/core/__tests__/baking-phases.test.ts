import {
  DUTCH_OVEN_PHASES,
  getDutchOvenPhase,
  getNextBakePhase,
  calculateTotalDutchOvenTimeMin,
} from '../baking-phases';

describe('Dutch Oven Two-Phase Baking Physics (core/baking-phases)', () => {
  it('defines Phase 1 (lid on) with 20 min @ 240°C', () => {
    const p1 = getDutchOvenPhase('lid_on');
    expect(p1.phaseNumber).toBe(1);
    expect(p1.durationMin).toBe(20);
    expect(p1.temperatureC).toBe(240);
    expect(p1.namePl).toContain('Pod pokrywką');
  });

  it('defines Phase 2 (lid off) with 25 min @ 210°C and steam alert', () => {
    const p2 = getDutchOvenPhase('lid_off');
    expect(p2.phaseNumber).toBe(2);
    expect(p2.durationMin).toBe(25);
    expect(p2.temperatureC).toBe(210);
    expect(p2.alertHeadlinePl).toContain('Zdejmij pokrywkę');
  });

  it('correctly advances from Phase 1 to Phase 2, and returns null after Phase 2', () => {
    expect(getNextBakePhase('lid_on')).toBe('lid_off');
    expect(getNextBakePhase('lid_off')).toBeNull();
  });

  it('calculates total dutch oven time accurately (45 min total)', () => {
    expect(calculateTotalDutchOvenTimeMin()).toBe(45);
    expect(calculateTotalDutchOvenTimeMin(['lid_on'])).toBe(20);
    expect(calculateTotalDutchOvenTimeMin(['lid_off'])).toBe(25);
  });
});
