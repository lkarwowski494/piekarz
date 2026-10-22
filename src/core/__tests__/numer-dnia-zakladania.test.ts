/**
 * Numer dnia zakładania zakwasu dniami kalendarza (RD-31, decyzja właściciela 2026-10-22, D-093) [M3 D0]:
 * N = różnica dni kalendarza (dzień lokalny, RD-29) + 1; „teraz” przed startem → 1. Dzień 1 = dzień założenia.
 * Wektory RD-31-W1…W6 od roli 01 (Europe/Warsaw, 2026) oraz dni zmiany czasu w dwóch strefach.
 */
import { setupDay } from '../starter-log';
import { wStrefie } from './helpers/strefa';

const lok = (y: number, m: number, d: number, h: number, min = 0) => new Date(y, m - 1, d, h, min).getTime();

describe('RD-31: numer dnia zakładania w Europe/Warsaw (wektory roli 01)', () => {
  wStrefie('Europe/Warsaw');

  it.each([
    ['W1: start 20.10 21:00, teraz 20.10 23:59', lok(2026, 10, 20, 21), lok(2026, 10, 20, 23, 59), 1],
    ['W2: start 20.10 21:00, teraz 21.10 00:00', lok(2026, 10, 20, 21), lok(2026, 10, 21, 0), 2],
    ['W3: start 20.10 21:00, teraz 21.10 20:59', lok(2026, 10, 20, 21), lok(2026, 10, 21, 20, 59), 2],
    ['W4: start 24.10 22:00, teraz 25.10 23:30 (zmiana czasu)', lok(2026, 10, 24, 22), lok(2026, 10, 25, 23, 30), 2],
    ['W5: start 20.10 08:00, teraz 26.10 07:00', lok(2026, 10, 20, 8), lok(2026, 10, 26, 7), 7],
    ['W6: teraz przed startem', lok(2026, 10, 20, 8), lok(2026, 10, 19, 8), 1],
  ])('%s → %i', (_nazwa, start, teraz, oczekiwany) => {
    expect(setupDay(start, teraz)).toBe(oczekiwany);
  });

  it('start wtorek 21:00: wtorek = dzień 1, środa 08:00 = dzień 2 (21.10.2026 to środa)', () => {
    expect(setupDay(lok(2026, 10, 20, 21), lok(2026, 10, 20, 21))).toBe(1);
    expect(setupDay(lok(2026, 10, 20, 21), lok(2026, 10, 21, 8))).toBe(2);
  });

  it('przez wiosenną zmianę czasu (2027-03-28, doba 23 h): start 27.03 21:00, teraz 28.03 08:00 = dzień 2; 29.03 00:10 = dzień 3', () => {
    expect(setupDay(lok(2027, 3, 27, 21), lok(2027, 3, 28, 8))).toBe(2);
    expect(setupDay(lok(2027, 3, 27, 21), lok(2027, 3, 29, 0, 10))).toBe(3);
    // start tuż po północy, teraz tuż przed następną: 23 h to wciąż ten sam dzień 1
    expect(setupDay(lok(2027, 3, 28, 0, 30), lok(2027, 3, 28, 23, 50))).toBe(1);
  });

  it('przez jesienną zmianę czasu (2027-10-31, doba 25 h): dzień 2 od północy, nie po 24 h', () => {
    expect(setupDay(lok(2027, 10, 31, 0, 30), lok(2027, 10, 31, 23, 50))).toBe(1);
    expect(setupDay(lok(2027, 10, 31, 0, 30), lok(2027, 11, 1, 0, 10))).toBe(2);
  });
});

describe('RD-31: numer dnia zakładania w America/New_York', () => {
  wStrefie('America/New_York');

  it('wiosna 2027-03-14 (doba 23 h) i jesień 2027-11-07 (doba 25 h)', () => {
    expect(setupDay(lok(2027, 3, 13, 21), lok(2027, 3, 14, 8))).toBe(2);
    expect(setupDay(lok(2027, 3, 14, 0, 30), lok(2027, 3, 14, 23, 50))).toBe(1);
    expect(setupDay(lok(2027, 11, 7, 0, 30), lok(2027, 11, 7, 23, 50))).toBe(1);
    expect(setupDay(lok(2027, 11, 7, 0, 30), lok(2027, 11, 8, 0, 10))).toBe(2);
    expect(setupDay(lok(2027, 11, 6, 21), lok(2027, 11, 7, 8))).toBe(2);
  });
});
