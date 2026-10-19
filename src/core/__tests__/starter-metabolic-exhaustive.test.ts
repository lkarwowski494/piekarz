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
  // 2. Room Temperature: faza z okna predyktora (jeden model szczytu, M1-audytor-generalny-044).
  //    Domyślne okno (22 °C, 1:2:2, żyto): 5,3–7,5 h. Progi 2/5/9/14 h wycofane (ZAK-SZC-901).
  // --------------------------------------------------------------------------
  describe('Room Temperature Phase from the Peak Window', () => {
    const fixedNow = 1700000000000;
    const fedHoursAgo = (h: number) => calculateStarterPhase(fixedNow - h * 3600 * 1000, 'ROOM_TEMP', fixedNow);

    it('before the window: 0 to 5.2 hours', () => {
      for (const h of [0, 1, 2, 4.5, 5.2]) expect(fedHoursAgo(h).phase).toBe('before');
    });

    it('in the window: 5.3 to 7.5 hours (estimate, without "ideal moment")', () => {
      for (const h of [5.3, 6, 7, 7.5]) expect(fedHoursAgo(h).phase).toBe('peak');
      expect(fedHoursAgo(6).labelPl).toBe('W szacowanym oknie szczytu');
      expect(fedHoursAgo(6).advicePl).not.toMatch(/najlepszy moment|idealny moment/i);
    });

    it('after the window: beyond 7.5 hours', () => {
      for (const h of [7.6, 10, 14, 24, 48]) expect(fedHoursAgo(h).phase).toBe('after');
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
      expect(result.phase).toBe('before');
    });
  });
});
