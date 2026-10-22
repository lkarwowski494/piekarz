/**
 * Piekarnik zajęty w planie wypieku (M3 D6; BR-KAL-016 „Jeden piekarnik”, RD-34; makieta roli 04 a2
 * `piekarnik-1-uklad-planu`): przy „Zaplanuj” i przy „Zacznij wypiek”, gdy okno piekarnika (od startu nagrzewania do
 * końca pieczenia) nachodzi na okno innego wypieku, pytanie „Piekarnik zajęty o {godzina}” z propozycją „Przesuń start”
 * o najmniejszy czas usuwający kolizję — mocniejszy przypadek niż „Kroki nachodzą na siebie” z D5, bez dwóch pytań
 * o to samo. Po przesunięciu nagrzewanie drugiego zaczyna się dokładnie o końcu pieczenia pierwszego (pełne nagrzewanie).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush, navigate: mockNavigate, replace: jest.fn() }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
  useLocalSearchParams: () => ({}),
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
const mockResync = jest.fn(() => Promise.resolve({ status: 'granted', ok: true }));
jest.mock('../lib/notifications', () => ({ ...jest.requireActual('../lib/notifications'), resyncNotifications: () => mockResync() }));

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, getActiveBake, setActiveBake, _resetMemStore, getStarters, deleteStarter } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { deleteBakeSession, loadPlannedBakes, savePlannedBake } from '../data/bake-sessions-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
import { setLang } from '../lib/i18n';
import { formatTime } from '../lib/format';
import type { SessionStep } from '../core/bake-steps';

const poId = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button');

async function render(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<HarmonogramScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}
const czekaj = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};

type Przycisk = { text: string; style?: string; isPreferred?: boolean; onPress?: () => void };
let alertSpy: jest.SpyInstance;
const ostatniAlert = () => {
  const [tytul, tresc, przyciski] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string | undefined, Przycisk[]];
  return { tytul, tresc, przyciski };
};
const nacisnij = async (p: Przycisk | undefined) => {
  await act(async () => {
    p?.onPress?.();
  });
  await czekaj();
};

async function nacisnijPrzycisk(harm: renderer.ReactTestRenderer, testID: string) {
  const [p] = poId(harm.root, testID);
  expect(p).toBeDefined();
  await act(async () => {
    p.props.onPress();
  });
  await czekaj();
}

const krok = (steps: readonly SessionStep[], kategoria: string) => steps.find((s) => s.category === kategoria);
const NAZWA = 'Klasyczny chleb rzemieślniczy';

describe('D6: piekarnik zajęty przy planie drugiego wypieku (BR-KAL-016)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    mockPush.mockClear();
    mockNavigate.mockClear();
    mockResync.mockClear();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await initDatabase();
    await saveBakeSession(null);
    for (const p of await loadPlannedBakes()) await deleteBakeSession(p.id);
    for (const s of await getStarters()) await deleteStarter(s.id);
  });
  afterEach(() => alertSpy.mockRestore());

  /** Pierwszy plan na pojutrze 12:00 zapisany „Zaplanuj”; zwraca jego kroki. */
  async function pierwszyPlan(harm: renderer.ReactTestRenderer): Promise<readonly SessionStep[]> {
    await ustawGodzinePlanu(harm.root, 'Pojutrze', 12, 0);
    await nacisnijPrzycisk(harm, 'plan-zaplanuj-btn');
    const [p] = await loadPlannedBakes();
    expect(p).toBeDefined();
    alertSpy.mockClear();
    return p.steps;
  }

  it('BR-KAL-016 Jeden piekarnik: „Zaplanuj” w tym samym oknie — „Piekarnik zajęty o {godzina}” z propozycją przesunięcia; nic nie zapisane do decyzji', async () => {
    const harm = await render();
    const a = await pierwszyPlan(harm);
    await nacisnijPrzycisk(harm, 'plan-zaplanuj-btn');
    act(() => harm.unmount());
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const { tytul, tresc, przyciski } = ostatniAlert();
    const od = krok(a, 'preheat_oven')!.plannedStart!;
    const koniecA = krok(a, 'bake')!.plannedEnd!;
    expect(tytul).toBe(`Piekarnik zajęty o ${formatTime(od)}`);
    // przesunięcie = okno A (45 min nagrzewania + 45 min pieczenia), bez stałej przerwy
    expect(tresc).toBe(
      `${NAZWA} piecze się od ${formatTime(od)} do ${formatTime(koniecA)}. Przesuń start: ${NAZWA} o 90 min, pieczenie od ${formatTime(koniecA + 45 * 60_000)}, gotowe o ${formatTime(a[a.length - 1].plannedEnd! + 90 * 60_000)}.`
    );
    expect(przyciski.map((b) => b.text)).toEqual([`Przesuń start: ${NAZWA} o 90 min`, 'Zapisz bez zmiany', 'Anuluj']);
    expect(przyciski[0].isPreferred).toBe(true);
    expect(przyciski[2].style).toBe('cancel');
    expect(await loadPlannedBakes()).toHaveLength(1);
  });

  it('BR-KAL-016 Drugi wypiek z pełnym nagrzewaniem: „Przesuń start” — nagrzewanie drugiego od końca pieczenia pierwszego, pełne, bez przerwy', async () => {
    const harm = await render();
    const a = await pierwszyPlan(harm);
    await nacisnijPrzycisk(harm, 'plan-zaplanuj-btn');
    await nacisnij(ostatniAlert().przyciski[0]);
    // po przesunięciu piekarnik jest wolny; kroki czynne (garowanie z rękami) mogą dalej nachodzić — to pytanie z D5
    if (alertSpy.mock.calls.length > 1) {
      const d5 = ostatniAlert();
      expect(d5.tytul).toBe('Kroki nachodzą na siebie');
      await nacisnij(d5.przyciski.find((b) => b.text === 'Zaplanuj mimo to'));
    }
    act(() => harm.unmount());
    const plany = await loadPlannedBakes();
    expect(plany).toHaveLength(2);
    const b = plany.find((p) => krok(p.steps, 'preheat_oven')!.plannedStart !== krok(a, 'preheat_oven')!.plannedStart)!;
    const nagrzewanieB = krok(b.steps, 'preheat_oven')!;
    expect(nagrzewanieB.plannedStart).toBe(krok(a, 'bake')!.plannedEnd);
    expect(nagrzewanieB.plannedEnd! - nagrzewanieB.plannedStart!).toBe(45 * 60_000);
    expect(b.plannedStartAt).toBe(b.steps[0].plannedStart);
    expect(b.bake?.steps).toEqual(b.steps);
  });

  it('„Zapisz bez zmiany”: plan zapisany bez przesunięcia i bez drugiego pytania o kroki (jedno pytanie o tę samą kolizję)', async () => {
    const harm = await render();
    const a = await pierwszyPlan(harm);
    await nacisnijPrzycisk(harm, 'plan-zaplanuj-btn');
    await nacisnij(ostatniAlert().przyciski[1]);
    act(() => harm.unmount());
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const plany = await loadPlannedBakes();
    expect(plany).toHaveLength(2);
    expect(plany.every((p) => krok(p.steps, 'preheat_oven')!.plannedStart === krok(a, 'preheat_oven')!.plannedStart)).toBe(true);
  });

  it('„Zacznij wypiek” w oknie zaplanowanego: pytanie o piekarnik z „Przesuń start” (zapis planu) i „Zacznij wypiek” (start bez zmiany)', async () => {
    const harm = await render();
    await pierwszyPlan(harm);
    await act(async () => {
      harm.root.findAll((n) => typeof n.props?.onPress === 'function' && n.props.testID === 'plan-start-bake-btn')[0]?.props.onPress();
    });
    await czekaj();
    const { tytul, przyciski } = ostatniAlert();
    expect(tytul).toMatch(/^Piekarnik zajęty o /);
    expect(przyciski.map((b) => b.text)).toEqual([`Przesuń start: ${NAZWA} o 90 min`, 'Zacznij wypiek', 'Anuluj']);
    expect(getActiveBake()).toBeNull();
    await nacisnij(przyciski[1]);
    act(() => harm.unmount());
    expect(getActiveBake()).not.toBeNull();
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: getActiveBake()!.id } });
  });

  it('zapisany wypiek bez kroku nagrzewania (stary zapis, plan żytni) nie ma okna piekarnika — bez pytania o piekarnik', async () => {
    const harm = await render();
    const a = await pierwszyPlan(harm);
    const [p] = await loadPlannedBakes();
    await deleteBakeSession(p.id);
    await savePlannedBake({ ...p, steps: a.filter((s) => s.category !== 'preheat_oven') });
    await nacisnijPrzycisk(harm, 'plan-zaplanuj-btn');
    act(() => harm.unmount());
    expect(alertSpy.mock.calls.every(([t]) => !String(t).startsWith('Piekarnik zajęty'))).toBe(true);
  });
});
