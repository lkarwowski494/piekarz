// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Unit Tests for 35-Language Localization Registry & Pluralization Engine
// ============================================================================

import {
  SUPPORTED_LOCALES_35,
  getLocaleMetadata,
  getLocalesByTier,
  isRtlLocale,
  getAllSupportedLocaleCodes,
  formatPluralUniversal,
} from '../i18n-locales';

describe('i18n 35-Language Global Registry (Apps4Craft Studio)', () => {
  it('registers exactly 35 distinct locales across 3 tiers', () => {
    expect(SUPPORTED_LOCALES_35.length).toBe(35);

    const codes = new Set(SUPPORTED_LOCALES_35.map((l) => l.code));
    expect(codes.size).toBe(35);

    const tier1 = getLocalesByTier(1);
    const tier2 = getLocalesByTier(2);
    const tier3 = getLocalesByTier(3);

    expect(tier1.length).toBe(8);
    expect(tier2.length).toBe(12);
    expect(tier3.length).toBe(15);
    expect(tier1.length + tier2.length + tier3.length).toBe(35);
  });

  it('correctly identifies RTL writing systems (Arabic & Hebrew only)', () => {
    expect(isRtlLocale('ar')).toBe(true);
    expect(isRtlLocale('he')).toBe(true);

    expect(isRtlLocale('pl')).toBe(false);
    expect(isRtlLocale('en')).toBe(false);
    expect(isRtlLocale('de')).toBe(false);
    expect(isRtlLocale('ja')).toBe(false);
    expect(isRtlLocale('zh')).toBe(false);
  });

  it('provides complete metadata for every registered locale', () => {
    for (const locale of SUPPORTED_LOCALES_35) {
      expect(locale.code.length).toBeGreaterThan(0);
      expect(locale.name.length).toBeGreaterThan(0);
      expect(locale.englishName.length).toBeGreaterThan(0);
      expect([1, 2, 3]).toContain(locale.tier);
      expect(typeof locale.isRtl).toBe('boolean');
      expect(['slavic', 'germanic', 'romance', 'asian', 'arabic', 'semitic']).toContain(
        locale.pluralRule
      );
    }
  });

  it('returns all supported locale codes', () => {
    const allCodes = getAllSupportedLocaleCodes();
    expect(allCodes.length).toBe(35);
    expect(allCodes).toContain('pl');
    expect(allCodes).toContain('en');
    expect(allCodes).toContain('de');
    expect(allCodes).toContain('fr');
    expect(allCodes).toContain('ja');
    expect(allCodes).toContain('ar');
  });

  it('formats plurals correctly across language families', () => {
    const forms = {
      one: 'minuta',
      few: 'minuty',
      many: 'minut',
      other: 'minut',
    };

    // Slavic (Polish): 1 minuta, 2 minuty, 5 minut, 22 minuty
    expect(formatPluralUniversal('pl', 1, forms)).toBe('1 minuta');
    expect(formatPluralUniversal('pl', 2, forms)).toBe('2 minuty');
    expect(formatPluralUniversal('pl', 5, forms)).toBe('5 minut');
    expect(formatPluralUniversal('pl', 22, forms)).toBe('22 minuty');

    // Germanic (English): 1 minute, 2 minutes, 5 minutes
    const enForms = { one: 'minute', other: 'minutes' };
    expect(formatPluralUniversal('en', 1, enForms)).toBe('1 minute');
    expect(formatPluralUniversal('en', 2, enForms)).toBe('2 minutes');
    expect(formatPluralUniversal('en', 0, enForms)).toBe('0 minutes');

    // Asian (Japanese): invariable
    const jaForms = { one: '分', other: '分' };
    expect(formatPluralUniversal('ja', 1, jaForms)).toBe('1 分');
    expect(formatPluralUniversal('ja', 10, jaForms)).toBe('10 分');
  });
});
