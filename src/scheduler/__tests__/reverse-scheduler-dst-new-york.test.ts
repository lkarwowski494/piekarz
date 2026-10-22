/**
 * Harmonogram wsteczny przez zmianę czasu w America/New_York [M3 D0; audyt niezależny D-12: dotąd test DST
 * wymuszał tylko Europe/Warsaw w reverse-scheduler-dst.test.ts, którego asercje zostają bez zmian].
 * Noc 2026-11-01 (02:00 EDT → 01:00 EST, godzina 01:00–02:00 dwa razy) i 2027-03-14 (02:00 EST → 03:00 EDT, godziny
 * 02:00–03:00 brak). Etapy trwają minuty rzeczywiste; Sleep Guard liczony z godziny ściennej, wyrocznia z Intl
 * z timeZone niezależna od kodu harmonogramu (helpers/dst-wyrocznia.ts).
 */
import { calculateReverseSchedule, autoResolveSleepCollision } from '../reverse-scheduler';
import { MIN, wyrocznia } from './helpers/dst-wyrocznia';

const ZONE = 'America/New_York';
const realProcess = process.getBuiltinModule('process') as NodeJS.Process;
const previousTZ = realProcess.env.TZ;
beforeAll(() => {
  realProcess.env.TZ = ZONE;
});
afterAll(() => {
  if (previousTZ === undefined) delete realProcess.env.TZ;
  else realProcess.env.TZ = previousTZ;
});

const at = (iso: string) => new Date(iso);
const { wallOf, wallMs, transition, kolizja, expectRealMinutesAndWallClock } = wyrocznia(ZONE);

describe('Harmonogram w America/New_York przez zmianę czasu (D-12)', () => {
  it('proces działa w strefie Nowego Jorku (lato −4 h, zima −5 h)', () => {
    expect(at('2026-07-01T12:00:00Z').getTimezoneOffset()).toBe(240);
    expect(at('2026-12-01T12:00:00Z').getTimezoneOffset()).toBe(300);
  });

  it('2026-11-01: przejście 02:00 EDT → 01:00 EST wyliczone skanem; godzina 01:00–02:00 występuje dwa razy', () => {
    const t = transition(at('2026-10-31T12:00:00Z'), at('2026-11-01T12:00:00Z'));
    expect(t.toISOString()).toBe('2026-11-01T06:00:00.000Z');
    expect(wallOf(new Date(t.getTime() - 30 * MIN)).hours).toBe(1.5);
    expect(wallOf(new Date(t.getTime() + 30 * MIN)).hours).toBe(1.5);
  });

  it('2027-03-14: przejście 02:00 EST → 03:00 EDT wyliczone skanem; godziny 02:00–03:00 nie ma', () => {
    const t = transition(at('2027-03-13T12:00:00Z'), at('2027-03-14T12:00:00Z'));
    expect(t.toISOString()).toBe('2027-03-14T07:00:00.000Z');
    expect(wallOf(new Date(t.getTime() - MIN)).hours).toBeCloseTo(1 + 59 / 60, 10);
    expect(wallOf(t).hours).toBe(3);
  });

  it.each([
    ['2026-11-01 08:00 EST (po cofnięciu zegara)', '2026-11-01T08:00:00-05:00', 15],
    ['2027-03-14 08:00 EDT (po przestawieniu do przodu)', '2027-03-14T08:00:00-04:00', 15],
    ['2026-11-01 08:00 z krótkim garowaniem w lodówce (etapy w nocy zmiany)', '2026-11-01T08:00:00-05:00', 8],
    ['2027-03-14 08:00 z krótkim garowaniem w lodówce (etapy w nocy zmiany)', '2027-03-14T08:00:00-04:00', 8],
  ])('%s: etapy w minutach rzeczywistych, godziny i Sleep Guard według czasu ściennego', (_n, iso, retard) => {
    const target = at(iso);
    const s = calculateReverseSchedule(target, { coldRetardHours: retard });
    expectRealMinutesAndWallClock(s, target);
    // Plan obejmuje noc zmiany: początek przed przejściem, koniec po nim
    const t = transition(new Date(target.getTime() - 24 * 60 * MIN), target);
    expect(s.stages[0].startTime.getTime()).toBeLessThan(t.getTime());
  });

  it('etap trwający przez powtórzoną godzinę 2026-11-01 ma 60 minut ściennych mniej niż na zegarze', () => {
    const target = at('2026-11-01T04:00:00-05:00');
    const s = calculateReverseSchedule(target, { coldRetardHours: 8 });
    const t = transition(at('2026-10-31T12:00:00Z'), at('2026-11-01T12:00:00Z'));
    const across = s.stages.find((st) => st.startTime < t && st.endTime > t);
    expect(across).toBeDefined();
    const a = across!;
    const wallSpan = (wallMs(a.endTime) - wallMs(a.startTime)) / MIN;
    expect(wallSpan).toBe(a.durationMinutes - 60);
    expectRealMinutesAndWallClock(s, target);
  });

  it('etap przez brakującą godzinę 2027-03-14 ma 60 minut ściennych więcej niż na zegarze', () => {
    const target = at('2027-03-14T05:30:00-04:00');
    const s = calculateReverseSchedule(target, { coldRetardHours: 8 });
    const t = transition(at('2027-03-13T12:00:00Z'), at('2027-03-14T12:00:00Z'));
    const across = s.stages.find((st) => st.startTime < t && st.endTime > t);
    expect(across).toBeDefined();
    const a = across!;
    const wallSpan = (wallMs(a.endTime) - wallMs(a.startTime)) / MIN;
    expect(wallSpan).toBe(a.durationMinutes + 60);
    expectRealMinutesAndWallClock(s, target);
  });

  it.each([
    ['2026-11-01T08:00:00-05:00'],
    ['2027-03-14T08:00:00-04:00'],
    ['2026-11-01T21:00:00-05:00'],
    ['2027-03-14T21:00:00-04:00'],
  ])('autoResolveSleepCollision %s: wynik bez kolizji w czasie ściennym, garowanie 8–24 h', (iso) => {
    const target = at(iso);
    const initial = calculateReverseSchedule(target);
    expectRealMinutesAndWallClock(initial, target);
    const r = autoResolveSleepCollision(target);
    // Każde garowanie 8–24 h co 0,5 h, ocenione niezależnie z godziny ściennej
    const free: number[] = [];
    for (let h = 8; h <= 24; h += 0.5) {
      const s = calculateReverseSchedule(target, { coldRetardHours: h });
      if (!s.stages.some(kolizja)) free.push(h);
    }
    if (!initial.hasSleepCollision || free.length === 0) {
      expect(r).toBeNull();
      return;
    }
    expect(r).not.toBeNull();
    const res = r!;
    expect(free).toContain(res.adjustedColdRetardHours);
    expect(res.adjustedColdRetardHours).toBeGreaterThanOrEqual(8);
    expect(res.adjustedColdRetardHours).toBeLessThanOrEqual(24);
    expectRealMinutesAndWallClock(res.resolvedSchedule, target);
    expect(res.resolvedSchedule.stages.filter(kolizja)).toEqual([]);
  });

  it('północ lokalna: plan na 2026-11-10 07:00 zaczyna się poprzedniego dnia według kalendarza Nowego Jorku', () => {
    const target = at('2026-11-10T07:00:00-05:00');
    const s = calculateReverseSchedule(target);
    expectRealMinutesAndWallClock(s, target);
    const first = s.stages[0].startTime;
    expect(wallOf(first).day < '2026-11-10').toBe(true);
    expect(first.getDate()).toBe(Number(wallOf(first).day.slice(8, 10)));
    const crossing = s.stages.find((st) => wallOf(st.startTime).day !== wallOf(st.endTime).day);
    expect(crossing).toBeDefined();
  });
});
