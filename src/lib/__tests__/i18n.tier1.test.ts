// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Unit Tests for Tier 1 Global Dictionaries (DE, FR, IT, ES, JA)
// ============================================================================

import {
  translateTier1,
  TIER1_DICTIONARIES,
  Tier1Locale,
} from '../i18n.tier1';

describe('Tier 1 Global Sourdough Dictionaries (DE, FR, IT, ES, JA)', () => {
  const supported: Tier1Locale[] = ['de', 'fr', 'it', 'es', 'ja'];

  it('provides translations for core terms in all 5 languages', () => {
    for (const loc of supported) {
      expect(TIER1_DICTIONARIES[loc]).toBeDefined();
      expect(translateTier1(loc, 'Kalkulator')).toBeDefined();
      expect(translateTier1(loc, 'Zakwas')).toBeDefined();
      expect(translateTier1(loc, 'Stolnica')).toBeDefined();
      expect(translateTier1(loc, 'Mąka')).toBeDefined();
      expect(translateTier1(loc, 'Woda')).toBeDefined();
    }
  });

  it('correctly translates German (Sauerteig, Mehl, Wasser)', () => {
    expect(translateTier1('de', 'Zakwas')).toBe('Sauerteig');
    expect(translateTier1('de', 'Mąka')).toBe('Mehl');
    expect(translateTier1('de', 'Woda')).toBe('Wasser');
  });

  it('correctly translates French (Levain naturel, Farine, Eau)', () => {
    expect(translateTier1('fr', 'Zakwas')).toBe('Levain naturel');
    expect(translateTier1('fr', 'Mąka')).toBe('Farine');
    expect(translateTier1('fr', 'Woda')).toBe('Eau');
  });

  it('correctly translates Italian (Lievito madre, Farina, Acqua)', () => {
    expect(translateTier1('it', 'Zakwas')).toBe('Lievito madre');
    expect(translateTier1('it', 'Mąka')).toBe('Farina');
    expect(translateTier1('it', 'Woda')).toBe('Acqua');
  });

  it('correctly translates Spanish (Masa madre, Harina, Agua)', () => {
    expect(translateTier1('es', 'Zakwas')).toBe('Masa madre');
    expect(translateTier1('es', 'Mąka')).toBe('Harina');
    expect(translateTier1('es', 'Woda')).toBe('Agua');
  });

  it('correctly translates Japanese (自家製酵母種, 小麦粉, 水)', () => {
    expect(translateTier1('ja', 'Zakwas')).toBe('自家製酵母種');
    expect(translateTier1('ja', 'Mąka')).toBe('小麦粉');
    expect(translateTier1('ja', 'Woda')).toBe('水');
  });

  it('returns undefined for unsupported locales or missing keys', () => {
    expect(translateTier1('unsupported', 'Zakwas')).toBeUndefined();
    expect(translateTier1('de', 'NieistniejącyKlucz')).toBeUndefined();
  });
});
