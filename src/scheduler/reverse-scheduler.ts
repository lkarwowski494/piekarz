// ============================================================================
// Piekarz — fasada harmonogramu wstecznego (BR-HARMO-001…004). Logika w domenie src/core/reverse-scheduler.ts
// (granice ADR-006) [M1-audytor-generalny-020]; tu dochodzi formatowanie godziny kolizji w języku aplikacji.
// ============================================================================

import {
  calculateReverseSchedule as policzPlan,
  autoResolveSleepCollision as rozwiazKolizje,
  type ScheduleOptions,
  type ReverseScheduleResult,
  type AutoResolveResult,
} from '../core/reverse-scheduler';
import { formatTime } from '../lib/format';

export * from '../core/reverse-scheduler';

const zGodzina = (options: ScheduleOptions): ScheduleOptions => ({ formatujGodzine: formatTime, ...options });

/** Harmonogram wsteczny z godzinami kolizji według języka aplikacji. */
export function calculateReverseSchedule(targetReadyTime: Date, options: ScheduleOptions = {}): ReverseScheduleResult {
  return policzPlan(targetReadyTime, zGodzina(options));
}

/** Automatyczne wydłużenie lodówki bez kolizji ze snem, z godzinami według języka aplikacji. */
export function autoResolveSleepCollision(targetReadyTime: Date, options: ScheduleOptions = {}): AutoResolveResult | null {
  return rozwiazKolizje(targetReadyTime, zGodzina(options));
}
