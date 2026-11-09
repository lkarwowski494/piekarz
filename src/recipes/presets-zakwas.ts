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
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    descriptionPl: 'Bochenek pszenno-żytni na zakwasie.',
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
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    notesPl: 'Wypiek w garnku żeliwnym. Ciasto rozciągaj i składaj w czasie fermentacji, a garuj w lodówce.',
  },
  {
    id: 'tartine_high_hydration_80',
    namePl: 'Wiejski chleb na zakwasie, 80%',
    category: 'sourdough',
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    descriptionPl: 'Bochenek na zakwasie o wysokiej hydratacji.',
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
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    notesPl: 'Autoliza 60 minut bez soli. Ciasto rozciągaj i składaj delikatnie w czasie fermentacji.',
  },
  {
    id: 'san_francisco_sourdough',
    namePl: 'Chleb w stylu San Francisco o wyrazistej kwasowości',
    category: 'sourdough',
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    descriptionPl: 'Chleb na zakwasie w stylu San Francisco.',
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
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    notesPl: 'Wydłużona fermentacja w chłodzie. Niższą temperaturę fermentacji wiąże się z kwasem octowym. Wypiek w garnku żeliwnym.',
  },
  {
    id: 'pain_de_campagne',
    namePl: 'Francuski Pain de Campagne (Chleb Wiejski)',
    category: 'sourdough',
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    descriptionPl: 'Bochenek na zakwasie z mąki pszennej jasnej, graham i żytniej.',
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
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    notesPl: 'Ciasto rozciągaj i składaj w czasie fermentacji, a garuj w owalnym koszyku.',
  },
  {
    id: 'spelt_ancient_seeded',
    namePl: 'Pradawny chleb orkiszowy z prażonymi ziarnami',
    category: 'sourdough',
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    descriptionPl: 'Bochenek orkiszowy na zakwasie z prażonym siemieniem, słonecznikiem i sezamem.',
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
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    notesPl: 'Ziarna upraż na suchej patelni i namocz w ciepłej wodzie, zanim dodasz je do ciasta.',
  },
  {
    id: 'graham_bread_honey',
    namePl: 'Chleb Graham z miodem i siemieniem',
    category: 'sourdough',
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    descriptionPl: 'Chleb na zakwasie z mąki graham, z miodem i siemieniem lnianym.',
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
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    notesPl: 'Przed dodaniem soli i zakwasu zostaw mąkę z wodą na autolizę.',
  },
];
