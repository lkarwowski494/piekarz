/**
 * N1 (weryfikacja poprawek W, M3 W-fix3): „+2 godziny” / „-2 godziny” zmieniają godzinę „gotowe” dokładnie o 120 min,
 * bez zaokrąglania do parzystej pełnej godziny; ±30 min zostaje przy pełnej albo połówkowej godzinie (128). Przejście
 * przez północ zmienia dzień, a poza zasięgiem dni planu (0 = dziś … ZASIEG_DNI_PLANU, D-108) zmiany nie ma (null:
 * przycisk nieaktywny).
 */
import { przesunGotowe } from '../godzina-gotowe';
import { ZASIEG_DNI_PLANU } from '../../core/kalendarz-config';

const c = (dayOffset: number, hour: number, minute: number) => ({ dayOffset, hour, minute });

describe('N1: przesunGotowe', () => {
  it.each([
    ['9:00 +2 h → 11:00', c(2, 9, 0), 120, c(2, 11, 0)],
    ['7:00 +2 h → 9:00', c(2, 7, 0), 120, c(2, 9, 0)],
    ['10:30 +2 h → 12:30', c(2, 10, 30), 120, c(2, 12, 30)],
    ['10:30 -2 h → 8:30', c(2, 10, 30), -120, c(2, 8, 30)],
    ['10:00 +2 h → 12:00', c(1, 10, 0), 120, c(1, 12, 0)],
    ['9:45 -2 h → 7:45 (minuty z planu zostają)', c(1, 9, 45), -120, c(1, 7, 45)],
  ])('±2 h dokładnie o 120 min: %s', (_n, cel, delta, wynik) => {
    expect(przesunGotowe(cel, delta)).toEqual(wynik);
  });

  it.each([
    ['10:00 +30 → 10:30', c(1, 10, 0), 30, c(1, 10, 30)],
    ['10:15 +30 → 10:30', c(1, 10, 15), 30, c(1, 10, 30)],
    ['10:15 -30 → 10:00', c(1, 10, 15), -30, c(1, 10, 0)],
    ['9:45 -30 → 9:30', c(1, 9, 45), -30, c(1, 9, 30)],
  ])('±30 min do pełnej albo połówkowej godziny jak dotąd: %s', (_n, cel, delta, wynik) => {
    expect(przesunGotowe(cel, delta)).toEqual(wynik);
  });

  it.each([
    ['22:00 +2 h → 0:00 dnia następnego', c(2, 22, 0), 120, c(3, 0, 0)],
    ['23:30 +2 h → 1:30 dnia następnego', c(1, 23, 30), 120, c(2, 1, 30)],
    ['1:00 -2 h → 23:00 dnia poprzedniego', c(3, 1, 0), -120, c(2, 23, 0)],
    ['23:50 +30 → 0:00 dnia następnego', c(1, 23, 50), 30, c(2, 0, 0)],
    ['0:00 -30 → 23:30 dnia poprzedniego', c(1, 0, 0), -30, c(0, 23, 30)],
  ])('północ zmienia dzień: %s', (_n, cel, delta, wynik) => {
    expect(przesunGotowe(cel, delta)).toEqual(wynik);
  });

  it('poza zasięgiem dni planu: brak zmiany (przed dziś i po ostatnim dniu planu)', () => {
    expect(przesunGotowe(c(0, 1, 0), -120)).toBeNull();
    expect(przesunGotowe(c(0, 0, 0), -30)).toBeNull();
    expect(przesunGotowe(c(ZASIEG_DNI_PLANU, 23, 0), 120)).toBeNull();
    expect(przesunGotowe(c(ZASIEG_DNI_PLANU, 23, 30), 30)).toBeNull();
    // Na granicy, ale w tym samym dniu: zmiana jest
    expect(przesunGotowe(c(ZASIEG_DNI_PLANU, 21, 0), 120)).toEqual(c(ZASIEG_DNI_PLANU, 23, 0));
    expect(przesunGotowe(c(0, 2, 0), -120)).toEqual(c(0, 0, 0));
  });
});
