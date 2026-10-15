import { t, setLang, lang } from '../i18n';

describe('Apps4Brew Localization Engine (lib/i18n)', () => {
  afterEach(() => {
    setLang('pl');
  });

  it('defaults to Polish language and returns key text', () => {
    setLang('pl');
    expect(lang()).toBe('pl');
    expect(t('Anuluj')).toBe('Anuluj');
    expect(t('Kalkulator')).toBe('Kalkulator');
  });

  it('translates known keys when language is switched to English', () => {
    setLang('en');
    expect(lang()).toBe('en');
    expect(t('Anuluj')).toBe('Cancel');
    expect(t('Zapisz')).toBe('Save');
    expect(t('Doktor Chleba')).toBe('Bread Doctor');
    expect(t('Mąka')).toBe('Flour');
  });

  it('interpolates parameters correctly in both languages', () => {
    setLang('pl');
    expect(t('Mąka: {amount} g', { amount: 500 })).toBe('Mąka: 500 g');

    setLang('en');
    expect(t('Mąka: {amount} g', { amount: 500 })).toBe('Flour: 500 g');
    expect(t('Wypiek gotowy na: {time}', { time: '18:00' })).toBe('Bake ready at: 18:00');
  });

  it('falls back gracefully to Polish text if translation key is missing in English', () => {
    setLang('en');
    const unknownKey = 'Niestandardowy tekst rzemieślniczy bez tłumaczenia';
    expect(t(unknownKey)).toBe(unknownKey);
  });
});
