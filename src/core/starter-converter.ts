// ============================================================================
// Piekarz (Crust) — Sourdough Starter & Lievito Madre Converter Engine
// Deterministic Hydration Transformation & Recipe Substitution Calculator.
// 100% Offline-First, Zero Cloud Dependencies.
// ============================================================================

export interface StarterTypePreset {
  id: string;
  namePl: string;
  hydration: number;
  descriptionPl: string;
}

export const STARTER_PRESETS: StarterTypePreset[] = [
  {
    id: 'lievito_madre_50',
    namePl: 'Lievito Madre / Pasta Madre (50%)',
    hydration: 50.0,
    descriptionPl: 'Tradycyjny włoski gęsty zakwas. Łagodna kwasowość mlekowa, idealny do panettone, chałek i pizzy.',
  },
  {
    id: 'stiff_rye_60',
    namePl: 'Sztywny zakwas żytni (60%)',
    hydration: 60.0,
    descriptionPl: 'Gęsty zakwas żytni do ciężkich chlebów razowych. Wzmacnia strukturę miękiszu i chroni enzymy.',
  },
  {
    id: 'liquid_levain_100',
    namePl: 'Płynny Levain (100%)',
    hydration: 100.0,
    descriptionPl: 'Klasyczny rzemieślniczy zakwas 1:1. Zrównoważony profil kwasowy, łatwy do dozowania.',
  },
  {
    id: 'semi_liquid_80',
    namePl: 'Półpłynny zakwas (80%)',
    hydration: 80.0,
    descriptionPl: 'Umiarkowanie gęsty zaczyn pszenny do pieczywa tostowego i bagietek.',
  },
  {
    id: 'batter_120',
    namePl: 'Rzadki zakwas / Batter (120%)',
    hydration: 120.0,
    descriptionPl: 'Wysokouwodniony zaczyn o szybkiej fermentacji i wyraźniejszej kwasowości octowej.',
  },
];

export interface RecipeStarterSubstitutionInput {
  recipeStarterGrams: number;
  recipeStarterHydration: number;
  userStarterHydration: number;
}

export interface RecipeStarterSubstitutionResult {
  recipeStarterGrams: number;
  recipeStarterHydration: number;
  userStarterHydration: number;
  userStarterGrams: number;
  waterAdjustmentGrams: number; // >0: add water to dough; <0: reduce water in dough
  flourAdjustmentGrams: number; // always 0 to preserve fermented flour mass
  starterFlourGrams: number;
  doughWaterAction: 'ADD' | 'REDUCE' | 'NONE';
  advicePl: string;
  /** Szablon porady + parametry do t() przy wyświetlaniu [M1-audytor-generalny-047] */
  adviceTemplatePl: string;
  adviceParams: Record<string, number>;
}

export interface StarterHydrationConversionInput {
  targetYieldGrams: number;
  sourceHydration: number;
  targetHydration: number;
  seedStarterGrams?: number;
  seedRatioPercent?: number; // % of target flour from seed (default: 20%)
}

export interface StarterHydrationConversionResult {
  targetYieldGrams: number;
  sourceHydration: number;
  targetHydration: number;
  seedStarterGrams: number;
  addedFlourGrams: number;
  addedWaterGrams: number;
  actualYieldGrams: number;
  actualHydration: number;
  tipPl: string;
  /** Szablon wskazówki + parametry i opcjonalne zdanie o konsystencji (do t()) [M1-audytor-generalny-047] */
  tipTemplatePl: string;
  tipParams: Record<string, number>;
  tipConsistencyPl?: string;
}

/**
 * Calculates recipe substitution when the user's starter hydration differs from the recipe's starter.
 * Preserves 100% of the recipe's total flour and target overall dough hydration.
 */
export function calculateRecipeStarterSubstitution(
  input: RecipeStarterSubstitutionInput
): RecipeStarterSubstitutionResult {
  const { recipeStarterGrams, recipeStarterHydration, userStarterHydration } = input;

  if (recipeStarterGrams <= 0) {
    throw new Error('Masa zakwasu w przepisie musi być większa od zera');
  }
  if (recipeStarterHydration <= 0 || userStarterHydration <= 0) {
    throw new Error('Hydratacja zakwasu musi być większa od zera');
  }

  // Flour and water inside the recipe's prescribed starter
  const recipeFlour = recipeStarterGrams / (1.0 + recipeStarterHydration / 100.0);
  const recipeWater = recipeStarterGrams - recipeFlour;

  // We keep the fermented flour identical
  const userStarterWeight = recipeFlour * (1.0 + userStarterHydration / 100.0);
  const userWater = userStarterWeight - recipeFlour;

  // Water delta: recipeWater - userWater
  // If > 0, the user starter brings less water than recipe starter -> ADD to dough
  // If < 0, the user starter brings more water than recipe starter -> REDUCE from dough
  const waterAdjustment = Number((recipeWater - userWater).toFixed(1));
  const roundedUserStarter = Math.round(userStarterWeight);

  let action: 'ADD' | 'REDUCE' | 'NONE' = 'NONE';
  let adviceTemplatePl = 'Hydratacja zakwasu jest identyczna — brak konieczności korekty wody w cieście.';
  // Liczby zostają liczbami: t() formatuje je według języka aplikacji [M1-audytor-generalny-070]
  const adviceParams: Record<string, number> = {
    twoj: userStarterHydration,
    przepis: recipeStarterHydration,
    zakwas: roundedUserStarter,
    woda: Math.abs(waterAdjustment),
  };

  if (waterAdjustment > 0.4) {
    action = 'ADD';
    adviceTemplatePl =
      'Twój zakwas ({twoj}%) jest gęstszy niż w przepisie ({przepis}%). Użyj {zakwas}g zakwasu i DODAJ {woda}g wody do ciasta właściwego.';
  } else if (waterAdjustment < -0.4) {
    action = 'REDUCE';
    adviceTemplatePl =
      'Twój zakwas ({twoj}%) jest rzadszy niż w przepisie ({przepis}%). Użyj {zakwas}g zakwasu i ODEJMIJ {woda}g wody z ciasta właściwego.';
  }
  const advicePl = Object.entries(adviceParams).reduce((s, [k, v]) => s.split(`{${k}}`).join(`${v}`), adviceTemplatePl);

  return {
    recipeStarterGrams,
    recipeStarterHydration,
    userStarterHydration,
    userStarterGrams: roundedUserStarter,
    waterAdjustmentGrams: waterAdjustment,
    flourAdjustmentGrams: 0,
    starterFlourGrams: Math.round(recipeFlour),
    doughWaterAction: action,
    advicePl,
    adviceTemplatePl,
    adviceParams,
  };
}

/**
 * Calculates the exact feeding amounts (seed mother, flour, water)
 * to convert an existing starter into a target starter of any hydration.
 */
export function convertStarterHydration(
  input: StarterHydrationConversionInput
): StarterHydrationConversionResult {
  const { targetYieldGrams, sourceHydration, targetHydration } = input;

  if (targetYieldGrams <= 0) {
    throw new Error('Docelowa masa zakwasu musi być większa od zera');
  }
  if (sourceHydration <= 0 || targetHydration <= 0) {
    throw new Error('Hydratacje muszą być większe od zera');
  }

  // Target flour & water
  const targetFlour = targetYieldGrams / (1.0 + targetHydration / 100.0);
  const targetWater = targetYieldGrams - targetFlour;

  let seedGrams: number;

  if (input.seedStarterGrams !== undefined && input.seedStarterGrams > 0) {
    seedGrams = input.seedStarterGrams;
  } else {
    // Default seed ratio: 20% of target flour comes from seed
    const ratio = (input.seedRatioPercent ?? 20.0) / 100.0;
    const seedFlour = targetFlour * ratio;
    seedGrams = Math.round(seedFlour * (1.0 + sourceHydration / 100.0));
  }

  // Calculate flour and water contributed by the seed
  const seedFlour = seedGrams / (1.0 + sourceHydration / 100.0);
  const seedWater = seedGrams - seedFlour;

  if (seedFlour > targetFlour || seedWater > targetWater) {
    throw new Error(
      'Masa zakwasu matki jest zbyt duża w stosunku do docelowej masy lub hydratacji. Zmniejsz masę matki.'
    );
  }

  const addedFlour = Math.round(targetFlour - seedFlour);
  const addedWater = Math.round(targetWater - seedWater);
  const actualYield = seedGrams + addedFlour + addedWater;

  const totalFlour = seedFlour + addedFlour;
  const totalWater = seedWater + addedWater;
  const actualHydration = Number(((totalWater / totalFlour) * 100.0).toFixed(1));

  const tipTemplatePl = 'Wymieszaj {matka}g zakwasu matki ({hydratacja}%) z {maka}g mąki i {woda}g wody.';
  const tipParams: Record<string, number> = {
    matka: seedGrams,
    hydratacja: sourceHydration,
    maka: addedFlour,
    woda: addedWater,
  };
  let tipConsistencyPl: string | undefined;
  if (targetHydration <= 55) {
    tipConsistencyPl = 'Konsystencja będzie zwarta (Lievito Madre) — zagnieć kulę i nacinij krzyżem lub zroluj.';
  } else if (targetHydration >= 100) {
    tipConsistencyPl = 'Konsystencja będzie płynna — dokładnie napowietrz trzepaczką lub widelcem.';
  }
  const tipMain = Object.entries(tipParams).reduce((s, [k, v]) => s.split(`{${k}}`).join(`${v}`), tipTemplatePl);
  const tipPl = tipConsistencyPl ? ` ${tipConsistencyPl}` : tipMain;

  return {
    targetYieldGrams,
    sourceHydration,
    targetHydration,
    seedStarterGrams: seedGrams,
    addedFlourGrams: addedFlour,
    addedWaterGrams: addedWater,
    actualYieldGrams: actualYield,
    actualHydration,
    tipPl,
    tipTemplatePl,
    tipParams,
    tipConsistencyPl,
  };
}
