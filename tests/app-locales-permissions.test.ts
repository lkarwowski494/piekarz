// ============================================================================
// Piekarz — teksty zgód systemowych i nazwa aplikacji w każdym języku (M1-audytor-generalny-029, -049)
// Expo: "locales" w app.json + plik języka z kluczami w "ios"
// (docs.expo.dev/guides/localization, „Translating app metadata”, odczyt 2026-10-19).
// Od 2026-10-20 (D-043): F-08 (skan i udostępnianie QR) jest PÓŹNIEJ, więc 1.0 nie prosi o aparat;
// opis aparatu, wtyczka expo-camera i CAMERA w Androidzie znikają. Kod QR i pakiet zostają na później.
// ============================================================================

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ACTIVE_LANGS } from '../src/lib/i18n';
import { wejscieWidoczne } from '../src/lib/wejscia-pozniej';

const root = join(__dirname, '..');
const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
const expo = appJson.expo;
const infoPlist: Record<string, unknown> = expo.ios?.infoPlist ?? {};
const usageKeys = Object.keys(infoPlist).filter((k) => k.endsWith('UsageDescription'));

/** Uprawnienia z opisem (*UsageDescription) używane w 1.0: żadne (powiadomienia lokalne nie mają opisu w Info.plist). */
const UZYWANE_W_1_0: readonly string[] = [];

function localeIos(lang: string): Record<string, string> {
  const rel: string | undefined = expo.locales?.[lang];
  if (!rel) return {};
  const file = join(root, rel);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).ios ?? {} : {};
}

describe('zgody systemowe tylko dla funkcji 1.0 (M1-audytor-generalny-029, -049)', () => {
  it('app.json: mieszane lokalizacje włączone, opisy zgód tylko dla uprawnień używanych w 1.0', () => {
    expect(infoPlist.CFBundleAllowMixedLocalizations).toBe(true);
    expect(usageKeys.filter((k) => !UZYWANE_W_1_0.includes(k))).toEqual([]);
    expect(infoPlist.NSCameraUsageDescription).toBeUndefined();
    expect(infoPlist.NSMicrophoneUsageDescription).toBeUndefined();
  });

  it.each([...ACTIVE_LANGS])('plik języka %s: bez opisu aparatu i mikrofonu, każdy opis używanego uprawnienia jest', (lang) => {
    const ios = localeIos(lang);
    const opisy = Object.keys(ios).filter((k) => k.endsWith('UsageDescription'));
    expect(opisy.filter((k) => !UZYWANE_W_1_0.includes(k))).toEqual([]);
    expect(ios.NSCameraUsageDescription).toBeUndefined();
    expect(ios.NSMicrophoneUsageDescription).toBeUndefined();
    for (const key of UZYWANE_W_1_0) expect(typeof ios[key]).toBe('string');
  });

  it('bez wtyczki expo-camera i bez uprawnień aparatu i mikrofonu w Androidzie', () => {
    const nazwy = (expo.plugins as unknown[]).map((p) => (Array.isArray(p) ? p[0] : p));
    expect(nazwy).not.toContain('expo-camera');
    const android: string[] = expo.android?.permissions ?? [];
    expect(android.filter((p) => /CAMERA|RECORD_AUDIO/.test(p))).toEqual([]);
  });

  it('F-08 PÓŹNIEJ: wejścia skanu i udostępniania QR ukryte w jednym miejscu', () => {
    expect(wejscieWidoczne('qr')).toBe(false);
  });
});

describe('nazwa aplikacji w każdym aktywnym języku zostaje (049)', () => {
  it.each([...ACTIVE_LANGS])('%s: plik języka w app.json z nazwą aplikacji', (lang) => {
    expect(expo.locales?.[lang]).toBe(`./languages/${lang}.json`);
    const ios = localeIos(lang);
    expect(typeof ios.CFBundleDisplayName).toBe('string');
    expect(ios.CFBundleDisplayName.trim().length).toBeGreaterThan(0);
  });

  it('nazwa PL to „Piekarz”', () => {
    expect(localeIos('pl').CFBundleDisplayName).toBe('Piekarz');
  });
});

describe('verify-native zabrania opisu aparatu, dopóki F-08 jest PÓŹNIEJ (049)', () => {
  let tmp: string;
  beforeAll(() => {
    tmp = mkdtempSync(join(tmpdir(), 'piekarz-native-049-'));
  });
  afterAll(() => rmSync(tmp, { recursive: true, force: true }));

  const run = (mutate: (cfg: { expo: Record<string, any> }) => void) => {
    const cfg = JSON.parse(JSON.stringify(appJson));
    mutate(cfg);
    const p = join(tmp, `app-${Math.random().toString(36).slice(2)}.json`);
    writeFileSync(p, JSON.stringify(cfg), 'utf8');
    const r = spawnSync(process.execPath, [join(root, 'scripts', 'verify-native.mjs'), '--app', p], { cwd: root, encoding: 'utf8' });
    return { kod: r.status, wynik: `${r.stdout}${r.stderr}` };
  };

  it('obecny app.json: kod 0', () => {
    expect(run(() => undefined).kod).toBe(0);
  });

  it('NSCameraUsageDescription w app.json: kod 1 z komunikatem', () => {
    const r = run((c) => {
      c.expo.ios.infoPlist.NSCameraUsageDescription = 'Aparat do skanu kodu QR receptury.';
    });
    expect(r.kod).toBe(1);
    expect(r.wynik).toMatch(/NSCameraUsageDescription/);
  });
});
