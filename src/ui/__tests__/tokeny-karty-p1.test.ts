// [M3 p1] Tokeny systemu kart (D-141, design-spec §14, docs/design/karty/README.md §2):
// promienie.karta = 16 i kolor kartaLinia w czterech wariantach, w obu źródłach (tokeny.json i src/ui/tokeny.ts)
// oraz w motywie ekranów. Wartości kartaLinia pochodzą z docs/design/karty/tokeny-karty.json.
import * as fs from 'fs';
import * as path from 'path';
import { kolory, promienie } from '../tokeny';
import { theme } from '../theme';

const katalog = path.join(__dirname, '../../../docs/design');
const zrodlo = JSON.parse(fs.readFileSync(path.join(katalog, 'tokeny.json'), 'utf8'));
const propozycja = JSON.parse(fs.readFileSync(path.join(katalog, 'karty/tokeny-karty.json'), 'utf8'));
const WARIANTY = ['jasny', 'ciemny', 'jasnyKontrast', 'ciemnyKontrast'] as const;
const POLE: Record<(typeof WARIANTY)[number], string> = {
  jasny: 'light',
  ciemny: 'dark',
  jasnyKontrast: 'highContrastLight',
  ciemnyKontrast: 'highContrastDark',
};

describe('[M3 p1] promienie.karta', () => {
  it('src/ui/tokeny.ts: 16 (propozycja tokeny-karty.json)', () => {
    expect(promienie.karta).toBe(16);
    expect(promienie.karta).toBe(propozycja.promienie.karta);
  });

  it('docs/design/tokeny.json: ta sama wartość', () => {
    expect(zrodlo.promienie.karta).toBe(16);
  });

  it('hierarchia promieni z README §2: pas > przyciskGlowny > karta > przycisk > grupa > pole > znacznik', () => {
    const kolejnosc = [promienie.pas, promienie.przyciskGlowny, promienie.karta, promienie.przycisk, promienie.grupa, promienie.pole, promienie.znacznik];
    expect(kolejnosc).toEqual([26, 18, 16, 14, 12, 10, 6]);
    expect([...kolejnosc].sort((a, b) => b - a)).toEqual(kolejnosc);
  });
});

describe('[M3 p1] kolor kartaLinia', () => {
  it.each(WARIANTY)('%s: wartość z tokeny-karty.json w tokeny.json i src/ui/tokeny.ts', (w) => {
    const oczekiwany = propozycja.kolory[w].kartaLinia;
    expect(oczekiwany).toMatch(/^#[0-9A-F]{6}$/);
    expect(zrodlo.kolory[w].kartaLinia).toBe(oczekiwany);
    expect(Reflect.get(kolory[w], 'kartaLinia')).toBe(oczekiwany);
  });

  it('ciemny: obwódka karty równa powierzchni, czyli niewidoczna (README §2)', () => {
    expect(kolory.ciemny.kartaLinia).toBe(kolory.ciemny.powierzchnia);
  });

  it('jasny: 1 px #E2E2DC na białej karcie (README §2)', () => {
    expect(kolory.jasny.kartaLinia).toBe('#E2E2DC');
    expect(kolory.jasny.powierzchnia).toBe('#FFFFFF');
  });

  it.each(WARIANTY)('%s: motyw ekranów (theme.colors.kartaLinia) wskazuje token', (w) => {
    const kolor: unknown = Reflect.get(theme.colors, 'kartaLinia');
    expect(typeof kolor === 'object' && kolor !== null && 'dynamic' in kolor).toBe(true);
    const dyn: unknown = typeof kolor === 'object' && kolor !== null ? Reflect.get(kolor, 'dynamic') : undefined;
    expect(typeof dyn === 'object' && dyn !== null ? Reflect.get(dyn, POLE[w]) : undefined).toBe(zrodlo.kolory[w].kartaLinia);
  });
});
