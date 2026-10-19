// ============================================================================
// Piekarz — kroki Stolnicy z planu Harmonogramu i receptury (F-07, ZM-02, D-030) [M1-audytor-generalny-030]
// Jedno źródło kroków: calculateReverseSchedule. Chleb żytni (isHighRye, > 50% żyta, ZYT-GRA-001) dostaje
// etapy z rye-stages.ts z czasami planu (wariant a roli 06): bez składań, pszenna lista nie jest podstawiana.
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
  /** Minuty z planu; null = etap żytni bez odpowiednika w planie, bez minutnika (ZYT-ETA-900). */
  durationMin: number | null;
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

/** Krok wypieku w garnku: zegar dwóch faz (DUTCH_OVEN_PHASES). Chleb żytni piecze się w formie (ZYT-ETA-001). */
export function isDutchOvenStep(step: Pick<SessionStep, 'id' | 'category'>): boolean {
  return step.category === 'bake' && !RYE_STAGE_TEMPLATES.some((tp) => tp.id === step.id);
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

/** Szablony etapów ułożone kolejno od `startAt`. */
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

/**
 * Wariant żytni (wariant a roli 06): etapy z rye-stages.ts w ich kolejności; czas etapu = czas etapu planu
 * tej samej kategorii (ZYT-ETA-900: brak czasów domowych w źródłach). Brak odpowiednika w planie = null
 * (krok bez minutnika); od takiego etapu dalsze planowane godziny są nieznane. rye_cool: zalecenie ZYT-STU-001.
 */
export function ryeStepsFromPlan(plan: readonly Pick<SessionStep, 'category' | 'durationMin'>[], startAt: number): SessionStep[] {
  let at: number | null = startAt;
  return RYE_STAGE_TEMPLATES.map((tp) => {
    const durationMin = tp.fixedDurationMin ?? plan.find((s) => s.category === tp.category)?.durationMin ?? null;
    const start = at;
    at = at !== null && durationMin !== null ? at + durationMin * 60_000 : null;
    return {
      id: tp.id,
      name: tp.namePl,
      category: tp.category,
      durationMin,
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
 * Kroki wypieku od `startAt`: plan z calculateReverseSchedule (kompensacja temperatury jak w Harmonogramie).
 * Żyto: etapy z rye-stages.ts z czasami tego planu (ryeStepsFromPlan); pszennej listy nie podstawiamy.
 */
export function planBakeSteps(input: { startAt: number; isHighRye: boolean; ambientTempC?: number }): SessionStep[] {
  const plan = stepsFromSchedule(scheduleFromStart(input.startAt, { ambientTemperatureC: input.ambientTempC }));
  return input.isHighRye ? ryeStepsFromPlan(plan, input.startAt) : plan;
}
