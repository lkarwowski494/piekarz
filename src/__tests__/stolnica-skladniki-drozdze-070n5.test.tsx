/**
 * Karta „Składniki do odważenia” w wersji drożdżowej i w recepturze drożdżowej: bez wiersza „Zakwas 0 g”, z wierszem
 * drożdży (masa z receptury, rodzaj świeże/suche jak na karcie „Do miski”: RD-19, BR-KALK-009, BR-KALK-012)
 * [M2 D-312; 070-N5]. Dotyczy karty przy bieżącym kroku (SkladnikiKroku) i karty w arkuszu „Plan wypieku” (BakeStepsList).
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
import { calculateDoughRecipe, type DoughRecipeInput } from '../core/domain-rules';
import { formulaWersji } from '../recipes/wersje-drozdzowe';
import { MASTER_RECIPES } from '../recipes/presets';
import { BakeStepsList } from '../components/stolnica/BakeStepsList';
import { skladnikiKroku } from '../components/stolnica/SkladnikiKroku';
import { _resetRodzajDrozdzy, zapiszRodzajDrozdzy } from '../lib/rodzaj-drozdzy';
import { formatDoseWeight } from '../lib/unit-converter';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import type { SessionStep } from '../core/bake-steps';

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
const preset = (id: string) => {
  const p = MASTER_RECIPES.find((r) => r.id === id);
  if (!p) throw new Error(`brak receptury ${id}`);
  return p;
};
// Wersja drożdżowa receptury na zakwasie (D-154) i receptura drożdżowa z katalogu (bez zakwasu)
const WERSJA: DoughRecipeInput = formulaWersji(preset('graham_bread_honey').formula, 'graham_bread_honey', 'drozdze');
const DROZDZOWA: DoughRecipeInput = preset('no_knead_night').formula;
const ZAKWAS = 'Zakwas';

async function renderStolnica(formula: DoughRecipeInput): Promise<renderer.ReactTestRenderer> {
  const steps = [krok('mix', 'Mieszanie i wyrabianie', 'mix', 0), krok('bake', 'Pieczenie', 'bake', 1)];
  setActiveBake({ id: 'bake_070n5', recipeName: 'Graham', startedAt: teraz, currentStageId: 'mix', steps, calculatedRecipe: calculateDoughRecipe(formula), recipeFormula: formula });
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

describe('skladnikiKroku z recepturą: zakwas tylko z zakwasem, drożdże tylko z drożdżami (070-N5)', () => {
  const k = (category: SessionStep['category']) => ({ category });
  it('wersja drożdżowa: mieszanie bez zakwasu, z drożdżami; po autolizie drożdże i sól', () => {
    const r = calculateDoughRecipe(WERSJA);
    expect(skladnikiKroku([k('mix')], 0, r)).toEqual(['maka', 'woda', 'drozdze', 'sol']);
    expect(skladnikiKroku([k('autolyse'), k('mix')], 1, r)).toEqual(['drozdze', 'sol']);
  });
  it('receptura na zakwasie bez drożdży: bez zmian', () => {
    const r = calculateDoughRecipe(preset('graham_bread_honey').formula);
    expect(r.yeastGrams).toBe(0);
    expect(skladnikiKroku([k('mix')], 0, r)).toEqual(['maka', 'woda', 'zakwas', 'sol']);
  });
});

describe('Stolnica, karta „Składniki do odważenia” bez zakwasu i z drożdżami (070-N5)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetRodzajDrozdzy();
    await initDatabase();
    await saveBakeSession(null);
  });

  it.each([
    ['wersja drożdżowa (graham)', WERSJA],
    ['receptura drożdżowa (no_knead_night)', DROZDZOWA],
  ])('%s: bez „Zakwas 0 g”, z wierszem drożdży świeżych z masą z receptury', async (_n, formula) => {
    const r = calculateDoughRecipe(formula);
    expect(r.starterGrams).toBe(0);
    expect(r.yeastGrams).toBeGreaterThan(0);
    const tree = await renderStolnica(formula);
    const karta = textOf(tree.root.findByProps({ testID: 'skladniki-kroku' }).children);
    expect(karta).not.toContain(ZAKWAS);
    expect(karta).toContain('Drożdże świeże (prasowane)');
    expect(karta).toContain(formatDoseWeight(r.yeastGrams, 'metric'));
    act(() => tree.unmount());
  });

  it('wybór „suche” (jak na karcie „Do miski”): wiersz „Drożdże suche” z masą × 0,35 (RD-19, D-205)', async () => {
    await zapiszRodzajDrozdzy('suche');
    const r = calculateDoughRecipe(WERSJA);
    const tree = await renderStolnica(WERSJA);
    const karta = textOf(tree.root.findByProps({ testID: 'skladniki-kroku' }).children);
    expect(karta).toContain('Drożdże suche');
    expect(karta).toContain(formatDoseWeight(r.yeastGrams * 0.35, 'metric'));
    act(() => tree.unmount());
  });

  it('arkusz „Plan wypieku”: ta sama karta bez zakwasu, z drożdżami; na zakwasie bez wiersza drożdży', async () => {
    await zapiszRodzajDrozdzy('swieze'); // wybór z poprzedniego testu zostaje w bazie
    const steps = [krok('mix', 'Mieszanie i wyrabianie', 'mix', 0)];
    const r = calculateDoughRecipe(WERSJA);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<BakeStepsList steps={steps} currentStepIdx={0} onGoToStep={() => undefined} calculatedRecipe={r} unitSystem="metric" />);
    });
    const karta = textOf(tree!.root.findByProps({ testID: 'karta-skladnikow-planu' }).children);
    expect(karta).not.toContain(ZAKWAS);
    expect(karta).toContain('Drożdże świeże (prasowane)');
    expect(karta).toContain(formatDoseWeight(r.yeastGrams, 'metric'));
    const zakwasowa = calculateDoughRecipe(preset('graham_bread_honey').formula);
    await act(async () => {
      tree!.update(<BakeStepsList steps={steps} currentStepIdx={0} onGoToStep={() => undefined} calculatedRecipe={zakwasowa} unitSystem="metric" />);
    });
    const naZakwasie = textOf(tree!.root.findByProps({ testID: 'karta-skladnikow-planu' }).children);
    expect(naZakwasie).toContain(ZAKWAS);
    expect(naZakwasie).not.toContain('Drożdże');
    act(() => tree!.unmount());
  });
});
