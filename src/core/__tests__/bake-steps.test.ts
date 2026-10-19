import {
  isStageCategory,
  isDutchOvenStep,
  stepsFromSchedule,
  stepsFromTemplates,
  scheduleFromStart,
  planBakeSteps,
} from '../bake-steps';
import { RYE_STAGE_TEMPLATES } from '../rye-stages';
import { LEGACY_STEPS_V1 } from '../legacy-steps-v1';
import { calculateReverseSchedule, DEFAULT_STAGE_TEMPLATES } from '../../scheduler/reverse-scheduler';

// [M1-audytor-generalny-030] kroki Stolnicy z planu (F-07, ZM-02); żyto bez listy etapów zablokowane (RD-11)
describe('bake steps from the plan (030)', () => {
  const start = Date.UTC(2026, 9, 19, 23, 55); // poniedziałek 23:55 UTC

  it('stepsFromSchedule keeps id, order, names, durations and planned times of schedule.stages', () => {
    const schedule = calculateReverseSchedule(new Date(start), { ambientTemperatureC: 20 });
    const steps = stepsFromSchedule(schedule);
    expect(steps.map((s) => [s.id, s.name, s.category, s.durationMin, s.isPassive, s.instructions, s.plannedStart, s.plannedEnd])).toEqual(
      schedule.stages.map((st) => [st.id, st.namePl, st.category, st.durationMinutes, st.isPassive, st.instructionsPl, st.startTime.getTime(), st.endTime.getTime()])
    );
  });

  it('scheduleFromStart begins the first stage at the given moment with the same durations', () => {
    const s = scheduleFromStart(start, { ambientTemperatureC: 22 });
    expect(s.stages[0].startTime.getTime()).toBe(start);
    expect(s.stages.map((st) => st.durationMinutes)).toEqual(
      calculateReverseSchedule(new Date(start), { ambientTemperatureC: 22 }).stages.map((st) => st.durationMinutes)
    );
  });

  it('planBakeSteps: wheat gets the plan; rye (isHighRye) gets no steps at all, so no folding step', () => {
    const wheat = planBakeSteps({ startAt: start, isHighRye: false });
    expect(wheat?.map((s) => s.id)).toEqual(DEFAULT_STAGE_TEMPLATES.map((tp) => tp.id));
    expect(wheat?.[0].plannedStart).toBe(start);
    expect(RYE_STAGE_TEMPLATES).toEqual([]);
    const rye = planBakeSteps({ startAt: start, isHighRye: true, ambientTempC: 22 });
    expect(rye).toBeNull();
    expect((rye ?? []).some((s) => s.category === 'bulk_ferment' || /składa/i.test(s.name))).toBe(false);
  });

  it('stepsFromTemplates lays templates one after another from the start (rye data module shape)', () => {
    const tps = DEFAULT_STAGE_TEMPLATES.slice(1, 3);
    const steps = stepsFromTemplates(tps, start);
    expect(steps.map((s) => [s.id, s.plannedStart, s.plannedEnd])).toEqual([
      [tps[0].id, start, start + tps[0].durationMinutes * 60_000],
      [tps[1].id, start + tps[0].durationMinutes * 60_000, start + (tps[0].durationMinutes + tps[1].durationMinutes) * 60_000],
    ]);
  });

  it('isDutchOvenStep and isStageCategory', () => {
    expect(isDutchOvenStep({ category: 'bake' })).toBe(true);
    expect(isDutchOvenStep({ category: 'mix' })).toBe(false);
    expect(isStageCategory('final_proof')).toBe(true);
    expect(isStageCategory('fold')).toBe(false);
    expect(isStageCategory(3)).toBe(false);
  });

  it('LEGACY_STEPS_V1 is the frozen copy of the 8 steps from HEAD 1c38b28', () => {
    expect(LEGACY_STEPS_V1.map((s) => [s.id, s.durationMin])).toEqual([
      ['step_1', 45], ['step_2', 15], ['step_3', 30], ['step_4', 30], ['step_5', 30], ['step_6', 20], ['step_7', 720], ['step_8', 45],
    ]);
    expect(Object.isFrozen(LEGACY_STEPS_V1)).toBe(true);
    expect(Object.isFrozen(LEGACY_STEPS_V1[0])).toBe(true);
    expect(LEGACY_STEPS_V1.filter(isDutchOvenStep).map((s) => s.id)).toEqual(['step_8']);
  });
});
