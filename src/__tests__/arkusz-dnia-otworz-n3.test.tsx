/**
 * N3 (weryfikacja poprawek W, M3 W-fix3): „Otwórz” przy zaległym kroku wypieku albo zaległym starcie planu w arkuszu dnia
 * wołało akcję bez zamknięcia arkusza — arkusz planu wchodził na arkusz dnia (dwa pageSheety naraz, D-117), a Stolnica
 * otwierała się pod otwartym arkuszem. Teraz jak zwykłe wiersze arkusza (`przejdz`): arkusz dnia się zamyka; arkusz planu
 * otwiera się dopiero po zniknięciu arkusza dnia (onDismiss, iOS), Stolnica przy zamkniętym arkuszu.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  const nawigacja = { push: (...a: unknown[]) => mockPush(...a), navigate: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    get router() {
      return nawigacja;
    },
    useRouter: () => nawigacja,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { Alert, Modal } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { ArkuszDnia } from '../components/kalendarz/ArkuszDnia';
import { ArkuszPlanu } from '../components/start/ArkuszPlanu';
import { initDatabase, _resetMemStore, getStarters, deleteStarter } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { deleteBakeSession, loadPlannedBakes, savePlannedBake, type PlannedBake } from '../data/bake-sessions-store';
import { planBakeSteps } from '../core/bake-steps';
import { localDateKey } from '../core/dzien-lokalny';
import { _resetStanu } from '../lib/platnosci/stan';
import { ustawEkranZakupu } from '../lib/platnosci/ekran';
import { ustawDzienGotowe } from '../lib/plan-receptury';
import { mockIap, zUprawnieniem } from '../../tests/helpers/platnosci';

const H = 3_600_000;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const modal = (root: renderer.ReactTestInstance, typ: React.ElementType) => root.findByType(typ).findByType(Modal);
/** „Otwórz” zaległego w arkuszu dnia (ten sam wiersz co na pasie, `zalegle-zrobione-…`). */
const otworzWArkuszu = (root: renderer.ReactTestInstance, prefiks: string) =>
  root.findByType(ArkuszDnia).findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string'
    && n.props.testID.startsWith(`zalegle-zrobione-${prefiks}`) && typeof n.props.onPress === 'function');

function plan(id: string, nazwa: string, start: number): PlannedBake {
  const steps = planBakeSteps({ startAt: start, isHighRye: false });
  return { version: 1, id, recipeName: nazwa, plannedStartAt: start, steps, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[0].id, steps } };
}
const wypiek = (id: string, nazwa: string) => {
  const start = Date.now() - 2 * H;
  const steps = planBakeSteps({ startAt: start, isHighRye: false });
  return {
    version: 2 as const, steps, stepIdx: 1, dutchOvenPhase: 'lid_on' as const, timerEndsAt: Date.now() - 60_000, pausedLeftSec: null,
    recipeName: nazwa, startedAt: start, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[1].id },
  };
};

let tree: renderer.ReactTestRenderer | null = null;
async function zamontuj() {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><StartScreen /></AppAccessProvider>);
  });
  await flush();
  const root = tree!.root;
  await act(async () => root.findAll((n) => typeof n.type !== 'string' && n.props.testID === `pasek-dzien-${localDateKey(Date.now())}` && typeof n.props.onPress === 'function')[0].props.onPress());
  await flush();
  expect(modal(root, ArkuszDnia).props.visible).toBe(true);
  return root;
}

let alertSpy: jest.SpyInstance;
beforeEach(async () => {
  jest.useFakeTimers({ now: new Date(2026, 9, 21, 12, 0, 0, 0), doNotFake: ['nextTick', 'setImmediate', 'clearImmediate', 'queueMicrotask', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'hrtime', 'performance'] });
  jest.clearAllMocks();
  _resetMemStore();
  mockIap.reset();
  _resetStanu();
  zUprawnieniem();
  ustawEkranZakupu(false);
  ustawDzienGotowe(null);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await initDatabase();
  for (const s of await getStarters()) await deleteStarter(s.id);
  await saveBakeSession(null);
  for (const p of await loadPlannedBakes()) await deleteBakeSession(p.id);
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  alertSpy.mockRestore();
  jest.useRealTimers();
});

describe('N3: „Otwórz” w arkuszu dnia najpierw zamyka arkusz', () => {
  it('zaległy start planu: arkusz dnia się zamyka, arkusz planu dopiero po jego zniknięciu', async () => {
    await savePlannedBake(plan('plan_zalegly', 'Pizza', Date.now() - H));
    const root = await zamontuj();
    const otworz = otworzWArkuszu(root, 'wypiek:plan_zalegly');
    expect(otworz).toHaveLength(1);
    await act(async () => otworz[0].props.onPress());
    await flush();
    expect(modal(root, ArkuszDnia).props.visible).toBe(false);
    expect(modal(root, ArkuszPlanu).props.visible).toBe(false);
    await act(async () => modal(root, ArkuszDnia).props.onDismiss?.());
    await flush();
    expect(modal(root, ArkuszPlanu).props.visible).toBe(true);
  });

  it('zaległy krok trwającego wypieku: arkusz dnia się zamyka i otwiera się Stolnica tego wypieku', async () => {
    await saveBakeSession(wypiek('bake_chleb', 'Chleb'));
    const root = await zamontuj();
    const otworz = otworzWArkuszu(root, 'wypiek:bake_chleb');
    expect(otworz).toHaveLength(1);
    await act(async () => otworz[0].props.onPress());
    await flush();
    expect(modal(root, ArkuszDnia).props.visible).toBe(false);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: 'bake_chleb' } });
    // Zniknięcie arkusza nie otwiera niczego drugi raz
    await act(async () => modal(root, ArkuszDnia).props.onDismiss?.());
    await flush();
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(modal(root, ArkuszPlanu).props.visible).toBe(false);
  });

  it('zamknięcie arkusza dnia bez „Otwórz” nie otwiera arkusza planu', async () => {
    await savePlannedBake(plan('plan_zalegly', 'Pizza', Date.now() - H));
    const root = await zamontuj();
    await act(async () => modal(root, ArkuszDnia).props.onRequestClose());
    await act(async () => modal(root, ArkuszDnia).props.onDismiss?.());
    await flush();
    expect(modal(root, ArkuszPlanu).props.visible).toBe(false);
  });
});
