// ============================================================================
// Piekarz (Crust) — rejestr 35 języków i liczba mnoga przez Intl.PluralRules.
// Lista zmieniona z „Tier 1..3 z arabskim i hebrajskim” na listę Treningu według DEC-06 (b) z rozszerzeniem
// właściciela; zgodność z app.json i słownikami: jezyki-rejestr.test.ts [M1-audytor-generalny-073; 09-lokalizacja-008].
// ============================================================================

import {
  SUPPORTED_LOCALES_35,
  getLocaleMetadata,
  getLocalesByStatus,
  getAllSupportedLocaleCodes,
  formatPluralUniversal,
} from '../i18n-locales';

describe('i18n: rejestr 35 języków (DEC-06 b)', () => {
  it('35 różnych kodów; 2 w wydaniu i 33 planowane', () => {
    expect(SUPPORTED_LOCALES_35.length).toBe(35);
    expect(new Set(SUPPORTED_LOCALES_35.map((l) => l.code)).size).toBe(35);
    expect(getLocalesByStatus('released').length + getLocalesByStatus('planned').length).toBe(35);
  });

  it('każdy wpis ma poprawny tag BCP 47, nazwę własną i angielską', () => {
    for (const locale of SUPPORTED_LOCALES_35) {
      expect(Intl.getCanonicalLocales(locale.code)).toEqual([locale.code]);
      expect(locale.name.length).toBeGreaterThan(0);
      expect(locale.englishName.length).toBeGreaterThan(0);
      expect(['released', 'planned']).toContain(locale.status);
    }
  });

  it('getAllSupportedLocaleCodes zwraca warianty regionalne Treningu, bez języków spoza listy', () => {
    const allCodes = getAllSupportedLocaleCodes();
    expect(allCodes).toHaveLength(35);
    for (const c of ['pl', 'en', 'es-419', 'pt-BR', 'nb', 'zh-Hant', 'ru', 'sl', 'sr']) expect(allCodes).toContain(c);
    for (const c of ['ar', 'he', 'th', 'hi', 'zh', 'zh-TW', 'no']) expect(allCodes).not.toContain(c);
    expect(getLocaleMetadata('PT-br')?.name).toBe('Português (Brasil)');
  });

  it('liczba mnoga według CLDR w różnych językach', () => {
    const forms = {
      one: 'minuta',
      few: 'minuty',
      many: 'minut',
      other: 'minut',
    };

    // Polski: 1 minuta, 2 minuty, 5 minut, 22 minuty
    expect(formatPluralUniversal('pl', 1, forms)).toBe('1 minuta');
    expect(formatPluralUniversal('pl', 2, forms)).toBe('2 minuty');
    expect(formatPluralUniversal('pl', 5, forms)).toBe('5 minut');
    expect(formatPluralUniversal('pl', 22, forms)).toBe('22 minuty');

    // Angielski: 1 minute, 2 minutes, 0 minutes
    const enForms = { one: 'minute', other: 'minutes' };
    expect(formatPluralUniversal('en', 1, enForms)).toBe('1 minute');
    expect(formatPluralUniversal('en', 2, enForms)).toBe('2 minutes');
    expect(formatPluralUniversal('en', 0, enForms)).toBe('0 minutes');

    // Japoński: jedna forma
    const jaForms = { one: '分', other: '分' };
    expect(formatPluralUniversal('ja', 1, jaForms)).toBe('1 分');
    expect(formatPluralUniversal('ja', 10, jaForms)).toBe('10 分');
  });
});
