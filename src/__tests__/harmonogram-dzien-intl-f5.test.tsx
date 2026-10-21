/**
 * Ekran planu: dzień dalszy niż „Pojutrze” (albo miniony, gdy plan był otwarty przez północ) pokazuje dzień
 * tygodnia z datą przez Intl w języku aplikacji (`formatDzienData`), a nie składankę kluczy „Czw.” + „paź”
 * z przekładu maszynowego [audyt-niezalezny F-5].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { setActiveBake, initDatabase } from '../data/sqlite-store';
import { setLang } from '../lib/i18n';
import { formatDzienData } from '../lib/format';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

function tekst(n: any): string {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (!n) return '';
  if (Array.isArray(n)) return n.map(tekst).join('');
  if (n.children) return tekst(n.children);
  if (n.props?.children) return tekst(n.props.children);
  return '';
}

describe('ekran planu: dzień z datą przez Intl (F-5)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    jest.useFakeTimers({ now: new Date(2026, 9, 21, 14, 0, 0, 0), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    zUprawnieniem();
    setActiveBake(null);
    await initDatabase();
  });

  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    setLang('pl');
    jest.useRealTimers();
  });

  it.each(['pl', 'en', 'de'])('%s: cel „Jutro” (22.10) oglądany 25.10 — data w formacie Intl języka', async (lang) => {
    setLang(lang);
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });
    // plan otwarty do 25.10: cel (jutro względem 21.10) jest już 3 dni temu; zmiana czasu w lodówce odświeża ekran
    jest.setSystemTime(new Date(2026, 9, 25, 14, 0, 0, 0));
    const chip = tree!.root.findAll(
      (n) => typeof n.props?.onPress === 'function' && n.props?.accessibilityState?.selected === false && /12/.test(tekst(n.props.children)),
    )[0];
    await act(async () => {
      chip.props.onPress();
      await Promise.resolve();
    });
    const oczekiwany = formatDzienData(new Date(2026, 9, 22, 10, 0));
    expect(oczekiwany).toBe(new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(2026, 9, 22)));
    expect(tekst(tree!.toJSON())).toContain(oczekiwany);
  });
});
