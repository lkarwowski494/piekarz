// ============================================================================
// Piekarz — kroki Stolnicy z planu Harmonogramu i receptury (F-07, ZM-02, D-030) [M1-audytor-generalny-030]
// Jedno źródło kroków: calculateReverseSchedule. Chleb żytni (isHighRye) dostaje kroki tylko z modułu
// rye-stages.ts; pusta lista = brak prowadzenia (RD-11: bez składań; pszenna lista nigdy nie jest podstawiana).
// ============================================================================

import {
  calculateReverseSchedule,
  ReverseScheduleResult,
  ScheduleOptions,
  StageCategory,
  StageTemplate,
} from '../scheduler/reverse-scheduler';
import { RYE_STAGE_TEMPLATES } from './rye-stages';

/** Migawka etapu planu zapisana w sesji wypieku; nazwa i instrukcja to klucze PL dla t(). */
export interface SessionStep {
  id: string;
  name: string;
  category: StageCategory;
  durationMin: number;
  isPassive: boolean;
  instructions: string;
  /** Planowany początek i koniec (ms od epoki); null = krok bez planu (stary zapis). */
  plannedStart: number | null;
  plannedEnd: number | null;
}

const CATEGORIES: readonly StageCategory[] = [
  'starter_feed', 'autolyse', 'mix', 'bulk_ferment', 'pre_shape', 'bench_rest',
  'final_shape', 'final_proof', 'preheat_oven', 'bake', 'cool',
];

/** Kategoria etapu z zestawu planu (StageCategory). */
export function isStageCategory(v: unknown): v is StageCategory {
  return CATEGORIES.some((c) => c === v);
}

/** Krok wypieku w garnku: zegar dwóch faz (DUTCH_OVEN_PHASES). */
export function isDutchOvenStep(step: Pick<SessionStep, 'category'>): boolean {
  return step.category === 'bake';
}

/** Etapy planu jako kroki Stolnicy: ta sama kolejność, id, nazwy i czasy. */
export function stepsFromSchedule(schedule: ReverseScheduleResult): SessionStep[] {
  return schedule.stages.map((st) => ({
    id: st.id,
    name: st.namePl,
    category: st.category,
    durationMin: st.durationMinutes,
    isPassive: st.isPassive,
    instructions: st.instructionsPl,
    plannedStart: st.startTime.getTime(),
    plannedEnd: st.endTime.getTime(),
  }));
}

/** Szablony etapów ułożone kolejno od `startAt` (lista żytnia z rye-stages.ts). */
export function stepsFromTemplates(templates: readonly StageTemplate[], startAt: number): SessionStep[] {
  let at = startAt;
  return templates.map((tp) => {
    const start = at;
    at += tp.durationMinutes * 60_000;
    return {
      id: tp.id,
      name: tp.namePl,
      category: tp.category,
      durationMin: tp.durationMinutes,
      isPassive: tp.isPassive,
      instructions: tp.instructionsPl,
      plannedStart: start,
      plannedEnd: at,
    };
  });
}

/** Plan liczony od chwili `startAt`: harmonogram wsteczny przesunięty tak, by pierwszy etap zaczynał się teraz. */
export function scheduleFromStart(startAt: number, options: ScheduleOptions = {}): ReverseScheduleResult {
  const probe = calculateReverseSchedule(new Date(startAt), options);
  const first = probe.stages[0];
  const lead = first ? startAt - first.startTime.getTime() : 0;
  return calculateReverseSchedule(new Date(startAt + lead), options);
}

/**
 * Kroki wypieku od `startAt`. Żyto: tylko lista z rye-stages.ts; pusta = null (Stolnica nie startuje).
 * Pszenica: plan z calculateReverseSchedule (kompensacja temperatury jak w Harmonogramie).
 */
export function planBakeSteps(input: { startAt: number; isHighRye: boolean; ambientTempC?: number }): SessionStep[] | null {
  if (input.isHighRye) {
    return RYE_STAGE_TEMPLATES.length > 0 ? stepsFromTemplates(RYE_STAGE_TEMPLATES, input.startAt) : null;
  }
  return stepsFromSchedule(scheduleFromStart(input.startAt, { ambientTemperatureC: input.ambientTempC }));
}
