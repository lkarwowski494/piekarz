/**
 * t() w języku sr na urządzeniu z serbskim w łacince (sr-Latn-RS) zwraca łacinkę; na urządzeniu z cyrylicą
 * (sr-Cyrl-RS) cyrylicę; inne języki bez zmian [audyt-niezalezny F-11].
 */
let mockTagi = ['sr-Latn-RS'];
jest.mock('expo-localization', () => ({
  getLocales: () => mockTagi.map((languageTag) => ({ languageTag, languageCode: languageTag.split('-')[0], regionCode: 'RS', measurementSystem: 'metric' })),
}));

import { setLang, t } from '../i18n';
import '../unit-converter';
import { _resetLacinkiForTests } from '../sr-latinica';

describe('t() dla sr-Latn (F-11)', () => {
  afterEach(() => {
    setLang('pl');
    _resetLacinkiForTests();
  });

  it('sr-Latn: łacinka', () => {
    mockTagi = ['sr-Latn-RS'];
    _resetLacinkiForTests();
    setLang('sr');
    const tekst = t('Kopia');
    expect(tekst).not.toMatch(/[Ѐ-ӿ]/);
    expect(t('Piekarz')).toBe('Pekar');
  });

  it('sr-Cyrl: cyrylica', () => {
    mockTagi = ['sr-Cyrl-RS'];
    _resetLacinkiForTests();
    setLang('sr');
    expect(t('Piekarz')).toBe('Пекар');
  });

  it('inny język na urządzeniu sr-Latn bez zmian', () => {
    mockTagi = ['sr-Latn-RS'];
    _resetLacinkiForTests();
    setLang('ru');
    expect(t('Piekarz')).toMatch(/[Ѐ-ӿ]/);
  });
});
