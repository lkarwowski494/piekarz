// ============================================================================
// Piekarz — zapis trwającego wypieku w bazie (app_settings) [M1-audytor-generalny-019]
// Odczyt z bazy parsowany z `unknown`: uszkodzony zapis daje brak sesji, nie zgadnięte dane.
// ============================================================================

import { BakeProgress, validStepIdx } from '../core/bake-session';
import { DoughRecipeInput, DoughRecipeResult } from '../core/domain-rules';
import { ActiveBakeState } from './sqlite-schema';
import { getAppSetting, setAppSetting } from './settings-store';

export const BAKE_SESSION_KEY = 'active_bake_session';

export interface BakeSession extends BakeProgress {
  recipeName: string;
  startedAt: number;
  bake: ActiveBakeState | null;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const numOrNull = (v: unknown): v is number | null => v === null || isNum(v);
const optNum = (v: unknown) => v === undefined || isNum(v);

function isFlourCalc(v: unknown): boolean {
  return isObj(v) && isStr(v.name) && isNum(v.percentage) && isNum(v.weightGrams);
}

function isRecipeResult(v: unknown): v is DoughRecipeResult {
  if (!isObj(v) || !Array.isArray(v.flours) || !v.flours.every(isFlourCalc) || typeof v.isHighRye !== 'boolean') return false;
  const nums = ['targetDoughWeightGrams', 'baseFlourWeightGrams', 'waterGrams', 'saltGrams', 'starterGrams', 'starterFlourGrams',
    'starterWaterGrams', 'yeastGrams', 'totalFlourGrams', 'totalWaterGrams', 'overallHydrationPercent', 'sumCheckGrams'];
  return nums.every((k) => isNum(v[k]));
}

function isRecipeInput(v: unknown): v is DoughRecipeInput {
  if (!isObj(v) || !Array.isArray(v.flours)) return false;
  const floursOk = v.flours.every((f) => isObj(f) && isStr(f.name) && isNum(f.percentage) && (f.type === undefined || isStr(f.type)));
  return floursOk && isNum(v.waterPercentage) && isNum(v.saltPercentage) && isNum(v.starterPercentage) &&
    isNum(v.targetDoughWeightGrams) && optNum(v.starterHydration) && optNum(v.extraYeastPercentage);
}

export function isActiveBakeState(v: unknown): v is ActiveBakeState {
  return isObj(v) && isStr(v.id) && isStr(v.recipeName) && isNum(v.startedAt) && isStr(v.currentStageId) &&
    isNum(v.ambientTempC) && isNum(v.actualDdtC) &&
    (v.calculatedRecipe === undefined || isRecipeResult(v.calculatedRecipe)) &&
    (v.recipeFormula === undefined || isRecipeInput(v.recipeFormula));
}

/** Zapis sesji z JSON-a; każdy błąd formatu → null. */
export function parseBakeSession(raw: string | undefined): BakeSession | null {
  if (!raw) return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(v)) return null;
  const stepIdx = validStepIdx(v.stepIdx);
  const phase = v.dutchOvenPhase === 'lid_on' || v.dutchOvenPhase === 'lid_off' ? v.dutchOvenPhase : null;
  if (stepIdx === null || phase === null || !isStr(v.recipeName) || !isNum(v.startedAt)) return null;
  if (!numOrNull(v.timerEndsAt) || !numOrNull(v.pausedLeftSec)) return null;
  if (v.bake !== null && !isActiveBakeState(v.bake)) return null;
  return {
    stepIdx,
    dutchOvenPhase: phase,
    timerEndsAt: v.timerEndsAt,
    pausedLeftSec: v.pausedLeftSec,
    recipeName: v.recipeName,
    startedAt: v.startedAt,
    bake: v.bake,
  };
}

/**
 * Sesja do pokazania na Stolnicy: nowy wypiek przekazany z Kalkulatora/Harmonogramu (w pamięci) wygrywa
 * z zapisem innego wypieku; po restarcie (pamięć pusta) wraca zapis.
 */
export function pickBakeSession(inMemory: ActiveBakeState | null, saved: BakeSession | null): BakeSession | null {
  if (inMemory && (!saved || saved.bake?.id !== inMemory.id)) {
    return {
      stepIdx: 0,
      dutchOvenPhase: 'lid_on',
      timerEndsAt: null,
      pausedLeftSec: null,
      recipeName: inMemory.recipeName,
      startedAt: inMemory.startedAt,
      bake: inMemory,
    };
  }
  return saved;
}

export async function loadBakeSession(): Promise<BakeSession | null> {
  return parseBakeSession(await getAppSetting(BAKE_SESSION_KEY));
}

/** Zapisuje postęp; null kasuje sesję (koniec albo odrzucenie wypieku). */
export async function saveBakeSession(session: BakeSession | null): Promise<void> {
  await setAppSetting(BAKE_SESSION_KEY, session ? JSON.stringify(session) : '');
}
