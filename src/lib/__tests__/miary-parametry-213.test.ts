/**
 * Masa i temperatura podane parametrem („{g} g”, „{temp}°C”) w trybie imperialnym: w każdym z 34 języków te same
 * liczby °F co EN, bez gramów (także „г”) i bez °C. Tekst źródłowy klucza z wstawionymi parametrami mówi
 * przeliczeniu, które liczby są masą, niezależnie od pisma języka [M1-audytor-generalny-213; 09-lokalizacja-601].
 * Sonda reaudytu (sonda-param-09) jako test w repo.
 */
import { EN } from '../i18n.en';
import { ACTIVE_LANGS, setLang, t } from '../i18n';
import { setUnitSystem } from '../unit-converter';

const P: Record<string, string | number> = { amount: 250, g: 250, temp: 24, min: 30, lista: 'X', nazwa: 'Y', twoj: 80, przepis: 100, zakwas: 120, woda: 15, matka: 20, hydratacja: 100, maka: 40 };
const liczbyF = (s: string) => [...s.matchAll(/(\d+(?:[.,]\d+)?)(?:\s| | )*°F/g)].map((m) => m[1].replace(',', '.')).sort().join(',');
const G = /\d(?:\s| | )*(g|kg|г|кг|γρ|グラム|그램|克|公克)(?![\p{L}\d])/u;
const KLUCZE = Object.keys(EN).filter((x) => /\}\s*(°C|kg\b|g\b)/.test(x.split('|')[0]));

describe('jednostki w kluczach z parametrem, 35 języków (213)', () => {
  afterAll(() => {
    setLang('pl');
    setUnitSystem('metric');
  });

  it('klucze z masą albo temperaturą w parametrze istnieją (w tym „Pozostała mąka: {g} g”)', () => {
    expect(KLUCZE).toEqual(expect.arrayContaining(['Pozostała mąka: {g} g', 'Mąka: {amount} g']));
  });

  it.each(ACTIVE_LANGS.filter((l) => l !== 'en'))('%s: °F i oz jak w EN, bez gramów i °C', (l) => {
    setUnitSystem('imperial');
    const bledy: string[] = [];
    for (const key of KLUCZE) {
      setLang('en');
      const en = t(key, P);
      setLang(l);
      const s = t(key, P);
      if (/°C|℃/.test(s)) bledy.push(`${key}: °C | ${s}`);
      if (G.test(s)) bledy.push(`${key}: gramy | ${s}`);
      if (liczbyF(s) !== liczbyF(en)) bledy.push(`${key}: °F [${liczbyF(s)}] ≠ EN [${liczbyF(en)}] | ${s}`);
    }
    expect(bledy).toEqual([]);
  });
});
