/**
 * D-154: przełącznik „na zakwasie / na drożdżach” na ekranie receptury (4 receptury, D-173); wybór zapamiętany
 * (D-242 Z1 b, `wersje_receptur`); „Ułóż plan” niesie wersję do planu (D-155, Z2) [M3 p9b].
 */
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
import { setLang } from '../lib/i18n';

jest.setTimeout(20000);

const ORKISZ = 'Plan dla tej receptury na drożdżach czeka na czasy etapów. Ilości i wskazówki są wyżej.';
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

describe('D-154 przełącznik wersji na recepturze', () => {
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

  it('receptura bez wersji drożdżowej nie ma przełącznika; graham ma, domyślnie „na zakwasie”', async () => {
    let root = await otworz('country_loaf_72');
    expect(host(root, 'recipe-version')).toHaveLength(0);
    zamknij();
    root = await otworz('graham_bread_honey');
    expect(host(root, 'recipe-version')).toHaveLength(1);
    expect(host(root, 'recipe-version-sourdough')[0].props.accessibilityState).toMatchObject({ checked: true });
    expect(host(root, 'recipe-version-yeast')[0].props.accessibilityState).toMatchObject({ checked: false });
  });

  it('„na drożdżach”: formuła wersji, wskazówki wersji, zapis wyboru i plan z wersją', async () => {
    const root = await otworz('graham_bread_honey');
    await nacisnij(root, 'recipe-version-yeast');
    expect(host(root, 'recipe-version-yeast')[0].props.accessibilityState).toMatchObject({ checked: true });
    expect(tekst(host(root, 'recipe-about')[0])).toContain('Na drożdżach: 2% drożdży świeżych względem mąki.');
    expect(await getAppSetting('wersje_receptur')).toBe('{"graham_bread_honey":"drozdze"}');
    expect(host(root, 'start-bake-btn')[0].props.accessibilityState).toEqual({ disabled: false });
    await nacisnij(root, 'start-bake-btn');
    expect(mockPush).toHaveBeenCalledWith('/receptury/harmonogram');
    const r = recepturaPlanu()!;
    expect(r.wersja).toBe('drozdze');
    expect(r.recipeFormula).toMatchObject({ starterPercentage: 0, extraYeastPercentage: 2 });
    expect(r.calculatedRecipe.starterGrams).toBe(0);
  });

  it('wybór zapamiętany przy następnym otwarciu; powrót „na zakwasie” przywraca formułę receptury', async () => {
    let root = await otworz('rye_100_pan');
    await nacisnij(root, 'recipe-version-yeast');
    zamknij();
    root = await otworz('rye_100_pan');
    expect(host(root, 'recipe-version-yeast')[0].props.accessibilityState).toMatchObject({ checked: true });
    await nacisnij(root, 'start-bake-btn');
    expect(recepturaPlanu()?.recipeFormula).toMatchObject({ starterPercentage: 0, extraYeastPercentage: 3, waterPercentage: 76, saltPercentage: 1.2 });
    await nacisnij(root, 'recipe-version-sourdough');
    // „Na zakwasie” usuwa wpis tej receptury; wybory innych receptur zostają
    const mapa = JSON.parse((await getAppSetting('wersje_receptur')) ?? 'null');
    expect(mapa).not.toBeNull();
    expect(mapa.rye_100_pan).toBeUndefined();
    await nacisnij(root, 'start-bake-btn');
    expect(recepturaPlanu()?.wersja).toBe('zakwas');
    expect(recepturaPlanu()?.recipeFormula).toMatchObject({ starterPercentage: 30, waterPercentage: 78, saltPercentage: 1.8 });
  });

  it('orkisz na drożdżach: „Ułóż plan” nieaktywny z powodem', async () => {
    const root = await otworz('spelt_ancient_seeded');
    await nacisnij(root, 'recipe-version-yeast');
    expect(host(root, 'start-bake-btn')[0].props.accessibilityState).toEqual({ disabled: true });
    expect(tekst(host(root, 'recipe-actions')[0])).toContain(ORKISZ);
  });
});
