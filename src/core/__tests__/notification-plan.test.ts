import {
  planBakeNotification,
  planFeedingNotifications,
  planNotifications,
  notificationFingerprint,
  diffNotifications,
} from '../notification-plan';
import {
  NOTIF_ID_BAKE,
  NOTIF_PREFIX,
  FEED_ROOM_TEMP_AFTER_MS,
  FEED_FRIDGE_REMIND_AFTER_MS,
  FEED_FRIDGE_DUE_AFTER_MS,
  MAX_PENDING_NOTIFICATIONS,
  TIME_SENSITIVE_STEPS,
} from '../notification-config';
import { BAKE_STEPS } from '../baking-phases';

// [M1-audytor-generalny-006] plan powiadomień (ADR-006): czyste funkcje, czas bezwzględny w ms UTC
const DAY = 24 * 60 * 60 * 1000;
const step8 = BAKE_STEPS.findIndex((s) => s.id === 'step_8');

describe('notification plan (006, ADR-006)', () => {
  const now = Date.UTC(2026, 9, 18, 23, 55); // niedziela 23:55 UTC

  it('a running step gives one piekarz.krok at timerEndsAt; paused or past gives none', () => {
    const p = planBakeNotification({ stepIdx: 2, dutchOvenPhase: 'lid_on', timerEndsAt: now + 60_000 }, now);
    expect(p).toEqual(expect.objectContaining({ id: NOTIF_ID_BAKE, triggerAt: now + 60_000, level: 'active', textKey: 'krok.koniec' }));
    expect(planBakeNotification({ stepIdx: 2, dutchOvenPhase: 'lid_on', timerEndsAt: null }, now)).toBeNull();
    expect(planBakeNotification({ stepIdx: 2, dutchOvenPhase: 'lid_on', timerEndsAt: now }, now)).toBeNull();
    expect(planBakeNotification(null, now)).toBeNull();
  });

  it('the Dutch oven step is Time Sensitive with phase-specific text', () => {
    expect(TIME_SENSITIVE_STEPS).toEqual(['step_8']);
    const on = planBakeNotification({ stepIdx: step8, dutchOvenPhase: 'lid_on', timerEndsAt: now + 1 }, now);
    const off = planBakeNotification({ stepIdx: step8, dutchOvenPhase: 'lid_off', timerEndsAt: now + 1 }, now);
    expect(on).toEqual(expect.objectContaining({ level: 'timeSensitive', textKey: 'krok.zdejmijPokrywke' }));
    expect(off).toEqual(expect.objectContaining({ level: 'timeSensitive', textKey: 'krok.wypiekGotowy' }));
  });

  it('feeding: room temperature +24 h; fridge +6 d and +7 d; past dates and missing lastFedAt skipped', () => {
    const plan = planFeedingNotifications(
      [
        { id: 'a', name: 'A', storageState: 'ROOM_TEMP', lastFedAt: now },
        { id: 'b', name: 'B', storageState: 'FRIDGE', lastFedAt: now },
        { id: 'c', name: 'C', storageState: 'FRIDGE', lastFedAt: now - 8 * DAY },
        { id: 'd', name: 'D', storageState: 'ROOM_TEMP' },
      ],
      now
    );
    expect(plan.map((p) => [p.id, p.triggerAt - now])).toEqual([
      [`${NOTIF_PREFIX}karmienie.a.1`, FEED_ROOM_TEMP_AFTER_MS],
      [`${NOTIF_PREFIX}karmienie.b.1`, FEED_FRIDGE_REMIND_AFTER_MS],
      [`${NOTIF_PREFIX}karmienie.b.2`, FEED_FRIDGE_DUE_AFTER_MS],
    ]);
    expect(FEED_ROOM_TEMP_AFTER_MS).toBe(DAY);
  });

  it('planNotifications keeps the step and cuts feeding to the limit', () => {
    const starters = Array.from({ length: 30 }, (_, i) => ({ id: `s${i}`, name: `S${i}`, storageState: 'ROOM_TEMP' as const, lastFedAt: now - i * 1000 }));
    const plan = planNotifications({ session: { stepIdx: 7, dutchOvenPhase: 'lid_on', timerEndsAt: now + 99 * DAY }, starters }, now);
    expect(plan).toHaveLength(MAX_PENDING_NOTIFICATIONS);
    expect(plan.some((p) => p.id === NOTIF_ID_BAKE)).toBe(true);
  });

  it('diff: +5 min reschedules the same id without cancelling; unchanged is skipped; foreign ids untouched', () => {
    const a = planBakeNotification({ stepIdx: 2, dutchOvenPhase: 'lid_on', timerEndsAt: now + 60_000 }, now)!;
    const b = { ...a, triggerAt: a.triggerAt + 300_000 };
    const pending = [{ id: a.id, fingerprint: notificationFingerprint(a) }, { id: 'inna-aplikacja', fingerprint: null }];
    expect(diffNotifications(pending, [b])).toEqual({ cancel: [], schedule: [b] });
    expect(diffNotifications(pending, [a])).toEqual({ cancel: [], schedule: [] });
    expect(diffNotifications(pending, [])).toEqual({ cancel: [NOTIF_ID_BAKE], schedule: [] });
  });
});
