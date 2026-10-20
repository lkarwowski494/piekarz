/**
 * Przekład 1.0 na 35 języków (DEC-06 b rozszerzona, lista Treningu) [M1-audytor-generalny-093]:
 * słowniki 33 języków z przekładu M1 ładowane przez mechanizm i18n, liczba mnoga CLDR każdego języka
 * (wektory: unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html), wybór języka z systemu
 * z wariantami regionalnymi jak w Treningu (trening/lib/i18n.ts `resolveLang`, commit 8273448).
 */
import { ACTIVE_LANGS, hasDictionary, resolveLanguage, setLang, t, tPlural, type Lang } from '../i18n';
import { SUPPORTED_LOCALES_35 } from '../i18n-locales';

const GODZINY = { one: '{n} godzina', few: '{n} godziny', many: '{n} godzin', other: '{n} godziny' };
const DNI = { one: '{n} dzień', few: '{n} dni', many: '{n} dni', other: '{n} dnia' };

describe('35 języków: słowniki i przełączanie (093)', () => {
  afterEach(() => setLang('pl'));

  it('każdy język rejestru jest aktywny i ma słownik (pl = źródło)', () => {
    expect([...ACTIVE_LANGS].sort()).toEqual(SUPPORTED_LOCALES_35.map((l) => l.code).sort());
    for (const l of ACTIVE_LANGS) if (l !== 'pl') expect(hasDictionary(l)).toBe(true);
  });

  it('przełączenie na de pokazuje niemiecki tekst, nie angielski ani polski', () => {
    setLang('de' as Lang);
    expect(t('Dziś')).toBe('Heute');
    expect(t('Receptury')).toBe('Rezepturen');
    expect(t('Plan wypieku')).toBe('Backplan');
  });

  it('nazwa aplikacji według D-053: słowo sprzed dwukropka nazwy w sklepie', () => {
    const nazwy: Record<string, string> = { de: 'Bäcker', fr: 'Mitron', ja: 'パン職人', 'es-419': 'Panadero', nb: 'Bakeren', ru: 'Хлебопёк' };
    for (const [l, n] of Object.entries(nazwy)) {
      setLang(l as Lang);
      expect(t('Piekarz')).toBe(n);
    }
  });

  it('brak klucza w słowniku języka: tekst zastępczy EN, potem PL; nigdy klucz z kontekstem ani pusty tekst', () => {
    setLang('de' as Lang);
    expect(t('Tekst, którego nie ma w żadnym słowniku|kontekst')).toBe('Tekst, którego nie ma w żadnym słowniku');
  });

  it('liczba mnoga ru (one/few/many): 1 час, 2 часа, 5 часов, 21 час; 2 дня, 5 дней', () => {
    setLang('ru' as Lang);
    expect([1, 2, 5, 21].map((n) => tPlural(n, GODZINY))).toEqual(['1 час', '2 часа', '5 часов', '21 час']);
    expect([2, 5, 22].map((n) => tPlural(n, DNI))).toEqual(['2 дня', '5 дней', '22 дня']);
  });

  it('liczba mnoga de (one/other): 1 Stunde, 2 Stunden, 0 Stunden', () => {
    setLang('de' as Lang);
    expect([1, 2, 0].map((n) => tPlural(n, GODZINY))).toEqual(['1 Stunde', '2 Stunden', '0 Stunden']);
  });

  it('liczba mnoga sl (one/two/few/other) i ro (one/few/other z „de”)', () => {
    setLang('sl' as Lang);
    expect([1, 2, 3, 5, 102].map((n) => tPlural(n, GODZINY))).toEqual(['1 ura', '2 uri', '3 ure', '5 ur', '102 uri']);
    setLang('ro' as Lang);
    expect([1, 2, 19, 20].map((n) => tPlural(n, GODZINY))).toEqual(['1 oră', '2 ore', '19 ore', '20 de ore']);
  });

  it('każdy język ma formę dla każdej kategorii CLDR grup liczby mnogiej', () => {
    for (const l of ACTIVE_LANGS) {
      if (l === 'pl' || l === 'en') continue;
      setLang(l);
      for (const n of [0, 1, 2, 3, 5, 11, 21, 22, 101, 1000000]) {
        const s = tPlural(n, GODZINY);
        expect(s).toContain(String(n));
        expect(s).not.toMatch(/godzin/);
      }
    }
  });
});

describe('język z systemu: warianty regionalne jak w Treningu (093)', () => {
  it.each([
    [['es-MX'], 'es-419'],
    [['es-ES'], 'es'],
    [['es'], 'es'],
    [['pt-BR'], 'pt-BR'],
    [['pt'], 'pt-BR'],
    [['pt-PT'], 'pt'],
    [['zh-Hant-TW'], 'zh-Hant'],
    [['zh-TW'], 'zh-Hant'],
    [['zh-Hans-CN', 'de-DE'], 'de'],
    [['nb-NO'], 'nb'],
    [['no'], 'nb'],
    [['in-ID'], 'id'],
    [['sr-Cyrl-RS'], 'sr'],
    [['ar-SA'], 'en'],
  ])('%j → %s', (tags, expected) => {
    expect(resolveLanguage(null, tags)).toBe(expected);
  });
});
