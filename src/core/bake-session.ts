// ============================================================================
// Piekarz — postęp trwającego wypieku jako znaczniki czasu [M1-audytor-generalny-019]
// Czas zegara liczony z zapisanego końca (timerEndsAt), nie z licznika w pamięci,
// więc po zabiciu procesu Stolnica wraca do kroku z poprawnym czasem.
// Kroki pochodzą z sesji (plan Harmonogramu/receptury), nie ze stałej listy [M1-audytor-generalny-030].
// ============================================================================

import { DUTCH_OVEN_PHASES, DutchOvenBakePhase } from './baking-phases';
import { SessionStep, isDutchOvenStep } from './bake-steps';

export interface BakeProgress {
  /** Kroki tego wypieku (migawka planu albo LEGACY_STEPS_V1 ze starego zapisu). */
  steps: readonly SessionStep[];
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
export function stepDurationSec(step: SessionStep | undefined, phase: DutchOvenBakePhase): number {
  if (!step) return 0;
  return isDutchOvenStep(step) ? DUTCH_OVEN_PHASES[phase].durationMin * 60 : step.durationMin * 60;
}

/** Stan zegara po wznowieniu aplikacji w chwili `now`. */
export function restoreTimerState(progress: BakeProgress, now: number): TimerState {
  if (progress.timerEndsAt !== null) {
    const left = Math.max(0, Math.ceil((progress.timerEndsAt - now) / 1000));
    return { timeLeftSec: left, isRunning: left > 0, isCompleted: left <= 0 };
  }
  const full = stepDurationSec(progress.steps[progress.stepIdx], progress.dutchOvenPhase);
  return { timeLeftSec: progress.pausedLeftSec ?? full, isRunning: false, isCompleted: false };
}

/** Indeks kroku z zapisu: liczba całkowita w zakresie kroków sesji, inaczej null. */
export function validStepIdx(v: unknown, steps: readonly unknown[]): number | null {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < steps.length ? v : null;
}
