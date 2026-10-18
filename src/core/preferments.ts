// ============================================================================
// Piekarz (Crust) — Preferment Engine (RD-PREF-001…005)
// Artisan Preferments: Poolish, Biga, Pâte Fermentée & Levain.
// 100% Offline-First, Zero Cloud Dependencies.
// ============================================================================

export type PrefermentType = 'direct' | 'levain' | 'poolish' | 'biga' | 'pate_fermentee' | 'tangzhong' | 'yudane';

export interface PrefermentDefinition {
  type: PrefermentType;
  namePl: string;
  defaultHydration: number; // e.g. 100 for Poolish, 50 for Biga
  defaultPrefermentFlourPct: number; // % of total flour prefermented, e.g. 20%
  fermentationTimeHours: string; // e.g. '12–16h w 18–20°C'
  yeastPctOfPrefermentFlour: number; // % of preferment flour
  saltPctOfPrefermentFlour: number; // % of preferment flour
  flavorProfilePl: string;
}

export const PREFERMENT_DEFINITIONS: Record<PrefermentType, PrefermentDefinition> = {
  direct: {
    type: 'direct',
    namePl: 'Metoda bezpośrednia (Brak zaczynu)',
    defaultHydration: 0,
    defaultPrefermentFlourPct: 0,
    fermentationTimeHours: 'Brak',
    yeastPctOfPrefermentFlour: 0,
    saltPctOfPrefermentFlour: 0,
    flavorProfilePl: 'Świeży, prosty smak pszenny bez rozwiniętej kwasowości.',
  },
  poolish: {
    type: 'poolish',
    namePl: 'Poolish (Rzadki zaczyn 100%)',
    defaultHydration: 100.0,
    defaultPrefermentFlourPct: 20.0,
    fermentationTimeHours: '12–16h w 18–20°C (lub 4h w 24°C)',
    yeastPctOfPrefermentFlour: 0.1,
    saltPctOfPrefermentFlour: 0,
    flavorProfilePl: 'Słodkawy, orzechowy aromat, lekki maślany miękisz i cienka, chrupiąca skórka.',
  },
  biga: {
    type: 'biga',
    namePl: 'Biga (Sztywny zaczyn włoski 50%)',
    defaultHydration: 50.0,
    defaultPrefermentFlourPct: 30.0,
    fermentationTimeHours: '16–24h w 16–18°C (lub 24–48h w lodówce)',
    yeastPctOfPrefermentFlour: 1.0,
    saltPctOfPrefermentFlour: 0,
    flavorProfilePl: 'Głęboki, winny aromat, wysoka wytrzymałość ciasta i spektakularny piecowy skok.',
  },
  pate_fermentee: {
    type: 'pate_fermentee',
    namePl: 'Pâte Fermentée (Stare ciasto 65%)',
    defaultHydration: 65.0,
    defaultPrefermentFlourPct: 25.0,
    fermentationTimeHours: '12–24h w chłodzie (4–8°C)',
    yeastPctOfPrefermentFlour: 0.5,
    saltPctOfPrefermentFlour: 2.0,
    flavorProfilePl: 'Tradycyjny profil wiejskiego chleba francuskiego, łagodna kwasowość i zwarty miękisz.',
  },
  levain: {
    type: 'levain',
    namePl: 'Levain (Rzemieślniczy zaczyn na zakwasie 100%)',
    defaultHydration: 100.0,
    defaultPrefermentFlourPct: 20.0,
    fermentationTimeHours: '4–8h w 24–26°C do szczytu objętości',
    yeastPctOfPrefermentFlour: 0, // Dzikie drożdże z matki
    saltPctOfPrefermentFlour: 0,
    flavorProfilePl: 'Złożony bukiet kwasów mlekowego i octowego, wydłużona świeżość i niski indeks glikemiczny.',
  },
  tangzhong: {
    type: 'tangzhong',
    namePl: 'Tangzhong (Zaparzana mąka 1:5 w 65°C)',
    defaultHydration: 500.0,
    defaultPrefermentFlourPct: 7.0,
    fermentationTimeHours: 'Do ostygnięcia do temp. pokojowej',
    yeastPctOfPrefermentFlour: 0,
    saltPctOfPrefermentFlour: 0,
    flavorProfilePl: 'Uwięzienie wilgoci przez skleikowaną skrobię, jedwabisty miękisz i wielodniowa świeżość.',
  },
  yudane: {
    type: 'yudane',
    namePl: 'Yudane (Zaparzana mąka 1:1 we wrzątku 100°C)',
    defaultHydration: 100.0,
    defaultPrefermentFlourPct: 10.0,
    fermentationTimeHours: 'Min. 4h lub przez noc w lodówce',
    yeastPctOfPrefermentFlour: 0,
    saltPctOfPrefermentFlour: 0,
    flavorProfilePl: 'Karmelizacja i słodycz skrobi, miękki, elastyczny miękisz pieczywa japońskiego.',
  },
};

export interface PrefermentBreakdownInput {
  prefermentType: PrefermentType;
  prefermentFlourPercentage: number; // % of total flour (e.g. 20.0)
  totalFlourGrams: number;           // Total batch flour (e.g. 500g)
  totalTargetHydration: number;      // Overall hydration (e.g. 70.0%)
  saltPercentage: number;            // e.g. 2.0%
  customPrefermentHydration?: number;// e.g. 100 or 50
}

export interface PrefermentBreakdownResult {
  prefermentType: PrefermentType;
  // Preferment contents
  prefermentFlourGrams: number;
  prefermentWaterGrams: number;
  prefermentYeastGrams: number;
  prefermentSaltGrams: number;
  prefermentTotalWeightGrams: number;
  prefermentHydration: number;
  // Final dough additions
  doughAddedFlourGrams: number;
  doughAddedWaterGrams: number;
  doughAddedSaltGrams: number;
  doughYeastGrams: number;
  // Totals & Invariants check
  totalFlourGrams: number;
  totalWaterGrams: number;
  totalSaltGrams: number;
  totalDoughWeightGrams: number;
  overallHydrationPercent: number;
  fermentationTipPl: string;
}

/**
 * RD-PREF-01: Deterministic Preferment & Final Dough Decomposition
 * Strict Baker's % conservation ensuring preferment water & flour seamlessly balance into final dough.
 */
export function calculatePrefermentBreakdown(
  input: PrefermentBreakdownInput
): PrefermentBreakdownResult {
  const {
    prefermentType,
    prefermentFlourPercentage,
    totalFlourGrams,
    totalTargetHydration,
    saltPercentage,
    customPrefermentHydration,
  } = input;

  if (totalFlourGrams <= 0) {
    throw new Error('Całkowita masa mąki musi być większa od 0');
  }
  if (prefermentFlourPercentage < 0 || prefermentFlourPercentage > 100) {
    throw new Error('Udział mąki w zaczynie musi mieścić się w przedziale 0–100%');
  }

  const def = PREFERMENT_DEFINITIONS[prefermentType] || PREFERMENT_DEFINITIONS.direct;

  if (prefermentType === 'direct' || prefermentFlourPercentage === 0) {
    const totalWater = Math.round((totalFlourGrams * totalTargetHydration) / 100);
    const totalSalt = Number(((totalFlourGrams * saltPercentage) / 100).toFixed(1));
    const totalWeight = Math.round(totalFlourGrams + totalWater + totalSalt);

    return {
      prefermentType: 'direct',
      prefermentFlourGrams: 0,
      prefermentWaterGrams: 0,
      prefermentYeastGrams: 0,
      prefermentSaltGrams: 0,
      prefermentTotalWeightGrams: 0,
      prefermentHydration: 0,
      doughAddedFlourGrams: totalFlourGrams,
      doughAddedWaterGrams: totalWater,
      doughAddedSaltGrams: totalSalt,
      doughYeastGrams: 0,
      totalFlourGrams,
      totalWaterGrams: totalWater,
      totalSaltGrams: totalSalt,
      totalDoughWeightGrams: totalWeight,
      overallHydrationPercent: totalTargetHydration,
      fermentationTipPl: def.flavorProfilePl,
    };
  }

  const prefHydration = customPrefermentHydration ?? def.defaultHydration;

  // Preferment Flour and Water
  const prefFlourGrams = Math.round((totalFlourGrams * prefermentFlourPercentage) / 100);
  const prefWaterGrams = Math.round((prefFlourGrams * prefHydration) / 100);

  // Preferment Yeast and Salt
  const prefYeastGrams = Number(((prefFlourGrams * def.yeastPctOfPrefermentFlour) / 100).toFixed(2));
  const prefSaltGrams = Number(((prefFlourGrams * def.saltPctOfPrefermentFlour) / 100).toFixed(1));
  const prefTotalWeight = prefFlourGrams + prefWaterGrams + Math.round(prefYeastGrams) + Math.round(prefSaltGrams);

  // Total Formula Targets
  const totalWaterGrams = Math.round((totalFlourGrams * totalTargetHydration) / 100);
  const totalSaltGrams = Number(((totalFlourGrams * saltPercentage) / 100).toFixed(1));

  // Dough additions needed
  const doughAddedFlour = totalFlourGrams - prefFlourGrams;
  const doughAddedWater = Math.max(0, totalWaterGrams - prefWaterGrams);
  const doughAddedSalt = Number(Math.max(0, totalSaltGrams - prefSaltGrams).toFixed(1));

  const totalDoughWeight = totalFlourGrams + totalWaterGrams + Math.round(totalSaltGrams);
  const calculatedHydration = Number(((totalWaterGrams / totalFlourGrams) * 100).toFixed(1));

  return {
    prefermentType,
    prefermentFlourGrams: prefFlourGrams,
    prefermentWaterGrams: prefWaterGrams,
    prefermentYeastGrams: prefYeastGrams,
    prefermentSaltGrams: prefSaltGrams,
    prefermentTotalWeightGrams: prefTotalWeight,
    prefermentHydration: prefHydration,
    doughAddedFlourGrams: doughAddedFlour,
    doughAddedWaterGrams: doughAddedWater,
    doughAddedSaltGrams: doughAddedSalt,
    doughYeastGrams: 0,
    totalFlourGrams,
    totalWaterGrams,
    totalSaltGrams,
    totalDoughWeightGrams: totalDoughWeight,
    overallHydrationPercent: calculatedHydration,
    fermentationTipPl: `${def.namePl}: Czas dojrzewania ${def.fermentationTimeHours}. ${def.flavorProfilePl}`,
  };
}
