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
import ryeFixture from '../../tests/fixtures/bake-session-v2-rye.json';

import { zUprawnieniem } from '../../tests/helpers/platnosci';
/** Komunikat blokady z 6e120aa: po wariancie żytnim (a) roli 06 nie może się pokazać. */
const RYE_MSG =
  'Stolnica nie prowadzi jeszcze chleba żytniego. Kroki dla ciasta żytniego są w przygotowaniu, więc ten wypiek nie został rozpoczęty.';
/** Etapy żytnie: id i nazwa z docs/tresci/pl/chleb-zytni-etapy.md (ZYT-ETA-001). */
const RYE_STAGES = [
  ['rye_starter', 'Zakwas żytni'],
  ['rye_mix', 'Mieszanie ciasta'],
  ['rye_rest', 'Krótka fermentacja ciasta'],
  ['rye_shape', 'Podział i formowanie'],
  ['rye_proof', 'Rozrost w formie'],
  ['rye_bake', 'Wypiek w formie'],
  ['rye_cool', 'Studzenie'],
];
const RYE_PROOF_TEXT = 'Zostaw ciasto w formie, aż jego powierzchnia dojdzie do brzegu formy.';

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
    zUprawnieniem(); // dostęp z App Store (009): dawniej lokalny okres próbny
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

  const startRye = () =>
    setActiveBake({
      id: 'bake_rye',
      recipeName: 'Razowiec żytni',
      startedAt: now,
      currentStageId: 'step_1',
      ambientTempC: 22,
      calculatedRecipe: recipe(true),
    });

  it('receptura żytnia (> 50%): kroki w kolejności roli 06, bez składania, czasy z planu tej samej kategorii', async () => {
    startRye();
    const stol = await render(<StolnicaScreen />);
    const text = textOf(stol.toJSON());
    expect(text).not.toContain(RYE_MSG);
    expect(text).toContain('Krok 1 z 7');
    for (const [, name] of RYE_STAGES) expect(text).toContain(name);
    expect(text).not.toMatch(/Składanie|składaniami|Stretch|Coil/);
    act(() => stol.unmount());

    const saved = await loadBakeSession();
    expect(saved?.version).toBe(2);
    expect(saved?.steps.map((s) => [s.id, s.name])).toEqual(RYE_STAGES);
    const plan = calculateReverseSchedule(new Date(now), { ambientTemperatureC: 22 }).stages;
    expect(saved?.steps.map((s) => s.durationMin)).toEqual(
      saved?.steps.map((s) => (s.id === 'rye_cool' ? 1440 : plan.find((st) => st.category === s.category)?.durationMinutes))
    );
    expect(saved?.steps[0]?.plannedStart).toBe(now);
    setLang('en');
    expect(RYE_STAGES.map(([, name]) => t(name))).toEqual([
      'Rye sourdough', 'Mixing the dough', 'Short dough fermentation', 'Dividing and shaping',
      'Rise in the tin', 'Baking in the tin', 'Cooling',
    ]);
    expect(t(RYE_PROOF_TEXT)).toBe('Leave the dough in the tin until its surface reaches the rim of the tin.');
  });

  it('żyto: rozrost w formie kończy stan ciasta, nie zegar — po minutniku z planu krok trwa dalej', async () => {
    startRye();
    const stol = await render(<StolnicaScreen />);
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        button(stol.root, 'Następny krok').props.onPress();
      });
    }
    expect(textOf(stol.toJSON())).toContain('Krok 5 z 7');
    expect(textOf(stol.toJSON())).toContain(RYE_PROOF_TEXT);
    await act(async () => {
      button(stol.root, 'Start').props.onPress();
    });
    const later = Date.now() + 15 * 3600 * 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => later);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1100));
    });
    const text = textOf(stol.toJSON());
    expect(text).toContain('00:00');
    expect(text).toContain('Krok 5 z 7');
    expect(text).toContain('Rozrost w formie');
    // Wypiek żytni w formie (ZYT-ETA-001): bez dwóch faz garnka
    await act(async () => {
      button(stol.root, 'Następny krok').props.onPress();
    });
    expect(textOf(stol.toJSON())).toContain('Krok 6 z 7');
    expect(stol.root.findAll((n) => n.props.testID === 'dutch-oven-phase-card')).toHaveLength(0);
    act(() => stol.unmount());
  });

  it('sesja v2 z krokami żytnimi przeżywa restart; etap bez czasu w planie nie ma minutnika', async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => now + 60_000);
    const raw = JSON.stringify(ryeFixture);
    expect(parseBakeSession(raw)?.steps.map((s) => [s.id, s.durationMin])).toEqual([
      ['rye_starter', 360], ['rye_mix', 15], ['rye_rest', null], ['rye_shape', 15],
      ['rye_proof', 840], ['rye_bake', 45], ['rye_cool', 1440],
    ]);
    await setAppSetting(BAKE_SESSION_KEY, raw);
    const stol = await render(<StolnicaScreen />);
    let text = textOf(stol.toJSON());
    expect(text).toContain('Razowiec po restarcie');
    expect(text).toContain('Krok 5 z 7');
    expect(text).toContain('29:00');
    expect(button(stol.root, 'Wstrzymaj')).toBeDefined();
    act(() => stol.unmount());

    await setAppSetting(BAKE_SESSION_KEY, JSON.stringify({ ...ryeFixture, stepIdx: 2, timerEndsAt: null }));
    const again = await render(<StolnicaScreen />);
    text = textOf(again.toJSON());
    expect(text).toContain('Krok 3 z 7');
    expect(text).toContain('Krótka fermentacja ciasta');
    expect(again.root.findAll((n) => n.props.testID === 'timer-in-flight-adjustments')).toHaveLength(0);
    expect(button(again.root, 'Start')).toBeUndefined();
    expect(button(again.root, 'Następny krok')).toBeDefined();
    act(() => again.unmount());
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
