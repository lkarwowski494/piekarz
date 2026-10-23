/**
 * W-fix2, 04-studio-projektowe-012 (decyzja M1 wg rekomendacji): „Dziś” mówi, że powiadomienia są wyłączone, gdy coś
 * na nich polega (trwający albo zaplanowany wypiek, zdarzenia kalendarza, np. karmienie zakwasu). Ten sam baner co na
 * Zakwasach i w Stolnicy (NotificationsOffBanner: tekst i „Otwórz Ustawienia”), bez nowych tekstów.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
jest.mock('expo-router', () => {
  const React = require('react');
  const nawigacja = { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return { Stack, router: nawigacja, useRouter: () => nawigacja, useLocalSearchParams: () => ({}), useFocusEffect: (cb: () => void) => React.useEffect(cb, []) };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import * as Notifications from 'expo-notifications';
import renderer, { act } from 'react-test-renderer';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, getStarters, deleteStarter } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { deleteBakeSession, loadPlannedBakes, savePlannedBake } from '../data/bake-sessions-store';
import { planBakeSteps } from '../core/bake-steps';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const H = 3_600_000;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const baner = (root: renderer.ReactTestInstance) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'notifications-off-banner');
const zgoda = (stan: 'denied' | 'granted') =>
  jest.spyOn(Notifications, 'getPermissionsAsync').mockResolvedValue({
    status: stan, granted: stan === 'granted', canAskAgain: false, expires: 'never',
  } as unknown as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);

let tree: renderer.ReactTestRenderer | null = null;
async function dzis() {
  await act(async () => { tree = renderer.create(<AppAccessProvider><StartScreen /></AppAccessProvider>); });
  await flush();
  return tree!.root;
}

beforeEach(async () => {
  _resetMemStore();
  zUprawnieniem();
  await initDatabase();
  await saveBakeSession(null);
  for (const p of await loadPlannedBakes()) await deleteBakeSession(p.id);
  for (const s of await getStarters()) await deleteStarter(s.id);
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  jest.restoreAllMocks();
});

describe('012: „Dziś” a wyłączone powiadomienia', () => {
  it('zaplanowany wypiek i odmowa powiadomień: baner z „Otwórz Ustawienia”', async () => {
    zgoda('denied');
    const start = Date.now() + 20 * H;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    await savePlannedBake({ version: 1, id: 'p1', recipeName: 'Chleb', plannedStartAt: start, steps, bake: { id: 'p1', recipeName: 'Chleb', startedAt: start, currentStageId: steps[0].id, steps } });
    const root = await dzis();
    expect(baner(root)).toHaveLength(1);
    expect(root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'notifications-open-settings')).toHaveLength(1);
  });

  it('powiadomienia włączone: bez banera', async () => {
    zgoda('granted');
    const start = Date.now() + 20 * H;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    await savePlannedBake({ version: 1, id: 'p1', recipeName: 'Chleb', plannedStartAt: start, steps, bake: { id: 'p1', recipeName: 'Chleb', startedAt: start, currentStageId: steps[0].id, steps } });
    expect(baner(await dzis())).toHaveLength(0);
  });

  it('nic nie polega na powiadomieniach (pusty start): bez banera mimo odmowy', async () => {
    zgoda('denied');
    expect(baner(await dzis())).toHaveLength(0);
  });
});
