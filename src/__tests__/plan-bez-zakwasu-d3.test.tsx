/**
 * Audyt niezależny D-3 (minimum b): plan wypieku i prowadzenie są ułożone dla chleba na zakwasie (dokarmienie
 * zakwasu, garowanie w lodówce). Receptura bez zakwasu (np. pizza z drożdżami, zakwas 0%) dostawała ten sam plan.
 * Wariant, który nie wprowadza w błąd: „Ułóż plan” nieaktywny z powodem pod przyciskiem, a plan otwarty z taką
 * recepturą (np. „Piecz ponownie”) ma „Zacznij wypiek” nieaktywny z tym samym powodem [audyt-niezalezny D-3].
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
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
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, setActiveBake, _resetMemStore, getActiveBake } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { clearPendingRecipeToLoad, setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { ustawRecepturePlanu, powodBezZakwasu } from '../lib/plan-receptury';
import { calculateDoughRecipe } from '../core/domain-rules';
import { MASTER_RECIPES } from '../recipes/presets';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';

jest.setTimeout(20000);

const POWOD = 'Plan wypieku jest tylko dla chleba na zakwasie, a ta receptura nie ma zakwasu.';
const host = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  });
};

describe('D-3: plan tylko dla receptur na zakwasie', () => {
  let tree: renderer.ReactTestRenderer | null = null;
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
    if (tree) act(() => tree?.unmount());
    tree = null;
    ustawRecepturePlanu(null);
  });

  it('pizza with 0% starter: "Make a Plan" is disabled with the reason and does not open the plan', async () => {
    const pizza = MASTER_RECIPES.find((r) => r.formula.starterPercentage === 0)!;
    setPendingRecipeToLoad({ id: pizza.id, name: pizza.namePl, formula: pizza.formula, targetDDT: pizza.targetDDT });
    await act(async () => {
      tree = renderer.create(<EkranReceptury />);
    });
    await settle();
    const btn = host(tree!.root, 'start-bake-btn')[0];
    expect(btn.props.accessibilityState).toEqual({ disabled: true });
    expect(tekst(host(tree!.root, 'recipe-actions')[0])).toContain(POWOD);
    await act(async () => {
      tree!.root.findAll((n) => n.props.testID === 'start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(mockPush).not.toHaveBeenCalledWith('/receptury/harmonogram');
  });

  it('sourdough recipe: "Make a Plan" works as before, no reason shown', async () => {
    await act(async () => {
      tree = renderer.create(<EkranReceptury />);
    });
    await settle();
    expect(host(tree!.root, 'start-bake-btn')[0].props.accessibilityState).toEqual({ disabled: false });
    expect(tekst(host(tree!.root, 'recipe-actions')[0])).not.toContain(POWOD);
    await act(async () => {
      tree!.root.findAll((n) => n.props.testID === 'start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(mockPush).toHaveBeenCalledWith('/receptury/harmonogram');
  });

  it('plan opened with a recipe without starter (e.g. Bake Again): "Start Bake" disabled with the reason', async () => {
    const formula = { flours: [{ name: 'Mąka', percentage: 100 }], waterPercentage: 65, saltPercentage: 2.5, starterPercentage: 0, extraYeastPercentage: 0.5, targetDoughWeightGrams: 1000 };
    ustawRecepturePlanu({ recipeName: 'Pizza', calculatedRecipe: calculateDoughRecipe(formula), recipeFormula: formula });
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
    });
    await settle();
    const start = host(tree!.root, 'plan-start-bake-btn')[0];
    expect(start.props.accessibilityState).toEqual({ disabled: true });
    expect(tekst(host(tree!.root, 'plan-thumb-bar')[0])).toContain(POWOD);
    await act(async () => {
      tree!.root.findAll((n) => n.props.testID === 'plan-start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(getActiveBake()).toBeNull();
  });

  it('powodBezZakwasu: reason only for 0% starter', () => {
    expect(powodBezZakwasu({ starterPercentage: 0 })).toBe(POWOD);
    expect(powodBezZakwasu({ starterPercentage: 20 })).toBeNull();
  });
});
