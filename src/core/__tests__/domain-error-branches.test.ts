import {
  calculateDoughRecipe,
  calculateFermentationAdaptation,
  calculateDoughRecipeFromFlour,
  calculateDoughRecipeForLoaves,
  calculateDDT,
  calculateIceRequirement,
} from '../domain-rules';
import { convertStarterHydration } from '../starter-converter';
import { calculateBakeLossMetrics, calculateBakedWeight } from '../bake-loss';
import { filterBakeLogs, calculateBakeStatistics } from '../bake-statistics';
import { getDutchOvenPhase, calculateTotalDutchOvenTimeMin, getNextBakePhase } from '../baking-phases';
import { convertVolumeToGrams } from '../volume-converter';
import { searchTechniques } from '../baking-techniques';
import { matchFlourProfile } from '../flour-atlas';
import { calculatePrefermentBreakdown } from '../preferments';

describe('Domain Rules & Core Error Branches (100% Coverage Hardening - BR-TEST-002)', () => {
  test('calculateDoughRecipe throws on invalid target weight and flour blend', () => {
    expect(() =>
      calculateDoughRecipe({
        targetDoughWeightGrams: 0,
        flours: [{ name: 'Pszenna', percentage: 100 }],
        waterPercentage: 70,
        saltPercentage: 2,
        starterPercentage: 20,
      })
    ).toThrow('Docelowa waga ciasta musi być większa od zera');

    expect(() =>
      calculateDoughRecipe({
        targetDoughWeightGrams: 1000,
        flours: [{ name: 'Pszenna', percentage: 90 }], // sum !== 100
        waterPercentage: 70,
        saltPercentage: 2,
        starterPercentage: 20,
      })
    ).toThrow('Suma procentów mąk musi wynosić 100%');
  });

  test('calculateFermentationAdaptation throws on negative or zero parameters', () => {
    expect(() => calculateFermentationAdaptation(0, 24)).toThrow('Czas bazowy i temperatura muszą być większe od zera');
    expect(() => calculateFermentationAdaptation(4, 0)).toThrow('Czas bazowy i temperatura muszą być większe od zera');
  });

  test('calculateDoughRecipeFromFlour & calculateDoughRecipeForLoaves throw on invalid inputs', () => {
    expect(() =>
      calculateDoughRecipeFromFlour(0, {
        flours: [{ name: 'Pszenna', percentage: 100 }],
        waterPercentage: 70,
        saltPercentage: 2,
        starterPercentage: 20,
      })
    ).toThrow('Waga mąki musi być większa od zera');

    expect(() =>
      calculateDoughRecipeForLoaves(0, 800, {
        flours: [{ name: 'Pszenna', percentage: 100 }],
        waterPercentage: 70,
        saltPercentage: 2,
        starterPercentage: 20,
      })
    ).toThrow('Liczba bochenków i gramatura muszą być większe od zera');

    expect(() =>
      calculateDoughRecipeForLoaves(2, 0, {
        flours: [{ name: 'Pszenna', percentage: 100 }],
        waterPercentage: 70,
        saltPercentage: 2,
        starterPercentage: 20,
      })
    ).toThrow('Liczba bochenków i gramatura muszą być większe od zera');
  });

  test('convertStarterHydration throws on zero or negative values', () => {
    expect(() =>
      convertStarterHydration({
        targetYieldGrams: 0,
        sourceHydration: 100,
        targetHydration: 80,
      })
    ).toThrow('Docelowa masa zakwasu musi być większa od zera');

    expect(() =>
      convertStarterHydration({
        targetYieldGrams: 200,
        sourceHydration: 0,
        targetHydration: 80,
      })
    ).toThrow('Hydratacje muszą być większe od zera');

    expect(() =>
      convertStarterHydration({
        targetYieldGrams: 200,
        sourceHydration: 100,
        targetHydration: 0,
      })
    ).toThrow('Hydratacje muszą być większe od zera');
  });

  test('bake-loss and bake-statistics branches', () => {
    expect(() => calculateBakeLossMetrics(0)).toThrow('Masa ciasta musi być większa od zera');
    expect(() => calculateBakeLossMetrics(800, 0)).toThrow('Strata piecowa');
    expect(() => calculateBakeLossMetrics(800, 55)).toThrow('Strata piecowa');

    const res = calculateBakeLossMetrics(800, 15, 0, 1);
    expect(res.bakedWeightGrams).toBe(680);
    expect(calculateBakedWeight(0)).toBe(0);

    const statsEmpty = calculateBakeStatistics([]);
    expect(statsEmpty.totalBakes).toBe(0);
    expect(statsEmpty.averageCrumbScore).toBe(0);
    expect(statsEmpty.averageCrustScore).toBe(0);

    const filtered = filterBakeLogs([], { tasteProfile: 'all' });
    expect(filtered).toEqual([]);
  });

  test('baking-phases branches', () => {
    const p1 = getDutchOvenPhase('lid_on');
    expect(p1.temperatureC).toBe(240);
    const p2 = getNextBakePhase('lid_on');
    expect(p2).toBe('lid_off');
    expect(getNextBakePhase('lid_off')).toBeNull();
    expect(calculateTotalDutchOvenTimeMin(['lid_on', 'lid_off'])).toBe(45);
  });

  test('sourdough-physics & ddt branches', () => {
    const ddt3 = calculateDDT({
      targetDDT: 26,
      flourTemp: 22,
      roomTemp: 24,
      frictionFactor: 2,
    });
    expect(ddt3.waterTempTarget).toBeDefined();

    const iceNoNeed = calculateIceRequirement(300, 15, 20);
    expect(iceNoNeed.iceGrams).toBe(0);
    expect(iceNoNeed.waterGrams).toBe(300);
  });

  test('volume-converter and techniques branches', () => {
    const conv = convertVolumeToGrams('flour_wheat_sifted', 0, 'cup');
    expect(conv.grams).toBe(0);
    expect(searchTechniques('non_existent_technique')).toEqual([]);
    expect(matchFlourProfile('nieznana maka xyz 12345').id).toBe('wheat_750');
  });

  test('preferments branches', () => {
    expect(() =>
      calculatePrefermentBreakdown({
        prefermentType: 'biga',
        prefermentFlourPercentage: 50,
        totalFlourGrams: 0,
        totalTargetHydration: 70,
        saltPercentage: 2,
      })
    ).toThrow('Całkowita masa mąki musi być większa od 0');

    expect(() =>
      calculatePrefermentBreakdown({
        prefermentType: 'biga',
        prefermentFlourPercentage: 150,
        totalFlourGrams: 1000,
        totalTargetHydration: 70,
        saltPercentage: 2,
      })
    ).toThrow('Udział mąki w zaczynie musi mieścić się w przedziale 0–100%');
  });
});
