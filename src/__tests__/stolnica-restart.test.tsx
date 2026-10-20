/**
 * Trwający wypiek przeżywa zabicie procesu: Stolnica wraca do bieżącego kroku z poprawnym czasem
 * [M1-audytor-generalny-019; 01-odkrywanie-005, 05-architekt-006, 12-niezawodnosc-007, 08-programista-008].
 * Zabicie procesu = wyczyszczona pamięć aplikacji (_resetMemStore), plik bazy zostaje.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
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
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps } from '../core/bake-steps';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const button = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label))[0];

async function render(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

describe('Active bake survives a process kill (019)', () => {
  let now = 1_800_000_000_000;
  beforeEach(async () => {
    useTempDbDir();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    await initDatabase();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('after a kill and restart, Stolnica returns to step 3 with the running timer 60 s shorter', async () => {
    setActiveBake({
      id: 'bake_live',
      recipeName: 'Chleb na restart',
      startedAt: now,
      currentStageId: 'mix',
      ambientTempC: 22,
      actualDdtC: 25,
    });
    const first = await render();
    for (let i = 0; i < 2; i++) {
      await act(async () => {
        button(first.root, 'Zrobione').props.onPress();
      });
    }
    await act(async () => {
      button(first.root, 'Start').props.onPress();
    });
    await act(async () => {
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    act(() => first.unmount());

    // Zabicie procesu: pamięć znika, plik bazy zostaje; mija minuta
    _resetMemStore();
    now += 60_000;

    const second = await render();
    const text = textOf(second.toJSON());
    expect(text).toContain('Chleb na restart');
    // Kroki z planu liczonego od startu wypieku [M1-audytor-generalny-030]
    const step3 = planBakeSteps({ startAt: now - 60_000, isHighRye: false, ambientTempC: 22 })?.[2];
    expect(text).toContain(step3?.name ?? '?');
    expect(text).toContain(`${String((step3?.durationMin ?? 0) - 1).padStart(2, '0')}:00`);
    expect(button(second.root, 'Wstrzymaj')).toBeDefined();
    act(() => second.unmount());
  });
});
