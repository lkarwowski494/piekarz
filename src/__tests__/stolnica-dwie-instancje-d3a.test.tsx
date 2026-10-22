/**
 * D3a-fix, P1-1 (obrona w danych): dwie instancje Stolnicy tego samego wypieku (np. dotknięcie powiadomienia na otwartej
 * Stolnicy kładzie drugą na stos). Dolna instancja ze starym stanem nie cofa kroku zapisanego przez górną, a po końcu
 * wypieku u góry jej „Zapisz” nie robi drugiego wpisu w Dzienniku ani drugiego odliczenia mąki [M3 D3a-fix].
 * Nawigacja (jedna Stolnica w stosie) to osobna poprawka (cherry-pick z m3/p1-stolnica-master).
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
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake, _resetMemStore, getBakeLogs, getFlourInventory, saveFlourInventoryItem } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps } from '../core/bake-steps';
import { saveBakeSession, loadBakeSession, type BakeSession } from '../data/bake-session-store';
import { setLang, t } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import type { DoughRecipeResult } from '../core/domain-rules';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const pressables = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label));
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
async function render(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await flush();
  return tree!;
}
const zrobione = async (tree: renderer.ReactTestRenderer) => {
  await act(async () => {
    tree.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
  });
  await flush();
};

const recipe: DoughRecipeResult = {
  targetDoughWeightGrams: 1000, baseFlourWeightGrams: 550, flours: [{ name: 'Mąka pszenna 750', percentage: 100, weightGrams: 550 }],
  waterGrams: 330, saltGrams: 11, starterGrams: 110, starterFlourGrams: 55, starterWaterGrams: 55, yeastGrams: 0,
  totalFlourGrams: 605, totalWaterGrams: 385, overallHydrationPercent: 63.6, sumCheckGrams: 1000, isHighRye: false,
};

describe('D3a-fix P1-1: dwie instancje Stolnicy jednego wypieku', () => {
  const now = 1_800_000_000_000;
  const kroki = planBakeSteps({ startAt: now - 3_600_000, isHighRye: false });
  const sesja = (stepIdx: number): BakeSession => ({
    version: 2, steps: kroki, stepIdx, dutchOvenPhase: 'lid_on', timerEndsAt: now + 20 * 60_000, pausedLeftSec: null,
    recipeName: 'Chleb', startedAt: now - 3_600_000,
    bake: { id: 'bake_jeden', recipeName: 'Chleb', startedAt: now - 3_600_000, currentStageId: kroki[stepIdx].id, zaczetyZDostepem: true, calculatedRecipe: recipe },
  });

  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => jest.restoreAllMocks());

  it('„Zrobione” na dolnej (starej) instancji po postępie na górnej nie cofa kroku; dolna wraca do stanu z bazy', async () => {
    await saveBakeSession(sesja(0));
    const dol = await render();
    const gora = await render();
    await zrobione(gora);
    await zrobione(gora);
    expect((await loadBakeSession())?.stepIdx).toBe(2);
    // „Wstecz” na dolną instancję i „Zrobione” ze starego kroku 0
    await zrobione(dol);
    expect((await loadBakeSession())?.stepIdx).toBe(2);
    expect(textOf(dol.toJSON())).toContain(t(kroki[2].name));
    act(() => gora.unmount());
    act(() => dol.unmount());
  });

  it('licznik odrzuceń zeruje się po udanym zapisie: dwa odległe odrzucenia (każde po zmianie z innej instancji) nie wyrzucają na Dziś', async () => {
    const { saveActiveBakeSession } = require('../data/bake-sessions-store') as typeof import('../data/bake-sessions-store');
    const mockReplace = jest.fn();
    jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({ push: jest.fn(), navigate: jest.fn(), replace: mockReplace, back: jest.fn() });
    await saveBakeSession(sesja(0));
    const tree = await render();
    const zInnejInstancji = async () => {
      const teraz = await loadBakeSession();
      if (teraz) await saveActiveBakeSession(teraz); // inna instancja zapisała ten sam wypiek (nowsza wersja wiersza)
    };
    await zInnejInstancji();
    await zrobione(tree); // odrzucone (nieaktualny) → odczyt od nowa
    await zrobione(tree); // udany zapis: krok 1
    expect((await loadBakeSession())?.stepIdx).toBe(1);
    await zInnejInstancji();
    await zrobione(tree); // drugie odrzucenie, ale nie z rzędu
    expect(mockReplace).not.toHaveBeenCalledWith('/');
    expect(textOf(tree.toJSON())).toContain(t(kroki[1].name));
    await zrobione(tree);
    expect((await loadBakeSession())?.stepIdx).toBe(2);
    act(() => tree.unmount());
  });

  it('koniec na górnej, potem „Zapisz” na dolnej: jeden wpis w Dzienniku i jedno odliczenie mąki', async () => {
    await saveFlourInventoryItem({ id: 'flour_2i', name: 'Mąka pszenna 750', stockGrams: 2000, updatedAt: 1 });
    await saveBakeSession(sesja(kroki.length - 1));
    const wpisyPrzed = (await getBakeLogs()).length;
    const dol = await render();
    const gora = await render();
    for (const tree of [gora, dol]) {
      await zrobione(tree); // ostatni krok: arkusz oceny
      await act(async () => {
        await pressables(tree.root, 'Zapisz')[0].props.onPress();
      });
      await flush();
    }
    expect((await getBakeLogs()).length).toBe(wpisyPrzed + 1);
    expect((await getFlourInventory()).find((f) => f.id === 'flour_2i')?.stockGrams).toBe(2000 - 550);
    expect((Alert.alert as jest.Mock).mock.calls.map((c) => c[0])).toContain('Ten wypiek jest już zakończony albo przerwany.');
    expect(await loadBakeSession()).toBeNull();
    act(() => gora.unmount());
    act(() => dol.unmount());
  });
});
