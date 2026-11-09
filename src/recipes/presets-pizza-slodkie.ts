// ============================================================================
// Piekarz (Crust) — receptury bazowe BR-RECP-001: pizza i receptury słodkie (M3 p8, D-157: podział presets.ts na moduły).
// Treść przeniesiona bez zmian z presets.ts; kolejność listy ustala presets.ts. Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import type { RecipePreset } from './presets-types';

export const PRESETY_PIZZA_SLODKIE: RecipePreset[] = [
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
    // Keksówka 177 °C, 28 min (20 + 8–10), bez pary (PIE-BRI-001, D-304) [M1-audytor-generalny-008]
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 28,
    bakeTempSteamC: 177,
    bakeTempBrowningC: 177,
    recommendedVessel: 'bread_pan',
    notesPl: 'Lievito Madre odśwież 3 razy co 4 h przed zarobieniem ciasta. Masło (25%) dodawaj stopniowo porcjami pod koniec wyrabiania, gdy siatka glutenowa jest już w pełni rozwinięta.',
  },
  {
    id: 'pizza_napoletana_48h',
    namePl: 'Pizza w stylu neapolitańskim',
    category: 'pizza',
    descriptionPl: 'Ciasto na pizzę w stylu neapolitańskim o chrupiącym brzegu i delikatnym wnętrzu.',
    formula: {
      flours: [
        { name: 'Mąka pszenna włoska Tipo 00', percentage: 100.0, type: 'tipo_00' },
      ],
      waterPercentage: 65.0,
      saltPercentage: 2.8,
      starterPercentage: 0.0,
      extraYeastPercentage: 0.4, // drożdże świeże, DRO-PIZ-002 (217, D-100)
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 23.0,
    // 260 °C, 0 + 6 min na stali, grill 2–3 min w notesPl: PIE-PIZ-001 (D-303) [M1-audytor-generalny-009]
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 6,
    bakeTempSteamC: 260,
    bakeTempBrowningC: 260,
    recommendedVessel: 'baking_steel',
    notesPl: 'Ciasto rośnie w temperaturze pokojowej co najmniej 12, a najwyżej 24 godziny. Po podziale na kulki rośnie jeszcze 45–60 minut, gdy nagrzewa się piekarnik. Stal nagrzewaj w 260 °C co najmniej 30 minut, a po 6 minutach pieczenia włącz górny grill na 2–3 minuty; bez grilla piecz kilka minut dłużej.',
  },
  {
    id: 'sweet_chalka',
    namePl: 'Maślana chałka drożdżowa',
    category: 'sweet',
    descriptionPl: 'Puszysta, słodka chałka zaplatana w warkocz z kruszonką. Idealna na niedzielne śniadanie.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 550 (Luksusowa)', percentage: 100.0, type: 'pszenna_550' },
      ],
      waterPercentage: 45.0,
      saltPercentage: 1.0,
      starterPercentage: 0.0,
      extraYeastPercentage: 6.3, // drożdże świeże, DRO-CHA-001 (217, D-100)
      targetDoughWeightGrams: 750,
    },
    targetDDT: 26.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 25,
    bakeTempSteamC: 180,
    bakeTempBrowningC: 180,
    recommendedVessel: 'baking_sheet',
    notesPl: 'Wyrabiaj z dodatkiem masła i cukru. Po wyrośnięciu zapleć warkocz, posmaruj roztrzepanym jajkiem i posyp kruszonką. Ciasto rośnie około 2 godzin, a zapleciona chałka 60–90 minut.',
  },
];
