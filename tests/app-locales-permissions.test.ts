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

  /**
   * expo-audio tylko odtwarza dźwięk końca kroku (src/lib/timer-audio.ts, createAudioPlayer); aplikacja nie nagrywa.
   * Wtyczka z jawną konfiguracją: bez opisu mikrofonu (microphonePermission: false), bez RECORD_AUDIO i bez trybu
   * tła „audio” (domyślne enableBackgroundPlayback: true dodałoby UIBackgroundModes audio, Guideline 2.5.4)
   * [audyt-niezalezny H-mikrofon].
   */
  it('expo-audio: wtyczka bez uprawnienia mikrofonu i bez odtwarzania w tle; kod nie nagrywa', () => {
    const wpis = (expo.plugins as unknown[]).find((p) => Array.isArray(p) && p[0] === 'expo-audio') as [string, Record<string, unknown>] | undefined;
    expect(wpis?.[1]).toEqual({ microphonePermission: false, recordAudioAndroid: false, enableBackgroundPlayback: false, enableBackgroundRecording: false });
    const r = spawnSync('git', ['grep', '-l', '-E', 'useAudioRecorder|AudioRecorder|requestRecordingPermissions|RecordingPresets', '--', 'src', 'app', ':!*__tests__*'], { cwd: root, encoding: 'utf8' });
    expect(r.stdout.trim()).toBe('');
  });

  it('verify-native odrzuca wtyczkę expo-audio z domyślną konfiguracją (mikrofon i tryb tła)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'audio-h-'));
    try {
      const zly = JSON.parse(JSON.stringify(appJson));
      zly.expo.plugins = (zly.expo.plugins as unknown[]).map((p) => (Array.isArray(p) && p[0] === 'expo-audio' ? 'expo-audio' : p));
      const plik = join(dir, 'app.json');
      writeFileSync(plik, JSON.stringify(zly));
      const r = spawnSync(process.execPath, [join(root, 'scripts/verify-native.mjs'), '--app', plik], { cwd: root, encoding: 'utf8' });
      expect(r.status).toBe(1);
      expect(r.stderr).toContain('expo-audio');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
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

// Build 1.0 bez natywnego kodu aparatu (ITMS-90683): expo-camera wykluczony z autolinkingu iOS i Androida
// (docs.expo.dev/modules/autolinking, „exclude”, odczyt 2026-10-20), pakiet zostaje w zależnościach na później.
describe('build 1.0 nie linkuje expo-camera, dopóki F-08 jest PÓŹNIEJ (049, autolinking)', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

  it('package.json: expo-camera wykluczony z autolinkingu iOS i Androida, pakiet zostaje', () => {
    expect(pkg.dependencies['expo-camera']).toBeDefined();
    expect(pkg.expo?.autolinking?.ios?.exclude ?? []).toContain('expo-camera');
    expect(pkg.expo?.autolinking?.android?.exclude ?? []).toContain('expo-camera');
  });

  it('żaden plik ładowany przy starcie (app/ i ich statyczne importy) nie importuje expo-camera statycznie', () => {
    const { readdirSync, statSync } = require('node:fs') as typeof import('node:fs');
    const { dirname, resolve } = require('node:path') as typeof import('node:path');
    const walk = (d: string): string[] =>
      readdirSync(d).flatMap((n) => {
        const p = join(d, n);
        return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(n) ? [p] : [];
      });
    const plik = (base: string): string | null => {
      for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) if (existsSync(base + ext) && statSync(base + ext).isFile()) return base + ext;
      return null;
    };
    const widziane = new Set<string>();
    const winne: string[] = [];
    const odwiedz = (f: string) => {
      if (widziane.has(f)) return;
      widziane.add(f);
      const src = readFileSync(f, 'utf8');
      // Statyczne importy wartości (import type znika przy kompilacji)
      for (const m of src.matchAll(/^\s*import\s+(?!type\b)[^;]*?from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]/gm)) {
        const spec = m[1] ?? m[2];
        if (spec === 'expo-camera' || spec.startsWith('expo-camera/')) winne.push(f.slice(root.length + 1));
        if (spec.startsWith('.')) {
          const cel = plik(resolve(dirname(f), spec));
          if (cel) odwiedz(cel);
        }
      }
    };
    walk(join(root, 'app')).forEach(odwiedz);
    expect(widziane.size).toBeGreaterThan(50);
    expect(winne).toEqual([]);
  });

  it('skaner QR ładowany leniwie: brak modułu natywnego daje null zamiast awarii', () => {
    // Z modułem (atrapa z jest.setup.js): komponent skanera
    jest.isolateModules(() => {
      const { ladujSkanerQr } = require('../src/lib/qr-skaner');
      expect(typeof ladujSkanerQr()).toBe('function');
    });
    // Bez modułu natywnego (wykluczony z autolinkingu): null, bez wyjątku
    jest.isolateModules(() => {
      jest.doMock('expo-camera', () => {
        throw new Error("Cannot find native module 'ExpoCamera'");
      });
      const { ladujSkanerQr } = require('../src/lib/qr-skaner');
      expect(ladujSkanerQr()).toBeNull();
    });
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
