/**
 * Dzień i tydzień lokalny (D-090, RD-29, RD-30; D-093) [M3 D0]: data zdarzenia w bieżącej strefie, dodawanie dni
 * kalendarza (nie N × 24 h), początek tygodnia z ustawień telefonu z zapasem z regionu (CLDR). Dwie strefy
 * (Europe/Warsaw, America/New_York) i dni zmiany czasu: 2027-03-28 i 2027-10-31 (Warszawa), 2027-03-14 i 2027-11-07
 * (Nowy Jork). Oczekiwane godziny ścienne wpisane z rachunku na tz database, nie wyliczone kodem testowanym.
 */
import {
  addCalendarDays,
  atLocalTime,
  calendarDayDiff,
  daysOfWeek,
  localDateKey,
  resolveFirstWeekday,
  startOfLocalDay,
  weekStart,
} from '../dzien-lokalny';
import { wStrefie } from './helpers/strefa';

const H = 3_600_000;
/** Chwila z lokalnych składników w bieżącej strefie procesu. */
const lok = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
/** Składniki ścienne chwili w bieżącej strefie: [rok, miesiąc, dzień, godzina, minuta]. */
const sciana = (ms: number) => {
  const d = new Date(ms);
  return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];
};

describe.each([
  {
    strefa: 'Europe/Warsaw',
    // [od (rok, mies, dzień, godz), dni, oczekiwana ściana, różnica rzeczywista w godzinach]
    dodawanie: [
      { od: [2027, 3, 25, 10], n: 7, ma: [2027, 4, 1, 10, 0], godz: 7 * 24 - 1 },
      { od: [2027, 10, 28, 10], n: 7, ma: [2027, 11, 4, 10, 0], godz: 7 * 24 + 1 },
      { od: [2027, 3, 27, 21], n: 1, ma: [2027, 3, 28, 21, 0], godz: 23 },
      { od: [2027, 10, 30, 21], n: 1, ma: [2027, 10, 31, 21, 0], godz: 25 },
      { od: [2027, 3, 30, 10], n: -3, ma: [2027, 3, 27, 10, 0], godz: -(3 * 24 - 1) },
      // 02:30 w dniu przestawienia zegara nie istnieje: pierwsza istniejąca chwila po luce (03:30)
      { od: [2027, 3, 27, 2], n: 1, ma: [2027, 3, 28, 3, 0], godz: null },
    ],
    // chwile z RD-29 (z przesunięciem) → data lokalna
    daty: [
      ['2026-10-21T23:59:00+02:00', '2026-10-21'],
      ['2026-10-22T00:00:00+02:00', '2026-10-22'],
      ['2026-10-22T00:01:00+02:00', '2026-10-22'],
      ['2026-10-25T07:00:00+01:00', '2026-10-25'],
      ['2027-03-28T03:30:00+02:00', '2027-03-28'],
      ['2027-10-31T02:30:00+01:00', '2027-10-31'],
    ],
    // dzień zmiany czasu i dzień następny: północ do północy trwa 23 / 25 h
    dlugosc: [
      { dzien: [2027, 3, 28], godz: 23 },
      { dzien: [2027, 10, 31], godz: 25 },
    ],
    // [dzień, pierwszy dzień tygodnia, oczekiwany początek tygodnia]
    tygodnie: [
      { dzien: [2026, 10, 22], pierwszy: 1, ma: [2026, 10, 19] },
      { dzien: [2026, 10, 22], pierwszy: 0, ma: [2026, 10, 18] },
      { dzien: [2026, 10, 25], pierwszy: 1, ma: [2026, 10, 19] },
      { dzien: [2026, 10, 26], pierwszy: 1, ma: [2026, 10, 26] },
      { dzien: [2027, 3, 28], pierwszy: 1, ma: [2027, 3, 22] },
      { dzien: [2027, 3, 28], pierwszy: 0, ma: [2027, 3, 28] },
      { dzien: [2027, 10, 31], pierwszy: 6, ma: [2027, 10, 30] },
    ],
    // tydzień przez zmianę czasu: poniedziałek 2027-03-22 → niedziela 2027-03-28, potem 2027-03-29
    tydzienDni: { poniedzialek: [2027, 3, 22], dni: [22, 23, 24, 25, 26, 27, 28], nastepny: [2027, 3, 29] },
    // numer dnia do kalendarza: [od (z godz), do (z godz), różnica dni kalendarza]
    roznice: [
      { od: [2027, 3, 27, 21, 0], do: [2027, 3, 28, 8, 0], dni: 1 },
      { od: [2027, 3, 28, 0, 30], do: [2027, 3, 29, 0, 10], dni: 1 },
      { od: [2027, 10, 30, 21, 0], do: [2027, 10, 31, 8, 0], dni: 1 },
      { od: [2027, 10, 31, 0, 30], do: [2027, 11, 1, 0, 10], dni: 1 },
      { od: [2027, 3, 21, 8, 0], do: [2027, 3, 28, 8, 0], dni: 7 },
      { od: [2027, 3, 28, 8, 0], do: [2027, 3, 21, 8, 0], dni: -7 },
      { od: [2027, 3, 28, 9, 0], do: [2027, 3, 28, 1, 0], dni: 0 },
    ],
    // chwila docelowa: dzień zmiany czasu, 02:30 → 03:30 (D-13)
    luka: { dzien: [2027, 3, 27, 12], offset: 1, godz: 2, min: 30, ma: [2027, 3, 28, 3, 30] },
    bezLuki: { dzien: [2027, 3, 27, 12], offset: 1, godz: 8, min: 15, ma: [2027, 3, 28, 8, 15] },
  },
  {
    strefa: 'America/New_York',
    dodawanie: [
      { od: [2027, 3, 11, 10], n: 7, ma: [2027, 3, 18, 10, 0], godz: 7 * 24 - 1 },
      { od: [2027, 11, 4, 10], n: 7, ma: [2027, 11, 11, 10, 0], godz: 7 * 24 + 1 },
      { od: [2027, 3, 13, 21], n: 1, ma: [2027, 3, 14, 21, 0], godz: 23 },
      { od: [2027, 11, 6, 21], n: 1, ma: [2027, 11, 7, 21, 0], godz: 25 },
      { od: [2027, 3, 16, 10], n: -3, ma: [2027, 3, 13, 10, 0], godz: -(3 * 24 - 1) },
      { od: [2027, 3, 13, 2], n: 1, ma: [2027, 3, 14, 3, 0], godz: null },
    ],
    daty: [
      // RD-29-W5: 22:30 EDT = 02:30 UTC następnego dnia, w Warszawie 00:30 dnia 23
      ['2026-10-22T22:30:00-04:00', '2026-10-22'],
      ['2026-10-23T02:30:00Z', '2026-10-22'],
      ['2027-03-14T03:30:00-04:00', '2027-03-14'],
      ['2027-11-07T01:30:00-04:00', '2027-11-07'],
      ['2027-11-07T01:30:00-05:00', '2027-11-07'],
    ],
    dlugosc: [
      { dzien: [2027, 3, 14], godz: 23 },
      { dzien: [2027, 11, 7], godz: 25 },
    ],
    tygodnie: [
      { dzien: [2026, 10, 22], pierwszy: 0, ma: [2026, 10, 18] },
      { dzien: [2026, 10, 22], pierwszy: 1, ma: [2026, 10, 19] },
      // RD-30-W6: niedziela ze zmianą czasu w USA (2026-11-01), tydzień od niedzieli
      { dzien: [2026, 11, 1], pierwszy: 0, ma: [2026, 11, 1] },
      { dzien: [2027, 3, 14], pierwszy: 0, ma: [2027, 3, 14] },
      { dzien: [2027, 3, 14], pierwszy: 1, ma: [2027, 3, 8] },
      { dzien: [2027, 11, 7], pierwszy: 0, ma: [2027, 11, 7] },
    ],
    tydzienDni: { poniedzialek: [2027, 3, 8], dni: [8, 9, 10, 11, 12, 13, 14], nastepny: [2027, 3, 15] },
    roznice: [
      { od: [2027, 3, 13, 21, 0], do: [2027, 3, 14, 8, 0], dni: 1 },
      { od: [2027, 3, 14, 0, 30], do: [2027, 3, 15, 0, 10], dni: 1 },
      { od: [2027, 11, 6, 21, 0], do: [2027, 11, 7, 8, 0], dni: 1 },
      { od: [2027, 11, 7, 0, 30], do: [2027, 11, 8, 0, 10], dni: 1 },
      { od: [2027, 3, 7, 8, 0], do: [2027, 3, 14, 8, 0], dni: 7 },
      { od: [2027, 3, 14, 8, 0], do: [2027, 3, 7, 8, 0], dni: -7 },
    ],
    luka: { dzien: [2027, 3, 13, 12], offset: 1, godz: 2, min: 30, ma: [2027, 3, 14, 3, 30] },
    bezLuki: { dzien: [2027, 3, 13, 12], offset: 1, godz: 8, min: 15, ma: [2027, 3, 14, 8, 15] },
  },
])('dzień lokalny w $strefa', ({ strefa, dodawanie, daty, dlugosc, tygodnie, tydzienDni, roznice, luka, bezLuki }) => {
  wStrefie(strefa);

  it.each(dodawanie)('addCalendarDays: $od + $n dni = ta sama godzina ścienna, nie N × 24 h', ({ od, n, ma, godz }) => {
    const start = lok(od[0], od[1], od[2], od[3]);
    const wynik = addCalendarDays(start, n);
    expect(sciana(wynik)).toEqual([...ma]);
    if (godz !== null) expect(wynik - start).toBe(godz * H);
  });

  it('addCalendarDays: 0 dni zwraca tę samą chwilę, sekundy i milisekundy zostają', () => {
    const start = lok(2027, 3, 27, 10, 15) + 12_345;
    expect(addCalendarDays(start, 0)).toBe(start);
    expect(addCalendarDays(start, 1) % 60_000).toBe(12_345);
  });

  it.each(daty)('localDateKey(%s) = %s (RD-29)', (iso, klucz) => {
    expect(localDateKey(Date.parse(iso))).toBe(klucz);
  });

  it.each(dlugosc)('startOfLocalDay: północ → północ trwa $godz h w dniu zmiany czasu $dzien', ({ dzien, godz }) => {
    const poludnie = lok(dzien[0], dzien[1], dzien[2], 12);
    const poczatek = startOfLocalDay(poludnie);
    expect(sciana(poczatek)).toEqual([dzien[0], dzien[1], dzien[2], 0, 0]);
    const nastepny = startOfLocalDay(addCalendarDays(poludnie, 1));
    expect(nastepny - poczatek).toBe(godz * H);
    // druga połowa doby i ostatnia minuta należą do tego samego dnia
    expect(startOfLocalDay(nastepny - 60_000)).toBe(poczatek);
  });

  it.each(roznice)('calendarDayDiff: $od → $do = $dni dni kalendarza', ({ od, do: koniec, dni }) => {
    expect(calendarDayDiff(lok(od[0], od[1], od[2], od[3], od[4]), lok(koniec[0], koniec[1], koniec[2], koniec[3], koniec[4]))).toBe(dni);
  });

  it.each(tygodnie)('weekStart: $dzien, pierwszy dzień tygodnia $pierwszy → $ma (RD-30)', ({ dzien, pierwszy, ma }) => {
    const wynik = weekStart(lok(dzien[0], dzien[1], dzien[2], 15, 20), pierwszy as 0 | 1 | 6);
    expect(sciana(wynik)).toEqual([ma[0], ma[1], ma[2], 0, 0]);
  });

  it('daysOfWeek: siedem północy lokalnych, następny tydzień od 00:00 (7 × 24 h dałoby 23:00 / 01:00)', () => {
    const pon = lok(tydzienDni.poniedzialek[0], tydzienDni.poniedzialek[1], tydzienDni.poniedzialek[2]);
    const dni = daysOfWeek(lok(tydzienDni.poniedzialek[0], tydzienDni.poniedzialek[1], tydzienDni.poniedzialek[2], 18), 1);
    expect(dni).toHaveLength(7);
    expect(dni.map((d) => sciana(d))).toEqual(tydzienDni.dni.map((d) => [tydzienDni.poniedzialek[0], tydzienDni.poniedzialek[1], d, 0, 0]));
    expect(dni[0]).toBe(pon);
    const nast = addCalendarDays(dni[6], 1);
    expect(sciana(nast)).toEqual([tydzienDni.nastepny[0], tydzienDni.nastepny[1], tydzienDni.nastepny[2], 0, 0]);
    expect(daysOfWeek(nast, 1)[0]).toBe(nast);
  });

  it('atLocalTime: dzień zmiany czasu, 02:30 nie istnieje → 03:30 i znacznik przesunięcia (D-13)', () => {
    const wynik = atLocalTime(lok(luka.dzien[0], luka.dzien[1], luka.dzien[2], luka.dzien[3]), luka.offset, luka.godz, luka.min);
    expect(sciana(wynik.ms)).toEqual(luka.ma);
    expect(wynik.shifted).toBe(true);
  });

  it('atLocalTime: zwykła godzina w dniu zmiany czasu jest dokładnie ta, bez znacznika', () => {
    const wynik = atLocalTime(lok(bezLuki.dzien[0], bezLuki.dzien[1], bezLuki.dzien[2], bezLuki.dzien[3]), bezLuki.offset, bezLuki.godz, bezLuki.min);
    expect(sciana(wynik.ms)).toEqual(bezLuki.ma);
    expect(wynik.shifted).toBe(false);
  });
});

describe('resolveFirstWeekday: ustawienie telefonu, zapas z regionu (CLDR 48 weekData.firstDay)', () => {
  it('ustawienie telefonu wygrywa: 1 = niedziela, 2 = poniedziałek, 7 = sobota (expo-localization)', () => {
    expect(resolveFirstWeekday(1, 'PL')).toBe(0);
    expect(resolveFirstWeekday(2, 'US')).toBe(1);
    expect(resolveFirstWeekday(7, 'PL')).toBe(6);
    expect(resolveFirstWeekday(6, null)).toBe(5);
  });

  it('puste albo niepoprawne ustawienie: region (PL poniedziałek, US niedziela, EG sobota, MV piątek, JP niedziela, GB poniedziałek)', () => {
    expect(resolveFirstWeekday(null, 'PL')).toBe(1);
    expect(resolveFirstWeekday(undefined, 'US')).toBe(0);
    expect(resolveFirstWeekday(null, 'us')).toBe(0);
    expect(resolveFirstWeekday(null, 'EG')).toBe(6);
    expect(resolveFirstWeekday(null, 'MV')).toBe(5);
    expect(resolveFirstWeekday(null, 'JP')).toBe(0);
    expect(resolveFirstWeekday(null, 'GB')).toBe(1);
    expect(resolveFirstWeekday(0, 'US')).toBe(0);
    expect(resolveFirstWeekday(8, 'PL')).toBe(1);
    expect(resolveFirstWeekday(1.5, 'US')).toBe(0);
    expect(resolveFirstWeekday(Number.NaN, 'PL')).toBe(1);
  });

  it('brak regionu albo region spoza tabeli: poniedziałek (RD-30-W7)', () => {
    expect(resolveFirstWeekday(null, null)).toBe(1);
    expect(resolveFirstWeekday(undefined, undefined)).toBe(1);
    expect(resolveFirstWeekday(null, '')).toBe(1);
    expect(resolveFirstWeekday(null, 'ZZ')).toBe(1);
  });
});
