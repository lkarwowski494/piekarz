/**
 * Audyt niezależny D-7 (wariant b): plan żytni nie ma garowania w lodówce — rozrost w formie odbywa się w cieple
 * i kończy go stan ciasta, nie zegar (ZYT-ETA-005) — więc przełącznik „Czas w lodówce” nie może zmieniać rozrostu
 * w formie. Dla receptury żytniej plan nie pokazuje przełącznika; dla pszennej zostaje [audyt-niezalezny D-7].
 * Wariant ★(a) (czasy żyta z receptury) czeka na źródło czasów domowego chleba żytniego (ZYT-ETA-900 otwarte).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { calculateDoughRecipe } from '../core/domain-rules';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const teksty = (t: renderer.ReactTestRenderer) =>
  t.root.findAll((n) => (n.type as unknown) === 'Text').map((n) => textOf(n.props.children)).join(' | ');

async function plan(zytnia: boolean): Promise<renderer.ReactTestRenderer> {
  const formula = {
    flours: [{ name: zytnia ? 'Mąka żytnia typ 2000' : 'Mąka pszenna typ 750', percentage: 100, type: zytnia ? 'zytnia_2000' : 'pszenna_750' }],
    waterPercentage: 78, saltPercentage: 1.8, starterPercentage: 30, starterHydration: 100, targetDoughWeightGrams: 1000,
  };
  ustawRecepturePlanu({ recipeName: zytnia ? 'Żytni' : 'Pszenny', calculatedRecipe: calculateDoughRecipe(formula), recipeFormula: formula });
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => { tree = renderer.create(<HarmonogramScreen />); });
  await act(async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); });
  return tree!;
}

describe('D-7: plan żytni bez przełącznika lodówki', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    await initDatabase();
  });
  afterEach(() => ustawRecepturePlanu(null));

  it('rye recipe: no "Time in the fridge" chips; rozrost w formie is on the plan', async () => {
    const t = await plan(true);
    const txt = teksty(t);
    expect(txt).toContain('Rozrost w formie');
    expect(txt).not.toContain('Czas w lodówce:');
    expect(txt).not.toContain('Elastyczny bufor regulujący porę formowania i pieczenia');
    act(() => t.unmount());
  });

  it('wheat recipe: the fridge chips stay', async () => {
    const t = await plan(false);
    expect(teksty(t)).toContain('Czas w lodówce:');
    act(() => t.unmount());
  });
});
