/**
 * 106 (design-spec §11c „106”, makieta docs/design/ekrany/kalkulator.html, stany `lista-receptur`, `receptura`,
 * `receptura-zaczyn`, `skladniki-pelne`, `temperatura-wody`): zakładka Receptury ma dwa poziomy — lista receptur
 * (ekran główny) i ekran receptury (push w stosie) z paskiem akcji poza przewijaniem; tryb liczenia, mąki,
 * proporcje i zaczyn są w arkuszu „Składniki”; arkusz temperatury wody liczy tylko temperaturę
 * [M1-audytor-generalny-106; 04-studio-projektowe-022].
 */
import React from 'react';
import { ActionSheetIOS, ScrollView } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import RecepturyLista from '../../app/(tabs)/receptury/index';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import { initDatabase, setActiveBake, _resetMemStore, saveRecipe } from '../data/sqlite-store';
import { MASTER_RECIPES, filterMasterRecipes } from '../recipes/presets';
import { POPULAR_FLOUR_BLENDS } from '../core/domain-rules';
import { clearPendingRecipeToLoad, setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { opisReceptury, nazwaZaczynu, ZACZYNY_W_MENU, PROCENTY_MAKI_W_ZACZYNIE } from '../components/receptury/nazwy-receptur';
import { zglosEkranReceptury, ekranRecepturyOtwarty, subskrybujZmianyReceptur, powiadomOZmianieReceptur, pokazMenuWyboru } from '../components/receptury/stos-receptur';

jest.setTimeout(20000);

const mockPush = jest.fn();
const mockSetParams = jest.fn();
type Opcje = Record<string, unknown> & { title?: string; headerRight?: () => React.ReactElement };
const mockStos: { ekrany: Array<{ name: string; options: unknown }> } = { ekrany: [] };
jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = ({ name, options }: { name: string; options?: unknown }) => {
    mockStos.ekrany.push({ name, options });
    return null;
  };
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: jest.fn(), setParams: mockSetParams }),
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

const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const hostIds = (root: renderer.ReactTestInstance): string[] =>
  root.findAll((n) => typeof n.type === 'string' && typeof n.props.testID === 'string').map((n) => String(n.props.testID));
const host = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const nacisnij = async (root: renderer.ReactTestInstance, id: string) => {
  const el = root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function')[0];
  if (!el) throw new Error(`brak ${id}`);
  await act(async () => {
    el.props.onPress();
  });
};
const wpisz = async (root: renderer.ReactTestInstance, id: string, wartosc: string) => {
  const pole = host(root, id)[0];
  if (!pole) throw new Error(`brak pola ${id}`);
  await act(async () => {
    pole.props.onFocus?.();
    pole.props.onChangeText(wartosc);
  });
  await act(async () => {
    pole.props.onBlur?.({});
  });
};
const wRzedzie = (ids: string[], kolejnosc: string[]) => {
  const unikalne = [...new Set(ids)];
  return unikalne.filter((id) => kolejnosc.includes(id));
};

async function render(el: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree!;
}

describe('106: Receptury — lista, ekran receptury, arkusz „Składniki”', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    zUprawnieniem();
    mockPush.mockClear();
    mockSetParams.mockClear();
    _resetMemStore();
    setActiveBake(null);
    clearPendingRecipeToLoad();
    await initDatabase();
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    jest.restoreAllMocks();
  });

  it('(1) the tab screen is the recipe list: base recipes as rows, kind filter, no "Make a Plan"', async () => {
    tree = await render(<RecepturyLista />);
    expect(host(tree.root, 'recipe-list')).toHaveLength(1);
    const wiersze = () => [...new Set(hostIds(tree!.root).filter((id) => id.startsWith('recipe-row-')))];
    expect(wiersze()).toEqual(filterMasterRecipes('all').map((r) => `recipe-row-${r.id}`));
    expect(hostIds(tree.root)).not.toContain('start-bake-btn');
    const txt = tekst(tree.root);
    expect(txt).toContain('Receptury bazowe');
    expect(txt).not.toContain('Receptury mistrzowskie');
    // Podpis „{rodzaj}, poziom {trudność}”; receptury bazowe nie mają dziś poziomu (dane roli 06), więc sam rodzaj
    const pierwsza = filterMasterRecipes('all')[0];
    expect(tekst(host(tree.root, `recipe-row-${pierwsza.id}`)[0])).toBe(`${pierwsza.namePl} ${opisReceptury(pierwsza)} ›`);
    expect(opisReceptury({ category: 'sourdough', difficulty: 'easy' })).toBe('Na zakwasie, poziom łatwy');
    expect(opisReceptury({ category: 'rye', difficulty: 'medium' })).toBe('Żytni, poziom średni');
    expect(opisReceptury({ category: 'yeast' })).toBe('Drożdżowy');
    // Filtr bez licznika (§11c 106)
    expect(tekst(host(tree.root, 'category-filter-all')[0])).toBe('Wszystkie');
    await nacisnij(tree.root, 'category-filter-rye');
    expect(wiersze()).toEqual(filterMasterRecipes('rye').map((r) => `recipe-row-${r.id}`));
  });

  it('(1) my recipes are a group above the base recipes', async () => {
    await saveRecipe({
      id: 'moja_1',
      name: 'Mój wiejski 75%',
      formula: { flours: [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100 }], waterPercentage: 75, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 900 },
      targetDDT: 25,
      isBuiltIn: false,
      createdAt: Date.now(),
    });
    tree = await render(<RecepturyLista />);
    const txt = tekst(tree.root);
    expect(txt.indexOf('Moje receptury')).toBeGreaterThanOrEqual(0);
    expect(txt.indexOf('Moje receptury')).toBeLessThan(txt.indexOf('Receptury bazowe'));
    expect(txt).not.toContain('Moje przepisy');
    expect(host(tree.root, 'recipe-row-moja_1')).toHaveLength(1);
  });

  it('(2) tapping a row opens the recipe screen titled with the recipe name', async () => {
    const r = MASTER_RECIPES.find((p) => p.id === 'borodinsky_rye')!;
    tree = await render(<RecepturyLista />);
    await nacisnij(tree.root, `recipe-row-${r.id}`);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/receptury/receptura', params: { nazwa: r.namePl } });
    act(() => tree!.unmount());
    tree = await render(<EkranReceptury />);
    expect(mockSetParams).toHaveBeenLastCalledWith({ nazwa: r.namePl });
    expect(tekst(tree.root)).toContain('foremka keksówka');

    // Tytuł paska nawigacji z parametru trasy; „Więcej” jest na ekranie receptury, nie na liście
    mockStos.ekrany = [];
    const Uklad = require('../../app/(tabs)/receptury/_layout').default;
    const u = await render(<Uklad />);
    act(() => u.unmount());
    const opcje = mockStos.ekrany.find((e) => e.name === 'receptura')!.options as (a: { route: { params?: { nazwa?: string } } }) => Opcje;
    expect(opcje({ route: { params: { nazwa: r.namePl } } }).title).toBe(r.namePl);
    expect(typeof opcje({ route: {} }).headerRight).toBe('function');
    const lista = mockStos.ekrany.find((e) => e.name === 'index')!.options as Opcje;
    expect(lista.title).toBe('Receptury');
    expect(lista.headerRight).toBeUndefined();
  });

  it('(3)(4) recipe screen: actions outside the scroll view, section order, no cards or accordion', async () => {
    tree = await render(<EkranReceptury />);
    const start = host(tree.root, 'start-bake-btn')[0];
    let p: renderer.ReactTestInstance | null = start.parent;
    while (p) {
      expect(p.type === ScrollView || p.type === ('RCTScrollView' as unknown)).toBe(false);
      p = p.parent;
    }
    const ids = hostIds(tree.root);
    for (const brak of ['artisan-accordion-pro', 'artisan-accordion-toggle-btn', 'sacred-numbers-panel', 'calc-mode-loaves', 'calc-mode-flour', 'do-miski-scale-card']) {
      expect({ brak, jest: ids.includes(brak) }).toEqual({ brak, jest: false });
    }
    expect(wRzedzie(ids, ['recipe-mode', 'do-miski', 'recipe-hydration', 'recipe-total', 'recipe-about', 'recipe-actions'])).toEqual([
      'recipe-mode', 'do-miski', 'recipe-hydration', 'recipe-total', 'recipe-about', 'recipe-actions',
    ]);
    expect(ids).toContain('scale-item-water');
    expect(ids).toContain('loaves-increment-btn');
    expect(ids).toContain('loaf-weight-input');
  });

  it('(5) the "Change Ingredients" sheet has mode, flours, proportions and preferment in order', async () => {
    tree = await render(<EkranReceptury />);
    await nacisnij(tree.root, 'edit-ingredients-btn');
    const arkusz = host(tree.root, 'ingredients-sheet');
    expect(arkusz).toHaveLength(1);
    const kolejnosc = ['calc-mode-loaves', 'calc-mode-flour', 'add-flour-btn', 'flour-blend-menu-btn', 'water-pct-input', 'starter-pct-input', 'starter-hydration-input', 'salt-pct-input', 'yeast-pct-input', 'preferment-type-btn'];
    expect(wRzedzie(hostIds(arkusz[0]), kolejnosc)).toEqual(kolejnosc);
    expect(tekst(arkusz[0])).toContain('Ilości liczę od');
    expect(tekst(arkusz[0])).toContain('Proporcje (procent mąki)');

    // Zakwas 0% → bez hydratacji zakwasu
    await wpisz(tree.root, 'starter-pct-input', '0');
    expect(hostIds(tree.root)).not.toContain('starter-hydration-input');
    expect(hostIds(tree.root)).not.toContain('scale-item-starter');

    // Woda 75% (przecinek i kropka przez NumInput) zmienia „Do miski”
    const przed = tekst(host(tree.root, 'scale-item-water')[0]);
    await wpisz(tree.root, 'water-pct-input', '75,5');
    expect(tekst(host(tree.root, 'scale-item-water')[0])).not.toBe(przed);
    expect(tekst(host(tree.root, 'scale-item-water')[0])).toContain('75,5%');

    // Tryb: masa mąki → na ekranie pole masy mąki zamiast bochenków
    await nacisnij(tree.root, 'calc-mode-flour');
    expect(hostIds(tree.root)).toContain('flour-weight-input');
    expect(hostIds(tree.root)).not.toContain('loaves-increment-btn');
  });

  it('(5) "Use a Flour Blend" is a system menu with the blends; the choice replaces the flours', async () => {
    tree = await render(<EkranReceptury />);
    await nacisnij(tree.root, 'edit-ingredients-btn');
    const sheet = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
    await nacisnij(tree.root, 'flour-blend-menu-btn');
    const [opcje, wybor] = sheet.mock.calls[0];
    expect(opcje.options).toEqual([...POPULAR_FLOUR_BLENDS.map((b) => b.namePl), 'Anuluj']);
    const i = POPULAR_FLOUR_BLENDS.findIndex((b) => b.flours.length === 3);
    await act(async () => wybor(i));
    for (const f of POPULAR_FLOUR_BLENDS[i].flours) expect(tekst(tree.root)).toContain(f.name);
  });

  it('(6) choosing poolish splits "Into the bowl" into preferment and dough groups', async () => {
    tree = await render(<EkranReceptury />);
    expect(hostIds(tree.root)).toContain('do-miski');
    await nacisnij(tree.root, 'edit-ingredients-btn');
    const sheet = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
    await nacisnij(tree.root, 'preferment-type-btn');
    expect(sheet.mock.calls[0][0].options).toEqual(['bez zaczynu', 'poolish', 'biga', 'stare ciasto', 'levain', 'Anuluj']);
    await act(async () => sheet.mock.calls[0][1](1));
    const ids = hostIds(tree.root);
    expect(ids).toContain('do-miski-zaczyn');
    expect(ids).toContain('do-miski-ciasto');
    expect(ids).not.toContain('do-miski');
    expect(tekst(tree.root)).toContain('Zaczyn: poolish');
    expect(tekst(tree.root)).toContain('poolish (cały)');
    await nacisnij(tree.root, 'preferment-flour-btn');
    expect(sheet.mock.calls[1][0].options).toEqual(['15 %', '20 %', '25 %', '30 %', '40 %', 'Anuluj']);
    await act(async () => sheet.mock.calls[1][1](3));
    expect(tekst(host(tree.root, 'preferment-flour-btn')[0])).toContain('30 %');
  });

  it('(7) the water temperature sheet has no hydration stepper', async () => {
    tree = await render(<EkranReceptury />);
    await nacisnij(tree.root, 'water-temp-btn');
    const arkusz = host(tree.root, 'water-temp-sheet')[0];
    const ids = hostIds(arkusz);
    expect(ids).toContain('ddt-plus-btn');
    expect(ids).not.toContain('water-pct-minus-btn');
    expect(ids).not.toContain('water-pct-plus-btn');
    expect(tekst(arkusz)).not.toContain('Hydratacja bazy');
  });
  it('the list does not open a second recipe screen; it reloads my recipes after "Save as Mine"', async () => {
    tree = await render(<RecepturyLista />);
    const odejdz = zglosEkranReceptury();
    expect(ekranRecepturyOtwarty()).toBe(true);
    const r = MASTER_RECIPES[1];
    await act(async () => setPendingRecipeToLoad({ id: r.id, name: r.namePl, formula: r.formula, targetDDT: r.targetDDT }));
    expect(mockPush).not.toHaveBeenCalled();
    odejdz();
    expect(ekranRecepturyOtwarty()).toBe(false);
    clearPendingRecipeToLoad();

    const zmiany = jest.fn();
    const koniec = subskrybujZmianyReceptur(zmiany);
    await saveRecipe({
      id: 'moja_2',
      name: 'Zapisana teraz',
      formula: { flours: [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 900 },
      targetDDT: 25,
      isBuiltIn: false,
      createdAt: Date.now(),
    });
    await act(async () => {
      powiadomOZmianieReceptur();
      await Promise.resolve();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(zmiany).toHaveBeenCalledTimes(1);
    expect(host(tree.root, 'recipe-row-moja_2')).toHaveLength(1);
    koniec();
  });

  it('preferment names and the system choice menu ("Cancel" changes nothing)', () => {
    expect(ZACZYNY_W_MENU.map(nazwaZaczynu)).toEqual(['bez zaczynu', 'poolish', 'biga', 'stare ciasto', 'levain']);
    expect(PROCENTY_MAKI_W_ZACZYNIE).toEqual([15, 20, 25, 30, 40]);
    const sheet = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
    const wybor = jest.fn();
    pokazMenuWyboru('Tytuł', ['a', 'b'], wybor);
    expect(sheet.mock.calls[0][0]).toMatchObject({ title: 'Tytuł', options: ['a', 'b', 'Anuluj'], cancelButtonIndex: 2 });
    sheet.mock.calls[0][1](2);
    expect(wybor).not.toHaveBeenCalled();
    sheet.mock.calls[0][1](1);
    expect(wybor).toHaveBeenCalledWith(1);
  });
});