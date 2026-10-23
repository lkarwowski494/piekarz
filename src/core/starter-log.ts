// ============================================================================
// Piekarz — dziennik zakwasu i zakładanie dzień po dniu jako czyste funkcje (ADR-008; BR-ZAKW-005, BR-ZAKW-007)
// [M1-audytor-generalny-104]. Czas zawsze argumentem. Teksty dosłownie z docs/tresci/pl/zakwas-od-zera.md
// (klucze PL dla t(), EN w src/lib/i18n-en/czesc-13.ts); liczby z ID twierdzeń rejestru roli 06.
// ============================================================================

import type { StoredStarterEntry } from '../data/db';
import { evaluateSourdoughSafety } from './sourdough-physics';
import { calendarDayDiff } from './dzien-lokalny';

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

/**
 * Dzień N zakładania liczony dniami kalendarza (dzień lokalny, RD-29): dzień założenia = dzień 1, północ zaczyna
 * następny; „teraz” przed startem daje 1. Zmiana czasu nie przesuwa dnia (doba ma 23 albo 25 h). Zmienia regułę
 * „okresy 24 h od startu” z M2 p11: decyzja właściciela 2026-10-22 (D-093, RD-31). Jedna funkcja dla karty zakwasu,
 * Doktora zakwasu i paska kalendarza.
 */
export function setupDay(setupStartedAt: number, now: number): number {
  return Math.max(1, calendarDayDiff(setupStartedAt, now) + 1);
}

/**
 * Gotowy: obserwacja „podwoił” najwyżej maxH godzin po ostatnim dokarmieniu (granica włączna) i żadnej obserwacji
 * plam od tego dokarmienia — plamy to polecenie wyrzucenia (RD-21-W1), nie gotowość [audyt-niezalezny E-5].
 */
export function isReadyAfterFeeding(entries: readonly StarterEntryLike[], maxH: number = STARTER_DOUBLING_MAX_H): boolean {
  const feed = lastFeeding(entries);
  if (!feed) return false;
  if (entries.some((e) => e.kind === 'observation' && e.signs.includes('mold_signs') && e.occurredAt >= feed.occurredAt)) return false;
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
    'Miarą gotowości jest podwojenie objętości w ciągu 6–8 godzin po dokarmieniu, a nie liczba dni.',
  ],
  // ZAK-ZAL-002, ZAK-ZAL-014
  day1: [
    'Wymieszaj mąkę pełnoziarnistą (pszenną albo żytnią razową) z wodą w równych ilościach wagowych, np. 113 g mąki i 113 g wody.',
    'Przykryj naczynie luźno, co utrudnia rozwój pleśni, i zostaw na 24 godziny w ciepłym miejscu, w około 21 °C.',
  ],
  // ZAK-ZAL-003
  day2: [
    'Przez pierwszą dobę możesz nie zobaczyć żadnej aktywności; i tak dokarm zakwas.',
    'Odrzuć połowę zakwasu, dodaj mąkę i wodę w równych ilościach wagowych i zostaw na 24 godziny.',
  ],
  // ZAK-ZAL-004, ZAK-ZAL-012, ZAK-ZAL-005, ZAK-ZAL-013
  day3: [
    'W dniu 3 zwykle widać już pęcherzyki, czuć świeży, owocowy zapach, a zakwas trochę rośnie.',
    'Od tego dnia dokarmiaj zakwas dwa razy dziennie, mniej więcej co 12 godzin.',
    'Przy każdym dokarmieniu zostaw część zakwasu, dodaj mąkę i wodę w proporcji 1:1:1 wagowo, a resztę odrzuć.',
    'Odrzucanie utrzymuje małą objętość, więc drożdże dostają więcej pożywienia.',
  ],
  // ZAK-ZAL-006
  day4_5: [
    'Pod koniec dnia 5 zakwas powinien co najmniej podwoić objętość, mieć dużo pęcherzyków i przyjemnie kwaśno pachnieć.',
  ],
  // ZAK-ZAL-007 (RD-24-W3)
  day6_plus: [
    'Jeśli zakwas mało urósł i ma mało pęcherzyków, dokarmiaj go dalej co 12 godzin.',
    '7 dni może nie wystarczyć: założenie zakwasu potrafi potrwać nawet kilka tygodni.',
  ],
  // ZAK-ZAL-011, ZAK-ZAL-007, ZAK-ZAL-012 (RD-24-W2)
  ready: [
    'Zakwas jest gotowy, gdy bąbelkuje, rośnie i ma przyjemnie kwaśny zapach.',
    'Powinien przy tym wyraźnie podwajać objętość w ciągu 6–8 godzin po każdym dokarmieniu.',
    'Do lodówki wstawiaj go dopiero wtedy, gdy się ustali, czyli po 7–10 dniach.',
  ],
  // ZAK-ZAL-008, ZAK-SZC-004, ZAK-ZAL-009
  temperature: [
    'Zakwas rośnie najlepiej w ciepłej temperaturze pokojowej, około 21 °C.',
    'W chłodzie rośnie wolniej, a w zbyt wysokiej temperaturze fermentacja może przebiegać za szybko, a nawet ustać.',
    'Jeśli w domu jest zwykle poniżej 20 °C, znajdź dla zakwasu cieplejsze miejsce.',
  ],
  // ZAK-ZAL-010
  flour: [
    'Dzikie drożdże częściej trafiają się w mące pełnoziarnistej, a zakwas tylko z jasnej mąki może ruszać trochę wolniej.',
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

const SETUP_DAY_STAGES = ['day1', 'day2', 'day3', 'day4_5', 'day6_plus'] as const;

/**
 * Etap treści „Co dziś zrobić” (D-093, poprawka D0b; reguła ostrożna roli 06): mniejszy z dwóch etapów, więc plan
 * nie wyprzedza czynności, których użytkownik nie zrobił. (1) Okres pełnych 24 h od startu (zegar ciągły, zmiana
 * czasu nie skraca ani nie wydłuża doby), progi jak w setupStageForDay. (2) Liczba dokarmień od założenia: 0 → dzień 1,
 * 1 → dzień 2, ≥ 2 → bez ograniczenia. Wpis założenia (ZakladanieStart zapisuje go z zakwasem jako `feeding` w
 * createStarterWithEntry) to dokarmienie „zerowe”, więc od liczby wpisów `feeding` odejmujemy jeden. Numer „Dzień N”
 * w nagłówku zostaje kalendarzowy (setupDay): osobna rzecz od treści.
 */
export function setupGuideStage(input: { setupStartedAt: number; now: number; entries: readonly StarterEntryLike[] }): SetupStage {
  const periods = Math.max(0, Math.floor((input.now - input.setupStartedAt) / (24 * HOUR_MS)));
  const byTime = setupStageForDay(periods + 1);
  const feedings = Math.max(0, input.entries.filter((e) => e.kind === 'feeding').length - 1);
  if (feedings >= 2) return byTime;
  const byFeedings: SetupStage = feedings === 0 ? 'day1' : 'day2';
  const rank = (s: SetupStage) => SETUP_DAY_STAGES.findIndex((x) => x === s);
  return rank(byFeedings) < rank(byTime) ? byFeedings : byTime;
}

/** Pierwsza doba bez aktywności (doktor-zakwasu.md, objaw.brak-aktywnosci-w-pierwszej-dobie; ZAK-ZAL-003, RD-24-W5). */
export const FIRST_DAY_NO_ACTIVITY: readonly string[] = [
  'Przez pierwszą dobę możesz nie zobaczyć żadnej aktywności.',
  'Co zrobić: dokarm zakwas według planu na następny dzień.',
];

export type SetupOutcome =
  | { kind: 'discard'; texts: readonly string[] }
  | { kind: 'ready'; texts: readonly string[] }
  | { kind: 'first_day_normal'; texts: readonly string[]; nextFeedingAt: number | null }
  | { kind: 'continue'; texts: readonly string[]; nextFeedingAt: number | null };

/** Termin następnego dokarmienia wg etapu treści: 24 h w etapach dnia 1–2, potem 12 h od ostatniego dokarmienia (D0b). */
export function nextSetupFeedingAtForStage(stage: SetupStage, entries: readonly StarterEntryLike[]): number | null {
  const feed = lastFeeding(entries);
  if (!feed) return null;
  return feed.occurredAt + (stage === 'day1' || stage === 'day2' ? SETUP_FEED_INTERVAL_EARLY_H : SETUP_FEED_INTERVAL_H) * HOUR_MS;
}

/** To samo dla numeru dnia (etap = setupStageForDay). */
export function nextSetupFeedingAt(day: number, entries: readonly StarterEntryLike[]): number | null {
  return nextSetupFeedingAtForStage(setupStageForDay(day), entries);
}

/**
 * Wynik zapisu obserwacji w dniu N zakładania (BR-ZAKW-005): plamy → wyrzuć (RD-21-W1, teksty kontroli
 * zakwasu); podwojenie ≤ 8 h po dokarmieniu → gotowy (RD-24-W2); dzień 1 bez aktywności → to normalne
 * i termin dokarmienia (RD-24-W5); inaczej plan dnia z terminem dokarmienia.
 */
export function setupObservationOutcome(input: {
  day: number;
  /** Etap treści z setupGuideStage; bez niego etap z numeru dnia (setupStageForDay). */
  stage?: SetupStage;
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
  // Etap treści (czas i dokarmienia, D0b); bez `stage` etap wynika z numeru dnia
  const stage = input.stage ?? setupStageForDay(input.day);
  const nextFeedingAt = nextSetupFeedingAtForStage(stage, input.entries);
  if (stage === 'day1' && !input.signs.includes('doubled')) {
    return { kind: 'first_day_normal', texts: FIRST_DAY_NO_ACTIVITY, nextFeedingAt };
  }
  return { kind: 'continue', texts: SETUP_GUIDE[stage], nextFeedingAt };
}
