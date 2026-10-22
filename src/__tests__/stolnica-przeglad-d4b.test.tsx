/**
 * Przegląd roli 04 z raportu D3a w układzie D4b (M3 D4b): (a) wejście do Doktora z ekranu prowadzenia (BR-DIAG-003
 * „Powrót do prowadzenia”), według wzorca PrzyciskNaglowka; (b) przełącznik wypieków na Stolnicy: druga linia
 * „do {godzina}” jak w makiecie roli 04 (`przelacznik`); (c) pytanie przy starcie z jednym trwającym: treść z nazwą
 * i krokiem, nie sam tytuł.
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
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: mockPush, navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => mockParams,
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: React.ReactNode }) => children, {
      Screen: ({ options }: { options?: { headerRight?: (p: object) => React.ReactNode } }) =>
        options?.headerRight ? React.createElement(React.Fragment, null, options.headerRight({})) : null,
    }),
  };
});

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps } from '../core/bake-steps';
import { saveBakeSession, type BakeSession } from '../data/bake-session-store';
import { confirmStartPrzyTrwajacym } from '../lib/confirm';
import { trwajaceWypieki } from '../lib/przerwij-wypiek';
import { formatTime } from '../lib/format';
import { setLang, t } from '../lib/i18n';
import { EN } from '../lib/i18n.en';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.accessibilityLabel === 'string' && typeof n.props.onPress === 'function');

describe('D4b: przegląd roli 04 z D3a (Stolnica, pytanie przy starcie)', () => {
  const now = 1_800_000_000_000;
  const kroki = planBakeSteps({ startAt: now - 3_600_000, isHighRye: false });
  const wypiek = (id: string, nazwa: string, stepIdx: number, timerEndsAt: number): BakeSession => ({
    version: 2, steps: kroki, stepIdx, dutchOvenPhase: 'lid_on', timerEndsAt, pausedLeftSec: null, recipeName: nazwa, startedAt: now - 3_600_000,
    bake: { id, recipeName: nazwa, startedAt: now - 3_600_000, currentStageId: kroki[stepIdx].id, zaczetyZDostepem: true },
  });
  const CHLEB = wypiek('bake_chleb', 'Chleb', 2, now + 20 * 60_000);
  const PIZZA = wypiek('bake_pizza', 'Pizza', 1, now + 45 * 60_000);
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    mockParams = {};
    mockPush.mockReset();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    jest.restoreAllMocks();
  });
  const render = async () => {
    await act(async () => {
      tree = renderer.create(<StolnicaScreen />);
    });
    await flush();
    return tree!.root;
  };

  it('BR-DIAG-003 Powrót do prowadzenia: w trwającym wypieku nagłówek ma „Doktor” obok „Plan wypieku”, Doktor otwiera się nad prowadzeniem', async () => {
    await saveBakeSession(CHLEB);
    mockParams = { wypiek: 'bake_chleb' };
    const root = await render();
    expect(przycisk(root, 'bake-plan-btn')).toHaveLength(1);
    const doktor = przycisk(root, 'stolnica-doctor-shortcut-btn');
    expect(doktor).toHaveLength(1);
    expect(doktor[0].props.accessibilityLabel).toBe('Doktor Chleba');
    await act(async () => doktor[0].props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/doktor');
  });

  it('przełącznik: druga linia „do {godzina}” (koniec bieżącego kroku), VoiceOver z krokiem i godziną', async () => {
    await saveBakeSession(CHLEB);
    await saveBakeSession(PIZZA);
    mockParams = { wypiek: 'bake_pizza' };
    const root = await render();
    const tab = (id: string) => root.findByProps({ testID: `przelacznik-wypiek-${id}` });
    expect(textOf(tab('bake_chleb').props.children)).toContain(`do ${formatTime(now + 20 * 60_000)}`);
    expect(textOf(tab('bake_pizza').props.children)).toContain(`do ${formatTime(now + 45 * 60_000)}`);
    expect(tab('bake_chleb').props.accessibilityLabel).toBe(`Chleb, krok: ${t(kroki[2].name)}, do ${formatTime(now + 20 * 60_000)}`);
  });

  it('pytanie przy starcie z jednym trwającym: treść z nazwą i krokiem („{wypiek}: {krok}, trwa”)', async () => {
    await saveBakeSession(CHLEB);
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const [trwa] = await trwajaceWypieki();
    expect(trwa).toEqual({ id: 'bake_chleb', nazwa: 'Chleb', krok: kroki[2].name });
    confirmStartPrzyTrwajacym(trwa, jest.fn(), jest.fn());
    const [tytul, tresc] = alert.mock.calls[0];
    expect(tytul).toBe('Trwa już inny wypiek');
    expect(tresc).toBe(`Chleb: ${t(kroki[2].name)}, trwa`);
    expect(['{wypiek}: {krok}, trwa', '{wypiek}, krok: {krok}, do {godzina}'].filter((k) => typeof EN[k] !== 'string')).toEqual([]);
  });
});
