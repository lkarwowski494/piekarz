import { t, setLang, lang, pluralPl, tPlural } from '../i18n';

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

  describe('RD-ENG-09: pluralPl inflection logic', () => {
    it('inflects single items with "one"', () => {
      expect(pluralPl(1, 'seria', 'serie', 'serii')).toBe('1 seria');
      expect(pluralPl(1, 'minuta', 'minuty', 'minut')).toBe('1 minuta');
      expect(pluralPl(-1, 'seria', 'serie', 'serii')).toBe('-1 seria');
    });

    it('inflects 2, 3, 4, 22, 104 with "few"', () => {
      expect(pluralPl(2, 'seria', 'serie', 'serii')).toBe('2 serie');
      expect(pluralPl(3, 'seria', 'serie', 'serii')).toBe('3 serie');
      expect(pluralPl(4, 'seria', 'serie', 'serii')).toBe('4 serie');
      expect(pluralPl(22, 'seria', 'serie', 'serii')).toBe('22 serie');
      expect(pluralPl(104, 'seria', 'serie', 'serii')).toBe('104 serie');
    });

    it('inflects 0, 5, 11, 12, 14, 21, 25, 112 with "many"', () => {
      expect(pluralPl(0, 'seria', 'serie', 'serii')).toBe('0 serii');
      expect(pluralPl(5, 'seria', 'serie', 'serii')).toBe('5 serii');
      expect(pluralPl(11, 'seria', 'serie', 'serii')).toBe('11 serii');
      expect(pluralPl(12, 'seria', 'serie', 'serii')).toBe('12 serii');
      expect(pluralPl(14, 'seria', 'serie', 'serii')).toBe('14 serii');
      expect(pluralPl(21, 'seria', 'serie', 'serii')).toBe('21 serii');
      expect(pluralPl(25, 'seria', 'serie', 'serii')).toBe('25 serii');
      expect(pluralPl(112, 'seria', 'serie', 'serii')).toBe('112 serii');
    });

    it('supports includeNumber = false', () => {
      expect(pluralPl(1, 'minuta', 'minuty', 'minut', false)).toBe('minuta');
      expect(pluralPl(2, 'minuta', 'minuty', 'minut', false)).toBe('minuty');
      expect(pluralPl(5, 'minuta', 'minuty', 'minut', false)).toBe('minut');
    });
  });
});

// Liczba mnoga przez mechanizm, bez sklejania [M1-audytor-generalny-047]
describe('tPlural', () => {
  const DNI = { one: '{n} dzień', few: '{n} dni', many: '{n} dni' };
  const MIN = { one: '{n} minuta', few: '{n} minuty', many: '{n} minut' };
  afterEach(() => setLang('pl'));

  it('PL: one / few / many jak pluralPl', () => {
    setLang('pl');
    expect([1, 2, 5, 12, 22, 112].map((n) => tPlural(n, MIN))).toEqual([
      '1 minuta', '2 minuty', '5 minut', '12 minut', '22 minuty', '112 minut',
    ]);
    expect(tPlural(120, DNI)).toBe('120 dni');
  });

  it('EN: one / other ze słownika (forma many jako other)', () => {
    setLang('en');
    expect([1, 2, 5, 120].map((n) => tPlural(n, DNI))).toEqual(['1 day', '2 days', '5 days', '120 days']);
  });
});