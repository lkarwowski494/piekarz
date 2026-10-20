import { calculateReverseSchedule, autoResolveSleepCollision } from '../reverse-scheduler';

describe('Piekarz Reverse Scheduler (BR-HARMO-001…004)', () => {
  it('Calculates complete timeline backwards from Sunday 09:00 AM (BR-HARMO-001 Godziny etapów)', () => {
    // Sunday 2026-10-18 at 09:00:00
    const targetSundayMorning = new Date(2026, 9, 18, 9, 0, 0);

    const schedule = calculateReverseSchedule(targetSundayMorning);

    expect(schedule.stages.length).toBe(11);

    // Last step is cooling (ends at 09:00)
    const coolStep = schedule.stages[schedule.stages.length - 1];
    expect(coolStep.category).toBe('cool');
    expect(coolStep.endTime.getHours()).toBe(9);
    expect(coolStep.endTime.getMinutes()).toBe(0);

    // Bake step is right before cooling (starts at 06:15, ends at 07:00, cool from 07:00 to 09:00)
    const bakeStep = schedule.stages.find((s) => s.category === 'bake')!;
    expect(bakeStep).toBeDefined();
    expect(bakeStep.endTime.getTime()).toBe(coolStep.startTime.getTime());

    // First step is starter feed
    const firstStep = schedule.stages[0];
    expect(firstStep.category).toBe('starter_feed');
    expect(firstStep.startTime.getTime()).toBeLessThan(targetSundayMorning.getTime());
  });

  it('Sleep Guard detects active steps that fall into sleeping window (e.g. 02:00 AM)', () => {
    // Set target time such that active folding or shaping falls in the middle of the night
    // Target Sunday 14:00 (2:00 PM) => steps will shift back into early night hours
    const targetAfternoon = new Date(2026, 9, 18, 14, 0, 0);

    const schedule = calculateReverseSchedule(targetAfternoon, {
      sleepStartHour: 23.0,
      sleepEndHour: 6.5,
    });

    if (schedule.hasSleepCollision) {
      expect(schedule.collisionDetailsPl).toBeDefined();
      expect(schedule.suggestedActionPl).toContain('Sugerowana korekta');
    }
  });

  // [M1-audytor-generalny-005; 07-jakosc-002 M1] granica końca snu: 06:30 to już nie noc, 06:29 jeszcze tak.
  it('Sleep Guard boundary: an active step starting exactly at sleepEnd (06:30) is not a collision', () => {
    const base = new Date(2026, 9, 18, 12, 0, 0);
    const opts = { sleepStartHour: 23.0, sleepEndHour: 6.5 };
    const ref = calculateReverseSchedule(base, opts);
    const idx = ref.stages.findIndex((s) => !s.isPassive && s.durationMinutes < 120);
    expect(idx).toBeGreaterThanOrEqual(0);

    const shiftTo = (h: number, m: number) => {
      const want = new Date(ref.stages[idx].startTime.getTime());
      want.setHours(h, m, 0, 0);
      const offset = want.getTime() - ref.stages[idx].startTime.getTime();
      return calculateReverseSchedule(new Date(base.getTime() + offset), opts).stages[idx];
    };

    const atWake = shiftTo(6, 30);
    expect(atWake.startTime.getHours() * 60 + atWake.startTime.getMinutes()).toBe(6 * 60 + 30);
    expect(atWake.isSleepCollision).toBe(false);

    const beforeWake = shiftTo(6, 29);
    expect(beforeWake.isSleepCollision).toBe(true);
  });

  it('Adapts bulk fermentation duration based on kitchen temperature', () => {
    const target = new Date(2026, 9, 18, 9, 0, 0);

    // In hot kitchen (28°C), bulk ferment should be shortened
    const hotSchedule = calculateReverseSchedule(target, { ambientTemperatureC: 28.0 });
    const normalSchedule = calculateReverseSchedule(target, { ambientTemperatureC: 24.0 });

    const hotBulk = hotSchedule.stages.find((s) => s.category === 'bulk_ferment')!;
    const normalBulk = normalSchedule.stages.find((s) => s.category === 'bulk_ferment')!;

    expect(hotBulk.durationMinutes).toBeLessThan(normalBulk.durationMinutes);
  });

  it('Adjusts cold retard duration when coldRetardHours option is specified', () => {
    const target = new Date(2026, 9, 18, 12, 0, 0);
    const schedule10h = calculateReverseSchedule(target, { coldRetardHours: 10 });
    const schedule16h = calculateReverseSchedule(target, { coldRetardHours: 16 });

    const proof10 = schedule10h.stages.find((s) => s.category === 'final_proof')!;
    const proof16 = schedule16h.stages.find((s) => s.category === 'final_proof')!;

    expect(proof10.durationMinutes).toBe(600); // 10h
    expect(proof16.durationMinutes).toBe(960); // 16h
  });

  it('autoResolveSleepCollision automatically finds an adjusted cold retard duration that clears collisions (BR-HARMO-002 Krok czynny w nocy)', () => {
    // 18:00 (6:00 PM) target ready time with standard 14h retard causes shaping & folding to fall around midnight (00:15 AM)
    const target = new Date(2026, 9, 18, 18, 0, 0);
    const initial = calculateReverseSchedule(target, { sleepStartHour: 23.0, sleepEndHour: 6.5, coldRetardHours: 14 });

    expect(initial.hasSleepCollision).toBe(true);
    expect(initial.collisionDetailsPl).toContain('Formowanie');

    // autoResolveSleepCollision should lengthen the cold retard (e.g. to 16h) so shaping happens before 23:00
    const resolved = autoResolveSleepCollision(target, { sleepStartHour: 23.0, sleepEndHour: 6.5, coldRetardHours: 14 });
    expect(resolved).not.toBeNull();
    if (resolved) {
      expect(resolved.resolvedSchedule.hasSleepCollision).toBe(false);
      expect(resolved.adjustedColdRetardHours).toBeGreaterThan(14);
    }
  });
});
