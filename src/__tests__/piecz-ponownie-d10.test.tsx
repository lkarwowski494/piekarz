/**
 * Audyt niezależny D-10: „Piecz ponownie” dobiera recepturę po nazwie z wpisu Dziennika; gdy takiej nie ma (usunięta,
 * przemianowana, wypiek bez receptury), aplikacja podstawiała zmyśloną formułę 70% wody pod nazwą z wpisu i układała
 * z nią plan. Teraz bez dopasowania „Piecz ponownie” otwiera listę receptur (wybór należy do użytkownika), a
 * dopasowanie bierze najpierw własną recepturę użytkownika [audyt-niezalezny D-10].
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
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, saveBakeLog, saveRecipe, setActiveBake } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { recepturaPlanu, ustawRecepturePlanu } from '../lib/plan-receptury';
import { prepareBakeAgainRecipe } from '../lib/recipe-navigation';
import { MASTER_RECIPES } from '../recipes/presets';
import { setLang } from '../lib/i18n';

jest.setTimeout(30000);

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

async function pieczPonownie(recipeName: string) {
  await saveBakeLog({ id: 'b1', recipeName, startedAt: 1_800_000_000_000, finishedAt: 1_800_000_100_000, ratingStars: 3 });
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

describe('D-10: „Piecz ponownie” bez zmyślonej receptury', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    ustawRecepturePlanu(null);
    mockNavigate.mockClear();
    await initDatabase();
  });
  afterEach(() => ustawRecepturePlanu(null));

  it('no recipe with the logged name: opens the recipe list, no plan with an invented 70% formula', async () => {
    await pieczPonownie('Mój chleb, którego już nie ma');
    expect(recepturaPlanu()).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/receptury');
    expect(mockNavigate).not.toHaveBeenCalledWith('/receptury/harmonogram');
  });

  it('user recipe with the same name as a base recipe wins: the plan gets the user formula', async () => {
    const baza = MASTER_RECIPES[0];
    await saveRecipe({
      id: 'moja', name: baza.namePl, formula: { ...baza.formula, waterPercentage: 77 }, targetDDT: 25, isBuiltIn: false, createdAt: 1,
    });
    await pieczPonownie(baza.namePl);
    expect(recepturaPlanu()?.recipeFormula.waterPercentage).toBe(77);
    expect(mockNavigate).toHaveBeenCalledWith('/receptury/harmonogram');
  });

  it('prepareBakeAgainRecipe: null without a match', () => {
    expect(prepareBakeAgainRecipe({ id: 'x', recipeName: 'Nieznany', startedAt: 1 }, [])).toBeNull();
  });
});
