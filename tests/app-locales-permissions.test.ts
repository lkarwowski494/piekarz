// ============================================================================
// Piekarz — teksty zgód systemowych w PL i EN (M1-audytor-generalny-029, F-08)
// Expo: "locales" w app.json + plik języka z kluczami usage-description w "ios"
// (docs.expo.dev/guides/localization, „Translating app metadata”, odczyt 2026-10-19).
// ============================================================================

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ACTIVE_LANGS } from '../src/lib/i18n';

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

// Opisy uprawnień i nazwa w każdym aktywnym języku; brak nieużywanego opisu mikrofonu
// [M1-audytor-generalny-049; 09-lokalizacja-004, 10-wydanie-007]. expo-camera 57.0.6
// (node_modules/expo-camera/plugin/build/withCamera.js): microphonePermission: false usuwa
// NSMicrophoneUsageDescription, recordAudioAndroid: false pomija RECORD_AUDIO.
describe('Info.plist w każdym aktywnym języku (049)', () => {
  const plFile = localeIos('pl');
  const cameraPlugin = (expo.plugins as unknown[]).find(
    (p): p is [string, Record<string, unknown>] => Array.isArray(p) && p[0] === 'expo-camera'
  );

  it.each([...ACTIVE_LANGS])('%s: plik języka w app.json z opisem aparatu i nazwą aplikacji', (lang) => {
    expect(expo.locales?.[lang]).toBe(`./languages/${lang}.json`);
    const ios = localeIos(lang);
    expect(typeof ios.NSCameraUsageDescription).toBe('string');
    expect(ios.NSCameraUsageDescription.trim().length).toBeGreaterThan(20);
    expect(typeof ios.CFBundleDisplayName).toBe('string');
    expect(ios.CFBundleDisplayName.trim().length).toBeGreaterThan(0);
  });

  it('nazwa PL to „Piekarz”', () => {
    expect(plFile.CFBundleDisplayName).toBe('Piekarz');
  });

  it('opis aparatu w app.json i we wtyczce expo-camera jest taki sam jak w pliku PL', () => {
    expect(expo.ios.infoPlist.NSCameraUsageDescription).toBe(plFile.NSCameraUsageDescription);
    expect(cameraPlugin?.[1].cameraPermission).toBe(plFile.NSCameraUsageDescription);
  });

  it('bez opisu mikrofonu: wtyczka go wyłącza, app.json i pliki języków go nie mają', () => {
    expect(cameraPlugin?.[1].microphonePermission).toBe(false);
    expect(cameraPlugin?.[1].recordAudioAndroid).toBe(false);
    expect(expo.ios.infoPlist.NSMicrophoneUsageDescription).toBeUndefined();
    expect(expo.android.permissions).not.toContain('RECORD_AUDIO');
    for (const lang of ACTIVE_LANGS) expect(localeIos(lang).NSMicrophoneUsageDescription).toBeUndefined();
  });
});