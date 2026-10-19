// ============================================================================
// Piekarz — teksty zgód systemowych w PL i EN (M1-audytor-generalny-029, F-08)
// Expo: "locales" w app.json + plik języka z kluczami usage-description w "ios"
// (docs.expo.dev/guides/localization, „Translating app metadata”, odczyt 2026-10-19).
// ============================================================================

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const expo = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
const usageKeys = Object.keys(expo.ios?.infoPlist ?? {}).filter((k) => k.endsWith('UsageDescription'));

function localeIos(lang: string): Record<string, string> {
  const rel: string | undefined = expo.locales?.[lang];
  if (!rel) return {};
  const file = join(root, rel);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).ios ?? {} : {};
}

describe('zgody systemowe w PL i EN (M1-audytor-generalny-029)', () => {
  it('app.json ma opis zgody na aparat i mieszane lokalizacje', () => {
    expect(usageKeys).toContain('NSCameraUsageDescription');
    expect(expo.ios.infoPlist.CFBundleAllowMixedLocalizations).toBe(true);
  });

  it.each(['pl', 'en'])('plik języka %s ma każdy opis zgody', (lang) => {
    const ios = localeIos(lang);
    for (const key of usageKeys) {
      expect(typeof ios[key]).toBe('string');
      expect(ios[key].trim().length).toBeGreaterThan(20);
    }
  });

  it('opis po angielsku nie jest kopią polskiego', () => {
    const pl = localeIos('pl');
    const en = localeIos('en');
    for (const key of usageKeys) {
      expect(en[key]).not.toBe(pl[key]);
      expect(en[key]).toMatch(/camera|QR/i);
    }
  });
});
