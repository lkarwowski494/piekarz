/**
 * Import receptury bez uprawnienia nie zapisuje niczego przed decyzją użytkownika (MON-06)
 * [M1-audytor-generalny-026; 02-monetyzacja-007]. Import i skan QR są płatne (DEC-01.podzial):
 * wejście jest za strażnikiem, a gdy uprawnienie zniknie przy otwartym imporcie (zwrot, koniec
 * subskrypcji), potwierdzenie otwiera tylko ekran zakupu. Drogi: wklejony tekst, schowek (plik / JSON), kod QR.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
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

describe('ImportRecipeModal asks the guard before saving (026)', () => {
  it('a refusing guard means no save, no success callback and the import window closes', async () => {
    _resetMemStore();
    await initDatabase();
    const onClose = jest.fn();
    const onImportSuccess = jest.fn();
    const canSave = jest.fn(() => false);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<ImportRecipeModal visible={true} onClose={onClose} onImportSuccess={onImportSuccess} canSave={canSave} initialInput={payload} />);
    });
    const before = (await getRecipes()).length;
    await act(async () => {
      await tree!.root.findByProps({ testID: 'confirm-import-btn' }).props.onPress();
    });
    expect(canSave).toHaveBeenCalledTimes(1);
    expect((await getRecipes()).length).toBe(before);
    expect(onImportSuccess).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });
});

describe('Import without an entitlement saves nothing before the user decides (026)', () => {
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

  it('pasted text: confirming the import only opens the purchase screen; the recipes table is unchanged', async () => {
    await press(tree, 'open-import-recipe-btn');
    await act(async () => {
      tree.root.findByProps({ testID: 'recipe-json-input' }).props.onChangeText(payload);
    });
    await utrataUprawnienia();
    const before = (await getRecipes()).length;
    await press(tree, 'confirm-import-btn');
    expect((await getRecipes()).length).toBe(before);
    expect((await getRecipes()).some((r) => r.name === 'Chleb od sąsiada')).toBe(false);
    expect(paywallShown(tree.root)).toBe(true);
    expect(alert).not.toHaveBeenCalled();
  });

  it('clipboard (JSON file content): nothing is saved and no "imported" message appears', async () => {
    await press(tree, 'import-recipe-json-btn');
    (Clipboard.getStringAsync as jest.Mock).mockResolvedValueOnce(payload);
    await press(tree, 'paste-clipboard-btn');
    await utrataUprawnienia();
    const before = (await getRecipes()).length;
    await press(tree, 'confirm-import-btn');
    expect((await getRecipes()).length).toBe(before);
    expect(paywallShown(tree.root)).toBe(true);
    expect(alert).not.toHaveBeenCalled();
  });

  it('QR code scanned after the entitlement ends: the purchase screen opens and nothing is saved', async () => {
    await press(tree, 'open-scan-qr-btn');
    await utrataUprawnienia();
    const before = (await getRecipes()).length;
    await act(async () => {
      tree.root.findByType(QrScannerModal).props.onScanRecipe(payload);
    });
    await flush();
    const confirm = tree.root.findAll((n) => n.props?.testID === 'confirm-import-btn' && typeof n.props.onPress === 'function');
    if (confirm.length > 0) {
      await act(async () => {
        await confirm[confirm.length - 1].props.onPress();
      });
      await flush();
    }
    expect((await getRecipes()).length).toBe(before);
    expect(paywallShown(tree.root)).toBe(true);
    expect(alert).not.toHaveBeenCalled();
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
