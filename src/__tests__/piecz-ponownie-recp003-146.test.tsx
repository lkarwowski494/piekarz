/**
 * M1-audytor-generalny-146 (01-odkrywanie-504), BR-RECP-003 „Następny wypiek z wpisu”: „Piecz ponownie” w Dzienniku
 * zaczyna PR-02 (plan wypieku) z tą samą recepturą i pokazuje notatkę z poprzedniego razu (rekomendacja (a) z blokady
 * 146: wariant BRD; D-070).
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
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: mockNavigate, replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, saveBakeLog, setActiveBake } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { recepturaPlanu, ustawRecepturePlanu } from '../lib/plan-receptury';
import { getPendingRecipeToLoad, clearPendingRecipeToLoad } from '../lib/recipe-navigation';
import { setLang, t } from '../lib/i18n';

jest.setTimeout(30000);

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  return '';
};
const host = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);

async function pieczPonownie(notes?: string) {
  await saveBakeLog({ id: 'b1', recipeName: 'Wiejski chleb codzienny na zakwasie', startedAt: 1_800_000_000_000, finishedAt: 1_800_000_100_000, ratingStars: 3, notes });
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><DziennikScreen /></AppAccessProvider>);
  });
  await flush();
  const btn = tree.root.findAll((n) => n.props.testID === 'bake-again-btn-b1' && typeof n.props.onPress === 'function')[0];
  await act(async () => {
    await btn.props.onPress();
  });
  await flush();
  act(() => tree.unmount());
}

async function plan(): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<HarmonogramScreen />);
  });
  await flush();
  return tree;
}

describe('BR-RECP-003 Następny wypiek z wpisu: plan z tą samą recepturą i notatką', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setLang('pl');
    await initDatabase();
    setActiveBake(null);
    ustawRecepturePlanu(null);
    clearPendingRecipeToLoad();
    mockNavigate.mockClear();
  });

  it('BR-RECP-003 Następny wypiek z wpisu: „Piecz ponownie” otwiera plan wypieku z tą recepturą i notatką', async () => {
    await pieczPonownie('Dłużej garować, ciasto było luźne');
    expect(mockNavigate).toHaveBeenCalledWith('/receptury/harmonogram');
    const r = recepturaPlanu();
    expect(r?.recipeName).toBe('Wiejski chleb codzienny na zakwasie');
    expect(r?.recipeFormula.waterPercentage).toBe(68.0);
    expect(r?.calculatedRecipe.targetDoughWeightGrams).toBe(r?.recipeFormula.targetDoughWeightGrams);
    expect(r?.notatka).toBe('Dłużej garować, ciasto było luźne');
    // Lista receptur nie przejmuje nawigacji (bez receptury czekającej na ekran receptury)
    expect(getPendingRecipeToLoad()).toBeNull();

    const tree = await plan();
    const notatka = host(tree.root, 'plan-notatka-poprzednia');
    expect(notatka).toHaveLength(1);
    expect(textOf(notatka[0].props.children)).toBe('Notatka z poprzedniego wypieku: Dłużej garować, ciasto było luźne');
    act(() => tree.unmount());
  });

  it('wpis bez notatki: plan bez wiersza notatki; po angielsku „Note from your last bake”', async () => {
    await pieczPonownie(undefined);
    expect(recepturaPlanu()?.notatka).toBeUndefined();
    const tree = await plan();
    expect(host(tree.root, 'plan-notatka-poprzednia')).toHaveLength(0);
    act(() => tree.unmount());

    await pieczPonownie('Mniej soli');
    setLang('en');
    const en = await plan();
    expect(textOf(host(en.root, 'plan-notatka-poprzednia')[0].props.children)).toBe('Note from your last bake: Mniej soli');
    expect(t('Notatka z poprzedniego wypieku: {notatka}', { notatka: 'Mniej soli' })).toBe('Note from your last bake: Mniej soli');
    act(() => en.unmount());
  });
});
