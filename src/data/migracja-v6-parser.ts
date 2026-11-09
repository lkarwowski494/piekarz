// ============================================================================
// Piekarz — ZAMROŻONY parser trwającej sesji v1/v2 dla wydanej migracji v6 (stan z dd824eee) [M1-audytor-generalny-021;
// 05-architekt-004; wyjątek nazwany D-300]. Wynik migracji v6 na bazie z 1014–1016 nie może zależeć od kodu późniejszych
// partii, więc parser sesji (bake-session-store.ts, sesja-parsery.ts) jest tu skopiowany i NIE ZMIENIA SIĘ razem z nim.
// Nie edytować: kontrola — testy migracji na bazach 1014 i 1021 (migracja-d1-1014, p9a-baza-1021) z tym samym wynikiem.
// Importy: tylko typy i zamrożona lista kroków v1 (LEGACY_STEPS_V1, też kopia zamrożona).
// ============================================================================

import type { SessionStep } from '../core/bake-steps';
import { LEGACY_STEPS_V1 } from '../core/legacy-steps-v1';
import type { ActiveBakeState } from './sqlite-schema';

/** Sesja odczytana ze starego klucza app_settings (kształt BakeSession z dd824eee). */
export interface SesjaV6 {
  version: 2;
  steps: SessionStep[];
  stepIdx: number;
  dutchOvenPhase: 'lid_on' | 'lid_off';
  timerEndsAt: number | null;
  pausedLeftSec: number | null;
  recipeName: string;
  startedAt: number;
  bake: ActiveBakeState | null;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const numOrNull = (v: unknown): v is number | null => v === null || isNum(v);
const optNum = (v: unknown): boolean => v === undefined || isNum(v);
const KATEGORIE = ['starter_feed', 'autolyse', 'mix', 'bulk_ferment', 'pre_shape', 'bench_rest', 'final_shape', 'final_proof', 'preheat_oven', 'bake', 'cool'];
const validStepIdx = (v: unknown, steps: readonly unknown[]): number | null =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < steps.length ? v : null;

function isFlourCalc(v: unknown): boolean {
  return isObj(v) && isStr(v.name) && isNum(v.percentage) && isNum(v.weightGrams);
}
function isRecipeResult(v: unknown): boolean {
  if (!isObj(v) || !Array.isArray(v.flours) || !v.flours.every(isFlourCalc) || typeof v.isHighRye !== 'boolean') return false;
  const nums = ['targetDoughWeightGrams', 'baseFlourWeightGrams', 'waterGrams', 'saltGrams', 'starterGrams', 'starterFlourGrams',
    'starterWaterGrams', 'yeastGrams', 'totalFlourGrams', 'totalWaterGrams', 'overallHydrationPercent', 'sumCheckGrams'];
  return nums.every((k) => isNum(v[k]));
}
function isRecipeInput(v: unknown): boolean {
  if (!isObj(v) || !Array.isArray(v.flours)) return false;
  const floursOk = v.flours.every((f) => isObj(f) && isStr(f.name) && isNum(f.percentage) && (f.type === undefined || isStr(f.type)));
  return floursOk && isNum(v.waterPercentage) && isNum(v.saltPercentage) && isNum(v.starterPercentage) &&
    isNum(v.targetDoughWeightGrams) && optNum(v.starterHydration) && optNum(v.extraYeastPercentage);
}
function isSessionStep(v: unknown): v is SessionStep {
  return isObj(v) && isStr(v.id) && v.id.length > 0 && isStr(v.name) && KATEGORIE.some((c) => c === v.category) &&
    (v.durationMin === null || (isNum(v.durationMin) && v.durationMin > 0)) && typeof v.isPassive === 'boolean' && isStr(v.instructions) &&
    (v.rekaNaStarcie === undefined || typeof v.rekaNaStarcie === 'boolean') &&
    numOrNull(v.plannedStart) && numOrNull(v.plannedEnd);
}
function parseSteps(v: unknown): SessionStep[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const out: SessionStep[] = [];
  for (const s of v) {
    if (!isSessionStep(s)) return null;
    out.push(s);
  }
  return out;
}
function isActiveBakeState(v: unknown): v is ActiveBakeState {
  return isObj(v) && isStr(v.id) && isStr(v.recipeName) && isNum(v.startedAt) && isStr(v.currentStageId) &&
    optNum(v.ambientTempC) && optNum(v.actualDdtC) &&
    (v.calculatedRecipe === undefined || isRecipeResult(v.calculatedRecipe)) &&
    (v.recipeFormula === undefined || isRecipeInput(v.recipeFormula)) &&
    (v.isHighRye === undefined || typeof v.isHighRye === 'boolean') &&
    (v.starterId === undefined || isStr(v.starterId)) &&
    (v.zaczetyZDostepem === undefined || typeof v.zaczetyZDostepem === 'boolean') &&
    (v.recipeId === undefined || isStr(v.recipeId)) &&
    (v.wersja === undefined || v.wersja === 'zakwas' || v.wersja === 'drozdze') &&
    (v.tryb === undefined || v.tryb === 'piekarnik' || v.tryb === 'maszyna') &&
    (v.steps === undefined || parseSteps(v.steps) !== null);
}

/** Klucz app_settings trwającej sesji do v5. */
export const KLUCZ_SESJI_V5 = 'active_bake_session';

/** Id wiersza bake_sessions: id wypieku albo 'sesja-1014' dla sesji bez danych wypieku. */
export function idSesjiV6(s: SesjaV6): string {
  return s.bake?.id ?? 'sesja-1014';
}

/** Zapis sesji v1/v2 z JSON-a; każdy błąd formatu → null. */
export function parsujSesjeV6(raw: string | undefined): SesjaV6 | null {
  if (!raw) return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(v)) return null;
  const legacy = v.version === undefined && v.steps === undefined;
  const steps = legacy ? [...LEGACY_STEPS_V1] : v.version === 2 ? parseSteps(v.steps) : null;
  if (steps === null) return null;
  const stepIdx = validStepIdx(v.stepIdx, steps);
  const phase = v.dutchOvenPhase === 'lid_on' || v.dutchOvenPhase === 'lid_off' ? v.dutchOvenPhase : null;
  if (stepIdx === null || phase === null || !isStr(v.recipeName) || !isNum(v.startedAt)) return null;
  if (!numOrNull(v.timerEndsAt) || !numOrNull(v.pausedLeftSec)) return null;
  if (v.bake !== null && !isActiveBakeState(v.bake)) return null;
  return { version: 2, steps, stepIdx, dutchOvenPhase: phase, timerEndsAt: v.timerEndsAt, pausedLeftSec: v.pausedLeftSec, recipeName: v.recipeName, startedAt: v.startedAt, bake: v.bake };
}
