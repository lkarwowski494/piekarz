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
    // Zmiany pól z decyzji po podziale, wyliczone jawnie: odcisk liczy się na danych z cofniętymi tylko tymi polami,
    // więc każda inna zmiana dalej go psuje. D-303 (pizza, PIE-PIZ-001) [M1-audytor-generalny-009]; D-304 (garnek
    // PIE-GAR-001, brioszka PIE-BRI-001) [M1-audytor-generalny-008].
    const PRZED_DECYZJAMI: Record<string, Record<string, unknown>> = {
      country_loaf_72: { bakeTempSteamC: 240, bakeTempBrowningC: 210 },
      tartine_high_hydration_80: { bakeTimeSteamMinutes: 22, bakeTempSteamC: 245, bakeTempBrowningC: 210 },
      san_francisco_sourdough: { bakeTempSteamC: 240, bakeTempBrowningC: 210 },
      pain_de_campagne: { bakeTempSteamC: 240, bakeTempBrowningC: 210 },
      spelt_ancient_seeded: { bakeTempSteamC: 235, bakeTempBrowningC: 205 },
      graham_bread_honey: { bakeTempSteamC: 235, bakeTempBrowningC: 205 },
      lievito_madre_panettone_brioche: { bakeTempSteamC: 175, bakeTempBrowningC: 175 },
      pizza_napoletana_48h: {
        bakeTimeBrowningMinutes: 2, bakeTempSteamC: 450, bakeTempBrowningC: 450,
        notesPl: 'Ciasto rośnie w temperaturze pokojowej co najmniej 12, a najwyżej 24 godziny. Po podziale na kulki rośnie jeszcze 45–60 minut, gdy nagrzewa się piekarnik.',
      },
    };
    // D-305 (opisy i wskazówki z teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]: wartości przed zmianą.
    const PRZED_D305: Record<string, Record<string, unknown>> = {
      country_loaf_72: {
        descriptionPl: 'Klasyczny bochenek pszenno-żytni z chrupiącą skórką i otwartym uchem. Idealny na początek przygody z zakwasem.',
        notesPl: 'Wypiek w garnku żeliwnym. 4 serie składań zwojowych w odstępach 30 minut. Garowanie w lodówce 12–16 godzin.',
      },
      tartine_high_hydration_80: {
        descriptionPl: 'Zaawansowany bochenek o wysokiej hydratacji z dzikim, perłowym miękiszem i potężnym uchem.',
        notesPl: 'Wymaga mąki o zawartości białka minimum 13%. Autoliza 60 minut bez soli. Bardzo delikatne składania zwojowe.',
      },
      san_francisco_sourdough: {
        descriptionPl: 'Klasyczny chleb z San Francisco o głębokiej kwasowości octowej, lśniącej skórce z pęcherzykami i elastycznym, otwartym miękiszu.',
        notesPl: 'Wydłużona fermentacja w chłodzie (18–24 h w 4°C). Niższą temperaturę fermentacji wiąże się z kwasem octowym. Wypiek z mocnym zaparowaniem.',
      },
      pain_de_campagne: {
        descriptionPl: 'Tradycyjny bochenek z francuskich wsi. Zrównoważony smak kwasu mlekowego i orzechowo-otrębowy finisz.',
        notesPl: 'Klasyczna trójkombinacja mąk: pszenna jasna, graham i żytnia chlebowa. 3 serie delikatnego stretch & fold, garowanie w owalnym koszyku.',
      },
      spelt_ancient_seeded: {
        descriptionPl: 'Orzechowy bochenek z pradawnego orkiszu z dodatkiem prażonego siemienia, słonecznika i sezamu.',
        notesPl: 'Ziarna upraż na suchej patelni i zalej ciepłą wodą na 2 h przed dodaniem do ciasta przy laminacji. Orkisz wyrabiaj delikatnie, unikaj nadmiernego naciągania.',
      },
      graham_bread_honey: {
        descriptionPl: 'Chleb z grubo mielonej mąki pszennej Graham z dodatkiem naturalnego miodu i siemienia lnianego.',
        notesPl: 'Dodatek łyżki miodu wspomaga fermentację i łagodzi kwasowość. Grube otręby z Grahama wymagają 45-minutowej autolizy.',
      },
      ciabatta_con_biga: {
        descriptionPl: 'Tradycyjna włoska ciabatta na sztywnym zaczynie Biga (50%). Spektakularny piecowy skok i wielkie perłowe dziury.',
      },
      focaccia_genovese: {
        descriptionPl: 'Puszyste, oliwne ciasto z chrupiącą bazą, soczystymi wgłębieniami i aromatem świeżego rozmarynu z solą morską.',
      },
      no_knead_night: {
        descriptionPl: 'Najprostszy chleb świata. Mieszanie łyżką w 2 minuty, nocny rozrost na blacie i pieczenie w garnku.',
      },
      rye_100_pan: {
        descriptionPl: 'Ciężki, aromatyczny razowiec w foremce keksowej. Bez wyrabiania i składania. Zachowuje świeżość przez tydzień.',
        notesPl: 'Wymieszaj i przełóż od razu do wysmarowanej keksówki posypanej otrębami. Niech raz urośnie w cieple, aż podwoi objętość (ok. 3–4 h). Upieczony chleb żytni na zakwasie najlepiej pokroić dopiero po 24 godzinach odpoczynku.',
      },
      lievito_madre_panettone_brioche: {
        descriptionPl: 'Niezwykle delikatna, maślana brioszka prowadzona na sztywnym włoskim zakwasie Lievito Madre (50%).',
      },
      sweet_chalka: {
        descriptionPl: 'Puszysta, słodka chałka zaplatana w warkocz z kruszonką. Idealna na niedzielne śniadanie.',
      },
    };
    // D-307 (kanon nazw mąk) [M1-audytor-generalny-041]: nazwy mąk w formułach przed zmianą.
    const PRZED_D307: Record<string, string> = {
      'Mąka pszenna typ 750 (chlebowa)': 'Mąka pszenna chlebowa typ 750',
      'Mąka pszenna typ 1850 (graham)': 'Mąka pszenna typ 1850 (Graham)',
      'Mąka pszenna typ 650 (bułkowa)': 'Mąka pszenna typ 650 (Bułkowa)',
      'Mąka pszenna typ 550 (luksusowa)': 'Mąka pszenna typ 550 (Luksusowa)',
    };
    const przed = MASTER_RECIPES.map((r) => ({
      ...r,
      ...PRZED_DECYZJAMI[r.id],
      ...PRZED_D305[r.id],
      formula: { ...r.formula, flours: r.formula.flours.map((f) => ({ ...f, name: PRZED_D307[f.name] ?? f.name })) },
    }));
    const odcisk = createHash('sha256').update(JSON.stringify(przed)).digest('hex');
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
