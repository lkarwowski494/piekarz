/**
 * M1-audytor-generalny-104, BR-ZAKW-005 (RD-24, RD-21; T5 roli 05): zakładanie zakwasu dzień po dniu jako czyste
 * funkcje z czasem w argumencie. Teksty dosłownie z docs/tresci/pl|en/zakwas-od-zera.md.
 */
import {
  STARTER_SIGNS,
  STARTER_DOUBLING_MAX_H,
  SETUP_FEED_INTERVAL_EARLY_H,
  SETUP_FEED_INTERVAL_H,
  SETUP_GUIDE,
  FIRST_DAY_NO_ACTIVITY,
  isStarterSign,
  lastFeeding,
  setupDay,
  isReadyAfterFeeding,
  legacyFeedingEntry,
  setupStageForDay,
  nextSetupFeedingAt,
  setupObservationOutcome,
  type SetupStage,
  type SetupOutcome,
  type StarterEntryKind,
  type StarterEntryLike,
} from '../starter-log';
import { evaluateSourdoughSafety } from '../sourdough-physics';
import { linie, poAngielsku } from './helpers/tresci';

const H = 3600_000;
const local = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m).getTime();
const feed = (at: number): StarterEntryLike => ({ kind: 'feeding', occurredAt: at, signs: [] });
const obs = (at: number, signs: StarterEntryLike['signs']): StarterEntryLike => ({ kind: 'observation', occurredAt: at, signs });

describe('BR-ZAKW-005: dzień N i gotowość (104)', () => {
  it('kody obserwacji z jednej listy', () => {
    expect(STARTER_SIGNS).toEqual(['bubbles', 'rose', 'doubled', 'no_activity', 'mold_signs']);
    expect(isStarterSign('doubled')).toBe(true);
    const kinds: StarterEntryKind[] = ['feeding', 'observation'];
    expect(kinds.map((kind) => lastFeeding([{ kind, occurredAt: 1, signs: [] }])?.occurredAt ?? null)).toEqual([1, null]);
    expect(isStarterSign('smells_nice')).toBe(false);
  });

  // Dzień liczony w pełnych dobach od założenia (pierwszego dokarmienia), jak rytm karmień co 24 h; północ nie
  // zmienia dnia [M2-koordynator-napraw-501 (p11)]
  it('setupDay: dzień 2 dopiero po pełnej dobie od założenia, nie po północy; zmiana czasu (25.10.2026) nie przesuwa dnia', () => {
    expect(setupDay(local(20, 23, 50), local(20, 23, 59))).toBe(1);
    expect(setupDay(local(20, 23, 50), local(21, 0, 5))).toBe(1);
    expect(setupDay(local(20, 23, 46), local(21, 0, 46))).toBe(1);
    expect(setupDay(local(20, 23, 50), local(21, 23, 49))).toBe(1);
    expect(setupDay(local(20, 23, 50), local(21, 23, 50))).toBe(2);
    expect(setupDay(local(24, 12), local(26, 12))).toBe(3);
    expect(setupDay(local(20, 8), local(26, 23))).toBe(7);
    expect(setupDay(local(20, 8), local(19, 8))).toBe(1);
  });

  it('isReadyAfterFeeding: podwojenie po 8 h (włącznie) → gotowy; 8 h + 1 min → nie', () => {
    expect(STARTER_DOUBLING_MAX_H).toBe(8);
    const f = local(26, 8);
    expect(isReadyAfterFeeding([feed(f), obs(f + 8 * H, ['doubled'])])).toBe(true);
    expect(isReadyAfterFeeding([feed(f), obs(f + 8 * H + 60_000, ['doubled'])])).toBe(false);
    expect(isReadyAfterFeeding([feed(f), obs(f + 2 * H, ['bubbles', 'rose'])])).toBe(false);
    expect(isReadyAfterFeeding([obs(f, ['doubled'])])).toBe(false);
    // liczy się ostatnie dokarmienie
    expect(isReadyAfterFeeding([feed(f - 24 * H), obs(f - 20 * H, ['doubled']), feed(f)])).toBe(false);
    expect(lastFeeding([feed(1), feed(3), obs(5, [])])?.occurredAt).toBe(3);
    expect(lastFeeding([])).toBeNull();
  });

  it('legacyFeedingEntry: ta sama reguła co migracja v5 (id v5-<zakwas>, tylko lastFedAt > 0)', () => {
    expect(legacyFeedingEntry({ id: 's', lastFedAt: 10, feedingRatio: '1:2:2' })).toEqual({
      id: 'v5-s', starterId: 's', kind: 'feeding', occurredAt: 10, feedRatio: '1:2:2', signs: [], createdAt: 10, updatedAt: 10,
    });
    expect(legacyFeedingEntry({ id: 's' })).toBeNull();
    expect(legacyFeedingEntry({ id: 's', lastFedAt: 0 })).toBeNull();
  });

  it('etap planu dla dnia i termin dokarmienia: 24 h w dniach 1–2, potem 12 h (ZAK-ZAL-002…004)', () => {
    expect([1, 2, 3, 4, 5, 6, 9].map(setupStageForDay)).toEqual(['day1', 'day2', 'day3', 'day4_5', 'day4_5', 'day6_plus', 'day6_plus']);
    expect([SETUP_FEED_INTERVAL_EARLY_H, SETUP_FEED_INTERVAL_H]).toEqual([24, 12]);
    const f = local(20, 8);
    expect(nextSetupFeedingAt(1, [feed(f)])).toBe(f + 24 * H);
    expect(nextSetupFeedingAt(3, [feed(f)])).toBe(f + 12 * H);
    expect(nextSetupFeedingAt(3, [])).toBeNull();
  });
});

describe('BR-ZAKW-005: scenariusze akceptacji (104)', () => {
  it('BR-ZAKW-005 Start: po pierwszym dokarmieniu plan dnia 1 i następnych oraz 7–10 dni', () => {
    expect(SETUP_GUIDE.start.join(' ')).toMatch(/średnio trwa 7–10 dni/);
    expect(SETUP_GUIDE[setupStageForDay(1)]).toBe(SETUP_GUIDE.day1);
  });

  it('BR-ZAKW-005 Brak aktywności pierwszego dnia: to normalne i termin następnego dokarmienia (RD-24-W5)', () => {
    const f = local(20, 8);
    const out = setupObservationOutcome({ day: 1, signs: ['no_activity'], entries: [feed(f)], observedAt: f + 10 * H });
    expect(out).toEqual({ kind: 'first_day_normal', texts: FIRST_DAY_NO_ACTIVITY, nextFeedingAt: f + 24 * H });
  });

  it('BR-ZAKW-005 Pleśń w trakcie zakładania (dzień 4): polecenie wyrzucenia i umycia naczynia (RD-21-W1)', () => {
    const out = setupObservationOutcome({ day: 4, signs: ['mold_signs', 'bubbles'], entries: [feed(1)], observedAt: 2 });
    const discard = evaluateSourdoughSafety({ hasColoredSpots: true });
    expect(out).toEqual({ kind: 'discard', texts: [discard.titlePl, discard.actionPl] });
    expect(discard.actionPl).toMatch(/umyj i wypłucz słoik/);
  });

  it('BR-ZAKW-005 Gotowy: dzień 7, podwojenie w 8 h → gotowy (RD-24-W2)', () => {
    const f = local(26, 8);
    const out: SetupOutcome = setupObservationOutcome({ day: 7, signs: ['doubled'], entries: [feed(f)], observedAt: f + 8 * H });
    expect(out).toEqual({ kind: 'ready', texts: SETUP_GUIDE.ready });
  });

  it('dzień 6 bez podwojenia: dokarmiaj dalej co 12 h (RD-24-W3)', () => {
    const f = local(25, 8);
    const out = setupObservationOutcome({ day: 6, signs: ['bubbles'], entries: [feed(f)], observedAt: f + 9 * H });
    expect(out).toEqual({ kind: 'continue', texts: SETUP_GUIDE.day6_plus, nextFeedingAt: f + 12 * H });
  });
});

describe('teksty zakładania dosłownie z docs/tresci (PL i EN)', () => {
  const SEKCJE: Array<[SetupStage, string, string]> = [
    ['start', 'czas.zalozenia', 'czas.zalozenia'],
    ['day1', 'dzien.1', 'dzien.1'],
    ['day2', 'dzien.2', 'dzien.2'],
    ['day3', 'dzien.3', 'dzien.3'],
    ['day4_5', 'dzien.4-5', 'dzien.4-5'],
    ['day6_plus', 'dzien.6-i-dalej', 'dzien.6-i-dalej'],
    ['ready', 'gotowy', 'gotowy'],
    ['temperature', 'temperatura', 'temperatura'],
    ['flour', 'maka', 'maka'],
    ['discard_link', 'odrzucenie', 'odrzucenie'],
  ];
  it.each(SEKCJE)('%s = sekcja %s', (etap, pl, en) => {
    expect(SETUP_GUIDE[etap]).toEqual(linie('pl/zakwas-od-zera.md', pl));
    expect(poAngielsku(SETUP_GUIDE[etap])).toEqual(linie('en/zakwas-od-zera.md', en));
  });

  it('pierwsza doba bez aktywności = doktor-zakwasu.md (PL i EN)', () => {
    expect(FIRST_DAY_NO_ACTIVITY).toEqual(linie('pl/doktor-zakwasu.md', 'objaw.brak-aktywnosci'));
    expect(poAngielsku(FIRST_DAY_NO_ACTIVITY)).toEqual(linie('en/doktor-zakwasu.md', 'objaw.brak-aktywnosci'));
  });
});
