/**
 * M3 P1-1, obrona w danych: dwie instancje Stolnicy tego samego wypieku (dawniej: dotknięcie powiadomienia przy
 * otwartej Stolnicy, router.push) na prawdziwym SQLite (node:sqlite). Koniec wypieku w obu nie daje drugiego wpisu
 * w Dzienniku ani drugiego odliczenia mąki, a zapis kroku w instancji, która nie wie o końcu, nie przywraca wypieku
 * jako trwającego. Nawigacja (jedna instancja): tests/stolnica-jedna-instancja-p1.test.tsx.
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
import { initDatabase, setActiveBake, saveFlourInventoryItem, _resetMemStore } from '../data/sqlite-store';
import { useTempDbDir, openRaw, dbFilePath } from '../data/__tests__/helpers/node-sqlite-adapter';
import type { DoughRecipeResult } from '../core/domain-rules';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

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
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
};

const recipe: DoughRecipeResult = {
  targetDoughWeightGrams: 1000,
  baseFlourWeightGrams: 550,
  flours: [{ name: 'Mąka pszenna 750', percentage: 100, weightGrams: 550 }],
  waterGrams: 330,
  saltGrams: 11,
  starterGrams: 110,
  starterFlourGrams: 55,
  starterWaterGrams: 55,
  yeastGrams: 0,
  totalFlourGrams: 605,
  totalWaterGrams: 385,
  overallHydrationPercent: 63.6,
  sumCheckGrams: 1000,
  isHighRye: false,
};

/** Stan bazy z osobnego połączenia: wpisy Dziennika, zapas mąki, trwające sesje (krok). */
const baza = () => {
  const raw = openRaw(dbFilePath('piekarz.db', '/Library/SQLite'));
  const bakes = Number((raw.prepare('SELECT count(*) AS c FROM bakes').get() as { c: number }).c) - wpisyPrzed;
  const stock = Number((raw.prepare("SELECT stock_grams AS s FROM flour_inventory WHERE id = 'flour_user'").get() as { s: number }).s);
  const sesje = (raw.prepare("SELECT session_json AS j FROM bake_sessions WHERE status = 'active'").all() as Array<{ j: string }>).map(
    (w) => (JSON.parse(w.j) as { stepIdx: number }).stepIdx
  );
  raw.close();
  return { bakes, stock, sesje };
};

async function zamontuj(): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await flush();
  return tree;
}
// Zmiana przy przeniesieniu na redesign (D3a-fix): instancja, której zapis kroku odrzuciła baza (wypiek już nie trwa
// albo ma nowszy stan), czyta wypieki od nowa i schodzi z prowadzenia, więc jej kolejnych przycisków może już nie być;
// „brak przycisku” znaczy wtedy, że druga instancja niczego nie zapisała. Asercje stanu bazy bez zmian.
const nacisnij = async (n: renderer.ReactTestInstance | undefined, async = false): Promise<void> => {
  if (!n) return;
  await act(async () => {
    if (async) await n.props.onPress();
    else n.props.onPress();
  });
  await flush();
};
async function zrobione(tree: renderer.ReactTestRenderer): Promise<void> {
  await nacisnij(tree.root.findAllByProps({ testID: 'next-or-finish-step-btn' })[0]);
}
/** Ostatni krok z „Plan wypieku”, „Zrobione”, „Zapisz” w arkuszu oceny. */
async function zakoncz(tree: renderer.ReactTestRenderer): Promise<void> {
  await nacisnij(pressables(tree.root, 'Plan wypieku')[0]);
  await nacisnij(pressables(tree.root, 'Studzenie na kratce')[0]);
  await zrobione(tree);
  await nacisnij(pressables(tree.root, 'Zapisz')[0], true);
}

// Połączenie z bazą jest buforowane w module: jeden katalog na plik, wpisy liczone względem stanu przed testem
let wpisyPrzed = 0;

describe('M3 P1-1: dwie instancje Stolnicy jednego wypieku', () => {
  let now = new Date(2026, 9, 22, 9, 0).getTime();
  beforeAll(() => useTempDbDir());
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await initDatabase();
    await saveFlourInventoryItem({ id: 'flour_user', name: 'Mąka pszenna 750', stockGrams: 2000, updatedAt: 1 });
    wpisyPrzed = 0;
    wpisyPrzed = baza().bakes;
    now += 3_600_000;
    setActiveBake({ id: `bake_${now}`, recipeName: 'Chleb', startedAt: now, currentStageId: 'mix', ambientTempC: 22, actualDdtC: 25, calculatedRecipe: recipe });
  });
  afterEach(() => jest.restoreAllMocks());

  it('koniec wypieku w obu instancjach: jeden wpis w Dzienniku, mąka odliczona raz', async () => {
    const dolna = await zamontuj();
    const gorna = await zamontuj();
    now += 60_000;
    await zakoncz(gorna);
    expect(baza()).toEqual({ bakes: 1, stock: 2000 - 550, sesje: [] });
    now += 60_000;
    await zakoncz(dolna);
    expect(baza()).toEqual({ bakes: 1, stock: 2000 - 550, sesje: [] });
    act(() => gorna.unmount());
    act(() => dolna.unmount());
  });

  it('po końcu w górnej instancji „Zrobione” w dolnej nie przywraca wypieku jako trwającego', async () => {
    const dolna = await zamontuj();
    const gorna = await zamontuj();
    now += 60_000;
    await zakoncz(gorna);
    now += 60_000;
    await zrobione(dolna);
    expect(baza().sesje).toEqual([]);
    act(() => gorna.unmount());
    act(() => dolna.unmount());
  });
});
