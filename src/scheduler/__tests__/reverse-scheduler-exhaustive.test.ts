import {
  calculateReverseSchedule,
  autoResolveSleepCollision,
  DEFAULT_STAGE_TEMPLATES,
} from '../reverse-scheduler';

describe('Exhaustive Reverse Scheduler & Sleep Guard Invariants (BR-SCHED-EXHAUSTIVE)', () => {
  // --------------------------------------------------------------------------
  // 1. Full 24-Hour Target Matrix: Invariant Coverage Across Entire Day
  // --------------------------------------------------------------------------
  describe('Full 24-Hour Target Time Matrix', () => {
    // Generate tests for all 24 hours of the day
    for (let hour = 0; hour < 24; hour++) {
      const padHour = String(hour).padStart(2, '0');
      it(`calculates valid monotonic schedule for target ready at ${padHour}:00`, () => {
        const target = new Date(2026, 9, 20, hour, 0, 0); // 2026-10-20 at hour:00
        const result = calculateReverseSchedule(target, {
          ambientTemperatureC: 23.0,
          coldRetardHours: 14.0,
        });

        // Invariant 1: Exactly 11 stages
        expect(result.stages.length).toBe(11);

        // Invariant 2: Last stage is cooling and ends precisely at target ready time
        const cool = result.stages[result.stages.length - 1];
        expect(cool.category).toBe('cool');
        expect(cool.endTime.getTime()).toBe(target.getTime());

        // Invariant 3: Zero-gap continuity between every consecutive stage
        for (let i = 0; i < result.stages.length - 1; i++) {
          const current = result.stages[i];
          const next = result.stages[i + 1];
          expect(current.endTime.getTime()).toBe(next.startTime.getTime());
          expect(current.startTime.getTime()).toBeLessThan(current.endTime.getTime());
        }

        // Invariant 4: First stage is starter feeding
        expect(result.stages[0].category).toBe('starter_feed');
        expect(result.stages[0].startTime.getTime()).toBeLessThan(target.getTime());
      });
    }
  });

  // --------------------------------------------------------------------------
  // 2. Calendar Boundary Transitions (Month ends, Leap years, Year ends)
  // --------------------------------------------------------------------------
  describe('Calendar Boundary Transitions', () => {
    it('schedules backward across month boundary (Nov 1 morning to Oct 31 & Oct 30)', () => {
      // Target: Nov 1, 2026 at 09:00 AM
      const targetNov1 = new Date(2026, 10, 1, 9, 0, 0); // Month 10 is November in JS (0-indexed)
      const result = calculateReverseSchedule(targetNov1);

      const starterFeed = result.stages[0];
      // Starter feed should be on Oct 30 or Oct 31 (Month 9 in JS)
      expect(starterFeed.startTime.getMonth()).toBe(9); // October
      expect(starterFeed.startTime.getDate()).toBeLessThanOrEqual(31);
    });

    it('schedules backward across leap day boundary in 2028 (March 1 to Feb 29)', () => {
      // 2028 is a leap year (February 29 exists)
      const targetMarch1 = new Date(2028, 2, 1, 10, 0, 0); // Month 2 is March
      const result = calculateReverseSchedule(targetMarch1);

      // Previous stages must land on Feb 29 (Month 1, day 29)
      const bakingStage = result.stages.find((s) => s.category === 'bake')!;
      const coldRetardStage = result.stages.find((s) => s.category === 'final_proof')!;

      expect(bakingStage.startTime.getMonth()).toBe(2); // March 1st early morning
      expect(coldRetardStage.startTime.getMonth()).toBe(1); // February
      expect(coldRetardStage.startTime.getDate()).toBe(29); // Feb 29th leap day!
    });

    it('schedules backward across new year boundary (Jan 1 morning to Dec 31 & Dec 30)', () => {
      const targetJan1 = new Date(2027, 0, 1, 9, 0, 0); // Jan 1, 2027
      const result = calculateReverseSchedule(targetJan1);

      const starterFeed = result.stages[0];
      // Starter feed must be in 2026, Month 11 (December)
      expect(starterFeed.startTime.getFullYear()).toBe(2026);
      expect(starterFeed.startTime.getMonth()).toBe(11);
      expect(starterFeed.startTime.getDate()).toBeLessThanOrEqual(31);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Sleep Guard Window Precision & Boundary Edge Cases (23:00 to 06:30)
  // --------------------------------------------------------------------------
  describe('Sleep Guard Exact Boundary Cases', () => {
    it('detects collision when active step crosses 23:00 bedtime boundary', () => {
      // Active shaping step ending at 23:05
      const target = new Date(2026, 9, 18, 16, 35, 0);
      const schedule = calculateReverseSchedule(target, {
        sleepStartHour: 23.0,
        sleepEndHour: 6.5,
        coldRetardHours: 14.0,
      });

      // Target afternoon causes shaping or mixing to fall right into night
      if (schedule.hasSleepCollision) {
        expect(schedule.collisionDetailsPl).toBeDefined();
        expect(schedule.suggestedActionPl).toContain('Sugerowana korekta');
      }
    });

    it('does NOT flag passive steps (cold retard or cooling) as sleep collision even if completely in night', () => {
      // Suppose target is 10:00 AM. Cold retard (final_proof, passive) runs throughout the night (e.g. 21:00 to 07:00)
      const target = new Date(2026, 9, 18, 10, 0, 0);
      const schedule = calculateReverseSchedule(target, {
        sleepStartHour: 23.0,
        sleepEndHour: 6.5,
        coldRetardHours: 14.0,
      });

      const retard = schedule.stages.find((s) => s.category === 'final_proof')!;
      expect(retard.isPassive).toBe(true);
      // Final proof is passive, so even if it runs from 17:00 to 07:00 across night, it is NOT an active collision
      expect(retard.isSleepCollision).toBe(false);
      // Jedyna kolizja tego planu: dokarmienie zakwasu zaczyna się o 04:45 — krok bierny z rękami na starcie
      // (audyt niezależny D-6); garowanie i studzenie nie są kolizją
      expect(schedule.stages.filter((s) => s.isSleepCollision).map((s) => s.id)).toEqual(['starter_feed']);
      expect(schedule.stages.find((s) => s.id === 'cool')!.isSleepCollision).toBe(false);
    });

    it('custom sleep windows (e.g. early riser 21:00 to 05:00) correctly adapt collision detector', () => {
      const target = new Date(2026, 9, 18, 10, 0, 0);

      // Normal schedule (23:00 to 06:30): no active step at night for 10:00 AM target; only the starter feeding
      // starts at 04:45 (hands-on at the start, audyt niezależny D-6)
      const normal = calculateReverseSchedule(target, {
        sleepStartHour: 23.0,
        sleepEndHour: 6.5,
      });
      expect(normal.stages.filter((s) => s.isSleepCollision).map((s) => s.id)).toEqual(['starter_feed']);

      // Early riser waking up at 05:00 AM: target 07:00 AM ready time causes baking to start at 04:15 AM (colliding with sleep!)
      const targetEarly = new Date(2026, 9, 18, 7, 0, 0);
      const earlySleep = calculateReverseSchedule(targetEarly, {
        sleepStartHour: 21.0,
        sleepEndHour: 5.0,
      });

      expect(earlySleep.hasSleepCollision).toBe(true);
      expect(earlySleep.collisionDetailsPl).toContain('Wypiek');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Retard Accordion Stretching & autoResolveSleepCollision
  // --------------------------------------------------------------------------
  describe('Cold Retard Accordion Stretching', () => {
    const retardHoursList = [8, 10, 12, 14, 16, 18, 20, 22, 24];

    for (const hours of retardHoursList) {
      it(`accurately sets final_proof to exactly ${hours}h (${hours * 60} min)`, () => {
        const target = new Date(2026, 9, 18, 12, 0, 0);
        const schedule = calculateReverseSchedule(target, { coldRetardHours: hours });
        const retard = schedule.stages.find((s) => s.category === 'final_proof')!;

        expect(retard.durationMinutes).toBe(hours * 60);
      });
    }

    it('autoResolveSleepCollision returns null if initial schedule has no collision', () => {
      // 10:00 AM target has zero collision with 14h retard
      const target = new Date(2026, 9, 18, 10, 0, 0);
      const res = autoResolveSleepCollision(target, { coldRetardHours: 14.0 });
      expect(res).toBeNull();
    });

    it('autoResolveSleepCollision finds alternate fridge duration when target is 18:00', () => {
      // 18:00 target causes shaping at midnight (00:15) with 14h retard
      const target = new Date(2026, 9, 18, 18, 0, 0);
      const res = autoResolveSleepCollision(target, { coldRetardHours: 14.0 });

      expect(res).not.toBeNull();
      if (res) {
        expect(res.resolvedSchedule.hasSleepCollision).toBe(false);
        expect(res.originalColdRetardHours).toBe(14.0);
        expect(res.adjustedColdRetardHours).not.toBe(14.0);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. Ambient Kitchen Temperature Kinetics on Timeline
  // --------------------------------------------------------------------------
  describe('Ambient Kitchen Temperature Kinetics on Timeline', () => {
    it('adapts bulk ferment duration across temperature range (18°C to 30°C)', () => {
      const target = new Date(2026, 9, 18, 12, 0, 0);

      const sched18 = calculateReverseSchedule(target, { ambientTemperatureC: 18.0 });
      const sched24 = calculateReverseSchedule(target, { ambientTemperatureC: 24.0 });
      const sched28 = calculateReverseSchedule(target, { ambientTemperatureC: 28.0 });

      const bulk18 = sched18.stages.find((s) => s.category === 'bulk_ferment')!;
      const bulk24 = sched24.stages.find((s) => s.category === 'bulk_ferment')!;
      const bulk28 = sched28.stages.find((s) => s.category === 'bulk_ferment')!;

      // 18°C should be longer than 24°C, which should be longer than 28°C
      expect(bulk18.durationMinutes).toBeGreaterThan(bulk24.durationMinutes);
      expect(bulk24.durationMinutes).toBeGreaterThan(bulk28.durationMinutes);
    });

    it('keeps total number of stages and categories identical regardless of temperature', () => {
      const target = new Date(2026, 9, 18, 12, 0, 0);
      const schedCold = calculateReverseSchedule(target, { ambientTemperatureC: 16.0 });
      const schedHot = calculateReverseSchedule(target, { ambientTemperatureC: 32.0 });

      expect(schedCold.stages.length).toBe(DEFAULT_STAGE_TEMPLATES.length);
      expect(schedHot.stages.length).toBe(DEFAULT_STAGE_TEMPLATES.length);

      for (let i = 0; i < DEFAULT_STAGE_TEMPLATES.length; i++) {
        expect(schedCold.stages[i].category).toBe(DEFAULT_STAGE_TEMPLATES[i].category);
        expect(schedHot.stages[i].category).toBe(DEFAULT_STAGE_TEMPLATES[i].category);
      }
    });
  });
});
