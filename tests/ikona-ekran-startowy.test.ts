/**
 * @jest-environment node
 */
// ============================================================================
// Piekarz — ikona aplikacji i ekran startowy z nowej szaty (M1-audytor-generalny-105).
// Ikona: spirala koszyka z docs/design/ekrany/ikona.html w wariantach jasnym,
// ciemnym i w odcieniu (iOS 18, ios.icon w formacie Expo SDK 57), 1024x1024
// bez kanału alfa. Ekran startowy: tło z tokenów motywu i pusta spirala bez
// tekstu (design-spec §10).
// ============================================================================

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { kolory } from '../src/ui/tokeny';

const root = join(__dirname, '..');
const expo = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
const sciezka = (p: string) => join(root, p);

// Tła wariantów ikony według docs/design/ekrany/ikona.html.
const TLA_IKONY = { light: '#1E4954', dark: '#0E1315', tinted: '#000000' } as const;
type Wariant = keyof typeof TLA_IKONY;

const hex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();

async function piksel(plik: string, x: number, y: number): Promise<string> {
  const { data, info } = await sharp(plik).raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return hex(data[i], data[i + 1], data[i + 2]);
}

describe('ikona aplikacji (M1-audytor-generalny-105)', () => {
  it('ios.icon ma warianty light, dark i tinted (iOS 18), a ikona ogólna to wariant jasny', () => {
    expect(typeof expo.ios.icon).toBe('object');
    for (const w of Object.keys(TLA_IKONY) as Wariant[]) {
      expect(typeof expo.ios.icon[w]).toBe('string');
      expect(existsSync(sciezka(expo.ios.icon[w]))).toBe(true);
    }
    expect(expo.icon).toBe(expo.ios.icon.light);
  });

  it.each(Object.keys(TLA_IKONY) as Wariant[])('wariant %s: 1024x1024, bez kanału alfa', async (w) => {
    const meta = await sharp(sciezka(expo.ios.icon[w])).metadata();
    expect(meta.format).toBe('png');
    expect([meta.width, meta.height]).toEqual([1024, 1024]);
    expect(meta.hasAlpha).toBe(false);
  });

  it.each(Object.keys(TLA_IKONY) as Wariant[])('wariant %s: pełne tło wariantu z makiety (bez zaokrągleń)', async (w) => {
    const plik = sciezka(expo.ios.icon[w]);
    for (const [x, y] of [[0, 0], [1023, 0], [0, 1023], [1023, 1023]]) {
      expect(await piksel(plik, x, y)).toBe(TLA_IKONY[w]);
    }
  });

  it('wariant w odcieniu jest w skali szarości (system nakłada odcień)', async () => {
    const { data, info } = await sharp(sciezka(expo.ios.icon.tinted)).raw().toBuffer({ resolveWithObject: true });
    let kolorowe = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) > 2) kolorowe++;
    }
    expect(kolorowe).toBe(0);
  });

  it('wariant jasny ma zwój spirali w kolorze ratanu z ikony (nie starą grafikę)', async () => {
    const { data, info } = await sharp(sciezka(expo.ios.icon.light)).raw().toBuffer({ resolveWithObject: true });
    let ratan = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (hex(data[i], data[i + 1], data[i + 2]) === '#D9C3A0') ratan++;
    }
    expect(ratan).toBeGreaterThan(20000);
  });
});

describe('ekran startowy (M1-audytor-generalny-105)', () => {
  it('tło ekranu startowego to token tlo wariantu ciemnego, obraz istnieje', () => {
    expect(expo.splash.backgroundColor.toUpperCase()).toBe(kolory.ciemny.tlo.toUpperCase());
    expect(existsSync(sciezka(expo.splash.image))).toBe(true);
    expect(expo.splash.resizeMode).toBe('contain');
  });

  it('obrazy pustej spirali dla motywu jasnego i ciemnego: kwadrat, przezroczyste tło, kolor zwoju ratanSzary', async () => {
    const pary = [
      ['assets/splash-icon.png', kolory.jasny.ratanSzary],
      ['assets/splash-icon-dark.png', kolory.ciemny.ratanSzary],
    ] as const;
    for (const [plik, zwoj] of pary) {
      const meta = await sharp(sciezka(plik)).metadata();
      expect(meta.width).toBe(meta.height);
      expect(meta.hasAlpha).toBe(true);
      const { data, info } = await sharp(sciezka(plik)).raw().toBuffer({ resolveWithObject: true });
      expect(data[3]).toBe(0); // narożnik przezroczysty: tło daje kolor ekranu startowego
      let ileZwoju = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        if (data[i + 3] === 255 && hex(data[i], data[i + 1], data[i + 2]) === zwoj.toUpperCase()) ileZwoju++;
      }
      expect(ileZwoju).toBeGreaterThan(1000);
    }
    expect(expo.splash.image).toBe('./assets/splash-icon-dark.png');
  });
});
