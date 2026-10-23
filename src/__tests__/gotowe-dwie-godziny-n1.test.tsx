/**
 * N1 (weryfikacja poprawek W, M3 W-fix3) na ekranie planu: godzina w polu „Kiedy chleb ma być gotowy?” po „+2 godziny”
 * i „-2 godziny” (wcześniej zaokrąglenie do parzystej pełnej godziny: 9:00 → 10:00, 10:30 → 12:00). Przejście przez
 * północ zmienia dzień (chip dnia i napis w polu), a poza ostatnim dniem planu (D-108) przycisk jest nieaktywny.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { setActiveBake, initDatabase } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { godzinaPola, ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
import { ZASIEG_DNI_PLANU } from '../core/kalendarz-config';
import { formatDzienData } from '../lib/format';

jest.setTimeout(20000);
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const TERAZ = new Date(2026, 9, 21, 14, 0, 0, 0);
const tekst = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (!n || typeof n !== 'object') return '';
  if (Array.isArray(n)) return n.map(tekst).join('');
  const o = n as { children?: unknown; props?: { children?: unknown } };
  if (o.children) return tekst(o.children);
  if (o.props?.children) return tekst(o.props.children);
  return '';
};
const przycisk = (root: renderer.ReactTestInstance, etykieta: string) => {
  const p = root.findAll((n) => typeof n.props?.onPress === 'function' && n.props.accessibilityRole === 'button' && tekst(n.props.children).trim() === etykieta)[0];
  if (!p) throw new Error(`brak przycisku „${etykieta}”`);
  return p;
};
const nacisnij = async (root: renderer.ReactTestInstance, etykieta: string) => {
  await act(async () => {
    przycisk(root, etykieta).props.onPress();
    await Promise.resolve();
  });
};
const dzienPola = (root: renderer.ReactTestInstance) => tekst(root.findByProps({ testID: 'plan-pole-gotowosci' })).replace(/\d{1,2}:\d{2}.*$/, '').trim();
const wybranyDzien = (root: renderer.ReactTestInstance) =>
  root.findAll((n) => typeof n.props?.testID === 'string' && /^plan-dzien-\d+$/.test(n.props.testID) && n.props.accessibilityState?.selected === true && typeof n.props.onPress === 'function')
    .map((n) => Number(n.props.testID.replace('plan-dzien-', '')));

describe('N1: ±2 h na ekranie planu zmienia godzinę „gotowe” o 2 h', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  beforeEach(async () => {
    jest.useFakeTimers({ now: TERAZ, doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    zUprawnieniem();
    setActiveBake(null);
    await initDatabase();
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
      await Promise.resolve();
    });
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    jest.useRealTimers();
  });

  it('pojutrze 9:00 „+2 godziny” → 11:00; 10:30 „+2 godziny” → 12:30; 10:30 „-2 godziny” → 8:30; dzień bez zmian', async () => {
    const root = tree!.root;
    await ustawGodzinePlanu(root, 'Pojutrze', 9);
    await nacisnij(root, '+2 godziny');
    expect(godzinaPola(root)).toBe(11 * 60);
    expect(wybranyDzien(root)).toEqual([2]);
    await ustawGodzinePlanu(root, 'Pojutrze', 10, 30);
    await nacisnij(root, '+2 godziny');
    expect(godzinaPola(root)).toBe(12 * 60 + 30);
    await ustawGodzinePlanu(root, 'Pojutrze', 10, 30);
    await nacisnij(root, '-2 godziny');
    expect(godzinaPola(root)).toBe(8 * 60 + 30);
    expect(dzienPola(root)).toBe('Pojutrze');
  });

  it('pojutrze 22:00 „+2 godziny” → 0:00 dnia następnego (chip i napis w polu), „-2 godziny” wraca do 22:00 pojutrze', async () => {
    const root = tree!.root;
    await ustawGodzinePlanu(root, 'Pojutrze', 22);
    await nacisnij(root, '+2 godziny');
    expect(godzinaPola(root)).toBe(0);
    expect(wybranyDzien(root)).toEqual([3]);
    expect(dzienPola(root)).toBe(formatDzienData(new Date(2026, 9, 24)));
    await nacisnij(root, '-2 godziny');
    expect(godzinaPola(root)).toBe(22 * 60);
    expect(wybranyDzien(root)).toEqual([2]);
  });

  it(`ostatni dzień planu (+${ZASIEG_DNI_PLANU}) 23:00: „+2 godziny” nieaktywny, godzina i dzień bez zmian; „-2 godziny” działa`, async () => {
    const root = tree!.root;
    await act(async () => {
      root.findAll((n) => n.props?.testID === `plan-dzien-${ZASIEG_DNI_PLANU}` && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    for (let i = 0; godzinaPola(root) !== 23 * 60; i++) {
      if (i > 48) throw new Error('nie da się ustawić 23:00');
      await nacisnij(root, godzinaPola(root) < 23 * 60 ? '+30 min' : '-30 min');
    }
    const plus = przycisk(root, '+2 godziny');
    expect(plus.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    await nacisnij(root, '+2 godziny');
    expect(godzinaPola(root)).toBe(23 * 60);
    expect(wybranyDzien(root)).toEqual([ZASIEG_DNI_PLANU]);
    expect(przycisk(root, '-2 godziny').props.accessibilityState?.disabled).not.toBe(true);
    await nacisnij(root, '-2 godziny');
    expect(godzinaPola(root)).toBe(21 * 60);
  });
});
