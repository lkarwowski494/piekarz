// ============================================================================
// Piekarz — dziennik zakwasu i zakładanie dzień po dniu jako czyste funkcje (ADR-008; BR-ZAKW-005, BR-ZAKW-007)
// [M1-audytor-generalny-104]. Czas zawsze argumentem. Teksty dosłownie z docs/tresci/pl/zakwas-od-zera.md
// (klucze PL dla t(), EN w src/lib/i18n-en/czesc-13.ts); liczby z ID twierdzeń rejestru roli 06.
// ============================================================================

import type { StoredStarterEntry } from '../data/db';
import { evaluateSourdoughSafety } from './sourdough-physics';

/** Kody obserwacji zakwasu (jedna lista; CHECK w bazie pilnuje tylko tablicy JSON, ADR-008). */
export const STARTER_SIGNS = ['bubbles', 'rose', 'doubled', 'no_activity', 'mold_signs'] as const;
export type StarterSign = (typeof STARTER_SIGNS)[number];
export type StarterEntryKind = 'feeding' | 'observation';

export function isStarterSign(v: unknown): v is StarterSign {
  return STARTER_SIGNS.some((s) => s === v);
}

const HOUR_MS = 60 * 60 * 1000;
/** Gotowy: podwojenie najwyżej 8 h po dokarmieniu, granica włączna (ZAK-ZAL-007, ZAK-LOD-002). */
export const STARTER_DOUBLING_MAX_H = 8;
/** Dzień 1 i 2 zakładania: następne dokarmienie po 24 h (ZAK-ZAL-002, ZAK-ZAL-003). */
export const SETUP_FEED_INTERVAL_EARLY_H = 24;
/** Od dnia 3: dokarmianie co 12 h (ZAK-ZAL-004, ZAK-ZAL-007). */
export const SETUP_FEED_INTERVAL_H = 12;

export type StarterEntryLike = Pick<StoredStarterEntry, 'kind' | 'occurredAt' | 'signs'>;

/** Najnowsze dokarmienie albo null. */
export function lastFeeding<T extends StarterEntryLike>(entries: readonly T[]): T | null {
  let best: T | null = null;
  for (const e of entries) if (e.kind === 'feeding' && (!best || e.occurredAt > best.occurredAt)) best = e;
  return best;
}

const startOfLocalDay = (ms: number) => {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

/** Dzień N zakładania: różnica dni kalendarzowych (czas lokalny) + 1; zmiana czasu nie przesuwa dnia. */
export function setupDay(setupStartedAt: number, now: number): number {
  const days = Math.round((startOfLocalDay(now) - startOfLocalDay(setupStartedAt)) / (24 * HOUR_MS));
  return Math.max(1, days + 1);
}

/** Gotowy: obserwacja „podwoił” najwyżej maxH godzin po ostatnim dokarmieniu (granica włączna). */
export function isReadyAfterFeeding(entries: readonly StarterEntryLike[], maxH: number = STARTER_DOUBLING_MAX_H): boolean {
  const feed = lastFeeding(entries);
  if (!feed) return false;
  const until = feed.occurredAt + maxH * HOUR_MS;
  return entries.some(
    (e) => e.kind === 'observation' && e.signs.includes('doubled') && e.occurredAt >= feed.occurredAt && e.occurredAt <= until
  );
}

/** Wpis dokarmienia z dawnego `lastFedAt` (ta sama reguła co wypełnienie migracji v5 i import kopii v1). */
export function legacyFeedingEntry(starter: { id: string; lastFedAt?: number; feedingRatio?: string }): StoredStarterEntry | null {
  if (starter.lastFedAt === undefined || !(starter.lastFedAt > 0)) return null;
  return {
    id: `v5-${starter.id}`,
    starterId: starter.id,
    kind: 'feeding',
    occurredAt: starter.lastFedAt,
    feedRatio: starter.feedingRatio,
    signs: [],
    createdAt: starter.lastFedAt,
    updatedAt: starter.lastFedAt,
  };
}

export type SetupStage = 'start' | 'day1' | 'day2' | 'day3' | 'day4_5' | 'day6_plus' | 'ready' | 'temperature' | 'flour' | 'discard_link';

/** Teksty planu zakładania (docs/tresci/pl/zakwas-od-zera.md; sekcja → etap). */
export const SETUP_GUIDE: Record<SetupStage, readonly string[]> = {
  // ZAK-ZAL-001, ZAK-ZAL-007
  start: [
    'Założenie zakwasu wymaga kilku dni regularnego dokarmiania; średnio trwa 7–10 dni.',
    'Według King Arthur Baking miarą gotowości jest podwojenie objętości w ciągu 6–8 godzin po dokarmieniu, a nie liczba dni.',
  ],
  // ZAK-ZAL-002, ZAK-ZAL-014
  day1: [
    'Według King Arthur Baking wymieszaj mąkę pełnoziarnistą, pszenną albo żytnią razową, z wodą w równych ilościach wagowych, np. 113 g mąki i 113 g wody.',
    'Przykryj naczynie luźno, co utrudnia rozwój pleśni, i zostaw na 24 godziny w ciepłym miejscu, w około 21 °C.',
  ],
  // ZAK-ZAL-003
  day2: [
    'Według King Arthur Baking w pierwszej dobie można nie zobaczyć żadnej aktywności; dokarm zakwas tak samo.',
    'Odrzuć połowę zakwasu, dodaj mąkę i wodę w równych ilościach wagowych i zostaw na 24 godziny.',
  ],
  // ZAK-ZAL-004, ZAK-ZAL-012, ZAK-ZAL-005, ZAK-ZAL-013
  day3: [
    'Według King Arthur Baking w dniu 3 zwykle widać pęcherzyki, świeży owocowy zapach i wzrost objętości.',
    'Od tego dnia dokarmiaj zakwas dwa razy dziennie, mniej więcej co 12 godzin.',
    'Przy każdym dokarmieniu zostaw część zakwasu, dodaj mąkę i wodę w proporcji 1:1:1 wagowo, a resztę odrzuć.',
    'Odrzucanie utrzymuje małą objętość, więc drożdże dostają więcej pożywienia.',
  ],
  // ZAK-ZAL-006
  day4_5: [
    'Według King Arthur Baking pod koniec dnia 5 zakwas powinien co najmniej podwoić objętość, mieć dużo pęcherzyków i przyjemnie kwaśny zapach.',
  ],
  // ZAK-ZAL-007 (RD-24-W3)
  day6_plus: [
    'Jeśli zakwas mało urósł i ma mało pęcherzyków, dokarmiaj go dalej co 12 godzin.',
    'Według King Arthur Baking 7 dni może nie wystarczyć, a założenie może potrwać nawet kilka tygodni.',
  ],
  // ZAK-ZAL-011, ZAK-ZAL-007, ZAK-ZAL-012 (RD-24-W2)
  ready: [
    'Zakwas jest gotowy, gdy bąbelkuje, rośnie i ma przyjemnie kwaśny zapach.',
    'Według King Arthur Baking powinien przy tym wyraźnie podwajać objętość w ciągu 6–8 godzin po każdym dokarmieniu.',
    'Do lodówki wstawiaj go dopiero wtedy, gdy się ustali, czyli po 7–10 dniach.',
  ],
  // ZAK-ZAL-008, ZAK-SZC-004, ZAK-ZAL-009
  temperature: [
    'Zakwas rośnie najlepiej w ciepłej temperaturze pokojowej, około 21 °C.',
    'W chłodzie rośnie wolniej, a w zbyt wysokiej temperaturze fermentacja może przebiegać za szybko, a nawet ustać.',
    'Według King Arthur Baking, gdy w domu jest zwykle poniżej 20 °C, warto znaleźć dla zakwasu cieplejsze miejsce.',
  ],
  // ZAK-ZAL-010
  flour: [
    'Według King Arthur Baking dzikie drożdże częściej są w mące pełnoziarnistej, a zakwas tylko na mące jasnej może ruszać trochę wolniej.',
  ],
  discard_link: ['Jeśli widzisz nalot, plamy albo przebarwienie albo czujesz zgniły zapach, otwórz kontrolę zakwasu.'],
};

/** Etap planu dla dnia N zakładania. */
export function setupStageForDay(day: number): SetupStage {
  if (day <= 1) return 'day1';
  if (day === 2) return 'day2';
  if (day === 3) return 'day3';
  return day <= 5 ? 'day4_5' : 'day6_plus';
}

/** Pierwsza doba bez aktywności (doktor-zakwasu.md, objaw.brak-aktywnosci-w-pierwszej-dobie; ZAK-ZAL-003, RD-24-W5). */
export const FIRST_DAY_NO_ACTIVITY: readonly string[] = [
  'Według King Arthur Baking w pierwszej dobie można nie zobaczyć żadnej aktywności.',
  'Co zrobić: dokarm zakwas według planu na następny dzień.',
];

export type SetupOutcome =
  | { kind: 'discard'; texts: readonly string[] }
  | { kind: 'ready'; texts: readonly string[] }
  | { kind: 'first_day_normal'; texts: readonly string[]; nextFeedingAt: number | null }
  | { kind: 'continue'; texts: readonly string[]; nextFeedingAt: number | null };

/** Termin następnego dokarmienia przy zakładaniu: 24 h w dniach 1–2, potem 12 h od ostatniego dokarmienia. */
export function nextSetupFeedingAt(day: number, entries: readonly StarterEntryLike[]): number | null {
  const feed = lastFeeding(entries);
  if (!feed) return null;
  return feed.occurredAt + (day < 3 ? SETUP_FEED_INTERVAL_EARLY_H : SETUP_FEED_INTERVAL_H) * HOUR_MS;
}

/**
 * Wynik zapisu obserwacji w dniu N zakładania (BR-ZAKW-005): plamy → wyrzuć (RD-21-W1, teksty kontroli
 * zakwasu); podwojenie ≤ 8 h po dokarmieniu → gotowy (RD-24-W2); dzień 1 bez aktywności → to normalne
 * i termin dokarmienia (RD-24-W5); inaczej plan dnia z terminem dokarmienia.
 */
export function setupObservationOutcome(input: {
  day: number;
  signs: readonly StarterSign[];
  entries: readonly StarterEntryLike[];
  observedAt: number;
}): SetupOutcome {
  if (input.signs.includes('mold_signs')) {
    const d = evaluateSourdoughSafety({ hasColoredSpots: true });
    return { kind: 'discard', texts: [d.titlePl, d.actionPl] };
  }
  const all = [...input.entries, { kind: 'observation' as const, occurredAt: input.observedAt, signs: [...input.signs] }];
  if (isReadyAfterFeeding(all)) return { kind: 'ready', texts: SETUP_GUIDE.ready };
  const nextFeedingAt = nextSetupFeedingAt(input.day, input.entries);
  if (input.day <= 1 && !input.signs.includes('doubled')) {
    return { kind: 'first_day_normal', texts: FIRST_DAY_NO_ACTIVITY, nextFeedingAt };
  }
  return { kind: 'continue', texts: SETUP_GUIDE[setupStageForDay(input.day)], nextFeedingAt };
}
