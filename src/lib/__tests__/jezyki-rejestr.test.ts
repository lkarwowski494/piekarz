/**
 * Rejestr języków zgodny z DEC-06 (b) z rozszerzeniem właściciela: PL + EN w wydaniu 1.0, razem 35 języków
 * „jak w aplikacji Trening”. Lista Treningu: repo trening, lib/i18n.ts:17 (`LANGS`) i katalog locales/
 * (35 plików), commit 8273448, odczyt 2026-10-20. Języki w wydaniu = słowniki = `locales` i `supportedLocales`
 * w app.json = przełącznik w Ustawieniach; martwe słowniki usunięte [M1-audytor-generalny-073; 09-lokalizacja-008].
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SUPPORTED_LOCALES_35, getLocalesByStatus, getLocaleMetadata } from '../i18n-locales';
import { ACTIVE_LANGS, hasDictionary } from '../i18n';

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

  it('w wydaniu 1.0 są PL i EN; pozostałe 33 czekają na przekład 093', () => {
    expect(sorted(getLocalesByStatus('released').map((l) => l.code))).toEqual(['en', 'pl']);
    expect(getLocalesByStatus('planned')).toHaveLength(33);
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

  it('przełącznik w Ustawieniach oferuje dokładnie języki w wydaniu', () => {
    const src = readFileSync(join(ROOT, 'src/components/settings/PreferencesSection.tsx'), 'utf8');
    const offered = [...src.matchAll(/testID="lang-([A-Za-z0-9-]+)"/g)].map((m) => m[1]);
    expect(sorted(offered)).toEqual(sorted(getLocalesByStatus('released').map((l) => l.code)));
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
});
