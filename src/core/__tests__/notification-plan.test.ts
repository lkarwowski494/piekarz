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
  FEED_FRIDGE_DUE_AFTER_DAYS,
  MAX_PENDING_NOTIFICATIONS,
  TIME_SENSITIVE_STEPS,
} from '../notification-config';
import { LEGACY_STEPS_V1 } from '../legacy-steps-v1';

// [M1-audytor-generalny-006] plan powiadomień (ADR-006): czyste funkcje, czas bezwzględny w ms UTC
const DAY = 24 * 60 * 60 * 1000;
const steps = LEGACY_STEPS_V1;
const step8 = steps.findIndex((s) => s.id === 'step_8');

describe('notification plan (006, ADR-006)', () => {
  const now = Date.UTC(2026, 9, 18, 23, 55); // niedziela 23:55 UTC

  it('a running step gives one piekarz.krok at timerEndsAt; paused or past gives none', () => {
    const p = planBakeNotification({ steps, stepIdx: 2, dutchOvenPhase: 'lid_on', timerEndsAt: now + 60_000 }, now);
    expect(p).toEqual(expect.objectContaining({ id: NOTIF_ID_BAKE, triggerAt: now + 60_000, level: 'active', textKey: 'krok.koniec' }));
    // 130 (BR-CZAS-002): także nazwa następnego kroku; kroki bez planu godzin nie mają nextEnd
    expect(p?.params).toEqual({ stepId: 'step_3', stepName: steps[2].name, nextName: steps[3].name });
    expect(planBakeNotification({ steps, stepIdx: 2, dutchOvenPhase: 'lid_on', timerEndsAt: null }, now)).toBeNull();
    expect(planBakeNotification({ steps, stepIdx: 2, dutchOvenPhase: 'lid_on', timerEndsAt: now }, now)).toBeNull();
    expect(planBakeNotification({ steps, stepIdx: steps.length, dutchOvenPhase: 'lid_on', timerEndsAt: now + 1 }, now)).toBeNull();
    expect(planBakeNotification(null, now)).toBeNull();
  });

  it('the Dutch oven step is Time Sensitive with phase-specific text', () => {
    expect(TIME_SENSITIVE_STEPS).toEqual(['step_8', 'bake']);
    const on = planBakeNotification({ steps, stepIdx: step8, dutchOvenPhase: 'lid_on', timerEndsAt: now + 1 }, now);
    const off = planBakeNotification({ steps, stepIdx: step8, dutchOvenPhase: 'lid_off', timerEndsAt: now + 1 }, now);
    expect(on).toEqual(expect.objectContaining({ level: 'timeSensitive', textKey: 'krok.zdejmijPokrywke' }));
    expect(off).toEqual(expect.objectContaining({ level: 'timeSensitive', textKey: 'krok.wypiekGotowy' }));
  });

  // DEC-22 a: lodówka ma jedno powiadomienie na cykl, w terminie +7 d (bez przypomnienia +6 d) [M1-audytor-generalny-179]
  it('feeding: room temperature +12 h; fridge one reminder at +7 d; past dates and missing lastFedAt skipped (BR-ZAKW-004 Zakwas na blacie, Zakwas w lodówce)', () => {
    const plan = planFeedingNotifications(
      [
        { id: 'a', name: 'A', storageState: 'ROOM_TEMP', lastFedAt: now },
        { id: 'b', name: 'B', storageState: 'FRIDGE', lastFedAt: now },
        { id: 'c', name: 'C', storageState: 'FRIDGE', lastFedAt: now - 8 * DAY },
        { id: 'd', name: 'D', storageState: 'ROOM_TEMP' },
      ],
      now
    );
    // Lodówka: 7 dni kalendarza o tej samej godzinie lokalnej (D-093), nie 7 × 24 h: oczekiwanie z konstruktora daty
    // lokalnej, niezależne od strefy maszyny (przez zmianę czasu różnica ms to 7 × 24 h ± 1 h; testy DST: karmienie-lodowka-dst)
    const f = new Date(now);
    const lodowkaTermin = new Date(f.getFullYear(), f.getMonth(), f.getDate() + 7, f.getHours(), f.getMinutes()).getTime();
    expect(plan.map((p) => [p.id, p.triggerAt])).toEqual([
      [`${NOTIF_PREFIX}karmienie.a.1`, now + FEED_ROOM_TEMP_AFTER_MS],
      [`${NOTIF_PREFIX}karmienie.b.1`, lodowkaTermin],
    ]);
    expect(plan.find((p) => p.id === `${NOTIF_PREFIX}karmienie.b.1`)?.textKey).toBe('karmienie.lodowkaTermin');
    expect(FEED_FRIDGE_DUE_AFTER_DAYS).toBe(7);
    // D-043 OP-38: 12 h zamiast doby z BRD Z-041 [M1-audytor-generalny-090]
    expect(FEED_ROOM_TEMP_AFTER_MS).toBe(DAY / 2);
  });

  it('planNotifications keeps the step and cuts feeding to the limit', () => {
    const starters = Array.from({ length: 30 }, (_, i) => ({ id: `s${i}`, name: `S${i}`, storageState: 'ROOM_TEMP' as const, lastFedAt: now - i * 1000 }));
    const plan = planNotifications({ session: { steps, stepIdx: 7, dutchOvenPhase: 'lid_on', timerEndsAt: now + 99 * DAY }, starters }, now);
    expect(plan).toHaveLength(MAX_PENDING_NOTIFICATIONS);
    expect(plan.some((p) => p.id === NOTIF_ID_BAKE)).toBe(true);
  });

  it('diff: +5 min reschedules the same id without cancelling; unchanged is skipped; foreign ids untouched', () => {
    const a = planBakeNotification({ steps, stepIdx: 2, dutchOvenPhase: 'lid_on', timerEndsAt: now + 60_000 }, now)!;
    const b = { ...a, triggerAt: a.triggerAt + 300_000 };
    const pending = [{ id: a.id, fingerprint: notificationFingerprint(a) }, { id: 'inna-aplikacja', fingerprint: null }];
    expect(diffNotifications(pending, [b])).toEqual({ cancel: [], schedule: [b] });
    expect(diffNotifications(pending, [a])).toEqual({ cancel: [], schedule: [] });
    expect(diffNotifications(pending, [])).toEqual({ cancel: [NOTIF_ID_BAKE], schedule: [] });
  });

  // Treść powiadomienia powstaje przy planowaniu, więc odcisk niesie język: po zmianie języka
  // całe oczekujące zaplanowane na nowo, w nowym języku [M1-audytor-generalny-136; 09-lokalizacja-503]
  it('diff: the same plan after a language change reschedules everything; same language skips', () => {
    const a = planBakeNotification({ steps, stepIdx: 2, dutchOvenPhase: 'lid_on', timerEndsAt: now + 60_000 }, now)!;
    const starters = [{ id: 's1', name: 'Ania', storageState: 'FRIDGE' as const, lastFedAt: now - DAY }];
    const plan = [a, ...planFeedingNotifications(starters, now)];
    expect(plan.length).toBeGreaterThan(1);
    const pending = plan.map((p) => ({ id: p.id, fingerprint: notificationFingerprint(p, 'pl') }));
    expect(diffNotifications(pending, plan, 'pl')).toEqual({ cancel: [], schedule: [] });
    expect(diffNotifications(pending, plan, 'de')).toEqual({ cancel: [], schedule: plan });
  });
});
