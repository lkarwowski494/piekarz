/**
 * Dziennik wypieku nie zapisuje zgadniętych wartości: bez pomiaru temperatura i DDT puste, notatka pusta
 * [M1-audytor-generalny-017; 08-programista-005].
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
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/(tabs)/stolnica';
import { initDatabase, getBakeLogs, setActiveBake, _resetMemStore } from '../data/sqlite-store';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const pressables = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label));

async function finishBakeOnScreen(startFromIdle: boolean): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  if (startFromIdle) {
    await act(async () => {
      pressables(tree!.root, 'Rozpocznij wypiek')[0].props.onPress();
    });
  }
  await act(async () => {
    pressables(tree!.root, 'Studzenie na kratce')[0].props.onPress(); // ostatni etap planu (030)
  });
  await act(async () => {
    tree!.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
  });
  await act(async () => {
    await pressables(tree!.root, 'Zapisz w historii')[0].props.onPress();
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

describe('Bake journal keeps missing values missing (017)', () => {
  beforeEach(async () => {
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });

  it('a bake started on Stolnica without the Calculator saves no temperature, no DDT, an empty note and no invented recipe name', async () => {
    const tree = await finishBakeOnScreen(true);
    const [log] = await getBakeLogs();
    expect(log.ambientTemp).toBeUndefined();
    expect(log.actualDDT).toBeUndefined();
    expect(log.notes).toBeUndefined();
    expect(log.recipeName).not.toBe('Wiejski chleb 72%');
    expect(log.recipeName).toBe('Wypiek bez receptury');
    act(() => tree.unmount());
  });

  it('a bake handed over without a measured DDT saves no DDT and the live card shows "—" instead of 25°C', async () => {
    setActiveBake({ id: 'bake_x', recipeName: 'Mój chleb', startedAt: 1, currentStageId: 'step_1', ambientTempC: 21 });
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<StolnicaScreen />);
    });
    await act(async () => {
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    const card = tree!.root.findByProps({ testID: 'stat-stolnica-ddt' });
    expect(card.props.value).toBe('—');
    act(() => tree!.unmount());

    const done = await finishBakeOnScreen(false);
    const [log] = await getBakeLogs();
    expect(log.actualDDT).toBeUndefined();
    expect(log.ambientTemp).toBe(21);
    act(() => done.unmount());
  });

  it('the note field starts empty again after saving a bake', async () => {
    const tree = await finishBakeOnScreen(true);
    await act(async () => {
      pressables(tree.root, 'Rozpocznij wypiek')[0].props.onPress();
    });
    await act(async () => {
      pressables(tree.root, 'Studzenie na kratce')[0].props.onPress(); // ostatni etap planu (030)
    });
    await act(async () => {
      tree.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
    });
    const notesInputs = tree.root.findAll((n) => n.props?.placeholder === 'Wpisz swoje uwagi (miękisz, skórka, czas pieca)...' && 'value' in n.props);
    expect(notesInputs.length).toBeGreaterThan(0);
    expect(notesInputs[0].props.value).toBe('');
    act(() => tree.unmount());
  });
});
