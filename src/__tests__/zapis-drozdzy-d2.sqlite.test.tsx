/**
 * Audyt niezależny D-2 (= B-3): „Zapisz jako moją” gubiła drożdże receptury (formuła zapisu bez
 * extraYeastPercentage), a eksport JSON/QR (`currentRecipeForShare`) też ich nie miał. Zapis, kopia i
 * udostępnianie biorą teraz całą formułę receptury (tę samą, którą dostaje plan) [audyt-niezalezny D-2].
 * Prawdziwy SQLite (node:sqlite): zapis z ekranu → odczyt z pliku bazy → wczytanie na ekran.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), setParams: jest.fn() }),
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

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import { useTempDbDir, openRaw, dbFilePath } from '../data/__tests__/helpers/node-sqlite-adapter';
import { setActiveBake, initDatabase, getRecipes, _resetMemStore } from '../data/sqlite-store';
import { clearPendingRecipeToLoad, setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { exportRecipeToJson, parseAndValidateRecipeJson } from '../lib/recipe-sharing';
import { SaveRecipeModal } from '../components/calculator/SaveRecipeModal';
import { CalculatorModalsProvider } from '../components/calculator/CalculatorModalsProvider';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(30000);

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
  await act(async () => {
    const pole = host(root, id)[0];
    pole.props.onFocus?.();
    pole.props.onChangeText(wartosc);
  });
  await act(async () => {
    host(root, id)[0].props.onBlur?.({});
  });
};
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  });
};

describe('D-2: drożdże receptury w zapisie „Zapisz jako moją” i w udostępnianiu (SQLite)', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  beforeEach(() => {
    useTempDbDir();
    zUprawnieniem();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    clearPendingRecipeToLoad();
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    jest.restoreAllMocks();
  });

  it('save → database file → loaded recipe keeps yeast 0.5%; JSON/QR payload carries it too', async () => {
    _resetMemStore();
    await initDatabase();
    setActiveBake(null);
    await act(async () => {
      tree = renderer.create(<EkranReceptury />);
    });
    await nacisnij(tree!.root, 'edit-ingredients-btn');
    await wpisz(tree!.root, 'yeast-pct-input', '0,5');
    expect(host(tree!.root, 'scale-item-yeast')).toHaveLength(1);

    // Udostępnianie (plik JSON i QR) dostaje formułę z drożdżami
    const udost = tree!.root.findByType(CalculatorModalsProvider).props.currentRecipeForShare;
    expect(udost.formula.extraYeastPercentage).toBe(0.5);
    const zJson = parseAndValidateRecipeJson(exportRecipeToJson(udost));
    expect(zJson.success && zJson.recipe.formula.extraYeastPercentage).toBe(0.5);

    // „Zapisz jako moją”
    await nacisnij(tree!.root, 'save-custom-recipe-btn');
    await act(async () => {
      tree!.root.findByType(SaveRecipeModal).props.onRecipeNameChange('Mój z drożdżami');
    });
    await act(async () => {
      await tree!.root.findByType(SaveRecipeModal).props.onSave();
    });
    await settle();
    act(() => tree!.unmount());
    tree = null;

    // Odczyt wprost z pliku bazy (osobne połączenie node:sqlite) i przez magazyn aplikacji
    const raw = openRaw(dbFilePath('piekarz.db', '/Library/SQLite'));
    const wiersz = raw.prepare("SELECT formula_json FROM recipes WHERE name = ?").get('Mój z drożdżami') as { formula_json: string } | undefined;
    raw.close();
    expect(JSON.parse(wiersz!.formula_json).extraYeastPercentage).toBe(0.5);
    const zapisana = (await getRecipes()).find((r) => r.name === 'Mój z drożdżami');
    expect(zapisana?.formula.extraYeastPercentage).toBe(0.5);

    // Wczytanie zapisanej receptury na ekran: wiersz drożdży wraca
    setPendingRecipeToLoad({ id: zapisana!.id, name: zapisana!.name, formula: zapisana!.formula, targetDDT: zapisana!.targetDDT });
    await act(async () => {
      tree = renderer.create(<EkranReceptury />);
    });
    await settle();
    expect(host(tree!.root, 'scale-item-yeast')).toHaveLength(1);
  });
});
