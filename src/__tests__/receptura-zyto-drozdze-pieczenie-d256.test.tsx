// D-256: ekran receptury, żyto na drożdżach: „O recepturze” z pieczeniem ze źródła (ZYT-DRO-002) [M3 p9b]
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: jest.fn(), setParams: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => ReactMod.useEffect(cb, []),
  };
});
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import { initDatabase, _resetMemStore, setActiveBake } from '../data/sqlite-store';
import { getAppSetting } from '../data/settings-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { clearPendingRecipeToLoad, setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { ustawRecepturePlanu, recepturaPlanu } from '../lib/plan-receptury';
import { MASTER_RECIPES } from '../recipes/presets';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang, t } from '../lib/i18n';

jest.setTimeout(20000);

const host = (root: renderer.ReactTestInstance, id: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  });
};
const nacisnij = async (root: renderer.ReactTestInstance, id: string) => {
  await act(async () => {
    root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function')[0].props.onPress();
  });
  await settle();
};

describe("D-256 O recepturze żyta", () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const otworz = async (id: string) => {
    const p = MASTER_RECIPES.find((r) => r.id === id)!;
    setPendingRecipeToLoad({ id: p.id, name: p.namePl, formula: p.formula, targetDDT: p.targetDDT });
    await act(async () => {
      tree = renderer.create(<EkranReceptury />);
    });
    await settle();
    return tree!.root;
  };
  const zamknij = () => {
    if (tree) act(() => tree?.unmount());
    tree = null;
  };
  beforeEach(async () => {
    useTempDbDir();
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    clearPendingRecipeToLoad();
    ustawRecepturePlanu(null);
    mockPush.mockClear();
    await initDatabase();
  });
  afterEach(() => {
    zamknij();
    ustawRecepturePlanu(null);
  });

  const o = (): string => {
    const leaves = (n: unknown): string =>
      typeof n === 'string' ? n : Array.isArray(n) ? n.map(leaves).join('') : n && typeof n === 'object' && 'children' in n ? leaves((n as { children: unknown }).children) : '';
    const find = (n: unknown): unknown => {
      if (Array.isArray(n)) return n.map(find).find(Boolean);
      if (n && typeof n === 'object' && 'props' in n) {
        const x = n as { props: { testID?: string }; children: unknown };
        return x.props.testID === 'recipe-about' ? x : find(x.children);
      }
      return undefined;
    };
    return leaves(find(tree!.toJSON()));
  };

  it('żyto: na zakwasie pieczenie receptury, na drożdżach 240 °C 10 min + 35 min w 220 °C', async () => {
    const root = await otworz('rye_100_pan');
    expect(o()).toContain('para');
    await nacisnij(root, 'recipe-version-yeast');
    const w = o().slice(o().indexOf('Pieczenie'), o().indexOf('Naczynie'));
    expect(w).toMatch(/240/);
    expect(w).toMatch(/35 min w/);
    expect(w).toMatch(/220/);
    expect(w).not.toContain('para');
  });
});
