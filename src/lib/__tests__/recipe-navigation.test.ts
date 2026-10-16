// ============================================================================
// Piekarz (Crust) — Recipe Cross-Tab Navigation Service Tests
// Tests 1-tap Bake Again state transfer between Stolnica and Kalkulator.
// ============================================================================

import {
  setPendingRecipeToLoad,
  getPendingRecipeToLoad,
  clearPendingRecipeToLoad,
  subscribePendingRecipe,
  PendingRecipeToLoad,
} from '../recipe-navigation';

describe('recipe-navigation service', () => {
  beforeEach(() => {
    clearPendingRecipeToLoad();
  });

  it('stores and retrieves a pending recipe', () => {
    const sample: PendingRecipeToLoad = {
      id: 'test_rec_1',
      name: 'Chleb Żytni Tradycyjny',
      targetDDT: 26.5,
      formula: {
        flours: [{ name: 'Mąka żytnia typ 720', percentage: 100.0, type: 'zytnia_720' }],
        waterPercentage: 75.0,
        saltPercentage: 2.0,
        starterPercentage: 30.0,
        starterHydration: 100.0,
        targetDoughWeightGrams: 900,
      },
    };

    setPendingRecipeToLoad(sample);
    expect(getPendingRecipeToLoad()).toEqual(sample);

    clearPendingRecipeToLoad();
    expect(getPendingRecipeToLoad()).toBeNull();
  });

  it('notifies subscribers immediately when pending recipe is set', () => {
    const listener = jest.fn();
    const unsubscribe = subscribePendingRecipe(listener);

    const sample: PendingRecipeToLoad = {
      name: 'Baguette Tradition',
      targetDDT: 23.0,
      formula: {
        flours: [{ name: 'Mąka T65', percentage: 100.0, type: 'pszenna_650' }],
        waterPercentage: 68.0,
        saltPercentage: 2.0,
        starterPercentage: 15.0,
      },
    };

    setPendingRecipeToLoad(sample);
    expect(listener).toHaveBeenCalledWith(sample);

    unsubscribe();
    setPendingRecipeToLoad({ ...sample, name: 'Other' });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
