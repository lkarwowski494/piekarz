// ============================================================================
// Piekarz — format trwającego wypieku i parsowanie zapisu sesji z `unknown` (wydzielone z bake-session-store.ts bez
// zmiany zachowania; przerywa cykl z bake-sessions-store.ts) [M1-audytor-generalny-021; M1-audytor-generalny-019].
// Uszkodzony zapis daje brak sesji, nie zgadnięte dane. Zapis bez `steps` czyta się z LEGACY_STEPS_V1 [M1-audytor-generalny-030].
// ============================================================================

import { BakeProgress, validStepIdx } from '../core/bake-session';
import { SessionStep, isStageCategory } from '../core/bake-steps';
import { LEGACY_STEPS_V1 } from '../core/legacy-steps-v1';
import type { ActiveBakeState } from './sqlite-schema';
import { isObj, isNum, isStr, numOrNull, optNum, isRecipeInput, isRecipeResult } from './row-parsers';

/** Klucz app_settings trwającej sesji do v5; migracja v6 przenosi go do bake_sessions i kasuje [M3 D1]. */
export const BAKE_SESSION_KEY = 'active_bake_session';

/** Id wiersza sesji bez danych wypieku (zapis sprzed v2 bez `bake`); nowe sesje mają id wypieku [M3 D1]. */
export const ID_SESJI_BEZ_WYPIEKU = 'sesja-1014';

export interface BakeSession extends BakeProgress {
  version: 2;
  recipeName: string;
  startedAt: number;
  bake: ActiveBakeState | null;
}

/** Krok z zapisu (dane z zewnątrz): każde pole sprawdzone, inaczej false. */
export function isSessionStep(v: unknown): v is SessionStep {
  return isObj(v) && isStr(v.id) && v.id.length > 0 && isStr(v.name) && isStageCategory(v.category) &&
    (v.durationMin === null || (isNum(v.durationMin) && v.durationMin > 0)) && typeof v.isPassive === 'boolean' && isStr(v.instructions) &&
    (v.rekaNaStarcie === undefined || typeof v.rekaNaStarcie === 'boolean') &&
    numOrNull(v.plannedStart) && numOrNull(v.plannedEnd);
}

/** Niepusta lista kroków z zapisu albo null. */
function parseSteps(v: unknown): SessionStep[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const out: SessionStep[] = [];
  for (const s of v) {
    if (!isSessionStep(s)) return null;
    out.push(s);
  }
  return out;
}

export function isActiveBakeState(v: unknown): v is ActiveBakeState {
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
  const legacy = v.version === undefined && v.steps === undefined;
  const steps = legacy ? LEGACY_STEPS_V1 : v.version === 2 ? parseSteps(v.steps) : null;
  if (steps === null) return null;
  const stepIdx = validStepIdx(v.stepIdx, steps);
  const phase = v.dutchOvenPhase === 'lid_on' || v.dutchOvenPhase === 'lid_off' ? v.dutchOvenPhase : null;
  if (stepIdx === null || phase === null || !isStr(v.recipeName) || !isNum(v.startedAt)) return null;
  if (!numOrNull(v.timerEndsAt) || !numOrNull(v.pausedLeftSec)) return null;
  if (v.bake !== null && !isActiveBakeState(v.bake)) return null;
  return {
    version: 2,
    steps,
    stepIdx,
    dutchOvenPhase: phase,
    timerEndsAt: v.timerEndsAt,
    pausedLeftSec: v.pausedLeftSec,
    recipeName: v.recipeName,
    startedAt: v.startedAt,
    bake: v.bake,
  };
}

/** Id wiersza bake_sessions dla sesji: id wypieku. */
export function idSesji(s: BakeSession): string {
  return s.bake?.id ?? ID_SESJI_BEZ_WYPIEKU;
}
