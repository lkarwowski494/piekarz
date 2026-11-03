// PRZ-07 (przegląd roli 04, D-107): nagłówek Stolnicy przy 320 pt. Do M3 p4 prawe przyciski „Doktor” i „Plan wypieku”
// w nagłówku systemowym zajmowały ok. 176 pt i przy ≤ 336 pt tytuł „Stolnica” był pusty. M3 p4b (D-194, O3a): nagłówek
// stosu ukryty, nawigacja na pasie (PasZakladki): powrót po lewej, „Doktor” i „Plan wypieku” po prawej (rząd zawija się),
// tytuł pasa = nazwa bieżącego kroku (nagłówek VoiceOver) przy każdej szerokości. Tekst przycisku nagłówka skaluje się
// najwyżej 1,5× (jak podpisy zakładek, D-087).
jest.mock('expo-sqlite', () => require('../src/data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = jest.requireActual('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

type Opcje = Record<string, unknown>;
const mockStos: { ekrany: Array<{ name: string; props: Opcje }> } = { ekrany: [] };
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), navigate: jest.fn() };

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = (props: Opcje & { name: string }) => {
    mockStos.ekrany.push({ name: props.name, props });
    return null;
  };
  return {
    Stack,
    router: mockRouter,
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({}),
    // Pas ustawia jasny pasek stanu przy focusie (usePasekStanuJasny, D-194)
    useFocusEffect: (cb: () => void) => ReactMod.useEffect(cb, []),
  };
});
jest.mock('../src/lib/startup-guard', () => ({
  beginStartup: () => new Promise(() => undefined),
  markStartupSucceeded: jest.fn(),
  STARTUP_MILESTONE_MS: 1,
}));
jest.mock('../src/components/StorageGate', () => ({
  StorageGate: ({ children }: { children: React.ReactNode }) => children,
}));

/* eslint-disable @typescript-eslint/no-require-imports */
import { initDatabase, setActiveBake } from '../src/data/sqlite-store';
import { saveBakeSession } from '../src/data/bake-session-store';
import { useTempDbDir } from '../src/data/__tests__/helpers/node-sqlite-adapter';
import { zUprawnieniem } from './helpers/platnosci';
import { setLang } from '../src/lib/i18n';
import type { SessionStep } from '../src/core/bake-steps';
import { theme } from '../src/ui/theme';

jest.setTimeout(30000);
type Wezel = renderer.ReactTestInstance;
const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');

function opcjeStolnicy(szerokosc: number): Opcje | undefined {
  mockStos.ekrany = [];
  mockOkno.width = szerokosc;
  const Layout = require('../app/_layout').default as React.ComponentType;
  let t!: renderer.ReactTestRenderer;
  act(() => {
    t = renderer.create(<Layout />);
  });
  const stolnica = mockStos.ekrany.filter((e) => e.name === 'stolnica').pop();
  act(() => t.unmount());
  return stolnica?.props.options as Opcje | undefined;
}

const teraz = Date.now();
const krok = (id: string, name: string, od: number): SessionStep => ({
  id, name, category: 'mix', durationMin: 30, isPassive: false, instructions: '', plannedStart: teraz + od * 1_800_000, plannedEnd: teraz + (od + 1) * 1_800_000,
});

async function stolnica(szerokosc: number, p: string): Promise<renderer.ReactTestRenderer> {
  mockOkno.width = szerokosc;
  const steps = [krok(`${p}m`, 'Mieszanie i autoliza', 0), krok(`${p}f`, 'Fermentacja', 1)];
  setActiveBake({ id: `bake_${p}`, recipeName: 'Wiejski', startedAt: teraz, currentStageId: steps[0].id, steps });
  const Ekran = require('../app/stolnica').default as React.ComponentType;
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<Ekran />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree;
}

describe('PRZ-07 / D-194: nawigacja Stolnicy na pasie', () => {
  beforeEach(async () => {
    useTempDbDir();
    setLang('pl');
    zUprawnieniem();
    setActiveBake(null);
    await initDatabase();
    await saveBakeSession(null);
    jest.clearAllMocks();
  });

  it.each([320, 336, 375, 390, 430])('szerokość %i pt: nagłówek stosu ukryty, tytuł trasy „Stolnica” bez przycisków systemowych', (w) => {
    const o = opcjeStolnicy(w);
    expect(o).toMatchObject({ headerShown: false, title: 'Stolnica' });
    expect(o?.headerRight).toBeUndefined();
  });

  it.each([320, 336, 390])('szerokość %i pt: na pasie powrót, „Doktor”, „Plan wypieku” i nagłówek VoiceOver z nazwą kroku', async (w) => {
    const tree = await stolnica(w, `w${w}`);
    const pas = tree.root.findAll((n) => n.props.testID === 'pas-zakladki' && typeof n.type === 'string')[0];
    expect(pas).toBeDefined();
    expect(StyleSheet.flatten(pas.props.style).backgroundColor).toBe(theme.colors.pas);
    const naglowek = pas.findAllByType(Text).filter((n) => n.props.accessibilityRole === 'header');
    expect(naglowek.map(tekst)).toEqual(['Mieszanie i autoliza']);
    const id = (x: string) => pas.findAll((n) => typeof n.type === 'string' && n.props.testID === x && n.props.accessibilityRole === 'button');
    expect(id('pas-wstecz-btn')).toHaveLength(1);
    expect(id('pas-wstecz-btn')[0].props.accessibilityLabel).toBeTruthy();
    expect(id('stolnica-doctor-shortcut-btn')).toHaveLength(1);
    expect(id('bake-plan-btn')).toHaveLength(1);
    const nacisnij = (x: string) => pas.findAll((n) => n.props.testID === x && typeof n.props.onPress === 'function')[0].props.onPress();
    await act(async () => nacisnij('pas-wstecz-btn'));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    await act(async () => nacisnij('stolnica-doctor-shortcut-btn'));
    expect(mockRouter.push).toHaveBeenCalledWith('/doktor');
    act(() => tree.unmount());
  });

  it('tekst przycisku nagłówka skaluje się najwyżej 1,5×', () => {
    const { PrzyciskNaglowka } = require('../src/components/nawigacja/PrzyciskNaglowka') as typeof import('../src/components/nawigacja/PrzyciskNaglowka');
    let t!: renderer.ReactTestRenderer;
    act(() => {
      t = renderer.create(<PrzyciskNaglowka testID="x" etykieta="Doktor Chleba" tekst="Doktor" onPress={() => undefined} />);
    });
    expect(t.root.findByType(Text).props.maxFontSizeMultiplier).toBe(1.5);
    act(() => t.unmount());
  });
});
