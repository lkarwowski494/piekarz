/**
 * Przy nadmiarze powiadomień nic z najbliższych 24 h nie wypada przez dalszy krok wypieku [M1-audytor-generalny-030;
 * weryfikacja G9 H2]: dwa wypieki po 25 kroków co 4 h (50 powiadomień) i 10 zakwasów na blacie z karmieniem za ok. 2 h.
 * Grupy (kroki → starty → karmienia) ustalają kolejność dopiero poza oknem 24 h.
 */
import { planNotifications, planFeedingNotifications, type PlanBakeSessionWithPlan, type PlanStarter } from '../notification-plan';
import { MAX_PENDING_NOTIFICATIONS, OKNO_PIERWSZENSTWA_MS } from '../notification-config';
import type { SessionStep } from '../bake-steps';

const MIN = 60_000;
const HOUR = 60 * MIN;
const T0 = Date.UTC(2026, 9, 21, 8, 0);
const krok = (i: number, od: number, doMin: number): SessionStep => ({
  id: `krok_${i}`, name: `Krok ${i}`, category: 'bulk_ferment', durationMin: doMin - od, isPassive: true, instructions: '', plannedStart: T0 + od * MIN, plannedEnd: T0 + doMin * MIN,
});
function wypiek(id: string, ile: number, odstep: number, przes = 0): PlanBakeSessionWithPlan {
  const steps = Array.from({ length: ile }, (_, i) => krok(i, przes + i * odstep, przes + (i + 1) * odstep));
  steps[0] = { ...steps[0]!, plannedStart: T0 - MIN };
  return { id, recipeName: id, steps, stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: steps[0]?.plannedEnd ?? null };
}

describe('M1-audytor-generalny-030: priorytet powiadomień', () => {
  it('karmienia za ok. 2 h zostają przy 50 krokach dwóch wypieków; limit 40 i kolejność po czasie bez zmian', () => {
    const starters: PlanStarter[] = Array.from({ length: 10 }, (_, i) => ({ id: `z${i}`, name: `Z${i}`, storageState: 'ROOM_TEMP', lastFedAt: T0 - 10 * HOUR - i * MIN }));
    const karmienia = planFeedingNotifications(starters, T0).filter((p) => p.triggerAt <= T0 + 24 * HOUR);
    expect(karmienia.length).toBeGreaterThan(0);
    const plan = planNotifications({ sessions: [wypiek('a', 25, 240), wypiek('b', 25, 240, 120)], starters }, T0);
    expect(plan).toHaveLength(MAX_PENDING_NOTIFICATIONS);
    for (const k of karmienia) expect(plan.map((p) => p.id)).toContain(k.id);
    expect(plan.map((p) => p.triggerAt)).toEqual([...plan.map((p) => p.triggerAt)].sort((x, y) => x - y));
    expect(OKNO_PIERWSZENSTWA_MS).toBe(24 * HOUR);
  });
});
