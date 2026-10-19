import * as fc from 'fast-check';
import {
  MASTER_RECIPES,
  RecipePreset,
  filterMasterRecipes,
  ritualCategoryFilter,
  RitualCategoryFilter,
} from '../presets';
import { calculateDoughRecipe } from '../../core/domain-rules';

// F-26 (dawne F-51), ZM-14, D-034 wybór 8a: rytuał nie ukrywa receptur [M1-audytor-generalny-032; 03-zakres-010]
describe('Ritual profile does not hide master recipes', () => {
  const PROFILES = ['sourdough_purist', 'artisan_hybrid', 'beginner'] as const;

  it.each(PROFILES)('profile %s: its start filter is a category and "all" returns every master recipe', (profile) => {
    const start: RitualCategoryFilter = ritualCategoryFilter(profile);
    expect(['all', 'sourdough']).toContain(start);
    expect(filterMasterRecipes(start).length).toBeGreaterThan(0);
    expect(filterMasterRecipes('all')).toEqual(MASTER_RECIPES);
  });

  it('sourdough purist starts on the sourdough category, other profiles on "all"', () => {
    expect(PROFILES.map(ritualCategoryFilter)).toEqual(['sourdough', 'all', 'all']);
    expect(filterMasterRecipes('sourdough').every((p) => p.category === 'sourdough')).toBe(true);
  });
});

describe('Master Recipes Catalogue (src/recipes/presets.ts)', () => {
  it('contains 15 unique master recipes covering all artisan categories', () => {
    expect(MASTER_RECIPES.length).toBe(15);

    const ids = new Set<string>();
    for (const r of MASTER_RECIPES) {
      expect(ids.has(r.id)).toBe(false);
      ids.add(r.id);
    }

    const categories = new Set(MASTER_RECIPES.map((r) => r.category));
    expect(categories.has('sourdough')).toBe(true);
    expect(categories.has('rye')).toBe(true);
    expect(categories.has('yeast')).toBe(true);
    expect(categories.has('pizza')).toBe(true);
    expect(categories.has('sweet')).toBe(true);
  });

  describe.each(MASTER_RECIPES)('Recipe: $namePl ($id)', (preset: RecipePreset) => {
    it('has flour percentages that sum up to exactly 100%', () => {
      const sum = preset.formula.flours.reduce((acc, f) => acc + f.percentage, 0);
      expect(sum).toBeCloseTo(100.0, 2);
    });

    it('can be calculated by calculateDoughRecipe without errors', () => {
      const result = calculateDoughRecipe(preset.formula);
      expect(result.targetDoughWeightGrams).toBe(preset.formula.targetDoughWeightGrams);
      expect(result.baseFlourWeightGrams).toBeGreaterThan(0);
      expect(result.waterGrams).toBeGreaterThan(0);
      expect(result.saltGrams).toBeGreaterThan(0);
      expect(result.flours.length).toBe(preset.formula.flours.length);
    });

    it('has realistic baking parameters and valid vessels', () => {
      expect(preset.targetDDT).toBeGreaterThanOrEqual(20);
      expect(preset.targetDDT).toBeLessThanOrEqual(30);

      expect(preset.bakeTempSteamC).toBeGreaterThan(0);
      expect(preset.bakeTempBrowningC).toBeGreaterThan(0);
      expect(preset.bakeTimeSteamMinutes + preset.bakeTimeBrowningMinutes).toBeGreaterThan(0);

      const validVessels = ['dutch_oven', 'bread_pan', 'baking_steel', 'baking_sheet'];
      expect(validVessels).toContain(preset.recommendedVessel);
      expect(preset.notesPl.length).toBeGreaterThan(15);
    });
  });

  // Property-based test: every master recipe scales deterministically across batch weights
  it('scales deterministically to arbitrary batch weights (property-based)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...MASTER_RECIPES),
        fc.integer({ min: 300, max: 5000 }),
        (recipe, targetWeight) => {
          const scaledFormula = {
            ...recipe.formula,
            targetDoughWeightGrams: targetWeight,
          };

          const result = calculateDoughRecipe(scaledFormula);

          expect(result.targetDoughWeightGrams).toBe(targetWeight);
          expect(result.baseFlourWeightGrams).toBeGreaterThan(0);
          expect(Math.abs(result.sumCheckGrams - targetWeight)).toBeLessThanOrEqual(2);

          // Sum of individual flour weights equals base flour weight (within integer rounding)
          const sumFlours = result.flours.reduce((sum, f) => sum + f.weightGrams, 0);
          expect(Math.abs(sumFlours - result.baseFlourWeightGrams)).toBeLessThanOrEqual(result.flours.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
