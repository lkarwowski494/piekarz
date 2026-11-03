/**
 * M3 p6b (D-209, D-192, README §6, makieta karty/wypiek.html #prowadzenie): numer kroku „Krok {n} z {m}” na pasie
 * Prowadzenia (pod tytułem kroku, kolorem pasa, bez roli nagłówka), a karta instrukcji z nagłówkiem „Co zrobić”.
 * Zegar kroku, powiadomienia i Sleep Guard bez zmian (zmienia się tylko tekst i miejsce numeru).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), navigate: jest.fn() };
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => mockRouter,
    router: mockRouter,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: React.ReactNode }) => children, {
      Screen: ({ options }: { options?: { headerRight?: () => React.ReactNode } }) => (options?.headerRight ? options.headerRight() : null),
    }),
  };
});

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { saveBakeSession } from '../data/bake-session-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import type { SessionStep } from '../core/bake-steps';
import { theme } from '../ui/theme';
import { setLang } from '../lib/i18n';


jest.setTimeout(30000);
type Wezel = renderer.ReactTestInstance;
const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const poId = (root: Wezel, id: string): Wezel[] => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string');
const pasEkranu = (root: Wezel): Wezel => {
  const p = poId(root, 'pas-zakladki');
  expect(p).toHaveLength(1);
  expect(StyleSheet.flatten(p[0].props.style).backgroundColor).toBe(theme.colors.pas);
  return p[0];
};
const naglowkiPasa = (pas: Wezel) => pas.findAllByType(Text).filter((n) => n.props.accessibilityRole === 'header').map(tekst);

async function zamontuj(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(el);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree;
}

const teraz = Date.now();
const krok = (id: string, name: string, category: SessionStep['category'], od: number): SessionStep => ({
  id, name, category, durationMin: 30, isPassive: false, instructions: 'Wymieszaj mąkę z wodą.', plannedStart: teraz + od * 1_800_000, plannedEnd: teraz + (od + 1) * 1_800_000,
});

const naPasie = (n: Wezel): boolean => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) if (p.props?.testID === 'pas-zakladki') return true;
  return false;
};

describe('M3 p6b: numer kroku na pasie, „Co zrobić” w karcie instrukcji (D-209)', () => {
  beforeEach(async () => {
    useTempDbDir();
    setLang('pl');
    zUprawnieniem();
    setActiveBake(null);
    await initDatabase();
    await saveBakeSession(null);
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('pas: „Krok 1 z 3” pod tytułem kroku, w kolorze pasa, bez roli nagłówka; karta instrukcji „Co zrobić”', async () => {
    const steps = [krok('pm', 'Mieszanie i autoliza', 'mix', 0), krok('pf', 'Fermentacja', 'bulk_ferment', 1), krok('pp', 'Pieczenie', 'bake', 2)];
    setActiveBake({ id: 'bake_n', recipeName: 'Wiejski', startedAt: teraz, currentStageId: 'pm', steps });
    const tree = await zamontuj(<StolnicaScreen />);
    const pas = pasEkranu(tree.root);
    const numer = poId(pas, 'step-number');
    expect(numer.map(tekst)).toEqual(['Krok 1 z 3']);
    expect(numer[0].props.accessibilityRole).toBeUndefined();
    expect(StyleSheet.flatten(numer[0].props.style).color).toBe(theme.colors.naPasie2);
    // Numer tylko na pasie; tytuł kroku dalej jedynym nagłówkiem pasa
    const wszystkie = tree.root.findAllByType(Text).filter((n) => tekst(n) === 'Krok 1 z 3');
    expect(wszystkie.filter((n) => !naPasie(n))).toEqual([]);
    expect(naglowkiPasa(pas)).toEqual(['Mieszanie i autoliza']);
    const tytulKarty = poId(tree.root, 'karta-kroku-tytul');
    expect(tytulKarty.map(tekst)).toEqual(['Co zrobić']);
    expect(tytulKarty[0].props.accessibilityRole).toBe('header');
    expect(tekst(poId(tree.root, 'karta-kroku')[0])).toContain('Wymieszaj mąkę z wodą.');
    act(() => tree.unmount());
  });

  it('bez trwającego wypieku: brak numeru kroku na pasie', async () => {
    const tree = await zamontuj(<StolnicaScreen />);
    expect(poId(tree.root, 'step-number')).toHaveLength(0);
    act(() => tree.unmount());
  });
});
