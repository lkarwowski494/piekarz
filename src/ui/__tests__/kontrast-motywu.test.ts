// 050: kontrast par z tokeny.json we wszystkich 4 wariantach i motyw ekranów zbudowany z tych tokenów
// (mapa-rol.md §3, test akceptacyjny 050 pkt 2; wzory jak docs/design/narzedzia/tokeny.mjs, WCAG 2.2 1.4.3 i 1.4.11)
// [M1-audytor-generalny-050; 04-studio-projektowe-002, 04-studio-projektowe-003, 04-studio-projektowe-016, 08-programista-019]
import * as fs from 'fs';
import * as path from 'path';
import { theme } from '../theme';

const zrodlo = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../docs/design/tokeny.json'), 'utf8'));
const warianty: string[] = Object.keys(zrodlo.kolory);
const pary: [string, string, number, string][] = zrodlo.pary;
const klucze: string[] = Object.keys(zrodlo.kolory.jasny);

const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const kontrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** Kolor motywu w danym wariancie: DynamicColorIOS daje { dynamic: { light, dark, highContrastLight, highContrastDark } }. */
const POLE_WARIANTU: Record<string, string> = {
  jasny: 'light',
  ciemny: 'dark',
  jasnyKontrast: 'highContrastLight',
  ciemnyKontrast: 'highContrastDark',
};
function kolorWWariancie(klucz: string, wariant: string): unknown {
  const kolor: unknown = Reflect.get(theme.colors, klucz);
  if (typeof kolor === 'object' && kolor !== null && 'dynamic' in kolor) {
    const dyn: unknown = Reflect.get(kolor, 'dynamic');
    return typeof dyn === 'object' && dyn !== null ? Reflect.get(dyn, POLE_WARIANTU[wariant]) : undefined;
  }
  return kolor;
}

describe('050: kontrast tokenów (4 warianty × pary z tokeny.json)', () => {
  it('źródło ma 4 warianty i co najmniej 27 par', () => {
    expect(warianty.sort()).toEqual(['ciemny', 'ciemnyKontrast', 'jasny', 'jasnyKontrast']);
    expect(pary.length).toBeGreaterThanOrEqual(27);
  });

  for (const wariant of ['jasny', 'ciemny', 'jasnyKontrast', 'ciemnyKontrast']) {
    it.each(pary)(`${wariant}: %s na %s ≥ %s (%s)`, (fg, bg, prog) => {
      expect(kontrast(zrodlo.kolory[wariant][fg], zrodlo.kolory[wariant][bg])).toBeGreaterThanOrEqual(prog);
    });
  }
});

describe('050: motyw ekranów (theme.colors) to tokeny we wszystkich wariantach', () => {
  it('theme.colors ma dokładnie klucze tokenów (bez starych ról ciemnego motywu)', () => {
    expect(Object.keys(theme.colors).sort()).toEqual([...klucze].sort());
  });

  for (const wariant of ['jasny', 'ciemny', 'jasnyKontrast', 'ciemnyKontrast']) {
    it(`${wariant}: każdy kolor motywu równa się tokenowi`, () => {
      for (const k of klucze) expect(kolorWWariancie(k, wariant)).toBe(zrodlo.kolory[wariant][k]);
    });

    it.each(pary)(`${wariant}: motyw %s na %s ≥ %s`, (fg, bg, prog) => {
      const a = kolorWWariancie(fg, wariant);
      const b = kolorWWariancie(bg, wariant);
      expect(typeof a).toBe('string');
      expect(typeof b).toBe('string');
      expect(kontrast(String(a), String(b))).toBeGreaterThanOrEqual(prog);
    });
  }
});
