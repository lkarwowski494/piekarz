/**
 * E2E-90 (p7c): przełącznik wypieków (BR-KAL-016) nie leży w przewijanej treści pod pasem (pas ze spiralą zajmuje
 * ekran, przełącznik wypadał poniżej widocznego obszaru i jego środek trafiał pod dolną strefę akcji); stoi w stałym
 * rzędzie nad paskiem kciuka, segmenty mają cel ≥ 44 pt i tekst bez ucinania; przy dużym tekście (fontScale ≥ 2) przełącznik zostaje w treści.
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
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
let mockParams: Record<string, string> = {};
const mockReplace = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: mockReplace, back: jest.fn() }),
    useLocalSearchParams: () => mockParams,
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: React.ReactNode }) => children, {
      Screen: ({ options }: { options?: { headerRight?: (p: object) => React.ReactNode } }) =>
        options?.headerRight ? React.createElement(React.Fragment, null, options.headerRight({})) : null,
    }),
  };
});
jest.mock('../lib/confirm', () => ({
  ...jest.requireActual('../lib/confirm'),
  confirmDiscardBake: (onConfirm: () => void) => onConfirm(),
}));

import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake, _resetMemStore, getBakeLogs } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps } from '../core/bake-steps';
import { saveBakeSession, type BakeSession } from '../data/bake-session-store';
import { loadActiveBakeSessions } from '../data/bake-sessions-store';
import { setLang, t } from '../lib/i18n';
import { formatTime } from '../lib/format';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const pressables = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label));
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

async function render(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await flush();
  return tree!;
}


const ustawSkale = (width: number, height: number, fontScale: number) => Dimensions.set({ window: { width, height, scale: 2, fontScale }, screen: { width, height, scale: 2, fontScale } });
const DOMYSLNE = Dimensions.get('window');

describe('E2E-90: przełącznik wypieków poza przewijaną treścią', () => {
  const now = 1_800_000_000_000;
  const kroki = planBakeSteps({ startAt: now - 3_600_000, isHighRye: false });
  const wypiek = (id: string, nazwa: string, stepIdx: number, timerEndsAt: number): BakeSession => ({
    version: 2,
    steps: kroki,
    stepIdx,
    dutchOvenPhase: 'lid_on',
    timerEndsAt,
    pausedLeftSec: null,
    recipeName: nazwa,
    startedAt: now - 3_600_000,
    bake: { id, recipeName: nazwa, startedAt: now - 3_600_000, currentStageId: kroki[stepIdx].id, zaczetyZDostepem: true },
  });

  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    mockParams = { wypiek: 'bake_chleb' };
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    // Domyślny fontScale w środowisku testowym RN to 2 (duży tekst): zwykły tekst ustawiamy jawnie
    ustawSkale(390, 844, 1);
    await initDatabase();
    await saveBakeSession(null);
    await saveBakeSession(wypiek('bake_chleb', 'Wiejski chleb codzienny na zakwasie', 2, now + 20 * 60_000));
    await saveBakeSession(wypiek('bake_pizza', 'Pizza', 1, now + 45 * 60_000));
  });
  afterEach(() => {
    jest.restoreAllMocks();
    Dimensions.set({ window: DOMYSLNE, screen: DOMYSLNE });
  });

  it('przełącznik nie jest dzieckiem ScrollView (poza przewijaną treścią), a pasek kciuka dalej jest', async () => {
    const tree = await render();
    const przewijanie = tree.root.findAllByType(ScrollView);
    expect(przewijanie.length).toBeGreaterThan(0);
    expect(tree.root.findAllByProps({ testID: 'przelacznik-wypiekow' }).length).toBeGreaterThan(0);
    for (const s of przewijanie) expect(s.findAllByProps({ testID: 'przelacznik-wypiekow' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'thumb-bar' }).length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('segment: cel co najmniej 44 pt, bez limitu linii i bez ograniczenia skali tekstu (design-spec §3)', async () => {
    const tree = await render();
    const segment = tree.root.findByProps({ testID: 'przelacznik-wypiek-bake_chleb' });
    expect(StyleSheet.flatten(segment.props.style).minHeight).toBeGreaterThanOrEqual(44);
    const teksty = segment.findAllByType(Text);
    expect(teksty).toHaveLength(2);
    for (const tekst of teksty) {
      expect(tekst.props.numberOfLines).toBeUndefined();
      expect(tekst.props.maxFontSizeMultiplier).toBeUndefined();
    }
    act(() => tree.unmount());
  });

  it('duży tekst (fontScale ≥ 2): stały rząd zająłby za dużo ekranu, przełącznik zostaje w przewijanej treści', async () => {
    ustawSkale(320, 568, 3.1);
    const tree = await render();
    const w = tree.root.findAllByType(ScrollView).filter((s) => s.findAllByProps({ testID: 'przelacznik-wypiekow' }).length > 0);
    expect(w.length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
});
