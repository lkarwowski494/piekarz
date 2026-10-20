/**
 * Rejestr języków zgodny z DEC-06 (b) z rozszerzeniem właściciela: 35 języków „jak w aplikacji Trening”.
 * Lista Treningu: repo trening, lib/i18n.ts:17 (`LANGS`) i katalog locales/ (35 plików), commit 8273448, odczyt
 * 2026-10-20. Języki w wydaniu = słowniki = `locales` i `supportedLocales` w app.json = przełącznik w Ustawieniach;
 * martwe słowniki usunięte [M1-audytor-generalny-073; 09-lokalizacja-008]. Od przekładu 093 (partia 7) w wydaniu
 * są wszystkie 35: słowniki 33 języków z przekładu M1, poprawki KROK 0 i tłumaczenie zwrotne w rejestrze
 * (docs/lokalizacja/jezyki.md) [M1-audytor-generalny-093].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SUPPORTED_LOCALES_35, getLocalesByStatus, getLocaleMetadata } from '../i18n-locales';
import { ACTIVE_LANGS, hasDictionary } from '../i18n';
import { PreferencesSection } from '../../components/settings/PreferencesSection';

const ROOT = join(__dirname, '..', '..', '..');
const TRENING_35 = [
  'pl', 'en', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'sr', 'lt', 'lv', 'et', 'uk', 'es', 'es-419', 'pt', 'pt-BR',
  'de', 'fr', 'it', 'nl', 'sv', 'da', 'nb', 'fi', 'tr', 'el', 'id', 'ms', 'vi', 'ru', 'ja', 'ko', 'zh-Hant',
];
const sorted = (xs: readonly string[]) => [...xs].sort();
const appJson = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')).expo;

describe('rejestr języków (DEC-06 b, 35 jak w Treningu)', () => {
  it('rejestr w kodzie to dokładnie lista 35 języków Treningu', () => {
    expect(sorted(SUPPORTED_LOCALES_35.map((l) => l.code))).toEqual(sorted(TRENING_35));
  });

  it('w wydaniu 1.0 jest 35 języków (przekład 093); żaden nie czeka', () => {
    expect(sorted(getLocalesByStatus('released').map((l) => l.code))).toEqual(sorted(TRENING_35));
    expect(getLocalesByStatus('planned')).toHaveLength(0);
    expect(getLocaleMetadata('zh-hant')?.code).toBe('zh-Hant');
  });

  it('języki w wydaniu = ACTIVE_LANGS = słowniki = languages/*.json = locales i supportedLocales w app.json', () => {
    const released = sorted(getLocalesByStatus('released').map((l) => l.code));
    expect(sorted(ACTIVE_LANGS)).toEqual(released);
    for (const l of released) if (l !== 'pl') expect(hasDictionary(l)).toBe(true);
    for (const l of getLocalesByStatus('planned')) expect(hasDictionary(l.code)).toBe(false);
    const files = readdirSync(join(ROOT, 'languages')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5));
    expect(sorted(files)).toEqual(released);
    expect(sorted(Object.keys(appJson.locales))).toEqual(released);
    const plugin = appJson.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-localization');
    expect(plugin).toBeDefined();
    expect(sorted(plugin[1].supportedLocales.ios)).toEqual(released);
    expect(sorted(plugin[1].supportedLocales.android)).toEqual(released);
  });

  it('żaden język z rejestru nie jest pisany od prawej; RTL wyłączone świadomie (supportsRTL: false)', () => {
    for (const l of SUPPORTED_LOCALES_35) expect(new Intl.Locale(l.code).maximize().script).not.toMatch(/^(Arab|Hebr)$/);
    const plugin = appJson.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-localization');
    expect(plugin[1].supportsRTL).toBe(false);
  });

  it('przełącznik w Ustawieniach oferuje dokładnie języki w wydaniu, z nazwą w tym języku i językiem wymowy VoiceOver', () => {
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(
        <PreferencesSection currentLang="pl" onLanguageChange={() => undefined} unitSystem="metric" onUnitSystemChange={() => undefined} />
      );
    });
    const przyciski = tree!.root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('lang-') && typeof n.type !== 'string');
    const unikalne = new Map(przyciski.map((n) => [n.props.testID as string, n]));
    expect(sorted([...unikalne.keys()].map((id) => id.slice(5)))).toEqual(sorted(getLocalesByStatus('released').map((l) => l.code)));
    expect(unikalne.get('lang-de')!.props.accessibilityLanguage).toBe('de');
    act(() => tree!.unmount());
  });

  it('brak martwych słowników: żadnego słownika poza rejestrem wydania', () => {
    expect(existsSync(join(ROOT, 'src/lib/i18n.tier1.ts'))).toBe(false);
  });

  it('docs/lokalizacja/jezyki.md ma wiersz dla każdego języka rejestru ze stanem z kodu', () => {
    const doc = readFileSync(join(ROOT, 'docs/lokalizacja/jezyki.md'), 'utf8');
    const rows = new Map(
      [...doc.matchAll(/^\| `([A-Za-z0-9-]+)` \| [^|]+ \| (w wydaniu 1\.0|planowany) \|/gm)].map((m) => [m[1], m[2]])
    );
    expect(sorted([...rows.keys()])).toEqual(sorted(TRENING_35));
    for (const l of SUPPORTED_LOCALES_35) expect(rows.get(l.code)).toBe(l.status === 'released' ? 'w wydaniu 1.0' : 'planowany');
  });

  it('nazwa pod ikoną w languages/<kod>.json według D-053 (de: Bäcker, fr: Mitron, bg: Пекар)', () => {
    const nazwa = (kod: string) => JSON.parse(readFileSync(join(ROOT, 'languages', `${kod}.json`), 'utf8')).ios.CFBundleDisplayName;
    expect(nazwa('de')).toBe('Bäcker');
    expect(nazwa('fr')).toBe('Mitron');
    expect(nazwa('es-419')).toBe('Panadero');
    expect(nazwa('bg')).toBe('Пекар');
    for (const l of TRENING_35) expect(nazwa(l)).not.toBe('Crust');
  });
});
