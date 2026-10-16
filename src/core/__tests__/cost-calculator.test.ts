import fc from 'fast-check';
import {
  calculateBatchCost,
  DEFAULT_COST_PARAMETERS,
  BatchCostInput,
} from '../cost-calculator';

describe('Artisan Batch Cost & Yield Calculator Engine (core/cost-calculator)', () => {
  it('calculates cost accurately for standard 2-loaf artisan country bread batch', () => {
    const input: BatchCostInput = {
      totalFlourGrams: 1000,
      totalWaterGrams: 720,
      totalSaltGrams: 20,
      loavesCount: 2,
      bakedLoafWeightGrams: 750,
      flourPricePerKg: 4.5,
      electricityPricePerKwh: 1.15,
      ovenPowerKw: 2.5,
      preheatTimeHours: 0.75,
      bakeTimeHours: 0.75,
    };

    const result = calculateBatchCost(input);

    // Flour: 1.0 kg * 4.50 = 4.50 PLN
    expect(result.flourCost).toBe(4.5);
    // Water: 720g / 1,000,000 * 12.0 = 0.01 PLN
    expect(result.waterCost).toBe(0.01);
    // Salt: 0.02 kg * 3.0 = 0.06 PLN
    expect(result.saltCost).toBe(0.06);
    // Total ingredients = 4.50 + 0.01 + 0.06 = 4.57 PLN
    expect(result.ingredientsTotalCost).toBe(4.57);

    // Oven energy: 2.5 kW * 1.5h * 0.65 duty = 2.44 kWh
    expect(result.ovenKwhConsumed).toBe(2.44);
    // Energy cost = 2.44 * 1.15 = 2.81 PLN
    expect(result.energyTotalCost).toBe(2.81);

    // Total batch cost = 4.57 + 2.81 = 7.38 PLN
    expect(result.totalBatchCost).toBe(7.38);

    // Per loaf = 7.38 / 2 = 3.69 PLN
    expect(result.costPerLoaf).toBe(3.69);

    // Per 100g of baked loaf (750g) = (3.69 / 750) * 100 = 0.49 PLN / 100g
    expect(result.costPer100g).toBe(0.49);
  });

  it('handles custom add-ins (e.g. walnuts, cranberries, seeds)', () => {
    const input: BatchCostInput = {
      totalFlourGrams: 500,
      totalWaterGrams: 350,
      totalSaltGrams: 10,
      loavesCount: 1,
      addInsCost: 3.5, // 3.50 PLN for walnuts
    };

    const result = calculateBatchCost(input);
    expect(result.addInsCost).toBe(3.5);
    expect(result.ingredientsTotalCost).toBeGreaterThan(3.5);
  });

  it('safely handles zero loaves count without throwing division by zero', () => {
    const input: BatchCostInput = {
      totalFlourGrams: 500,
      totalWaterGrams: 350,
      totalSaltGrams: 10,
      loavesCount: 0,
    };

    const result = calculateBatchCost(input);
    expect(result.costPerLoaf).toBe(result.totalBatchCost);
    expect(Number.isFinite(result.costPerLoaf)).toBe(true);
  });

  describe('Property-Based Invariants (fast-check)', () => {
    it('always preserves totalBatchCost = ingredientsTotalCost + energyTotalCost', () => {
      fc.assert(
        fc.property(
          fc.record({
            totalFlourGrams: fc.integer({ min: 100, max: 20000 }),
            totalWaterGrams: fc.integer({ min: 50, max: 15000 }),
            totalSaltGrams: fc.integer({ min: 1, max: 500 }),
            loavesCount: fc.integer({ min: 1, max: 50 }),
            flourPricePerKg: fc.double({ min: 1, max: 30, noNaN: true }),
            electricityPricePerKwh: fc.double({ min: 0.1, max: 5, noNaN: true }),
            addInsCost: fc.double({ min: 0, max: 50, noNaN: true }),
          }),
          (data) => {
            const res = calculateBatchCost(data);
            const expectedSum = Math.round((res.ingredientsTotalCost + res.energyTotalCost) * 100) / 100;
            expect(res.totalBatchCost).toBe(expectedSum);
            expect(res.costPerLoaf).toBeGreaterThan(0);
            expect(res.totalBatchCost).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
