/**
 * 057 (DEC-09 a; design-spec §11b „057”, makieta docs/design/ekrany/kalkulator.html, stany `receptura`
 * i `receptura-wiecej`): w obszarze akcji receptury dokładnie 4 przyciski, reszta w menu „Więcej” z paska
 * nawigacji (Kopiuj jako tekst, Udostępnij plik receptury); każdy testID najwyżej raz; import tylko
 * w Ustawieniach (F-33); bez emoji; „Ułóż plan” prowadzi do planu wypieku z tą recepturą
 * [M1-audytor-generalny-057; 04-studio-projektowe-012, 03-zakres-010].
 */
import fs from 'fs';
import path from 'path';
import React from 'react';
import { ActionSheetIOS, StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import CalculatorScreen from '../../app/(tabs)/receptury/receptura';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, setActiveBake, getActiveBake, _resetMemStore } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { biezaceMenuReceptury, pokazMenuReceptury } from '../lib/menu-receptury';
import { recepturaPlanu } from '../lib/plan-receptury';
import { theme } from '../ui/theme';

jest.setTimeout(20000);

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('../lib/calculator-actions', () => {
  const actual = jest.requireActual('../lib/calculator-actions');
  return { ...actual, executeCopyRecipe: jest.fn(), executeExportRecipeJson: jest.fn() };
});

const ROOT = path.resolve(__dirname, '../..');
const EMOJI = /\p{Extended_Pictographic}/u;
const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
/** Elementy natywne (host) z testID: ten sam testID ma też komponent złożony, więc liczymy tylko natywne. */
const hostIds = (root: renderer.ReactTestInstance): string[] =>
  root.findAll((n) => typeof n.type === 'string' && typeof n.props.testID === 'string').map((n) => String(n.props.testID));

describe('057: recipe with 4 main actions and a "More" menu', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    zUprawnieniem();
    mockPush.mockClear();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
    await act(async () => {
      tree = renderer.create(<CalculatorScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
  });

  it('(1) the action area has exactly 4 buttons in order, main 64 pt, the others 48 pt', () => {
    const obszar = tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'recipe-actions');
    expect(obszar).toHaveLength(1);
    const przyciski = obszar[0].findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'button');
    expect(przyciski.map((p) => p.props.testID)).toEqual(['start-bake-btn', 'save-custom-recipe-btn', 'water-temp-btn', 'edit-ingredients-btn']);
    expect(przyciski.map(tekst)).toEqual(['Ułóż plan', 'Zapisz jako moją', 'Temperatura wody', 'Zmień składniki']);
    expect(przyciski.map((p) => StyleSheet.flatten(p.props.style).minHeight)).toEqual([
      theme.cele.przyciskKciuka,
      theme.cele.glownyPrzeplyw,
      theme.cele.glownyPrzeplyw,
      theme.cele.glownyPrzeplyw,
    ]);
    expect(StyleSheet.flatten(przyciski[0].props.style).backgroundColor).toBe(theme.colors.akcent);
  });

  it('(2) every testID appears at most once; no import, pantry or second start on the recipe', () => {
    const ids = hostIds(tree!.root);
    const duplikaty = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    expect(duplikaty).toEqual([]);
    for (const brak of ['import-recipe-json-btn', 'open-import-recipe-btn', 'open-flour-inventory-btn', 'fast-start-bake-cta-btn', 'copy-recipe-btn', 'export-recipe-json-btn', 'edit-blend-pro-btn', 'open-blend-builder-btn', 'clone-recipe-btn']) {
      expect({ brak, jest: ids.includes(brak) }).toEqual({ brak, jest: false });
    }
  });

  it('(3) "More" opens a system menu with exactly 2 items in order; they run copy and file sharing', () => {
    const actions = jest.requireMock('../lib/calculator-actions') as { executeCopyRecipe: jest.Mock; executeExportRecipeJson: jest.Mock };
    expect(biezaceMenuReceptury().map((p) => [p.id, p.etykieta])).toEqual([
      ['copy-recipe-btn', 'Kopiuj jako tekst'],
      ['export-recipe-json-btn', 'Udostępnij plik receptury'],
    ]);
    const sheet = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
    pokazMenuReceptury();
    expect(sheet).toHaveBeenCalledTimes(1);
    const [opcje, wybor] = sheet.mock.calls[0];
    expect(opcje.options).toEqual(['Kopiuj jako tekst', 'Udostępnij plik receptury', 'Anuluj']);
    expect(opcje.cancelButtonIndex).toBe(2);
    act(() => wybor(0));
    expect(actions.executeCopyRecipe).toHaveBeenCalledTimes(1);
    act(() => wybor(1));
    expect(actions.executeExportRecipeJson).toHaveBeenCalledTimes(1);
    act(() => wybor(2));
    expect(actions.executeCopyRecipe).toHaveBeenCalledTimes(1);
    expect(actions.executeExportRecipeJson).toHaveBeenCalledTimes(1);
    sheet.mockRestore();
  });

  it('(4) labels have no emoji: screen texts, VoiceOver labels and menu items', () => {
    const napisy = [
      ...tree!.root.findAll((n) => (n.type as unknown) === 'Text').map(tekst),
      ...tree!.root.findAll((n) => typeof n.props.accessibilityLabel === 'string').map((n) => String(n.props.accessibilityLabel)),
      ...biezaceMenuReceptury().map((p) => p.etykieta),
    ];
    expect(napisy.filter((s) => EMOJI.test(s))).toEqual([]);
  });

  it('"Make a Plan" opens the bake plan with this recipe; "Start Bake" there keeps the recipe', async () => {
    await act(async () => {
      tree!.root.findAll((n) => n.props.testID === 'start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(mockPush).toHaveBeenCalledWith('/receptury/harmonogram');
    expect(getActiveBake()).toBeNull();
    const r = recepturaPlanu();
    expect(r?.recipeName).toBe('Wiejski chleb codzienny na zakwasie');
    expect(r?.calculatedRecipe.targetDoughWeightGrams).toBe(1700);

    let plan: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      plan = renderer.create(<HarmonogramScreen />);
    });
    await act(async () => {
      plan!.root.findAll((n) => n.props.testID === 'plan-start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    const aktywny = getActiveBake();
    expect(aktywny?.recipeName).toBe('Wiejski chleb codzienny na zakwasie');
    expect(aktywny?.calculatedRecipe?.targetDoughWeightGrams).toBe(1700);
    expect(aktywny?.recipeFormula?.waterPercentage).toBe(68);
    expect(aktywny?.steps?.length).toBeGreaterThan(0);
    // [M1-audytor-generalny-017] DDT docelowe nie jest zapisywane jako zmierzone
    expect(aktywny?.actualDdtC).toBeUndefined();
    expect(mockPush).toHaveBeenLastCalledWith('/stolnica');
    act(() => plan!.unmount());
  });

  it('"Water temperature" opens a sheet with the water temperature; "Change Ingredients" opens the ingredients sheet', async () => {
    expect(hostIds(tree!.root)).not.toContain('water-temp-sheet');
    await act(async () => {
      tree!.root.findAll((n) => n.props.testID === 'water-temp-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    const arkusz = tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'water-temp-sheet');
    expect(arkusz).toHaveLength(1);
    expect(tekst(arkusz[0])).toContain('Docelowa temp. wody:');
    expect(hostIds(arkusz[0])).toContain('ddt-plus-btn');
    await act(async () => {
      tree!.root.findAll((n) => n.props.testID === 'edit-ingredients-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    // Arkusz „Składniki” zamiast edytora mieszanki mąk (§11c 106) [M1-audytor-generalny-106]
    expect(hostIds(tree!.root)).toContain('ingredients-sheet');
  });

  // Karty liczb (CalculatorSacredCard) usunięte bez zastępstwa w formie kart (§11c 106, §12a): liczby są w liście
  // grupowanej — tryb, „Do miski”, zdanie o hydratacji, „Razem” [M1-audytor-generalny-106]
  it('numbers are a grouped list, not CraftCard/CraftStatDisplay and not a card of numbers (mapa-rol §4)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'app/(tabs)/receptury/receptura.tsx'), 'utf8');
    expect(src).not.toMatch(/from '@apps4craft\/ui'|<Craft(Card|StatDisplay)\b|CalculatorSacredCard/);
    const ids = hostIds(tree!.root);
    expect(ids).not.toContain('sacred-numbers-panel');
    for (const id of ['recipe-mode', 'do-miski', 'recipe-hydration', 'recipe-total']) expect(ids).toContain(id);
    const wiersz = tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'scale-item-water')[0];
    expect(StyleSheet.flatten(wiersz.props.style).minHeight).toBe(theme.cele.glownyPrzeplyw);
  });
});
