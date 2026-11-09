// ============================================================================
// Piekarz — format trwającego wypieku i jego parsowanie [M1-audytor-generalny-019]
// Odczyt z bazy parsowany z `unknown`: uszkodzony zapis daje brak sesji, nie zgadnięte dane.
// Wersja 2 niesie kroki sesji; zapis bez `steps` (HEAD 1c38b28) czyta się z LEGACY_STEPS_V1 [M1-audytor-generalny-030].
// Od v6 sesje leżą w tabeli bake_sessions (bake-sessions-store.ts, D-102); stąd re-eksport API jednej sesji [M3 D1].
// ============================================================================

import { stepHasTimer } from '../core/bake-session';
import { SessionStep, areRyeSteps, planBakeSteps, ryeStepsFromPlan } from '../core/bake-steps';
import type { ActiveBakeState } from './sqlite-schema';
import type { BakeSession } from './sesja-parsery';
import { pieczenieDlaId } from '../lib/pieczenie-planu';

// Format i parsowanie sesji w sesja-parsery.ts (bez cyklu z bake-sessions-store.ts) [M1-audytor-generalny-021]
export { BAKE_SESSION_KEY, ID_SESJI_BEZ_WYPIEKU, isSessionStep, isActiveBakeState, parseBakeSession, idSesji, type BakeSession } from './sesja-parsery';

// Tylko testy i przygotowanie danych (ekrany: lista i id wypieku, bake-sessions-store.ts) [M3 D3a]
export { loadBakeSession, saveBakeSession } from './bake-sessions-store';

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
    // Wersja drożdżowa (kroki yeast_*, D-155) zostaje planem z receptury: bez etapów żytnich na zakwasie (dokarmienie,
    // 240 min w formie), także dla żyta 100% na drożdżach (przegląd p9b-1b, P1) [M3 p9b]
    if (bake.wersja === 'drozdze') return bake.steps;
    return isHighRyeBake(bake) && !areRyeSteps(bake.steps) ? ryeStepsFromPlan(bake.steps, bake.startedAt) : bake.steps;
  }
  // Pieczenie z danych receptury bazowej (D-304) [M1-audytor-generalny-008]
  const zytni = isHighRyeBake(bake);
  return planBakeSteps({ startAt: bake.startedAt, isHighRye: zytni, ambientTempC: bake.ambientTempC, pieczenie: pieczenieDlaId(bake.recipeId, zytni) });
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

/**
 * Trwający wypiek do pokazania: sesja, czy to nowy wypiek z pamięci, którego jeszcze nie zapisano, i wersja wiersza
 * (null dla nowego), od której ekran zapisuje kroki (P1-1) [M3 D3a-fix].
 */
export interface SesjaDoPokazania {
  sesja: BakeSession;
  nowy: boolean;
  wersja: number | null;
}

/**
 * Trwające wypieki do pokazania (Stolnica, Dziś, pytanie przy starcie): zapisane od najstarszego, a na końcu wypiek
 * przekazany z planu w pamięci, jeśli nie ma go jeszcze w zapisie (Stolnica go utworzy przy pierwszym kroku; gdy
 * wiersz jednak jest, np. nieczytelny, utworzenie niczego nie nadpisuje) [M3 D3a].
 */
export function sesjeDoPokazania(wPamieci: ActiveBakeState | null, zapisane: readonly { sesja: BakeSession; wersja: number }[]): SesjaDoPokazania[] {
  const lista = zapisane.map(({ sesja, wersja }) => ({ sesja, nowy: false, wersja }));
  return wPamieci && !zapisane.some((s) => s.sesja.bake?.id === wPamieci.id) ? [...lista, { sesja: nowaSesja(wPamieci), nowy: true, wersja: null }] : lista;
}

