/**
 * M1-audytor-generalny-056 (04-studio-projektowe-004; DEC-09 a): prowadzenie wypieku w widoku skupionym
 * z paskiem kciuka — test akceptacyjny design-spec §11b „056”, punkty (1)–(5).
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style, testID }: { children: React.ReactNode; style?: unknown; testID?: string }) =>
      React.createElement('View', { style, testID }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 34 }),
  };
});

import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { zacznijWypiekBezReceptury } from '../../tests/helpers/wypiek';
import { initDatabase, setActiveBake, getActiveBake, _resetMemStore } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

type Inst = renderer.ReactTestInstance;
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const pressable = (root: Inst, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label))[0];
/** Przycisk (Pressable z rolą button i onPress) z danym testID, bez węzłów hosta i komponentów opakowujących. */
const byId = (root: Inst, id: string) =>
  root.findAll((n) => n.props.testID === id && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function');
const minHeight = (n: Inst) => Number(StyleSheet.flatten(n.props.style)?.minHeight ?? 0);

let tree: renderer.ReactTestRenderer | null = null;
// Wypiek bez receptury jak dawny start ze Stolnicy bez wypieku (117: Stolnica bez wypieku → Dziś)
async function startBake(): Promise<Inst> {
  await zacznijWypiekBezReceptury();
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!.root;
}

describe('056: prowadzenie w widoku skupionym z paskiem kciuka (design-spec §11b)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });
  afterEach(() => {
    if (tree) act(() => tree!.unmount());
    tree = null;
    jest.restoreAllMocks();
  });

  it('(1) thumb-bar ma dokładnie 3 przyciski w kolejności Zrobione, Cofnij poprzedni, Po co ten krok', async () => {
    const root = await startBake();
    const bary = root.findAll((n) => n.props.testID === 'thumb-bar' && typeof n.type === 'string');
    expect(bary).toHaveLength(1);
    const przyciski = bary[0].findAll((n) => n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function');
    expect(przyciski.map((p) => p.props.testID)).toEqual(['next-or-finish-step-btn', 'step-undo-btn', 'step-why-btn']);
    expect(przyciski.map((p) => textOf(p.props.children))).toEqual(['Zrobione', 'Cofnij poprzedni', 'Po co ten krok']);
    expect(przyciski[0].props.accessibilityLabel).toBe('Zrobione: Dokarmienie zakwasu (osiągnięcie szczytu)');
  });

  it('(2) minHeight: Zrobione >= 64, Cofnij poprzedni i Po co ten krok >= 48', async () => {
    const root = await startBake();
    expect(minHeight(byId(root, 'next-or-finish-step-btn')[0])).toBeGreaterThanOrEqual(64);
    expect(minHeight(byId(root, 'step-undo-btn')[0])).toBeGreaterThanOrEqual(48);
    expect(minHeight(byId(root, 'step-why-btn')[0])).toBeGreaterThanOrEqual(48);
  });

  it('(3) thumb-bar nie jest potomkiem ScrollView', async () => {
    const root = await startBake();
    const przewijane = root.findAllByType(ScrollView);
    expect(przewijane.length).toBeGreaterThan(0);
    for (const s of przewijane) expect(s.findAll((n) => n.props.testID === 'thumb-bar')).toHaveLength(0);
  });

  it('(4) na prowadzeniu brak przerwania wypieku, korekt czasu, karty liczb, listy etapów i Start/Wstrzymaj', async () => {
    const root = await startBake();
    expect(root.findAll((n) => n.props.testID === 'discard-bake-btn')).toHaveLength(0);
    expect(root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('adjust-time-'))).toHaveLength(0);
    expect(root.findAll((n) => n.props.testID === 'stolnica-sacred-card')).toHaveLength(0);
    expect(root.findAll((n) => n.props.testID === 'bake-steps-list')).toHaveLength(0);
    const tekst = textOf(tree!.toJSON());
    expect(tekst).not.toContain('Wszystkie etapy wypieku');
    expect(tekst).not.toContain('Przerwij wypiek');
    expect(pressable(root, 'Start')).toBeUndefined();
    expect(pressable(root, 'Wstrzymaj')).toBeUndefined();
    // Czas kroku biegnie od planu: pierwszy krok 6 h, bez przycisku startu
    expect(tekst).toContain('6:00:00');
  });

  it('(4) „Przerwij wypiek” jest na „Plan wypieku” i otwiera Alert z przyciskiem destructive', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const root = await startBake();
    const plan = byId(root, 'bake-plan-btn');
    expect(plan).toHaveLength(1);
    expect(textOf(plan[0].props.children)).toBe('Plan wypieku');
    await act(async () => {
      plan[0].props.onPress();
    });
    // Plan wypieku: lista kroków planu i na dole „Przerwij wypiek”
    expect(root.findAll((n) => n.props.testID === 'bake-steps-list').length).toBeGreaterThan(0);
    const przerwij = byId(root, 'discard-bake-btn');
    expect(przerwij).toHaveLength(1);
    expect(textOf(przerwij[0].props.children)).toBe('Przerwij wypiek');
    await act(async () => {
      przerwij[0].props.onPress();
    });
    expect(alert).toHaveBeenCalledTimes(1);
    const [tytul, tresc, przyciski] = alert.mock.calls[0];
    expect([tytul, tresc]).toEqual(['Przerwać wypiek?', 'Powiadomienia o kolejnych krokach znikną.']);
    const btns = przyciski ?? [];
    expect(btns.map((b) => [b.text, b.style])).toEqual([['Wróć do wypieku', 'cancel'], ['Przerwij', 'destructive']]);
    // Skutek dla danych jak przy dawnym „Odrzuć wypiek”: brak trwającego wypieku
    await act(async () => {
      btns[1].onPress?.();
    });
    expect(getActiveBake()).toBeNull();
    // Bez trwającego wypieku ekran nie prowadzi kroku i przekierowuje na Dziś [M1-audytor-generalny-117]
    expect(byId(tree!.root, 'next-or-finish-step-btn')).toHaveLength(0);
    expect(textOf(tree!.toJSON())).not.toContain('Krok 1 z');
  });

  it('(5) Spirala ma rolę obrazu i etykietę według §2', async () => {
    const root = await startBake();
    const s = root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'brand-spiral');
    expect(s).toHaveLength(1);
    expect(s[0].props.accessibilityRole).toBe('image');
    expect(s[0].props.accessibilityLabel).toMatch(/^Plan wypieku, krok 1 z 11: Dokarmienie zakwasu \(osiągnięcie szczytu\), zostało 6 godzin\. Gotowe .+ o \d\d:\d\d\.$/);
  });
});
