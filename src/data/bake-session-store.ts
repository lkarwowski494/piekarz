// ============================================================================
// Piekarz — zapis trwającego wypieku w bazie (app_settings) [M1-audytor-generalny-019]
// Odczyt z bazy parsowany z `unknown`: uszkodzony zapis daje brak sesji, nie zgadnięte dane.
// Wersja 2 niesie kroki sesji; zapis bez `steps` (HEAD 1c38b28) czyta się z LEGACY_STEPS_V1 [M1-audytor-generalny-030].
// ============================================================================

import { BakeProgress, validStepIdx } from '../core/bake-session';
import { SessionStep, isStageCategory, planBakeSteps } from '../core/bake-steps';
import { LEGACY_STEPS_V1 } from '../core/legacy-steps-v1';
import { ActiveBakeState } from './sqlite-schema';
import { getAppSetting, setAppSetting } from './settings-store';
import { isObj, isNum, isStr, numOrNull, optNum, isRecipeInput, isRecipeResult } from './row-parsers';

export const BAKE_SESSION_KEY = 'active_bake_session';

export interface BakeSession extends BakeProgress {
  version: 2;
  recipeName: string;
  startedAt: number;
  bake: ActiveBakeState | null;
}

/** Krok z zapisu (dane z zewnątrz): każde pole sprawdzone, inaczej false. */
export function isSessionStep(v: unknown): v is SessionStep {
  return isObj(v) && isStr(v.id) && v.id.length > 0 && isStr(v.name) && isStageCategory(v.category) &&
    isNum(v.durationMin) && v.durationMin > 0 && typeof v.isPassive === 'boolean' && isStr(v.instructions) &&
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

/** Czy wypiek jest żytni: flaga z Harmonogramu albo z wyniku kalkulacji; brak receptury = pszenny domyślny. */
export function isHighRyeBake(bake: ActiveBakeState): boolean {
  return bake.isHighRye ?? bake.calculatedRecipe?.isHighRye ?? false;
}

/** Kroki przekazanego wypieku: migawka planu albo plan od startu; null = brak prowadzenia (żyto). */
export function stepsForBake(bake: ActiveBakeState): SessionStep[] | null {
  if (bake.steps && bake.steps.length > 0) return bake.steps;
  return planBakeSteps({ startAt: bake.startedAt, isHighRye: isHighRyeBake(bake), ambientTempC: bake.ambientTempC });
}

/**
 * Sesja do pokazania na Stolnicy: nowy wypiek przekazany z Kalkulatora/Harmonogramu (w pamięci) wygrywa
 * z zapisem innego wypieku; po restarcie (pamięć pusta) wraca zapis. Wypiek bez kroków (żyto) nie startuje.
 */
export function pickBakeSession(inMemory: ActiveBakeState | null, saved: BakeSession | null): BakeSession | null {
  if (inMemory && (!saved || saved.bake?.id !== inMemory.id)) {
    const steps = stepsForBake(inMemory);
    if (steps === null) return saved;
    return {
      version: 2,
      steps,
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
