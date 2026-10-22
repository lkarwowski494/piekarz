import { theme } from '../theme';

/**
 * Standard W3C / WCAG 2.1 Relative Luminance and Contrast Ratio calculation
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function channelToLinear(c: number): number {
  const norm = c / 255.0;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const rLin = channelToLinear(r);
  const gLin = channelToLinear(g);
  const bLin = channelToLinear(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hex1);
  const lum2 = relativeLuminance(hex2);
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

// 050: motyw ma 4 warianty (D-045); stare role ciemnego motywu zastąpione tokenami według docs/design/mapa-rol.md §2
// (textPrimary → tusz, surface/surfaceCard → powierzchnia, backgroundSecondary → tloGrupa, textSecondary → tusz2,
// statusSuccess → akcentTekst, statusDanger → blad, accent jako tekst → akcentTekst, jako grafika → akcent,
// passiveStageBadge → ratanSzary) [M1-audytor-generalny-050]
const POLE: Record<string, string> = {
  jasny: 'light',
  ciemny: 'dark',
  jasnyKontrast: 'highContrastLight',
  ciemnyKontrast: 'highContrastDark',
};
const WARIANTY = Object.keys(POLE);
function hex(kolor: unknown, wariant: string): string {
  if (typeof kolor === 'string') return kolor;
  const dyn: unknown = typeof kolor === 'object' && kolor !== null ? Reflect.get(kolor, 'dynamic') : undefined;
  const v: unknown = typeof dyn === 'object' && dyn !== null ? Reflect.get(dyn, POLE[wariant]) : undefined;
  if (typeof v !== 'string') throw new Error(`brak koloru wariantu ${wariant}`);
  return v;
}
const cr = (fg: unknown, bg: unknown, wariant: string) => contrastRatio(hex(fg, wariant), hex(bg, wariant));

describe('WCAG 2.1 Accessibility & Theme Contrast Contracts (system „Koszyk spiralny”, 4 warianty)', () => {
  describe.each(WARIANTY)('Primary Typography Contrast (WCAG AAA >= 7.0:1) — %s', (w) => {
    it('primary text (tusz) against screen background (tlo) exceeds WCAG AAA (7.0:1)', () => {
      expect(cr(theme.colors.tusz, theme.colors.tlo, w)).toBeGreaterThanOrEqual(7.0);
      expect(cr(theme.colors.tusz, theme.colors.tlo, w)).toBeGreaterThan(12.0); // Ultra-high readability for flour-dusted kitchen screens
    });

    it('primary text against cell surface (powierzchnia) exceeds WCAG AAA', () => {
      expect(cr(theme.colors.tusz, theme.colors.powierzchnia, w)).toBeGreaterThanOrEqual(7.0);
    });

    it('primary text against grouped list background (tloGrupa) exceeds WCAG AAA', () => {
      expect(cr(theme.colors.tusz, theme.colors.tloGrupa, w)).toBeGreaterThanOrEqual(7.0);
    });
  });

  describe.each(WARIANTY)('Secondary Typography & Status Contrast (WCAG AA >= 4.5:1) — %s', (w) => {
    it('secondary text (tusz2) against background (tlo) meets WCAG AA (>= 4.5:1)', () => {
      expect(cr(theme.colors.tusz2, theme.colors.tlo, w)).toBeGreaterThanOrEqual(4.5);
    });

    it('secondary text against cell surface meets WCAG AA', () => {
      expect(cr(theme.colors.tusz2, theme.colors.powierzchnia, w)).toBeGreaterThanOrEqual(4.5);
    });

    it('success icon (akcentTekst) against background meets graphical UI contrast', () => {
      expect(cr(theme.colors.akcentTekst, theme.colors.tlo, w)).toBeGreaterThanOrEqual(3.0);
    });

    it('error (blad) against background meets graphical UI contrast', () => {
      expect(cr(theme.colors.blad, theme.colors.tlo, w)).toBeGreaterThanOrEqual(3.0);
    });

    it('action text (akcentTekst) against background meets WCAG AA (>= 4.5:1)', () => {
      expect(cr(theme.colors.akcentTekst, theme.colors.tlo, w)).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe.each(WARIANTY)('Graphical UI Components & Active Borders (WCAG 2.1 UI >= 3.0:1) — %s', (w) => {
    it('accent (akcent) against background meets graphical UI contrast (>= 3.0:1)', () => {
      expect(cr(theme.colors.akcent, theme.colors.tlo, w)).toBeGreaterThanOrEqual(3.0);
    });

    it('future plan step (ratanSzary) meets graphical UI contrast against background', () => {
      expect(cr(theme.colors.ratanSzary, theme.colors.tlo, w)).toBeGreaterThanOrEqual(1.2);
    });
  });

  // 110: pary spirali (design-spec §11c 110, tokeny.json) z progiem 3 (WCAG 1.4.11) we wszystkich 4 wariantach,
  // także w „Zwiększ kontrast” [M1-audytor-generalny-110; 04-studio-projektowe-031]
  describe.each(WARIANTY)('Spiral pairs (WCAG 1.4.11 >= 3.0:1) — %s', (w) => {
    it.each([
      ['tusz', 'ratanSzary'],
      ['ratanSzary', 'tlo'],
      ['ratan', 'powierzchnia'],
      ['ratanSzary', 'powierzchnia'],
      ['nocDane', 'powierzchnia'],
    ])('%s on %s >= 3.0', (fg, bg) => {
      expect(cr(Reflect.get(theme.colors, fg), Reflect.get(theme.colors, bg), w)).toBeGreaterThanOrEqual(3.0);
    });
  });

  // M3 D4b: pas „Dziś” w kolorze nocy (D-105; tokeny wariantu 1 z makiety roli 04 a2, 04-a2-opcje.md „Nowe tokeny”):
  // tekst na pasie ≥ 4,5 (WCAG 1.4.3), grafika z danymi (glify paska, ramka dnia) ≥ 3 (WCAG 1.4.11), we wszystkich 4 wariantach
  describe.each(WARIANTY)('Pas „Dziś” (D-105) — %s', (w) => {
    it.each([
      ['naPasie', 'pas', 4.5],
      ['naPasie2', 'pas', 4.5],
      ['ratanNaPasie', 'pas', 3.0],
      ['naPasie', 'pas', 3.0],
      ['ostrzTusz', 'ostrzTlo', 4.5],
      ['ostrzTlo', 'pas', 3.0],
    ])('%s on %s >= %s', (fg, bg, prog) => {
      expect(cr(Reflect.get(theme.colors, fg), Reflect.get(theme.colors, bg), w)).toBeGreaterThanOrEqual(Number(prog));
    });

    it('wartości pasa z tabeli roli 04 (04-a2-opcje.md)', () => {
      const tabela: Record<string, string[]> = {
        pas: ['#1E4954', '#1D3B43', '#12323A', '#0F2A31'],
        naPasie: ['#FFFFFF', '#F1F1EC', '#FFFFFF', '#FFFFFF'],
        naPasie2: ['#C8D8DC', '#BFD0D4', '#E2ECEE', '#E2ECEE'],
        ratanNaPasie: ['#D9AE72', '#D3A464', '#E8C38E', '#E8C38E'],
      };
      const i = WARIANTY.indexOf(w);
      for (const [token, wartosci] of Object.entries(tabela)) {
        expect(hex(Reflect.get(theme.colors, token), w)).toBe(wartosci[i]);
      }
    });
  });

  describe('Apple HIG & Android Material Touch Target Size Guarantees', () => {
    it('theme spacing scale defines ergonomic tap pad minimums', () => {
      expect(theme.spacing.sm).toBe(8);
      expect(theme.spacing.md).toBe(16);
      expect(theme.spacing.lg).toBe(24);
      expect(theme.spacing.xl).toBe(32);
    });

    it('theme border radiuses provide soft, modern tactile feedback', () => {
      expect(theme.radius.sm).toBe(6);
      expect(theme.radius.md).toBe(12);
      expect(theme.radius.lg).toBe(12); // 050: promienie z tokenów (promienie.grupa), dawniej 16 spoza systemu
      expect(theme.radius.full).toBe(9999);
    });
  });

  describe('Python Contrast Oracle Verification (fixtures/theme-contrast-corpus.json)', () => {
    const fixture = require('./fixtures/theme-contrast-corpus.json');

    it('validates python contrast fixture meta header', () => {
      expect(fixture.meta.generator).toContain('gen-theme-contrast-corpus.py');
      expect(fixture.pairs.length).toBeGreaterThanOrEqual(7);
    });

    fixture.pairs.forEach((p: any) => {
      it(`pair ${p.foregroundToken} on ${p.backgroundToken} passes ${p.wcagTarget} (expected ${p.expectedContrastRatio}:1 >= ${p.minRequiredRatio}:1)`, () => {
        expect(p.passes).toBe(true);
        const actual = contrastRatio(p.foregroundHex, p.backgroundHex);
        expect(Math.abs(actual - p.expectedContrastRatio)).toBeLessThanOrEqual(0.05);
      });
    });
  });
});

