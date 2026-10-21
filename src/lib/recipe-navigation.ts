// ============================================================================
// Piekarz (Crust) — Recipe Cross-Tab Navigation Service (Zadanie P3 / HIG)
// Allows 1-tap "Piecz Ponownie" (Bake Again) from Stolnica history to Kalkulator.
// Apps4Craft Studio — 100% Offline-First.
// ============================================================================

import { FlourItemInput } from '../core/domain-rules';
import { MASTER_RECIPES } from '../recipes/presets';
import { StoredBakeLog, StoredRecipe } from '../data/db';

export interface PendingRecipeFormula {
  flours: FlourItemInput[];
  waterPercentage: number;
  saltPercentage: number;
  starterPercentage: number;
  starterHydration?: number;
  extraYeastPercentage?: number;
  targetDoughWeightGrams?: number;
}

export interface PendingRecipeToLoad {
  id?: string;
  name: string;
  targetDDT?: number;
  formula: PendingRecipeFormula;
}

let pendingRecipe: PendingRecipeToLoad | null = null;
type PendingRecipeListener = (recipe: PendingRecipeToLoad) => void;
const listeners = new Set<PendingRecipeListener>();

export function setPendingRecipeToLoad(recipe: PendingRecipeToLoad): void {
  pendingRecipe = recipe;
  listeners.forEach((fn) => fn(recipe));
}

export function getPendingRecipeToLoad(): PendingRecipeToLoad | null {
  return pendingRecipe;
}

export function clearPendingRecipeToLoad(): void {
  pendingRecipe = null;
}

export function subscribePendingRecipe(listener: PendingRecipeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Dawne nazwy receptur bazowych (przed 2026-10-21) → id: wpisy Dziennika trzymają nazwę z dnia wypieku, więc
 * „Piecz ponownie” po zmianie nazwy dalej znajduje tę recepturę [M1-audytor-generalny-112; 04-studio-projektowe-507].
 */
const DAWNE_NAZWY_BAZOWYCH: Record<string, string> = {
  'mistrzowski wiejski (tartine style 80%)': 'tartine_high_hydration_80',
  'san francisco sourdough (wyrazista kwasowość)': 'san_francisco_sourdough',
  'bagietka paryska z poolishem (baguette de tradition)': 'baguette_tradition_poolish',
  // „48h” → „48 h” (wspólny format czasu, 2026-10-22) [M1-audytor-generalny-162]
  'pizza napoletana verace (48h)': 'pizza_napoletana_48h',
};

export function prepareBakeAgainRecipe(log: StoredBakeLog, customRecipes: StoredRecipe[]): PendingRecipeToLoad {
  const allPresets = [...customRecipes, ...MASTER_RECIPES];
  const nazwa = log.recipeName.toLowerCase();
  const match =
    allPresets.find((r) => ('namePl' in r ? r.namePl : r.name).toLowerCase() === nazwa) ??
    MASTER_RECIPES.find((r) => r.id === DAWNE_NAZWY_BAZOWYCH[nazwa]);

  if (match) {
    return {
      id: match.id,
      name: 'namePl' in match ? match.namePl : match.name,
      targetDDT: match.targetDDT,
      formula: match.formula,
    };
  }

  return {
    name: log.recipeName,
    targetDDT: log.actualDDT ?? 25.0,
    formula: {
      flours: [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100.0, type: 'pszenna_750' }],
      waterPercentage: 70.0,
      saltPercentage: 2.0,
      starterPercentage: 20.0,
      targetDoughWeightGrams: 900,
    },
  };
}

