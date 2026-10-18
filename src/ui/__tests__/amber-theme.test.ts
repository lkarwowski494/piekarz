// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Unit Tests for Amber OLED Night Mode Theme (WCAG 2.1 AA & Zero Blue Light)
// ============================================================================

import { amberTheme } from '../amber-theme';

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
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hex1);
  const lum2 = relativeLuminance(hex2);
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

describe('Amber OLED Night Mode (0% Blue Light & WCAG Contrast)', () => {
  it('uses pure OLED black (#000000) for background', () => {
    expect(amberTheme.colors.background).toBe('#000000');
  });

  it('exceeds WCAG AAA contrast for primary text on black OLED background', () => {
    const cr = contrastRatio(amberTheme.colors.textPrimary, amberTheme.colors.background);
    expect(cr).toBeGreaterThanOrEqual(7.0); // WCAG AAA
    expect(cr).toBeGreaterThan(10.0);
  });

  it('exceeds WCAG AA contrast for secondary text on black OLED background', () => {
    const cr = contrastRatio(amberTheme.colors.textSecondary, amberTheme.colors.background);
    expect(cr).toBeGreaterThanOrEqual(4.5); // WCAG AA
  });

  it('maintains pure amber spectrum with zero / minimal blue light emission', () => {
    // Check that blue channel in key text/accents is 0 to protect melatonin
    const [, , bText] = hexToRgb(amberTheme.colors.textPrimary);
    const [, , bBg] = hexToRgb(amberTheme.colors.background);
    const [, , bAccent] = hexToRgb(amberTheme.colors.accent);

    expect(bBg).toBe(0);
    expect(bText).toBe(0);
    expect(bAccent).toBe(0);
  });
});
