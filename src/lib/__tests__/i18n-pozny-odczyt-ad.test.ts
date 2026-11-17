/**
 * Spóźniony odczyt zapisanego języka a wybór w Ustawieniach (KO-072, recenzja AC-03, D-427). Po limicie startu (D-425) ekrany
 * rysują się w języku systemu, a odczyt `app_settings` dochodzi później i woła `setLang(zapisany)`. Jeśli użytkownik w tym oknie
 * wybrał język w Ustawieniach (`chooseLanguage`), spóźniony odczyt nie może go nadpisać.
 */
let mockOdczyt: (() => Promise<string | undefined>) | null = null;
const mockZapis = jest.fn(async () => undefined);
jest.mock('../../data/settings-store', () => ({
  getAppSetting: () => (mockOdczyt as () => Promise<string | undefined>)(),
  setAppSetting: (...a: unknown[]) => (mockZapis as (...x: unknown[]) => Promise<undefined>)(...a),
}));
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageTag: 'pl-PL', languageCode: 'pl' }] }));

import { chooseLanguage, initLanguage, lang, setLang } from '../i18n';

afterEach(() => {
  setLang('pl');
  mockZapis.mockClear();
});

describe('initLanguage a wybór w trakcie odczytu (AC-03)', () => {
  it('wybór z Ustawień w czasie odczytu nie jest nadpisany zapisanym językiem', async () => {
    let dostarcz!: (v: string) => void;
    mockOdczyt = () => new Promise<string | undefined>((r) => { dostarcz = r; });
    setLang('pl');
    const start = initLanguage();
    await chooseLanguage('en');
    expect(lang()).toBe('en');
    dostarcz('pl');
    await start;
    expect(lang()).toBe('en');
    expect(mockZapis).toHaveBeenCalledWith('language', 'en');
  });

  it('bez wyboru w międzyczasie odczyt ustawia zapisany język (D-425)', async () => {
    mockOdczyt = async () => 'en';
    setLang('pl');
    await initLanguage();
    expect(lang()).toBe('en');
  });

  it('wybór przed startem odczytu nie blokuje odczytu', async () => {
    await chooseLanguage('en');
    mockOdczyt = async () => 'en';
    setLang('pl');
    await initLanguage();
    expect(lang()).toBe('en');
  });
});
