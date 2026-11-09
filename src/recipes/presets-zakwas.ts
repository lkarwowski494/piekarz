// ============================================================================
// Piekarz (Crust) — receptury bazowe BR-RECP-001: receptury na zakwasie (M3 p8, D-157: podział presets.ts na moduły).
// Treść przeniesiona bez zmian z presets.ts; kolejność listy ustala presets.ts. Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import type { RecipePreset } from './presets-types';

export const PRESETY_ZAKWAS: RecipePreset[] = [
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
    // Garnek 232 °C: 20 min pod pokrywką, 20–25 min bez (PIE-GAR-001, D-304) [M1-audytor-generalny-008]
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 22,
    bakeTempSteamC: 232,
    bakeTempBrowningC: 232,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Wypiek w garnku żeliwnym. 4 serie składań zwojowych w odstępach 30 minut. Garowanie w lodówce 12–16 godzin.',
  },
  {
    id: 'tartine_high_hydration_80',
    namePl: 'Wiejski chleb na zakwasie, 80%',
    category: 'sourdough',
    descriptionPl: 'Zaawansowany bochenek o wysokiej hydratacji z dzikim, perłowym miękiszem i potężnym uchem.',
    formula: {
      flours: [
        { name: 'Mąka pszenna Manitoba', percentage: 90.0, type: 'pszenna_manitoba' },
        { name: 'Mąka pszenna razowa typ 2000', percentage: 10.0, type: 'pszenna_razowa' },
      ],
      waterPercentage: 76.0,
      saltPercentage: 2.0,
      starterPercentage: 20.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 950,
    },
    targetDDT: 26.0,
    // Garnek 232 °C: 20 min pod pokrywką, 20–25 min bez (PIE-GAR-001, D-304) [M1-audytor-generalny-008]
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 25,
    bakeTempSteamC: 232,
    bakeTempBrowningC: 232,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Wymaga mąki o zawartości białka minimum 13%. Autoliza 60 minut bez soli. Bardzo delikatne składania zwojowe.',
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
    // Garnek 232 °C: 20 min pod pokrywką, 20–25 min bez (PIE-GAR-001, D-304) [M1-audytor-generalny-008]
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 24,
    bakeTempSteamC: 232,
    bakeTempBrowningC: 232,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Wydłużona fermentacja w chłodzie (18–24 h w 4°C). Niższą temperaturę fermentacji wiąże się z kwasem octowym. Wypiek z mocnym zaparowaniem.',
  },
  {
    id: 'pain_de_campagne',
    namePl: 'Francuski Pain de Campagne (Chleb Wiejski)',
    category: 'sourdough',
    descriptionPl: 'Tradycyjny bochenek z francuskich wsi. Zrównoważony smak kwasu mlekowego i orzechowo-otrębowy finisz.',
    formula: {
      flours: [
        { name: 'Mąka pszenna chlebowa typ 750', percentage: 75.0, type: 'pszenna_750' },
        { name: 'Mąka pszenna typ 1850 (Graham)', percentage: 15.0, type: 'pszenna_graham' },
        { name: 'Mąka żytnia typ 720', percentage: 10.0, type: 'zytnia_720' },
      ],
      waterPercentage: 69.0,
      saltPercentage: 2.0,
      starterPercentage: 20.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 930,
    },
    targetDDT: 24.5,
    // Garnek 232 °C: 20 min pod pokrywką, 20–25 min bez (PIE-GAR-001, D-304) [M1-audytor-generalny-008]
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 23,
    bakeTempSteamC: 232,
    bakeTempBrowningC: 232,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Klasyczna trójkombinacja mąk: pszenna jasna, graham i żytnia chlebowa. 3 serie delikatnego stretch & fold, garowanie w owalnym koszyku.',
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
    // Garnek 232 °C: 20 min pod pokrywką, 20–25 min bez (PIE-GAR-001, D-304) [M1-audytor-generalny-008]
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 22,
    bakeTempSteamC: 232,
    bakeTempBrowningC: 232,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Ziarna upraż na suchej patelni i zalej ciepłą wodą na 2 h przed dodaniem do ciasta przy laminacji. Orkisz wyrabiaj delikatnie, unikaj nadmiernego naciągania.',
  },
  {
    id: 'graham_bread_honey',
    namePl: 'Chleb Graham z miodem i siemieniem',
    category: 'sourdough',
    descriptionPl: 'Chleb z grubo mielonej mąki pszennej Graham z dodatkiem naturalnego miodu i siemienia lnianego.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 1850 (Graham)', percentage: 60.0, type: 'pszenna_graham' },
        { name: 'Mąka pszenna chlebowa typ 750', percentage: 40.0, type: 'pszenna_750' },
      ],
      waterPercentage: 72.0,
      saltPercentage: 2.0,
      starterPercentage: 20.0,
      starterHydration: 100.0,
      targetDoughWeightGrams: 900,
    },
    targetDDT: 25.0,
    // Garnek 232 °C: 20 min pod pokrywką, 20–25 min bez (PIE-GAR-001, D-304) [M1-audytor-generalny-008]
    bakeTimeSteamMinutes: 20,
    bakeTimeBrowningMinutes: 23,
    bakeTempSteamC: 232,
    bakeTempBrowningC: 232,
    recommendedVessel: 'dutch_oven',
    notesPl: 'Dodatek łyżki miodu wspomaga fermentację i łagodzi kwasowość. Grube otręby z Grahama wymagają 45-minutowej autolizy.',
  },
];
