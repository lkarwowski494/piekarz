/**
 * M1-audytor-generalny-102 (BR-HARMO-005, F-13; design-spec §5 „Zrobione”, „Cofnij poprzedni”, Pasek „Cofnij”):
 * na ekranie prowadzenia krok można zakończyć wcześniej i cofnąć pomyłkowe potwierdzenie; zaplanowane
 * powiadomienia przeliczają się w obu przypadkach (test z zegarem), pasek „Cofnięto …” ma „Przywróć”.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
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
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as Notifications from 'expo-notifications';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps } from '../core/bake-steps';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang, t } from '../lib/i18n';

type Mock = { pending: Map<string, { identifier: string; trigger: { date: number } }>; iosStatus: number };
const mock = (Notifications as unknown as { __mock: Mock }).__mock;
const terminy = () => Object.fromEntries([...mock.pending.values()].map((p) => [p.identifier, p.trigger.date]));
const MIN = 60_000;

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const przycisk = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => n.props.testID === id && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function')[0];
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 60; i++) await new Promise((r) => setImmediate(r));
  });
};
const press = async (root: renderer.ReactTestInstance, id: string) => {
  await act(async () => {
    przycisk(root, id).props.onPress();
  });
  await settle();
};

describe('102: Zrobione wcześniej, Cofnij poprzedni i Przywróć z powiadomieniami (BR-HARMO-005)', () => {
  const T0 = Date.UTC(2026, 9, 21, 8, 0);
  let now = T0;
  beforeAll(() => {
    useTempDbDir();
  });
  beforeEach(async () => {
    zUprawnieniem();
    mock.pending.clear();
    mock.iosStatus = 2;
    now = T0;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('krok zakończony 30 min wcześniej przesuwa dalsze kroki i powiadomienia; cofnięcie przywraca plan; Przywróć ponawia', async () => {
    setActiveBake({ id: 'bake_102', recipeName: 'Chleb', startedAt: T0, currentStageId: 'step_1' });
    const plan = planBakeSteps({ startAt: T0, isHighRye: false });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<StolnicaScreen />);
    });
    await settle();
    const root = tree.root;

    // Plan od startu: krok 1 (6 h) i kolejne kroki na planowany koniec
    const przed = terminy();
    expect(przed['piekarz.wypiek.bake_102.krok']).toBe(T0 + 360 * MIN);
    expect(przed['piekarz.wypiek.bake_102.krok.2']).toBe(plan[2].plannedEnd);
    expect(przycisk(root, 'step-undo-btn').props.accessibilityState).toEqual({ disabled: true });

    // „Zrobione” 30 min przed terminem kroku 1
    now = T0 + 330 * MIN;
    await press(root, 'next-or-finish-step-btn');
    expect(textOf(tree.toJSON())).toContain('Krok 2 z 11');
    const wczesniej = terminy();
    expect(wczesniej['piekarz.wypiek.bake_102.krok']).toBe(now + 45 * MIN);
    expect(wczesniej['piekarz.wypiek.bake_102.krok.2']).toBe((plan[2].plannedEnd ?? 0) - 30 * MIN);
    expect(wczesniej['piekarz.wypiek.bake_102.krok.10']).toBe((plan[10].plannedEnd ?? 0) - 30 * MIN);

    // „Cofnij poprzedni”: wraca krok 1, plan i powiadomienia z poprzednimi godzinami; pasek „Cofnięto …” z „Przywróć”
    now += MIN;
    expect(przycisk(root, 'step-undo-btn').props.accessibilityState).toEqual({ disabled: false });
    await press(root, 'step-undo-btn');
    expect(textOf(tree.toJSON())).toContain('Krok 1 z 11');
    expect(terminy()).toEqual(przed);
    const pasek = root.findAll((n) => n.props.testID === 'undo-bar' && typeof n.type === 'string');
    expect(pasek).toHaveLength(1);
    expect(textOf(pasek[0])).toContain(
      'Cofnięto „Dokarmienie zakwasu (osiągnięcie szczytu)”. Powiadomienia wróciły do poprzednich godzin.'
    );

    // „Przywróć”: potwierdzenie wraca razem z przesuniętym planem i powiadomieniami
    await press(root, 'undo-restore-btn');
    expect(textOf(tree.toJSON())).toContain('Krok 2 z 11');
    expect(terminy()).toEqual(wczesniej);
    expect(root.findAll((n) => n.props.testID === 'undo-bar')).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('pasek „Cofnięto …” i „Przywróć” mają tekst EN z makiety (teksty.js pw.cofnieto, pw.przywroc)', () => {
    setLang('en');
    try {
      expect(t('Cofnięto „{krok}”. Powiadomienia wróciły do poprzednich godzin.', { krok: 'Fold 2 of 4' })).toBe(
        'Undid “Fold 2 of 4.” Notifications are back to their previous times.'
      );
      expect(t('Przywróć')).toBe('Restore');
    } finally {
      setLang('pl');
    }
  });

  it('krok potwierdzony po terminie przesuwa dalsze kroki później (BR-HARMO-004 Spóźnione składanie, BR-CZAS-002 Zmiana planu)', async () => {
    setActiveBake({ id: 'bake_102b', recipeName: 'Chleb', startedAt: T0, currentStageId: 'step_1' });
    const plan = planBakeSteps({ startAt: T0, isHighRye: false });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<StolnicaScreen />);
    });
    await settle();
    now = T0 + 380 * MIN; // 20 min po terminie kroku 1
    await press(tree.root, 'next-or-finish-step-btn');
    expect(terminy()['piekarz.wypiek.bake_102b.krok.2']).toBe((plan[2].plannedEnd ?? 0) + 20 * MIN);
    act(() => tree.unmount());
  });
});
