/**
 * Zakończenie wypieku to jedna transakcja: błąd w środku nie zostawia częściowego stanu
 * [M1-audytor-generalny-021; 08-programista-013].
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
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/(tabs)/stolnica';
import { initDatabase, setActiveBake, saveFlourInventoryItem } from '../data/sqlite-store';
import { useTempDbDir, control, openRaw, dbFilePath } from '../data/__tests__/helpers/node-sqlite-adapter';
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

const dbState = () => {
  const raw = openRaw(dbFilePath('piekarz.db', '/Library/SQLite'));
  const bakes = (raw.prepare('SELECT count(*) AS c FROM bakes').get() as { c: number }).c;
  const stock = (raw.prepare("SELECT stock_grams AS s FROM flour_inventory WHERE id = 'flour_user'").get() as { s: number }).s;
  raw.close();
  return { bakes, stock };
};

async function finishOnScreen(): Promise<void> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  await act(async () => {
    pressables(tree!.root, 'Studzenie na kratce')[0].props.onPress(); // ostatni etap planu (030)
  });
  await act(async () => {
    tree!.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
  });
  await act(async () => {
    await pressables(tree!.root, 'Zapisz w historii')[0].props.onPress();
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  act(() => tree!.unmount());
}

describe('Finishing a bake is atomic (021)', () => {
  beforeAll(() => {
    // Połączenie z bazą jest buforowane w module: jeden katalog na cały plik, różnice liczone względem „before”.
    useTempDbDir();
  });
  beforeEach(async () => {
    zUprawnieniem(); // dostęp z App Store (009): dawniej lokalny okres próbny
    await initDatabase();
    await saveFlourInventoryItem({ id: 'flour_user', name: 'Mąka pszenna 750', stockGrams: 2000, updatedAt: 1 });
    setActiveBake({
      id: 'bake_live',
      recipeName: 'Chleb',
      startedAt: 1,
      currentStageId: 'mix',
      ambientTempC: 22,
      actualDdtC: 25,
      calculatedRecipe: recipe,
    });
  });
  afterEach(() => {
    control().failWritesMatching = null;
    jest.restoreAllMocks();
  });

  it('a write error while deducting flour leaves no bake and the same stock', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const before = dbState();
    control().failWritesMatching = /flour_inventory/;
    await finishOnScreen();
    expect(dbState()).toEqual(before);
    expect(alert.mock.calls.map((c) => c[0])).toContain('Nie zapisano');
  });

  it('finishBake rejects with StorageWriteError and leaves the in-memory history untouched on a failed transaction', async () => {
    const { finishBake, getBakeLogs } = require('../data/sqlite-store');
    const { StorageWriteError } = require('../data/storage-status');
    const before = dbState();
    const historyBefore = (await getBakeLogs()).length;
    // Licznik wypieków w app_access usunięty (009): błąd w środku transakcji wymusza zapis mąki po wpisie wypieku.
    control().failWritesMatching = /flour_inventory/;
    await expect(
      finishBake({ id: 'bake_direct', recipeName: 'Chleb', startedAt: 1, finishedAt: 2 }, [{ name: 'Mąka pszenna 750', weightGrams: 100 }])
    ).rejects.toBeInstanceOf(StorageWriteError);
    expect(dbState()).toEqual(before);
    expect((await getBakeLogs()).length).toBe(historyBefore);
  });

  it('without errors the bake and the flour deduction are both saved', async () => {
    const before = dbState();
    await finishOnScreen();
    expect(dbState()).toEqual({ bakes: before.bakes + 1, stock: 2000 - 550 });
  });
});
