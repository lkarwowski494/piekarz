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

export function prepareBakeAgainRecipe(log: StoredBakeLog, customRecipes: StoredRecipe[]): PendingRecipeToLoad {
  const allPresets = [...customRecipes, ...MASTER_RECIPES];
  const match = allPresets.find(
    (r) => ('namePl' in r ? r.namePl : r.name).toLowerCase() === log.recipeName.toLowerCase()
  );

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

