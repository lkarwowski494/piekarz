// ============================================================================
// Piekarz (Crust) — receptury bazowe BR-RECP-001: receptury żytnie (M3 p8, D-157: podział presets.ts na moduły).
// Treść przeniesiona bez zmian z presets.ts; kolejność listy ustala presets.ts. Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import type { RecipePreset } from './presets-types';

export const PRESETY_ZYTNIE: RecipePreset[] = [
  {
    id: 'rye_100_pan',
    namePl: 'Tradycyjny chleb 100% żytni razowy',
    category: 'rye',
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    descriptionPl: 'Razowiec żytni w keksówce, bez składania.',
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
    // D-305 (docs/tresci/pl/teksty-glownego-przeplywu.md) [M1-audytor-generalny-010]
    notesPl: 'Wymieszaj i od razu przełóż ciasto do wysmarowanej keksówki posypanej otrębami. Zostaw ciasto w formie, aż jego powierzchnia dojdzie do brzegu formy. Upieczony chleb żytni na zakwasie najlepiej pokroić dopiero po 24 godzinach odpoczynku.',
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
];
