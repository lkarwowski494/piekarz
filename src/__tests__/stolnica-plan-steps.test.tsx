/**
 * Stolnica prowadzi krokami z planu Harmonogramu i receptury, nie ze stałej listy
 * [M1-audytor-generalny-030; 03-zakres-003; 01-odkrywanie-007] (F-07, ZM-02, D-030).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }) }));
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
import StolnicaScreen from '../../app/(tabs)/stolnica';
import HarmonogramScreen from '../../app/(tabs)/harmonogram';
import { initDatabase, getActiveBake, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { setAppSetting } from '../data/settings-store';
import { BAKE_SESSION_KEY, loadBakeSession, parseBakeSession, saveBakeSession } from '../data/bake-session-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { calculateReverseSchedule, StageCategory } from '../scheduler/reverse-scheduler';
import { planBakeNotification } from '../core/notification-plan';
import { notificationText } from '../lib/notifications';
import { setLang, t } from '../lib/i18n';
import legacyFixture from '../../tests/fixtures/bake-session-v1-1c38b28.json';

const RYE_MSG =
  'Stolnica nie prowadzi jeszcze chleba żytniego. Kroki dla ciasta żytniego są w przygotowaniu, więc ten wypiek nie został rozpoczęty.';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const button = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label))[0];

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

const recipe = (isHighRye: boolean) => ({
  targetDoughWeightGrams: 1000,
  baseFlourWeightGrams: 520,
  flours: [{ name: isHighRye ? 'Mąka żytnia 2000' : 'Mąka pszenna 750', percentage: 100, weightGrams: 520 }],
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
  isHighRye,
});

/** Dzisiejsze 8 kroków Stolnicy z HEAD 1c38b28: id, nazwa, minuty. */
const LEGACY_8 = [
  ['step_1', 'Autoliza', 45],
  ['step_2', 'Mieszanie i zaszczepienie', 15],
  ['step_3', 'Składanie 1 (Stretch & Fold)', 30],
  ['step_4', 'Składanie 2 (Coil Fold)', 30],
  ['step_5', 'Składanie 3 (Coil Fold)', 30],
  ['step_6', 'Formowanie wstępne (Pre-shape)', 20],
  ['step_7', 'Formowanie do koszyka i chłód', 720],
  ['step_8', 'Wypiek w garnku z parą', 45],
];

describe('Stolnica z receptury i planu (030)', () => {
  let now = 1_800_000_000_000;
  beforeEach(async () => {
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    setLang('pl');
  });

  it('start z Harmonogramu: kroki Stolnicy mają te same id, kolejność i czasy co schedule.stages', async () => {
    const harm = await render(<HarmonogramScreen />);
    await act(async () => {
      button(harm.root, 'Rozpocznij wypiek na Stolnicy').props.onPress();
    });
    act(() => harm.unmount());

    const bake = getActiveBake();
    const steps = bake?.steps;
    const target = new Date(steps?.[steps.length - 1]?.plannedEnd ?? 0);
    expect([target.getHours(), target.getMinutes()]).toEqual([10, 0]);
    const schedule = calculateReverseSchedule(target, {
      ambientTemperatureC: 23,
      coldRetardHours: 14,
      sleepStartHour: 23,
      sleepEndHour: 6.5,
    });
    expect(steps?.map((s) => [s.id, s.name, s.durationMin, s.plannedStart, s.plannedEnd])).toEqual(
      schedule.stages.map((st) => [st.id, st.namePl, st.durationMinutes, st.startTime.getTime(), st.endTime.getTime()])
    );
    expect(bake?.isHighRye).toBe(false);

    const stol = await render(<StolnicaScreen />);
    const text = textOf(stol.toJSON());
    expect(text).toContain(`Krok 1 z ${schedule.stages.length}`);
    for (const st of schedule.stages) expect(text).toContain(st.namePl);
    expect(text).not.toContain('Składanie 1 (Stretch & Fold)');
    const saved = await loadBakeSession();
    expect(saved?.version).toBe(2);
    expect(saved?.steps?.map((s) => s.id)).toEqual(schedule.stages.map((st) => st.id));
    act(() => stol.unmount());
  });

  it('start z Kalkulatora (pszenny): kroki z tego samego planu liczonego od startu wypieku', async () => {
    setActiveBake({
      id: 'bake_calc',
      recipeName: 'Pszenny 75%',
      startedAt: now,
      currentStageId: 'step_1',
      ambientTempC: 22,
      calculatedRecipe: recipe(false),
    });
    const stol = await render(<StolnicaScreen />);
    act(() => stol.unmount());
    const saved = await loadBakeSession();
    const plan = calculateReverseSchedule(new Date(now), { ambientTemperatureC: 22 }).stages;
    expect(saved?.steps?.map((s) => [s.id, s.durationMin])).toEqual(plan.map((st) => [st.id, st.durationMinutes]));
    expect(saved?.steps?.[0]?.plannedStart).toBe(now);
  });

  it('receptura żytnia (isHighRye): brak kroku składania, Stolnica nie startuje i pokazuje komunikat', async () => {
    setActiveBake({
      id: 'bake_rye',
      recipeName: 'Razowiec żytni',
      startedAt: now,
      currentStageId: 'step_1',
      ambientTempC: 22,
      calculatedRecipe: recipe(true),
    });
    const stol = await render(<StolnicaScreen />);
    const text = textOf(stol.toJSON());
    expect(text).toContain(RYE_MSG);
    expect(text).not.toMatch(/Składanie|składaniami/);
    expect(text).not.toContain('Krok 1 z');
    expect(button(stol.root, 'Następny krok')).toBeUndefined();
    act(() => stol.unmount());
    expect(await loadBakeSession()).toBeNull();
    setLang('en');
    expect(t(RYE_MSG)).not.toBe(RYE_MSG);
  });

  it('zapis starego formatu (HEAD 1c38b28) wczytuje się w tym samym kroku i z tym samym pozostałym czasem', async () => {
    const raw = JSON.stringify(legacyFixture);
    const parsed = parseBakeSession(raw);
    expect(parsed?.version).toBe(2);
    expect(parsed?.steps?.map((s) => [s.id, s.name, s.durationMin])).toEqual(LEGACY_8);
    expect(parsed).toEqual(
      expect.objectContaining({ stepIdx: 2, timerEndsAt: legacyFixture.timerEndsAt, pausedLeftSec: null, dutchOvenPhase: 'lid_on' })
    );

    // Uszkodzony albo niepełny zapis nowego formatu: nic nie jest zgadywane
    const steps = parsed?.steps ?? [];
    expect(parseBakeSession(JSON.stringify({ ...legacyFixture, version: 2, steps: [] }))).toBeNull();
    expect(parseBakeSession(JSON.stringify({ ...legacyFixture, version: 2, steps: [{ id: 'x' }] }))).toBeNull();
    expect(parseBakeSession(JSON.stringify({ ...legacyFixture, version: 3, steps }))).toBeNull();
    expect(parseBakeSession(JSON.stringify({ ...legacyFixture, version: 2, steps: steps.slice(0, 2) }))).toBeNull();

    jest.spyOn(Date, 'now').mockImplementation(() => now + 60_000);
    await setAppSetting(BAKE_SESSION_KEY, raw);
    const stol = await render(<StolnicaScreen />);
    const text = textOf(stol.toJSON());
    expect(text).toContain('Chleb sprzed aktualizacji');
    expect(text).toContain('Krok 3 z 8');
    expect(text).toContain('Składanie 1 (Stretch & Fold)');
    expect(text).toContain('29:00');
    expect(button(stol.root, 'Wstrzymaj')).toBeDefined();
    act(() => stol.unmount());
  });

  it('powiadomienie ma nazwę i rodzaj kroku z sesji', () => {
    const step = (id: string, name: string, category: StageCategory) => ({
      id, name, category, durationMin: 45, isPassive: false, instructions: '', plannedStart: null, plannedEnd: null,
    });
    const steps = [step('bulk_ferment', 'Fermentacja burzliwa ze składaniami', 'bulk_ferment'), step('bake', 'Wypiek z parą i rumienienie', 'bake')];
    const p = planBakeNotification({ stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: now + 1000, steps }, now);
    expect(p ? notificationText(p).body : '').toBe('Krok „Fermentacja burzliwa ze składaniami” dobiegł końca.');
    const bake = planBakeNotification({ stepIdx: 1, dutchOvenPhase: 'lid_on', timerEndsAt: now + 1000, steps }, now);
    expect(bake).toEqual(expect.objectContaining({ level: 'timeSensitive', textKey: 'krok.zdejmijPokrywke' }));
  });
});
