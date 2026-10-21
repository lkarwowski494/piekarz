/**
 * Błędy przekładu maszynowego z audytu niezależnego [audyt-niezalezny F-7]:
 * - uk: formy dni „{n} дн.” (skrót) zamiast „дні”/„днів”;
 * - ms: kategoria „Na zakwasie” jako samo angielskie „Sourdough” i dwa terminy na zakwas („pemula sourdough”/
 *   „biang sourdough”; „biang” bez „sourdough” to zaczyn i zostaje);
 * - hr: mieszanie form „ti” i „Vi” — jedno „vam” poprawione, teksty w formie „Vi” czekają na ponowny przekład
 *   (docs/lokalizacja/czeka-na-przeklad.json, jezyki: hr) i do tego czasu zostają w obecnym brzmieniu.
 * bg „Среда” (= środek, miękisz; środa to bg „сряда”) i nl „ounces” (nl „ons” = 100 g) sprawdzone bez zmiany.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LADOWANIE_SLOWNIKOW } from '../src/lib/i18n-slowniki';

const root = path.join(__dirname, '..');

describe('błędy MT (F-7)', () => {
  it('uk: dni w pełnej formie', () => {
    const uk = LADOWANIE_SLOWNIKOW.uk();
    expect([uk['{n} dni'], uk['{n} dzień#few'], uk['{n} dzień#many']]).toEqual(['{n} днів', '{n} дні', '{n} днів']);
    expect(Object.values(uk).filter((v) => /дн\./.test(v))).toEqual([]);
  });

  it('ms: „Roti sourdough” jako kategoria i jeden termin „pemula sourdough”', () => {
    const ms = LADOWANIE_SLOWNIKOW.ms();
    expect(ms['Na zakwasie']).toBe('Roti sourdough');
    // „biang” = zaczyn (poolish, biga) zostaje; zakwas to „pemula sourdough”, nie „biang sourdough”
    expect(Object.values(ms).filter((v) => /biang sourdough/i.test(v))).toEqual([]);
  });

  it('hr: bez „vam”; teksty w formie „Vi” na liście ponownego przekładu dla hr', () => {
    const hr = LADOWANIE_SLOWNIKOW.hr();
    expect(Object.values(hr).filter((v) => /(^|[^\p{L}])[Vv]am([^\p{L}]|$)/u.test(v))).toEqual([]);
    const czeka = JSON.parse(fs.readFileSync(path.join(root, 'docs/lokalizacja/czeka-na-przeklad.json'), 'utf8')).klucze as Array<{ klucz: string; jezyki?: string[] }>;
    const doHr = new Set(czeka.filter((x) => x.jezyki?.includes('hr')).map((x) => x.klucz));
    const vi = Object.entries(hr).filter(([k, v]) => !k.includes('#') && /(^|[^\p{L}])(Dodajte|Smanjite|Povećajte|Produljite|Možete|Skratite)([^\p{L}]|$)/u.test(v));
    expect(vi.length).toBeGreaterThan(0);
    expect(vi.filter(([k]) => !doHr.has(k)).map(([k]) => k)).toEqual([]);
  });
});
