/**
 * Przesunięcie kroków po spóźnionym „Zrobione” sprawdza godziny snu z Ustawień i oznacza kolizję jak plan
 * (BR-HARMO-004, D-066 1a) [M1-audytor-generalny-130; 01-odkrywanie-501].
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
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { saveBakeSession } from '../data/bake-session-store';
import { _resetGodzinySnu, zapiszProfilSnu } from '../lib/godziny-snu';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import type { SessionStep } from '../core/bake-steps';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  return '';
};
const H = 3_600_000;
const dzien = new Date(2026, 9, 21, 0, 0).getTime();
const krok = (id: string, name: string, isPassive: boolean, odH: number): SessionStep => ({
  id, name, category: isPassive ? 'bulk_ferment' : 'final_shape', durationMin: 60, isPassive, instructions: '',
  plannedStart: dzien + odH * H, plannedEnd: dzien + (odH + 1) * H,
});

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

describe('Prowadzenie: kolizja ze snem po przesunięciu kroków (130)', () => {
  let now = dzien + 13 * H;
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    await initDatabase();
    await saveBakeSession(null);
    _resetGodzinySnu();
    await zapiszProfilSnu('standard');
  });
  afterEach(() => jest.restoreAllMocks());

  it('spóźnione „Zrobione” przenosi krok czynny w godziny snu: kolizja oznaczona jak w planie (BR-HARMO-004 Przesunięcie poza godziny snu)', async () => {
    now = dzien + 13 * H;
    setActiveBake({
      id: 'bake_noc', recipeName: 'Chleb', startedAt: now, currentStageId: 'bulk',
      steps: [krok('bulk', 'Fermentacja burzliwa', true, 13), krok('shape', 'Formowanie ostateczne i koszyk', false, 14), krok('bake', 'Wypiek', false, 15)],
    });
    const tree = await render();
    expect(textOf(tree.toJSON())).not.toMatch(/w nocy/);
    // Krok 1 kończył się o 14:00, użytkownik potwierdza o 22:30: dalsze kroki przesuwają się o 8 h 30 min
    now = dzien + 22.5 * H;
    await act(async () => {
      tree.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    expect(textOf(tree.toJSON())).toMatch(/kroki wypadają w nocy|wypada o \d\d:\d\d w nocy/);
    act(() => tree.unmount());
  });

  it('„Bez godzin snu” w Ustawieniach: to samo przesunięcie bez oznaczenia kolizji', async () => {
    await zapiszProfilSnu('brak');
    now = dzien + 13 * H;
    setActiveBake({
      id: 'bake_bez_snu', recipeName: 'Chleb', startedAt: now, currentStageId: 'bulk',
      steps: [krok('bulk', 'Fermentacja burzliwa', true, 13), krok('shape', 'Formowanie ostateczne i koszyk', false, 14), krok('bake', 'Wypiek', false, 15)],
    });
    const tree = await render();
    now = dzien + 22.5 * H;
    await act(async () => {
      tree.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    expect(textOf(tree.toJSON())).not.toMatch(/w nocy/);
    act(() => tree.unmount());
  });
});
