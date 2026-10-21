// ============================================================================
// Piekarz (Crust) — Master Recipe Presets (BR-RECP-001)
// 15 Pre-calibrated artisan formulas with True Baker's % and baking stages.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import { DoughRecipeInput } from '../core/domain-rules';

export interface RecipePreset {
  id: string;
  namePl: string;
  category: 'sourdough' | 'rye' | 'yeast' | 'pizza' | 'sweet';
  descriptionPl: string;
  formula: DoughRecipeInput;
  targetDDT: number;
  bakeTimeSteamMinutes: number;
  bakeTimeBrowningMinutes: number;
  bakeTempSteamC: number;
  bakeTempBrowningC: number;
  recommendedVessel: 'dutch_oven' | 'bread_pan' | 'baking_steel' | 'baking_sheet';
  notesPl: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'artisan';
}

export type MasterRecipe = RecipePreset;

export const MASTER_RECIPES: RecipePreset[] = [
  {
    id: 'country_loaf_72',
    namePl: 'Wiejski chleb codzienny na zakwasie',
    category: 'sourdough',
    descriptionPl: 'Klasyczny bochenek pszenno-żytni z chrupiącą skórką i otwartym uchem. Idealny na początek przygody z zakwasem.',
    formula: {
      flours: [
        { name: 'Mąka pszenna chlebowa typ 750', percentage: 80.0, type: 'pszenna_750' },
        { name: 'Mąka żytnia typ 720', percentage: 20.0, type: 'zytnia_720' },
      ],
      waterPercentage: 68.0,
      saltPercentage: 2.0,
      starterPercentage: 20.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 900,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 22,
    bakeTempSteamC: 240,
    bakeTempBrowningC: 210,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Wypiek w garnku żeliwnym. 4 serie składań (Coil Fold) w odstępach 30 minut. Garowanie w lodówce 12–16 godzin.',
  },
  {
    id: 'tartine_high_hydration_80',
    namePl: 'Mistrzowski wiejski w stylu Tartine, 80%',
    category: 'sourdough',
    descriptionPl: 'Zaawansowany bochenek o wysokiej hydratacji z dzikim, perłowym miękiszem i potężnym uchem.',
    formula: {
      flours: [
        { name: 'Mąka pszenna Manitoba', percentage: 90.0, type: 'pszenna_manitoba' },
        { name: 'Mąka pszenna pełnoziarnista typ 2000', percentage: 10.0, type: 'pszenna_razowa' },
      ],
      waterPercentage: 76.0,
      saltPercentage: 2.0,
      starterPercentage: 20.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 950,
    },
    targetDDT: 26.0,
    bakeTimeSteamMinutes: 22,
    bakeTimeBrowningMinutes: 25,
    bakeTempSteamC: 245,
    bakeTempBrowningC: 210,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Wymaga mąki o zawartości białka minimum 13,0g. Autoliza 60 minut bez soli. Bardzo delikatne składania zwojowe.',
  },
  {
    id: 'san_francisco_sourdough',
    namePl: 'Chleb w stylu San Francisco o wyrazistej kwasowości',
    category: 'sourdough',
    descriptionPl: 'Klasyczny chleb z San Francisco o głębokiej kwasowości octowej, lśniącej skórce z pęcherzykami i elastycznym, otwartym miękiszu.',
    formula: {
      flours: [
        { name: 'Mąka pszenna chlebowa typ 750', percentage: 90.0, type: 'pszenna_750' },
        { name: 'Mąka żytnia typ 2000', percentage: 10.0, type: 'zytnia_2000' },
      ],
      waterPercentage: 70.0,
      saltPercentage: 2.1,
      starterPercentage: 15.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 920,
    },
    targetDDT: 24.0,
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 24,
    bakeTempSteamC: 240,
    bakeTempBrowningC: 210,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Wydłużona fermentacja w chłodzie (18–24h w 4°C). Niższą temperaturę fermentacji wiąże się z kwasem octowym. Wypiek z mocnym zaparowaniem.',
  },
  {
    id: 'pain_de_campagne',
    namePl: 'Francuski Pain de Campagne (Chleb Wiejski)',
    category: 'sourdough',
    descriptionPl: 'Tradycyjny bochenek z francuskich wsi. Zrównoważony smak kwasu mlekowego i orzechowo-otrębowy finisz.',
    formula: {
      flours: [
        { name: 'Mąka pszenna chlebowa typ 750', percentage: 75.0, type: 'pszenna_750' },
        { name: 'Mąka pszenna graham typ 1850', percentage: 15.0, type: 'pszenna_graham' },
        { name: 'Mąka żytnia typ 720', percentage: 10.0, type: 'zytnia_720' },
      ],
      waterPercentage: 69.0,
      saltPercentage: 2.0,
      starterPercentage: 20.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 930,
    },
    targetDDT: 24.5,
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 23,
    bakeTempSteamC: 240,
    bakeTempBrowningC: 210,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Klasyczna trójkombinacja mąk: pszenna jasna, graham i żytnia chlebowa. 3 serie delikatnego stretch & fold, garowanie w owalnym koszyku.',
  },
  {
    id: 'baguette_tradition_poolish',
    namePl: 'Bagietka paryska na poolishu',
    category: 'yeast',
    descriptionPl: 'Klasyczna francuska bagietka z 12-godzinnym zaczynem Poolish. Chrupiąca, cienka skórka i lekki, napowietrzony miękisz.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (chlebowa jasna)', percentage: 100.0, type: 'pszenna_650' },
      ],
      waterPercentage: 72.0,
      saltPercentage: 2.0,
      starterPercentage: 0.0,
      extraYeastPercentage: 0.2,
      targetDoughWeightGrams: 750,
    },
    targetDDT: 22.5,
    bakeTimeSteamMinutes: 10,
    bakeTimeBrowningMinutes: 15,
    bakeTempSteamC: 240,
    bakeTempBrowningC: 220,
    recommendedVessel: 'baking_steel',
    notesPl: 'Zaczyn Poolish (20% mąki i 100% hydratacji). Pieczenie na rozgrzanej płycie stalowej lub szamocie z intensywnym zaparowaniem.',
  },
  {
    id: 'ciabatta_con_biga',
    namePl: 'Włoska Ciabatta z Bigą (Wysoka Hydratacja 82%)',
    category: 'yeast',
    descriptionPl: 'Tradycyjna włoska ciabatta na sztywnym zaczynie Biga (50%). Spektakularny piecowy skok i wielkie perłowe dziury.',
    formula: {
      flours: [
        { name: 'Mąka pszenna Manitoba', percentage: 100.0, type: 'pszenna_manitoba' },
      ],
      waterPercentage: 82.0,
      saltPercentage: 2.2,
      starterPercentage: 0.0,
      extraYeastPercentage: 0.3,
      targetDoughWeightGrams: 850,
    },
    targetDDT: 23.0,
    bakeTimeSteamMinutes: 12,
    bakeTimeBrowningMinutes: 16,
    bakeTempSteamC: 235,
    bakeTempBrowningC: 215,
    recommendedVessel: 'baking_steel',
    notesPl: 'Biga (sztywny zaczyn 50% hydratacji) dojrzewający 16h w 18°C. Do ciasta właściwego dodaj 3% oliwy z oliwek. Nie odgazowuj ciasta przed pieczeniem.',
  },
  {
    id: 'focaccia_genovese',
    namePl: 'Focaccia Genovese z solanką i rozmarynem',
    category: 'yeast',
    descriptionPl: 'Puszyste, oliwne ciasto z chrupiącą bazą, soczystymi wgłębieniami i aromatem świeżego rozmarynu z solą morską.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650', percentage: 85.0, type: 'pszenna_650' },
        { name: 'Mąka z pszenicy durum (Semolina)', percentage: 15.0, type: 'durum' },
      ],
      waterPercentage: 80.0,
      saltPercentage: 2.2,
      starterPercentage: 0.0,
      extraYeastPercentage: 0.5,
      targetDoughWeightGrams: 900,
    },
    targetDDT: 24.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 22,
    bakeTempSteamC: 230,
    bakeTempBrowningC: 230,
    recommendedVessel: 'baking_sheet',
    notesPl: 'Przełóż na obficie naoliwioną blachę. Przed włożeniem do pieca polej emulsją solankową (woda, oliwa, sól) i energicznie ugnieć palcami tworząc wgłębienia.',
  },
  {
    id: 'rye_100_pan',
    namePl: 'Tradycyjny chleb 100% żytni razowy',
    category: 'rye',
    descriptionPl: 'Ciężki, aromatyczny razowiec w foremce keksowej. Bez wyrabiania i składania. Zachowuje świeżość przez tydzień.',
    formula: {
      flours: [
        { name: 'Mąka żytnia typ 2000', percentage: 100.0, type: 'zytnia_2000' },
      ],
      waterPercentage: 78.0,
      saltPercentage: 1.8,
      starterPercentage: 30.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 28.0,
    bakeTimeSteamMinutes: 15,
    bakeTimeBrowningMinutes: 45,
    bakeTempSteamC: 230,
    bakeTempBrowningC: 195,
    recommendedVessel: 'bread_pan',
    notesPl: 'Wymieszaj i przełóż bezpośrednio do wysmarowanej i posypanej otrębami keksówki. Jednorazowy rozrost w cieple do podwojenia (ok. 3–4h). Według King Arthur Baking upieczony chleb żytni na zakwasie powinien odpocząć 24 godziny przed krojeniem, dla najlepszej jakości.',
  },
  {
    id: 'borodinsky_rye',
    namePl: 'Chleb Borodyński (Żytni na słodzie z kolendrą)',
    category: 'rye',
    descriptionPl: 'Ciemny, słodkawo-korzenny żytni chleb z aromatem czerwonego słodu fermentowanego i prażonej kolendry.',
    formula: {
      flours: [
        { name: 'Mąka żytnia typ 2000', percentage: 85.0, type: 'zytnia_2000' },
        { name: 'Mąka żytnia typ 720', percentage: 15.0, type: 'zytnia_720' },
      ],
      waterPercentage: 82.0,
      saltPercentage: 1.8,
      starterPercentage: 35.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 1050,
    },
    targetDDT: 29.0,
    bakeTimeSteamMinutes: 15,
    bakeTimeBrowningMinutes: 50,
    bakeTempSteamC: 230,
    bakeTempBrowningC: 190,
    recommendedVessel: 'bread_pan',
    notesPl: 'Wymaga zaparzenia czerwonego słodu żytniego wrzątkiem wraz ze zmieloną kolendrą. Wierzch przed pieczeniem posyp całymi ziarnami kolendry.',
  },
  {
    id: 'spelt_ancient_seeded',
    namePl: 'Pradawny chleb orkiszowy z prażonymi ziarnami',
    category: 'sourdough',
    descriptionPl: 'Orzechowy bochenek z pradawnego orkiszu z dodatkiem prażonego siemienia, słonecznika i sezamu.',
    formula: {
      flours: [
        { name: 'Mąka orkiszowa', percentage: 70.0, type: 'orkisz_630' },
        { name: 'Mąka orkiszowa typ 2000', percentage: 30.0, type: 'orkisz_2000' },
      ],
      waterPercentage: 68.0,
      saltPercentage: 2.0,
      starterPercentage: 20.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 920,
    },
    targetDDT: 24.0,
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 22,
    bakeTempSteamC: 235,
    bakeTempBrowningC: 205,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Ziarna upraż na suchej patelni i zalej ciepłą wodą na 2h przed dodaniem do ciasta przy laminacji. Orkisz wyrabiaj delikatnie, unikaj nadmiernego naciągania.',
  },
  {
    id: 'lievito_madre_panettone_brioche',
    namePl: 'Rzemieślnicza maślana brioszka na Lievito Madre',
    category: 'sweet',
    descriptionPl: 'Niezwykle delikatna, maślana brioszka prowadzona na sztywnym włoskim zakwasie Lievito Madre (50%).',
    formula: {
      flours: [
        { name: 'Mąka pszenna Manitoba', percentage: 100.0, type: 'pszenna_manitoba' },
      ],
      waterPercentage: 46.0,
      saltPercentage: 1.2,
      starterPercentage: 30.0,
      starterHydration: 50.0,
      targetDoughWeightGrams: 800,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 28,
    bakeTempSteamC: 175,
    bakeTempBrowningC: 175,
    recommendedVessel: 'bread_pan',
    notesPl: 'Lievito Madre odśwież 3 razy co 4h przed zarobieniem ciasta. Masło (25%) dodawaj stopniowo porcjami pod koniec wyrabiania, gdy siatka glutenowa jest już w pełni rozwinięta.',
  },
  {
    id: 'graham_bread_honey',
    namePl: 'Chleb Graham z miodem i siemieniem',
    category: 'sourdough',
    descriptionPl: 'Odżywczy chleb z grubo mielonej mąki pszennej Graham z dodatkiem naturalnego miodu i siemienia lnianego.',
    formula: {
      flours: [
        { name: 'Mąka pszenna graham typ 1850', percentage: 60.0, type: 'pszenna_graham' },
        { name: 'Mąka pszenna chlebowa typ 750', percentage: 40.0, type: 'pszenna_750' },
      ],
      waterPercentage: 72.0,
      saltPercentage: 2.0,
      starterPercentage: 20.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 900,
    },
    targetDDT: 25.0,
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 23,
    bakeTempSteamC: 235,
    bakeTempBrowningC: 205,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Dodatek łyżki miodu wspomaga fermentację i łagodzi kwasowość. Grube otręby z Grahama wymagają 45-minutowej autolizy.',
  },
  {
    id: 'no_knead_night',
    namePl: 'Chleb nocny bez wyrabiania (drożdżowy)',
    category: 'yeast',
    descriptionPl: 'Najprostszy chleb świata. Mieszanie łyżką w 2 minuty, nocny rozrost na blacie i pieczenie w garnku.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650', percentage: 100.0, type: 'pszenna_650' },
      ],
      waterPercentage: 75.0,
      saltPercentage: 2.0,
      starterPercentage: 0.0,
      extraYeastPercentage: 0.25,
      targetDoughWeightGrams: 880,
    },
    targetDDT: 22.0,
    bakeTimeSteamMinutes: 30,
    bakeTimeBrowningMinutes: 15,
    bakeTempSteamC: 235,
    bakeTempBrowningC: 215,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Wymieszaj składniki w misce łyżką. Przykryj folią i zostaw na 12–16 godzin w temperaturze pokojowej. Bez składania.',
  },
  {
    id: 'pizza_napoletana_48h',
    namePl: 'Pizza Napoletana Verace (48h)',
    category: 'pizza',
    descriptionPl: 'Oryginalne ciasto na pizzę neapolitańską o chrupiącym brzegu i delikatnym wnętrzu.',
    formula: {
      flours: [
        { name: 'Mąka pszenna włoska Tipo 00', percentage: 100.0, type: 'tipo_00' },
      ],
      waterPercentage: 65.0,
      saltPercentage: 2.8,
      starterPercentage: 0.0,
      extraYeastPercentage: 0.08,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 23.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 2,
    bakeTempSteamC: 450,
    bakeTempBrowningC: 450,
    recommendedVessel: 'baking_steel',
    notesPl: 'Fermentacja: 2h na blacie, porcjowanie w kulki 250g, 46h w lodówce (4°C). Wyjmij 2h przed pieczeniem.',
  },
  {
    id: 'sweet_chalka',
    namePl: 'Maślana chałka drożdżowa',
    category: 'sweet',
    descriptionPl: 'Puszysta, słodka chałka zaplatana w warkocz z kruszonką. Idealna na niedzielne śniadanie.',
    formula: {
      flours: [
        { name: 'Mąka pszenna luksusowa typ 550', percentage: 100.0, type: 'pszenna_550' },
      ],
      waterPercentage: 45.0,
      saltPercentage: 1.0,
      starterPercentage: 0.0,
      extraYeastPercentage: 1.2,
      targetDoughWeightGrams: 750,
    },
    targetDDT: 26.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 25,
    bakeTempSteamC: 180,
    bakeTempBrowningC: 180,
    recommendedVessel: 'baking_sheet',
    notesPl: 'Wyrabiaj z dodatkiem masła i cukru. Po wyrośnięciu zapleć warkocz, posmaruj roztrzepanym jajkiem i posyp kruszonką.',
  },
];

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

