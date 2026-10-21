/**
 * Składniki przy bieżącym kroku, nie tylko w arkuszu „Plan wypieku” [M1-audytor-generalny-130; 01-odkrywanie-501].
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { saveBakeSession } from '../data/bake-session-store';
import { calculateDoughRecipe } from '../core/domain-rules';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import type { SessionStep } from '../core/bake-steps';
import { skladnikiKroku } from '../components/stolnica/SkladnikiKroku';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  return '';
};

const teraz = Date.now();
const krok = (id: string, name: string, category: SessionStep['category'], od: number): SessionStep => ({
  id, name, category, durationMin: 30, isPassive: false, instructions: '', plannedStart: teraz + od * 1_800_000, plannedEnd: teraz + (od + 1) * 1_800_000,
});
const formula = { flours: [{ name: 'Mąka pszenna 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 };
const przepis = calculateDoughRecipe(formula);

async function render(steps: SessionStep[]): Promise<renderer.ReactTestRenderer> {
  setActiveBake({ id: `bake_${steps[0].id}`, recipeName: 'Wiejski', startedAt: teraz, currentStageId: steps[0].id, steps, calculatedRecipe: przepis, recipeFormula: formula });
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

describe('skladnikiKroku (czysta funkcja)', () => {
  it('autoliza, mieszanie po autolizie i bez niej, inne kroki, indeks poza listą', () => {
    const k = (category: SessionStep['category']) => ({ category });
    expect(skladnikiKroku([k('autolyse'), k('mix')], 0)).toEqual(['maka', 'woda']);
    expect(skladnikiKroku([k('autolyse'), k('mix')], 1)).toEqual(['zakwas', 'sol']);
    expect(skladnikiKroku([k('starter_feed'), k('mix')], 1)).toEqual(['maka', 'woda', 'zakwas', 'sol']);
    expect(skladnikiKroku([k('bake')], 0)).toEqual([]);
    expect(skladnikiKroku([], 3)).toEqual([]);
  });
});

describe('Składniki przy bieżącym kroku (130)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    await initDatabase();
    await saveBakeSession(null);
  });

  it('krok mieszania bez autolizy: mąka, woda, zakwas i sól przy kroku (BR-ETAP-001 Bieżący krok)', async () => {
    const tree = await render([krok('mix', 'Wymieszanie z solą i zakwasem', 'mix', 0), krok('bake', 'Wypiek', 'bake', 1)]);
    const strefa = textOf(tree.root.findByProps({ testID: 'skladniki-kroku' }).children);
    expect(strefa).toContain('Składniki do odważenia');
    for (const s of ['Mąki', 'Woda', 'Zakwas', 'Sól']) expect(strefa).toContain(s);
    expect(strefa).toContain(`${Math.round(przepis.waterGrams)}`);
    act(() => tree.unmount());
  });

  it('autoliza: mąka i woda; mieszanie po autolizie: zakwas i sól; krok bez składników: nic', async () => {
    const tree = await render([krok('autolyse', 'Autoliza', 'autolyse', 0), krok('mix', 'Wymieszanie z solą i zakwasem', 'mix', 1), krok('bulk_ferment', 'Fermentacja', 'bulk_ferment', 2)]);
    let strefa = textOf(tree.root.findByProps({ testID: 'skladniki-kroku' }).children);
    expect(strefa).toContain('Mąki');
    expect(strefa).not.toContain('Sól');
    await act(async () => {
      tree.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
    });
    strefa = textOf(tree.root.findByProps({ testID: 'skladniki-kroku' }).children);
    expect(strefa).toContain('Sól');
    expect(strefa).not.toContain('Mąki');
    await act(async () => {
      tree.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
    });
    expect(tree.root.findAllByProps({ testID: 'skladniki-kroku' })).toHaveLength(0);
    act(() => tree.unmount());
  });
});
