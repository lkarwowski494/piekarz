/**
 * Plan żytni w planie wypieku: etapy żytnie wstecz od godziny „gotowe”; migawka z etapami żytnimi nie jest
 * przeliczana drugi raz [M1-audytor-generalny-030; 03-zakres-501].
 */
import { areRyeSteps, ryeStepsEndingAt, stepsFromSchedule } from '../bake-steps';
import { calculateReverseSchedule } from '../../scheduler/reverse-scheduler';
import { RYE_STAGE_TEMPLATES } from '../rye-stages';

const GOTOWE = new Date(2026, 9, 23, 23, 30).getTime();

describe('ryeStepsEndingAt', () => {
  const plan = stepsFromSchedule(calculateReverseSchedule(new Date(GOTOWE), { ambientTemperatureC: 23 }));

  it('etapy żytnie w kolejności roli 06, ciągłe, ostatni (studzenie 24 h) kończy się o godzinie „gotowe”', () => {
    const kroki = ryeStepsEndingAt(plan, GOTOWE);
    expect(kroki.map((k) => k.id)).toEqual(RYE_STAGE_TEMPLATES.map((tp) => tp.id));
    expect(kroki[kroki.length - 1]).toMatchObject({ id: 'rye_cool', durationMin: 1440, plannedEnd: GOTOWE });
    for (let i = 1; i < kroki.length; i++) expect(kroki[i].plannedStart).toBe(kroki[i - 1].plannedEnd);
    const suma = kroki.reduce((s, k) => s + (k.durationMin ?? 0), 0);
    expect(kroki[0].plannedStart).toBe(GOTOWE - suma * 60_000);
  });

  it('etap bez czasu w planie: kroki od początku planu (godziny dalszych etapów nieznane)', () => {
    const bezGarowania = plan.filter((k) => k.category !== 'final_proof');
    const kroki = ryeStepsEndingAt(bezGarowania, GOTOWE);
    expect(kroki[0].plannedStart).toBe(bezGarowania[0].plannedStart);
    expect(kroki.find((k) => k.id === 'rye_proof')?.durationMin).toBeNull();
    expect(kroki[kroki.length - 1].plannedEnd).toBeNull();
  });
});

describe('areRyeSteps', () => {
  it('etapy żytnie (także z dokarmieniem z lodówki) tak, plan pszenny i pusta lista nie', () => {
    const zyto = RYE_STAGE_TEMPLATES.map((tp) => ({ id: tp.id }));
    expect(areRyeSteps(zyto)).toBe(true);
    expect(areRyeSteps([{ id: 'fridge_wake_feed' }, ...zyto.slice(1)])).toBe(true);
    expect(areRyeSteps(stepsFromSchedule(calculateReverseSchedule(new Date(GOTOWE), {})))).toBe(false);
    expect(areRyeSteps([])).toBe(false);
  });
});
