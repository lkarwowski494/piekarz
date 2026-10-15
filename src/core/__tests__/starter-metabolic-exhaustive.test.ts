import {
  calculateStarterFeeding,
  calculateStarterPhase,
} from '../domain-rules';

describe('Exhaustive Sourdough Metabolic & Feeding Invariants (BR-STARTER-EXHAUSTIVE)', () => {
  // --------------------------------------------------------------------------
  // 1. Feeding Ratio Yield Conservation (1:1:1 to 1:10:10)
  // --------------------------------------------------------------------------
  describe('Multi-Ratio Feeding Calculator Conservation of Mass', () => {
    const ratios: Array<{
      name: string;
      ratio: [number, number, number];
      targetYield: number;
    }> = [
      { name: '1:1:1 (Quick 3-4h boost)', ratio: [1, 1, 1], targetYield: 150 },
      { name: '1:2:2 (Standard artisan 5-7h)', ratio: [1, 2, 2], targetYield: 200 },
      { name: '1:3:3 (Slow daytime 7-9h)', ratio: [1, 3, 3], targetYield: 210 },
      { name: '1:4:4 (Extended 8-10h)', ratio: [1, 4, 4], targetYield: 180 },
      { name: '1:5:5 (Overnight slow 10-12h)', ratio: [1, 5, 5], targetYield: 220 },
      { name: '1:10:10 (Vacation prep / deep refresh)', ratio: [1, 10, 10], targetYield: 210 },
    ];

    ratios.forEach(({ name, ratio, targetYield }) => {
      it(`conserves total mass for ${name}`, () => {
        const result = calculateStarterFeeding(targetYield, ratio);

        expect(result.targetYieldGrams).toBe(targetYield);
        expect(result.starterGrams).toBeGreaterThan(0);
        expect(result.flourGrams).toBeGreaterThan(0);
        expect(result.waterGrams).toBeGreaterThan(0);

        // Fluor and water parts must be equal for 100% hydration feeding
        expect(result.flourGrams).toBe(result.waterGrams);

        // Sum of parts equals target yield within 1g integer rounding
        const sum = result.starterGrams + result.flourGrams + result.waterGrams;
        expect(Math.abs(sum - targetYield)).toBeLessThanOrEqual(1);
      });
    });

    it('throws error when target yield is zero or negative', () => {
      expect(() => calculateStarterFeeding(0, [1, 2, 2])).toThrow();
      expect(() => calculateStarterFeeding(-50, [1, 2, 2])).toThrow();
    });

    it('throws error when ratio parts sum to zero or negative', () => {
      expect(() => calculateStarterFeeding(100, [0, 0, 0])).toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // 2. Room Temperature Metabolic Phase Progression
  // --------------------------------------------------------------------------
  describe('Room Temperature Metabolic Phase Machine', () => {
    const fixedNow = 1700000000000;

    it('identifies lag adaptation phase for elapsed time < 2.0 hours', () => {
      const justFed = fixedNow;
      const fed1hAgo = fixedNow - 1.0 * 3600 * 1000;
      const fed1h50mAgo = fixedNow - 1.8 * 3600 * 1000;

      expect(calculateStarterPhase(justFed, 'ROOM_TEMP', fixedNow).phase).toBe('lag');
      expect(calculateStarterPhase(fed1hAgo, 'ROOM_TEMP', fixedNow).phase).toBe('lag');
      expect(calculateStarterPhase(fed1h50mAgo, 'ROOM_TEMP', fixedNow).phase).toBe('lag');
    });

    it('identifies rising exponential phase from 2.0 to 4.9 hours', () => {
      const fed2hAgo = fixedNow - 2.0 * 3600 * 1000;
      const fed3hAgo = fixedNow - 3.0 * 3600 * 1000;
      const fed4hAgo = fixedNow - 4.5 * 3600 * 1000;

      expect(calculateStarterPhase(fed2hAgo, 'ROOM_TEMP', fixedNow).phase).toBe('rising');
      expect(calculateStarterPhase(fed3hAgo, 'ROOM_TEMP', fixedNow).phase).toBe('rising');
      expect(calculateStarterPhase(fed4hAgo, 'ROOM_TEMP', fixedNow).phase).toBe('rising');
    });

    it('identifies peak plateau phase from 5.1 to 9.0 hours (ideal baking window)', () => {
      const fed6hAgo = fixedNow - 6.0 * 3600 * 1000;
      const fed7hAgo = fixedNow - 7.5 * 3600 * 1000;
      const fed9hAgo = fixedNow - 9.0 * 3600 * 1000;

      const p6 = calculateStarterPhase(fed6hAgo, 'ROOM_TEMP', fixedNow);
      const p7 = calculateStarterPhase(fed7hAgo, 'ROOM_TEMP', fixedNow);
      const p9 = calculateStarterPhase(fed9hAgo, 'ROOM_TEMP', fixedNow);

      expect(p6.phase).toBe('peak');
      expect(p7.phase).toBe('peak');
      expect(p9.phase).toBe('peak');
      expect(p6.labelPl).toContain('PEAK');
      expect(p6.advicePl).toContain('Najlepszy moment');
    });

    it('identifies declining phase from 9.1 to 14.0 hours', () => {
      const fed10hAgo = fixedNow - 10.0 * 3600 * 1000;
      const fed12hAgo = fixedNow - 12.0 * 3600 * 1000;
      const fed14hAgo = fixedNow - 14.0 * 3600 * 1000;

      expect(calculateStarterPhase(fed10hAgo, 'ROOM_TEMP', fixedNow).phase).toBe('declining');
      expect(calculateStarterPhase(fed12hAgo, 'ROOM_TEMP', fixedNow).phase).toBe('declining');
      expect(calculateStarterPhase(fed14hAgo, 'ROOM_TEMP', fixedNow).phase).toBe('declining');
    });

    it('identifies hungry starving phase beyond 14.0 hours', () => {
      const fed15hAgo = fixedNow - 15.0 * 3600 * 1000;
      const fed24hAgo = fixedNow - 24.0 * 3600 * 1000;
      const fed48hAgo = fixedNow - 48.0 * 3600 * 1000;

      expect(calculateStarterPhase(fed15hAgo, 'ROOM_TEMP', fixedNow).phase).toBe('hungry');
      expect(calculateStarterPhase(fed24hAgo, 'ROOM_TEMP', fixedNow).phase).toBe('hungry');
      expect(calculateStarterPhase(fed48hAgo, 'ROOM_TEMP', fixedNow).phase).toBe('hungry');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Fridge Storage Kinetics (4°C)
  // --------------------------------------------------------------------------
  describe('Fridge Storage Kinetics', () => {
    const fixedNow = 1700000000000;

    it('keeps starter in dormant lag state for first 4 days in fridge', () => {
      const fed1Day = fixedNow - 1 * 24 * 3600 * 1000;
      const fed3Days = fixedNow - 3 * 24 * 3600 * 1000;
      const fed4Days = fixedNow - 4 * 24 * 3600 * 1000;

      expect(calculateStarterPhase(fed1Day, 'FRIDGE', fixedNow).phase).toBe('lag');
      expect(calculateStarterPhase(fed3Days, 'FRIDGE', fixedNow).phase).toBe('lag');
      expect(calculateStarterPhase(fed4Days, 'FRIDGE', fixedNow).phase).toBe('lag');
      expect(calculateStarterPhase(fed3Days, 'FRIDGE', fixedNow).labelPl).toContain('Uśpiony w lodówce');
    });

    it('transitions to hungry phase after 5+ days in fridge', () => {
      const fed5Days = fixedNow - 5 * 24 * 3600 * 1000;
      const fed10Days = fixedNow - 10 * 24 * 3600 * 1000;

      expect(calculateStarterPhase(fed5Days, 'FRIDGE', fixedNow).phase).toBe('hungry');
      expect(calculateStarterPhase(fed10Days, 'FRIDGE', fixedNow).phase).toBe('hungry');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Edge Cases: Clock Drift, Missing Data, and Inverted Timestamps
  // --------------------------------------------------------------------------
  describe('Clock Drift & Robustness Edge Cases', () => {
    const fixedNow = 1700000000000;

    it('gracefully handles missing lastFedAt timestamp without crashing', () => {
      const result = calculateStarterPhase(undefined, 'ROOM_TEMP', fixedNow);
      expect(result.phase).toBe('hungry');
      expect(result.labelPl).toContain('Brak danych');
    });

    it('clamps future timestamps caused by device clock change to zero elapsed time', () => {
      // User clock moved backward or fed timestamp recorded with future time
      const futureFed = fixedNow + 2 * 3600 * 1000;
      const result = calculateStarterPhase(futureFed, 'ROOM_TEMP', fixedNow);

      expect(result.elapsedHours).toBe(0);
      expect(result.phase).toBe('lag');
    });
  });
});
