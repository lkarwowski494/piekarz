/**
 * M1-audytor-generalny-107 (04-studio-projektowe-024; design-spec §11c „107”, makieta docs/design/ekrany/inne.html
 * stan `plan-za-pozno`): gdy początek pierwszego kroku planu jest przed „teraz”, plan pokazuje stan „za późno” z tytułem,
 * treścią z godzinami i „Ustaw tę godzinę”; „Zacznij wypiek” jest nieaktywny z powodem; baner snu ukryty; stan liczony
 * przy zmianach i co minutę; przy otwarciu planu domyślna godzina, która dałaby ten stan, ustępuje najwcześniejszej.
 * Zegar na sztywno (jest fake timers z ustawioną datą).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { getActiveBake, setActiveBake, initDatabase, getStarters, deleteStarter } from '../data/sqlite-store';
import { calculateReverseSchedule } from '../scheduler/reverse-scheduler';
import { stepsFromSchedule } from '../core/bake-steps';
import { setLang } from '../lib/i18n';
import { ustawZakwasPlanu } from '../lib/zakwas-planu';
import {
  ZAOKRAGLENIE_NAJWCZESNIEJ_MIN,
  celGotowosci,
  dzienWZdaniu,
  stanZaPozno,
  tekstZaPozno,
} from '../lib/plan-za-pozno';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const MIN = 60_000;
const H = 60 * MIN;
// Środa 21 października 2026, 20:15 (przykład z §11c „107”)
const TERAZ = new Date(2026, 9, 21, 20, 15, 0, 0).getTime();
const PLAN_27_35 = 27 * H + 35 * MIN;

const krokiPlanu = (startMs: number, koniecMs: number) => [
  { plannedStart: startMs, plannedEnd: startMs + H },
  { plannedStart: startMs + H, plannedEnd: koniecMs },
];

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const teksty = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAll((n) => (n.type as unknown) === 'Text').map((n) => textOf(n.props.children));
const poId = (tree: renderer.ReactTestRenderer, id: string) =>
  tree.root.findAll((n) => n.props?.testID === id && typeof n.props.onPress === 'function');
const przyciskDnia = (tree: renderer.ReactTestRenderer, etykieta: string) =>
  tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children) === etykieta)[0];

async function renderPlan(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<HarmonogramScreen />);
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree!;
}
async function nacisnij(n: renderer.ReactTestInstance) {
  await act(async () => {
    n.props.onPress();
  });
}
const OPCJE = { ambientTemperatureC: 23, coldRetardHours: 14, sleepStartHour: 23, sleepEndHour: 6.5 };

describe('107: czysta funkcja stanu „za późno” i najwcześniejszej godziny (§11c)', () => {
  beforeEach(() => setLang('pl'));

  it('teraz 20:15, plan 27 h 35 min, cel jutro 7:00: start dziś o 3:25, najwcześniej jutro o 23:50', () => {
    const cel = new Date(2026, 9, 22, 7, 0).getTime();
    const stan = stanZaPozno(krokiPlanu(cel - PLAN_27_35, cel), TERAZ);
    expect(stan.zaPozno).toBe(true);
    expect(stan.startMs).toBe(new Date(2026, 9, 21, 3, 25).getTime());
    expect(stan.najwczesniejMs).toBe(new Date(2026, 9, 22, 23, 50).getTime());
    expect(tekstZaPozno(stan, TERAZ)).toEqual({
      tytul: 'Nie zdążysz na tę godzinę',
      tresc: 'Plan musiałby się zacząć dziś o 03:25. Najwcześniej chleb będzie gotowy jutro o 23:50.',
    });
    setLang('en');
    expect(tekstZaPozno(stan, TERAZ)?.tresc).toMatch(
      /^The plan would have to start today at 0?3:25\s?AM\. The earliest the bread can be ready is tomorrow at 11:50\s?PM\.$/,
    );
  });

  it('z dokładnością do minuty; najwcześniej w górę do pełnych 5 minut; bez stanu brak tekstu', () => {
    expect(ZAOKRAGLENIE_NAJWCZESNIEJ_MIN).toBe(5);
    // start w tej samej minucie co teraz (sekundy wcześniej): nie za późno
    const s1 = stanZaPozno(krokiPlanu(TERAZ, TERAZ + PLAN_27_35), TERAZ + 40_000);
    expect(s1.zaPozno).toBe(false);
    expect(tekstZaPozno(s1, TERAZ)).toBeNull();
    // start minutę przed teraz: za późno
    expect(stanZaPozno(krokiPlanu(TERAZ - MIN, TERAZ - MIN + PLAN_27_35), TERAZ).zaPozno).toBe(true);
    // teraz 20:17:30 + 27 h 35 min = 23:52 → 23:55
    const s2 = stanZaPozno(krokiPlanu(TERAZ - H, TERAZ - H + PLAN_27_35), TERAZ + 2 * MIN + 30_000);
    expect(s2.najwczesniejMs).toBe(new Date(2026, 9, 22, 23, 55).getTime());
    // plan bez godzin: brak zostaje brakiem
    expect(stanZaPozno([{ plannedStart: null, plannedEnd: null }], TERAZ)).toEqual({ zaPozno: false, startMs: null, najwczesniejMs: null });
    expect(stanZaPozno([], TERAZ).zaPozno).toBe(false);
  });

  it('dzień w środku zdania: wczoraj, dziś, jutro, pojutrze, dalej „{dzień tygodnia}, {d} {miesiąc}”', () => {
    const teraz = new Date(TERAZ);
    expect(dzienWZdaniu(new Date(2026, 9, 20, 23, 0), teraz)).toBe('wczoraj');
    expect(dzienWZdaniu(new Date(2026, 9, 21, 1, 0), teraz)).toBe('dziś');
    expect(dzienWZdaniu(new Date(2026, 9, 22, 1, 0), teraz)).toBe('jutro');
    expect(dzienWZdaniu(new Date(2026, 9, 23, 1, 0), teraz)).toBe('pojutrze');
    expect(dzienWZdaniu(new Date(2026, 9, 24, 1, 0), teraz)).toBe('sobota, 24 października');
    setLang('en');
    expect(dzienWZdaniu(new Date(2026, 9, 20, 23, 0), teraz)).toBe('yesterday');
    expect(dzienWZdaniu(new Date(2026, 9, 23, 1, 0), teraz)).toBe('the day after tomorrow');
    expect(dzienWZdaniu(new Date(2026, 9, 24, 1, 0), teraz)).toBe('Saturday, October 24');
  });

  it('celGotowosci: dzień względem dziś, godzina i minuta pola „Kiedy chleb ma być gotowy?”', () => {
    expect(celGotowosci(new Date(2026, 9, 22, 23, 50).getTime(), TERAZ)).toEqual({ dayOffset: 1, hour: 23, minute: 50 });
    expect(celGotowosci(new Date(2026, 9, 24, 0, 5).getTime(), TERAZ)).toEqual({ dayOffset: 3, hour: 0, minute: 5 });
  });
});

describe('107: ekran planu w stanie „za późno” (zegar na sztywno: 21.10.2026, 20:15)', () => {
  beforeEach(async () => {
    jest.useFakeTimers({ now: TERAZ, doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    zUprawnieniem();
    setLang('pl');
    setActiveBake(null);
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
    ustawZakwasPlanu(null);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('(3) otwarcie planu: domyślna godzina dałaby „za późno”, więc pole pokazuje najwcześniejszą; stanu nie ma', async () => {
    const tree = await renderPlan();
    expect(teksty(tree)).not.toContain('Nie zdążysz na tę godzinę');
    expect(poId(tree, 'plan-use-earliest-btn')).toHaveLength(0);
    const start = poId(tree, 'plan-start-bake-btn')[0];
    expect(start.props.accessibilityState?.disabled).not.toBe(true);
    await nacisnij(start);
    const steps = getActiveBake()!.steps!;
    // najwcześniej = teraz + długość planu w górę do 5 min, więc start planu w [teraz, teraz + 5 min)
    expect(steps[0].plannedStart!).toBeGreaterThanOrEqual(TERAZ);
    expect(steps[0].plannedStart!).toBeLessThan(TERAZ + 5 * MIN);
    act(() => tree.unmount());
  });

  it('(1, 4) ręczny wybór „jutro 18:00”: tytuł i treść z godzinami planu, start nieaktywny z powodem, baner snu ukryty', async () => {
    const tree = await renderPlan();
    await nacisnij(przyciskDnia(tree, 'Jutro'));
    await nacisnij(przyciskDnia(tree, '18:00'));

    const cel = new Date(2026, 9, 22, 18, 0);
    const schedule = calculateReverseSchedule(cel, OPCJE);
    expect(schedule.hasSleepCollision).toBe(true); // ten cel ma kolizję ze snem: baner musi zniknąć
    const oczekiwany = tekstZaPozno(stanZaPozno(stepsFromSchedule(schedule), TERAZ), TERAZ)!;
    expect(oczekiwany.tresc).toMatch(/^Plan musiałby się zacząć dziś o \d\d:\d\d\. Najwcześniej chleb będzie gotowy pojutrze o \d\d:\d\d\.$/);

    const t = teksty(tree);
    expect(t).toContain('Nie zdążysz na tę godzinę');
    expect(t).toContain(oczekiwany.tresc);
    expect(t).toContain('Najpierw ustaw godzinę, na którą zdążysz.');
    expect(tree.root.findAll((n) => n.props?.testID === 'sleep-guard-banner')).toHaveLength(0);

    const start = poId(tree, 'plan-start-bake-btn')[0];
    expect(start.props.accessibilityState?.disabled).toBe(true);
    expect(start.props.accessibilityHint).toBe('Najpierw ustaw godzinę, na którą zdążysz.');
    await nacisnij(start);
    expect(getActiveBake()).toBeNull();
    act(() => tree.unmount());
  });

  it('(2) „Ustaw tę godzinę” wpisuje najwcześniejszą godzinę: stan znika, „Zacznij wypiek” aktywny', async () => {
    const tree = await renderPlan();
    await nacisnij(przyciskDnia(tree, 'Jutro'));
    await nacisnij(przyciskDnia(tree, '08:00'));
    expect(teksty(tree)).toContain('Nie zdążysz na tę godzinę');
    const ustaw = poId(tree, 'plan-use-earliest-btn');
    expect(ustaw).toHaveLength(1);
    expect(textOf(ustaw[0].props.children)).toBe('Ustaw tę godzinę');
    expect(ustaw[0].props.accessibilityRole).toBe('button');

    await nacisnij(ustaw[0]);
    expect(teksty(tree)).not.toContain('Nie zdążysz na tę godzinę');
    expect(tree.root.findAll((n) => n.props?.testID === 'sleep-guard-banner').length).toBeGreaterThan(0);
    const start = poId(tree, 'plan-start-bake-btn')[0];
    expect(start.props.accessibilityState?.disabled).not.toBe(true);
    await nacisnij(start);
    const steps = getActiveBake()!.steps!;
    expect(steps[0].plannedStart!).toBeGreaterThanOrEqual(TERAZ);
    expect(steps[0].plannedStart!).toBeLessThan(TERAZ + 5 * MIN);
    act(() => tree.unmount());
  });

  it('co minutę: ekran zostawiony otwarty przechodzi w stan „za późno”, gdy start planu minie', async () => {
    const tree = await renderPlan();
    expect(teksty(tree)).not.toContain('Nie zdążysz na tę godzinę');
    await act(async () => {
      jest.advanceTimersByTime(10 * MIN);
    });
    expect(teksty(tree)).toContain('Nie zdążysz na tę godzinę');
    expect(poId(tree, 'plan-start-bake-btn')[0].props.accessibilityState?.disabled).toBe(true);
    act(() => tree.unmount());
  });
});
