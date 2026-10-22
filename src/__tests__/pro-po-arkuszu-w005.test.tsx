/**
 * 04-studio-projektowe-005 (P1, weryfikacja W przebiegu M3): ekran Pro otwierał się nad otwartym arkuszem „Dziś”
 * (arkusz dnia: „Zaplanuj wypiek na ten dzień”; arkusz planu: „Prowadź oba” z pytania i „Dodaj do kalendarza”), czyli
 * w układzie, który D-117 odrzucił (dwa arkusze modalne naraz iOS pokazuje zawodnie). Teraz jak w Ustawieniach (D-117):
 * najpierw zamknięcie arkusza, ekran Pro dopiero po jego zniknięciu (onDismiss, iOS).
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
const mockNavigate = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  const nawigacja = { push: jest.fn(), navigate: (...a: unknown[]) => mockNavigate(...a), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
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
import { Alert, Modal, Platform } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { PaywallModal } from '../components/PaywallModal';
import { ArkuszDnia } from '../components/kalendarz/ArkuszDnia';
import { ArkuszPlanu } from '../components/start/ArkuszPlanu';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { deleteBakeSession, loadPlannedBakes, savePlannedBake, type PlannedBake } from '../data/bake-sessions-store';
import { planBakeSteps } from '../core/bake-steps';
import { localDateKey } from '../core/dzien-lokalny';
import { _resetStanu } from '../lib/platnosci/stan';
import { ustawEkranZakupu } from '../lib/platnosci/ekran';
import { ustawDzienGotowe } from '../lib/plan-receptury';
import { mockIap } from '../../tests/helpers/platnosci';

const H = 3_600_000;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function');
const ekranPro = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const nacisnij = async (root: renderer.ReactTestInstance, testID: string) => {
  const p = przycisk(root, testID);
  expect({ testID, jest: p.length > 0 }).toEqual({ testID, jest: true });
  await act(async () => p[p.length - 1].props.onPress());
  await flush();
};
/** Modal arkusza (pageSheet) w komponencie. */
const modal = (root: renderer.ReactTestInstance, typ: React.ElementType) => root.findByType(typ).findByType(Modal);
const zniknal = async (root: renderer.ReactTestInstance, typ: React.ElementType) => {
  await act(async () => modal(root, typ).props.onDismiss?.());
  await flush();
};

function plan(id: string, nazwa: string, start: number): PlannedBake {
  const steps = planBakeSteps({ startAt: start, isHighRye: false });
  return { version: 1, id, recipeName: nazwa, plannedStartAt: start, steps, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[0].id, steps } };
}
const wypiek = (id: string, nazwa: string) => {
  const start = Date.now() - 2 * H;
  const steps = planBakeSteps({ startAt: start, isHighRye: false });
  return {
    version: 2 as const, steps, stepIdx: 3, dutchOvenPhase: 'lid_on' as const, timerEndsAt: null, pausedLeftSec: 600,
    recipeName: nazwa, startedAt: start, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[3].id },
  };
};

type Przycisk = { text: string; onPress?: () => void };
let alertSpy: jest.SpyInstance;
let tree: renderer.ReactTestRenderer | null = null;
async function zamontuj() {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><StartScreen /></AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}

beforeEach(async () => {
  jest.clearAllMocks();
  _resetMemStore();
  mockIap.reset(); // bez Pro
  _resetStanu();
  ustawEkranZakupu(false);
  ustawDzienGotowe(null);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await initDatabase();
  await saveBakeSession(null);
  for (const p of await loadPlannedBakes()) await deleteBakeSession(p.id);
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  alertSpy.mockRestore();
  ustawEkranZakupu(false);
});

describe('04-studio-projektowe-005: ekran Pro dopiero po zamknięciu arkusza (wzorzec D-117)', () => {
  it('jest iOS (pageSheet i onDismiss)', () => {
    expect(Platform.OS).toBe('ios');
  });

  it('arkusz dnia → „Zaplanuj wypiek na ten dzień” bez Pro: arkusz się zamyka, ekran Pro po jego zniknięciu', async () => {
    const root = await zamontuj();
    await nacisnij(root, `pasek-dzien-${localDateKey(Date.now() + 24 * H)}`);
    expect(modal(root, ArkuszDnia).props.visible).toBe(true);
    await nacisnij(root, 'arkusz-zaplanuj-btn');
    expect(modal(root, ArkuszDnia).props.visible).toBe(false);
    expect(ekranPro(root)).toBe(false);
    await zniknal(root, ArkuszDnia);
    expect(ekranPro(root)).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalledWith('/receptury');
  });

  it('arkusz planu → „Zacznij” przy trwającym → „Prowadź oba” bez Pro: arkusz się zamyka, ekran Pro po jego zniknięciu', async () => {
    await saveBakeSession(wypiek('bake_chleb', 'Chleb'));
    await savePlannedBake(plan('plan_teraz', 'Pizza', Date.now() - H));
    const root = await zamontuj();
    await nacisnij(root, 'plan-wiersz-plan_teraz');
    expect(modal(root, ArkuszPlanu).props.visible).toBe(true);
    await nacisnij(root, 'plan-zacznij-btn');
    const [tytul, , przyciski] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string | undefined, Przycisk[]];
    expect(tytul).toBe('Trwa już inny wypiek');
    await act(async () => przyciski[0].onPress?.());
    await flush();
    expect(modal(root, ArkuszPlanu).props.visible).toBe(false);
    expect(ekranPro(root)).toBe(false);
    await zniknal(root, ArkuszPlanu);
    expect(ekranPro(root)).toBe(true);
  });

  it('arkusz planu → „Dodaj do kalendarza” bez Pro: arkusz się zamyka, ekran Pro po jego zniknięciu', async () => {
    await savePlannedBake(plan('plan_jutro', 'Pizza', Date.now() + 20 * H));
    const root = await zamontuj();
    await nacisnij(root, 'plan-zobacz-plan_jutro');
    expect(modal(root, ArkuszPlanu).props.visible).toBe(true);
    await nacisnij(root, 'plan-kalendarz-btn');
    expect(modal(root, ArkuszPlanu).props.visible).toBe(false);
    expect(ekranPro(root)).toBe(false);
    await zniknal(root, ArkuszPlanu);
    expect(ekranPro(root)).toBe(true);
  });

  it('zniknięcie arkusza bez stuknięcia funkcji Pro nie otwiera ekranu Pro', async () => {
    const root = await zamontuj();
    await nacisnij(root, `pasek-dzien-${localDateKey(Date.now() + 24 * H)}`);
    await act(async () => modal(root, ArkuszDnia).props.onRequestClose());
    await zniknal(root, ArkuszDnia);
    expect(ekranPro(root)).toBe(false);
  });
});
