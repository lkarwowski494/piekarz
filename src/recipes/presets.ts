// ============================================================================
// Piekarz (Crust) — Master Recipe Presets (BR-RECP-001)
// 6 Pre-calibrated artisan formulas with True Baker's % and baking stages.
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
}

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
    namePl: 'Mistrzowski wiejski (Tartine Style 80%)',
    category: 'sourdough',
    descriptionPl: 'Zaawansowany bochenek o wysokiej hydratacji z dzikim, perłowym miękiszem i potężnym uchem.',
    formula: {
      flours: [
        { name: 'Mąka pszenna wysokobiałkowa (W>280 / Manitolba)', percentage: 90.0, type: 'pszenna_manitoba' },
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
    id: 'rye_100_pan',
    namePl: 'Tradycyjny chleb 100% żytni razowy',
    category: 'rye',
    descriptionPl: 'Ciężki, aromatyczny razowiec w foremce keksowej. Bez wyrabiania i składania. Zachowuje świeżość przez tydzień.',
    formula: {
      flours: [
        { name: 'Mąka żytnia razowa typ 2000', percentage: 100.0, type: 'zytnia_2000' },
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
    notesPl: 'Wymieszaj i przełóż bezpośrednio do wysmarowanej i posypanej otrębami keksówki. Jednorazowy rozrost w cieple do podwojenia (ok. 3–4h). Krój dopiero po 12 godzinach od upieczenia.',
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
      extraYeastPercentage: 0.25, // Drożdże instant (ok. 1.2g na 500g mąki)
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
    descriptionPl: 'Oryginalne ciasto na pizzę neapolitańską o chrupiącym brzegu (Cornicione) i delikatnym wnętrzu.',
    formula: {
      flours: [
        { name: 'Mąka pszenna włoska Tipo 00', percentage: 100.0, type: 'tipo_00' },
      ],
      waterPercentage: 65.0,
      saltPercentage: 2.8,
      starterPercentage: 0.0,
      extraYeastPercentage: 0.08, // Bardzo mała ilość drożdży na długą fermentację
      targetDoughWeightGrams: 1000, // 4 kulki po 250g
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
      waterPercentage: 45.0, // Reszta płynów z mleka i jaj
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
