/**
 * Harmonogram wsteczny przez zmianę czasu i północ lokalną w Europe/Warsaw [M1-audytor-generalny-065; 07-jakosc-012].
 * Noc 2026-10-25 (03:00 CEST → 02:00 CET, godzina 02:00–03:00 dwa razy) i 2027-03-28 (02:00 CET → 03:00 CEST,
 * godziny 02:00–03:00 brak). Etapy trwają minuty rzeczywiste; Sleep Guard liczony z godziny ściennej.
 * Godziny oczekiwane z Intl.DateTimeFormat z timeZone, niezależnie od kodu harmonogramu.
 * Strefa: proces roboczy Jest dostaje TZ=Europe/Warsaw na czas pliku i wraca do poprzedniej. process.env w Jest
 * to kopia w piaskownicy (zmiana nie działa), więc TZ ustawiamy w prawdziwym procesie (getBuiltinModule, jak
 * node:sqlite w helpers/node-sqlite-adapter.ts); Node 24 na Windows przelicza strefę po zmianie TZ (sprawdzone).
 */
import { calculateReverseSchedule, autoResolveSleepCollision, ReverseScheduleResult } from '../reverse-scheduler';

const ZONE = 'Europe/Warsaw';
const MIN = 60_000;
const realProcess = process.getBuiltinModule('process') as NodeJS.Process;
const previousZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

beforeAll(() => {
  realProcess.env.TZ = ZONE;
});
afterAll(() => {
  realProcess.env.TZ = previousZone;
});

const wall = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
/** Data i godzina ścienna w Warszawie: { day: 'RRRR-MM-DD', hours: godzina z ułamkiem }. */
function wallOf(d: Date): { day: string; hours: number } {
  const p = Object.fromEntries(wall.formatToParts(d).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, hours: Number(p.hour) + Number(p.minute) / 60 };
}
/** Czas ścienny jako liczba (ms), do różnic godzin na zegarze. */
const wallMs = (d: Date) => {
  const w = wallOf(d);
  return Date.parse(`${w.day}T00:00:00Z`) + Math.round(w.hours * 60) * MIN;
};
const asleep = (d: Date, start = 23, end = 6.5) => {
  const h = wallOf(d).hours;
  return h >= start || h < end;
};
/** Chwila (UTC) dla godziny ściennej w Warszawie przy znanym przesunięciu: `+02:00` albo `+01:00`. */
const at = (iso: string) => new Date(iso);

/** Pierwsza chwila, w której przesunięcie strefy zmienia się w [od, do) — szukane skanem, nie wpisane. */
function transition(from: Date, to: Date): Date {
  const off = (t: number) => new Date(t).getTimezoneOffset();
  let lo = from.getTime();
  let hi = to.getTime();
  expect(off(lo)).not.toBe(off(hi));
  while (hi - lo > MIN) {
    const mid = lo + Math.floor((hi - lo) / 2 / MIN) * MIN;
    if (off(mid) === off(lo)) lo = mid;
    else hi = mid;
  }
  return new Date(hi);
}

function expectRealMinutesAndWallClock(s: ReverseScheduleResult, target: Date): void {
  const total = s.stages.reduce((sum, st) => sum + st.durationMinutes, 0);
  expect(s.stages[s.stages.length - 1].endTime.getTime()).toBe(target.getTime());
  expect(target.getTime() - s.stages[0].startTime.getTime()).toBe(total * MIN);
  s.stages.forEach((st, i) => {
    expect({ id: st.id, ms: st.endTime.getTime() - st.startTime.getTime() }).toEqual({ id: st.id, ms: st.durationMinutes * MIN });
    if (i > 0) expect(st.startTime.getTime()).toBe(s.stages[i - 1].endTime.getTime());
    // Godzina pokazywana w aplikacji (getHours) = godzina ścienna w Warszawie
    expect({ id: st.id, h: st.startTime.getHours() + st.startTime.getMinutes() / 60 }).toEqual({ id: st.id, h: wallOf(st.startTime).hours });
    // Sleep Guard: aktywny etap z początkiem albo końcem w oknie snu (godzina ścienna)
    const expected = !st.isPassive && (asleep(st.startTime) || asleep(st.endTime));
    expect({ id: st.id, collision: st.isSleepCollision }).toEqual({ id: st.id, collision: expected });
  });
  expect(s.hasSleepCollision).toBe(s.stages.some((st) => st.isSleepCollision));
}

describe('Harmonogram w Europe/Warsaw przez zmianę czasu (065)', () => {
  it('proces działa w strefie Warszawy (lato +2 h, zima +1 h)', () => {
    expect(at('2026-07-01T12:00:00Z').getTimezoneOffset()).toBe(-120);
    expect(at('2026-12-01T12:00:00Z').getTimezoneOffset()).toBe(-60);
  });

  it('2026-10-25: przejście 03:00 CEST → 02:00 CET wyliczone skanem; godzina 02:00–03:00 występuje dwa razy', () => {
    const t = transition(at('2026-10-24T12:00:00Z'), at('2026-10-25T12:00:00Z'));
    expect(t.toISOString()).toBe('2026-10-25T01:00:00.000Z');
    expect(wallOf(new Date(t.getTime() - 30 * MIN)).hours).toBe(2.5);
    expect(wallOf(new Date(t.getTime() + 30 * MIN)).hours).toBe(2.5);
  });

  it('2027-03-28: przejście 02:00 CET → 03:00 CEST wyliczone skanem; godziny 02:00–03:00 nie ma', () => {
    const t = transition(at('2027-03-27T12:00:00Z'), at('2027-03-28T12:00:00Z'));
    expect(t.toISOString()).toBe('2027-03-28T01:00:00.000Z');
    expect(wallOf(new Date(t.getTime() - MIN)).hours).toBeCloseTo(1 + 59 / 60, 10);
    expect(wallOf(t).hours).toBe(3);
  });

  it.each([
    ['2026-10-25 08:00 CET (po cofnięciu zegara)', '2026-10-25T08:00:00+01:00', 15],
    ['2027-03-28 08:00 CEST (po przestawieniu do przodu)', '2027-03-28T08:00:00+02:00', 15],
    ['2026-10-25 08:00 z krótkim garowaniem w lodówce (etapy w nocy zmiany)', '2026-10-25T08:00:00+01:00', 8],
    ['2027-03-28 08:00 z krótkim garowaniem w lodówce (etapy w nocy zmiany)', '2027-03-28T08:00:00+02:00', 8],
  ])('%s: etapy w minutach rzeczywistych, godziny i Sleep Guard według czasu ściennego', (_n, iso, retard) => {
    const target = at(iso);
    const s = calculateReverseSchedule(target, { coldRetardHours: retard });
    expectRealMinutesAndWallClock(s, target);
    // Plan obejmuje noc zmiany: początek przed przejściem, koniec po nim
    const t = transition(new Date(target.getTime() - 24 * 60 * MIN), target);
    expect(s.stages[0].startTime.getTime()).toBeLessThan(t.getTime());
  });

  it('etap trwający przez powtórzoną godzinę 2026-10-25 ma 60 minut ściennych więcej niż na zegarze', () => {
    const target = at('2026-10-25T05:00:00+01:00');
    const s = calculateReverseSchedule(target, { coldRetardHours: 8 });
    const t = transition(at('2026-10-24T12:00:00Z'), at('2026-10-25T12:00:00Z'));
    const across = s.stages.find((st) => st.startTime < t && st.endTime > t);
    expect(across).toBeDefined();
    const a = across!;
    const wallSpan = (wallMs(a.endTime) - wallMs(a.startTime)) / MIN;
    expect(wallSpan).toBe(a.durationMinutes - 60);
    expectRealMinutesAndWallClock(s, target);
  });

  it('etap przez brakującą godzinę 2027-03-28 ma 60 minut ściennych mniej niż na zegarze', () => {
    const target = at('2027-03-28T05:30:00+02:00');
    const s = calculateReverseSchedule(target, { coldRetardHours: 8 });
    const t = transition(at('2027-03-27T12:00:00Z'), at('2027-03-28T12:00:00Z'));
    const across = s.stages.find((st) => st.startTime < t && st.endTime > t);
    expect(across).toBeDefined();
    const a = across!;
    const wallSpan = (wallMs(a.endTime) - wallMs(a.startTime)) / MIN;
    expect(wallSpan).toBe(a.durationMinutes + 60);
    expectRealMinutesAndWallClock(s, target);
  });

  it.each([
    ['2026-10-25T08:00:00+01:00'],
    ['2027-03-28T08:00:00+02:00'],
    ['2026-10-25T21:00:00+01:00'],
    ['2027-03-28T21:00:00+02:00'],
  ])('autoResolveSleepCollision %s: wynik bez kolizji w czasie ściennym, garowanie 8–24 h', (iso) => {
    const target = at(iso);
    const initial = calculateReverseSchedule(target);
    expectRealMinutesAndWallClock(initial, target);
    const r = autoResolveSleepCollision(target);
    // Każde garowanie 8–24 h co 0,5 h, ocenione niezależnie z godziny ściennej
    const free: number[] = [];
    for (let h = 8; h <= 24; h += 0.5) {
      const s = calculateReverseSchedule(target, { coldRetardHours: h });
      if (!s.stages.some((st) => !st.isPassive && (asleep(st.startTime) || asleep(st.endTime)))) free.push(h);
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
    expect(res.resolvedSchedule.stages.filter((st) => !st.isPassive && (asleep(st.startTime) || asleep(st.endTime)))).toEqual([]);
  });

  it('północ lokalna: plan na 2026-11-10 07:00 zaczyna się poprzedniego dnia według kalendarza Warszawy', () => {
    const target = at('2026-11-10T07:00:00+01:00');
    const s = calculateReverseSchedule(target);
    expectRealMinutesAndWallClock(s, target);
    const first = s.stages[0].startTime;
    expect(wallOf(first).day < '2026-11-10').toBe(true);
    expect(first.getDate()).toBe(Number(wallOf(first).day.slice(8, 10)));
    const crossing = s.stages.find((st) => wallOf(st.startTime).day !== wallOf(st.endTime).day);
    expect(crossing).toBeDefined();
  });
});
