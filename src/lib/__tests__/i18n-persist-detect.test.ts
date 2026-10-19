/**
 * Język aplikacji: pierwszy start bierze język systemu (expo-localization), wybór użytkownika przetrwa restart
 * (app_settings, klucz `language`), a język systemu spoza aktywnych dostaje angielski. Mechanizm dla 35 języków
 * z rejestru, aktywne PL i EN (decyzja właściciela 2a, DEC-06 b) [M1-audytor-generalny-048; 09-lokalizacja-003, 08-programista-015].
 */
jest.mock('expo-sqlite', () => require('../../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());

let mockDevice: Array<{ languageTag: string; languageCode: string | null }> = [{ languageTag: 'pl-PL', languageCode: 'pl' }];
jest.mock('expo-localization', () => ({ getLocales: () => mockDevice }));

import { useTempDbDir, restartApp } from '../../data/__tests__/helpers/node-sqlite-adapter';
import { SUPPORTED_LOCALES_35 } from '../i18n-locales';

type I18n = typeof import('../i18n');
const device = (...tags: string[]) => {
  mockDevice = tags.map((tag) => ({ languageTag: tag, languageCode: tag.split('-')[0] }));
};
async function startApp(): Promise<I18n> {
  const app = restartApp();
  await app.schema.initDatabase();
  const i18n = require('../i18n') as I18n;
  await i18n.initLanguage();
  return i18n;
}

describe('język: wykrycie z systemu i zapis wyboru', () => {
  beforeEach(() => {
    useTempDbDir();
    device('pl-PL');
  });

  it('resolveLanguage: zapis > pierwszy aktywny język systemu > angielski', () => {
    const { resolveLanguage } = require('../i18n') as I18n;
    expect(resolveLanguage(null, ['pl-PL'])).toBe('pl');
    expect(resolveLanguage(null, ['en-GB'])).toBe('en');
    expect(resolveLanguage(null, ['de-DE'])).toBe('en');
    expect(resolveLanguage(null, ['de-DE', 'pl-PL'])).toBe('pl');
    expect(resolveLanguage('en', ['pl-PL'])).toBe('en');
    expect(resolveLanguage('xx', ['pl-PL'])).toBe('pl');
  });

  it('pierwszy start bez zapisu: język systemu (en-US → en)', async () => {
    device('en-US');
    const i18n = await startApp();
    expect(i18n.lang()).toBe('en');
  });

  it('wybór użytkownika przetrwa restart mimo innego języka systemu', async () => {
    let i18n = await startApp();
    expect(i18n.lang()).toBe('pl');
    await i18n.chooseLanguage('en');
    i18n = await startApp();
    expect(i18n.lang()).toBe('en');
  });

  it('aktywne języki należą do rejestru 35 i mają słownik (poza źródłowym PL)', () => {
    const { ACTIVE_LANGS, hasDictionary } = require('../i18n') as I18n;
    const codes = SUPPORTED_LOCALES_35.map((l) => l.code);
    expect(SUPPORTED_LOCALES_35).toHaveLength(35);
    for (const l of ACTIVE_LANGS) {
      expect(codes).toContain(l);
      if (l !== 'pl') expect(hasDictionary(l)).toBe(true);
    }
  });
});
