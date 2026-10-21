// ============================================================================
// Piekarz — potwierdzenie kroku i jego cofnięcie jako czyste funkcje (BR-HARMO-005; także BR-HARMO-004)
// [M1-audytor-generalny-102]. Czas zawsze argumentem. Potwierdzenie przed terminem przesuwa dalsze kroki
// wcześniej, po terminie — później; cofnięcie przywraca migawkę sprzed potwierdzenia (plan i zegar), więc
// powiadomienia liczone z planu wracają same. Migawka do cofnięcia żyje w pamięci ekranu (pasek „Przywróć”),
// bez nowego pola w zapisie sesji.
// ============================================================================

import { BakeProgress, stepDurationSec, stepHasTimer } from './bake-session';
import type { SessionStep } from './bake-steps';

export interface StepUndo {
  /** Postęp sprzed potwierdzenia (kroki z godzinami, indeks, zegar). */
  before: BakeProgress;
  confirmedAt: number;
}

/** Termin bieżącego kroku: koniec biegnącego zegara, inaczej planowany koniec; brak = null. */
export function currentStepDeadline(progress: BakeProgress): number | null {
  return progress.timerEndsAt ?? progress.steps[progress.stepIdx]?.plannedEnd ?? null;
}

/** Kroki od `fromIdx` przesunięte o `deltaMs` (ujemne = wcześniej); krok bez planu godzin zostaje bez godzin. */
export function shiftStepsFrom(steps: readonly SessionStep[], fromIdx: number, deltaMs: number): SessionStep[] {
  return steps.map((s, i) =>
    i < fromIdx
      ? s
      : {
          ...s,
          plannedStart: s.plannedStart === null ? null : s.plannedStart + deltaMs,
          plannedEnd: s.plannedEnd === null ? null : s.plannedEnd + deltaMs,
        }
  );
}

/**
 * Potwierdzenie bieżącego kroku w chwili `now` (BR-HARMO-005 „krok skończony wcześniej”, BR-HARMO-004):
 * bieżący krok kończy się teraz, dalsze przesuwają się o różnicę względem terminu, następny krok startuje
 * z zegarem (jeśli ma czas). Ostatni krok: indeks bez zmian, zegar stoi (koniec wypieku zapisuje ekran).
 */
export function confirmStep(progress: BakeProgress, now: number): { progress: BakeProgress; undo: StepUndo; done: boolean } {
  const idx = progress.stepIdx;
  const deadline = currentStepDeadline(progress);
  const delta = deadline === null ? 0 : now - deadline;
  const shifted = shiftStepsFrom(progress.steps, idx + 1, delta).map((s, i) => (i === idx ? { ...s, plannedEnd: now } : s));
  const undo: StepUndo = { before: progress, confirmedAt: now };
  const nextIdx = idx + 1;
  if (nextIdx >= shifted.length) {
    return { progress: { ...progress, steps: shifted, timerEndsAt: null, pausedLeftSec: null }, undo, done: true };
  }
  const next = shifted[nextIdx];
  const timerEndsAt = stepHasTimer(next) ? now + stepDurationSec(next, 'lid_on') * 1000 : null;
  return {
    progress: { steps: shifted, stepIdx: nextIdx, dutchOvenPhase: 'lid_on', timerEndsAt, pausedLeftSec: null },
    undo,
    done: false,
  };
}

/**
 * Przejście do kroku `idx` z arkusza „Plan wypieku” w chwili `now`: wybrany krok zaczyna się teraz, dalsze kroki
 * przesuwają się razem z nim (powiadomienia idą za planem), wcześniejsze bez zmian; zegar wybranego kroku od teraz.
 * Krok bez planu godzin nie przesuwa planu [audyt-niezalezny D-8].
 */
export function skokDoKroku(progress: BakeProgress, idx: number, now: number): BakeProgress {
  const start = progress.steps[idx]?.plannedStart ?? null;
  const steps = start === null ? [...progress.steps] : shiftStepsFrom(progress.steps, idx, now - start);
  const krok = steps[idx];
  const timerEndsAt = stepHasTimer(krok) ? now + stepDurationSec(krok, 'lid_on') * 1000 : null;
  return { steps, stepIdx: idx, dutchOvenPhase: 'lid_on', timerEndsAt, pausedLeftSec: null };
}

/** Czy cofnięcie jest dostępne: jest migawka bieżącego wypieku, a wypiek nie stoi na pierwszym kroku. */
export function canUndoConfirm(progress: BakeProgress, undo: StepUndo | null): boolean {
  return undo !== null && progress.stepIdx > 0 && undo.before.stepIdx === progress.stepIdx - 1;
}

/**
 * Cofnięcie pomyłkowego potwierdzenia w chwili `now`: postęp sprzed potwierdzenia (krok, plan i zegar);
 * `overdueMs` > 0, gdy termin cofanego kroku już minął (ekran pokazuje o ile i proponuje przesunięcie, BR-HARMO-004).
 */
export function undoConfirm(undo: StepUndo, now: number): { progress: BakeProgress; overdueMs: number } {
  const deadline = currentStepDeadline(undo.before);
  return { progress: undo.before, overdueMs: deadline === null ? 0 : Math.max(0, now - deadline) };
}
