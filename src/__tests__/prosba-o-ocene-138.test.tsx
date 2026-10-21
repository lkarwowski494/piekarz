/**
 * Prośba o ocenę aplikacji po 3. ukończonym wypieku, bez warunku oceny bochenka, z odstępem między prośbami
 * (DEC-20 a; uchyla próg 4★ z D-042) [M1-audytor-generalny-138; 11-wzrost-501, 11-wzrost-502].
 * Przez ekran: Stolnica → „Zrobione” na ostatnim kroku → gwiazdki → „Zapisz”; zegar ustawiony w kilku porach doby.
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
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(async () => true),
  hasAction: jest.fn(async () => true),
  requestReview: jest.fn(async () => undefined),
}));

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as StoreReview from 'expo-store-review';
import StolnicaScreen from '../../app/stolnica';
import * as store from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { KLUCZ_DAT_PROSBY } from '../lib/prosba-o-ocene-wywolanie';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const D = 86_400_000;
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const pressables = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label));
const review = StoreReview as jest.Mocked<typeof StoreReview>;

/** Kończy trwający wypiek na ekranie i zapisuje go z oceną `stars`; czeka na zamknięcie okna zapisu. */
async function zakonczWypiek(stars: number): Promise<void> {
  store.setActiveBake({ id: `bake_live_${stars}`, recipeName: 'Chleb', startedAt: 1, currentStageId: 'mix', ambientTempC: 22, actualDdtC: 25 });
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  await act(async () => {
    pressables(tree!.root, 'Plan wypieku')[0].props.onPress();
  });
  await act(async () => {
    pressables(tree!.root, 'Studzenie na kratce')[0].props.onPress();
  });
  await act(async () => {
    tree!.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
  });
  await act(async () => {
    tree!.root.findByProps({ testID: `finish-rating-star-${stars}` }).props.onPress();
  });
  await act(async () => {
    await pressables(tree!.root, 'Zapisz')[0].props.onPress();
  });
  // Prośba idzie po zamknięciu okna zapisu (zwłoka 600 ms w prosba-o-ocene-wywolanie.ts)
  await act(async () => {
    await new Promise((r) => setTimeout(r, 800));
  });
  act(() => tree!.unmount());
}

async function wczesniejszeWypieki(n: number, teraz: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    await store.saveBakeLog({ id: `bake_old_${i}`, recipeName: 'Chleb', startedAt: teraz - (i + 2) * D, finishedAt: teraz - (i + 2) * D + 3_600_000, ratingStars: 3 });
  }
}

const PORY = [
  ['08:00', new Date(2027, 2, 1, 8, 0).getTime()],
  ['14:00', new Date(2027, 2, 1, 14, 0).getTime()],
  ['23:55', new Date(2027, 2, 1, 23, 55).getTime()],
] as const;

describe.each(PORY)('Prośba o ocenę po 3. wypieku, zegar %s (138; BR-OPIN-001)', (_pora, teraz) => {
  beforeAll(() => {
    useTempDbDir();
  });
  beforeEach(async () => {
    zUprawnieniem();
    jest.spyOn(Date, 'now').mockImplementation(() => teraz);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await store.initDatabase();
    await store.restoreFromBackupData({ bakes: [], starters: [], customRecipes: [] });
    await store.setAppSetting(KLUCZ_DAT_PROSBY, '[]');
    review.requestReview.mockClear();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([1, 2, 3, 5])('3. ukończony wypiek oceniony na %i★: jedna systemowa prośba (warunek nie czyta oceny)', async (gwiazdki) => {
    await wczesniejszeWypieki(2, teraz);
    await zakonczWypiek(gwiazdki);
    expect(review.requestReview).toHaveBeenCalledTimes(1);
    expect(JSON.parse((await store.getAppSetting(KLUCZ_DAT_PROSBY)) ?? '[]')).toEqual([teraz]);
  });

  it('2. ukończony wypiek, nawet na 5★: bez prośby', async () => {
    await wczesniejszeWypieki(1, teraz);
    await zakonczWypiek(5);
    expect(review.requestReview).not.toHaveBeenCalled();
  });

  it('odstęp: poprzednia prośba 13 dni temu — bez prośby; 14 dni temu — prośba', async () => {
    await wczesniejszeWypieki(5, teraz);
    await store.setAppSetting(KLUCZ_DAT_PROSBY, JSON.stringify([teraz - 13 * D]));
    await zakonczWypiek(4);
    expect(review.requestReview).not.toHaveBeenCalled();
    await store.setAppSetting(KLUCZ_DAT_PROSBY, JSON.stringify([teraz - 14 * D]));
    await zakonczWypiek(4);
    expect(review.requestReview).toHaveBeenCalledTimes(1);
  });
});
