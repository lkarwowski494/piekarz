/**
 * Zaplanowane wypieki na „Dziś” (M3 D5; D-092, D-104, D-108; makieta roli 04 a2-03 w31 „sobota-zaplanowany”
 * i „kilka-planow”): bez trwającego wypieku najbliższy plan na spirali z „Zobacz plan”, przy trwającym plany listą pod
 * spiralą; arkusz planu z krokami, „Usuń plan” z potwierdzeniem, „Zacznij wypiek”, gdy nadszedł czas startu (start =
 * trwający z limitem 2 i pytaniem D-104); plan po minionym starcie zaległy w „Następne” („Zrobione” otwiera plan,
 * bez „Pomiń”). Skrót „Zaplanuj wypiek na ten dzień” w arkuszu dnia (BR-KAL-015 po D-092: trwający wypiek nie blokuje).
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: mockNavigate, replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { Alert, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, deleteStarter, getStarters } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { deleteBakeSession, loadActiveBakeSessions, loadPlannedBakes, savePlannedBake, type PlannedBake } from '../data/bake-sessions-store';
import { planBakeSteps } from '../core/bake-steps';
import { localDateKey } from '../core/dzien-lokalny';
import { MAX_ZAPLANOWANYCH_WYPIEKOW } from '../core/limity-wypiekow';
import { _resetStanu } from '../lib/platnosci/stan';
import { odbierzDzienGotowe, ustawDzienGotowe } from '../lib/plan-receptury';
import { odbierzRodzajReceptur } from '../lib/start-stan';
import { setLang } from '../lib/i18n';

const mockIap = (Iap as unknown as { __mock: { reset: () => void; entitlements: Array<Record<string, unknown>> } }).__mock;
const H = 3_600_000;

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const host = (root: renderer.ReactTestInstance, testID: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === testID);
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button');
const zPrefiksem = (root: renderer.ReactTestInstance, prefiks: string) =>
  root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith(prefiks) && typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button');
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');

function zDostepem() {
  mockIap.entitlements = [{ id: 't', transactionId: 't', productId: 'com.apps4brew.baker.pro.lifetime', purchaseState: 'purchased', transactionDate: 1 }];
}
function plan(id: string, nazwa: string, start: number): PlannedBake {
  const steps = planBakeSteps({ startAt: start, isHighRye: false });
  return { version: 1, id, recipeName: nazwa, plannedStartAt: start, steps, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[0].id, steps } };
}
const wypiek = (id: string, nazwa: string) => {
  const start = Date.now() - 2 * H;
  const steps = planBakeSteps({ startAt: start, isHighRye: false });
  return {
    version: 2 as const, steps, stepIdx: 3, dutchOvenPhase: 'lid_on' as const, timerEndsAt: null, pausedLeftSec: 600,
    recipeName: nazwa, startedAt: start, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[3].id },
  };
};

type Przycisk = { text: string; style?: string; onPress?: () => void };
let alertSpy: jest.SpyInstance;
const ostatniAlert = () => {
  const [tytul, tresc, przyciski] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string | undefined, Przycisk[]];
  return { tytul, tresc, przyciski };
};

let tree: renderer.ReactTestRenderer | null = null;
async function renderStart() {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><StartScreen /></AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}

async function przygotuj() {
  jest.clearAllMocks();
  _resetMemStore();
  mockIap.reset();
  _resetStanu();
  zDostepem();
  ustawDzienGotowe(null);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await initDatabase();
  await saveBakeSession(null);
  for (const p of await loadPlannedBakes()) await deleteBakeSession(p.id);
  for (const s of await getStarters()) await deleteStarter(s.id);
}
function sprzataj() {
  if (tree) act(() => tree?.unmount());
  tree = null;
  alertSpy.mockRestore();
  setLang('pl');
}

describe('D5: zaplanowane wypieki na „Dziś”', () => {
  beforeEach(przygotuj);
  afterEach(sprzataj);

  it('BR-KAL-009 plan bez trwającego wypieku: spirala planu z „Zobacz plan” zamiast pustej spirali', async () => {
    await savePlannedBake(plan('plan_sob', 'Chleb na sobotę', Date.now() + 30 * H));
    const root = await renderStart();
    expect(host(root, 'start-pusta-spirala')).toHaveLength(0);
    expect(host(root, 'start-plan-spirala')).toHaveLength(1);
    expect(teksty(root)).toMatch(/Chleb na sobotę: gotowe .+ o \d{1,2}:\d{2}/);
    expect(teksty(root)).toMatch(/Start .+ o \d{1,2}:\d{2}/);
    const zobacz = przycisk(root, 'plan-zobacz-plan_sob');
    expect(zobacz).toHaveLength(1);
    expect(Number([zobacz[0].props.style].flat().reduce((a: Record<string, unknown>, s: unknown) => ({ ...a, ...(s as object) }), {}).minHeight)).toBeGreaterThanOrEqual(44);
  });

  it('BR-KAL-009 Dwa plany i trwający wypiek: wypiek na spirali, plany listą pod nią w kolejności startu', async () => {
    await saveBakeSession(wypiek('bake_chleb', 'Chleb'));
    await savePlannedBake(plan('plan_b', 'Bagietka', Date.now() + 50 * H));
    await savePlannedBake(plan('plan_p', 'Pizza', Date.now() + 26 * H));
    const root = await renderStart();
    expect(przycisk(root, 'resume-bake-btn')).toHaveLength(1);
    const wiersze = zPrefiksem(root, 'plan-wiersz-');
    expect(wiersze.map((w) => w.props.testID)).toEqual(['plan-wiersz-plan_p', 'plan-wiersz-plan_b']);
    // PRZ-13: wiersz planu ma glif „plan”, nie spiralę trwającego wypieku
    for (const w of wiersze) {
      expect(w.findAll((n) => n.props?.testID === 'glif-plan').length).toBeGreaterThan(0);
      expect(w.findAll((n) => n.props?.testID === 'glif-wypiek')).toHaveLength(0);
    }
    expect(wiersze[0].props.accessibilityLabel).toMatch(/\d{1,2}:\d{2} Pizza$/);
  });

  it('Zobacz plan: arkusz z krokami, przed czasem bez startu; „Usuń plan” bez pytania z „Przywróć” (D-051 1a), tylko ten plan', async () => {
    const sob = plan('plan_sob', 'Chleb', Date.now() + 30 * H);
    await savePlannedBake(sob);
    await savePlannedBake(plan('plan_nd', 'Pizza', Date.now() + 60 * H));
    const root = await renderStart();
    await act(async () => przycisk(root, 'plan-zobacz-plan_sob')[0].props.onPress());
    expect(host(root, 'arkusz-planu')).toHaveLength(1);
    expect(teksty(root)).toContain('Dokarmienie zakwasu');
    expect(przycisk(root, 'plan-zacznij-btn')).toHaveLength(0);
    await act(async () => przycisk(root, 'plan-usun-btn')[0].props.onPress());
    await flush();
    expect(alertSpy).not.toHaveBeenCalled();
    expect((await loadPlannedBakes()).map((p) => p.id)).toEqual(['plan_nd']);
    expect(host(root, 'arkusz-planu')).toHaveLength(0);
    expect(host(root, 'plan-undo-bar')).toHaveLength(1);
    expect(teksty(root)).toContain('Usunięto plan wypieku');
    await act(async () => przycisk(root, 'plan-undo-restore-btn')[0].props.onPress());
    await flush();
    expect((await loadPlannedBakes()).find((p) => p.id === 'plan_sob')).toEqual(sob);
  });

  it('start, gdy nadszedł czas: zaległy w „Następne” bez „Pomiń”; „Zrobione” otwiera plan; „Zacznij wypiek” = trwający, Stolnica', async () => {
    await savePlannedBake(plan('plan_teraz', 'Chleb', Date.now() - H));
    const root = await renderStart();
    const zalegly = 'wypiek:plan_teraz:krok:0';
    expect(przycisk(root, `zalegle-zrobione-${zalegly}`)).toHaveLength(1);
    expect(przycisk(root, `zalegle-pomin-${zalegly}`)).toHaveLength(0);
    await act(async () => przycisk(root, `zalegle-zrobione-${zalegly}`)[0].props.onPress());
    expect(host(root, 'arkusz-planu')).toHaveLength(1);
    await act(async () => przycisk(root, 'plan-zacznij-btn')[0].props.onPress());
    await flush();
    expect(alertSpy).not.toHaveBeenCalled();
    expect((await loadActiveBakeSessions()).map((s) => s.bake?.id)).toEqual(['plan_teraz']);
    expect(await loadPlannedBakes()).toEqual([]);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: 'plan_teraz' } });
  });

  it('start przy jednym trwającym: pytanie D-104 „Prowadź oba” — oba trwają', async () => {
    await saveBakeSession(wypiek('bake_chleb', 'Chleb'));
    await savePlannedBake(plan('plan_teraz', 'Pizza', Date.now() - H));
    const root = await renderStart();
    await act(async () => przycisk(root, 'plan-wiersz-plan_teraz')[0].props.onPress());
    await act(async () => przycisk(root, 'plan-zacznij-btn')[0].props.onPress());
    await flush();
    const a = ostatniAlert();
    expect(a.tytul).toBe('Trwa już inny wypiek');
    expect(a.przyciski.map((b) => b.text)).toEqual(['Prowadź oba', 'Wróć do: Chleb', 'Anuluj']);
    await act(async () => a.przyciski[0].onPress?.());
    await flush();
    expect((await loadActiveBakeSessions()).map((s) => s.bake?.id).sort()).toEqual(['bake_chleb', 'plan_teraz']);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: 'plan_teraz' } });
  });

  it('start przy 2 trwających: „Prowadzisz już 2 wypieki”, plan zostaje zaplanowany', async () => {
    await saveBakeSession(wypiek('bake_a', 'A'));
    await saveBakeSession(wypiek('bake_b', 'B'));
    await savePlannedBake(plan('plan_teraz', 'Pizza', Date.now() - H));
    const root = await renderStart();
    await act(async () => przycisk(root, 'plan-wiersz-plan_teraz')[0].props.onPress());
    await act(async () => przycisk(root, 'plan-zacznij-btn')[0].props.onPress());
    await flush();
    expect(ostatniAlert().tytul).toBe('Prowadzisz już 2 wypieki');
    expect((await loadPlannedBakes()).map((p) => p.id)).toEqual(['plan_teraz']);
  });
});

describe('D5: skrót „Zaplanuj wypiek na ten dzień” w arkuszu dnia (BR-KAL-015, D-108)', () => {
  // Czwartek 22.10.2026 10:00: w pasku są wtorek (miniony) i sobota (pojutrze)
  beforeEach(async () => {
    jest.useFakeTimers({ now: new Date(2026, 9, 22, 10, 0), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    await przygotuj();
  });
  afterEach(() => {
    sprzataj();
    jest.useRealTimers();
  });
  const sobota = localDateKey(new Date(2026, 9, 24).getTime());
  const wtorek = localDateKey(new Date(2026, 9, 20).getTime());

  async function dzien(root: renderer.ReactTestInstance, klucz: string) {
    await act(async () => przycisk(root, `pasek-dzien-${klucz}`)[0].props.onPress());
  }

  it('BR-KAL-015 Pojutrze bez trwającego wypieku: wybór receptury (na zakwasie), potem plan z dniem „gotowe” w sobotę', async () => {
    const root = await renderStart();
    await dzien(root, sobota);
    const skrot = przycisk(root, 'arkusz-zaplanuj-btn');
    expect(skrot).toHaveLength(1);
    expect(skrot[0].props.accessibilityLabel).toBe('Zaplanuj wypiek na ten dzień');
    await act(async () => skrot[0].props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('/receptury');
    expect(odbierzRodzajReceptur()).toBe('sourdough');
    expect(odbierzDzienGotowe(Date.now())).toBe(2);
  });

  it('BR-KAL-015 Trwa wypiek: po D-092 skrót jest (D-108; BRD do synchronizacji)', async () => {
    await saveBakeSession(wypiek('bake_chleb', 'Chleb'));
    const root = await renderStart();
    await dzien(root, sobota);
    expect(przycisk(root, 'arkusz-zaplanuj-btn')).toHaveLength(1);
  });

  it('BR-KAL-015 Dzień miniony: wtorek bez skrótu', async () => {
    const root = await renderStart();
    await dzien(root, wtorek);
    expect(host(root, 'arkusz-dnia')).toHaveLength(1);
    expect(przycisk(root, 'arkusz-zaplanuj-btn')).toHaveLength(0);
  });

  it('BR-KAL-015 limit 5 planów: bez skrótu', async () => {
    for (let n = 0; n < MAX_ZAPLANOWANYCH_WYPIEKOW; n++) await savePlannedBake(plan(`p${n}`, `Plan ${n}`, Date.now() + (40 + n) * H));
    const root = await renderStart();
    await dzien(root, sobota);
    expect(przycisk(root, 'arkusz-zaplanuj-btn')).toHaveLength(0);
  });
});
