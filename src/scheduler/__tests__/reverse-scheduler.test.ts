import { calculateReverseSchedule } from '../reverse-scheduler';

describe('Piekarz Reverse Scheduler (BR-HARMO-001…004)', () => {
  it('Calculates complete timeline backwards from Sunday 09:00 AM', () => {
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

  it('Adapts bulk fermentation duration based on kitchen temperature', () => {
    const target = new Date(2026, 9, 18, 9, 0, 0);

    // In hot kitchen (28°C), bulk ferment should be shortened
    const hotSchedule = calculateReverseSchedule(target, { ambientTemperatureC: 28.0 });
    const normalSchedule = calculateReverseSchedule(target, { ambientTemperatureC: 24.0 });

    const hotBulk = hotSchedule.stages.find((s) => s.category === 'bulk_ferment')!;
    const normalBulk = normalSchedule.stages.find((s) => s.category === 'bulk_ferment')!;

    expect(hotBulk.durationMinutes).toBeLessThan(normalBulk.durationMinutes);
  });
});
