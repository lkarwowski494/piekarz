// ============================================================================
// Piekarz — postęp trwającego wypieku jako znaczniki czasu [M1-audytor-generalny-019]
// Czas zegara liczony z zapisanego końca (timerEndsAt), nie z licznika w pamięci,
// więc po zabiciu procesu Stolnica wraca do kroku z poprawnym czasem.
// ============================================================================

import { BAKE_STEPS, DUTCH_OVEN_PHASES, DutchOvenBakePhase } from './baking-phases';

export interface BakeProgress {
  stepIdx: number;
  dutchOvenPhase: DutchOvenBakePhase;
  /** Koniec odliczania (ms od epoki), gdy zegar biegnie. */
  timerEndsAt: number | null;
  /** Pozostały czas zatrzymanego zegara (s); null = pełny czas kroku. */
  pausedLeftSec: number | null;
}

export interface TimerState {
  timeLeftSec: number;
  isRunning: boolean;
  isCompleted: boolean;
}

/** Pełny czas kroku w sekundach (krok w garnku: czas bieżącej fazy). */
export function stepDurationSec(stepIdx: number, phase: DutchOvenBakePhase): number {
  const step = BAKE_STEPS[stepIdx] ?? BAKE_STEPS[0];
  return step.id === 'step_8' ? DUTCH_OVEN_PHASES[phase].durationMin * 60 : step.timerMin * 60;
}

/** Stan zegara po wznowieniu aplikacji w chwili `now`. */
export function restoreTimerState(progress: BakeProgress, now: number): TimerState {
  if (progress.timerEndsAt !== null) {
    const left = Math.max(0, Math.ceil((progress.timerEndsAt - now) / 1000));
    return { timeLeftSec: left, isRunning: left > 0, isCompleted: left <= 0 };
  }
  const full = stepDurationSec(progress.stepIdx, progress.dutchOvenPhase);
  return { timeLeftSec: progress.pausedLeftSec ?? full, isRunning: false, isCompleted: false };
}

/** Indeks kroku z zapisu: liczba całkowita w zakresie listy kroków, inaczej null. */
export function validStepIdx(v: unknown): number | null {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < BAKE_STEPS.length ? v : null;
}
