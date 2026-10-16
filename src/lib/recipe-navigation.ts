// ============================================================================
// Piekarz (Crust) — Recipe Cross-Tab Navigation Service (Zadanie P3 / HIG)
// Allows 1-tap "Piecz Ponownie" (Bake Again) from Stolnica history to Kalkulator.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import { FlourItemInput } from '../core/domain-rules';

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
