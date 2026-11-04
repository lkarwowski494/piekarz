/**
 * M3 p8 (D-157, D-229): receptury katalogu M3 są na liście Receptury (wszystkie i filtry rodzaju), otwierają się na ekranie
 * receptury z opisem i notatką, mają przekład nazwy w języku aplikacji i „Piecz ponownie” je znajduje po id.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import RecepturyLista from '../../app/(tabs)/receptury/index';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import type { StoredBakeLog } from '../data/db';
import { CATALOG_RECIPES, KATALOG_M3_RECIPES, filterCatalogRecipes } from '../recipes/katalog';
import { MASTER_RECIPES } from '../recipes/presets';
import { clearPendingRecipeToLoad, prepareBakeAgainRecipe, setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { nazwaReceptury } from '../lib/nazwa-receptury';
import { EN } from '../lib/i18n.en';
import { setLang } from '../lib/i18n';
import { nazwaMakiMieszanki } from '../lib/nazwa-maki-mieszanki';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);

jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useFocusEffect: (cb: () => void) => jest.requireActual('react').useEffect(cb, []),
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), setParams: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
  };
});
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const hostIds = (root: renderer.ReactTestInstance): string[] =>
  root.findAll((n) => typeof n.type === 'string' && typeof n.props.testID === 'string').map((n) => String(n.props.testID));
const wiersze = (root: renderer.ReactTestInstance) => [...new Set(hostIds(root).filter((id) => id.startsWith('recipe-row-')))];
const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text').map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children))).join(' ');

async function render(el: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => { tree = renderer.create(el); });
  await act(async () => { await Promise.resolve(); });
  return tree!;
}

describe('M3 p8: katalog w ekranach', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    clearPendingRecipeToLoad();
    await initDatabase();
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    setLang('pl');
  });

  it('lista Receptury pokazuje wszystkie 26 receptur bazowych, a filtr Żytnie także nowe żytnie', async () => {
    tree = await render(<RecepturyLista />);
    expect(wiersze(tree.root)).toEqual(CATALOG_RECIPES.map((r) => `recipe-row-${r.id}`));
    expect(wiersze(tree.root)).toHaveLength(26);
    const filtr = tree.root.findAll((n) => n.props.testID === 'category-filter-rye' && typeof n.props.onPress === 'function')[0];
    await act(async () => { filtr?.props.onPress(); });
    expect(wiersze(tree.root)).toEqual(filterCatalogRecipes('rye').map((r) => `recipe-row-${r.id}`));
    expect(wiersze(tree.root)).toEqual(expect.arrayContaining(['recipe-row-latvian_scalded_rye', 'recipe-row-karelian_rye_pasties', 'recipe-row-half_rye_loaf']));
  });

  it('ekran receptury otwarty z katalogu pokazuje opis i wskazówki nowej receptury', async () => {
    const r = KATALOG_M3_RECIPES.find((x) => x.id === 'boiled_bread_ring');
    if (!r) throw new Error('brak boiled_bread_ring');
    setPendingRecipeToLoad({ id: r.id, name: r.namePl, targetDDT: r.targetDDT, formula: r.formula });
    tree = await render(<EkranReceptury />);
    const txt = tekst(tree.root);
    expect(txt).toContain(r.descriptionPl);
    expect(txt).toContain(r.notesPl);
  });

  it('nazwa nowej receptury ma przekład w języku aplikacji (EN), po polsku bez zmian', () => {
    for (const r of KATALOG_M3_RECIPES) {
      expect(nazwaReceptury(r.namePl)).toBe(r.namePl);
      setLang('en');
      expect(nazwaReceptury(r.namePl)).toBe(EN[r.namePl]);
      expect(nazwaReceptury(r.namePl)).not.toBe(r.namePl);
      setLang('pl');
    }
  });

  it('nazwy mąk nowych receptur mają przekład (EN) jak w recepturach dotychczasowych', () => {
    setLang('en');
    for (const r of KATALOG_M3_RECIPES) for (const f of r.formula.flours) {
      expect(nazwaMakiMieszanki(f, 'pl')).toBe(f.name);
      expect(nazwaMakiMieszanki(f, 'en')).not.toMatch(/Mąka/);
    }
  });

  it('„Piecz ponownie” znajduje nową recepturę po id, także gdy nazwa wpisu jest inna', () => {
    const r = KATALOG_M3_RECIPES[0];
    if (!r) throw new Error('pusty katalog');
    const log = { id: 'log1', recipeId: r.id, recipeName: 'Inna nazwa' } as unknown as StoredBakeLog;
    expect(prepareBakeAgainRecipe(log, [])).toEqual({ id: r.id, name: r.namePl, targetDDT: r.targetDDT, formula: r.formula });
    expect(MASTER_RECIPES.some((m) => m.id === r.id)).toBe(false);
  });
});
