/**
 * M3 p6b (D-209, README §6, makieta karty/receptury.html #receptura): podtytuł pasa receptury jednym pełnym
 * zdaniem-kluczem według rodzaju receptury bazowej („Receptura bazowa, na zakwasie”), bez sklejania napisów.
 * Własna receptura nie ma w danych rodzaju (StoredRecipe bez kategorii): wariant „Moja receptura, …” odłożony (D-210),
 * pas bez podtytułu jak dotąd.
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => jest.requireActual('react').useEffect(cb, []),
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), back: jest.fn(), setParams: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import { clearPendingRecipeToLoad, setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { MASTER_RECIPES, type RecipePreset } from '../recipes/presets';
import { podtytulReceptury } from '../components/receptury/nazwy-receptur';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { theme } from '../ui/theme';
import { setLang } from '../lib/i18n';

jest.setTimeout(20000);
type Wezel = renderer.ReactTestInstance;
const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const poId = (root: Wezel, id: string): Wezel[] => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string');
let ostatni: renderer.ReactTestRenderer | null = null;
async function zamontuj(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(el);
  });
  ostatni = tree;
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree;
}

describe('M3 p6b: podtytuł pasa receptury (README §6, D-209)', () => {
  beforeEach(async () => {
    setLang('pl');
    zUprawnieniem();
    clearPendingRecipeToLoad();
    _resetMemStore();
    await initDatabase();
  });
  afterEach(() => {
    if (ostatni) act(() => ostatni?.unmount());
    ostatni = null;
  });

  it('każdy rodzaj receptury bazowej ma własne pełne zdanie (osobny klucz, bez sklejania)', () => {
    const oczekiwane: Record<RecipePreset['category'], string> = {
      sourdough: 'Receptura bazowa, na zakwasie',
      rye: 'Receptura bazowa, żytnia',
      yeast: 'Receptura bazowa, na drożdżach',
      pizza: 'Receptura bazowa, pizza',
      sweet: 'Receptura bazowa, słodka',
    };
    for (const [k, v] of Object.entries(oczekiwane)) expect([k, podtytulReceptury(k as RecipePreset['category'])]).toEqual([k, v]);
    for (const r of MASTER_RECIPES) expect(podtytulReceptury(r.category)).toBe(oczekiwane[r.category]);
  });

  it('ekran receptury bazowej na zakwasie: podtytuł pasa pod nazwą, w kolorze pasa', async () => {
    const tree = await zamontuj(<EkranReceptury />);
    const pod = poId(tree.root, 'recipe-subtitle');
    expect(pod.map(tekst)).toEqual(['Receptura bazowa, na zakwasie']);
    expect(StyleSheet.flatten(pod[0].props.style).color).toBe(theme.colors.naPasie2);
  });

  it('własna receptura (bez rodzaju w danych): pas bez podtytułu', async () => {
    setPendingRecipeToLoad({ id: 'moja_1', name: 'Mój chleb', formula: { flours: [{ name: 'Mąka pszenna typ 650', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20 } });
    const tree = await zamontuj(<EkranReceptury />);
    expect(poId(tree.root, 'recipe-subtitle')).toHaveLength(0);
  });
});
