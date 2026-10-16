import fc from 'fast-check';
import {
  predictStarterPeak,
  PeakPredictionInput,
} from '../starter-peak-predictor';

describe('Sourdough Metabolic Peak Predictor (core/starter-peak-predictor)', () => {
  const baseFedAt = new Date('2026-10-16T08:00:00Z').getTime();

  it('calculates expected peak window for baseline rye starter (1:2:2 @ 22°C)', () => {
    const now = baseFedAt + 2 * 3600 * 1000; // 2 hours later
    const result = predictStarterPeak({
      lastFedAt: baseFedAt,
      currentTempC: 22,
      ratio: [1, 2, 2],
      flourGrain: 'rye',
      now,
    });

    // Baseline rye 1:2:2 @ 22°C: ~5.3h - 7.5h
    expect(result.estimatedPeakHoursMin).toBeGreaterThanOrEqual(4.5);
    expect(result.estimatedPeakHoursMin).toBeLessThanOrEqual(6.0);
    expect(result.estimatedPeakHoursMax).toBeGreaterThan(result.estimatedPeakHoursMin);
    expect(result.isCurrentlyInPeak).toBe(false);
    expect(result.hasPassedPeak).toBe(false);
    expect(result.progressPercent).toBeGreaterThan(20);
    expect(result.progressPercent).toBeLessThan(60);
  });

  it('accelerates peak time at higher temperature (28°C vs 20°C)', () => {
    const warm = predictStarterPeak({
      lastFedAt: baseFedAt,
      currentTempC: 28,
      now: baseFedAt,
    });
    const cool = predictStarterPeak({
      lastFedAt: baseFedAt,
      currentTempC: 20,
      now: baseFedAt,
    });

    expect(warm.estimatedPeakHoursMin).toBeLessThan(cool.estimatedPeakHoursMin);
    expect(warm.estimatedPeakHoursMax).toBeLessThan(cool.estimatedPeakHoursMax);
  });

  it('extends peak time for higher inoculation ratio (1:10:10 vs 1:1:1)', () => {
    const fastRatio = predictStarterPeak({
      lastFedAt: baseFedAt,
      ratio: [1, 1, 1],
      now: baseFedAt,
    });
    const slowRatio = predictStarterPeak({
      lastFedAt: baseFedAt,
      ratio: [1, 10, 10],
      now: baseFedAt,
    });

    expect(fastRatio.estimatedPeakHoursMin).toBeLessThan(slowRatio.estimatedPeakHoursMin);
    expect(fastRatio.estimatedPeakHoursMax).toBeLessThan(slowRatio.estimatedPeakHoursMax);
  });

  it('detects when starter is currently in peak window', () => {
    // Prediction for 1:2:2 rye @ 22°C has min ~5.3h, max ~7.5h
    const inPeakNow = baseFedAt + 6 * 3600 * 1000; // 6 hours in
    const result = predictStarterPeak({
      lastFedAt: baseFedAt,
      currentTempC: 22,
      ratio: [1, 2, 2],
      flourGrain: 'rye',
      now: inPeakNow,
    });

    expect(result.isCurrentlyInPeak).toBe(true);
    expect(result.hasPassedPeak).toBe(false);
    expect(result.progressPercent).toBe(100);
    expect(result.statusMessagePl).toContain('optymalnym szczycie');
  });

  it('detects when starter has passed its peak', () => {
    const afterPeakNow = baseFedAt + 12 * 3600 * 1000; // 12 hours in
    const result = predictStarterPeak({
      lastFedAt: baseFedAt,
      currentTempC: 22,
      ratio: [1, 2, 2],
      flourGrain: 'rye',
      now: afterPeakNow,
    });

    expect(result.isCurrentlyInPeak).toBe(false);
    expect(result.hasPassedPeak).toBe(true);
    expect(result.progressPercent).toBe(100);
    expect(result.statusMessagePl).toContain('Szczyt minął');
  });

  describe('Property-Based Invariants (fast-check)', () => {
    it('always produces valid hours and clamped progress across random temperatures and ratios', () => {
      fc.assert(
        fc.property(
          fc.record({
            temp: fc.double({ min: 15, max: 35, noNaN: true }),
            elapsedHours: fc.double({ min: 0, max: 24, noNaN: true }),
            grain: fc.constantFrom('rye' as const, 'wheat' as const, 'spelt' as const),
          }),
          ({ temp, elapsedHours, grain }) => {
            const now = baseFedAt + elapsedHours * 3600 * 1000;
            const res = predictStarterPeak({
              lastFedAt: baseFedAt,
              currentTempC: temp,
              flourGrain: grain,
              now,
            });

            expect(res.estimatedPeakHoursMin).toBeGreaterThan(0);
            expect(res.estimatedPeakHoursMax).toBeGreaterThan(res.estimatedPeakHoursMin);
            expect(res.progressPercent).toBeGreaterThanOrEqual(0);
            expect(res.progressPercent).toBeLessThanOrEqual(100);
            expect(typeof res.formattedWindowPl).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
