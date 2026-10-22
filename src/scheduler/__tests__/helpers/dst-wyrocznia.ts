/**
 * Wyrocznia testów harmonogramu przez zmianę czasu, niezależna od kodu harmonogramu: godziny ścienne z
 * Intl.DateTimeFormat z timeZone, Sleep Guard liczony z godziny ściennej, kontrola minut rzeczywistych.
 * Ta sama logika co w reverse-scheduler-dst.test.ts (Europe/Warsaw), dla dowolnej strefy [M3 D0, audyt niezależny D-12].
 * Strefa procesu: proces roboczy Jest dostaje TZ na czas bloku (jak w src/core/__tests__/helpers/strefa.ts).
 */
import type { ReverseScheduleResult } from '../../reverse-scheduler';

export const MIN = 60_000;
const REKI_NA_STARCIE = ['starter_feed', 'autolyse', 'preheat_oven'];

export function wyrocznia(strefa: string) {
  const wall = new Intl.DateTimeFormat('en-GB', {
    timeZone: strefa,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  /** Data i godzina ścienna w strefie: { day: 'RRRR-MM-DD', hours: godzina z ułamkiem }. */
  function wallOf(d: Date): { day: string; hours: number } {
    const p = Object.fromEntries(wall.formatToParts(d).map((x) => [x.type, x.value]));
    return { day: `${p.year}-${p.month}-${p.day}`, hours: Number(p.hour) + Number(p.minute) / 60 };
  }
  /** Czas ścienny jako liczba (ms), do różnic godzin na zegarze. */
  const wallMs = (d: Date) => {
    const w = wallOf(d);
    return Date.parse(`${w.day}T00:00:00Z`) + Math.round(w.hours * 60) * MIN;
  };
  // Okno snu domyślne harmonogramu = profil domyślny Ustawień 23:00–07:00 (D-066 1a)
  const asleep = (d: Date, start = 23, end = 7) => {
    const h = wallOf(d).hours;
    return h >= start || h < end;
  };
  /** Pierwsza chwila, w której przesunięcie strefy zmienia się w [od, do): skan, nie wpisana wartość. */
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
  /** Krok czynny z początkiem albo końcem w oknie snu albo krok bierny z rękami na starcie z początkiem w oknie. */
  const kolizja = (st: { id: string; isPassive: boolean; startTime: Date; endTime: Date }) =>
    (!st.isPassive && (asleep(st.startTime) || asleep(st.endTime))) || (REKI_NA_STARCIE.includes(st.id) && asleep(st.startTime));

  function expectRealMinutesAndWallClock(s: ReverseScheduleResult, target: Date): void {
    const total = s.stages.reduce((sum, st) => sum + st.durationMinutes, 0);
    expect(s.stages[s.stages.length - 1].endTime.getTime()).toBe(target.getTime());
    expect(target.getTime() - s.stages[0].startTime.getTime()).toBe(total * MIN);
    s.stages.forEach((st, i) => {
      expect({ id: st.id, ms: st.endTime.getTime() - st.startTime.getTime() }).toEqual({ id: st.id, ms: st.durationMinutes * MIN });
      if (i > 0) expect(st.startTime.getTime()).toBe(s.stages[i - 1].endTime.getTime());
      // Godzina pokazywana w aplikacji (getHours) = godzina ścienna w strefie
      expect({ id: st.id, h: st.startTime.getHours() + st.startTime.getMinutes() / 60 }).toEqual({ id: st.id, h: wallOf(st.startTime).hours });
      expect({ id: st.id, collision: st.isSleepCollision }).toEqual({ id: st.id, collision: kolizja(st) });
    });
    expect(s.hasSleepCollision).toBe(s.stages.some((st) => st.isSleepCollision));
  }

  return { wallOf, wallMs, asleep, transition, kolizja, expectRealMinutesAndWallClock };
}
