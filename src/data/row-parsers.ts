// ============================================================================
// Piekarz — parsowanie danych z zewnątrz (plik kopii, wiersz bazy, zapis sesji) z `unknown`
// Strażniki typów bez asercji `as`: zły rekord daje null, nie zgadnięte wartości.
// ============================================================================

import { DoughRecipeInput, DoughRecipeResult } from '../core/domain-rules';

export type Obj = Record<string, unknown>;
export const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
export const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
export const isStr = (v: unknown): v is string => typeof v === 'string';
export const numOrNull = (v: unknown): v is number | null => v === null || isNum(v);
export const optNum = (v: unknown): boolean => v === undefined || isNum(v);

function isFlourCalc(v: unknown): boolean {
  return isObj(v) && isStr(v.name) && isNum(v.percentage) && isNum(v.weightGrams);
}

export function isRecipeResult(v: unknown): v is DoughRecipeResult {
  if (!isObj(v) || !Array.isArray(v.flours) || !v.flours.every(isFlourCalc) || typeof v.isHighRye !== 'boolean') return false;
  const nums = ['targetDoughWeightGrams', 'baseFlourWeightGrams', 'waterGrams', 'saltGrams', 'starterGrams', 'starterFlourGrams',
    'starterWaterGrams', 'yeastGrams', 'totalFlourGrams', 'totalWaterGrams', 'overallHydrationPercent', 'sumCheckGrams'];
  return nums.every((k) => isNum(v[k]));
}

export function isRecipeInput(v: unknown): v is DoughRecipeInput {
  if (!isObj(v) || !Array.isArray(v.flours)) return false;
  const floursOk = v.flours.every((f) => isObj(f) && isStr(f.name) && isNum(f.percentage) && (f.type === undefined || isStr(f.type)));
  return floursOk && isNum(v.waterPercentage) && isNum(v.saltPercentage) && isNum(v.starterPercentage) &&
    isNum(v.targetDoughWeightGrams) && optNum(v.starterHydration) && optNum(v.extraYeastPercentage);
}
