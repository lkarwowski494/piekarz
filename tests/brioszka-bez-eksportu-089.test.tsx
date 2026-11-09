/**
 * M1-audytor-generalny-089, przegląd ścieżki planu P2-1 (subagent M2, 2026-11-09): plan otwarty z „Piecz ponownie”
 * dla receptury bez planu (brioszka na Lievito Madre, PIE-BRI-900; też D-3) ma „Zacznij wypiek” nieaktywny, ale
 * „Dodaj do kalendarza” i „Kopiuj jako tekst” eksportowały oś czasu z czasami bez źródła. Po poprawce oba znikają.
 */
jest.mock('expo-sqlite', () => require('../src/data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: jest.fn(), setParams: jest.fn(), replace: jest.fn() }),
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
import HarmonogramScreen from '../app/(tabs)/receptury/harmonogram';
import { initDatabase, setActiveBake, _resetMemStore } from '../src/data/sqlite-store';
import { useTempDbDir } from '../src/data/__tests__/helpers/node-sqlite-adapter';
import { ustawRecepturePlanu } from '../src/lib/plan-receptury';
import { calculateDoughRecipe } from '../src/core/domain-rules';
import { CATALOG_RECIPES } from '../src/recipes/katalog';
import { zUprawnieniem } from './helpers/platnosci';
import { setLang } from '../src/lib/i18n';

jest.setTimeout(20000);

const host = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  });
};
const otworzPlan = async (id: string) => {
  const r = CATALOG_RECIPES.find((x) => x.id === id)!;
  ustawRecepturePlanu({ recipeId: id, recipeName: id, calculatedRecipe: calculateDoughRecipe(r.formula), recipeFormula: r.formula });
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<HarmonogramScreen />);
  });
  await settle();
  return tree!;
};

describe('089 (przegląd ścieżki planu P2-1): plan zablokowany nie eksportuje osi czasu', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  beforeEach(async () => {
    useTempDbDir();
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    ustawRecepturePlanu(null);
    await initDatabase();
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    ustawRecepturePlanu(null);
  });

  it('brioszka z „Piecz ponownie”: bez „Dodaj do kalendarza” i „Kopiuj jako tekst”, start nieaktywny', async () => {
    tree = await otworzPlan('lievito_madre_panettone_brioche');
    expect(host(tree.root, 'plan-start-bake-btn')[0].props.accessibilityState).toEqual({ disabled: true });
    expect(host(tree.root, 'plan-kalendarz-btn')).toHaveLength(0);
    expect(host(tree.root, 'copy-schedule-btn')).toHaveLength(0);
  });

  it('receptura z planem: oba eksporty jak dotąd', async () => {
    tree = await otworzPlan('country_loaf_72');
    expect(host(tree.root, 'plan-start-bake-btn')[0].props.accessibilityState).toEqual({ disabled: false });
    expect(host(tree.root, 'plan-kalendarz-btn').length).toBeGreaterThan(0);
    expect(host(tree.root, 'copy-schedule-btn').length).toBeGreaterThan(0);
  });
});
