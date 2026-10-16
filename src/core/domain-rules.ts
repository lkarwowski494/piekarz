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
  tipPl?: string;
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

  let tipPl = 'Standardowe dokarmienie przed pieczeniem (4–6h w 24–26°C do szczytu objętości).';
  if (ratio[1] >= 5) {
    tipPl = 'Wysokie rozcieńczenie (1:5:5 lub 1:10:10) — dłuższy czas wyrastania (8–12h), idealne na noc.';
  } else if (ratio[1] === 1) {
    tipPl = 'Szybkie odświeżenie 1:1:1 — krótki czas wyrastania (2–4h), wysoka kwasowość.';
  }

  return {
    targetYieldGrams,
    starterGrams: starter,
    flourGrams: flour,
    waterGrams: water,
    ratioDescription: `${sPart}:${fPart}:${wPart}`,
    tipPl,
  };
}

export type SourdoughPhase = 'lag' | 'rising' | 'peak' | 'declining' | 'hungry';

export interface SourdoughPhaseResult {
  phase: SourdoughPhase;
  elapsedHours: number;
  labelPl: string;
  badgeColor: string;
  advicePl: string;
}

/**
 * RD-19: Sourdough Metabolic Phase and Peak Activity Indicator
 */
export function calculateStarterPhase(
  lastFedAt: number | undefined,
  storageState: 'ROOM_TEMP' | 'FRIDGE' = 'ROOM_TEMP',
  now: number = Date.now()
): SourdoughPhaseResult {
  if (!lastFedAt) {
    return {
      phase: 'hungry',
      elapsedHours: 999,
      labelPl: 'Brak danych o karmieniu',
      badgeColor: '#EF4444',
      advicePl: 'Zarejestruj dokarmienie, aby uruchomić śledzenie szczytu aktywności.',
    };
  }

  const diffMs = Math.max(0, now - lastFedAt);
  const elapsedHours = Number((diffMs / (1000 * 60 * 60)).toFixed(1));

  if (storageState === 'FRIDGE') {
    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays < 5) {
      return {
        phase: 'lag',
        elapsedHours,
        labelPl: `Uśpiony w lodówce (${elapsedDays} dni)`,
        badgeColor: '#3B82F6',
        advicePl: 'W niskiej temperaturze (4°C) metabolizm drożdży zwalnia. Przed pieczeniem wyjmij na 2–3h i dokarm.',
      };
    }
    return {
      phase: 'hungry',
      elapsedHours,
      labelPl: `Wymaga odświeżenia (${elapsedDays} dni w chłodzie)`,
      badgeColor: '#F59E0B',
      advicePl: 'Zakwas w lodówce powyżej 5 dni potrzebuje 1–2 karmień w temperaturze pokojowej przed przygotowaniem ciasta.',
    };
  }

  // Room temperature kinetics (21 - 24°C)
  if (elapsedHours < 2.0) {
    return {
      phase: 'lag',
      elapsedHours,
      labelPl: 'Faza adaptacji (Uśpienie)',
      badgeColor: '#6B7280',
      advicePl: 'Drożdże i bakterie mlekowe adaptują się do świeżej mąki. Brak widocznego wzrostu jest normalny.',
    };
  }
  if (elapsedHours < 5.0) {
    return {
      phase: 'rising',
      elapsedHours,
      labelPl: 'Aktywny rozrost (Wzrost objętości)',
      badgeColor: '#3B82F6',
      advicePl: 'Ciasto podwaja objętość, widać pierwsze pęcherze gazu i wypukłą kopułę.',
    };
  }
  if (elapsedHours <= 9.0) {
    return {
      phase: 'peak',
      elapsedHours,
      labelPl: 'Szczyt aktywności (PEAK) — Idealny moment!',
      badgeColor: '#10B981',
      advicePl: 'Maksymalna objętość i siła pędna drożdży. Najlepszy moment na dodanie do ciasta chlebowego!',
    };
  }
  if (elapsedHours <= 14.0) {
    return {
      phase: 'declining',
      elapsedHours,
      labelPl: 'Wypłaszczenie / Lekki spadek',
      badgeColor: '#F59E0B',
      advicePl: 'Kopuła zaczyna się zapadać, rośnie kwasowość octowa. Chleb będzie wyraźniej kwaskowaty.',
    };
  }
  return {
    phase: 'hungry',
    elapsedHours,
    labelPl: 'Głód / Opadnięcie',
    badgeColor: '#EF4444',
    advicePl: 'Pożywka zużyta. Zlej ewentualny płyn głodowy (Hooch) i dokarm zakwas w proporcji 1:2:2.',
  };
}

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

