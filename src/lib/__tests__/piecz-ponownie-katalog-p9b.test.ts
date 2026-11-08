/**
 * p9b-1 (D-250 pkt 3): „Piecz ponownie” dla wpisu bez recipeId dopasowanego po nazwie bierze formułę receptury
 * wbudowanej z kodu, nie z nieaktualnego wiersza bazy. INSERT OR IGNORE (initDatabase) nie aktualizuje wiersza z buildu
 * 1022 (karelian_rye_pasties: sól 2,0 z p8), a kod ma 2,1 (p10, KAT-KAR-010, D-237) [M3 p9b].
 */
import { prepareBakeAgainRecipe } from '../recipe-navigation';
import { CATALOG_RECIPES } from '../../recipes/katalog';
import type { StoredRecipe } from '../../data/db';

describe('p9b: Piecz ponownie — receptura wbudowana z kodu przed wierszem z bazy', () => {
  it('wpis bez recipeId z nazwą receptury wbudowanej: formuła z kodu (sól 2,1), nie z wiersza bazy z 1022 (2,0)', () => {
    const kod = CATALOG_RECIPES.find((r) => r.id === 'karelian_rye_pasties');
    if (!kod) throw new Error('brak receptury w katalogu');
    expect(kod.formula.saltPercentage).toBe(2.1);
    const wiersz1022: StoredRecipe = {
      id: kod.id,
      name: kod.namePl,
      formula: { ...kod.formula, saltPercentage: 2.0 },
      targetDDT: kod.targetDDT,
      isBuiltIn: true,
      createdAt: 0,
    };
    const wynik = prepareBakeAgainRecipe({ id: 'b', recipeName: kod.namePl, startedAt: 1 }, [wiersz1022]);
    expect(wynik?.id).toBe('karelian_rye_pasties');
    expect(wynik?.formula.saltPercentage).toBe(2.1);
  });

  it('własna receptura o tej samej nazwie nadal wygrywa z wbudowaną', () => {
    const kod = CATALOG_RECIPES.find((r) => r.id === 'karelian_rye_pasties');
    if (!kod) throw new Error('brak receptury w katalogu');
    const wlasna: StoredRecipe = { id: 'recipe_1', name: kod.namePl, formula: { ...kod.formula, saltPercentage: 1.0 }, targetDDT: 24, isBuiltIn: false, createdAt: 5 };
    expect(prepareBakeAgainRecipe({ id: 'b', recipeName: kod.namePl, startedAt: 1 }, [wlasna])?.formula.saltPercentage).toBe(1.0);
  });
});
