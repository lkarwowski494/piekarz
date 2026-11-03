/**
 * M3 p6b (D-209, D-198, makieta karty/inne.html #dziennik: „1 listopada, ocena 4/5”): data i ocena wpisu Dziennika
 * w jednym wierszu, jednym kluczem z parametrami „{data}, ocena {n}/5” (bez sklejania); bez oceny sama data.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: mockPush, navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, saveBakeLog } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { appLocale, formatDate } from '../lib/format';
import { setLang } from '../lib/i18n';

jest.setTimeout(30000);

type Wezel = renderer.ReactTestInstance;

async function dziennik(): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><DziennikScreen /></AppAccessProvider>);
  });
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
  return tree;
}

const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const poId = (root: Wezel, id: string): Wezel[] => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string');
const linie = (root: Wezel, id: string): string[] => {
  const [k] = poId(root, id);
  expect(k).toBeDefined();
  return k.findAllByType(Text).filter((n) => !n.props.accessibilityRole).map(tekst);
};
const START = 1_800_000_000_000;
const data = () => formatDate(START, appLocale(), { day: 'numeric', month: 'short', year: 'numeric' });

describe('M3 p6b: Dziennik — data i ocena w jednym wierszu (D-209)', () => {
  beforeEach(async () => {
    setLang('pl');
    zUprawnieniem();
    _resetMemStore();
    await initDatabase();
  });

  it('wpis z oceną: jedna linia „{data}, ocena 4/5” zamiast dwóch', async () => {
    await saveBakeLog({ id: 'b1', recipeName: 'Mój chleb', startedAt: START, ratingStars: 4 });
    const tree = await dziennik();
    const l = linie(tree.root, 'bake-log-card-b1');
    expect(l).toContain(`${data()}, ocena 4/5`);
    expect(l).not.toContain(data());
    expect(l.filter((x) => x.includes('Ocena:'))).toEqual([]);
    act(() => tree.unmount());
  });

  it('wpis bez oceny: sama data, bez „ocena”', async () => {
    await saveBakeLog({ id: 'b2', recipeName: 'Bez oceny', startedAt: START });
    const tree = await dziennik();
    const l = linie(tree.root, 'bake-log-card-b2');
    expect(l).toContain(data());
    expect(l.filter((x) => /ocena/i.test(x))).toEqual([]);
    act(() => tree.unmount());
  });

  it('EN: jeden klucz z parametrami', async () => {
    setLang('en');
    await saveBakeLog({ id: 'b3', recipeName: 'Bread', startedAt: START, ratingStars: 5 });
    const tree = await dziennik();
    expect(linie(tree.root, 'bake-log-card-b3')).toContain(`${data()}, rated 5/5`);
    act(() => tree.unmount());
  });
});
