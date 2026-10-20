/**
 * M1-audytor-generalny-071 (09-lokalizacja-006): formy mnogie według CLDR przez Intl.PluralRules.
 * PL: 1 → one, 2/22 → few, 5/12 → many, 1,5 → other; EN: 1 → one, 0/2 → other.
 * Brak formy w słowniku → `other`, nigdy sklejanie.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { ACTIVE_LANGS, jezykLiczbyMnogiej, setLang, tPlural } from '../i18n';
import { formatPluralUniversal } from '../i18n-locales';

// Znaczniki kategorii: brak wpisu w słowniku EN, więc t() zwraca klucz w każdym języku.
const FORMS = { one: 'one:{n}', few: 'few:{n}', many: 'many:{n}', other: 'other:{n}' };
const cat = (s: string) => s.split(':')[0];

afterEach(() => {
  setLang('pl');
  jest.restoreAllMocks();
});

describe('tPlural przez Intl.PluralRules (M1-audytor-generalny-071)', () => {
  it('PL: 1 one, 2 few, 22 few, 5 many, 12 many, 1,5 other', () => {
    setLang('pl');
    expect([1, 2, 22, 5, 12, 1.5].map((n) => cat(tPlural(n, FORMS)))).toEqual([
      'one', 'few', 'few', 'many', 'many', 'other',
    ]);
  });

  it('EN: 1 one, 0 i 2 other', () => {
    setLang('en');
    expect([1, 0, 2].map((n) => cat(tPlural(n, FORMS)))).toEqual(['one', 'other', 'other']);
  });

  it('każdy aktywny język: kategoria równa Intl.PluralRules(język).select(n)', () => {
    for (const l of ACTIVE_LANGS) {
      setLang(l);
      for (const n of [0, 1, 2, 3, 5, 11, 12, 21, 22, 25, 101, 112, 0.5, 1.5, 2.25]) {
        // pt w rejestrze = Portugalia: reguły pt-PT (samo „pt” w CLDR = Brazylia) [M1-audytor-generalny-093]
        const expected = new Intl.PluralRules(jezykLiczbyMnogiej(l)).select(n);
        const got = cat(tPlural(n, FORMS));
        expect({ l, n, got }).toEqual({ l, n, got: expected in FORMS ? expected : 'other' });
      }
    }
  });

  it('korzysta z new Intl.PluralRules(język aplikacji)', () => {
    const Native = Intl.PluralRules;
    // Natywny konstruktor wymaga `new`; zastępczy tworzy prawdziwy obiekt i notuje język.
    const spy = jest
      .spyOn(Intl, 'PluralRules')
      .mockImplementation(((l?: string) => new Native(l)) as unknown as typeof Intl.PluralRules);
    setLang('pl');
    tPlural(3, FORMS);
    expect(spy).toHaveBeenCalledWith('pl');
  });

  it('brak formy few/many w słowniku: forma other', () => {
    setLang('pl');
    expect(tPlural(2, { one: 'one:{n}', other: 'other:{n}' })).toBe('other:2');
    expect(tPlural(5, { one: 'one:{n}', other: 'other:{n}' })).toBe('other:5');
  });

  it('formatPluralUniversal: ta sama reguła CLDR (PL 1,5 → other)', () => {
    const forms = { one: 'minuta', few: 'minuty', many: 'minut', other: 'minuty*' };
    expect(formatPluralUniversal('pl', 1.5, forms)).toBe('1.5 minuty*');
    expect(formatPluralUniversal('pl', 22, forms)).toBe('22 minuty');
  });
});

describe('polyfill Intl.PluralRules dla Hermes na iOS', () => {
  it('po wczytaniu polyfillu PL i EN dają kategorie CLDR', () => {
    jest.isolateModules(() => {
      require('../intl-polyfills');
    });
    const pl = new Intl.PluralRules('pl');
    expect([1, 2, 22, 5, 12, 1.5].map((n) => pl.select(n))).toEqual(['one', 'few', 'few', 'many', 'many', 'other']);
    expect([1, 2].map((n) => new Intl.PluralRules('en').select(n))).toEqual(['one', 'other']);
  });

  it('po wczytaniu polyfillu każdy z 35 języków ma reguły (ru 21 one, sl 2 two, lv 10 zero, ro 20 other) [M1-audytor-generalny-093]', () => {
    jest.isolateModules(() => {
      require('../intl-polyfills');
    });
    for (const l of ACTIVE_LANGS) expect(Intl.PluralRules.supportedLocalesOf([jezykLiczbyMnogiej(l)])).toHaveLength(1);
    expect(new Intl.PluralRules('ru').select(21)).toBe('one');
    expect(new Intl.PluralRules('sl').select(2)).toBe('two');
    expect(new Intl.PluralRules('lv').select(10)).toBe('zero');
    expect(new Intl.PluralRules('ro').select(20)).toBe('other');
    expect(new Intl.PluralRules('pt-PT').select(0)).toBe('other');
    expect(new Intl.PluralRules('zh-Hant').select(1)).toBe('other');
  });

  it('polyfill jest pierwszym importem punktu startu aplikacji (app/_layout.tsx)', () => {
    const layout = readFileSync(join(__dirname, '..', '..', '..', 'app', '_layout.tsx'), 'utf8');
    const firstImport = /^import\s+[^\n]*$/m.exec(layout)?.[0] ?? '';
    expect(firstImport).toMatch(/intl-polyfills/);
  });
});
