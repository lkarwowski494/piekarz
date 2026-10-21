/**
 * Zdanie, po co są powiadomienia, przed systemową prośbą o zgodę (makieta `prowadzenie.html`, stan `zgoda`;
 * design-spec §5 „prośba o zgodę — po co, jednym zdaniem”) [M1-audytor-generalny-130; 01-odkrywanie-501].
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
import * as Notifications from 'expo-notifications';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { saveBakeSession } from '../data/bake-session-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const mock = (Notifications as unknown as { __mock: { iosStatus: number; grantOnRequest: boolean } }).__mock;
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  return '';
};

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

describe('Zgoda na powiadomienia w prowadzeniu (130)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    jest.clearAllMocks();
    await initDatabase();
    await saveBakeSession(null);
    setActiveBake({ id: 'bake_zgoda', recipeName: 'Pierwszy wypiek', startedAt: Date.now(), currentStageId: 'mix' });
  });

  it('pierwszy wypiek bez decyzji o zgodzie: najpierw zdanie „po co”, prośba systemowa dopiero po „Dalej” (BR-CZAS-003 Wyjaśnienie przed prośbą)', async () => {
    mock.iosStatus = 0;
    const tree = await render();
    const tekst = textOf(tree.toJSON());
    expect(tekst).toContain('Dam znać o każdym kroku');
    expect(tekst).toContain('Gdy telefon śpi, powiadomienie powie, co i kiedy zrobić. Za chwilę telefon zapyta o zgodę.');
    expect(textOf(tree.root.findByProps({ testID: 'zgoda-dalej-btn' }).children)).toBe('Dalej');
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    await act(async () => {
      tree.root.findByProps({ testID: 'zgoda-dalej-btn' }).props.onPress();
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(textOf(tree.toJSON())).not.toContain('Za chwilę telefon zapyta o zgodę.');
    act(() => tree.unmount());
  });

  it('zgoda już udzielona albo odmówiona: bez zdania i bez prośby', async () => {
    for (const status of [2, 1]) {
      mock.iosStatus = status;
      const tree = await render();
      expect(textOf(tree.toJSON())).not.toContain('Za chwilę telefon zapyta o zgodę.');
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
      act(() => tree.unmount());
      await saveBakeSession(null);
      setActiveBake({ id: `bake_${status}`, recipeName: 'Wypiek', startedAt: Date.now(), currentStageId: 'mix' });
    }
  });
});
