import fc from 'fast-check';
import {
  calculatePrefermentBreakdown,
  PREFERMENT_DEFINITIONS,
  PrefermentType,
} from '../preferments';

describe('Artisan Preferment Engine (src/core/preferments.ts)', () => {
  describe('Deterministic Test Vectors', () => {
    it('direct method produces 0g preferment and preserves full dough amounts', () => {
      const res = calculatePrefermentBreakdown({
        prefermentType: 'direct',
        prefermentFlourPercentage: 0,
        totalFlourGrams: 500,
        totalTargetHydration: 70.0,
        saltPercentage: 2.0,
      });

      expect(res.prefermentFlourGrams).toBe(0);
      expect(res.prefermentWaterGrams).toBe(0);
      expect(res.doughAddedFlourGrams).toBe(500);
      expect(res.doughAddedWaterGrams).toBe(350);
      expect(res.doughAddedSaltGrams).toBe(10.0);
      expect(res.totalDoughWeightGrams).toBe(860);
      expect(res.overallHydrationPercent).toBe(70.0);
    });

    it('calculates 20% Poolish correctly with 100% hydration and micro-yeast addition', () => {
      const res = calculatePrefermentBreakdown({
        prefermentType: 'poolish',
        prefermentFlourPercentage: 20.0,
        totalFlourGrams: 500,
        totalTargetHydration: 70.0,
        saltPercentage: 2.0,
      });

      // 20% of 500g = 100g flour in poolish
      expect(res.prefermentFlourGrams).toBe(100);
      expect(res.prefermentWaterGrams).toBe(100);
      expect(res.prefermentYeastGrams).toBe(0.1);
      expect(res.prefermentSaltGrams).toBe(0);

      // Remaining for final dough: 400g flour, 350-100 = 250g water
      expect(res.doughAddedFlourGrams).toBe(400);
      expect(res.doughAddedWaterGrams).toBe(250);
      expect(res.doughAddedSaltGrams).toBe(10.0);

      // Total conservation
      expect(res.prefermentFlourGrams + res.doughAddedFlourGrams).toBe(500);
      expect(res.prefermentWaterGrams + res.doughAddedWaterGrams).toBe(350);
      expect(res.overallHydrationPercent).toBe(70.0);
    });

    it('calculates 30% Biga correctly with 50% stiff hydration', () => {
      const res = calculatePrefermentBreakdown({
        prefermentType: 'biga',
        prefermentFlourPercentage: 30.0,
        totalFlourGrams: 1000,
        totalTargetHydration: 75.0,
        saltPercentage: 2.2,
      });

      // 30% of 1000g = 300g flour
      expect(res.prefermentFlourGrams).toBe(300);
      // 50% hydration of 300g = 150g water
      expect(res.prefermentWaterGrams).toBe(150);
      // 1% yeast of 300g = 3g
      expect(res.prefermentYeastGrams).toBe(3.0);

      // Final dough additions
      expect(res.doughAddedFlourGrams).toBe(700);
      expect(res.doughAddedWaterGrams).toBe(600); // 750 - 150 = 600g
      expect(res.doughAddedSaltGrams).toBe(22.0);

      expect(res.prefermentFlourGrams + res.doughAddedFlourGrams).toBe(1000);
      expect(res.prefermentWaterGrams + res.doughAddedWaterGrams).toBe(750);
      expect(res.overallHydrationPercent).toBe(75.0);
    });

    it('deducts salt from final dough when using Pâte Fermentée', () => {
      const res = calculatePrefermentBreakdown({
        prefermentType: 'pate_fermentee',
        prefermentFlourPercentage: 25.0,
        totalFlourGrams: 800,
        totalTargetHydration: 68.0,
        saltPercentage: 2.0,
      });

      // 25% of 800g = 200g flour
      expect(res.prefermentFlourGrams).toBe(200);
      // 65% of 200g = 130g water
      expect(res.prefermentWaterGrams).toBe(130);
      // 2% salt of 200g = 4g salt already inside old dough
      expect(res.prefermentSaltGrams).toBe(4.0);

      // Total salt needed = 2% of 800g = 16g
      // Dough added salt = 16 - 4 = 12g
      expect(res.doughAddedSaltGrams).toBe(12.0);
      expect(res.prefermentSaltGrams + res.doughAddedSaltGrams).toBe(16.0);
    });

    it('rejects invalid inputs with descriptive Polish errors', () => {
      expect(() =>
        calculatePrefermentBreakdown({
          prefermentType: 'poolish',
          prefermentFlourPercentage: 20,
          totalFlourGrams: 0,
          totalTargetHydration: 70,
          saltPercentage: 2,
        })
      ).toThrow('Całkowita masa mąki musi być większa od 0');

      expect(() =>
        calculatePrefermentBreakdown({
          prefermentType: 'biga',
          prefermentFlourPercentage: 110,
          totalFlourGrams: 500,
          totalTargetHydration: 70,
          saltPercentage: 2,
        })
      ).toThrow('Udział mąki w zaczynie musi mieścić się w przedziale 0–100%');
    });
  });

// Ziarno z globalnej konfiguracji (jest.app-after-env.js → tests/helpers/fc-config.js): zawsze liczba,
// także przy PROP_SEED=random w nightly; Number('random') dawało NaN i stały ciąg [M1-audytor-generalny-064].
const PBT_SEED: number | undefined = fc.readConfigureGlobal().seed;

function assertWithSeed<Ts extends [unknown, ...unknown[]]>(
  property: fc.IProperty<Ts>,
  params?: fc.Parameters<Ts>
) {
  try {
    fc.assert(property, {
      ...params,
      ...(PBT_SEED !== undefined ? { seed: PBT_SEED } : {}),
    });
  } catch (error: unknown) {
    if (PBT_SEED !== undefined) {
      console.warn(`[PBT FAILURE] Seed configured: ${PBT_SEED}`);
    } else {
      console.warn(`[PBT FAILURE] To reproduce, set PROP_SEED=<seed> from fast-check report.`);
    }
    throw error;
  }
}

  describe('Property-Based Invariants (fast-check)', () => {
    const types: PrefermentType[] = ['direct', 'poolish', 'biga', 'pate_fermentee', 'levain'];

    it('conserves total flour mass strictly: prefFlour + doughAddedFlour === totalFlour', () => {
      assertWithSeed(
        fc.property(
          fc.constantFrom(...types),
          fc.integer({ min: 100, max: 5000 }),
          fc.integer({ min: 0, max: 90 }),
          fc.float({ min: 55, max: 95, noNaN: true }),
          (type, totalFlour, prefPct, hydr) => {
            const res = calculatePrefermentBreakdown({
              prefermentType: type,
              prefermentFlourPercentage: prefPct,
              totalFlourGrams: totalFlour,
              totalTargetHydration: hydr,
              saltPercentage: 2.0,
            });

            expect(res.prefermentFlourGrams + res.doughAddedFlourGrams).toBe(totalFlour);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('conserves water mass strictly: prefWater + doughAddedWater === totalWater', () => {
      assertWithSeed(
        fc.property(
          fc.constantFrom(...types),
          fc.integer({ min: 200, max: 3000 }),
          fc.integer({ min: 10, max: 50 }),
          fc.float({ min: 60, max: 85, noNaN: true }),
          (type, totalFlour, prefPct, hydr) => {
            const res = calculatePrefermentBreakdown({
              prefermentType: type,
              prefermentFlourPercentage: prefPct,
              totalFlourGrams: totalFlour,
              totalTargetHydration: hydr,
              saltPercentage: 2.0,
            });

            const expectedWater = Math.round((totalFlour * hydr) / 100);
            expect(res.prefermentWaterGrams + res.doughAddedWaterGrams).toBe(expectedWater);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('ensures salt conservation without negative dough salt', () => {
      assertWithSeed(
        fc.property(
          fc.constantFrom(...types),
          fc.integer({ min: 250, max: 2000 }),
          fc.integer({ min: 5, max: 40 }),
          fc.float({ min: 1.0, max: 3.5, noNaN: true }),
          (type, totalFlour, prefPct, saltPct) => {
            const res = calculatePrefermentBreakdown({
              prefermentType: type,
              prefermentFlourPercentage: prefPct,
              totalFlourGrams: totalFlour,
              totalTargetHydration: 70.0,
              saltPercentage: saltPct,
            });

            expect(res.doughAddedSaltGrams).toBeGreaterThanOrEqual(0);
            const totalExpectedSalt = Number(((totalFlour * saltPct) / 100).toFixed(1));
            expect(Math.abs(res.prefermentSaltGrams + res.doughAddedSaltGrams - totalExpectedSalt)).toBeLessThanOrEqual(0.1);
          }
        ),
        { numRuns: 1000 }
      );
    });
  });
});
