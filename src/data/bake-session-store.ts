// ============================================================================
// Piekarz — format trwającego wypieku i jego parsowanie [M1-audytor-generalny-019]
// Odczyt z bazy parsowany z `unknown`: uszkodzony zapis daje brak sesji, nie zgadnięte dane.
// Wersja 2 niesie kroki sesji; zapis bez `steps` (HEAD 1c38b28) czyta się z LEGACY_STEPS_V1 [M1-audytor-generalny-030].
// Od v6 sesje leżą w tabeli bake_sessions (bake-sessions-store.ts, D-102); stąd re-eksport API jednej sesji [M3 D1].
// ============================================================================

import { BakeProgress, stepHasTimer, validStepIdx } from '../core/bake-session';
import { SessionStep, areRyeSteps, isStageCategory, planBakeSteps, ryeStepsFromPlan } from '../core/bake-steps';
import { LEGACY_STEPS_V1 } from '../core/legacy-steps-v1';
import type { ActiveBakeState } from './sqlite-schema';
import { isObj, isNum, isStr, numOrNull, optNum, isRecipeInput, isRecipeResult } from './row-parsers';

// Tylko testy i przygotowanie danych (ekrany: lista i id wypieku, bake-sessions-store.ts) [M3 D3a]
export { loadBakeSession, saveBakeSession } from './bake-sessions-store';

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

/**
 * Wypiek prowadzi się bez ekranu zakupu, gdy zaczął się z dostępem (D-039 pkt 3); brak znacznika (zapis sprzed
 * wersji z 125 albo sesja bez danych wypieku) = zaczęty z dostępem, bo start wymagał dostępu (wybór P-125 a).
 */
export function zaczetyZDostepem(bake: ActiveBakeState | null): boolean {
  return bake?.zaczetyZDostepem !== false;
}

/** Czy wypiek jest żytni: flaga z Harmonogramu albo z wyniku kalkulacji; brak receptury = pszenny domyślny. */
export function isHighRyeBake(bake: ActiveBakeState): boolean {
  return bake.isHighRye ?? bake.calculatedRecipe?.isHighRye ?? false;
}

/**
 * Kroki przekazanego wypieku: migawka planu albo plan od startu. Żyto: etapy z rye-stages.ts z czasami
 * etapów tej samej kategorii z migawki lub planu (wariant a roli 06) [M1-audytor-generalny-030].
 */
export function stepsForBake(bake: ActiveBakeState): SessionStep[] {
  if (bake.steps && bake.steps.length > 0) {
    // Plan żytni z planu wypieku ma już etapy żytnie z godzinami planu (030): bez przeliczania od startu
    return isHighRyeBake(bake) && !areRyeSteps(bake.steps) ? ryeStepsFromPlan(bake.steps, bake.startedAt) : bake.steps;
  }
  return planBakeSteps({ startAt: bake.startedAt, isHighRye: isHighRyeBake(bake), ambientTempC: bake.ambientTempC });
}

/**
 * Plan z godziną startu po „Zacznij wypiek” (np. plan na jutro): zegar kroku 1 kończy się o planowanym końcu kroku 1,
 * więc krok 1, dalsze kroki i powiadomienia trzymają godziny planu, a do startu prowadzenie pokazuje „Start … o …”
 * (stan „czeka do”, prowadzenie-teksty.ts). Plan od teraz albo bez godzin: null (zegar rusza od teraz jak dotąd)
 * [audyt-niezalezny D-5].
 */
export function koniecPierwszegoWPlanie(steps: readonly SessionStep[], startedAt: number): number | null {
  const k = steps[0];
  if (!k || !stepHasTimer(k) || k.plannedStart === null || k.plannedEnd === null) return null;
  return k.plannedStart > startedAt && k.plannedEnd > startedAt ? k.plannedEnd : null;
}

/**
 * Sesja do pokazania na Stolnicy: nowy wypiek przekazany z Kalkulatora/Harmonogramu (w pamięci) wygrywa
 * z zapisem innego wypieku; po restarcie (pamięć pusta) wraca zapis.
 */
export function pickBakeSession(inMemory: ActiveBakeState | null, saved: BakeSession | null): BakeSession | null {
  return inMemory && (!saved || saved.bake?.id !== inMemory.id) ? nowaSesja(inMemory) : saved;
}

/** Sesja nowego wypieku od kroku 1 (plan z godziną startu: zegar kroku 1 do końca kroku w planie). */
export function nowaSesja(bake: ActiveBakeState): BakeSession {
  const steps = stepsForBake(bake);
  return {
    version: 2,
    steps,
    stepIdx: 0,
    dutchOvenPhase: 'lid_on',
    timerEndsAt: koniecPierwszegoWPlanie(steps, bake.startedAt),
    pausedLeftSec: null,
    recipeName: bake.recipeName,
    startedAt: bake.startedAt,
    bake,
  };
}

/** Trwający wypiek do pokazania: sesja i to, czy to nowy wypiek z pamięci, którego jeszcze nie zapisano. */
export interface SesjaDoPokazania {
  sesja: BakeSession;
  nowy: boolean;
}

/**
 * Trwające wypieki do pokazania (Stolnica, Dziś, pytanie przy starcie): zapisane od najstarszego, a na końcu wypiek
 * przekazany z planu w pamięci, jeśli nie ma go jeszcze w zapisie (Stolnica zapisze go przy pierwszym kroku) [M3 D3a].
 */
export function sesjeDoPokazania(wPamieci: ActiveBakeState | null, zapisane: readonly BakeSession[]): SesjaDoPokazania[] {
  const lista = zapisane.map((sesja) => ({ sesja, nowy: false }));
  return wPamieci && !zapisane.some((s) => s.bake?.id === wPamieci.id) ? [...lista, { sesja: nowaSesja(wPamieci), nowy: true }] : lista;
}

/** Id wiersza bake_sessions dla sesji: id wypieku. */
export function idSesji(s: BakeSession): string {
  return s.bake?.id ?? ID_SESJI_BEZ_WYPIEKU;
}
