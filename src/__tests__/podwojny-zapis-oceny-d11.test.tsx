/**
 * Audyt niezależny D-11: dwa szybkie stuknięcia „Zapisz” w arkuszu oceny zapisywały wypiek dwa razy (dwa wpisy
 * Dziennika, licznik wypieków +2, mąka odliczona dwa razy) albo, gdy druga transakcja trafiała na pierwszą, kończyły
 * się fałszywym komunikatem „Nie zapisano”. Teraz drugie stuknięcie w trakcie zapisu nic nie robi
 * [audyt-niezalezny D-11].
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
jest.mock('expo-router', () => ({
  Stack: { Screen: ({ options }: { options?: { headerRight?: () => React.ReactElement } }) => (options?.headerRight ? options.headerRight() : null) },
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake, getBakeLogs } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { FinishBakeModal } from '../components/stolnica/FinishBakeModal';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const pressables = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label));

describe('D-11: jeden zapis oceny przy dwóch stuknięciach', () => {
  beforeAll(() => useTempDbDir());
  beforeEach(async () => {
    zUprawnieniem();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await initDatabase();
    setActiveBake({ id: 'bake_d11', recipeName: 'Chleb', startedAt: 1, currentStageId: 'mix', ambientTempC: 22 });
  });
  afterEach(() => jest.restoreAllMocks());

  it('two taps on "Save" before the save finishes: one journal entry', async () => {
    const przed = (await getBakeLogs()).length;
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => { tree = renderer.create(<StolnicaScreen />); });
    await act(async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); });
    await act(async () => { pressables(tree!.root, 'Plan wypieku')[0].props.onPress(); });
    await act(async () => { pressables(tree!.root, 'Studzenie na kratce')[0].props.onPress(); });
    await act(async () => { tree!.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress(); });
    const zapisz = tree!.root.findByType(FinishBakeModal).props.onSave;
    // Każde stuknięcie w innej milisekundzie: osobne id wpisu (bake_<czas>), jak na telefonie
    let zegar = 1_800_000_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => (zegar += 250));
    await act(async () => {
      const a = zapisz();
      const b = zapisz();
      await Promise.all([a, b]);
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    act(() => tree!.unmount());
    expect((await getBakeLogs()).length).toBe(przed + 1);
    // Drugie stuknięcie nie kończy się komunikatem „Nie zapisano” (druga transakcja w trakcie pierwszej)
    expect((Alert.alert as jest.Mock).mock.calls.filter((c) => c[0] === 'Nie zapisano')).toEqual([]);
  });
});
