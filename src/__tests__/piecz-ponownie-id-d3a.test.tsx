/**
 * D3a: id receptury w wypieku i „Piecz ponownie” po id (D-10 pełne, D1-7). Start z receptury zapisuje id receptury
 * w sesji (ActiveBakeState.recipeId), koniec przenosi je do bakes.recipe_id (D1). „Piecz ponownie” szuka najpierw po
 * recipe_id (receptura przemianowana dalej się znajduje), a stare wpisy bez id — po nazwie, z mapą dawnych nazw
 * („Verace”). Wpis sprzed tej wersji (bez id) z bazowej chałki albo bagietki: przed planem krótka informacja, że
 * receptura bazowa się zmieniła (217: więcej drożdży, D-097) [M3 D3a].
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
import { initDatabase, _resetMemStore, saveBakeLog, saveRecipe, setActiveBake, getActiveBake, getStarters, deleteStarter } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
import { recepturaPlanu, ustawRecepturePlanu } from '../lib/plan-receptury';
import { bazowaZmienionaOdWypieku, prepareBakeAgainRecipe } from '../lib/recipe-navigation';
import { MASTER_RECIPES } from '../recipes/presets';
import { calculateDoughRecipe } from '../core/domain-rules';
import { setLang } from '../lib/i18n';
import type { StoredBakeLog, StoredRecipe } from '../data/db';

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
const INFO = 'Receptura bazowa zmieniła się od tamtego wypieku: ma teraz więcej drożdży.';
const wpis = (recipeName: string, recipeId?: string | null): StoredBakeLog => ({ id: 'b1', recipeName, startedAt: 1, finishedAt: 2, ...(recipeId !== undefined ? { recipeId } : {}) });
const baza = (id: string) => MASTER_RECIPES.find((r) => r.id === id)!;
const moja: StoredRecipe = { id: 'recipe_user_9', name: 'Mój chleb po zmianie nazwy', formula: { ...MASTER_RECIPES[0].formula, waterPercentage: 81 }, targetDDT: 25, isBuiltIn: false, createdAt: 1 };

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

describe('D3a: recipe_id i „Piecz ponownie” po id', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    ustawRecepturePlanu(null);
    mockNavigate.mockClear();
    mockPush.mockClear();
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => ustawRecepturePlanu(null));

  it('prepareBakeAgainRecipe po recipe_id: receptura użytkownika po zmianie nazwy i bazowa po id, choć nazwa we wpisie inna', () => {
    expect(prepareBakeAgainRecipe(wpis('Stara nazwa mojego chleba', 'recipe_user_9'), [moja])).toEqual(
      expect.objectContaining({ id: 'recipe_user_9', name: 'Mój chleb po zmianie nazwy' })
    );
    expect(prepareBakeAgainRecipe(wpis('Jakaś dawna nazwa', 'sweet_chalka'), [])).toEqual(expect.objectContaining({ id: 'sweet_chalka' }));
  });

  it('wpis bez recipe_id (stary, D1-7) i z id receptury, której już nie ma: dobór po nazwie, z „Verace” przez mapę dawnych nazw', () => {
    expect(prepareBakeAgainRecipe(wpis(baza('sweet_chalka').namePl), [])?.id).toBe('sweet_chalka');
    expect(prepareBakeAgainRecipe(wpis(baza('sweet_chalka').namePl, null), [])?.id).toBe('sweet_chalka');
    expect(prepareBakeAgainRecipe(wpis('Pizza Napoletana Verace (48 h)'), [])?.id).toBe('pizza_napoletana_48h');
    expect(prepareBakeAgainRecipe(wpis(baza('baguette_tradition_poolish').namePl, 'recipe_usunieta'), [])?.id).toBe('baguette_tradition_poolish');
    expect(prepareBakeAgainRecipe(wpis('Nieznany', 'recipe_usunieta'), [])).toBeNull();
  });

  it('bazowaZmienionaOdWypieku: tylko stary wpis (bez recipe_id) z bazowej chałki albo bagietki', () => {
    const p = (log: StoredBakeLog, wlasne: StoredRecipe[] = []) => bazowaZmienionaOdWypieku(log, prepareBakeAgainRecipe(log, wlasne));
    expect(p(wpis(baza('sweet_chalka').namePl))).toBe(true);
    expect(p(wpis(baza('baguette_tradition_poolish').namePl, null))).toBe(true);
    expect(p(wpis(baza('sweet_chalka').namePl, 'sweet_chalka'))).toBe(false);
    expect(p(wpis(baza('pizza_napoletana_48h').namePl))).toBe(false);
    expect(p(wpis(baza('sweet_chalka').namePl), [{ ...moja, id: 'moja_chalka', name: baza('sweet_chalka').namePl }])).toBe(false);
    expect(bazowaZmienionaOdWypieku(wpis('Nieznany'), null)).toBe(false);
  });

  it('„Piecz ponownie” ze starego wpisu chałki: plan z id receptury i informacją, że receptura bazowa się zmieniła', async () => {
    await pieczPonownie(wpis(baza('sweet_chalka').namePl));
    expect(recepturaPlanu()).toEqual(expect.objectContaining({ recipeId: 'sweet_chalka', bazowaZmieniona: true }));
    expect(mockNavigate).toHaveBeenCalledWith('/receptury/harmonogram');
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
    });
    await flush();
    expect(textOf(tree.toJSON())).toContain(INFO);
    act(() => tree.unmount());
  });

  it('„Piecz ponownie” z nowego wpisu (z recipe_id): receptura po id, bez informacji o zmianie', async () => {
    await saveRecipe(moja);
    await pieczPonownie({ ...wpis('Stara nazwa mojego chleba', 'recipe_user_9'), id: 'b2' });
    expect(recepturaPlanu()).toEqual(expect.objectContaining({ recipeId: 'recipe_user_9', recipeName: 'Mój chleb po zmianie nazwy' }));
    expect(recepturaPlanu()?.bazowaZmieniona).toBeFalsy();
    expect(recepturaPlanu()?.recipeFormula.waterPercentage).toBe(81);
  });

  it('start z planu receptury zapisuje id receptury w wypieku (ActiveBakeState.recipeId)', async () => {
    for (const s of await getStarters()) await deleteStarter(s.id);
    const formula = { ...MASTER_RECIPES[0].formula, targetDoughWeightGrams: 1000 };
    ustawRecepturePlanu({ recipeName: MASTER_RECIPES[0].namePl, recipeId: MASTER_RECIPES[0].id, calculatedRecipe: calculateDoughRecipe(formula), recipeFormula: formula });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
    });
    await flush();
    await ustawGodzinePlanu(tree.root, 'Pojutrze', 12, 0);
    await act(async () => {
      tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes('Zacznij wypiek'))[0].props.onPress();
    });
    await flush();
    act(() => tree.unmount());
    expect(getActiveBake()?.recipeId).toBe(MASTER_RECIPES[0].id);
  });
});
