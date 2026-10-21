/**
 * Usunięcie własnej receptury bez okna potwierdzenia; pasek „Usunięto recepturę” z „Przywróć” przywraca ją
 * z tymi samymi danymi (D-051 1a, design-spec §5) [M1-audytor-generalny-161; 04-studio-projektowe-506].
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

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import RecepturyLista from '../../app/(tabs)/receptury/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, saveRecipe, getRecipes } from '../data/sqlite-store';
import type { StoredRecipe } from '../data/db';
import * as Iap from 'expo-iap';
import { _resetStanu } from '../lib/platnosci/stan';
import { EN } from '../lib/i18n.en';

const mockIap = (Iap as unknown as { __mock: { reset: () => void } }).__mock;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const tekst = (n: renderer.ReactTestInstance): string =>
  n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');

const MOJA: StoredRecipe = {
  id: 'recipe_user_161',
  name: 'Moja receptura 161',
  formula: { flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 },
  targetDDT: 25,
  notes: 'notatka',
  isBuiltIn: false,
  createdAt: 12345,
};

describe('161: usunięcie receptury z „Cofnij”', () => {
  beforeEach(async () => {
    _resetMemStore();
    mockIap.reset();
    _resetStanu();
    await initDatabase();
    await saveRecipe(MOJA);
  });

  async function usun() {
    const alert = jest.spyOn(Alert, 'alert');
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<AppAccessProvider><RecepturyLista /></AppAccessProvider>);
    });
    await flush();
    const lista = tree.root.find((n) => typeof n.props?.onUsunMoja === 'function');
    await act(async () => {
      lista.props.onUsunMoja(MOJA);
    });
    await flush();
    return { tree, alert };
  }

  it('bez okna potwierdzenia; receptura znika, pasek „Usunięto recepturę” jest widoczny', async () => {
    const { tree, alert } = await usun();
    expect(alert).not.toHaveBeenCalled();
    expect((await getRecipes()).some((r) => r.id === MOJA.id)).toBe(false);
    const pasek = tree.root.findAll((n) => n.props.testID === 'undo-bar' && typeof n.type === 'string');
    expect(pasek).toHaveLength(1);
    expect(tekst(pasek[0])).toContain('Usunięto recepturę');
    alert.mockRestore();
    act(() => tree.unmount());
  });

  it('„Przywróć” przywraca recepturę z tymi samymi danymi i chowa pasek', async () => {
    const { tree, alert } = await usun();
    const przywroc = tree.root.find((n) => n.props.testID === 'undo-restore-btn' && typeof n.props.onPress === 'function');
    await act(async () => {
      przywroc.props.onPress();
    });
    await flush();
    const r = (await getRecipes()).find((x) => x.id === MOJA.id);
    expect(r).toEqual(MOJA);
    expect(tree.root.findAll((n) => n.props.testID === 'undo-bar' && typeof n.type === 'string')).toHaveLength(0);
    alert.mockRestore();
    act(() => tree.unmount());
  });

  it('EN: „Recipe deleted”', () => {
    expect(EN['Usunięto recepturę']).toBe('Recipe deleted');
  });
});
