/**
 * W trybie EN główny przepływ (Stolnica z aktywnym wypiekiem, Harmonogram ze Sleep Guard, Zakwas)
 * nie pokazuje tekstów po polsku [M1-audytor-generalny-047; 09-lokalizacja-001].
 * Kryterium: w widocznym tekście brak polskich liter /[ąćęłńóśźż]/i poza jawną listą niżej.
 */
jest.mock('expo-sqlite', () => require('../src/data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('expo-router', () => ({
  // Prowadzenie ustawia przycisk „Plan wypieku” w pasku nawigacji (Stack.Screen, 056): przycisk w drzewie ekranu
  Stack: { Screen: ({ options }: { options?: { headerRight?: () => React.ReactElement } }) => (options?.headerRight ? options.headerRight() : null) },
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn() }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
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
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../app/stolnica';
import HarmonogramScreen from '../app/(tabs)/receptury/harmonogram';
import ZakwasScreen from '../app/(tabs)/zakwasy/index';
import { initDatabase, setActiveBake, getStarters, saveStarter, _resetMemStore } from '../src/data/sqlite-store';
import { saveBakeSession } from '../src/data/bake-session-store';
import { useTempDbDir } from '../src/data/__tests__/helpers/node-sqlite-adapter';
import { setLang, t } from '../src/lib/i18n';
import { calculateReverseSchedule, SLEEP_COLLISION_TEMPLATE_PL, sleepCollisionParams } from '../src/scheduler/reverse-scheduler';
import { zUprawnieniem } from './helpers/platnosci';

jest.setTimeout(30000);

/**
 * Dozwolone słowa z polskimi literami w trybie EN (nazwy własne). Dane użytkownika z bazy (nazwa zakwasu, mąka)
 * test ustawia sam, bo ich nie tłumaczymy; polska baza startowa to osobne znalezisko w wyniku 047.
 */
const DOZWOLONE: string[] = [];
const POLSKIE = /[ąćęłńóśźż]/i;

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join(' ');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};

const polishWords = (text: string): string[] =>
  [...new Set(text.split(/[\s,.;:!?()„”"'«»/–—-]+/).filter((w) => POLSKIE.test(w) && !DOZWOLONE.includes(w)))];

async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

const recipe = {
  targetDoughWeightGrams: 1000,
  baseFlourWeightGrams: 520,
  flours: [{ name: 'Mąka pszenna 750', percentage: 100, weightGrams: 520 }],
  waterGrams: 390,
  saltGrams: 10,
  starterGrams: 80,
  starterFlourGrams: 40,
  starterWaterGrams: 40,
  yeastGrams: 0,
  totalFlourGrams: 560,
  totalWaterGrams: 430,
  overallHydrationPercent: 76.8,
  sumCheckGrams: 1000,
  isHighRye: false,
};

describe('EN: główny przepływ bez polskich tekstów (047)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    await initDatabase();
    await saveBakeSession(null);
    setLang('en');
  });
  afterEach(() => {
    setLang('pl');
    jest.restoreAllMocks();
  });

  it('Stolnica bez aktywnego wypieku', async () => {
    const tree = await render(<StolnicaScreen />);
    expect(polishWords(textOf(tree.toJSON()))).toEqual([]);
    act(() => tree.unmount());
  });

  it('Stolnica z aktywnym wypiekiem (receptura z Kalkulatora)', async () => {
    setActiveBake({
      id: 'bake_en',
      recipeName: 'Wheat 75%',
      startedAt: Date.now(),
      currentStageId: 'step_1',
      ambientTempC: 22,
      calculatedRecipe: recipe,
    });
    const tree = await render(<StolnicaScreen />);
    const text = textOf(tree.toJSON());
    expect(polishWords(text)).toEqual([]);
    expect(text).toMatch(/Step\s+1\s+of\s+11/);
    act(() => tree.unmount());
  });

  it('Harmonogram z kolizją Sleep Guard', async () => {
    const tree = await render(<HarmonogramScreen />);
    // Przesunięcie godziny gotowości tak, by aktywny etap wypadł w nocy (Sleep Guard)
    const minus = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes('-30'))[0];
    const collision = t('Uwaga: Kolizja ze snem!');
    for (let i = 0; i < 48 && !textOf(tree.toJSON()).includes(collision); i++) {
      await act(async () => {
        minus.props.onPress();
      });
    }
    const text = textOf(tree.toJSON());
    expect(polishWords(text)).toEqual([]);
    expect(text).toContain(collision);
    act(() => tree.unmount());
  });

  it('Zakwas z oknem szczytu (zakwas w temperaturze pokojowej)', async () => {
    const [first] = await getStarters();
    await saveStarter({
      ...first,
      name: 'Rye starter',
      flourType: 'Whole rye flour 2000',
      storageState: 'ROOM_TEMP',
      lastFedAt: Date.now() - 2 * 3600 * 1000,
    });
    const tree = await render(<ZakwasScreen />);
    const text = textOf(tree.toJSON());
    expect(tree.root.findAll((n) => n.props?.testID === 'peak-prediction-box').length).toBeGreaterThan(0);
    expect(polishWords(text)).toEqual([]);
    act(() => tree.unmount());
  });
});

describe('Sleep Guard: komunikat w logice jako szablon + parametry (047)', () => {
  afterEach(() => setLang('pl'));

  it('kolizja ma nazwę etapu i godzinę; PL bez zmian, EN z tłumaczoną nazwą etapu', () => {
    const target = new Date(2026, 9, 20, 7, 0, 0, 0);
    const schedule = calculateReverseSchedule(target, { ambientTemperatureC: 23, coldRetardHours: 14 });
    expect(schedule.hasSleepCollision).toBe(true);
    expect(schedule.sleepCollisions.length).toBeGreaterThan(0);
    const [first] = schedule.sleepCollisions;
    expect(sleepCollisionParams(first)).toEqual({ etap: first.stageNamePl, godzina: first.time });
    setLang('pl');
    expect(schedule.collisionDetailsPl?.split('; ')[0]).toBe(t(SLEEP_COLLISION_TEMPLATE_PL, sleepCollisionParams(first)));
    expect(schedule.collisionDetailsPl).toContain(`Etap "${first.stageNamePl}" wypada w nocy o ${first.time}`);
    setLang('en');
    const en = t(SLEEP_COLLISION_TEMPLATE_PL, { ...sleepCollisionParams(first), etap: t(first.stageNamePl) });
    expect(en).toBe(`Stage "${t(first.stageNamePl)}" falls during the night at ${first.time}`);
    expect(en).not.toMatch(POLSKIE);
  });
});