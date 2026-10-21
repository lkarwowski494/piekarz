/**
 * Krój tytułów a cyrylica (D-050) [M2-koordynator-napraw-137 (p12b); M1-audytor-generalny-137]: plik kroju rysuje
 * cyrylicę domyślnie formami bułgarskimi; formy rosyjskie daje tylko cecha `locl` dla języka RUS, a ukraińskiej
 * i serbskiej nie ma wcale. React Native na iOS nie podaje języka tekstu do CoreText, więc `locl` się nie włącza.
 * Tytuły w uk, ru i sr idą krojem systemowym (liczonym przy renderze, jak vi/ja/ko/zh-Hant w 171); bg zostaje
 * przy kroju tytułów, bo formy bułgarskie są dla niego właściwe.
 * Test czyta GSUB pliku kroju: nowy plik z językami UKR/SRB albo z innymi formami domyślnymi przewróci test.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { StyleSheet } from 'react-native';
import { setLang } from '../../lib/i18n';
import { JEZYKI_CYRYLICY_BEZ_FORM_KROJU, JEZYKI_POZA_KROJEM_TYTULOW } from '../kroj-tytulow';
import { typografia } from '../tokeny';
import { naglowekZwykly } from '../naglowek';

const PLIK = join(__dirname, '..', '..', '..', 'assets/fonts/SofiaSansSemiCondensed-wght.ttf');

/** Tagi LangSys skryptu `cyrl` z tabeli GSUB i cechy każdego z nich. */
function langSysCyrylicy(): Record<string, string[]> {
  const b = readFileSync(PLIK);
  const n = b.readUInt16BE(4);
  let gsub = -1;
  for (let i = 0; i < n; i++) if (b.toString('latin1', 12 + i * 16, 16 + i * 16) === 'GSUB') gsub = b.readUInt32BE(12 + i * 16 + 8);
  const scriptList = gsub + b.readUInt16BE(gsub + 4);
  const featureList = gsub + b.readUInt16BE(gsub + 6);
  const cechy = (ls: number) => {
    const ile = b.readUInt16BE(ls + 4);
    return Array.from({ length: ile }, (_, k) => b.toString('latin1', featureList + 2 + b.readUInt16BE(ls + 6 + k * 2) * 6, featureList + 6 + b.readUInt16BE(ls + 6 + k * 2) * 6));
  };
  const out: Record<string, string[]> = {};
  const ileSkryptow = b.readUInt16BE(scriptList);
  for (let i = 0; i < ileSkryptow; i++) {
    if (b.toString('latin1', scriptList + 2 + i * 6, scriptList + 6 + i * 6) !== 'cyrl') continue;
    const script = scriptList + b.readUInt16BE(scriptList + 6 + i * 6);
    const ileLang = b.readUInt16BE(script + 2);
    for (let j = 0; j < ileLang; j++) {
      const tag = b.toString('latin1', script + 4 + j * 6, script + 8 + j * 6);
      out[tag] = cechy(script + b.readUInt16BE(script + 8 + j * 6));
    }
  }
  return out;
}

describe('krój tytułów a cyrylica (137)', () => {
  afterEach(() => setLang('pl'));

  it('plik kroju: w cyrylicy tylko langsys RUS z locl (bez UKR i SRB), więc formy domyślne nie są rosyjskie', () => {
    const ls = langSysCyrylicy();
    expect(Object.keys(ls).sort()).toEqual(['RUS ']);
    expect(ls['RUS ']).toContain('locl');
  });

  it('uk, ru, sr: tytuł krojem systemowym przy renderze; bg i pl: krojem tytułów', () => {
    const tytul = () => StyleSheet.flatten(naglowekZwykly.headerTitleStyle).fontFamily;
    for (const l of ['uk', 'ru', 'sr'] as const) {
      setLang(l);
      expect({ l, kroj: tytul() }).toEqual({ l, kroj: undefined });
    }
    expect([...(JEZYKI_CYRYLICY_BEZ_FORM_KROJU ?? [])].sort()).toEqual(['ru', 'sr', 'uk']);
    for (const l of ['bg', 'pl'] as const) {
      setLang(l);
      expect(tytul()).toBe(typografia.krojTytulow);
    }
    // 171 bez zmian: języki spoza cmap dalej krojem systemowym
    for (const l of JEZYKI_POZA_KROJEM_TYTULOW) {
      setLang(l);
      expect(tytul()).toBeUndefined();
    }
  });
});
