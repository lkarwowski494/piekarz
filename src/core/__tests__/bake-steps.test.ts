import {
  isStageCategory,
  isDutchOvenStep,
  stepsFromSchedule,
  stepsFromTemplates,
  scheduleFromStart,
  planBakeSteps,
  ryeStepsFromPlan,
} from '../bake-steps';
import { RYE_STAGE_TEMPLATES, RYE_PROOF_STAGE_ID } from '../rye-stages';
import { LEGACY_STEPS_V1 } from '../legacy-steps-v1';
import { calculateReverseSchedule, DEFAULT_STAGE_TEMPLATES } from '../../scheduler/reverse-scheduler';

// [M1-audytor-generalny-030] kroki Stolnicy z planu (F-07, ZM-02); żyto: etapy roli 06 z czasami planu
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

  it('planBakeSteps: wheat gets the plan from the start (BR-ETAP-002: pszenne ze składaniami z receptury)', () => {
    const wheat = planBakeSteps({ startAt: start, isHighRye: false });
    expect(wheat.map((s) => s.id)).toEqual(DEFAULT_STAGE_TEMPLATES.map((tp) => tp.id));
    expect(wheat[0].plannedStart).toBe(start);
  });

  // Wariant żytni, wariant (a) roli 06: kolejność ZYT-ETA-001, czasy z planu użytkownika (ZYT-ETA-900)
  const RYE_ORDER = ['rye_starter', 'rye_mix', 'rye_rest', 'rye_shape', 'rye_proof', 'rye_bake', 'rye_cool'];
  const FOLDING = /składa|fold|stretch|coil/i;

  it('RYE_STAGE_TEMPLATES: order and categories of role 06, no folding, pre_shape or bench_rest (ZYT-ETA-001)', () => {
    expect(RYE_STAGE_TEMPLATES.map((tp) => [tp.id, tp.category, tp.isPassive])).toEqual([
      ['rye_starter', 'starter_feed', true], ['rye_mix', 'mix', false], ['rye_rest', 'bulk_ferment', true],
      ['rye_shape', 'final_shape', false], ['rye_proof', 'final_proof', true], ['rye_bake', 'bake', true],
      ['rye_cool', 'cool', true],
    ]);
    for (const tp of RYE_STAGE_TEMPLATES) {
      expect(['pre_shape', 'bench_rest']).not.toContain(tp.category);
      expect(`${tp.namePl} ${tp.instructionsPl}`).not.toMatch(FOLDING);
    }
    expect(RYE_STAGE_TEMPLATES.find((tp) => tp.id === RYE_PROOF_STAGE_ID)?.instructionsPl).toBe(
      'Zostaw ciasto w formie, aż jego powierzchnia dojdzie do brzegu formy.'
    );
    // rye_proof 240 min (ZYT-ETA-007) [audyt-niezalezny D-7], rye_cool 24 h (ZYT-STU-001)
    expect(RYE_STAGE_TEMPLATES.filter((tp) => tp.fixedDurationMin !== null).map((tp) => [tp.id, tp.fixedDurationMin])).toEqual([
      ['rye_proof', 240], ['rye_cool', 1440],
    ]);
  });

  it('planBakeSteps rye: order of role 06, each duration = plan stage of the same category, rye_cool 1440 (BR-ETAP-002 Wariant żytni)', () => {
    const rye = planBakeSteps({ startAt: start, isHighRye: true, ambientTempC: 22 });
    expect(rye.map((s) => s.id)).toEqual(RYE_ORDER);
    expect(rye.some((s) => FOLDING.test(`${s.name} ${s.instructions}`))).toBe(false);
    const plan = scheduleFromStart(start, { ambientTemperatureC: 22 }).stages;
    const planMin = (c: string) => plan.find((st) => st.category === c)?.durationMinutes;
    for (const s of rye) {
      expect(s.durationMin).toBe(s.id === 'rye_cool' ? 1440 : s.id === 'rye_proof' ? 240 : planMin(s.category));
    }
    expect(rye[0].plannedStart).toBe(start);
    for (let i = 1; i < rye.length; i++) expect(rye[i].plannedStart).toBe(rye[i - 1].plannedEnd);
    expect(rye.find((s) => s.id === 'rye_rest')?.durationMin).toBe(planMin('bulk_ferment'));
    expect(rye.filter(isDutchOvenStep)).toEqual([]);
  });

  it('ryeStepsFromPlan: a stage with no counterpart in the plan has no time (null), later stages no planned clock', () => {
    const plan = stepsFromSchedule(scheduleFromStart(start)).filter((s) => s.category !== 'bulk_ferment');
    const rye = ryeStepsFromPlan(plan, start);
    const rest = rye.find((s) => s.id === 'rye_rest');
    expect(rest).toEqual(expect.objectContaining({ durationMin: null, plannedStart: rye[1].plannedEnd, plannedEnd: null }));
    expect(rye.slice(3).every((s) => s.plannedStart === null && s.plannedEnd === null)).toBe(true);
    expect(rye.find((s) => s.id === 'rye_shape')?.durationMin).toBe(plan.find((s) => s.category === 'final_shape')?.durationMin);
    // migawka Harmonogramu: czas lodówki planu pszennego nie zmienia rozrostu w formie (ZYT-ETA-007) [audyt-niezalezny D-7]
    const snap = stepsFromSchedule(calculateReverseSchedule(new Date(start), { coldRetardHours: 10 }));
    expect(ryeStepsFromPlan(snap, start).find((s) => s.id === RYE_PROOF_STAGE_ID)?.durationMin).toBe(240);
    expect(ryeStepsFromPlan(snap, start).find((s) => s.id === 'rye_shape')?.durationMin).toBe(snap.find((s) => s.category === 'final_shape')?.durationMin);
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
    expect(isDutchOvenStep({ id: 'bake', category: 'bake' })).toBe(true);
    expect(isDutchOvenStep({ id: 'mix', category: 'mix' })).toBe(false);
    // chleb żytni piecze się w formie, nie w garnku (ZYT-ETA-001)
    expect(isDutchOvenStep({ id: 'rye_bake', category: 'bake' })).toBe(false);
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
