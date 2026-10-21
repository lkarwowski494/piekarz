/**
 * Tryb imperialny w 35 językach: teksty t() z °C albo gramami dają te same liczby °F co EN, bez °C i bez gramów
 * [M1-audytor-generalny-096; 09-lokalizacja-501]. Sonda roli 09 z reaudytu (74 klucze) jako test w repo.
 */
import { EN } from '../i18n.en';
import { ACTIVE_LANGS, setLang, t, Lang } from '../i18n';
import { setUnitSystem, formatTextUnits } from '../unit-converter';

// Klucze bez parametrów z liczbą i °C albo g/kg w tekście PL
const KLUCZE = Object.keys(EN).filter((k) => !k.includes('#') && !/\{/.test(k) && /\d\s*(°C|kg\b|g\b)/.test(k.split('|')[0]));
const liczbyF = (s: string) =>
  [...s.matchAll(/(\d+(?:[.,]\d+)?)(?:\s| | )*°F/g)].map((m) => Number(m[1].replace(',', '.'))).sort((a, b) => a - b).join(',');
const zostaloC = (s: string) => /\d\s*°C|\d\s*℃/.test(s);
const zostaloG = (s: string) => /\d(?:\s| | )*(g|kg|г|кг|γρ|グラム|그램|克|公克)(?![\p{L}\d])/u.test(s);

describe('Tryb imperialny w 35 językach (096)', () => {
  afterAll(() => {
    setLang('pl');
    setUnitSystem('metric');
  });

  it('każdy z kluczy z °C/g: liczby °F jak w EN, bez °C i bez gramów, w każdym języku', () => {
    // 74 klucze w sondzie 096; tor p9a wycofał 14 z nich (131–133), dodał nowe — 65 po scaleniu pętli 2
    expect(KLUCZE.length).toBeGreaterThanOrEqual(65);
    setUnitSystem('imperial');
    const bledy: string[] = [];
    for (const k of KLUCZE) {
      setLang('en');
      const en = t(k);
      for (const l of ACTIVE_LANGS.filter((x) => x !== 'en') as Lang[]) {
        setLang(l);
        const s = t(k);
        if (liczbyF(s) !== liczbyF(en)) bledy.push(`${l} | ${k} | °F [${liczbyF(s)}] ≠ EN [${liczbyF(en)}] | ${s}`);
        if (zostaloC(s)) bledy.push(`${l} | ${k} | zostało °C | ${s}`);
        if (zostaloG(s)) bledy.push(`${l} | ${k} | zostały gramy | ${s}`);
      }
    }
    expect(bledy).toEqual([]);
  });

  it('różnica temperatur według tekstu źródłowego: „10 °C niżej” → 18 °F także bez polskich i angielskich słów', () => {
    const pl = 'Wpływa na tempo: 10 °C niżej to dłużej (ważne w 20–26 °C).';
    expect(formatTextUnits('Tempo: 10 °C kühler ist länger (gültig bei 20–26 °C).', 'imperial', pl)).toBe('Tempo: 18 °F kühler ist länger (gültig bei 68–79 °F).');
    // Bez tekstu źródłowego zachowanie bez zmian (słowa PL/EN)
    expect(formatTextUnits('10 °C cooler', 'imperial')).toBe('18 °F cooler');
  });

  it('masy cyrylicą tylko dla liczb, które w tekście źródłowym są masą: „100 г” → oz, „2026 г.” (rok) bez zmian', () => {
    expect(formatTextUnits('Стоимость на 100 г', 'imperial', 'Koszt na 100g')).toBe('Стоимость на 3.5 oz');
    expect(formatTextUnits('Данные 2026 г. и 100 г', 'imperial', 'Dane z 2026 r. i 100 g')).toBe('Данные 2026 г. и 3.5 oz');
  });
});
