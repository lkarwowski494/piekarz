/**
 * Plan wypieku na przyszłe dni (M3 D5; D-092, D-108; BR-KAL-009, BR-KAL-015): dzień „gotowe” od dziś do 14 dni,
 * „Zaplanuj” obok „Zacznij wypiek” zapisuje niezaczęty wypiek (wiersz `planned` z danymi wypieku), limit 5 planów
 * z przejściem do listy na „Dziś”, kolizja kroków czynnych z innym planem z nazwą kroku i godziną — zapis dopiero po
 * decyzji; dzień ze skrótu arkusza dnia trafia do pola „gotowe”.
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
import { initDatabase, setActiveBake, _resetMemStore, getStarters, deleteStarter } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { deleteBakeSession, loadPlannedBakes, savePlannedBake } from '../data/bake-sessions-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
import { setLang } from '../lib/i18n';
import { formatDzienData } from '../lib/format';
import { ustawDzienGotowe } from '../lib/plan-receptury';
import { addCalendarDays, startOfLocalDay } from '../core/dzien-lokalny';
import { MAX_ZAPLANOWANYCH_WYPIEKOW } from '../core/limity-wypiekow';
import { ZASIEG_DNI_PLANU } from '../core/kalendarz-config';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
/** Przycisk (Pressable z rolą) o testID — bez komponentów-opakowań, które dostają te same propsy. */
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

type Przycisk = { text: string; style?: string; onPress?: () => void };
let alertSpy: jest.SpyInstance;
const ostatniAlert = () => {
  const [tytul, tresc, przyciski] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string | undefined, Przycisk[]];
  return { tytul, tresc, przyciski };
};

async function zaplanuj(harm: renderer.ReactTestRenderer) {
  const [p] = poId(harm.root, 'plan-zaplanuj-btn');
  expect(p).toBeDefined();
  await act(async () => {
    p.props.onPress();
  });
  await czekaj();
}

describe('D5: plan wypieku na przyszłe dni', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    ustawDzienGotowe(null);
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

  it('D-108 dzień „gotowe”: dziś i kolejne 14 dni do wyboru; dzień 5 pokazuje dzień tygodnia z datą', async () => {
    const harm = await render();
    const dni = Array.from({ length: ZASIEG_DNI_PLANU + 1 }, (_, i) => poId(harm.root, `plan-dzien-${i}`));
    expect(dni.map((d) => d.length)).toEqual(Array(ZASIEG_DNI_PLANU + 1).fill(1));
    expect(poId(harm.root, `plan-dzien-${ZASIEG_DNI_PLANU + 1}`)).toHaveLength(0);
    expect(['Dziś', 'Jutro', 'Pojutrze'].map((d, i) => textOf(dni[i][0].props.children))).toEqual(['Dziś', 'Jutro', 'Pojutrze']);
    await act(async () => {
      dni[5][0].props.onPress();
    });
    const dzien = formatDzienData(new Date(addCalendarDays(startOfLocalDay(Date.now()), 5)));
    expect(textOf(harm.root.findByProps({ testID: 'plan-pole-gotowosci' }).props.children)).toContain(dzien);
    expect(dni[5][0].props.accessibilityState).toEqual({ selected: true });
    act(() => harm.unmount());
  });

  it('BR-KAL-015 dzień ze skrótu arkusza dnia trafia do pola „gotowe” (raz)', async () => {
    const dzien = addCalendarDays(startOfLocalDay(Date.now()), 6);
    ustawDzienGotowe(dzien);
    const harm = await render();
    expect(textOf(harm.root.findByProps({ testID: 'plan-pole-gotowosci' }).props.children)).toContain(formatDzienData(new Date(dzien)));
    act(() => harm.unmount());
    const drugi = await render();
    // drugi plan bez skrótu: domyślny dzień (jutro albo najbliższy bez „za późno”), nie dzień ze skrótu
    expect(textOf(drugi.root.findByProps({ testID: 'plan-pole-gotowosci' }).props.children)).not.toContain(formatDzienData(new Date(dzien)));
    act(() => drugi.unmount());
  });

  it('BR-KAL-009 „Zaplanuj”: zapis niezaczętego wypieku z danymi planu, powiadomienia, przejście na „Dziś”', async () => {
    const harm = await render();
    await ustawGodzinePlanu(harm.root, 'Pojutrze', 12, 0);
    await zaplanuj(harm);
    act(() => harm.unmount());
    expect(alertSpy).not.toHaveBeenCalled();
    const plany = await loadPlannedBakes();
    expect(plany).toHaveLength(1);
    const [p] = plany;
    expect(p.plannedStartAt).toBe(p.steps[0].plannedStart);
    expect(p.plannedStartAt).toBeGreaterThan(Date.now());
    expect(p.bake).toEqual(expect.objectContaining({ id: p.id, recipeName: p.recipeName, currentStageId: p.steps[0].id }));
    expect(p.bake?.steps).toEqual(p.steps);
    expect(mockResync).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
    // nic nie trwa: plan to nie start
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('BR-KAL-009 limit 5 planów: „Masz już 5 planów” z przejściem do listy, szósty nie zapisany', async () => {
    const daleko = Date.now() + 10 * 86_400_000;
    for (let n = 0; n < MAX_ZAPLANOWANYCH_WYPIEKOW; n++) {
      const start = daleko + n * 3_600_000;
      await savePlannedBake({ version: 1, id: `p${n}`, recipeName: `Plan ${n}`, plannedStartAt: start, steps: [{ id: 'mix', name: 'Mieszanie ciasta', category: 'mix', durationMin: 10, isPassive: false, instructions: '', plannedStart: start, plannedEnd: start + 600_000 }] });
    }
    const harm = await render();
    await ustawGodzinePlanu(harm.root, 'Pojutrze', 12, 0);
    await zaplanuj(harm);
    const a = ostatniAlert();
    expect(a.tytul).toBe('Masz już 5 planów');
    expect(a.przyciski.map((b) => b.text)).toEqual(['Pokaż plany', 'Anuluj']);
    act(() => a.przyciski[0].onPress?.());
    expect(mockNavigate).toHaveBeenCalledWith('/');
    act(() => harm.unmount());
    expect(await loadPlannedBakes()).toHaveLength(MAX_ZAPLANOWANYCH_WYPIEKOW);
  });

  it('BR-KAL-009 Kolizja planów: kroki czynne w tej samej godzinie — nazwa kroku i godzina, zapis dopiero po decyzji', async () => {
    const harm = await render();
    await ustawGodzinePlanu(harm.root, 'Pojutrze', 12, 0);
    await zaplanuj(harm);
    expect(await loadPlannedBakes()).toHaveLength(1);
    // Zmiana testu w D6 (BR-KAL-016, RD-34): dwa takie same plany zajmują też piekarnik w tym samym oknie, a kolizja
    // piekarnika ma od D6 własne, mocniejsze pytanie (src/__tests__/harmonogram-piekarnik-d6.test.tsx). Tu pierwszy plan
    // bez kroków piekarnika (jak stary zapis), żeby test dalej sprawdzał samą kolizję kroków czynnych z D5.
    const [pierwszy] = await loadPlannedBakes();
    await deleteBakeSession(pierwszy.id);
    await savePlannedBake({ ...pierwszy, steps: pierwszy.steps.filter((s) => s.category !== 'preheat_oven' && s.category !== 'bake') });
    // drugi taki sam plan: każdy krok czynny nachodzi na krok pierwszego
    await zaplanuj(harm);
    const a = ostatniAlert();
    expect(a.tytul).toBe('Kroki nachodzą na siebie');
    expect(a.tresc).toMatch(/ o \d{1,2}:\d{2}: w tym czasie .+: /);
    expect(a.przyciski.map((b) => b.text)).toEqual(['Anuluj', 'Zaplanuj mimo to']);
    expect(await loadPlannedBakes()).toHaveLength(1);
    await act(async () => {
      a.przyciski[1].onPress?.();
    });
    await czekaj();
    act(() => harm.unmount());
    expect(await loadPlannedBakes()).toHaveLength(2);
  });
});
