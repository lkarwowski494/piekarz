// ============================================================================
// Piekarz (Crust) — Bake Loss & Crumb Moisture Calculator (RD-10, RD-10b, RD-10c)
// Scientific & Artisanal Literature Citations: docs/BAKING_PHYSICS_BIBLIOGRAPHY.md
// Hamelman (2012), Calvel (2001), DiMuzio (2009).
// ============================================================================

export type BakeTypePresetId = 'batard_boule' | 'tin_rye' | 'baguette_roll' | 'pan_focaccia' | 'custom';

export interface BakeLossPreset {
  id: BakeTypePresetId;
  namePl: string;
  defaultLossPercent: number;
  minLossPercent: number;
  maxLossPercent: number;
  descriptionPl: string;
}

export const BAKE_LOSS_PRESETS: BakeLossPreset[] = [
  {
    id: 'batard_boule',
    namePl: 'Chleb wiejski / Batard / Boule (garnek/kamień)',
    defaultLossPercent: 14.0,
    minLossPercent: 12.0,
    maxLossPercent: 16.0,
    descriptionPl: 'Klasyczny bochenek o wadze 750–900g. Standardowa utrata wilgoci w wypieku z zaparowaniem.',
  },
  {
    id: 'tin_rye',
    namePl: 'Chleb żytni / foremkowy',
    defaultLossPercent: 11.0,
    minLossPercent: 9.0,
    maxLossPercent: 13.0,
    descriptionPl: 'Foremka ogranicza powierzchnię parowania ścianek bocznych, zachowując wyższą wilgoć miękiszu.',
  },
  {
    id: 'baguette_roll',
    namePl: 'Bagietki / Bułki (duża powierzchnia odparowania)',
    defaultLossPercent: 18.0,
    minLossPercent: 15.0,
    maxLossPercent: 22.0,
    descriptionPl: 'Cienki przekrój i wysoki stosunek powierzchni skórki do masy skutkuje intensywnym odparowaniem wody.',
  },
  {
    id: 'pan_focaccia',
    namePl: 'Focaccia / Pizza na blasze',
    defaultLossPercent: 13.0,
    minLossPercent: 10.0,
    maxLossPercent: 15.0,
    descriptionPl: 'Oliwa na powierzchni ogranicza parowanie, utrzymując soczysty i napowietrzony miękisz.',
  },
  {
    id: 'custom',
    namePl: 'Własna strata piecowa',
    defaultLossPercent: 14.0,
    minLossPercent: 5.0,
    maxLossPercent: 30.0,
    descriptionPl: 'Ręcznie zdefiniowany procent utraty masy po pieczeniu i pełnym wystudzeniu.',
  },
];

export type CrumbMoistureCategory = 'dry' | 'balanced' | 'custardy_wet';

export interface BakeLossMetricsResult {
  doughWeightGrams: number;
  bakedWeightGrams: number;
  evaporatedWaterGrams: number;
  bakeLossPercent: number;
  retainedMoisturePercent: number;
  crumbMoistureCategory: CrumbMoistureCategory;
  categoryLabelPl: string;
  coolingAdvicePl: string;
  singleLoafBakedGrams?: number;
}

/**
 * RD-10: Bake Loss Estimation (typically 12% - 18%)
 */
export function calculateBakedWeight(doughWeightGrams: number, bakeLossPercent = 14.0): number {
  if (doughWeightGrams <= 0) return 0;
  return Math.round(doughWeightGrams * (1.0 - bakeLossPercent / 100.0));
}

/**
 * RD-10b: Comprehensive Bake Loss & Crumb Moisture Calculator
 * Calculates weight loss, evaporated water, retained crumb moisture percentage, and cooling recommendations.
 */
export function calculateBakeLossMetrics(
  doughWeightGrams: number,
  bakeLossPercent = 14.0,
  totalWaterGrams?: number,
  loavesCount = 1
): BakeLossMetricsResult {
  if (doughWeightGrams <= 0) {
    throw new Error('Masa ciasta musi być większa od zera');
  }
  if (bakeLossPercent <= 0 || bakeLossPercent >= 50) {
    throw new Error('Strata piecowa musi mieścić się w przedziale 1% - 49%');
  }

  const bakedWeight = Math.round(doughWeightGrams * (1.0 - bakeLossPercent / 100.0));
  const evaporated = doughWeightGrams - bakedWeight;

  // Total water in dough (if provided, otherwise estimated at 42% of dough weight ~ 70% hydration)
  const totalWater = totalWaterGrams !== undefined && totalWaterGrams > 0
    ? totalWaterGrams
    : doughWeightGrams * 0.42;

  const retainedWater = Math.max(0, totalWater - evaporated);
  const retainedMoisturePercent = Number(((retainedWater / (bakedWeight > 0 ? bakedWeight : 1)) * 100).toFixed(1));

  let crumbMoistureCategory: CrumbMoistureCategory;
  let categoryLabelPl: string;
  let coolingAdvicePl: string;

  if (retainedMoisturePercent >= 46.0) {
    crumbMoistureCategory = 'custardy_wet';
    categoryLabelPl = 'Mocno wilgotny / kremowy (Custardy Crumb)';
    coolingAdvicePl = 'Wysoka retencja wilgoci. Odczekaj min. 4–6 godzin na kratce przed krojeniem, by uniknąć kleistości noża i zakalca.';
  } else if (retainedMoisturePercent >= 38.0) {
    crumbMoistureCategory = 'balanced';
    categoryLabelPl = 'Równomierny / rzemieślniczy (Balanced)';
    coolingAdvicePl = 'Optymalna wilgotność. Chrupiąca skórka i soczysty miękisz o długiej świeżości. Studź min. 2 godziny.';
  } else {
    crumbMoistureCategory = 'dry';
    categoryLabelPl = 'Suchy / chrupki (Crisp Dry)';
    coolingAdvicePl = 'Niska wilgotność miękiszu (styl bagietkowy). Skórka bardzo krucha, krótszy czas zachowania świeżości.';
  }

  const singleLoafBakedGrams = loavesCount > 1 ? Math.round(bakedWeight / loavesCount) : bakedWeight;

  return {
    doughWeightGrams,
    bakedWeightGrams: bakedWeight,
    evaporatedWaterGrams: evaporated,
    bakeLossPercent,
    retainedMoisturePercent,
    crumbMoistureCategory,
    categoryLabelPl,
    coolingAdvicePl,
    singleLoafBakedGrams,
  };
}

/**
 * RD-10c: Required Raw Dough Mass given Desired Final Baked Loaf Mass
 * Computes exact raw dough mass to scale in the divider/bowl to yield target baked loaves after bake loss.
 */
export function calculateRequiredRawDoughWeight(
  targetBakedLoafGrams: number,
  bakeLossPercent = 14.0,
  loavesCount = 1
): number {
  if (targetBakedLoafGrams <= 0) {
    throw new Error('Docelowa waga upieczonego chleba musi być większa od zera');
  }
  if (bakeLossPercent <= 0 || bakeLossPercent >= 50) {
    throw new Error('Strata piecowa musi mieścić się w przedziale 1% - 49%');
  }
  const singleRaw = targetBakedLoafGrams / (1.0 - bakeLossPercent / 100.0);
  return Math.round(singleRaw * loavesCount);
}
