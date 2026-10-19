import { isObj, isNum, isStr, numOrNull, optNum, isRecipeInput, isRecipeResult } from '../row-parsers';

const input = {
  flours: [{ name: 'Mąka 750', percentage: 100, type: 'pszenna_750' }],
  waterPercentage: 70,
  saltPercentage: 2,
  starterPercentage: 20,
  targetDoughWeightGrams: 1000,
};
const result = {
  targetDoughWeightGrams: 1000,
  baseFlourWeightGrams: 550,
  flours: [{ name: 'Mąka 750', percentage: 100, weightGrams: 550 }],
  waterGrams: 330,
  saltGrams: 11,
  starterGrams: 110,
  starterFlourGrams: 55,
  starterWaterGrams: 55,
  yeastGrams: 0,
  totalFlourGrams: 605,
  totalWaterGrams: 385,
  overallHydrationPercent: 63.6,
  sumCheckGrams: 1000,
  isHighRye: false,
};

describe('row-parsers type guards', () => {
  it('scalar guards reject NaN, Infinity, arrays and null where not allowed', () => {
    expect(isObj({})).toBe(true);
    expect(isObj([])).toBe(false);
    expect(isObj(null)).toBe(false);
    expect(isNum(1.5)).toBe(true);
    expect(isNum(NaN)).toBe(false);
    expect(isNum(Infinity)).toBe(false);
    expect(isNum('1')).toBe(false);
    expect(isStr('')).toBe(true);
    expect(isStr(1)).toBe(false);
    expect(numOrNull(null)).toBe(true);
    expect(numOrNull(undefined)).toBe(false);
    expect(optNum(undefined)).toBe(true);
    expect(optNum(null)).toBe(false);
  });

  it('isRecipeInput accepts a formula and rejects missing or mistyped fields', () => {
    expect(isRecipeInput(input)).toBe(true);
    expect(isRecipeInput({ ...input, starterHydration: 100, extraYeastPercentage: 0.2 })).toBe(true);
    expect(isRecipeInput({ ...input, waterPercentage: '70' })).toBe(false);
    expect(isRecipeInput({ ...input, flours: [{ name: 'X' }] })).toBe(false);
    expect(isRecipeInput({ ...input, starterHydration: null })).toBe(false);
  });

  it('isRecipeResult requires every gram field and the rye flag', () => {
    expect(isRecipeResult(result)).toBe(true);
    expect(isRecipeResult({ ...result, saltGrams: undefined })).toBe(false);
    expect(isRecipeResult({ ...result, isHighRye: 'no' })).toBe(false);
    expect(isRecipeResult({ ...result, flours: [{ name: 'X', percentage: 1 }] })).toBe(false);
  });
});
