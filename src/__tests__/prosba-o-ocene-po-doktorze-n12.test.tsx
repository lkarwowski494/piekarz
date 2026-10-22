/**
 * Reaudyt nocny N-12, wariant (c) (D-089, zmienia D-067): po zakończeniu wypieku z oceną ≤ 2★ propozycja Doktora
 * i systemowa prośba o ocenę aplikacji nie pojawiają się w tej samej chwili. Prośba czeka do zamknięcia propozycji
 * („Nie teraz”), do zamknięcia Doktora albo do następnego wejścia na „Dziś”; odstęp 14 dni i limit 3/365 bez zmian.
 * Przez ekran: Stolnica → „Zrobione” na ostatnim kroku → gwiazdki → „Zapisz” [reaudit-noc N-12].
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
import { Alert, type AlertButton } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as StoreReview from 'expo-store-review';
import StolnicaScreen from '../../app/stolnica';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import DoctorScreen from '../../app/doktor';
import { AppAccessProvider } from '../components/AppAccessProvider';
import * as store from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { KLUCZ_DAT_PROSBY } from '../lib/prosba-o-ocene-wywolanie';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const D = 86_400_000;
const TYTUL_DOKTORA = 'Sprawdzić przyczynę w Doktorze?';
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
const poZwloce = async () => {
  // prośba idzie po zwłoce 600 ms (prosba-o-ocene-wywolanie.ts)
  await act(async () => {
    await new Promise((r) => setTimeout(r, 800));
  });
};

let alert: jest.SpyInstance;
const propozycjaDoktora = (): AlertButton[] | undefined =>
  alert.mock.calls.find((c) => c[0] === TYTUL_DOKTORA)?.[2] as AlertButton[] | undefined;

/** Kończy trwający wypiek na ekranie z oceną `stars` i czeka dłużej niż zwłoka prośby. */
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
  await poZwloce();
  act(() => tree!.unmount());
}

async function wczesniejszeWypieki(n: number, teraz: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    await store.saveBakeLog({ id: `bake_old_${i}`, recipeName: 'Chleb', startedAt: teraz - (i + 2) * D, finishedAt: teraz - (i + 2) * D + 3_600_000, ratingStars: 3 });
  }
}

async function wejdzNaDzis(): Promise<void> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(
      <AppAccessProvider>
        <StartScreen />
      </AppAccessProvider>
    );
  });
  await poZwloce();
  act(() => tree!.unmount());
}

const PORY = [
  ['08:00', new Date(2027, 2, 1, 8, 0).getTime()],
  ['23:55', new Date(2027, 2, 1, 23, 55).getTime()],
] as const;

describe.each(PORY)('N-12: przy ocenie ≤ 2★ prośba o ocenę po Doktorze, nie razem z nim (zegar %s)', (_pora, teraz) => {
  beforeAll(() => {
    useTempDbDir();
  });
  beforeEach(async () => {
    zUprawnieniem();
    jest.spyOn(Date, 'now').mockImplementation(() => teraz);
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await store.initDatabase();
    await store.restoreFromBackupData({ bakes: [], starters: [], customRecipes: [] });
    await store.setAppSetting(KLUCZ_DAT_PROSBY, '[]');
    review.requestReview.mockClear();
  });
  afterEach(async () => {
    // odłożona prośba z poprzedniego testu nie przechodzi dalej
    await wejdzNaDzis();
    jest.restoreAllMocks();
  });

  it.each([1, 2])('3. wypiek na %i★: propozycja Doktora bez prośby; „Nie teraz” — jedna prośba', async (gwiazdki) => {
    await wczesniejszeWypieki(2, teraz);
    await zakonczWypiek(gwiazdki);
    expect(propozycjaDoktora()).toBeDefined();
    expect(review.requestReview).not.toHaveBeenCalled();
    await act(async () => {
      propozycjaDoktora()![0].onPress?.();
    });
    await poZwloce();
    expect(review.requestReview).toHaveBeenCalledTimes(1);
    expect(JSON.parse((await store.getAppSetting(KLUCZ_DAT_PROSBY)) ?? '[]')).toEqual([teraz]);
  });

  it('2★, „Otwórz Doktora Chleba”: prośba dopiero po zamknięciu Doktora, jedna', async () => {
    await wczesniejszeWypieki(2, teraz);
    await zakonczWypiek(2);
    let doktor: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      propozycjaDoktora()![1].onPress?.();
      doktor = renderer.create(<DoctorScreen />);
    });
    await poZwloce();
    expect(review.requestReview).not.toHaveBeenCalled();
    act(() => doktor!.unmount());
    await poZwloce();
    expect(review.requestReview).toHaveBeenCalledTimes(1);
    await wejdzNaDzis();
    expect(review.requestReview).toHaveBeenCalledTimes(1);
  });

  it('1★, propozycja bez odpowiedzi: prośba przy następnym wejściu na „Dziś”, tylko raz', async () => {
    await wczesniejszeWypieki(2, teraz);
    await zakonczWypiek(1);
    expect(review.requestReview).not.toHaveBeenCalled();
    await wejdzNaDzis();
    expect(review.requestReview).toHaveBeenCalledTimes(1);
    await wejdzNaDzis();
    expect(review.requestReview).toHaveBeenCalledTimes(1);
  });

  it('odstęp 14 dni zostaje: poprzednia prośba 13 dni temu — po „Nie teraz” bez prośby', async () => {
    await wczesniejszeWypieki(5, teraz);
    await store.setAppSetting(KLUCZ_DAT_PROSBY, JSON.stringify([teraz - 13 * D]));
    await zakonczWypiek(2);
    await act(async () => {
      propozycjaDoktora()![0].onPress?.();
    });
    await poZwloce();
    expect(review.requestReview).not.toHaveBeenCalled();
  });

  it('limit 3/365 zostaje: trzy prośby w roku — przy „Dziś” bez prośby', async () => {
    await wczesniejszeWypieki(5, teraz);
    await store.setAppSetting(KLUCZ_DAT_PROSBY, JSON.stringify([teraz - 300 * D, teraz - 200 * D, teraz - 100 * D]));
    await zakonczWypiek(1);
    await wejdzNaDzis();
    expect(review.requestReview).not.toHaveBeenCalled();
  });

  it('3★: bez propozycji Doktora, prośba od razu jak w D-067', async () => {
    await wczesniejszeWypieki(2, teraz);
    await zakonczWypiek(3);
    expect(propozycjaDoktora()).toBeUndefined();
    expect(review.requestReview).toHaveBeenCalledTimes(1);
  });
});
