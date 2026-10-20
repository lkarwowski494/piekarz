/**
 * BR-DRUK-001 (F-50, ZM-13, D-034 wybór 7b): jedno wejście „Drukuj” w akcjach Kalkulatora z wyborem
 * karty receptury A4 albo etykiety słoika; bez zakwasu komunikat zamiast pustej etykiety
 * [M1-audytor-generalny-032; ZM-13].
 */
import React from 'react';
import { Alert, AlertButton } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import CalculatorScreen from '../../app/(tabs)/index';
import ZakwasScreen from '../../app/(tabs)/zakwas';
import { initDatabase, setActiveBake, saveStarter, getStarters, deleteStarter, _resetMemStore } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { openPrintMenu, starterLabelOptions } from '../lib/print-menu';

jest.setTimeout(20000);

// F-50 PÓŹNIEJ (D-043): wejście „Drukuj” ukryte w aplikacji (test wejscia-pozniej); tu sprawdzamy kod druku,
// który zostaje, z włączonym wejściem [M1-audytor-generalny-072].
jest.mock('../lib/wejscia-pozniej', () => {
  const actual = jest.requireActual('../lib/wejscia-pozniej');
  return { ...actual, wejscieWidoczne: (w: string) => w === 'druk' || actual.wejscieWidoczne(w) };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('../lib/pdf-sheet-generator', () => ({
  exportRecipeSheetAsPdf: jest.fn().mockResolvedValue('file:///mock/recipe.pdf'),
  printRecipeSheetDirectly: jest.fn().mockResolvedValue(undefined),
  exportStarterLabelAsPdf: jest.fn().mockResolvedValue('file:///mock/label.pdf'),
  printStarterLabelDirectly: jest.fn().mockResolvedValue(undefined),
}));

const pdf = jest.requireMock('../lib/pdf-sheet-generator') as {
  exportRecipeSheetAsPdf: jest.Mock;
  exportStarterLabelAsPdf: jest.Mock;
};

const printIds = (root: renderer.ReactTestInstance): string[] => [
  ...new Set(
    root
      .findAll((n) => typeof n.props?.testID === 'string' && /print|pdf|druk|label/i.test(n.props.testID))
      .map((n) => String(n.props.testID))
  ),
];

async function renderCalculator(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<CalculatorScreen />);
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree!;
}

/** Dotyka „Drukuj” i zwraca przyciski okna wyboru. */
async function openMenu(tree: renderer.ReactTestRenderer, alert: jest.SpyInstance): Promise<AlertButton[]> {
  await act(async () => {
    tree.root.findAllByProps({ testID: 'print-menu-btn' })[0].props.onPress();
  });
  const call = alert.mock.calls.find((c) => c[0] === 'Drukuj');
  expect(call?.[1]).toBe('Co chcesz wydrukować?');
  return call![2] as AlertButton[];
}

describe('Single print entry in the Calculator actions (BR-DRUK-001)', () => {
  let alert: jest.SpyInstance;

  beforeEach(async () => {
    zUprawnieniem();
    jest.clearAllMocks();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
    // Baza startuje z przykładowym zakwasem; każdy przypadek ustala własną listę
    for (const s of await getStarters()) await deleteStarter(s.id);
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });
  afterEach(() => {
    alert.mockRestore();
  });

  it('starterLabelOptions maps a saved starter to label data with age in whole days', () => {
    const now = 10 * 86400000 + 5000;
    expect(
      starterLabelOptions({ id: 'x', name: 'Ala', flourType: 'Żytnia', hydration: 90, birthDate: 7 * 86400000 + 9000, storageState: 'ROOM_TEMP', feedingRatio: '1:5:5' }, now)
    ).toEqual({ starterName: 'Ala', flourType: 'Żytnia', hydration: 90, storageState: 'ROOM_TEMP', ageDays: 2, feedingRatio: '1:5:5' });
  });

  it('openPrintMenu runs the given recipe printer only after the card is chosen', () => {
    const printRecipe = jest.fn();
    openPrintMenu(printRecipe);
    expect(printRecipe).not.toHaveBeenCalled();
    const buttons = alert.mock.calls[0][2] as AlertButton[];
    buttons[0].onPress?.();
    expect(printRecipe).toHaveBeenCalledTimes(1);
  });

  it('Calculator has exactly one print entry and the Starter screen has none', async () => {
    const calc = await renderCalculator();
    expect(printIds(calc.root)).toEqual(['print-menu-btn']);
    act(() => calc.unmount());

    let zakwas: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      zakwas = renderer.create(<ZakwasScreen />);
    });
    expect(printIds(zakwas!.root)).toEqual([]);
    act(() => zakwas!.unmount());
  });

  it('the menu offers the A4 recipe card and the starter jar label; the card goes to the PDF generator', async () => {
    const tree = await renderCalculator();
    const buttons = await openMenu(tree, alert);
    expect(buttons.map((b) => b.text)).toEqual(['Karta receptury A4', 'Etykieta słoika zakwasu', 'Anuluj']);
    await act(async () => {
      await buttons[0].onPress?.();
    });
    expect(pdf.exportRecipeSheetAsPdf).toHaveBeenCalledWith(
      expect.objectContaining({ recipeName: expect.any(String), totalFlourGrams: expect.any(Number) })
    );
    expect(pdf.exportStarterLabelAsPdf).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('jar label without any starter shows a message instead of an empty label', async () => {
    const tree = await renderCalculator();
    const buttons = await openMenu(tree, alert);
    await act(async () => {
      await buttons[1].onPress?.();
      for (let i = 0; i < 5; i++) await Promise.resolve();
    });
    expect(pdf.exportStarterLabelAsPdf).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith('Etykieta słoika zakwasu', 'Najpierw dodaj zakwas w zakładce Zakwas.');
    act(() => tree.unmount());
  });

  it('jar label with one saved starter prints that starter', async () => {
    await saveStarter({ id: 's1', name: 'Bolek', flourType: 'Żytnia 2000', hydration: 100, birthDate: Date.now() - 3 * 86400000, storageState: 'FRIDGE' });
    const tree = await renderCalculator();
    const buttons = await openMenu(tree, alert);
    await act(async () => {
      await buttons[1].onPress?.();
      for (let i = 0; i < 5; i++) await Promise.resolve();
    });
    expect(pdf.exportStarterLabelAsPdf).toHaveBeenCalledWith(
      expect.objectContaining({ starterName: 'Bolek', flourType: 'Żytnia 2000', hydration: 100, ageDays: 3, storageState: 'FRIDGE' }),
      true
    );
    act(() => tree.unmount());
  });

  it('jar label with several starters asks which one to print', async () => {
    await saveStarter({ id: 's1', name: 'Bolek', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE' });
    await saveStarter({ id: 's2', name: 'Lolek', flourType: 'Pszenna', hydration: 80, birthDate: 1, storageState: 'ROOM_TEMP' });
    const tree = await renderCalculator();
    const buttons = await openMenu(tree, alert);
    await act(async () => {
      await buttons[1].onPress?.();
      for (let i = 0; i < 5; i++) await Promise.resolve();
    });
    const pick = alert.mock.calls.find((c) => c[0] === 'Który zakwas?');
    const choices = pick![2] as AlertButton[];
    expect(choices.map((b) => b.text).sort()).toEqual(['Anuluj', 'Bolek', 'Lolek']);
    await act(async () => {
      await choices.find((b) => b.text === 'Lolek')!.onPress?.();
    });
    expect(pdf.exportStarterLabelAsPdf).toHaveBeenCalledWith(expect.objectContaining({ starterName: 'Lolek' }), true);
    act(() => tree.unmount());
  });
});
