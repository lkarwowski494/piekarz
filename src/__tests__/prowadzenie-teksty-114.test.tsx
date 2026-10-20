/**
 * M1-audytor-generalny-114 (04-studio-projektowe-029; design-spec §11b „056”, makieta docs/design/ekrany/prowadzenie.html):
 * teksty prowadzenia według makiety, z placeholderami i liczbą mnogą przez mechanizm i18n. Strefa planu: „Gotowe {dzień}
 * o {godzina}” pod „Krok n z N”. Strefa kroku: czas w minutach („18 min”, sekundy tylko w ostatniej minucie, po czasie
 * „{n} min po czasie”), „do {godzina}, potem {następny krok}” (po czasie „Potem: {krok}, {czas}, do {godzina}”),
 * „Ekran nie zgaśnie do końca kroku. Powiadomienie o {godzina}.” tylko w kroku czynnym (nie biernym) przy zgodzie na powiadomienia.
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
import * as Notifications from 'expo-notifications';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps, type SessionStep } from '../core/bake-steps';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang, t } from '../lib/i18n';
import { formatTime } from '../lib/format';
import { czasKroku, tekstyProwadzenia } from '../lib/prowadzenie-teksty';

const mock = (Notifications as unknown as { __mock: { pending: Map<string, unknown>; iosStatus: number } }).__mock;
const MIN = 60_000;
const NBSP = ' ';
const T0 = new Date(2026, 9, 21, 8, 0).getTime();
const steps: SessionStep[] = planBakeSteps({ startAt: T0, isHighRye: false });
const KONIEC = steps[steps.length - 1].plannedEnd as number;
const idx = (category: string) => steps.findIndex((s) => s.category === category);
const koniec = (i: number) => steps[i].plannedEnd as number;
const poczatek = (i: number) => steps[i].plannedStart as number;
const mala = (s: string) => s.charAt(0).toLocaleLowerCase() + s.slice(1);

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  return '';
};

let now = T0;

async function prowadzenie(stepIdx: number, timerEndsAt: number | null, teraz: number) {
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
  const el = (id: string) => tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
  const tekst = (id: string) => (el(id)[0] ? textOf(el(id)[0]) : null);
  const wynik = {
    gotowe: tekst('plan-ready'),
    czas: tekst('step-time'),
    czasEtykieta: el('step-time')[0]?.props.accessibilityLabel ?? null,
    potem: tekst('step-next'),
    ekran: tekst('step-screen-on'),
  };
  act(() => tree.unmount());
  return wynik;
}

describe('114: teksty prowadzenia według makiety', () => {
  beforeAll(() => {
    useTempDbDir();
  });
  beforeEach(async () => {
    zUprawnieniem();
    setLang('pl');
    mock.pending.clear();
    mock.iosStatus = 2;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    await initDatabase();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    setLang('pl');
  });

  it('plan kończy się następnego dnia (dane testu)', () => {
    expect(new Date(KONIEC).getDate()).toBe(22);
    expect(steps[0].isPassive).toBe(true);
    expect(steps[idx('mix')].isPassive).toBe(false);
  });

  it('krok bierny z czasem: „Gotowe jutro o …”, czas w godzinach i minutach, „do …, potem …”, bez zdania o ekranie', async () => {
    const w = await prowadzenie(0, koniec(0), T0 + 2 * MIN);
    expect(w.gotowe).toBe(`Gotowe jutro o ${formatTime(KONIEC)}`);
    expect(w.czas).toBe(`5${NBSP}h${NBSP}58${NBSP}min`);
    expect(w.czasEtykieta).toBe('5 godzin 58 minut');
    expect(w.potem).toBe(`do ${formatTime(koniec(0))}, potem ${mala(t(steps[1].name))}`);
    expect(w.potem).toMatch(/, potem \p{Ll}/u);
    expect(w.ekran).toBeNull();
  });

  it('krok czynny przy zgodzie na powiadomienia: „18 min”-owy czas i zdanie o ekranie z godziną powiadomienia', async () => {
    const i = idx('mix');
    const w = await prowadzenie(i, koniec(i), poczatek(i) + 30_000);
    expect(w.czas).toBe(`15${NBSP}min`);
    expect(w.czasEtykieta).toBe('15 minut');
    expect(w.potem).toBe(`do ${formatTime(koniec(i))}, potem ${mala(t(steps[i + 1].name))}`);
    expect(w.ekran).toBe(`Ekran nie zgaśnie do końca kroku. Powiadomienie o ${formatTime(koniec(i))}.`);
    expect(w.gotowe).toBe(`Gotowe jutro o ${formatTime(KONIEC)}`);
  });

  it('krok czynny bez zgody na powiadomienia: bez zdania o ekranie (makieta „brak-zgody”)', async () => {
    mock.iosStatus = 1;
    const i = idx('mix');
    const w = await prowadzenie(i, koniec(i), poczatek(i) + 30_000);
    expect(w.ekran).toBeNull();
    expect(w.potem).not.toBeNull();
  });

  it('ostatnia minuta: sekundy („45 s”, VoiceOver „45 sekund”)', async () => {
    const i = idx('mix');
    const w = await prowadzenie(i, koniec(i), koniec(i) - 45_000);
    expect(w.czas).toBe(`45${NBSP}s`);
    expect(w.czasEtykieta).toBe('45 sekund');
  });

  it('po czasie: „2 min po czasie” i „Potem: {krok}, {czas}, do {godzina}” od teraz', async () => {
    const i = idx('mix');
    const teraz = koniec(i) + 130_000;
    const w = await prowadzenie(i, koniec(i), teraz);
    expect(w.czas).toBe(`2${NBSP}min po czasie`);
    expect(w.czasEtykieta).toBe('2 minuty po czasie');
    expect(w.potem).toBe(`Potem: ${mala(t(steps[i + 1].name))}, 4${NBSP}h, do ${formatTime(teraz + 240 * MIN)}`);
    expect(w.ekran).toBeNull();
  });

  it('krok w garnku (faza pod pokrywą): „do …, potem pieczenie bez pokrywy”', async () => {
    const i = idx('bake');
    const teraz = poczatek(i) + MIN;
    const w = await prowadzenie(i, poczatek(i) + 20 * MIN, teraz);
    expect(w.czas).toBe(`19${NBSP}min`);
    expect(w.potem).toBe(`do ${formatTime(poczatek(i) + 20 * MIN)}, potem pieczenie bez pokrywy`);
    expect(w.ekran).toBe(`Ekran nie zgaśnie do końca kroku. Powiadomienie o ${formatTime(poczatek(i) + 20 * MIN)}.`);
    expect(w.gotowe).toBe(`Gotowe dziś o ${formatTime(KONIEC)}`);
  });

  it('ostatni krok: „do {godzina}” bez następnego kroku', async () => {
    const i = steps.length - 1;
    const w = await prowadzenie(i, koniec(i), poczatek(i) + MIN);
    expect(w.potem).toBe(`do ${formatTime(koniec(i))}`);
  });

  it('EN: Ready …, until …, then …, The screen will stay on…', async () => {
    setLang('en');
    const i = idx('mix');
    const w = await prowadzenie(i, koniec(i), poczatek(i) + 30_000);
    expect(w.gotowe).toBe(`Ready tomorrow at ${formatTime(KONIEC)}`);
    expect(w.czas).toBe(`15${NBSP}min`);
    expect(w.czasEtykieta).toBe('15 minutes');
    expect(w.potem).toBe(`until ${formatTime(koniec(i))}, then ${mala(t(steps[i + 1].name))}`);
    expect(w.ekran).toBe(`The screen will stay on until the step ends. Notification at ${formatTime(koniec(i))}.`);
  });

  it('brak zostaje brakiem: plan bez godzin bez „Gotowe…”, krok bez czasu bez zegara, z „Potem: {krok}”', () => {
    const bezGodzin = steps.map((s) => ({ ...s, plannedStart: null, plannedEnd: null }));
    const bezCzasu = bezGodzin.map((s, i) => (i === 0 ? { ...s, durationMin: null } : s));
    const w = tekstyProwadzenia({ steps: bezCzasu, stepIdx: 0, dutchOvenPhase: 'lid_on', koniecKrokuMs: null, teraz: T0, zgodaPowiadomien: true });
    expect(w).toEqual({ gotowe: null, czas: null, potem: `Potem: ${mala(t(steps[1].name))}`, ekran: null });
    expect(tekstyProwadzenia({ steps: [], stepIdx: 0, dutchOvenPhase: 'lid_on', koniecKrokuMs: null, teraz: T0, zgodaPowiadomien: true }))
      .toEqual({ gotowe: null, czas: null, potem: null, ekran: null });
  });

  it('czas kroku: minuty w górę, sekundy tylko w ostatniej minucie, godziny bez ułamków; liczba mnoga w etykiecie', () => {
    expect(czasKroku(18 * 60)).toEqual({ tekst: `18${NBSP}min`, etykieta: '18 minut' });
    expect(czasKroku(17 * 60 + 1).tekst).toBe(`18${NBSP}min`);
    expect(czasKroku(60)).toEqual({ tekst: `1${NBSP}min`, etykieta: '1 minuta' });
    expect(czasKroku(59)).toEqual({ tekst: `59${NBSP}s`, etykieta: '59 sekund' });
    expect(czasKroku(2)).toEqual({ tekst: `2${NBSP}s`, etykieta: '2 sekundy' });
    expect(czasKroku(1)).toEqual({ tekst: `1${NBSP}s`, etykieta: '1 sekunda' });
    expect(czasKroku(3600)).toEqual({ tekst: `1${NBSP}h`, etykieta: '1 godzina' });
    expect(czasKroku(3601).tekst).toBe(`1${NBSP}h${NBSP}1${NBSP}min`);
    expect(czasKroku(22 * 60).etykieta).toBe('22 minuty');
  });
});
