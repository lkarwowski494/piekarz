import * as fc from 'fast-check';
import {
  calculateRecipeStarterSubstitution,
  convertStarterHydration,
  STARTER_PRESETS,
} from '../starter-converter';

describe('Starter Converter Engine (src/core/starter-converter.ts)', () => {
  describe('STARTER_PRESETS', () => {
    it('defines expected artisan presets with correct hydrations', () => {
      const lm = STARTER_PRESETS.find((p) => p.id === 'lievito_madre_50');
      expect(lm).toBeDefined();
      expect(lm?.hydration).toBe(50.0);

      const levain = STARTER_PRESETS.find((p) => p.id === 'liquid_levain_100');
      expect(levain).toBeDefined();
      expect(levain?.hydration).toBe(100.0);

      const rye = STARTER_PRESETS.find((p) => p.id === 'stiff_rye_60');
      expect(rye).toBeDefined();
      expect(rye?.hydration).toBe(60.0);
    });
  });

  describe('calculateRecipeStarterSubstitution', () => {
    it('accurately substitutes 100% recipe starter with 50% Lievito Madre', () => {
      // Recipe calls for 150g of 100% starter (75g flour, 75g water)
      // User has 50% Lievito Madre
      const res = calculateRecipeStarterSubstitution({
        recipeStarterGrams: 150,
        recipeStarterHydration: 100,
        userStarterHydration: 50,
      });

      // 75g flour * 1.5 = 112.5g -> rounded to 113g
      expect(res.userStarterGrams).toBe(113);
      // Recipe provided 75g water; 112.5g of 50% starter provides 37.5g water.
      // Deficit = 75 - 37.5 = +37.5g
      expect(res.waterAdjustmentGrams).toBeCloseTo(37.5, 1);
      expect(res.doughWaterAction).toBe('ADD');
      expect(res.advicePl).toContain('DODAJ');
    });

    it('accurately substitutes 50% recipe starter with 100% liquid starter', () => {
      // Recipe calls for 150g of 50% Lievito Madre (100g flour, 50g water)
      // User has 100% liquid starter
      const res = calculateRecipeStarterSubstitution({
        recipeStarterGrams: 150,
        recipeStarterHydration: 50,
        userStarterHydration: 100,
      });

      // 100g flour * 2 = 200g
      expect(res.userStarterGrams).toBe(200);
      // User starter provides 100g water vs recipe 50g -> excess = -50g
      expect(res.waterAdjustmentGrams).toBeCloseTo(-50.0, 1);
      expect(res.doughWaterAction).toBe('REDUCE');
      expect(res.advicePl).toContain('ODEJMIJ');
    });

    it('returns NONE action and 0 adjustment when hydrations match', () => {
      const res = calculateRecipeStarterSubstitution({
        recipeStarterGrams: 200,
        recipeStarterHydration: 100,
        userStarterHydration: 100,
      });

      expect(res.userStarterGrams).toBe(200);
      expect(res.waterAdjustmentGrams).toBe(0);
      expect(res.doughWaterAction).toBe('NONE');
      expect(res.advicePl).toContain('brak konieczności korekty');
    });

    it('throws on zero or negative values', () => {
      expect(() =>
        calculateRecipeStarterSubstitution({
          recipeStarterGrams: 0,
          recipeStarterHydration: 100,
          userStarterHydration: 100,
        })
      ).toThrow('Masa zakwasu w przepisie musi być większa od zera');

      expect(() =>
        calculateRecipeStarterSubstitution({
          recipeStarterGrams: 100,
          recipeStarterHydration: -50,
          userStarterHydration: 100,
        })
      ).toThrow('Hydratacja zakwasu musi być większa od zera');
    });

    // Property-based test with fast-check
    it('preserves exact water balance across arbitrary valid hydrations (property-based)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 800 }),
          fc.integer({ min: 40, max: 150 }),
          fc.integer({ min: 40, max: 150 }),
          (recipeGrams, recipeHydr, userHydr) => {
            const res = calculateRecipeStarterSubstitution({
              recipeStarterGrams: recipeGrams,
              recipeStarterHydration: recipeHydr,
              userStarterHydration: userHydr,
            });

            const recipeFlour = recipeGrams / (1.0 + recipeHydr / 100.0);
            const recipeWater = recipeGrams - recipeFlour;

            const userFlour = res.userStarterGrams / (1.0 + userHydr / 100.0);
            const userWater = res.userStarterGrams - userFlour;

            // Total liquid contributed to dough = userWater + waterAdjustmentGrams
            const effectiveWater = userWater + res.waterAdjustmentGrams;
            expect(Math.abs(effectiveWater - recipeWater)).toBeLessThan(1.5);
            expect(Math.abs(userFlour - recipeFlour)).toBeLessThan(1.5);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('convertStarterHydration', () => {
    it('converts 100% liquid mother to 50% Lievito Madre with specified seed', () => {
      const res = convertStarterHydration({
        targetYieldGrams: 150,
        sourceHydration: 100,
        targetHydration: 50,
        seedStarterGrams: 20,
      });

      // Target 150g at 50% => 100g flour, 50g water
      // 20g mother at 100% => 10g flour, 10g water
      // Added flour: 100 - 10 = 90g
      // Added water: 50 - 10 = 40g
      expect(res.seedStarterGrams).toBe(20);
      expect(res.addedFlourGrams).toBe(90);
      expect(res.addedWaterGrams).toBe(40);
      expect(res.actualYieldGrams).toBe(150);
      expect(res.actualHydration).toBe(50.0);
      expect(res.tipPl).toContain('Lievito Madre');
    });

    it('converts 50% Lievito Madre mother to 100% liquid levain using default ratio', () => {
      const res = convertStarterHydration({
        targetYieldGrams: 200,
        sourceHydration: 50,
        targetHydration: 100,
      });

      expect(res.actualYieldGrams).toBe(200);
      expect(res.actualHydration).toBeCloseTo(100.0, 1);
      expect(res.addedFlourGrams).toBeGreaterThan(0);
      expect(res.addedWaterGrams).toBeGreaterThan(0);
      expect(res.tipPl).toContain('płynna');
    });

    it('throws if mother seed provides more water or flour than target requires', () => {
      expect(() =>
        convertStarterHydration({
          targetYieldGrams: 100,
          sourceHydration: 120,
          targetHydration: 50,
          seedStarterGrams: 90,
        })
      ).toThrow('Masa zakwasu matki jest zbyt duża');
    });

    it('conserves weight and hydration across random inputs (property-based)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 600 }),
          fc.integer({ min: 50, max: 120 }),
          fc.integer({ min: 50, max: 120 }),
          (targetYield, srcHydr, tgtHydr) => {
            const res = convertStarterHydration({
              targetYieldGrams: targetYield,
              sourceHydration: srcHydr,
              targetHydration: tgtHydr,
              seedRatioPercent: 15, // small seed so it never exceeds target
            });

            expect(res.actualYieldGrams).toBe(res.seedStarterGrams + res.addedFlourGrams + res.addedWaterGrams);
            // Hydration check within 1.5% due to integer rounding of gram values
            expect(Math.abs(res.actualHydration - tgtHydr)).toBeLessThanOrEqual(2.0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
