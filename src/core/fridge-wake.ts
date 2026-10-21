// ============================================================================
// Piekarz — plan obudzenia zakwasu z lodówki (BR-ZAKW-006, D-052) jako czysta funkcja [M1-audytor-generalny-104]
// Jedno dokarmienie 12 h przed mieszaniem ciasta, potem warunek gotowości: podwojenie w ≤ 8 h (ZAK-LOD-002);
// gdy go nie ma — „niegotowy w dniu ciasta” z propozycją przesunięcia. Teksty z docs/tresci/pl/zakwas-z-lodowki.md.
// ============================================================================

import type { SessionStep } from './bake-steps';
import { STARTER_DOUBLING_MAX_H, isReadyAfterFeeding, lastFeeding, type StarterEntryLike } from './starter-log';

const HOUR_MS = 60 * 60 * 1000;
/** Dokarmienie z lodówki 12 h przed mieszaniem (D-052; ZAK-LOD-001: do 12 h do oznak aktywności, ZAK-LOD-002). */
export const FRIDGE_WAKE_LEAD_H = 12;
export const FRIDGE_WAKE_STEP_ID = 'fridge_wake_feed';

/** plan.start (ZAK-LOD-001) */
export const FRIDGE_WAKE_INSTRUCTIONS: readonly string[] = [
  'Według King Arthur Baking zakwas z lodówki przed pieczeniem dokarm w równych częściach wagowych i zostaw w temperaturze pokojowej.',
  'Może zacząć bąbelkować szybko albo potrzebować nawet 12 godzin, zależnie od tego, kiedy był ostatnio dokarmiony.',
];
/** plan.kolejne-dokarmienia (ZAK-LOD-002, ZAK-LOD-003) */
export const FRIDGE_WAKE_NEXT_FEEDINGS: readonly string[] = [
  'Dokarmiaj go co 12 godzin, aż w ciągu 6–8 godzin po dokarmieniu podwoi albo potroi objętość; wtedy jest gotowy do pieczenia.',
  'Im rzadziej zakwas był dokarmiany, tym dłużej trwa przygotowanie go do pieczenia.',
];
/** niegotowy-w-dniu-ciasta (ZAK-LOD-002; BR-ZAKW-006, RD-24-W3) */
export const FRIDGE_WAKE_NOT_READY: readonly string[] = [
  'Zakwas nie podwoił jeszcze objętości: według King Arthur Baking dokarm go ponownie i sprawdź po kolejnym dokarmieniu, czy podwoi objętość w ciągu 6–8 godzin.',
  'Możesz przesunąć plan wypieku.',
];
/** Nazwa kroku (tekst nowy, do przeglądu roli 04). */
export const FRIDGE_WAKE_STEP_NAME = 'Dokarmienie zakwasu z lodówki';

/** Krok dokarmienia z lodówki: od `mixAt − 12 h` do `endAt` (domyślnie mieszanie); zakwas z blatu → null. */
export function fridgeWakeStep(mixAt: number, starter: { storageState: 'ROOM_TEMP' | 'FRIDGE' }, endAt: number = mixAt): SessionStep | null {
  if (starter.storageState !== 'FRIDGE') return null;
  const start = mixAt - FRIDGE_WAKE_LEAD_H * HOUR_MS;
  return {
    id: FRIDGE_WAKE_STEP_ID,
    name: FRIDGE_WAKE_STEP_NAME,
    category: 'starter_feed',
    durationMin: Math.max(1, Math.round((endAt - start) / 60_000)),
    isPassive: true,
    rekaNaStarcie: true, // dokarmienie na starcie kroku [audyt-niezalezny D-6]
    instructions: FRIDGE_WAKE_INSTRUCTIONS.join(' '),
    plannedStart: start,
    plannedEnd: endAt,
  };
}

/** Chwila mieszania ciasta: początek pierwszego kroku autolizy albo mieszania; brak planu godzin = null. */
export function mixStartOf(steps: readonly Pick<SessionStep, 'category' | 'plannedStart'>[]): number | null {
  return steps.find((s) => s.category === 'autolyse' || s.category === 'mix')?.plannedStart ?? null;
}

/**
 * Plan z zakwasem z lodówki ma dokładnie jedno dokarmienie przed mieszaniem: 12 h przed mieszaniem, do mieszania
 * (BR-ZAKW-006, D-052 „1 dokarmienie”). Dokarmienie z planu (krok `starter_feed` przed mieszaniem, np. 6 h szczytu
 * albo etap żytni „Zakwas żytni”) łączy się z nim — zostaje jeden krok. Zakwas z blatu, plan bez godzin albo plan
 * już z tym krokiem → kroki bez zmian.
 */
export function withFridgeWake(steps: readonly SessionStep[], starter: { storageState: 'ROOM_TEMP' | 'FRIDGE' }): SessionStep[] {
  const mixAt = mixStartOf(steps);
  if (mixAt === null || steps.some((s) => s.id === FRIDGE_WAKE_STEP_ID)) return [...steps];
  const wake = fridgeWakeStep(mixAt, starter);
  if (!wake) return [...steps];
  const feedBeforeMix = (s: SessionStep) => s.category === 'starter_feed' && s.plannedStart !== null && s.plannedStart < mixAt;
  return [wake, ...steps.filter((s) => !feedBeforeMix(s))];
}

export type FridgeWakeOutcome =
  | { kind: 'no_feeding' }
  | { kind: 'waiting'; checkUntil: number }
  | { kind: 'ready' }
  | { kind: 'not_ready'; texts: readonly string[]; proposedMixAt: number };

/**
 * Stan zakwasu po dokarmieniu z lodówki w chwili `now`: podwojenie ≤ 8 h → gotowy; po 8 h bez podwojenia →
 * niegotowy z radą (dokarm ponownie) i propozycją mieszania 12 h po nowym dokarmieniu (D-052, BR-HARMO-004).
 */
export function fridgeWakeOutcome(entries: readonly StarterEntryLike[], now: number): FridgeWakeOutcome {
  const feed = lastFeeding(entries);
  if (!feed) return { kind: 'no_feeding' };
  if (isReadyAfterFeeding(entries)) return { kind: 'ready' };
  const checkUntil = feed.occurredAt + STARTER_DOUBLING_MAX_H * HOUR_MS;
  if (now <= checkUntil) return { kind: 'waiting', checkUntil };
  return { kind: 'not_ready', texts: FRIDGE_WAKE_NOT_READY, proposedMixAt: now + FRIDGE_WAKE_LEAD_H * HOUR_MS };
}
