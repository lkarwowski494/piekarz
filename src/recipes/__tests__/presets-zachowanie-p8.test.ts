// M3 p8 (D-157, D-229): podział src/recipes/presets.ts na moduły nie zmienia 15 istniejących receptur ani ich kolejności.
// Odcisk policzony na kodzie sprzed podziału (commit d24ea87): sha256 z JSON.stringify(MASTER_RECIPES).
import { createHash } from 'node:crypto';
import { MASTER_RECIPES, filterMasterRecipes, filterRecipesByCategory, ritualCategoryFilter } from '../presets';
import { PRESETY_ZAKWAS } from '../presets-zakwas';
import { PRESETY_DROZDZOWE } from '../presets-drozdzowe';
import { PRESETY_ZYTNIE } from '../presets-zytnie';
import { PRESETY_PIZZA_SLODKIE } from '../presets-pizza-slodkie';

const KOLEJNOSC_ID = [
  'country_loaf_72', 'tartine_high_hydration_80', 'san_francisco_sourdough', 'pain_de_campagne',
  'baguette_tradition_poolish', 'ciabatta_con_biga', 'focaccia_genovese', 'rye_100_pan', 'borodinsky_rye',
  'spelt_ancient_seeded', 'lievito_madre_panettone_brioche', 'graham_bread_honey', 'no_knead_night',
  'pizza_napoletana_48h', 'sweet_chalka',
];

describe('M3 p8: 15 istniejących receptur bazowych bez zmian po podziale modułu', () => {
  it('kolejność id jest taka jak przed podziałem', () => {
    expect(MASTER_RECIPES.map((r) => r.id)).toEqual(KOLEJNOSC_ID);
  });

  it('treść wszystkich 15 receptur jest bajt w bajt taka jak przed podziałem (sha256)', () => {
    const odcisk = createHash('sha256').update(JSON.stringify(MASTER_RECIPES)).digest('hex');
    expect(odcisk).toBe('2b3ef868a1b9b86e9924266da1f8aa0cb3d8afd90dea906c69134413e81e960b');
  });

  it('eksporty filtra i rytuału działają jak dotąd', () => {
    expect(filterMasterRecipes('all')).toEqual(MASTER_RECIPES);
    expect(filterMasterRecipes('pizza_sweet').map((r) => r.id)).toEqual(['lievito_madre_panettone_brioche', 'pizza_napoletana_48h', 'sweet_chalka']);
    expect(ritualCategoryFilter('sourdough_purist')).toBe('sourdough');
    expect(ritualCategoryFilter('beginner')).toBe('all');
  });

  it('moduły według rodzaju mają 6 + 4 + 2 + 3 receptur i razem dają dokładnie MASTER_RECIPES', () => {
    expect([PRESETY_ZAKWAS, PRESETY_DROZDZOWE, PRESETY_ZYTNIE, PRESETY_PIZZA_SLODKIE].map((m) => m.length)).toEqual([6, 4, 2, 3]);
    expect(PRESETY_ZAKWAS.every((r) => r.category === 'sourdough')).toBe(true);
    expect(PRESETY_DROZDZOWE.every((r) => r.category === 'yeast')).toBe(true);
    expect(PRESETY_ZYTNIE.every((r) => r.category === 'rye')).toBe(true);
    expect(PRESETY_PIZZA_SLODKIE.every((r) => r.category === 'pizza' || r.category === 'sweet')).toBe(true);
    const razem = [...PRESETY_ZAKWAS, ...PRESETY_DROZDZOWE, ...PRESETY_ZYTNIE, ...PRESETY_PIZZA_SLODKIE];
    expect(razem.map((r) => r.id).sort()).toEqual([...KOLEJNOSC_ID].sort());
  });

  it('filterRecipesByCategory: „all” kopia listy, „pizza_sweet” pizza i słodkie, inna wartość po rodzaju', () => {
    expect(filterRecipesByCategory(MASTER_RECIPES, 'all')).toEqual(MASTER_RECIPES);
    expect(filterRecipesByCategory(MASTER_RECIPES, 'pizza_sweet').map((r) => r.category)).toEqual(['sweet', 'pizza', 'sweet']);
    expect(filterRecipesByCategory(MASTER_RECIPES, 'rye').map((r) => r.id)).toEqual(['rye_100_pan', 'borodinsky_rye']);
    expect(filterRecipesByCategory(MASTER_RECIPES, 'nie-ma-takiego')).toEqual([]);
  });
});
