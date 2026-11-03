/**
 * M3 p4b (D-194, O3a z D-141): pas marki na Prowadzeniu jak na Recepturach (p3); makieta
 * docs/design/karty/wypiek.html #prowadzenie, README §4. Tytuł kroku, czas, „potem …”, Spirala i „Gotowe …” na pasie
 * (wcześniej nad kartami, D-191); karta instrukcji, ostrzeżenie i składniki pod pasem bez zmian; jasny pasek stanu.
 * Pas na Planie: STOP D-195 (zmiana dwóch testów spoza D-194), patch w docs/stan-08-p4b-plan-pas.patch.
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
import { StatusBar, StyleSheet, Text } from 'react-native';
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

describe('M3 p4b: pas na Prowadzeniu (D-194)', () => {
  beforeEach(async () => {
    useTempDbDir();
    setLang('pl');
    zUprawnieniem();
    setActiveBake(null);
    await initDatabase();
    await saveBakeSession(null);
    jest.clearAllMocks();
  });
  afterEach(() => jest.restoreAllMocks());

  it('prowadzenie: tytuł kroku, czas, „potem …”, Spirala i „Gotowe …” na pasie; karta instrukcji i ostrzeżenie pod pasem', async () => {
    const bar = jest.spyOn(StatusBar, 'setBarStyle');
    const steps = [krok('pm', 'Mieszanie i autoliza', 'mix', 0), krok('pf', 'Fermentacja', 'bulk_ferment', 1), krok('pp', 'Pieczenie', 'bake', 2)];
    setActiveBake({ id: 'bake_p', recipeName: 'Wiejski', startedAt: teraz, currentStageId: 'pm', steps });
    const tree = await zamontuj(<StolnicaScreen />);
    const pas = pasEkranu(tree.root);
    expect(naglowkiPasa(pas)).toEqual(['Mieszanie i autoliza']);
    for (const id of ['step-title', 'step-time', 'step-next', 'brand-spiral', 'stolnica-nazwa-wypieku']) {
      expect([id, poId(pas, id).length > 0]).toEqual([id, true]);
    }
    expect(poId(tree.root, 'step-title')).toHaveLength(1);
    expect(poId(tree.root, 'step-time')).toHaveLength(1);
    expect(poId(pas, 'karta-kroku')).toHaveLength(0);
    expect(poId(tree.root, 'karta-kroku').length).toBeGreaterThan(0);
    // Na pasie tekst w kolorach pasa (naPasie), nie tuszu tła
    expect(StyleSheet.flatten(poId(pas, 'step-time')[0].props.style).color).toBe(theme.colors.naPasie);
    expect(bar).toHaveBeenCalledWith('light-content', true);
    act(() => tree.unmount());
  });
});
