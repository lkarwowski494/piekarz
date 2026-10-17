// ============================================================================
// Piekarz (Crust) — Core Domain Rules (RD-00…RD-15)
// Deterministic baking math, True Baker's %, DDT, and fermentation physics.
// Apps4Craft Studio — 100% Offline-First, Zero Cloud Dependencies.
// Scientific & Artisanal Literature Citations: docs/BAKING_PHYSICS_BIBLIOGRAPHY.md
// References: Hamelman (2012), Calvel (2001), DiMuzio (2009), Buehler (2006).
// ============================================================================

export * from './bake-loss';
export * from './sourdough-physics';

export interface FlourItemInput {
  name: string;
  percentage: number; // e.g. 80.0 for 80%
  type?: string;      // e.g. 'pszenna_750', 'zytnia_2000'
}

export interface FlourItemCalculated {
  name: string;
  percentage: number;
  weightGrams: number;
}

export interface DoughRecipeInput {
  flours: FlourItemInput[];
  waterPercentage: number;     // Water added directly (e.g. 70.0 for 70%)
  saltPercentage: number;      // e.g. 2.0 for 2%
  starterPercentage: number;   // e.g. 20.0 for 20%
  starterHydration?: number;   // default 100% (equal flour and water)
  extraYeastPercentage?: number; // e.g. 0.0 or 0.2%
  targetDoughWeightGrams: number; // Target total batch weight
}

export interface DoughRecipeResult {
  targetDoughWeightGrams: number;
  baseFlourWeightGrams: number;
  flours: FlourItemCalculated[];
  waterGrams: number;
  saltGrams: number;
  starterGrams: number;
  starterFlourGrams: number;
  starterWaterGrams: number;
  yeastGrams: number;
  totalFlourGrams: number;     // Including flour in starter
  totalWaterGrams: number;     // Including water in starter
  overallHydrationPercent: number; // True Baker's % (total water / total flour * 100)
  sumCheckGrams: number;
  isHighRye: boolean;          // True if rye flours >= 50%
}

export interface DDTSettings {
  targetDDT: number;      // Desired Dough Temperature (°C), e.g. 25.0
  flourTemp: number;      // Flour temperature (°C), e.g. 20.0
  roomTemp: number;       // Ambient kitchen temperature (°C), e.g. 22.0
  starterTemp?: number;   // Sourdough starter temperature (°C), e.g. 22.0
  frictionFactor: number; // Friction temperature increase (°C), e.g. 2.0
}

export interface DDTResult {
  waterTempTarget: number;
  status: 'normal' | 'too_hot_danger' | 'requires_ice';
  warningMessagePl?: string;
}

export interface IceCalculationResult {
  iceGrams: number;
  waterGrams: number;
  totalWaterGrams: number;
}

export interface FermentationAdaptationResult {
  baseHours: number;
  adaptedHours: number;
  adaptedMinutesFormatted: string;
  diffMinutes: number;
  temperatureCelsius: number;
  messagePl: string;
}

/**
 * RD-00 & RD-02: True Baker's Percentage & Mass Balance Scaling
 * Scales dough recipe strictly to the desired total dough weight without intermediate rounding drift.
 */
export function calculateDoughRecipe(input: DoughRecipeInput): DoughRecipeResult {
  if (input.targetDoughWeightGrams <= 0) {
    throw new Error('Docelowa waga ciasta musi być większa od zera');
  }

  // Validate flour blend sum
  const flourSumPercent = input.flours.reduce((sum, f) => sum + f.percentage, 0);
  if (Math.abs(flourSumPercent - 100.0) > 0.01) {
    throw new Error(`Suma procentów mąk musi wynosić 100% (aktualnie: ${flourSumPercent.toFixed(1)}%)`);
  }

  const starterHydr = input.starterHydration ?? 100.0;
  const yeastPct = input.extraYeastPercentage ?? 0.0;

  // Total baker's percentage sum:
  // Base Flour (100%) + Water% + Salt% + Starter% + Yeast%
  const totalFormulaPercentage = 100.0 + input.waterPercentage + input.saltPercentage + input.starterPercentage + yeastPct;

  // Base flour mass in grams
  const baseFlourWeight = input.targetDoughWeightGrams / (totalFormulaPercentage / 100.0);

  // Calculate each component
  const waterWeight = (baseFlourWeight * input.waterPercentage) / 100.0;
  const saltWeight = (baseFlourWeight * input.saltPercentage) / 100.0;
  const starterWeight = (baseFlourWeight * input.starterPercentage) / 100.0;
  const yeastWeight = (baseFlourWeight * yeastPct) / 100.0;

  // Breakdown of starter into flour and water:
  // starterHydration = (starterWater / starterFlour) * 100 => starterWeight = starterFlour * (1 + starterHydr / 100)
  const starterFlour = starterWeight / (1.0 + starterHydr / 100.0);
  const starterWater = starterWeight - starterFlour;

  // Total flour & water in batch
  const totalFlour = baseFlourWeight + starterFlour;
  const totalWater = waterWeight + starterWater;

  // True Overall Hydration
  const overallHydration = (totalWater / totalFlour) * 100.0;

  // Calculate individual flour weights
  const floursCalculated: FlourItemCalculated[] = input.flours.map((f) => ({
    name: f.name,
    percentage: f.percentage,
    weightGrams: Math.round((baseFlourWeight * f.percentage) / 100.0),
  }));

  // Detect rye ratio
  const ryePercentage = input.flours
    .filter((f) => f.name.toLowerCase().includes('żyt') || (f.type && f.type.toLowerCase().includes('zytn')))
    .reduce((sum, f) => sum + f.percentage, 0);
  const isHighRye = ryePercentage >= 50.0;

  const waterRounded = Math.round(waterWeight);
  const saltRounded = Number(saltWeight.toFixed(1));
  const starterRounded = Math.round(starterWeight);
  const yeastRounded = Number(yeastWeight.toFixed(1));
  const baseFlourRounded = Math.round(baseFlourWeight);

  const sumCheck = baseFlourRounded + waterRounded + Math.round(saltRounded) + starterRounded + Math.round(yeastRounded);

  return {
    targetDoughWeightGrams: input.targetDoughWeightGrams,
    baseFlourWeightGrams: baseFlourRounded,
    flours: floursCalculated,
    waterGrams: waterRounded,
    saltGrams: saltRounded,
    starterGrams: starterRounded,
    starterFlourGrams: Math.round(starterFlour),
    starterWaterGrams: Math.round(starterWater),
    yeastGrams: yeastRounded,
    totalFlourGrams: Math.round(totalFlour),
    totalWaterGrams: Math.round(totalWater),
    overallHydrationPercent: Number(overallHydration.toFixed(2)),
    sumCheckGrams: sumCheck,
    isHighRye,
  };
}

/**
 * RD-05: Desired Dough Temperature (DDT) Calculation
 * Calculates required water temperature using 4-factor formula (with starter) or 3-factor (without starter).
 */
export function calculateDDTWaterTemp(settings: DDTSettings): DDTResult {
  const hasStarter = settings.starterTemp !== undefined;
  let targetWater: number;

  if (hasStarter) {
    // 4-factor formula
    targetWater = 4 * settings.targetDDT - (settings.flourTemp + settings.roomTemp + settings.starterTemp! + settings.frictionFactor);
  } else {
    // 3-factor formula
    targetWater = 3 * settings.targetDDT - (settings.flourTemp + settings.roomTemp + settings.frictionFactor);
  }

  const roundedWater = Number(targetWater.toFixed(1));

  if (roundedWater > 45.0) {
    return {
      waterTempTarget: roundedWater,
      status: 'too_hot_danger',
      warningMessagePl: 'Uwaga: Obliczona temperatura wody przekracza 45°C. Ryzyko ugotowania drożdży i bakterii kwasu mlekowego! Schłodź mąkę lub obniż temperaturę otoczenia.',
    };
  }

  if (roundedWater < 4.0) {
    return {
      waterTempTarget: roundedWater,
      status: 'requires_ice',
      warningMessagePl: 'Obliczona temperatura wody jest poniżej 4°C. Aby uzyskać tę temperaturę bez zamrażania, zastąp część wody lodem.',
    };
  }

  return {
    waterTempTarget: roundedWater,
    status: 'normal',
  };
}

export const calculateDDT = calculateDDTWaterTemp;

/**
 * RD-07: Ice Calculation for Cold Water Requirement
 * Calculates grams of ice to melt in tap water to reach target low water temperature.
 * Formula: IceGrams = TotalWater * (TapTemp - TargetTemp) / (80 + TapTemp)
 */
export function calculateIceRequirement(
  totalWaterGrams: number,
  tapWaterTempC: number,
  targetWaterTempC: number
): IceCalculationResult {
  if (targetWaterTempC >= tapWaterTempC) {
    return {
      iceGrams: 0,
      waterGrams: totalWaterGrams,
      totalWaterGrams,
    };
  }

  const latentHeatFactor = 80.0 + tapWaterTempC;
  const ice = totalWaterGrams * ((tapWaterTempC - targetWaterTempC) / latentHeatFactor);
  const iceRounded = Math.round(ice);
  const remainingWater = totalWaterGrams - iceRounded;

  return {
    iceGrams: iceRounded,
    waterGrams: remainingWater,
    totalWaterGrams,
  };
}

export const calculateIceWaterMath = calculateIceRequirement;

/**
 * RD-08: Temperature-Dependent Fermentation Time Adaptation (Q10 = 2.0)
 * Adapts fermentation duration based on actual dough/ambient temperature.
 */
export function calculateFermentationAdaptation(
  baseHours: number,
  actualTempC: number,
  baseCalibrationTempC = 24.0
): FermentationAdaptationResult {
  if (baseHours <= 0 || actualTempC <= 0) {
    throw new Error('Czas bazowy i temperatura muszą być większe od zera');
  }

  // Q10 factor formula: time(T) = baseTime * 2^((baseT - actualT) / 10)
  const exponent = (baseCalibrationTempC - actualTempC) / 10.0;
  const factor = Math.pow(2.0, exponent);
  const adaptedHours = baseHours * factor;

  const diffHours = adaptedHours - baseHours;
  const diffMinutes = Math.round(diffHours * 60);

  const totalMinutes = Math.round(adaptedHours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const formatted = h > 0 ? `${h}h ${m}m` : `${m}m`;

  let msg: string;
  if (Math.abs(diffMinutes) < 5) {
    msg = `Temperatura optymalna (${actualTempC.toFixed(1)}°C). Czas zgodny z recepturą.`;
  } else if (diffMinutes < 0) {
    msg = `Ciepło w kuchni (${actualTempC.toFixed(1)}°C). Czas fermentacji skrócony o ${Math.abs(diffMinutes)} min (ochrona przed przekwaszeniem).`;
  } else {
    msg = `Chłodno w kuchni (${actualTempC.toFixed(1)}°C). Czas fermentacji wydłużony o ${diffMinutes} min (wolniejsza praca drożdży).`;
  }

  return {
    baseHours,
    adaptedHours: Number(adaptedHours.toFixed(2)),
    adaptedMinutesFormatted: formatted,
    diffMinutes,
    temperatureCelsius: actualTempC,
    messagePl: msg,
  };
}

export const adaptFermentationTimeForTemp = calculateFermentationAdaptation;

/**
 * RD-04: Yeast Conversion (Fresh Compressed vs Instant Dry Yeast 3:1)
 */
export function convertYeast(
  amountGrams: number,
  from: 'fresh' | 'instant'
): { freshGrams: number; instantGrams: number } {
  if (amountGrams < 0) {
    throw new Error('Masa drożdży nie może być ujemna');
  }

  if (from === 'fresh') {
    const instant = Number((amountGrams / 3.0).toFixed(2));
    return { freshGrams: amountGrams, instantGrams: instant };
  } else {
    const fresh = Number((amountGrams * 3.0).toFixed(1));
    return { freshGrams: fresh, instantGrams: amountGrams };
  }
}

/**
 * RD-16: Calculate recipe scaling from given base flour weight
 */
export function calculateDoughRecipeFromFlour(
  flourGrams: number,
  input: Omit<DoughRecipeInput, 'targetDoughWeightGrams'>
): DoughRecipeResult {
  if (flourGrams <= 0) {
    throw new Error('Waga mąki musi być większa od zera');
  }
  const yeastPct = input.extraYeastPercentage ?? 0.0;
  const totalFormulaPercentage = 100.0 + input.waterPercentage + input.saltPercentage + input.starterPercentage + yeastPct;
  const targetDoughWeightGrams = Math.round(flourGrams * (totalFormulaPercentage / 100.0));
  return calculateDoughRecipe({
    ...input,
    targetDoughWeightGrams,
  });
}

/**
 * RD-17: Calculate recipe scaling from target number and weight of loaves
 */
export function calculateDoughRecipeForLoaves(
  loavesCount: number,
  loafWeightGrams: number,
  input: Omit<DoughRecipeInput, 'targetDoughWeightGrams'>
): DoughRecipeResult {
  if (loavesCount <= 0 || loafWeightGrams <= 0) {
    throw new Error('Liczba bochenków i gramatura muszą być większe od zera');
  }
  const targetDoughWeightGrams = Math.round(loavesCount * loafWeightGrams);
  return calculateDoughRecipe({
    ...input,
    targetDoughWeightGrams,
  });
}

export type HydrationDifficulty = 'easy' | 'artisan_standard' | 'high_open_crumb' | 'expert_sticky';

export interface HydrationDifficultyInfo {
  level: HydrationDifficulty;
  labelPl: string;
  badgeColor: string;
  tipPl: string;
}

/**
 * RD-18: Practical handling difficulty classification based on water percentage
 */
export function getHydrationDifficulty(waterPercentage: number): HydrationDifficultyInfo {
  if (waterPercentage < 68) {
    return {
      level: 'easy',
      labelPl: 'Łatwe w prowadzeniu',
      badgeColor: '#10B981',
      tipPl: 'Ciasto zwięzłe, nie klei się do rąk. Idealne do nauki formowania bochenka.',
    };
  }
  if (waterPercentage <= 75) {
    return {
      level: 'artisan_standard',
      labelPl: 'Klasyk rzemieślniczy',
      badgeColor: '#3B82F6',
      tipPl: 'Zrównoważona elastyczność i wilgotność. Wymaga 3–4 standardowych składań.',
    };
  }
  if (waterPercentage <= 82) {
    return {
      level: 'high_open_crumb',
      labelPl: 'Wysoka hydratacja (Otwarty miękisz)',
      badgeColor: '#F59E0B',
      tipPl: 'Ciasto miękkie i napowietrzone. Zalecana technika Coil Fold mokrymi dłońmi i mąka o wysokim W.',
    };
  }
  return {
    level: 'expert_sticky',
    labelPl: 'Ekstremalna hydratacja (Ekspert)',
    badgeColor: '#EF4444',
    tipPl: 'Bardzo lejące ciasto. Wymaga mocnej mąki (np. Manitoba) i precyzyjnego budowania siły ciasta.',
  };
}

export interface FlourBlendPreset {
  id: string;
  namePl: string;
  flours: FlourItemInput[];
}

export const POPULAR_FLOUR_BLENDS: FlourBlendPreset[] = [
  {
    id: 'blend_100_wheat',
    namePl: '100% Pszenna chlebowa',
    flours: [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100.0, type: 'pszenna_750' }],
  },
  {
    id: 'blend_classic_rye_touch',
    namePl: '80% Pszenna + 20% Żytnia (Klasyk)',
    flours: [
      { name: 'Mąka pszenna chlebowa typ 750', percentage: 80.0, type: 'pszenna_750' },
      { name: 'Mąka żytnia typ 720', percentage: 20.0, type: 'zytnia_720' },
    ],
  },
  {
    id: 'blend_artisan_three_flours',
    namePl: '70% Pszenna + 20% Orkisz + 10% Żytnia',
    flours: [
      { name: 'Mąka pszenna chlebowa typ 750', percentage: 70.0, type: 'pszenna_750' },
      { name: 'Mąka orkiszowa jasna typ 630', percentage: 20.0, type: 'orkiszowa' },
      { name: 'Mąka żytnia razowa typ 2000', percentage: 10.0, type: 'zytnia_2000' },
    ],
  },
  {
    id: 'blend_wheat_graham',
    namePl: '80% Pszenna + 20% Graham (Pełne ziarno)',
    flours: [
      { name: 'Mąka pszenna chlebowa typ 750', percentage: 80.0, type: 'pszenna_750' },
      { name: 'Mąka pszenna graham typ 1850', percentage: 20.0, type: 'graham' },
    ],
  },
  {
    id: 'blend_half_half',
    namePl: '50% Pszenna + 50% Żytnia (Pół na pół)',
    flours: [
      { name: 'Mąka pszenna chlebowa typ 750', percentage: 50.0, type: 'pszenna_750' },
      { name: 'Mąka żytnia typ 720', percentage: 50.0, type: 'zytnia_720' },
    ],
  },
];
