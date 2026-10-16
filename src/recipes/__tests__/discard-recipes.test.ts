import fc from 'fast-check';
import {
  SOURDOUGH_DISCARD_RECIPES,
  getDiscardRecipes,
  filterDiscardRecipes,
  getDiscardGrams,
  DiscardCategory,
} from '../discard-recipes';

describe('Sourdough Discard Recipes (Z-043 / RECP-DISCARD)', () => {
  it('contains at least 5 classic sourdough discard formulas', () => {
    const list = getDiscardRecipes();
    expect(list.length).toBeGreaterThanOrEqual(5);

    const categories = list.map((r) => r.category);
    expect(categories).toContain('crackers');
    expect(categories).toContain('pancakes');
    expect(categories).toContain('waffles');
    expect(categories).toContain('cookies');
    expect(categories).toContain('flatbread');
  });

  it('guarantees each recipe specifies positive discard weight, non-empty ingredients, steps, and pro tip', () => {
    for (const r of SOURDOUGH_DISCARD_RECIPES) {
      expect(r.id).toBeTruthy();
      expect(r.titlePl).toBeTruthy();
      expect(r.titleEn).toBeTruthy();
      expect(r.discardWeightGrams).toBeGreaterThanOrEqual(50);
      expect(r.prepTimeMinutes).toBeGreaterThan(0);
      expect(r.cookTimeMinutes).toBeGreaterThan(0);
      expect(r.ingredients.length).toBeGreaterThanOrEqual(3);
      expect(r.stepsPl.length).toBeGreaterThanOrEqual(3);
      expect(r.stepsEn.length).toBeGreaterThanOrEqual(3);
      expect(r.proTipPl.length).toBeGreaterThan(10);
      expect(r.proTipEn.length).toBeGreaterThan(10);

      // Verify discard is in ingredients list
      const hasDiscardIngredient = r.ingredients.some(
        (ing) => ing.namePl.toLowerCase().includes('odrzut') || ing.namePl.toLowerCase().includes('zakwas')
      );
      expect(hasDiscardIngredient).toBe(true);
    }
  });

  it('filters discard recipes by category properly', () => {
    const crackers = filterDiscardRecipes('crackers');
    expect(crackers.length).toBeGreaterThanOrEqual(1);
    expect(crackers.every((c) => c.category === 'crackers')).toBe(true);

    const all = filterDiscardRecipes('all');
    expect(all.length).toBe(SOURDOUGH_DISCARD_RECIPES.length);
  });

  it('returns discard grams accurately', () => {
    expect(getDiscardGrams('discard_crackers_herb')).toBe(200);
    expect(getDiscardGrams('discard_fluffy_pancakes')).toBe(240);
    expect(getDiscardGrams('non_existent')).toBe(0);
  });

  describe('Property-Based Testing (fast-check)', () => {
    it('category filter is always a subset of all discard recipes', () => {
      const categories: (DiscardCategory | 'all')[] = [
        'all',
        'crackers',
        'pancakes',
        'waffles',
        'cookies',
        'flatbread',
      ];

      fc.assert(
        fc.property(fc.constantFrom(...categories), (cat) => {
          const filtered = filterDiscardRecipes(cat);
          expect(filtered.length).toBeLessThanOrEqual(SOURDOUGH_DISCARD_RECIPES.length);
          if (cat !== 'all') {
            expect(filtered.every((r) => r.category === cat)).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
