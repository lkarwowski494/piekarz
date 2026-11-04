// ============================================================================
// Piekarz (Crust) — katalog receptur bazowych: 15 dotychczasowych (presets.ts) + 11 z katalogu M3 (D-157, D-177; p8).
// Dotychczasowe MASTER_RECIPES zostają bez zmian (kolejność, treść); nowe idą po nich. Lista i filtry rodzaju korzystają
// z CATALOG_RECIPES. Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import { MASTER_RECIPES, filterRecipesByCategory, type RecipePreset } from './presets';
import { KATALOG_ZAKWAS_ZYTNIE } from './katalog-m3-zakwas-zyto';
import { KATALOG_DROZDZOWE } from './katalog-m3-drozdzowe';
import { KATALOG_SLODKIE } from './katalog-m3-slodkie';

/** 11 receptur „wchodzi” z docs/tresci/badanie-2026-11-03/D-raport.md (piadina, Stollen i szybki orkiszowy: luki otwarte, D-229). */
export const KATALOG_M3_RECIPES: RecipePreset[] = [...KATALOG_ZAKWAS_ZYTNIE, ...KATALOG_DROZDZOWE, ...KATALOG_SLODKIE];

/** Wszystkie receptury bazowe w kolejności listy: dotychczasowe 15, potem katalog M3. */
export const CATALOG_RECIPES: RecipePreset[] = [...MASTER_RECIPES, ...KATALOG_M3_RECIPES];

/** Receptury bazowe w wybranej kategorii filtra listy; „all” zwraca cały katalog. */
export function filterCatalogRecipes(categoryFilter: string): RecipePreset[] {
  return filterRecipesByCategory(CATALOG_RECIPES, categoryFilter);
}
