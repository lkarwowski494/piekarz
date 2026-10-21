/**
 * Dwa usunięcia receptur w ciągu kilku sekund: „Przywróć” nie może zgubić pierwszej [reaudit-noc N-1; M1-audytor-generalny-161].
 * Prawdziwy SQLite (node:sqlite). Kolejka usuniętych: „Przywróć” oddaje ostatnio usuniętą, pasek zostaje dla poprzedniej
 * z nowym czasem; każde usunięcie liczy czas paska od nowa (PASEK_COFNIJ_MS).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
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
import renderer, { act } from 'react-test-renderer';
import RecepturyLista from '../../app/(tabs)/receptury/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, saveRecipe, getRecipes } from '../data/sqlite-store';
import type { StoredRecipe } from '../data/db';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { PASEK_COFNIJ_MS } from '../components/PasekCofnij';
import { bezUprawnienia } from '../../tests/helpers/platnosci';

const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await new Promise((r) => setImmediate(r));
  });
};

const receptura = (id: string, name: string): StoredRecipe => ({
  id,
  name,
  formula: { flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, starterHydration: 100, targetDoughWeightGrams: 1000 },
  targetDDT: 25,
  notes: `notatka ${name}`,
  isBuiltIn: false,
  createdAt: 1000,
});
const A = receptura('r_a', 'Receptura A');
const B = receptura('r_b', 'Receptura B');

describe('N-1: dwa usunięcia receptur w ciągu 6 s (SQLite)', () => {
  let tree: renderer.ReactTestRenderer;

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask'] });
    useTempDbDir();
    _resetMemStore();
    bezUprawnienia();
    await initDatabase();
    await saveRecipe(A);
    await saveRecipe(B);
    await act(async () => {
      tree = renderer.create(<AppAccessProvider><RecepturyLista /></AppAccessProvider>);
    });
    await settle();
  });
  afterEach(() => {
    act(() => tree.unmount());
    jest.useRealTimers();
  });

  const pasek = () => tree.root.findAll((n) => n.props.testID === 'undo-bar' && typeof n.type === 'string');
  const usun = async (r: StoredRecipe) => {
    const lista = tree.root.find((n) => typeof n.props?.onUsunMoja === 'function');
    await act(async () => {
      lista.props.onUsunMoja(r);
    });
    await settle();
  };
  const przywroc = async () => {
    const btn = tree.root.find((n) => n.props.testID === 'undo-restore-btn' && typeof n.props.onPress === 'function');
    await act(async () => {
      btn.props.onPress();
    });
    await settle();
  };
  const ids = async () => (await getRecipes()).filter((r) => !r.isBuiltIn).map((r) => r.id).sort();

  it('usuń A, usuń B, „Przywróć” dwa razy → obie receptury wracają z tymi samymi danymi', async () => {
    await usun(A);
    await usun(B);
    expect(await ids()).toEqual([]);
    await przywroc();
    expect(await ids()).toEqual(['r_b']);
    expect(pasek()).toHaveLength(1);
    await przywroc();
    expect(await ids()).toEqual(['r_a', 'r_b']);
    const zapisane = await getRecipes();
    expect(zapisane.find((r) => r.id === 'r_a')).toEqual(A);
    expect(pasek()).toHaveLength(0);
  });

  it('pasek drugiego usunięcia liczy czas od nowa', async () => {
    await usun(A);
    act(() => {
      jest.advanceTimersByTime(PASEK_COFNIJ_MS - 1000);
    });
    await usun(B);
    act(() => {
      jest.advanceTimersByTime(PASEK_COFNIJ_MS - 1000);
    });
    expect(pasek()).toHaveLength(1);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(pasek()).toHaveLength(0);
  });
});
