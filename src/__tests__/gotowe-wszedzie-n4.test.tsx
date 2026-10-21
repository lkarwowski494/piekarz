/**
 * Reaudit noc N-4 (M1-audytor-generalny-151): krok 90 min po czasie przesuwa godzinę „gotowe” we wszystkich trzech
 * miejscach naraz: tekst prowadzenia (`plan-ready`), etykieta VoiceOver Spirali na prowadzeniu i karta „Trwa wypiek”
 * na Starcie (tekst i etykieta małej Spirali). Jedna funkcja `gotoweMs` (src/lib/gotowe.ts). Plan startuje o 8:00,
 * 14:00 i 23:55 czasu lokalnego; godzina-wyrocznia przez Intl w strefie procesu, nie stała.
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
import { TrwajacyWypiek } from '../components/start/TrwajacyWypiek';
import { initDatabase } from '../data/sqlite-store';
import { saveBakeSession, type BakeSession } from '../data/bake-session-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps } from '../core/bake-steps';
import { restoreTimerState } from '../core/bake-session';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';
import { gotoweMs } from '../lib/gotowe';

const MIN = 60_000;
const PORY: ReadonlyArray<[number, number]> = [[8, 0], [14, 0], [23, 55]];
const godzinaWyrocznia = (ms: number) => new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' }).format(new Date(ms));

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  return '';
};

function dane(godz: number, min: number) {
  const T0 = new Date(2026, 9, 21, godz, min).getTime();
  const steps = planBakeSteps({ startAt: T0, isHighRye: false });
  const koniecPlanu = steps[steps.length - 1].plannedEnd as number;
  const koniecKroku = steps[0].plannedEnd as number;
  const teraz = koniecKroku + 90 * MIN;
  const sesja: BakeSession = {
    version: 2, steps, stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: koniecKroku, pausedLeftSec: null,
    recipeName: `${'Chleb testowy'}`, startedAt: T0, bake: null,
  };
  return { T0, steps, koniecPlanu, koniecKroku, teraz, sesja, oczekiwane: teraz + (koniecPlanu - koniecKroku) };
}

let now = 0;

describe('N-4: „gotowe” po czasie jednakowo w prowadzeniu, Spirali i na Starcie', () => {
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

  it.each(PORY)('gotoweMs: krok 90 min po czasie (start %i:%i) = teraz + reszta planu; w czasie = koniec planu', (g, m) => {
    const d = dane(g, m);
    expect(gotoweMs({ steps: d.steps, stepIdx: 0, koniecKrokuMs: d.koniecKroku, teraz: d.teraz })).toBe(d.oczekiwane);
    expect(gotoweMs({ steps: d.steps, stepIdx: 0, koniecKrokuMs: d.koniecKroku, teraz: d.T0 + MIN })).toBe(d.koniecPlanu);
    expect(gotoweMs({ steps: d.steps, stepIdx: 0, koniecKrokuMs: null, teraz: d.teraz })).toBe(d.koniecPlanu);
  });

  it.each(PORY)('prowadzenie: tekst i etykieta Spirali z nową godziną (start %i:%i)', async (g, m) => {
    const d = dane(g, m);
    now = d.teraz;
    await saveBakeSession(d.sesja);
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<StolnicaScreen />);
    });
    await act(async () => {
      for (let i = 0; i < 60; i++) await new Promise((r) => setImmediate(r));
    });
    const el = (id: string) => tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === id)[0];
    const nowa = godzinaWyrocznia(d.oczekiwane);
    const stara = godzinaWyrocznia(d.koniecPlanu);
    expect(textOf(el('plan-ready'))).toContain(nowa);
    const etykieta = String(el('brand-spiral').props.accessibilityLabel);
    expect(etykieta).toContain(nowa);
    expect(etykieta).not.toContain(stara);
    act(() => tree.unmount());
  });

  it.each(PORY)('Start, karta „Trwa wypiek”: tekst i etykieta małej Spirali z nową godziną (start %i:%i)', (g, m) => {
    const d = dane(g, m);
    now = d.teraz;
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TrwajacyWypiek sesja={d.sesja} zegar={restoreTimerState(d.sesja, d.teraz)} teraz={d.teraz} onWroc={() => undefined} />,
      );
    });
    const karta = tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'start-trwa-wypiek')[0];
    const spirala = tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'brand-spiral')[0];
    const nowa = godzinaWyrocznia(d.oczekiwane);
    const stara = godzinaWyrocznia(d.koniecPlanu);
    expect(textOf(karta)).toContain(nowa);
    expect(textOf(karta)).not.toContain(stara);
    expect(String(spirala.props.accessibilityLabel)).toContain(nowa);
    act(() => tree.unmount());
  });
});
