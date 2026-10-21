/**
 * M1-audytor-generalny-151 (08-programista-504; design-spec §11c, wartości `{dzien…}`): dzień dalej niż pojutrze
 * ma formę „{dzień tygodnia}, {d} {miesiąc}” (EN “{weekday}, {month} {d}”), dzień poprzedni to „wczoraj”;
 * przy kroku po czasie godzina „Gotowe” w prowadzeniu = teraz + pozostała długość planu (zegar ustawiony).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
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
import { initDatabase } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps, type SessionStep } from '../core/bake-steps';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';
import { formatTime } from '../lib/format';
import { dzienSlownie } from '../lib/spirala-etykieta';

const MIN = 60_000;
// Środa 21.10.2026, 08:00 czasu lokalnego
const TERAZ = new Date(2026, 9, 21, 8, 0);
const T0 = TERAZ.getTime();
const steps: SessionStep[] = planBakeSteps({ startAt: T0, isHighRye: false });
const KONIEC = steps[steps.length - 1].plannedEnd as number;

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  return '';
};

let now = T0;

async function gotoweWProwadzeniu(stepIdx: number, timerEndsAt: number | null, teraz: number): Promise<string | null> {
  now = teraz;
  await saveBakeSession({
    version: 2, steps, stepIdx, dutchOvenPhase: 'lid_on', timerEndsAt, pausedLeftSec: null,
    recipeName: 'Chleb', startedAt: T0, bake: null,
  });
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 60; i++) await new Promise((r) => setImmediate(r));
  });
  const el = tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'plan-ready');
  const wynik = el[0] ? textOf(el[0]) : null;
  act(() => tree.unmount());
  return wynik;
}

describe('151: dzień słownie i godzina „Gotowe” po czasie', () => {
  afterEach(() => setLang('pl'));

  it('dzień za 3 dni: PL „sobota, 24 października”, EN “Saturday, October 24”', () => {
    const za3 = new Date(2026, 9, 24, 8, 0);
    setLang('pl');
    expect(dzienSlownie(za3, TERAZ)).toBe('sobota, 24 października');
    setLang('en');
    expect(dzienSlownie(za3, TERAZ)).toBe('Saturday, October 24');
  });

  it('dzień wczorajszy: „wczoraj” / “yesterday”; dziś, jutro i pojutrze bez zmian', () => {
    const wczoraj = new Date(2026, 9, 20, 23, 0);
    setLang('pl');
    expect(dzienSlownie(wczoraj, TERAZ)).toBe('wczoraj');
    expect(dzienSlownie(new Date(2026, 9, 21, 22, 0), TERAZ)).toBe('dziś');
    expect(dzienSlownie(new Date(2026, 9, 22, 1, 0), TERAZ)).toBe('jutro');
    expect(dzienSlownie(new Date(2026, 9, 23, 1, 0), TERAZ)).toBe('pojutrze');
    setLang('en');
    expect(dzienSlownie(wczoraj, TERAZ)).toBe('yesterday');
  });

  describe('prowadzenie z zegarem', () => {
    beforeAll(() => {
      useTempDbDir();
    });
    beforeEach(async () => {
      zUprawnieniem();
      setLang('pl');
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      await initDatabase();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('krok w czasie: „Gotowe” = koniec planu', async () => {
      const g = await gotoweWProwadzeniu(0, steps[0].plannedEnd, T0 + 2 * MIN);
      expect(g).toBe(`Gotowe jutro o ${formatTime(KONIEC)}`);
    });

    it('krok 90 min po czasie: „Gotowe” = teraz + pozostała długość planu', async () => {
      const koniecKroku = steps[0].plannedEnd as number;
      const teraz = koniecKroku + 90 * MIN;
      const oczekiwane = teraz + (KONIEC - koniecKroku);
      const g = await gotoweWProwadzeniu(0, koniecKroku, teraz);
      expect(g).toBe(`Gotowe ${dzienSlownie(new Date(oczekiwane), new Date(teraz))} o ${formatTime(oczekiwane)}`);
      expect(g).not.toBe(`Gotowe jutro o ${formatTime(KONIEC)}`);
    });
  });
});
