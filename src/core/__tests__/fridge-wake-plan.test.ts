/**
 * M1-audytor-generalny-104, BR-ZAKW-006 (D-052, RD-24; T6 roli 05): plan z zakwasem z lodówki zaczyna się jednym
 * dokarmieniem 12 h przed mieszaniem; bez podwojenia w ≤ 8 h — „niegotowy” z radą i propozycją przesunięcia.
 * Teksty dosłownie z docs/tresci/pl|en/zakwas-z-lodowki.md.
 */
import {
  FRIDGE_WAKE_LEAD_H,
  FRIDGE_WAKE_STEP_ID,
  FRIDGE_WAKE_STEP_NAME,
  FRIDGE_WAKE_INSTRUCTIONS,
  FRIDGE_WAKE_NEXT_FEEDINGS,
  FRIDGE_WAKE_NOT_READY,
  fridgeWakeStep,
  mixStartOf,
  withFridgeWake,
  fridgeWakeOutcome,
  type FridgeWakeOutcome,
} from '../fridge-wake';
import { planBakeSteps } from '../bake-steps';
import { isSessionStep } from '../../data/bake-session-store';
import type { StarterEntryLike } from '../starter-log';
import { linie, poAngielsku } from './helpers/tresci';

const H = 3600_000;
const START = new Date(2026, 9, 22, 7, 0).getTime(); // plan na pojutrze
const FRIDGE = { storageState: 'FRIDGE' as const };
const ROOM = { storageState: 'ROOM_TEMP' as const };

describe('BR-ZAKW-006: obudzenie zakwasu z lodówki (104, D-052)', () => {
  it('BR-ZAKW-006 Plan z zakwasem z lodówki: pierwszy krok = dokarmienie 12 h przed mieszaniem, w temperaturze pokojowej', () => {
    expect(FRIDGE_WAKE_LEAD_H).toBe(12);
    const plan = planBakeSteps({ startAt: START, isHighRye: false });
    const mixAt = mixStartOf(plan)!;
    expect(mixAt).toBeGreaterThan(START);
    const steps = withFridgeWake(plan, FRIDGE);
    // D-052: dokarmienie z planu (starter_feed 6 h) łączy się z krokiem z lodówki — tyle samo kroków, krok do mieszania
    expect(plan[0].category).toBe('starter_feed');
    expect(steps).toHaveLength(plan.length);
    expect(steps[0]).toEqual(
      expect.objectContaining({ id: FRIDGE_WAKE_STEP_ID, name: FRIDGE_WAKE_STEP_NAME, category: 'starter_feed', plannedStart: mixAt - 12 * H, plannedEnd: mixAt })
    );
    expect(steps.slice(1)).toEqual(plan.slice(1));
    expect(isSessionStep(steps[0])).toBe(true);
    expect(withFridgeWake(steps, FRIDGE)).toEqual(steps);
  });

  it.each([
    ['pszenny', false],
    ['żytni', true],
  ])('D-052 „1 dokarmienie”: plan %s z zakwasem z lodówki ma dokładnie jedno dokarmienie przed mieszaniem, 12 h przed mieszaniem', (_n, isHighRye) => {
    const plan = planBakeSteps({ startAt: START, isHighRye });
    const mixAt = mixStartOf(plan)!;
    const steps = withFridgeWake(plan, FRIDGE);
    const feeds = steps.filter((s) => s.category === 'starter_feed' && s.plannedStart !== null && s.plannedStart < mixAt);
    expect(feeds.map((s) => ({ id: s.id, start: s.plannedStart, end: s.plannedEnd }))).toEqual([
      { id: FRIDGE_WAKE_STEP_ID, start: mixAt - 12 * H, end: mixAt },
    ]);
    expect(mixStartOf(steps)).toBe(mixAt);
  });

  it('plan żytni: mieszanie = etap rye_mix', () => {
    const plan = planBakeSteps({ startAt: START, isHighRye: true });
    const steps = withFridgeWake(plan, FRIDGE);
    const mix = plan.find((s) => s.category === 'mix' || s.category === 'autolyse')!;
    expect(steps[0].plannedStart).toBe(mix.plannedStart! - 12 * H);
  });

  it('zakwas z blatu: bez kroku z lodówki', () => {
    const plan = planBakeSteps({ startAt: START, isHighRye: false });
    expect(withFridgeWake(plan, ROOM)).toEqual(plan);
    expect(fridgeWakeStep(START, ROOM)).toBeNull();
    expect(fridgeWakeStep(START, FRIDGE)).toEqual(expect.objectContaining({ plannedStart: START - 12 * H, plannedEnd: START, durationMin: 720 }));
  });

  const feedAt = START - 12 * H;
  const feed: StarterEntryLike = { kind: 'feeding', occurredAt: feedAt, signs: [] };

  it('BR-ZAKW-006 Zakwas niegotowy w dniu ciasta: bez podwojenia w 8 h → rada i propozycja przesunięcia', () => {
    const now = feedAt + 9 * H;
    const out: FridgeWakeOutcome = fridgeWakeOutcome([feed, { kind: 'observation', occurredAt: now, signs: ['bubbles'] }], now);
    expect(out).toEqual({ kind: 'not_ready', texts: FRIDGE_WAKE_NOT_READY, proposedMixAt: now + 12 * H });
  });

  it('podwojenie w ≤ 8 h → gotowy; przed upływem 8 h → czekamy; bez dokarmienia → brak', () => {
    expect(fridgeWakeOutcome([feed, { kind: 'observation', occurredAt: feedAt + 6 * H, signs: ['doubled'] }], feedAt + 6 * H)).toEqual({ kind: 'ready' });
    expect(fridgeWakeOutcome([feed], feedAt + 7 * H)).toEqual({ kind: 'waiting', checkUntil: feedAt + 8 * H });
    expect(fridgeWakeOutcome([], feedAt)).toEqual({ kind: 'no_feeding' });
  });

  it('teksty dosłownie z zakwas-z-lodowki.md (PL i EN)', () => {
    const pary: Array<[readonly string[], string]> = [
      [FRIDGE_WAKE_INSTRUCTIONS, 'plan.start'],
      [FRIDGE_WAKE_NEXT_FEEDINGS, 'plan.kolejne-dokarmienia'],
      [FRIDGE_WAKE_NOT_READY, 'niegotowy-w-dniu-ciasta'],
    ];
    for (const [teksty, sekcja] of pary) {
      expect(teksty).toEqual(linie('pl/zakwas-z-lodowki.md', sekcja));
      expect(poAngielsku(teksty)).toEqual(linie('en/zakwas-z-lodowki.md', sekcja));
    }
    expect(poAngielsku([FRIDGE_WAKE_STEP_NAME])).toEqual(['Feeding the starter from the fridge']);
  });
});
