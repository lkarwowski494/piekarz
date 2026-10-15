// ============================================================================
// Piekarz (Crust) — Core Domain Rules (RD-00…RD-15)
// Deterministic baking math, True Baker's %, DDT, and fermentation physics.
// Apps4Brew Studio — 100% Offline-First, Zero Cloud Dependencies.
// ============================================================================

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

export interface StarterFeedingResult {
  targetYieldGrams: number;
  starterGrams: number;
  flourGrams: number;
  waterGrams: number;
  ratioDescription: string;
}

export type SourdoughSafetyStatus = 'healthy' | 'kahm_yeast_safe' | 'toxic_mold_danger';

export interface SourdoughSafetyCheck {
  status: SourdoughSafetyStatus;
  titlePl: string;
  actionPl: string;
  isEdible: boolean;
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
 * RD-11: Sourdough Starter Feeding Calculator
 * Calculates starter, flour, and water quantities for a given ratio (e.g. 1:1:1, 1:2:2, 1:5:5).
 */
export function calculateStarterFeeding(
  targetYieldGrams: number,
  ratio: [number, number, number] = [1, 2, 2]
): StarterFeedingResult {
  const [sPart, fPart, wPart] = ratio;
  const totalParts = sPart + fPart + wPart;

  if (totalParts <= 0 || targetYieldGrams <= 0) {
    throw new Error('Parametry dokarmiania muszą być większe od zera');
  }

  const onePart = targetYieldGrams / totalParts;
  const starter = Math.round(onePart * sPart);
  const flour = Math.round(onePart * fPart);
  const water = Math.round(onePart * wPart);

  return {
    targetYieldGrams,
    starterGrams: starter,
    flourGrams: flour,
    waterGrams: water,
    ratioDescription: `${sPart}:${fPart}:${wPart}`,
  };
}

/**
 * RD-10: Bake Loss Estimation (typically 12% - 18%)
 */
export function calculateBakedWeight(doughWeightGrams: number, bakeLossPercent = 14.0): number {
  if (doughWeightGrams <= 0) return 0;
  return Math.round(doughWeightGrams * (1.0 - bakeLossPercent / 100.0));
}

/**
 * RD-13: Sourdough Safety Evaluation
 * Distinguishes harmless kahm yeast / hooch from hazardous mold.
 */
export function evaluateSourdoughSafety(observations: {
  hasHoochLiquid?: boolean;
  hasWhiteWrinkledFilm?: boolean;
  hasFuzzySpots?: boolean;
  hasColoredSpots?: boolean; // Pink, orange, green, black
  hasRottenSmell?: boolean;
}): SourdoughSafetyCheck {
  if (observations.hasFuzzySpots || observations.hasColoredSpots || observations.hasRottenSmell) {
    return {
      status: 'toxic_mold_danger',
      titlePl: 'ALARM: Wykryto niebezpieczną pleśń lub zgniliznę',
      actionPl: 'BEZWZGLĘDNIE WYRZUĆ ZAKWAS DO KOSZA. Słoik wygotuj we wrzątku lub wyrzuć. Pleśń wnika mikroskopijnymi strzępkami w całą masę — tego zakwasu NIE wolno ratować.',
      isEdible: false,
    };
  }

  if (observations.hasWhiteWrinkledFilm) {
    return {
      status: 'kahm_yeast_safe',
      titlePl: 'Bezpieczny kożuch drożdżowy (Kahm Yeast)',
      actionPl: 'To nieszkodliwy kożuch drożdży tlenowych (Kahm Yeast). Zdejmij czystą łyżką wierzchnią warstwę, pobierz 15 g zdrowego zakwasu ze spodu słoika i dokarm w nowym, czystym naczyniu.',
      isEdible: true,
    };
  }

  if (observations.hasHoochLiquid) {
    return {
      status: 'healthy',
      titlePl: 'Płyn głodowy (Hooch) — zakwas jest zdrowy, ale głodny',
      actionPl: 'Ciemny płyn na powierzchni o zapachu alkoholu to naturalny efekt głodu. Zlej płyn lub wymieszaj go, po czym niezwłocznie dokarm zakwas w proporcji 1:2:2.',
      isEdible: true,
    };
  }

  return {
    status: 'healthy',
    titlePl: 'Zakwas jest zdrowy i aktywny',
    actionPl: 'Prawidłowy zapach owocowo-kwasowy i równomierne napowietrzenie.',
    isEdible: true,
  };
}
