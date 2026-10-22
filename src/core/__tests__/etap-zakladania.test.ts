/**
 * Etap przewodnika zakładania zakwasu wg czasu i liczby dokarmień, numer „Dzień N” zostaje kalendarzowy
 * (D-093, poprawka D0b, decyzja właściciela 2026-10-22; reguła ostrożna roli 06): etap = mniejszy z (1) okresu
 * pełnych 24 h od startu (progi setupStageForDay) i (2) liczby dokarmień od założenia (0 → dzień 1, 1 → dzień 2,
 * ≥ 2 → bez ograniczenia). Wpis założenia jest dokarmieniem „zerowym”: ZakladanieStart zapisuje go razem z zakwasem
 * (createStarterWithEntry), więc przykład 23:46 → 00:46 daje etap dnia 1 (ZAK-ZAL-002: 24 h). [M3 D0b]
 */
import {
  SETUP_GUIDE,
  FIRST_DAY_NO_ACTIVITY,
  setupDay,
  setupGuideStage,
  nextSetupFeedingAtForStage,
  setupObservationOutcome,
  type StarterEntryLike,
} from '../starter-log';
import { wStrefie } from './helpers/strefa';

const H = 3600_000;
const lok = (y: number, m: number, d: number, h: number, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const feed = (at: number): StarterEntryLike => ({ kind: 'feeding', occurredAt: at, signs: [] });
const obs = (at: number): StarterEntryLike => ({ kind: 'observation', occurredAt: at, signs: ['bubbles'] });

describe('D0b: etap przewodnika zakładania (Europe/Warsaw)', () => {
  wStrefie('Europe/Warsaw');

  it('założony 23:46, o 00:46 numer kalendarzowy 2, ale treść dnia 1 (24 h od startu, brak dokarmienia po założeniu)', () => {
    const start = lok(2026, 10, 20, 23, 46);
    const teraz = lok(2026, 10, 21, 0, 46);
    expect(setupDay(start, teraz)).toBe(2);
    expect(setupGuideStage({ setupStartedAt: start, now: teraz, entries: [feed(start)] })).toBe('day1');
  });

  it('po pełnej dobie od startu, ale bez dokarmienia po założeniu: nadal dzień 1 (etap nie wyprzedza czynności)', () => {
    const start = lok(2026, 10, 20, 8);
    expect(setupGuideStage({ setupStartedAt: start, now: start + 49 * H, entries: [feed(start)] })).toBe('day1');
    expect(setupGuideStage({ setupStartedAt: start, now: start + 49 * H, entries: [feed(start), obs(start + 30 * H)] })).toBe('day1');
  });

  it('spóźnione dokarmienie: jedno dokarmienie po założeniu, 49 h od startu → treść dnia 2, nie dnia 3', () => {
    const start = lok(2026, 10, 20, 8);
    const entries = [feed(start), feed(start + 40 * H)];
    expect(setupDay(start, start + 49 * H)).toBe(3);
    expect(setupGuideStage({ setupStartedAt: start, now: start + 49 * H, entries })).toBe('day2');
  });

  it('dokarmianie na czas: etapy jak w źródle (doby: 1 → dzień 1, 2 → dzień 2, 3 → dzień 3, 4–5 → dni 4–5, 6+ → dni 6+)', () => {
    const start = lok(2026, 10, 20, 8);
    // założenie + dokarmienia co 12 h od drugiej doby (dwa dokarmienia już w drugiej dobie)
    const wpisy = [feed(start), feed(start + 24 * H), feed(start + 36 * H), feed(start + 48 * H), feed(start + 60 * H)];
    const etap = (h: number) => setupGuideStage({ setupStartedAt: start, now: start + h * H, entries: wpisy.filter((w) => w.occurredAt <= start + h * H) });
    expect(etap(0)).toBe('day1');
    expect(etap(23)).toBe('day1');
    expect(etap(25)).toBe('day2');
    expect(etap(37)).toBe('day2');
    expect(etap(49)).toBe('day3');
    expect(etap(73)).toBe('day4_5');
    expect(etap(95)).toBe('day4_5');
    expect(etap(97)).toBe('day4_5');
    expect(etap(121)).toBe('day6_plus');
    expect(etap(200)).toBe('day6_plus');
  });

  it('dokarmienie 24 h od startu w pierwszej minucie drugiej doby: dzień 2; dokarmienie przed upływem doby nie przyspiesza etapu', () => {
    const start = lok(2026, 10, 20, 8);
    expect(setupGuideStage({ setupStartedAt: start, now: start + 10 * H, entries: [feed(start), feed(start + 9 * H)] })).toBe('day1');
    expect(setupGuideStage({ setupStartedAt: start, now: start + 24 * H, entries: [feed(start), feed(start + 9 * H)] })).toBe('day2');
  });

  it('zmiana czasu 25.10.2026 (doba 25 h): okres liczony zegarem ciągłym, 24 h od startu 24.10 21:00 to 25.10 20:00', () => {
    const start = lok(2026, 10, 24, 21);
    const wpisy = [feed(start), feed(lok(2026, 10, 25, 9))];
    expect(setupGuideStage({ setupStartedAt: start, now: lok(2026, 10, 25, 19, 59), entries: wpisy })).toBe('day1');
    expect(setupGuideStage({ setupStartedAt: start, now: lok(2026, 10, 25, 20), entries: wpisy })).toBe('day2');
  });

  it('„teraz” przed startem → dzień 1', () => {
    const start = lok(2026, 10, 20, 8);
    expect(setupGuideStage({ setupStartedAt: start, now: start - 5 * H, entries: [feed(start)] })).toBe('day1');
  });
});

describe('D0b: termin następnego dokarmienia wg etapu', () => {
  it('etapy dnia 1–2: 24 h; od dnia 3: 12 h; bez dokarmienia: brak terminu', () => {
    const f = lok(2026, 10, 20, 8);
    expect(nextSetupFeedingAtForStage('day1', [feed(f)])).toBe(f + 24 * H);
    expect(nextSetupFeedingAtForStage('day2', [feed(f)])).toBe(f + 24 * H);
    expect(nextSetupFeedingAtForStage('day3', [feed(f)])).toBe(f + 12 * H);
    expect(nextSetupFeedingAtForStage('day6_plus', [feed(f)])).toBe(f + 12 * H);
    expect(nextSetupFeedingAtForStage('day1', [])).toBeNull();
  });
});

describe('D0b: wynik zapisu obserwacji używa etapu, nie numeru kalendarzowego', () => {
  it('numer 2, etap dnia 1, brak aktywności: pierwsza doba bez aktywności i „następne dokarmienie” = start + 24 h', () => {
    const start = lok(2026, 10, 20, 23, 46);
    const out = setupObservationOutcome({ day: 2, stage: 'day1', signs: ['no_activity'], entries: [feed(start)], observedAt: start + 1 * H });
    expect(out).toEqual({ kind: 'first_day_normal', texts: FIRST_DAY_NO_ACTIVITY, nextFeedingAt: start + 24 * H });
  });

  it('numer 3, etap dnia 2 (jedno dokarmienie): rytm 24 h od ostatniego dokarmienia, treść dnia 2', () => {
    const start = lok(2026, 10, 20, 8);
    const f2 = start + 40 * H;
    const out = setupObservationOutcome({ day: 3, stage: 'day2', signs: ['bubbles'], entries: [feed(start), feed(f2)], observedAt: f2 + 2 * H });
    expect(out).toEqual({ kind: 'continue', texts: SETUP_GUIDE.day2, nextFeedingAt: f2 + 24 * H });
  });

  it('numer 3, etap dnia 3: rytm 12 h', () => {
    const start = lok(2026, 10, 20, 8);
    const f3 = start + 50 * H;
    const out = setupObservationOutcome({ day: 3, stage: 'day3', signs: ['bubbles'], entries: [feed(start), feed(start + 25 * H), feed(f3)], observedAt: f3 + 2 * H });
    expect(out).toEqual({ kind: 'continue', texts: SETUP_GUIDE.day3, nextFeedingAt: f3 + 12 * H });
  });
});
