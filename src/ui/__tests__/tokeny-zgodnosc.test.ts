// Zgodność modułu src/ui/tokeny.ts z jedynym źródłem docs/design/tokeny.json (rola 04, D-046).
// Moduł jest kopią wygenerowanego docs/design/tokeny.ts; test pilnuje, żeby się nie rozjechał.
import * as fs from 'fs';
import * as path from 'path';
import { kolory, typografia, odstepy, promienie, cele, ruch, haptyka } from '../tokeny';

const zrodlo = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../docs/design/tokeny.json'), 'utf8'),
);

describe('src/ui/tokeny.ts zgodny z docs/design/tokeny.json', () => {
  it('kolory: te same cztery warianty i te same wartości', () => {
    expect(Object.keys(kolory).sort()).toEqual(
      ['ciemny', 'ciemnyKontrast', 'jasny', 'jasnyKontrast'],
    );
    expect(kolory).toEqual(zrodlo.kolory);
  });

  it('każdy wariant ma ten sam zestaw kluczy kolorów', () => {
    const klucze = Object.keys(kolory.jasny).sort();
    for (const wariant of Object.values(kolory)) {
      expect(Object.keys(wariant).sort()).toEqual(klucze);
    }
  });

  it('odstępy, promienie i cele dotykowe', () => {
    expect(odstepy).toEqual(zrodlo.odstepy);
    expect(promienie).toEqual(zrodlo.promienie);
    expect(cele).toEqual(zrodlo.cele);
  });

  it('typografia', () => {
    expect(typografia).toEqual(zrodlo.typografia);
  });

  it('ruch i haptyka', () => {
    expect(ruch).toEqual(zrodlo.ruch);
    expect(haptyka).toEqual(zrodlo.haptyka);
  });
});
