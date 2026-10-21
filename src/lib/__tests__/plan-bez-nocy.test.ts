/**
 * M1-audytor-generalny-129 (DEC-18 a): czysta funkcja szukania godziny gotowości bez kroków czynnych w oknie snu
 * 23:00–06:30, na prawdziwym planie z zakwasem z lodówki (ok. 36 h).
 */
import { KROK_SZUKANIA_MIN, LIMIT_SZUKANIA_H, godzinaBezNocy, kolizjeKrokow, krokCzynnyWNocy, wOknieSnu } from '../plan-bez-nocy';
import { calculateReverseSchedule } from '../../scheduler/reverse-scheduler';
import { stepsFromSchedule } from '../../core/bake-steps';
import { withFridgeWake } from '../../core/fridge-wake';

const OKNO = { startH: 23, koniecH: 6.5 };
const kroki = (cel: number) =>
  withFridgeWake(stepsFromSchedule(calculateReverseSchedule(new Date(cel), { ambientTemperatureC: 23, coldRetardHours: 14, sleepStartHour: 23, sleepEndHour: 6.5 })), { storageState: 'FRIDGE' });
const lokalnie = (d: number, h: number, m = 0) => new Date(2026, 6, d, h, m).getTime();

describe('okno snu', () => {
  it('początek włącznie, koniec wyłącznie, przez północ', () => {
    expect(wOknieSnu(lokalnie(14, 23, 0), OKNO)).toBe(true);
    expect(wOknieSnu(lokalnie(14, 0, 30), OKNO)).toBe(true);
    expect(wOknieSnu(lokalnie(14, 6, 29), OKNO)).toBe(true);
    expect(wOknieSnu(lokalnie(14, 6, 30), OKNO)).toBe(false);
    expect(wOknieSnu(lokalnie(14, 22, 59), OKNO)).toBe(false);
    expect(wOknieSnu(lokalnie(14, 1, 0), { startH: 0, koniecH: 8 })).toBe(true);
    expect(wOknieSnu(lokalnie(14, 8, 0), { startH: 0, koniecH: 8 })).toBe(false);
  });

  it('krokCzynnyWNocy: czynny w nocy tak, bierny w nocy nie, okno snu w trakcie kroku tak, krok bez godzin pomijany', () => {
    const k = (isPassive: boolean, s: number | null, e: number | null) => ({ isPassive, plannedStart: s, plannedEnd: e });
    expect(krokCzynnyWNocy([k(false, lokalnie(14, 22, 0), lokalnie(14, 22, 30))], OKNO)).toBe(false);
    expect(krokCzynnyWNocy([k(false, lokalnie(14, 22, 50), lokalnie(14, 23, 5))], OKNO)).toBe(true);
    expect(krokCzynnyWNocy([k(true, lokalnie(14, 23, 30), lokalnie(14, 23, 50))], OKNO)).toBe(false);
    expect(krokCzynnyWNocy([k(false, lokalnie(14, 21, 0), lokalnie(15, 8, 0))], OKNO)).toBe(true);
    expect(krokCzynnyWNocy([k(false, null, null)], OKNO)).toBe(false);
  });
});

describe('kolizjeKrokow (baner nocy planu żytniego, 030)', () => {
  it('krok czynny z początkiem albo końcem w oknie snu: nazwa i godzina startu; bierne i bez godzin pominięte', () => {
    const k = (name: string, isPassive: boolean, s: number | null, e: number | null) => ({ name, isPassive, plannedStart: s, plannedEnd: e });
    const godz = (d: Date) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    expect(
      kolizjeKrokow(
        [
          k('Mieszanie ciasta', false, lokalnie(14, 23, 30), lokalnie(14, 23, 45)),
          k('Podział i formowanie', false, lokalnie(14, 6, 0), lokalnie(14, 6, 40)),
          k('Krótka fermentacja ciasta', true, lokalnie(14, 0, 0), lokalnie(14, 4, 0)),
          k('Wypiek w formie', false, lokalnie(14, 12, 0), lokalnie(14, 13, 0)),
          k('Rozrost w formie', false, null, null),
        ],
        OKNO,
        godz,
      ),
    ).toEqual([
      { stageNamePl: 'Mieszanie ciasta', time: '23:30' },
      { stageNamePl: 'Podział i formowanie', time: '6:00' },
    ]);
  });
});

describe('godzinaBezNocy (plan z lodówki, okno 23:00–06:30)', () => {
  it.each([[0, 30], [6, 0], [7, 46], [12, 0], [14, 0], [20, 0], [21, 0]])('zegar %i:%i: wynik ≥ najwcześniejszej, bez nocy, najbliższy', (h, m) => {
    const odMs = Math.ceil((lokalnie(14, h, m) + 35.72 * 3600_000) / 300_000) * 300_000;
    const wynik = godzinaBezNocy(odMs, kroki, OKNO);
    expect(wynik).not.toBeNull();
    expect(wynik!).toBeGreaterThanOrEqual(odMs);
    expect(wynik! - odMs).toBeLessThan(LIMIT_SZUKANIA_H * 3600_000);
    expect((wynik! - odMs) % (KROK_SZUKANIA_MIN * 60_000)).toBe(0);
    expect(krokCzynnyWNocy(kroki(wynik!), OKNO)).toBe(false);
    for (let c = odMs; c < wynik!; c += KROK_SZUKANIA_MIN * 60_000) expect(krokCzynnyWNocy(kroki(c), OKNO)).toBe(true);
  });

  it('wektor: od 16.07 08:00 (36 h po 14.07 20:00)', () => {
    const odMs = lokalnie(14, 20, 0) + 36 * 3600_000;
    const wynik = godzinaBezNocy(odMs, kroki, OKNO)!;
    // 08:00 ma jeszcze krok czynny w nocy; 09:15 zaczynałoby rozgrzewanie piekarnika o 05:45 (krok z rękami na starcie,
    // audyt niezależny D-6), więc najbliższa dobra godzina to 10:00 (piekarnik o 06:30, koniec okna snu)
    expect(`${new Date(wynik).getDate()} ${new Date(wynik).getHours()}:${new Date(wynik).getMinutes()}`).toBe('16 10:0');
    expect(krokCzynnyWNocy(kroki(wynik), OKNO)).toBe(false);
  });

  it('brak godziny: okno snu cała doba → null w ograniczeniu 48 h', () => {
    expect(godzinaBezNocy(lokalnie(14, 8, 0), kroki, { startH: 0, koniecH: 24 })).toBeNull();
  });
});
