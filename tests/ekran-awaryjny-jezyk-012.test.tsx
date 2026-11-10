/**
 * Ekran awaryjny po dwóch nieudanych startach jest w języku urządzenia, nie zawsze po polsku
 * [M1-audytor-generalny-012; 09-lokalizacja-002]: gałąź awaryjna nie dotyka bazy, więc język z systemu (bez zapisu).
 */
let mockTagi = ['de-DE'];
jest.mock('expo-localization', () => ({
  getLocales: () => mockTagi.map((t) => ({ languageTag: t, languageCode: t.slice(0, 2), regionCode: t.slice(3) })),
  getCalendars: () => [{ firstWeekday: 2, uses24hourClock: true }],
}));
jest.mock('../src/lib/startup-guard', () => ({
  ...jest.requireActual('../src/lib/startup-guard'),
  beginStartup: jest.fn().mockResolvedValue({ rescue: true }),
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { lang, setLang, t, ustawJezykSystemu } from '../src/lib/i18n';

const TYTUL = 'Piekarz nie uruchomił się poprawnie';
const PONOW = 'Spróbuj ponownie';

async function teksty(): Promise<string[]> {
  setLang('pl');
  const RootLayout = require('../app/_layout').default;
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<RootLayout />);
  });
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
  const wynik = tree.root.findAll((n) => (n.type as unknown) === 'Text').map((n) => n.children.filter((c) => typeof c === 'string').join(''));
  act(() => tree.unmount());
  return wynik;
}

describe('012: ekran awaryjny w języku urządzenia', () => {
  afterAll(() => setLang('pl'));
  it.each([
    ['de-DE', 'de'],
    ['en-US', 'en'],
  ] as const)('telefon %s → ekran awaryjny w języku %s', async (tag, l) => {
    mockTagi = [tag];
    const ekran = await teksty();
    expect(lang()).toBe(l);
    setLang(l);
    expect(t(TYTUL)).not.toBe(TYTUL);
    expect(ekran).toEqual(expect.arrayContaining([t(TYTUL), t(PONOW)]));
    expect(ekran).not.toContain(TYTUL);
  });
  it('ustawJezykSystemu: język z tagów urządzenia, bez zapisu w bazie', () => {
    mockTagi = ['fr-FR'];
    setLang('pl');
    ustawJezykSystemu();
    expect(lang()).toBe('fr');
  });
});
