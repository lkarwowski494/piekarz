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
jest.mock('expo-router', () => ({
  // Prowadzenie ustawia przycisk „Plan wypieku” w pasku nawigacji (Stack.Screen, 056): przycisk w drzewie ekranu
  Stack: { Screen: ({ options }: { options?: { headerRight?: () => React.ReactElement } }) => (options?.headerRight ? options.headerRight() : null) },
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
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
import StolnicaScreen from '../../app/stolnica';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, getActiveBake, setActiveBake, _resetMemStore, getStarters, deleteStarter } from '../data/sqlite-store';
import { getDb } from '../data/sqlite-schema';
import { loadBakeSession, parseBakeSession, saveBakeSession } from '../data/bake-session-store';
import { useTempDbDir, openRaw } from '../data/__tests__/helpers/node-sqlite-adapter';
import { calculateReverseSchedule, StageCategory } from '../scheduler/reverse-scheduler';
import { planBakeNotification } from '../core/notification-plan';
import { showsPokeTestEntry } from '../core/bake-steps';
import * as wejscia from '../lib/wejscia-pozniej';
import { wejscieWidoczne, WejsciePozniej, WEJSCIA_WIDOCZNE } from '../lib/wejscia-pozniej';
import { notificationText } from '../lib/notifications';
import { setLang, t } from '../lib/i18n';
import legacyFixture from '../../tests/fixtures/bake-session-v1-1c38b28.json';
import ryeFixture from '../../tests/fixtures/bake-session-v2-rye.json';

import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { calculateDoughRecipe } from '../core/domain-rules';
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

/**
 * Surowy zapis sesji w bazie, jak zostawił go starszy build. Od v6 sesja jest wierszem bake_sessions (D-102); do v5
 * test pisał ten sam tekst do app_settings.active_bake_session [M3 D1].
 */
async function zapiszSurowaSesje(raw: string): Promise<void> {
  const file = (await getDb())?.databasePath;
  if (!file) throw new Error('brak bazy');
  const db = openRaw(file);
  db.prepare(
    "INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at) VALUES ('surowa', 'active', ?, 0, 0) ON CONFLICT(id) DO UPDATE SET session_json = excluded.session_json"
  ).run(raw);
  db.close();
}

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const button = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label))[0];

/** Lista kroków planu jest na „Plan wypieku” z paska nawigacji prowadzenia (design-spec §11b „056”). */
async function openPlan(tree: renderer.ReactTestRenderer): Promise<void> {
  await act(async () => {
    button(tree.root, 'Plan wypieku').props.onPress();
  });
}

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
    jest.useRealTimers();
    ustawRecepturePlanu(null);
    setLang('pl');
  });

  it('start z Harmonogramu: kroki Stolnicy mają te same id, kolejność i czasy co schedule.stages', async () => {
    // Plan bez zakwasu z lodówki (z nim pierwszy krok to dokarmienie z lodówki, 104 / D-052: plan-z-lodowki-104.test.tsx)
    for (const s of await getStarters()) await deleteStarter(s.id);
    const przedOtwarciem = Math.floor(Date.now() / 60_000) * 60_000;
    const harm = await render(<HarmonogramScreen />);
    await act(async () => {
      button(harm.root, 'Zacznij wypiek').props.onPress();
    });
    act(() => harm.unmount());

    const bake = getActiveBake();
    const steps = bake?.steps;
    const target = new Date(steps?.[steps.length - 1]?.plannedEnd ?? 0);
    // 107 (§11c): domyślne „jutro 10:00” dałoby start planu w przeszłości, więc plan otwiera się na najwcześniejszej
    // godzinie (teraz + długość planu, w górę do pełnych 5 minut)
    expect(target.getMinutes() % 5).toBe(0);
    expect(steps?.[0]?.plannedStart ?? 0).toBeGreaterThanOrEqual(przedOtwarciem);
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
    await openPlan(stol);
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

  // F-15, BR-ETAP-003: przewodnik testu palca w Stolnicy przy garowaniu końcowym, przed pieczeniem
  // [M1-audytor-generalny-032; D-032]. Od DEC-21 a (155) wejście jest ukryte do wyniku testu F-15; kod zostaje,
  // więc ten scenariusz sprawdza zachowanie po odsłonięciu (`test-palca` = true).
  it('garowanie końcowe (krok przed pieczeniem) pokazuje wejście do testu palca, inne kroki nie (wejście F-15 odsłonięte)', async () => {
    const odsloniete = jest
      .spyOn(wejscia, 'wejscieWidoczne')
      .mockImplementation((w: WejsciePozniej) => (w === 'test-palca' ? true : WEJSCIA_WIDOCZNE[w]));
    setActiveBake({
      id: 'bake_poke',
      recipeName: 'Pszenny 75%',
      startedAt: now,
      currentStageId: 'step_1',
      ambientTempC: 22,
      calculatedRecipe: recipe(false),
    });
    const stol = await render(<StolnicaScreen />);
    const steps = (await loadBakeSession())?.steps ?? [];
    const proofIdx = steps.findIndex((s) => s.category === 'final_proof');
    expect(proofIdx).toBeGreaterThan(0);
    expect(steps.slice(proofIdx + 1).some((s) => s.category === 'bake')).toBe(true);
    const entries = () => stol.root.findAll((n) => n.props.testID === 'stolnica-poke-test-btn');
    for (let i = 0; i < steps.length; i++) {
      if (i !== proofIdx) expect({ step: steps[i].category, entries: entries().length }).toEqual({ step: steps[i].category, entries: 0 });
      else break;
      await act(async () => {
        button(stol.root, 'Zrobione').props.onPress();
      });
    }
    expect(textOf(stol.toJSON())).toContain(`Krok ${proofIdx + 1} z ${steps.length}`);
    expect(entries().length).toBeGreaterThan(0);
    expect(textOf(stol.toJSON())).toContain('Sprawdź gotowość: test palca');
    expect(textOf(stol.toJSON())).not.toContain('Jak sprawdzić, czy bochenek w koszyku jest gotowy do pieczenia');
    await act(async () => {
      entries()[0].props.onPress();
    });
    const text = textOf(stol.toJSON());
    expect(text).toContain('Test palca');
    expect(text).toContain('Jak sprawdzić, czy bochenek w koszyku jest gotowy do pieczenia');
    // Następny krok (nagrzewanie i pieczenie) już bez wejścia
    await act(async () => {
      button(stol.root, 'Zrobione').props.onPress();
    });
    expect(entries()).toHaveLength(0);
    act(() => stol.unmount());
    odsloniete.mockRestore();
  });

  // F-15 TEST (D-043): wejście ukryte do wyniku testu z testerami, DEC-21 a [M1-audytor-generalny-155; 03-zakres-504]
  it('F-15 TEST: Stolnica nie ma stolnica-poke-test-btn w żadnym kroku, także w garowaniu końcowym', async () => {
    expect(wejscieWidoczne('test-palca' as WejsciePozniej) ?? false).toBe(false);
    setActiveBake({
      id: 'bake_poke_ukryty',
      recipeName: 'Pszenny 75%',
      startedAt: now,
      currentStageId: 'step_1',
      ambientTempC: 22,
      calculatedRecipe: recipe(false),
    });
    const stol = await render(<StolnicaScreen />);
    const steps = (await loadBakeSession())?.steps ?? [];
    const proofIdx = steps.findIndex((s) => s.category === 'final_proof');
    expect(proofIdx).toBeGreaterThan(0);
    const entries = () => stol.root.findAll((n) => n.props.testID === 'stolnica-poke-test-btn');
    for (let i = 0; i <= proofIdx; i++) {
      expect({ step: steps[i].category, entries: entries().length }).toEqual({ step: steps[i].category, entries: 0 });
      if (i === proofIdx) break;
      await act(async () => {
        button(stol.root, 'Zrobione').props.onPress();
      });
    }
    expect(textOf(stol.toJSON())).toContain(`Krok ${proofIdx + 1} z ${steps.length}`);
    expect(textOf(stol.toJSON())).not.toContain('Sprawdź gotowość: test palca');
    act(() => stol.unmount());
  });

  it('showsPokeTestEntry: tylko garowanie końcowe ciasta pszennego, nie rozrost żytni w formie', () => {
    expect(showsPokeTestEntry({ id: 'final_proof', category: 'final_proof' })).toBe(true);
    expect(showsPokeTestEntry({ id: 'preheat_oven', category: 'preheat_oven' })).toBe(false);
    expect(showsPokeTestEntry({ id: 'bake', category: 'bake' })).toBe(false);
    expect(showsPokeTestEntry({ id: 'rye_proof', category: 'final_proof' })).toBe(false);
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

  it('receptura żytnia (> 50%): kroki w kolejności roli 06, bez składania, czasy z planu tej samej kategorii (BR-ETAP-002 Wariant żytni)', async () => {
    startRye();
    const stol = await render(<StolnicaScreen />);
    await openPlan(stol);
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
      // rye_proof 240 min ze źródła (ZYT-ETA-007) [audyt-niezalezny D-7]
      saved?.steps.map((s) => (s.id === 'rye_cool' ? 1440 : s.id === 'rye_proof' ? 240 : plan.find((st) => st.category === s.category)?.durationMinutes))
    );
    expect(saved?.steps[0]?.plannedStart).toBe(now);
    setLang('en');
    expect(RYE_STAGES.map(([, name]) => t(name))).toEqual([
      'Rye starter', 'Mixing the dough', 'Short dough fermentation', 'Dividing and shaping',
      'Rise in the tin', 'Baking in the tin', 'Cooling',
    ]);
    expect(t(RYE_PROOF_TEXT)).toBe('Leave the dough in the tin until its surface reaches the rim of the tin.');
  });

  // Droga z aplikacji: receptura żytnia → „Ułóż plan” → plan wypieku → „Zacznij wypiek” (jedyny start, 057)
  // [M1-audytor-generalny-030; 03-zakres-501]
  it('receptura żytnia przez plan wypieku: plan bez składań, kroki i godziny Stolnicy = kroki planu, koniec = „gotowe” (BR-ETAP-002 Wariant żytni)', async () => {
    for (const s of await getStarters()) await deleteStarter(s.id);
    // Zegar stały 21.10.2026 06:00 (SYS-06): plan żytni ze studzeniem 24 h trwa ok. 2 dni, więc „pojutrze 23:30”
    // nie daje stanu „za późno” o żadnej porze uruchomienia testu
    jest.useFakeTimers({ now: new Date(2026, 9, 21, 6, 0).getTime(), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    const formula = {
      flours: [{ name: 'Mąka żytnia 2000', percentage: 100, type: 'zytnia_2000' }],
      waterPercentage: 75, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000,
    };
    ustawRecepturePlanu({ recipeName: 'Żytni', calculatedRecipe: calculateDoughRecipe(formula), recipeFormula: formula });
    const harm = await render(<HarmonogramScreen />);
    await ustawGodzinePlanu(harm.root, 'Pojutrze', 23, 30);
    const planTekst = textOf(harm.toJSON());
    expect(planTekst).toContain('Rozrost w formie');
    expect(planTekst).not.toMatch(/Składanie|składaniami|Stretch|Coil|Formowanie wstępne/);
    await act(async () => {
      button(harm.root, 'Zacznij wypiek').props.onPress();
    });
    act(() => harm.unmount());

    const bake = getActiveBake()!;
    expect(bake.isHighRye).toBe(true);
    expect(bake.steps!.map((s) => [s.id, s.name])).toEqual(RYE_STAGES);
    const gotowe = new Date();
    gotowe.setDate(gotowe.getDate() + 2);
    gotowe.setHours(23, 30, 0, 0);
    expect(bake.steps![bake.steps!.length - 1].plannedEnd).toBe(gotowe.getTime());
    for (let i = 1; i < bake.steps!.length; i++) expect(bake.steps![i].plannedStart).toBe(bake.steps![i - 1].plannedEnd);

    const stol = await render(<StolnicaScreen />);
    act(() => stol.unmount());
    const saved = await loadBakeSession();
    expect(saved?.steps.map((s) => [s.id, s.plannedStart, s.plannedEnd])).toEqual(
      bake.steps!.map((s) => [s.id, s.plannedStart, s.plannedEnd])
    );
  });

  it('żyto: rozrost w formie kończy stan ciasta, nie zegar — po minutniku z planu krok trwa dalej', async () => {
    startRye();
    const stol = await render(<StolnicaScreen />);
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        button(stol.root, 'Zrobione').props.onPress();
      });
    }
    expect(textOf(stol.toJSON())).toContain('Krok 5 z 7');
    expect(textOf(stol.toJSON())).toContain(RYE_PROOF_TEXT);
    // Minutnik z planu biegnie od wejścia w krok, bez „Start” (056)
    expect(button(stol.root, 'Start')).toBeUndefined();
    const later = Date.now() + 15 * 3600 * 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => later);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1100));
    });
    const text = textOf(stol.toJSON());
    expect(text).toContain('po czasie'); // 114: zegar po terminie (makieta „koniec-kroku”)
    expect(text).toContain('Krok 5 z 7');
    expect(text).toContain('Rozrost w formie');
    // Wypiek żytni w formie (ZYT-ETA-001): bez dwóch faz garnka
    await act(async () => {
      button(stol.root, 'Zrobione').props.onPress();
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
    await zapiszSurowaSesje(raw);
    const stol = await render(<StolnicaScreen />);
    let text = textOf(stol.toJSON());
    expect(text).toContain('Razowiec po restarcie');
    expect(text).toContain('Krok 5 z 7');
    expect(text).toContain('29 min'); // 114: czas w minutach
    // Zegar biegnie dalej z zapisanego końca (bez przycisku „Wstrzymaj”, 056)
    expect((await loadBakeSession())?.timerEndsAt).toBe(ryeFixture.timerEndsAt);
    act(() => stol.unmount());

    await zapiszSurowaSesje(JSON.stringify({ ...ryeFixture, stepIdx: 2, timerEndsAt: null }));
    const again = await render(<StolnicaScreen />);
    text = textOf(again.toJSON());
    expect(text).toContain('Krok 3 z 7');
    expect(text).toContain('Krótka fermentacja ciasta');
    expect(again.root.findAll((n) => n.props.testID === 'timer-in-flight-adjustments')).toHaveLength(0);
    expect(button(again.root, 'Start')).toBeUndefined();
    expect(button(again.root, 'Zrobione')).toBeDefined();
    act(() => again.unmount());
  });

  it('zapis starego formatu (HEAD 1c38b28) wczytuje się w tym samym kroku i z tym samym pozostałym czasem (BR-ETAP-005 Zapis w starym formacie)', async () => {
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
    await zapiszSurowaSesje(raw);
    const stol = await render(<StolnicaScreen />);
    const text = textOf(stol.toJSON());
    expect(text).toContain('Chleb sprzed aktualizacji');
    expect(text).toContain('Krok 3 z 8');
    expect(text).toContain('Składanie 1 (Stretch & Fold)');
    expect(text).toContain('29 min'); // 114: czas w minutach
    // Zegar biegnie dalej z zapisanego końca (bez przycisku „Wstrzymaj”, 056)
    expect((await loadBakeSession())?.timerEndsAt).toBe(legacyFixture.timerEndsAt);
    act(() => stol.unmount());
  });

  it('powiadomienie ma nazwę i rodzaj kroku z sesji', () => {
    const step = (id: string, name: string, category: StageCategory) => ({
      id, name, category, durationMin: 45, isPassive: false, instructions: '', plannedStart: null, plannedEnd: null,
    });
    const steps = [step('bulk_ferment', 'Fermentacja burzliwa ze składaniami', 'bulk_ferment'), step('bake', 'Wypiek z parą i rumienienie', 'bake')];
    const p = planBakeNotification({ id: 'bake_x', recipeName: 'Chleb', stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: now + 1000, steps }, now);
    expect(p ? notificationText(p).body : '').toBe('Krok „Fermentacja burzliwa ze składaniami” dobiegł końca.');
    const bake = planBakeNotification({ id: 'bake_x', recipeName: 'Chleb', stepIdx: 1, dutchOvenPhase: 'lid_on', timerEndsAt: now + 1000, steps }, now);
    expect(bake).toEqual(expect.objectContaining({ level: 'timeSensitive', textKey: 'krok.zdejmijPokrywke' }));
  });
});
