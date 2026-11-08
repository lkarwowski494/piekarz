/**
 * p9b-2: plan trybu maszyny (D-242 Z6 a): krok z istniejącej kategorii (G4), bez zegara faz garnka, plan czytelny dla
 * parsera planów (ten sam, który ma build 1021), tryb i wersja w danych wypieku [M3 p9b2].
 */
import { planMaszyny, ID_KROKU_MASZYNY } from '../plan-maszyny';
import { isDutchOvenStep, isStageCategory } from '../../core/bake-steps';
import { parsePlannedBake } from '../../data/bake-sessions-store';
import { CATALOG_RECIPES } from '../../recipes/katalog';
import { formulaMaszyny } from '../../recipes/maszyna-receptur';

const graham = CATALOG_RECIPES.find((r) => r.id === 'graham_bread_honey')!;
const we = { recipeId: graham.id, recipeName: graham.namePl, formula: formulaMaszyny(graham).formula, makaG: 500, przezWersjeDrozdzowa: true, startMs: 1_800_000_000_000, czasProgramuMin: 190, nowMs: 1_799_000_000_000 };

describe('plan trybu maszyny', () => {
  it('jeden krok programu: kategoria z listy wydanego buildu, bez dwóch faz garnka, od startu do gotowości', () => {
    const p = planMaszyny(we);
    expect(p.steps).toHaveLength(1);
    const [k] = p.steps;
    expect(isStageCategory(k.category)).toBe(true);
    expect(k.id).toBe(ID_KROKU_MASZYNY);
    expect(isDutchOvenStep(k)).toBe(false);
    expect([k.plannedStart, k.plannedEnd]).toEqual([we.startMs, we.startMs + 190 * 60_000]);
  });
  it('dane wypieku: tryb maszyna, wersja drożdżowa przy zakwasie (D-156), receptura; parser planów go czyta', () => {
    const p = planMaszyny(we);
    expect(p.bake).toMatchObject({ tryb: 'maszyna', wersja: 'drozdze', recipeId: 'graham_bread_honey', isHighRye: false });
    expect(p.bake?.calculatedRecipe?.flours.reduce((a, f) => a + f.weightGrams, 0)).toBeCloseTo(500, 0);
    expect(parsePlannedBake(JSON.stringify(p))).toEqual(p);
  });
});

describe('zapiszPlanMaszyny', () => {
  it('zapisuje plan przez savePlannedBake; instrukcja kroku = zdanie machine.order', async () => {
    const { zapiszPlanMaszyny, INSTRUKCJA_KROKU_MASZYNY } = require('../plan-maszyny') as typeof import('../plan-maszyny');
    const { loadPlannedBakes } = require('../../data/bake-sessions-store') as typeof import('../../data/bake-sessions-store');
    expect(await zapiszPlanMaszyny(we)).toEqual({ ok: true });
    const [p] = await loadPlannedBakes();
    expect(p.steps[0].instructions).toBe(INSTRUKCJA_KROKU_MASZYNY);
    expect(INSTRUKCJA_KROKU_MASZYNY).toBe('Kolejność wkładania składników podaje instrukcja Twojej maszyny.');
  });
});
