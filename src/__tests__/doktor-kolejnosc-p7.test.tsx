/**
 * M3 p7 (D-214, znalezisko 04-studio-projektowe-006; przejście poznawcze, pytanie 4; D-216): w Doktorze Chleba
 * karta wyniku stoi pod kartami objawów — po wyborze objawu wynik pojawia się pod kartą, w której użytkownik
 * stuknął, a nie nad sekcjami poza widokiem. Protokoły ratunkowe zostają nad objawami (wejście z prowadzenia).
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => jest.requireActual('react').useEffect(cb, []),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import DoctorScreen from '../../app/doktor';
import { setLang } from '../lib/i18n';

type Wezel = renderer.ReactTestInstance;
const pozycja = (root: Wezel, id: string): number => {
  const wszystkie = root.findAll(() => true);
  return wszystkie.findIndex((n) => typeof n.type === 'string' && n.props.testID === id);
};

describe('M3 p7 (04-006): Doktor Chleba — objawy przed wynikiem', () => {
  beforeEach(() => setLang('pl'));

  it('pusty wynik i diagnoza po wyborze objawu stoją pod kartami objawów; protokoły nad objawami', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<DoctorScreen />);
    });
    const root = tree.root;
    const objawy = pozycja(root, 'karta-smak');
    expect(objawy).toBeGreaterThan(-1);
    expect(pozycja(root, 'karta-wynik-pusty')).toBeGreaterThan(objawy);
    const protokoly = pozycja(root, 'karta-protokoly');
    if (protokoly >= 0) expect(protokoly).toBeLessThan(pozycja(root, 'karta-szablony'));
    const przycisk = root.findAll((n) => typeof n.type !== 'string' && n.props.testID === 'objaw-crumbIsWetGummyToKnife' && typeof n.props.onPress === 'function');
    expect(przycisk.length).toBeGreaterThan(0);
    await act(async () => przycisk[0].props.onPress());
    expect(pozycja(root, 'karta-diagnoza-naglowek')).toBeGreaterThan(pozycja(root, 'karta-smak'));
    act(() => tree.unmount());
  });
});
