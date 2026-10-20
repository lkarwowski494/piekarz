/**
 * Po końcu okresu próbnego własne dane da się usunąć bez ekranu zakupu (DEC-48)
 * [M1-audytor-generalny-007; 03-zakres-002, 01-odkrywanie-006, 02-monetyzacja-006, 05-architekt-007, 08-programista-010].
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('../lib/confirm', () => ({
  confirmDeleteRecipe: (_name: string, onConfirm: () => void) => onConfirm(),
  confirmDeleteStarter: (_name: string, onConfirm: () => void) => onConfirm(),
  confirmResetStarter: (onConfirm: () => void) => onConfirm(),
}));
jest.mock('../lib/pdf-sheet-generator', () => ({
  exportStarterLabelAsPdf: jest.fn().mockResolvedValue('file:///mock/label.pdf'),
  printStarterLabelDirectly: jest.fn().mockResolvedValue(undefined),
}));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import CalculatorScreen from '../../app/(tabs)/receptury/index';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { FlourInventoryModal } from '../components/FlourInventoryModal';
import { PaywallModal } from '../components/PaywallModal';
// Jedyny ekran zakupu aplikacji (app/_layout.tsx) [M1-audytor-generalny-025]
import { AppAccessProvider } from '../components/AppAccessProvider';
import {
  initDatabase,
  _resetMemStore,
  saveRecipe,
  getRecipes,
  saveStarter,
  getStarters,
  getFlourInventory,
} from '../data/sqlite-store';
import * as Iap from 'expo-iap';
import { _resetStanu } from '../lib/platnosci/stan';

const mockIap = (Iap as unknown as { __mock: { reset: () => void } }).__mock;

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const paywallShown = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);

// Stan „bez uprawnienia” (009): sklep bez subskrypcji, oferty wprowadzającej ani zakupu dożywotniego;
// zastępuje dawny lokalny „trial_expired” (resetAppAccess z datą sprzed 60 dni).
describe('Deleting own data without an entitlement (007)', () => {
  beforeEach(async () => {
    _resetMemStore();
    mockIap.reset();
    _resetStanu();
    await initDatabase();
  });

  it('recipe: deletes without the purchase screen (BR-DANE-004 Usunięcie bez zakupu)', async () => {
    await saveRecipe({
      id: 'recipe_user_1',
      name: 'Moja receptura',
      formula: { flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 },
      targetDDT: 25,
      isBuiltIn: false,
      createdAt: 1,
    });
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<AppAccessProvider><CalculatorScreen /></AppAccessProvider>);
    });
    await flush();
    const selector = tree!.root.find((n) => typeof n.props?.onDeleteCustomRecipe === 'function');
    const recipe = (await getRecipes()).find((r) => r.id === 'recipe_user_1');
    await act(async () => {
      selector.props.onDeleteCustomRecipe(recipe);
    });
    await flush();
    expect(paywallShown(tree!.root)).toBe(false);
    expect((await getRecipes()).some((r) => r.id === 'recipe_user_1')).toBe(false);
    act(() => tree!.unmount());
  });

  it('starter: deletes without the purchase screen (BR-DANE-004 Usunięcie bez zakupu)', async () => {
    await saveStarter({ id: 'starter_user_2', name: 'Drugi zakwas', flourType: 'Pszenna', hydration: 100, birthDate: 1, storageState: 'FRIDGE' });
    const before = (await getStarters()).length;
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<AppAccessProvider><ZakwasScreen /></AppAccessProvider>);
    });
    await flush();
    await act(async () => {
      tree!.root.findByProps({ testID: 'edit-profile-btn' }).props.onPress();
    });
    await act(async () => {
      tree!.root.findByProps({ testID: 'delete-starter-btn' }).props.onPress();
    });
    await flush();
    expect(paywallShown(tree!.root)).toBe(false);
    expect((await getStarters()).length).toBe(before - 1);
    act(() => tree!.unmount());
  });

  it('flour: deletes without the purchase screen', async () => {
    const [first] = await getFlourInventory();
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<AppAccessProvider><FlourInventoryModal visible={true} onClose={() => {}} /></AppAccessProvider>);
    });
    await flush();
    await act(async () => {
      tree!.root.findByProps({ testID: `delete-inv-${first.id}` }).props.onPress();
    });
    await flush();
    expect(paywallShown(tree!.root)).toBe(false);
    expect((await getFlourInventory()).some((f) => f.id === first.id)).toBe(false);
    act(() => tree!.unmount());
  });
});
