// ============================================================================
// Piekarz — ostrzeżenia bieżącego kroku prowadzenia (BR-ETAP-004, RD-22, RD-23) [M1-audytor-generalny-103]
// Łączy rodzaj kroku (stepKindOf) z mapą roli 06 (stepKindWarnings, src/core/step-warnings.ts) i ustala, czy krok
// trwa w czasie wypieku (od nagrzewania albo pieczenia do studzenia) — dla kroku nieznanego rodzaju (RD-23-W4).
// ============================================================================

import type { SessionStep } from './bake-steps';
import type { DutchOvenBakePhase } from './baking-phases';
import { stepKindOf, stepKindWarnings, type StepWarning } from './step-warnings';

/** Czy krok `idx` leży w czasie wypieku: od pierwszego nagrzewania albo pieczenia do pierwszego studzenia po nim. */
export function wTrakcieWypieku(steps: readonly Pick<SessionStep, 'category'>[], idx: number): boolean {
  const start = steps.findIndex((s) => s.category === 'preheat_oven' || s.category === 'bake');
  if (start < 0 || idx < start) return false;
  const koniec = steps.findIndex((s, i) => i > start && s.category === 'cool');
  return koniec < 0 || idx < koniec;
}

/** Ostrzeżenia kroku `idx` planu; krok w garnku według fazy pokrywki (mapa: lid_on, lid_off). */
export function ostrzezeniaKroku(
  steps: readonly Pick<SessionStep, 'id' | 'category'>[],
  idx: number,
  phase?: DutchOvenBakePhase
): readonly StepWarning[] {
  const step = steps[idx];
  if (!step) return [];
  return stepKindWarnings(stepKindOf(step, phase), { duringBake: wTrakcieWypieku(steps, idx) });
}
