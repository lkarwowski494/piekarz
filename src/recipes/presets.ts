// ============================================================================
// Piekarz (Crust) — Master Recipe Presets (BR-RECP-001)
// 15 Pre-calibrated artisan formulas with True Baker's % and baking stages.
// Treść receptur leży w modułach według rodzaju (presets-zakwas, -drozdzowe, -zytnie, -pizza-slodkie; M3 p8, D-157);
// ten plik składa listę w dotychczasowej kolejności i zachowuje eksporty. Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import type { RecipePreset } from './presets-types';
import { PRESETY_ZAKWAS } from './presets-zakwas';
import { PRESETY_DROZDZOWE } from './presets-drozdzowe';
import { PRESETY_ZYTNIE } from './presets-zytnie';
import { PRESETY_PIZZA_SLODKIE } from './presets-pizza-slodkie';

export type { RecipePreset, MasterRecipe } from './presets-types';

/** Kolejność listy receptur bazowych (zachowana z presets.ts sprzed podziału). */
const KOLEJNOSC_BAZOWYCH: readonly string[] = [
  'country_loaf_72',
  'tartine_high_hydration_80',
  'san_francisco_sourdough',
  'pain_de_campagne',
  'baguette_tradition_poolish',
  'ciabatta_con_biga',
  'focaccia_genovese',
  'rye_100_pan',
  'borodinsky_rye',
  'spelt_ancient_seeded',
  'lievito_madre_panettone_brioche',
  'graham_bread_honey',
  'no_knead_night',
  'pizza_napoletana_48h',
  'sweet_chalka',
];

const WSZYSTKIE_BAZOWE: readonly RecipePreset[] = [...PRESETY_ZAKWAS, ...PRESETY_DROZDZOWE, ...PRESETY_ZYTNIE, ...PRESETY_PIZZA_SLODKIE];

export const MASTER_RECIPES: RecipePreset[] = KOLEJNOSC_BAZOWYCH.map((id) => {
  const preset = WSZYSTKIE_BAZOWE.find((p) => p.id === id);
  if (!preset) throw new Error(`Brak receptury bazowej ${id} w modułach presets-*`); // błąd programisty, nie dane użytkownika
  return preset;
});

/** Startowy filtr kategorii ustawiany przez rytuał (F-26, BR-RECP-001). */
export type RitualCategoryFilter = 'all' | 'sourdough';

/**
 * Rytuał ustawia widoczny, startowy filtr kategorii i nie ukrywa receptur (ZM-14, D-034 wybór 8a)
 * [M1-audytor-generalny-032]. Początkujący nie ma odpowiednika wśród kategorii: „Wszystkie”.
 */
export function ritualCategoryFilter(ritualProfile: string): RitualCategoryFilter {
  return ritualProfile === 'sourdough_purist' ? 'sourdough' : 'all';
}

/** Receptury bazowe w wybranej kategorii; „all” zwraca każdą recepturę bazową. */
export function filterMasterRecipes(categoryFilter: string): RecipePreset[] {
  const list = MASTER_RECIPES;
  if (categoryFilter === 'all') return list;
  if (categoryFilter === 'pizza_sweet') {
    return list.filter((p) => p.category === 'pizza' || p.category === 'sweet');
  }
  return list.filter((p) => p.category === categoryFilter);
}

