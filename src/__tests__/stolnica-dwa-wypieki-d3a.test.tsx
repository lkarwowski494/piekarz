/**
 * D3a: Stolnica wybranego wypieku przy dwóch trwających (BR-KAL-016 „Który krok czyj”, „Koniec jednego”). Wypiek
 * z trasy (`wypiek` = id, powiadomienie kroku albo „Wróć do: …”), przełącznik z nazwą receptury i bieżącym krokiem,
 * zapis kroku, koniec i przerwanie tylko wybranego wypieku; drugi trwa dalej na tym samym kroku z tym samym zegarem
 * [M3 D3a; przegląd danych D1 P2-3].
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
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake, _resetMemStore, getBakeLogs } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps } from '../core/bake-steps';
import { saveBakeSession, type BakeSession } from '../data/bake-session-store';
import { loadActiveBakeSessions } from '../data/bake-sessions-store';
import { setLang, t } from '../lib/i18n';
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

const nazwaNaEkranie = (root: renderer.ReactTestInstance) => textOf(root.findAllByProps({ testID: 'stolnica-nazwa-wypieku' })[0]?.props.children);

describe('D3a: Stolnica przy dwóch trwających wypiekach', () => {
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
  const CHLEB = wypiek('bake_chleb', 'Chleb', 2, now + 20 * 60_000);
  const PIZZA = wypiek('bake_pizza', 'Pizza', 1, now + 45 * 60_000);
  const zapis = async () => Object.fromEntries((await loadActiveBakeSessions()).map((s) => [s.bake?.id, s]));

  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    mockParams = {};
    mockReplace.mockClear();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    await initDatabase();
    await saveBakeSession(null);
    await saveBakeSession(CHLEB);
    await saveBakeSession(PIZZA);
  });
  afterEach(() => jest.restoreAllMocks());

  it('BR-KAL-016 Który krok czyj: trasa z id otwiera ten wypiek, ekran prowadzenia go nazywa, przełącznik pokazuje oba z bieżącym krokiem', async () => {
    mockParams = { wypiek: 'bake_pizza' };
    const tree = await render();
    expect(nazwaNaEkranie(tree.root)).toBe('Pizza');
    const tab = (id: string) => tree.root.findByProps({ testID: `przelacznik-wypiek-${id}` });
    expect(tab('bake_pizza').props.accessibilityState).toEqual({ selected: true });
    expect(tab('bake_chleb').props.accessibilityState).toEqual({ selected: false });
    expect(tab('bake_chleb').props.accessibilityRole).toBe('tab');
    expect(tab('bake_chleb').props.accessibilityLabel).toBe(`Chleb, krok: ${t(kroki[2].name)}`);
    expect(textOf(tab('bake_pizza').props.children)).toContain(t(kroki[1].name));

    await act(async () => {
      tab('bake_chleb').props.onPress();
    });
    await flush();
    expect(nazwaNaEkranie(tree.root)).toBe('Chleb');
    expect(tree.root.findByProps({ testID: 'przelacznik-wypiek-bake_chleb' }).props.accessibilityState).toEqual({ selected: true });
    act(() => tree.unmount());
  });

  it('bez trasy otwiera najstarszy trwający; jeden trwający bez przełącznika', async () => {
    let tree = await render();
    expect(nazwaNaEkranie(tree.root)).toBe('Chleb');
    act(() => tree.unmount());
    await saveBakeSession(null);
    await saveBakeSession(PIZZA);
    mockParams = { wypiek: 'bake_ktorego_nie_ma' };
    tree = await render();
    expect(nazwaNaEkranie(tree.root)).toBe('Pizza');
    expect(tree.root.findAllByProps({ testID: 'przelacznik-wypiekow' })).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('zapis kroku pizzy nie zmienia chleba; „Zrobione” na pizzy przesuwa tylko pizzę', async () => {
    mockParams = { wypiek: 'bake_pizza' };
    const tree = await render();
    await act(async () => {
      tree.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
    });
    await flush();
    const z = await zapis();
    expect(z.bake_pizza.stepIdx).toBe(2);
    expect(z.bake_chleb).toEqual(CHLEB);
    act(() => tree.unmount());
  });

  it('BR-KAL-016 Koniec jednego: koniec pizzy z oceną zapisuje jej wpis, a chleb trwa dalej na tym samym kroku z tym samym zegarem', async () => {
    mockParams = { wypiek: 'bake_pizza' };
    const wpisyPrzed = (await getBakeLogs()).map((b) => b.id);
    const tree = await render();
    await act(async () => {
      pressables(tree.root, 'Plan wypieku')[0].props.onPress();
    });
    await act(async () => {
      pressables(tree.root, t(kroki[kroki.length - 1].name))[0].props.onPress();
    });
    await act(async () => {
      tree.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
    });
    await act(async () => {
      await pressables(tree.root, 'Zapisz')[0].props.onPress();
    });
    await flush();
    const z = await zapis();
    expect(Object.keys(z)).toEqual(['bake_chleb']);
    expect(z.bake_chleb).toEqual(CHLEB);
    expect((await getBakeLogs()).filter((b) => !wpisyPrzed.includes(b.id)).map((b) => b.recipeName)).toEqual(['Pizza']);
    expect(mockReplace).toHaveBeenCalledWith('/');
    act(() => tree.unmount());
  });

  it('przerwanie pizzy na Stolnicy kasuje tylko pizzę, bez wpisu w dzienniku', async () => {
    mockParams = { wypiek: 'bake_pizza' };
    const wpisyPrzed = (await getBakeLogs()).length;
    const tree = await render();
    await act(async () => {
      pressables(tree.root, 'Plan wypieku')[0].props.onPress();
    });
    await act(async () => {
      tree.root.findByProps({ testID: 'discard-bake-btn' }).props.onPress();
    });
    await flush();
    const z = await zapis();
    expect(Object.keys(z)).toEqual(['bake_chleb']);
    expect(z.bake_chleb).toEqual(CHLEB);
    expect(await getBakeLogs()).toHaveLength(wpisyPrzed);
    act(() => tree.unmount());
  });
});
