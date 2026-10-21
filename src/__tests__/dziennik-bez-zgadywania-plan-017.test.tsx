/**
 * Droga planu nie zapisuje zgadniętej temperatury otoczenia jako pomiaru [M1-audytor-generalny-017; 08-programista-005]:
 * Harmonogram → „Zacznij wypiek” → Stolnica → ocena i zapis do dziennika. Bez dotknięcia temperatury w planie wpis ma
 * brak (ambientTemp undefined), a nie 23 °C z założenia modelu; wybrana przez użytkownika temperatura trafia do wpisu.
 * Zegar ustawiony na kilka godzin doby (SYS-06): plan i stan „za późno” zależą od godziny.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
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
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, getActiveBake, setActiveBake, getBakeLogs } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!;
}
async function pressId(tree: renderer.ReactTestRenderer, testID: string): Promise<void> {
  const all = tree.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
  expect(all.length).toBeGreaterThan(0);
  await act(async () => {
    await all[all.length - 1].props.onPress();
  });
  await flush();
}
async function pressText(tree: renderer.ReactTestRenderer, label: string): Promise<void> {
  const all = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children) === label);
  expect(all.length).toBeGreaterThan(0);
  await act(async () => {
    await all[all.length - 1].props.onPress();
  });
  await flush();
}

/** Stolnica od pierwszego kroku do zapisu oceny. */
async function dokonczWypiek(): Promise<void> {
  const tree = await render(<StolnicaScreen />);
  for (let i = 0; i < 40 && !textOf(tree.toJSON()).includes('Oceń bochenek'); i++) await pressId(tree, 'next-or-finish-step-btn');
  await pressText(tree, 'Zapisz');
  act(() => tree.unmount());
}

const PORY = [
  ['08:00', new Date(2026, 9, 21, 8, 0).getTime()],
  ['14:00', new Date(2026, 9, 21, 14, 0).getTime()],
  ['23:55', new Date(2026, 9, 21, 23, 55).getTime()],
] as const;

describe.each(PORY)('Dziennik z drogi planu, zegar %s (017)', (_pora, start) => {
  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => start);
    _resetMemStore();
    setActiveBake(null);
    await saveBakeSession(null);
    await initDatabase();
    zUprawnieniem();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('bez dotknięcia temperatury w planie: wypiek i wpis dziennika bez temperatury otoczenia i bez DDT', async () => {
    const plan = await render(<HarmonogramScreen />);
    await pressId(plan, 'plan-start-bake-btn');
    act(() => plan.unmount());
    expect(getActiveBake()?.ambientTempC).toBeUndefined();
    await dokonczWypiek();
    const [wpis] = await getBakeLogs();
    expect(wpis).toBeDefined();
    expect(wpis.ambientTemp).toBeUndefined();
    expect(wpis.actualDDT).toBeUndefined();
    expect(wpis.notes).toBeUndefined();
  });

  it('temperatura wybrana przez użytkownika w planie trafia do wypieku i dziennika', async () => {
    const plan = await render(<HarmonogramScreen />);
    await pressText(plan, '26°C');
    await pressId(plan, 'plan-start-bake-btn');
    act(() => plan.unmount());
    expect(getActiveBake()?.ambientTempC).toBe(26);
    await dokonczWypiek();
    const [wpis] = await getBakeLogs();
    expect(wpis.ambientTemp).toBe(26);
  });
});
