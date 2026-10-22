/**
 * Przejście z kalendarza do wpisu Dziennika (M3 D7; BR-KAL-013 „przejście do każdego wpisu”, D-110): Dziennik
 * otwarty z parametrem `wpis` wyróżnia ten wpis (obwódka w kolorze akcentu, tylko z tokenów) i przewija do niego
 * po pomiarze położenia; bez parametru żaden wpis nie jest wyróżniony.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
const mockParams: { wpis?: string } = {};
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => mockParams,
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, saveBakeLog, getBakeLogs, deleteBakeLog } from '../data/sqlite-store';
import { _resetStanu } from '../lib/platnosci/stan';
import { theme } from '../ui/theme';

const mockIap = (Iap as unknown as { __mock: { reset: () => void } }).__mock;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const karta = (root: renderer.ReactTestInstance, id: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === `bake-log-card-${id}`);
const obwodka = (n: renderer.ReactTestInstance) => (StyleSheet.flatten(n.props.style) as { borderColor?: unknown }).borderColor;

let tree: renderer.ReactTestRenderer | null = null;
async function render() {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><DziennikScreen /></AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}

beforeEach(async () => {
  _resetMemStore();
  mockIap.reset();
  _resetStanu();
  delete mockParams.wpis;
  await initDatabase();
  for (const b of await getBakeLogs()) await deleteBakeLog(b.id);
  for (let i = 0; i < 4; i++) {
    await saveBakeLog({ id: `b${i}`, recipeName: `Chleb ${i}`, startedAt: Date.UTC(2026, 9, 3 + 5 * i, 8), finishedAt: Date.UTC(2026, 9, 3 + 5 * i, 14) });
  }
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
});

describe('D7: Dziennik z wpisem z kalendarza', () => {
  it('BR-KAL-013 przejście do wpisu: wpis z parametru wyróżniony obwódką akcentu, inne bez; po pomiarze przewinięcie do niego', async () => {
    mockParams.wpis = 'b1';
    const root = await renderStart();
    const [cel] = karta(root, 'b1');
    expect(cel).toBeDefined();
    expect(obwodka(cel)).toBe(theme.colors.akcent);
    expect(['b0', 'b2', 'b3'].map((id) => obwodka(karta(root, id)[0]))).not.toContain(theme.colors.akcent);
    const scroll = root.findByType(ScrollView).instance as { scrollTo: (o: unknown) => void };
    const spy = jest.spyOn(scroll, 'scrollTo').mockImplementation(() => {});
    expect(typeof cel.props.onLayout).toBe('function');
    await act(async () => cel.props.onLayout({ nativeEvent: { layout: { x: 0, y: 420, width: 300, height: 120 } } }));
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ y: expect.any(Number) }));
    const y = (spy.mock.calls[0]?.[0] as { y: number }).y;
    expect(y).toBeGreaterThan(0);
  });

  it('bez parametru wpisu żaden wpis nie jest wyróżniony', async () => {
    const root = await renderStart();
    expect(['b0', 'b1', 'b2', 'b3'].map((id) => obwodka(karta(root, id)[0]))).not.toContain(theme.colors.akcent);
  });
});

async function renderStart() {
  return render();
}
