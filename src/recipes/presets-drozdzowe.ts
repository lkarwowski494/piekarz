// ============================================================================
// Piekarz (Crust) — receptury bazowe BR-RECP-001: receptury drożdżowe (M3 p8, D-157: podział presets.ts na moduły).
// Treść przeniesiona bez zmian z presets.ts; kolejność listy ustala presets.ts. Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import type { RecipePreset } from './presets-types';

export const PRESETY_DROZDZOWE: RecipePreset[] = [
  {
    id: 'baguette_tradition_poolish',
    namePl: 'Bagietka paryska na poolishu',
    category: 'yeast',
    descriptionPl: 'Francuska bagietka na zaczynie poolish dojrzewającym około 14 godzin. Chrupiąca, cienka skórka i lekki, napowietrzony miękisz.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (Bułkowa)', percentage: 100.0, type: 'pszenna_650' },
      ],
      waterPercentage: 72.0,
      saltPercentage: 2.0,
      starterPercentage: 0.0,
      extraYeastPercentage: 2.2, // drożdże świeże, DRO-BAG-001 (217, D-100)
      targetDoughWeightGrams: 750,
    },
    targetDDT: 22.5,
    bakeTimeSteamMinutes: 10,
    bakeTimeBrowningMinutes: 15,
    bakeTempSteamC: 240,
    bakeTempBrowningC: 220,
    recommendedVessel: 'baking_steel',
    notesPl: 'Zaczyn poolish (20% mąki, 100% hydratacji). Piecz na rozgrzanej płycie stalowej albo kamieniu szamotowym, z dużą ilością pary. Poolish dojrzewa około 14 godzin, a ciasto rośnie 45 i jeszcze 45 minut.',
  },
  {
    id: 'ciabatta_con_biga',
    namePl: 'Włoska Ciabatta z Bigą (Wysoka Hydratacja 82%)',
    category: 'yeast',
    // zdanie-superlatyw usunięte (D-305, DRO-PRE-900) [M1-audytor-generalny-010]
    descriptionPl: 'Tradycyjna włoska ciabatta na sztywnym zaczynie Biga (50%).',
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
    notesPl: 'Biga (sztywny zaczyn 50% hydratacji) dojrzewający 16 h w 18°C. Do ciasta właściwego dodaj 3% oliwy z oliwek. Nie odgazowuj ciasta przed pieczeniem.',
  },
  {
    id: 'focaccia_genovese',
    namePl: 'Focaccia Genovese z solanką i rozmarynem',
    category: 'yeast',
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    descriptionPl: 'Focaccia z oliwą, rozmarynem i solą morską.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (Bułkowa)', percentage: 85.0, type: 'pszenna_650' },
        { name: 'Mąka z pszenicy durum (Semolina)', percentage: 15.0, type: 'durum' },
      ],
      waterPercentage: 80.0,
      saltPercentage: 2.2,
      starterPercentage: 0.0,
      extraYeastPercentage: 3.2, // drożdże świeże, DRO-FOC-001 (217, D-100)
      targetDoughWeightGrams: 900,
    },
    targetDDT: 24.0,
    bakeTimeSteamMinutes: 0,
    bakeTimeBrowningMinutes: 22,
    bakeTempSteamC: 230,
    bakeTempBrowningC: 230,
    recommendedVessel: 'baking_sheet',
    notesPl: 'Przełóż na obficie naoliwioną blachę. Przed pieczeniem polej solanką z wody, oliwy i soli i mocno wciśnij palce w ciasto, robiąc dołki. Ciasto rośnie 1,5–2 godziny, a rozciągnięte na blasze jeszcze 30 minut.',
  },
  {
    id: 'no_knead_night',
    namePl: 'Chleb nocny bez wyrabiania (drożdżowy)',
    category: 'yeast',
    // zdanie-superlatyw usunięte (D-305, DRO-PRE-900) [M1-audytor-generalny-010]
    descriptionPl: 'Mieszanie łyżką w 2 minuty, nocny rozrost na blacie i pieczenie w garnku.',
    formula: {
      flours: [
        { name: 'Mąka pszenna typ 650 (Bułkowa)', percentage: 100.0, type: 'pszenna_650' },
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
];
