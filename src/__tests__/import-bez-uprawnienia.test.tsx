/**
 * Import receptury nie zapisuje niczego przed decyzją użytkownika (MON-06) i działa zawsze, także bez
 * uprawnienia (D-039, zmiana 2026-10-20) [M1-audytor-generalny-026; 02-monetyzacja-007]: gdy uprawnienie
 * zniknie przy otwartym imporcie (zwrot, koniec subskrypcji), potwierdzenie zapisuje recepturę bez ekranu
 * zakupu. Drogi: wklejony tekst, schowek (plik / JSON), kod QR (wejście skanu poza 1.0, kod zostaje).
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
// F-08 PÓŹNIEJ (D-043): wejście skanu QR ukryte w aplikacji; tu sprawdzamy kod importu z QR, który zostaje,
// z włączonym wejściem [M1-audytor-generalny-049].
jest.mock('../lib/wejscia-pozniej', () => {
  const actual = jest.requireActual('../lib/wejscia-pozniej');
  return { ...actual, wejscieWidoczne: (w: string) => w === 'qr' || actual.wejscieWidoczne(w) };
});
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import CalculatorScreen from '../../app/(tabs)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { PaywallModal } from '../components/PaywallModal';
import { QrScannerModal } from '../components/QrScannerModal';
import { ImportRecipeModal } from '../components/ImportRecipeModal';
import { initDatabase, _resetMemStore, getRecipes } from '../data/sqlite-store';
import { encodeRecipeToShareUrl } from '../lib/recipe-sharing';
import { odswiezDostep } from '../lib/platnosci/stan';
import { zUprawnieniem, mockIap } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const paywallShown = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const payload = encodeRecipeToShareUrl({
  id: 'recipe_shared_1',
  name: 'Chleb od sąsiada',
  formula: { flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 },
  targetDDT: 25,
  isBuiltIn: false,
  createdAt: 1,
});

async function press(tree: renderer.ReactTestRenderer, testID: string): Promise<void> {
  const all = tree.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
  expect({ testID, count: all.length > 0 }).toEqual({ testID, count: true });
  await act(async () => {
    await all[all.length - 1].props.onPress();
  });
  await flush();
}

/** Uprawnienie znika przy otwartym oknie (zwrot albo koniec subskrypcji): następny odczyt sklepu jest pusty. */
async function utrataUprawnienia(): Promise<void> {
  mockIap.entitlements = [];
  await act(async () => {
    await odswiezDostep();
  });
  await flush();
}

describe('ImportRecipeModal saves only after the user confirms (026, D-039)', () => {
  it('nothing is saved while the window is open; confirming saves once and closes the window', async () => {
    _resetMemStore();
    await initDatabase();
    const onClose = jest.fn();
    const onImportSuccess = jest.fn();
    let tree: renderer.ReactTestRenderer | null = null;
    const before = (await getRecipes()).length;
    await act(async () => {
      tree = renderer.create(<ImportRecipeModal visible={true} onClose={onClose} onImportSuccess={onImportSuccess} initialInput={payload} />);
    });
    expect((await getRecipes()).length).toBe(before);
    expect(onImportSuccess).not.toHaveBeenCalled();
    await act(async () => {
      await tree!.root.findByProps({ testID: 'confirm-import-btn' }).props.onPress();
    });
    expect((await getRecipes()).length).toBe(before + 1);
    expect(onImportSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });
});

describe('Import without an entitlement works and saves only after the user confirms (026, D-039)', () => {
  let alert: jest.SpyInstance;
  let tree: renderer.ReactTestRenderer;
  beforeEach(async () => {
    _resetMemStore();
    zUprawnieniem();
    await initDatabase();
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await act(async () => {
      tree = renderer.create(
        <AppAccessProvider>
          <CalculatorScreen />
        </AppAccessProvider>
      );
    });
    await flush();
  });
  afterEach(() => {
    act(() => tree.unmount());
    alert.mockRestore();
  });

  it('pasted text: after the entitlement ends, confirming saves the recipe once, without the purchase screen', async () => {
    await press(tree, 'open-import-recipe-btn');
    await act(async () => {
      tree.root.findByProps({ testID: 'recipe-json-input' }).props.onChangeText(payload);
    });
    await utrataUprawnienia();
    const before = (await getRecipes()).length;
    expect((await getRecipes()).some((r) => r.name === 'Chleb od sąsiada')).toBe(false);
    await press(tree, 'confirm-import-btn');
    expect((await getRecipes()).length).toBe(before + 1);
    expect((await getRecipes()).some((r) => r.name === 'Chleb od sąsiada')).toBe(true);
    expect(paywallShown(tree.root)).toBe(false);
    expect(alert).toHaveBeenCalledTimes(1);
  });

  it('clipboard (JSON file content): nothing is saved before confirming, then once, without the purchase screen', async () => {
    await press(tree, 'import-recipe-json-btn');
    (Clipboard.getStringAsync as jest.Mock).mockResolvedValueOnce(payload);
    await press(tree, 'paste-clipboard-btn');
    await utrataUprawnienia();
    const before = (await getRecipes()).length;
    expect(alert).not.toHaveBeenCalled();
    await press(tree, 'confirm-import-btn');
    expect((await getRecipes()).length).toBe(before + 1);
    expect(paywallShown(tree.root)).toBe(false);
    expect(alert).toHaveBeenCalledTimes(1);
  });

  it('QR code read after the entitlement ends: the import window opens without the purchase screen; saved only after confirming', async () => {
    await press(tree, 'open-scan-qr-btn');
    await utrataUprawnienia();
    const before = (await getRecipes()).length;
    await act(async () => {
      tree.root.findByType(QrScannerModal).props.onScanRecipe(payload);
    });
    await flush();
    expect(paywallShown(tree.root)).toBe(false);
    expect(tree.root.findByType(ImportRecipeModal).props.visible).toBe(true);
    expect((await getRecipes()).length).toBe(before);
    await act(async () => {
      await tree.root.findByType(ImportRecipeModal).findByProps({ testID: 'confirm-import-btn' }).props.onPress();
    });
    await flush();
    expect((await getRecipes()).length).toBe(before + 1);
    expect(paywallShown(tree.root)).toBe(false);
  });

  it('with an entitlement the import saves the recipe once (control)', async () => {
    await press(tree, 'open-import-recipe-btn');
    await act(async () => {
      tree.root.findByProps({ testID: 'recipe-json-input' }).props.onChangeText(payload);
    });
    const before = (await getRecipes()).length;
    await press(tree, 'confirm-import-btn');
    expect((await getRecipes()).length).toBe(before + 1);
    expect(paywallShown(tree.root)).toBe(false);
  });
});
