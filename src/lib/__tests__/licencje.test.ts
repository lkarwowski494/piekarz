/**
 * Z-08-1: src/lib/licencje.ts — identyfikatory SPDX z wyrażenia licencji i typ wyniku wczytania (WynikLicencji).
 */
import { identyfikatoryLicencji, wczytajLicencje, type WynikLicencji } from '../licencje';

describe('identyfikatoryLicencji (wyrażenia SPDX)', () => {
  it.each([
    ['MIT', ['MIT']],
    ['(MIT OR Apache-2.0)', ['MIT', 'Apache-2.0']],
    ['MIT AND Apache-2.0', ['MIT', 'Apache-2.0']],
    ['(BSD-3-Clause OR GPL-2.0)', ['BSD-3-Clause', 'GPL-2.0']],
    ['(MIT OR CC0-1.0)', ['MIT', 'CC0-1.0']],
    ['', []],
  ])('%s → %j', (wyrazenie, oczekiwane) => {
    expect(identyfikatoryLicencji(wyrazenie)).toEqual(oczekiwane);
  });
});

describe('WynikLicencji: błąd niesie opis, a brak pola nie jest uzupełniany', () => {
  it('pakiet bez notek (brak zostaje brakiem: tablica wymagana, nie zgadnięta)', () => {
    const w: WynikLicencji = wczytajLicencje({
      pakiety: [{ nazwa: 'a', wersja: '1.0.0', licencja: 'MIT' }],
      czcionki: [],
      natywne: [],
      teksty: {},
      bezTresci: [],
    });
    expect(w.ok).toBe(false);
    if (!w.ok) expect(w.blad).toMatch(/pakiety/);
  });

  it('NOTICE niebędący tekstem odrzucony', () => {
    const w = wczytajLicencje({
      pakiety: [{ nazwa: 'a', wersja: '1', licencja: 'Apache-2.0', notki: [], notice: 5 }],
      czcionki: [],
      natywne: [],
      teksty: {},
      bezTresci: [],
    });
    expect(w.ok).toBe(false);
  });
});
