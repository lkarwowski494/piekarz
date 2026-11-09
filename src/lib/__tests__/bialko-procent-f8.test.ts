/**
 * Wskazówka receptury o białku mąki podaje zawartość w procentach („minimum 13% białka”), nie „13,0g”: masa
 * w tekście była w trybie imperialnym przeliczana na uncje („0.46 oz białka”), co nie ma sensu dla zawartości
 * białka w mące [audyt-niezalezny F-8].
 */
import { setLang, t } from '../i18n';
import { setUnitSystem, _resetUnitSystemForTests } from '../unit-converter';
import { MASTER_RECIPES } from '../../recipes/presets';
import { LADOWANIE_SLOWNIKOW } from '../i18n-slowniki';

// D-305: zdanie „Wymaga mąki o zawartości białka minimum 13%.” usunięte z wskazówki tartine (bez źródła)
// [M1-audytor-generalny-010]; klucz sprzed zmiany zostaje w słownikach, więc jego przekłady sprawdzamy dalej.
const notatka = 'Wymaga mąki o zawartości białka minimum 13%. Autoliza 60 minut bez soli. Bardzo delikatne składania zwojowe.';

describe('białko w procentach we wskazówce receptury (F-8)', () => {
  afterEach(() => {
    setLang('pl');
    _resetUnitSystemForTests();
  });

  it('tekst PL podaje procent, nie gramy; żadna wskazówka receptury bazowej nie podaje białka (D-305)', () => {
    expect(MASTER_RECIPES.filter((r) => /białka/.test(r.notesPl ?? ''))).toEqual([]);
    expect(notatka).toMatch(/13\s?%/);
    expect(notatka).not.toMatch(/\d\s?g\b/);
  });

  it.each(['pl', 'en', 'de', 'ja'] as const)('%s (uncje i °F): bez „oz” w zdaniu o białku', (lang) => {
    setLang(lang);
    setUnitSystem('imperial');
    const tekst = t(notatka);
    expect(tekst).not.toMatch(/oz/);
    expect(tekst).toMatch(/13/);
  });

  it('33 słowniki: przekład z procentem, bez „13,0 g”', () => {
    const zle = Object.keys(LADOWANIE_SLOWNIKOW).filter((k) => {
      const v = LADOWANIE_SLOWNIKOW[k]()[notatka];
      return !v || /13[.,]0\s?g/.test(v) || !/%/.test(v);
    });
    expect(zle).toEqual([]);
  });
});
