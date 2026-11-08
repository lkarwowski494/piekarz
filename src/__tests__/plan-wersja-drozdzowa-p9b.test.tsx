/**
 * D-155, D-242 Z2/Z3: plan wersji drożdżowej → „Zacznij wypiek” → Stolnica → wpis Dziennika. Wersja trafia do sesji
 * (`wersja`) i do bakes.leaven; plan drożdżowy nie dokarmia zakwasu i nie wiąże wypieku z zakwasem [M3 p9b].
 */
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
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, getActiveBake, setActiveBake, getBakeLogs } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { calculateDoughRecipe } from '../core/domain-rules';
import { formulaWersji } from '../recipes/wersje-drozdzowe';
import { MASTER_RECIPES } from '../recipes/presets';
import { saveStarter } from '../data/sqlite-store';
import { isStageCategory } from '../core/bake-steps';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

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
async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!;
}
async function pressId(tree: renderer.ReactTestRenderer, testID: string): Promise<void> {
  const all = tree.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
  expect(all.length).toBeGreaterThan(0);
  await act(async () => {
    await all[all.length - 1].props.onPress();
  });
  await flush();
}
async function pressText(tree: renderer.ReactTestRenderer, label: string): Promise<void> {
  const all = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children) === label);
  expect(all.length).toBeGreaterThan(0);
  await act(async () => {
    await all[all.length - 1].props.onPress();
  });
  await flush();
}

/** Stolnica od pierwszego kroku do zapisu oceny. */
async function dokonczWypiek(): Promise<void> {
  const tree = await render(<StolnicaScreen />);
  for (let i = 0; i < 40 && !textOf(tree.toJSON()).includes('Oceń bochenek'); i++) await pressId(tree, 'next-or-finish-step-btn');
  await pressText(tree, 'Zapisz');
  act(() => tree.unmount());
}


const START = new Date(2026, 10, 4, 8, 0).getTime();
const planZ = (id: string, wersja: 'zakwas' | 'drozdze') => {
  const p = MASTER_RECIPES.find((r) => r.id === id)!;
  const recipeFormula = formulaWersji(p.formula, id, wersja);
  ustawRecepturePlanu({ recipeName: p.namePl, recipeId: id, wersja, calculatedRecipe: calculateDoughRecipe(recipeFormula), recipeFormula });
};

describe('D-155 plan i prowadzenie wersji drożdżowej', () => {
  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => START);
    _resetMemStore();
    setActiveBake(null);
    await saveBakeSession(null);
    await initDatabase();
    zUprawnieniem();
    // Zakwas w aplikacji: plan drożdżowy i tak go nie używa
    await saveStarter({ id: 'z1', name: 'Zenek', flourType: 'zytnia_2000', hydration: 100, birthDate: START - 86_400_000 * 30, storageState: 'FRIDGE' });
  });
  afterEach(() => {
    jest.restoreAllMocks();
    ustawRecepturePlanu(null);
  });

  it.each([
    ['graham_bread_honey', ['yeast_mix', 'yeast_rise', 'yeast_degas', 'yeast_bench', 'yeast_shape', 'yeast_proof', 'yeast_bake', 'yeast_cool']],
    ['rye_100_pan', ['yeast_mix', 'yeast_rise', 'yeast_shape', 'yeast_proof', 'yeast_bake', 'yeast_cool']],
  ])('%s na drożdżach: start z krokami wersji, wersja w sesji, bez zakwasu; wpis z leaven = yeast', async (id, idKrokow) => {
    planZ(id, 'drozdze');
    const plan = await render(<HarmonogramScreen />);
    expect(plan.root.findAll((n) => n.props?.testID === 'plan-start-bake-btn' && typeof n.type === 'string')[0].props.accessibilityState).toEqual({ disabled: false });
    await pressId(plan, 'plan-start-bake-btn');
    act(() => plan.unmount());
    const s = getActiveBake()!;
    const kroki = s.steps ?? [];
    expect(s.wersja).toBe('drozdze');
    expect(s.isHighRye).toBe(false);
    expect(s.starterId).toBeUndefined();
    expect(s.recipeId).toBe(id);
    expect(kroki.map((k) => k.id)).toEqual(idKrokow);
    expect(kroki.every((k) => isStageCategory(k.category))).toBe(true);
    expect(s.recipeFormula).toMatchObject({ starterPercentage: 0 });
    await dokonczWypiek();
    const [wpis] = await getBakeLogs();
    expect(wpis.leaven).toBe('yeast');
    expect(wpis.recipeId).toBe(id);
  });

  it('ta sama receptura na zakwasie: plan zakwasowy (żytni), wersja zakwas, leaven = sourdough', async () => {
    planZ('rye_100_pan', 'zakwas');
    const plan = await render(<HarmonogramScreen />);
    await pressId(plan, 'plan-start-bake-btn');
    act(() => plan.unmount());
    const s = getActiveBake()!;
    const kroki = s.steps ?? [];
    expect(s.wersja).toBe('zakwas');
    expect(kroki.some((k) => k.id.startsWith('yeast_'))).toBe(false);
    expect(kroki[0]?.id).toBe('fridge_wake_feed');
    await dokonczWypiek();
    const [wpis] = await getBakeLogs();
    expect(wpis.leaven).toBe('sourdough');
  });
});
