/**
 * D-154/D-242 Z3: „Piecz ponownie” otwiera plan w wersji zapisanej we wpisie (bakes.leaven): „yeast” = formuła
 * i kroki wersji drożdżowej, „sourdough” = wersja na zakwasie; wpis bez wersji (sprzed p9, NULL) albo receptura bez
 * przełącznika — jak dotąd, bez zgadywania wersji [M3 p9b].
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
const mockNavigate = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: jest.fn(), navigate: mockNavigate, replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, saveBakeLog, setActiveBake, getActiveBake } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { recepturaPlanu, ustawRecepturePlanu } from '../lib/plan-receptury';
import type { StoredBakeLog } from '../data/db';
import { MASTER_RECIPES } from '../recipes/presets';
import { setLang } from '../lib/i18n';

jest.setTimeout(30000);

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const wpis = (recipeName: string, recipeId?: string | null): StoredBakeLog => ({ id: 'b1', recipeName, startedAt: 1, finishedAt: 2, ...(recipeId !== undefined ? { recipeId } : {}) });
const baza = (id: string) => MASTER_RECIPES.find((r) => r.id === id)!;

async function pieczPonownie(log: StoredBakeLog) {
  await saveBakeLog({ ...log, ratingStars: 3 });
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><DziennikScreen /></AppAccessProvider>);
  });
  await flush();
  const btn = tree.root.findAll((n) => n.props.testID === `bake-again-btn-${log.id}` && typeof n.props.onPress === 'function')[0];
  await act(async () => {
    await btn.props.onPress();
  });
  await flush();
  act(() => tree.unmount());
}
type Wpis = StoredBakeLog;

const graham = baza('graham_bread_honey');

describe('p9b: „Piecz ponownie” w zapisanej wersji', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    ustawRecepturePlanu(null);
    mockNavigate.mockClear();
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => ustawRecepturePlanu(null));

  it('wpis na drożdżach: plan z formułą i krokami wersji drożdżowej', async () => {
    const log: Wpis = { ...wpis(graham.namePl, 'graham_bread_honey'), leaven: 'yeast' };
    await pieczPonownie(log);
    expect(mockNavigate).toHaveBeenCalledWith('/receptury/harmonogram');
    const r = recepturaPlanu()!;
    expect(r.wersja).toBe('drozdze');
    expect(r.recipeFormula).toMatchObject({ starterPercentage: 0, extraYeastPercentage: 2 });
    expect(r.calculatedRecipe.starterGrams).toBe(0);
    let plan!: renderer.ReactTestRenderer;
    await act(async () => {
      plan = renderer.create(<AppAccessProvider><HarmonogramScreen /></AppAccessProvider>);
    });
    await flush();
    const start = plan.root.findAll((n) => n.props.testID === 'plan-start-bake-btn' && typeof n.props.onPress === 'function');
    await act(async () => {
      await start[start.length - 1].props.onPress();
    });
    await flush();
    act(() => plan.unmount());
    expect(getActiveBake()?.wersja).toBe('drozdze');
    expect(getActiveBake()?.steps?.[0]?.id).toBe('yeast_mix');
  });

  it('wpis na zakwasie: wersja na zakwasie z formułą receptury', async () => {
    await pieczPonownie({ ...wpis(graham.namePl, 'graham_bread_honey'), leaven: 'sourdough' });
    expect(recepturaPlanu()?.wersja).toBe('zakwas');
    expect(recepturaPlanu()?.recipeFormula).toMatchObject({ starterPercentage: 20 });
  });

  it('wpis bez wersji (NULL, sprzed p9) i receptura bez przełącznika: bez wersji, formuła receptury', async () => {
    await pieczPonownie({ ...wpis(graham.namePl, 'graham_bread_honey'), leaven: null });
    expect(recepturaPlanu()?.wersja).toBeUndefined();
    expect(recepturaPlanu()?.recipeFormula).toMatchObject({ starterPercentage: 20 });
    ustawRecepturePlanu(null);
    await pieczPonownie({ ...wpis(baza('country_loaf_72').namePl, 'country_loaf_72'), id: 'b2', leaven: 'yeast' });
    expect(recepturaPlanu()?.wersja).toBeUndefined();
    expect(recepturaPlanu()?.recipeFormula.starterPercentage).toBeGreaterThan(0);
  });
});
