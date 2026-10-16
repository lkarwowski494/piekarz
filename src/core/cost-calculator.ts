// ============================================================================
// Piekarz (Crust) — Artisan Batch Cost & Yield Calculator Engine
// Evaluates raw ingredient costs (flour, water, salt, add-ins) and oven thermal
// energy consumption (preheat + bake kWh) per batch, per loaf, and per 100g.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

export interface BatchCostInput {
  totalFlourGrams: number;
  totalWaterGrams: number;
  totalSaltGrams: number;
  loavesCount: number;
  bakedLoafWeightGrams?: number;

  flourPricePerKg?: number; // default: 4.50 PLN
  waterPricePerM3?: number; // default: 12.00 PLN (0.012 PLN/L)
  saltPricePerKg?: number;  // default: 3.00 PLN
  addInsCost?: number;      // default: 0.00 PLN

  ovenPowerKw?: number;     // default: 2.5 kW
  preheatTimeHours?: number; // default: 0.75 h (45 min)
  bakeTimeHours?: number;    // default: 0.75 h (45 min)
  electricityPricePerKwh?: number; // default: 1.15 PLN/kWh
}

export interface BatchCostMetrics {
  flourCost: number;
  waterCost: number;
  saltCost: number;
  addInsCost: number;
  ingredientsTotalCost: number;

  ovenKwhConsumed: number;
  energyTotalCost: number;

  totalBatchCost: number;
  costPerLoaf: number;
  costPer100g: number;
}

export const DEFAULT_COST_PARAMETERS = {
  flourPricePerKg: 4.5,
  waterPricePerM3: 12.0,
  saltPricePerKg: 3.0,
  addInsCost: 0.0,
  ovenPowerKw: 2.5,
  preheatTimeHours: 0.75, // 45 min preheat
  bakeTimeHours: 0.75,    // 45 min bake
  electricityPricePerKwh: 1.15,
};

function roundGrosze(val: number): number {
  return Math.round(val * 100) / 100;
}

export function calculateBatchCost(input: BatchCostInput): BatchCostMetrics {
  const flourPrice = input.flourPricePerKg ?? DEFAULT_COST_PARAMETERS.flourPricePerKg;
  const waterPrice = input.waterPricePerM3 ?? DEFAULT_COST_PARAMETERS.waterPricePerM3;
  const saltPrice = input.saltPricePerKg ?? DEFAULT_COST_PARAMETERS.saltPricePerKg;
  const addIns = Math.max(0, input.addInsCost ?? DEFAULT_COST_PARAMETERS.addInsCost);

  const ovenPower = input.ovenPowerKw ?? DEFAULT_COST_PARAMETERS.ovenPowerKw;
  const preheatHours = input.preheatTimeHours ?? DEFAULT_COST_PARAMETERS.preheatTimeHours;
  const bakeHours = input.bakeTimeHours ?? DEFAULT_COST_PARAMETERS.bakeTimeHours;
  const electricityPrice = input.electricityPricePerKwh ?? DEFAULT_COST_PARAMETERS.electricityPricePerKwh;

  const loaves = Math.max(1, Math.round(input.loavesCount || 1));

  // Ingredient Costs
  // Flour: grams / 1000 * price/kg
  const flourKg = Math.max(0, input.totalFlourGrams) / 1000;
  const flourCost = roundGrosze(flourKg * flourPrice);

  // Water: grams / 1,000,000 m3 * price/m3
  const waterM3 = Math.max(0, input.totalWaterGrams) / 1000000;
  const waterCost = roundGrosze(waterM3 * waterPrice);

  // Salt: grams / 1000 * price/kg
  const saltKg = Math.max(0, input.totalSaltGrams) / 1000;
  const saltCost = roundGrosze(saltKg * saltPrice);

  const addInsCost = roundGrosze(addIns);

  const ingredientsTotalCost = roundGrosze(flourCost + waterCost + saltCost + addInsCost);

  // Energy Costs
  // kWh = kW * hours * duty cycle factor (~0.65 for domestic oven maintaining set temp)
  const dutyCycle = 0.65;
  const totalOvenHours = Math.max(0, preheatHours + bakeHours);
  const ovenKwhConsumed = Math.round(ovenPower * totalOvenHours * dutyCycle * 100) / 100;
  const energyTotalCost = roundGrosze(ovenKwhConsumed * electricityPrice);

  // Total Batch Cost
  const totalBatchCost = roundGrosze(ingredientsTotalCost + energyTotalCost);

  // Cost Per Loaf
  const costPerLoaf = roundGrosze(totalBatchCost / loaves);

  // Cost per 100g of baked loaf
  const singleLoafBakedWeight = input.bakedLoafWeightGrams && input.bakedLoafWeightGrams > 0
    ? input.bakedLoafWeightGrams
    : 700; // standard 700g baked loaf assumption
  const costPer100g = roundGrosze((costPerLoaf / singleLoafBakedWeight) * 100);

  return {
    flourCost,
    waterCost,
    saltCost,
    addInsCost,
    ingredientsTotalCost,
    ovenKwhConsumed,
    energyTotalCost,
    totalBatchCost,
    costPerLoaf,
    costPer100g,
  };
}
