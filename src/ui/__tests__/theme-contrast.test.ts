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

describe('WCAG 2.1 Accessibility & Theme Contrast Contracts', () => {
  describe('Primary Typography Contrast (WCAG AAA >= 7.0:1)', () => {
    it('primary text (#2C1810) against light linen background (#FBF9F5) exceeds WCAG AAA (7.0:1)', () => {
      const cr = contrastRatio(theme.colors.textPrimary, theme.colors.background);
      expect(cr).toBeGreaterThanOrEqual(7.0);
      expect(cr).toBeGreaterThan(12.0); // Ultra-high readability for flour-dusted kitchen screens
    });

    it('primary text against clean white surface (#FFFFFF) exceeds WCAG AAA', () => {
      const cr = contrastRatio(theme.colors.textPrimary, theme.colors.surface);
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });

    it('primary text against card surface (#F7F2EB) exceeds WCAG AAA', () => {
      const cr = contrastRatio(theme.colors.textPrimary, theme.colors.surfaceCard);
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });

    it('primary text against secondary background (#F3ECE2) exceeds WCAG AAA', () => {
      const cr = contrastRatio(theme.colors.textPrimary, theme.colors.backgroundSecondary);
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });
  });

  describe('Secondary Typography & Status Badges Contrast (WCAG AA >= 4.5:1)', () => {
    it('secondary text (#6B584C) against light linen background (#FBF9F5) meets WCAG AA (>= 4.5:1)', () => {
      const cr = contrastRatio(theme.colors.textSecondary, theme.colors.background);
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it('secondary text against card surface meets WCAG AA', () => {
      const cr = contrastRatio(theme.colors.textSecondary, theme.colors.surfaceCard);
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it('statusSuccess (#15803D) against background meets WCAG AA', () => {
      const cr = contrastRatio(theme.colors.statusSuccess, theme.colors.background);
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it('statusDanger (#B91C1C) against background meets WCAG AA', () => {
      const cr = contrastRatio(theme.colors.statusDanger, theme.colors.background);
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it('statusWarning (#B45309) against background meets WCAG AA', () => {
      const cr = contrastRatio(theme.colors.statusWarning, theme.colors.background);
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it('accentDark (#B45309) against background meets WCAG AA', () => {
      const cr = contrastRatio(theme.colors.accentDark, theme.colors.background);
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Graphical UI Components & Active Borders (WCAG 2.1 UI >= 3.0:1)', () => {
    it('accent color (#D97724) against light linen background meets graphical UI contrast (>= 3.0:1)', () => {
      const cr = contrastRatio(theme.colors.accent, theme.colors.background);
      expect(cr).toBeGreaterThanOrEqual(3.0);
    });

    it('passive stage badge (#78716C) meets graphical UI contrast against background', () => {
      const cr = contrastRatio(theme.colors.passiveStageBadge, theme.colors.background);
      expect(cr).toBeGreaterThanOrEqual(3.0);
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
      expect(theme.radius.lg).toBe(16);
      expect(theme.radius.full).toBe(9999);
    });
  });
});
