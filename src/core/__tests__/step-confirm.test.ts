/**
 * M1-audytor-generalny-102, BR-HARMO-005 (docs/brd/wymagania-wypiek.md:58-77): zakończenie kroku wcześniej
 * i cofnięcie pomyłkowo potwierdzonego kroku; plan powiadomień dla kolejnych kroków. Czas jako argument.
 */
import { confirmStep, undoConfirm, canUndoConfirm, shiftStepsFrom, currentStepDeadline, type StepUndo } from '../step-confirm';
import { planBakeStepNotifications, planBakeNotification } from '../notification-plan';
import { restoreTimerState, type BakeProgress } from '../bake-session';
import type { SessionStep } from '../bake-steps';
import type { StageCategory } from '../../scheduler/reverse-scheduler';

const MIN = 60_000;
const at = (h: number, m = 0) => new Date(2026, 9, 21, h, m).getTime();

function plan(startAt: number, spec: Array<[string, StageCategory, number]>): SessionStep[] {
  let t = startAt;
  return spec.map(([id, category, min]) => {
    const s = { id, name: id, category, durationMin: min, isPassive: false, instructions: '', plannedStart: t, plannedEnd: t + min * MIN };
    t += min * MIN;
    return s;
  });
}

// mix 11:00–11:20, bulk 11:20–11:40 (krok 2), pre_shape 11:40–12:00 (krok 3), bench 12:00–12:40 (krok 4),
// final_proof 12:40–14:00 (garowanie), bake 14:00–14:45 (garnek), cool 14:45–15:45
const STEPS = plan(at(11), [
  ['mix', 'mix', 20], ['bulk_ferment', 'bulk_ferment', 20], ['pre_shape', 'pre_shape', 20], ['bench_rest', 'bench_rest', 40],
  ['final_proof', 'final_proof', 80], ['bake', 'bake', 45], ['cool', 'cool', 60],
]);
const progressAt = (stepIdx: number): BakeProgress => ({
  steps: STEPS, stepIdx, dutchOvenPhase: 'lid_on', timerEndsAt: STEPS[stepIdx].plannedEnd, pausedLeftSec: null,
});
// D2: identyfikatory powiadomień niosą id wypieku (piekarz.wypiek.<id>.krok…), nie `piekarz.krok…` jak w 1014
const P = 'piekarz.wypiek.bake_x.';
const wWypieku = (p: BakeProgress) => ({ ...p, id: 'bake_x', recipeName: 'Chleb' });
const triggers = (p: BakeProgress, now: number) => planBakeStepNotifications(wWypieku(p), now).map((n) => [n.id, n.triggerAt]);

describe('BR-HARMO-005: zakończenie kroku wcześniej i cofnięcie potwierdzenia (102)', () => {
  it('BR-HARMO-005 Krok skończony wcześniej: garowanie z terminem 14:00 zakończone 13:30 → dalsze kroki 30 min wcześniej, powiadomienia z nowymi godzinami', () => {
    const before = progressAt(4);
    expect(currentStepDeadline(before)).toBe(at(14));
    const { progress, done } = confirmStep(before, at(13, 30));
    expect(done).toBe(false);
    expect(progress.stepIdx).toBe(5);
    expect(progress.steps[4].plannedEnd).toBe(at(13, 30));
    expect(progress.steps.slice(5).map((s) => [s.plannedStart, s.plannedEnd])).toEqual(
      STEPS.slice(5).map((s) => [s.plannedStart! - 30 * MIN, s.plannedEnd! - 30 * MIN])
    );
    expect(progress.steps.slice(0, 4)).toEqual(STEPS.slice(0, 4));
    // Powiadomienia: zdjęcie pokrywki 13:50 (było 14:20), koniec pieczenia 14:15, studzenie 15:15
    expect(triggers(progress, at(13, 30))).toEqual([
      [`${P}krok`, at(13, 30) + 20 * MIN],
      [`${P}krok.6`, at(15, 15)],
    ]);
    expect(triggers(before, at(13, 30))).toEqual([
      [`${P}krok`, at(14)],
      [`${P}krok.5.pokrywka`, at(14, 20)],
      [`${P}krok.5`, at(14, 45)],
      [`${P}krok.6`, at(15, 45)],
    ]);
  });

  it('BR-HARMO-005 Cofnięcie pomyłkowego potwierdzenia: krok 4 potwierdzony o 12:00 (termin 12:40), cofnięty o 12:05 → krok 4 z 35 min, plan i powiadomienia jak przed', () => {
    const before = progressAt(3);
    const { progress, undo } = confirmStep(before, at(12));
    expect(progress.stepIdx).toBe(4);
    expect(canUndoConfirm(progress, undo)).toBe(true);
    const back = undoConfirm(undo, at(12, 5));
    expect(back.progress).toEqual(before);
    expect(back.overdueMs).toBe(0);
    expect(back.progress.stepIdx).toBe(3);
    expect(restoreTimerState(back.progress, at(12, 5)).timeLeftSec).toBe(35 * 60);
    expect(planBakeStepNotifications(wWypieku(back.progress), at(12, 5))).toEqual(planBakeStepNotifications(wWypieku(before), at(12, 5)));
  });

  it('BR-HARMO-005 Cofnięcie po terminie kroku: widać, o ile termin minął, i można przesunąć dalsze kroki (BR-HARMO-004)', () => {
    const { undo } = confirmStep(progressAt(3), at(12));
    const back = undoConfirm(undo, at(12, 50));
    expect(back.overdueMs).toBe(10 * MIN);
    const moved = shiftStepsFrom(back.progress.steps, 4, back.overdueMs);
    expect(moved[4].plannedStart).toBe(at(12, 50));
    expect(moved[3]).toEqual(STEPS[3]);
  });

  it('BR-HARMO-005 Brak kroku do cofnięcia: na pierwszym kroku cofnięcie niedostępne', () => {
    const first = progressAt(0);
    expect(canUndoConfirm(first, null)).toBe(false);
    const stale: StepUndo = { before: progressAt(2), confirmedAt: at(11) };
    expect(canUndoConfirm(first, stale)).toBe(false);
  });

  it('potwierdzenie po terminie przesuwa dalsze kroki później (BR-HARMO-004: termin 14:00, potwierdzenie 15:00 → +60 min)', () => {
    const { progress } = confirmStep(progressAt(4), at(15));
    expect(progress.steps[5].plannedStart).toBe(at(15));
    expect(progress.steps[6].plannedEnd).toBe(STEPS[6].plannedEnd! + 60 * MIN);
  });

  it('ostatni krok: koniec planu, zegar stoi; krok bez planu godzin zostaje bez godzin', () => {
    const { progress, done } = confirmStep(progressAt(6), at(15, 30));
    expect(done).toBe(true);
    expect(progress.stepIdx).toBe(6);
    expect(progress.timerEndsAt).toBeNull();
    const noPlan = STEPS.map((s) => ({ ...s, plannedStart: null, plannedEnd: null }));
    expect(shiftStepsFrom(noPlan, 0, 5 * MIN)).toEqual(noPlan);
    expect(planBakeStepNotifications({ ...wWypieku(progressAt(0)), steps: noPlan, timerEndsAt: null }, at(11))).toEqual([]);
    expect(planBakeStepNotifications(null, at(11))).toEqual([]);
  });

  it('bieżący krok w powiadomieniach jak dotąd (planBakeNotification)', () => {
    const p = wWypieku(progressAt(2));
    expect(planBakeStepNotifications(p, at(11, 45))[0]).toEqual(planBakeNotification(p, at(11, 45)));
  });
});
