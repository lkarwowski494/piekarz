/**
 * Jeden zakres hydratacji zakwasu 20–200% w polu receptury (arkusz „Składniki”, ER-58) i w imporcie receptury
 * (JSON, link) oraz kopii [M2-koordynator-napraw-641 (p13b); M1-audytor-generalny-130].
 */
import { exportRecipeToJson, parseAndValidateRecipeJson } from '../recipe-sharing';
import { parseRecipeRow } from '../../data/row-parsers';
import type { StoredRecipe } from '../../data/db';

const receptura = (starterHydration: number): StoredRecipe => ({
  id: 'r_641',
  name: 'Zakwas sztywny',
  formula: {
    flours: [{ name: 'Mąka 750', percentage: 100 }],
    waterPercentage: 70,
    saltPercentage: 2,
    starterPercentage: 20,
    starterHydration,
    targetDoughWeightGrams: 1000,
  },
  targetDDT: 25,
  isBuiltIn: false,
  createdAt: 1,
});

describe('641: hydratacja zakwasu 20–200% w imporcie jak w polu', () => {
  it.each([20, 30, 39.9, 200])('JSON receptury z hydratacją %s%% przechodzi eksport i import bez zmiany', (h) => {
    const wynik = parseAndValidateRecipeJson(exportRecipeToJson(receptura(h)));
    expect(wynik.success).toBe(true);
    expect(wynik.success && wynik.recipe.formula.starterHydration).toBe(h);
  });

  it.each([19.9, 200.1])('JSON z hydratacją %s%% (poza polem) odrzucony z komunikatem o zakresie 20–200%%', (h) => {
    const wynik = parseAndValidateRecipeJson(exportRecipeToJson(receptura(h)));
    expect(wynik.success).toBe(false);
    expect(wynik.success ? '' : wynik.error).toContain(`20–200`);
  });

  it('kopia: wiersz receptury z hydratacją 20% wraca bez zmiany', () => {
    expect(parseRecipeRow(receptura(20))?.formula.starterHydration).toBe(20);
  });
});
