/**
 * Zmiana języka a ekrany już zamontowane (KO-071, recenzja AB-04, D-424). Ekrany nawigatora są owinięte w `StaticContainer`
 * (expo-router/build/react-navigation/core/SceneView.js), który blokuje ponowny render ekranu przy renderze układu; `t()` nie
 * subskrybuje języka. Bez własnej subskrypcji ekran innej zakładki zostawał po zmianie języka (Ustawienia na „Dziś”) przy
 * starych tekstach i starym kroju tytułu do najbliższego własnego renderu. Test: ekran za prawdziwym StaticContainer
 * zmienia tytuł i krój po `setLang`, bez remontowania (stan ekranu zostaje). Pokrycie wszystkich tras: tests/jezyk-ekrany-straznik-ac.test.ts.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
// Licznik zamontowań ekranu: useFocusEffect woła efekt raz na montowanie (zmiana języka nie remontuje ekranu)
const mockMontowania = { n: 0 };
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) =>
      React.useEffect(() => {
        mockMontowania.n += 1;
        return cb();
      }, []),
  };
});

import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { StaticContainer } from 'expo-router/build/react-navigation/core/StaticContainer';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import RecepturyLista from '../../app/(tabs)/receptury/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang, t } from '../lib/i18n';
import { typografia } from '../ui/tokeny';

jest.setTimeout(30000);

const nawigacja = {};
const trasa = {};
const ekran = (Komponent: React.ComponentType) => (
  <AppAccessProvider>
    {/* Jak SceneView: ekran za StaticContainer, bez zmiany propsów */}
    <StaticContainer name="ekran" render={Komponent} navigation={nawigacja} route={trasa}>
      <Komponent />
    </StaticContainer>
  </AppAccessProvider>
);
const naglowek = (tree: renderer.ReactTestRenderer) => {
  const [n] = tree.root.findAll((x) => (x.type as unknown) === 'Text' && x.props.accessibilityRole === 'header');
  expect(n).toBeDefined();
  return { tekst: String(n!.props.children), krój: StyleSheet.flatten(n!.props.style).fontFamily };
};

describe.each([
  ['Dziennik', 'Dziennik', DziennikScreen],
  ['Receptury', 'Receptury', RecepturyLista],
] as const)('ekran %s za StaticContainer po zmianie języka', (_nazwa, klucz, Komponent) => {
  beforeEach(async () => {
    setLang('pl');
    mockMontowania.n = 0;
    zUprawnieniem();
    _resetMemStore();
    await initDatabase();
  });
  afterEach(() => setLang('pl'));

  it.each(['ru', 'uk', 'vi', 'ja'] as const)('pl → %s: tytuł pasa w nowym języku i kroju systemowym bez ręcznego przejścia', async (jezyk) => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(ekran(Komponent));
    });
    await act(async () => {
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    expect(naglowek(tree)).toEqual({ tekst: klucz, krój: typografia.krojTytulow });
    const montowania = mockMontowania.n;
    expect(montowania).toBeGreaterThan(0);
    await act(async () => {
      setLang(jezyk);
    });
    // Układ renderuje się ponownie (jak po zmianie języka w nawigatorze), a StaticContainer zostawia ekran bez zmian
    await act(async () => {
      tree.update(ekran(Komponent));
    });
    expect(naglowek(tree)).toEqual({ tekst: t(klucz), krój: undefined });
    expect(t(klucz)).not.toBe(klucz);
    // bez remontowania: stan ekranu (formularze w toku) zostaje
    expect(mockMontowania.n).toBe(montowania);
    act(() => tree.unmount());
  });
});
