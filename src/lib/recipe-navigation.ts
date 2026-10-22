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
  // „Verace (48 h)” → „w stylu neapolitańskim”: 46 h w lodówce przeczyło GTS 97/2010 (DRO-PIZ-001) [M1-audytor-generalny-217]
  'pizza napoletana verace (48 h)': 'pizza_napoletana_48h',
};

/**
 * Receptury bazowe, którym zadanie 217 (D-097, tor T) zwiększyło procent drożdży: chałka 1,2 → 6,3%, bagietka
 * 0,2 → 2,2% (drożdże świeże). Wpis sprzed tej wersji powstał ze starą ilością.
 */
const BAZOWE_ZMIENIONE_217: readonly string[] = ['sweet_chalka', 'baguette_tradition_poolish'];

/**
 * Czy przed planem „Piecz ponownie” powiedzieć, że receptura bazowa się zmieniła: wpis bez recipe_id (sprzed wersji
 * z recipe_id, D1-7, więc sprzed zmiany 217) dobrany do bazowej chałki albo bagietki [M3 D3a]. Wpis z recipe_id
 * powstał już z nową ilością; własna receptura użytkownika o tej nazwie ma własne liczby.
 */
export function bazowaZmienionaOdWypieku(log: StoredBakeLog, r: PendingRecipeToLoad | null): boolean {
  return (log.recipeId === undefined || log.recipeId === null) && r?.id !== undefined && BAZOWE_ZMIENIONE_217.includes(r.id);
}

/**
 * Receptura do „Piecz ponownie”: najpierw po recipe_id wpisu (receptura przemianowana dalej się znajduje; D-10 pełne)
 * [M3 D3a], a dla starych wpisów bez id albo z id receptury, której już nie ma — po nazwie: najpierw własne receptury
 * użytkownika, potem bazowe (także dawne nazwy, D1-7). Bez dopasowania null — ekran otwiera listę receptur zamiast
 * zmyślonej formuły [audyt-niezalezny D-10].
 */
export function prepareBakeAgainRecipe(log: StoredBakeLog, customRecipes: StoredRecipe[]): PendingRecipeToLoad | null {
  const wlasne = customRecipes.filter((r) => !r.isBuiltIn);
  const allPresets = [...wlasne, ...customRecipes.filter((r) => r.isBuiltIn), ...MASTER_RECIPES];
  const nazwa = log.recipeName.toLowerCase();
  const id = log.recipeId ?? undefined;
  const match =
    (id !== undefined ? wlasne.find((r) => r.id === id) ?? MASTER_RECIPES.find((r) => r.id === id) : undefined) ??
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

  return null;
}

