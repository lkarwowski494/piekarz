/**
 * BR-DIAG-001, kryteria 1–2 (F-43, ZM-07; D-034 wybór 3a): po zapisaniu oceny ≤ 2★ Stolnica proponuje
 * Doktora; przy 3★ i wyżej nie. Wpis w dzienniku zapisuje się tak samo [M1-audytor-generalny-032; 03-zakres-013].
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
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));

import React from 'react';
import { Alert, AlertButton } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/(tabs)/stolnica';
import { initDatabase, setActiveBake, getBakeLogs } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { shouldSuggestDoctor, suggestDoctorAfterRating, DOCTOR_SUGGESTION_MAX_STARS } from '../lib/doctor-suggestion';
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

const SUGGESTION_TITLE = 'Sprawdzić przyczynę w Doktorze?';

async function finishWithRating(stars: number): Promise<void> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  await act(async () => {
    pressables(tree!.root, 'Studzenie na kratce')[0].props.onPress();
  });
  await act(async () => {
    tree!.root.findByProps({ testID: 'next-or-finish-step-btn' }).props.onPress();
  });
  await act(async () => {
    tree!.root.findByProps({ testID: `finish-rating-star-${stars}` }).props.onPress();
  });
  await act(async () => {
    await pressables(tree!.root, 'Zapisz')[0].props.onPress();
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  act(() => tree!.unmount());
}

const suggestionCalls = (alert: jest.SpyInstance) => alert.mock.calls.filter((c) => c[0] === SUGGESTION_TITLE);

describe('Doctor suggestion after a weak rating (BR-DIAG-001)', () => {
  beforeAll(() => {
    useTempDbDir();
  });
  beforeEach(async () => {
    zUprawnieniem();
    mockPush.mockClear();
    await initDatabase();
    setActiveBake({ id: 'bake_live', recipeName: 'Chleb', startedAt: 1, currentStageId: 'mix', ambientTempC: 22, actualDdtC: 25 });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('threshold is 2 stars: 1 and 2 suggest, 3 to 5 do not', () => {
    expect(DOCTOR_SUGGESTION_MAX_STARS).toBe(2);
    expect([1, 2, 3, 4, 5].map(shouldSuggestDoctor)).toEqual([true, true, false, false, false]);
  });

  it('suggestDoctorAfterRating asks only at 2 stars or less and calls the guarded opener on accept', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const open = jest.fn();
    suggestDoctorAfterRating(3, open);
    expect(alert).not.toHaveBeenCalled();
    suggestDoctorAfterRating(2, open);
    expect(alert).toHaveBeenCalledTimes(1);
    (alert.mock.calls[0][2] as AlertButton[])[1].onPress?.();
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('2 stars: the bake is saved, then the suggestion opens the Doctor', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const before = (await getBakeLogs()).length;
    await finishWithRating(2);
    const logs = await getBakeLogs();
    expect(logs.length).toBe(before + 1);
    expect(logs.some((l) => l.ratingStars === 2)).toBe(true);
    const calls = suggestionCalls(alert);
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toBe('Wpis jest w historii. Doktor Chleba podpowie, co zmienić przy następnym wypieku.');
    const buttons = calls[0][2] as AlertButton[];
    expect(buttons.map((b) => b.text)).toEqual(['Nie teraz', 'Otwórz Doktora Chleba']);
    expect(mockPush).not.toHaveBeenCalled();
    buttons[1].onPress?.();
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/doktor');
  });

  it('declining the suggestion keeps the same saved entry and does not navigate', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const before = (await getBakeLogs()).length;
    await finishWithRating(1);
    const buttons = suggestionCalls(alert)[0][2] as AlertButton[];
    buttons[0].onPress?.();
    expect(mockPush).not.toHaveBeenCalled();
    expect((await getBakeLogs()).length).toBe(before + 1);
  });

  it('3 stars (boundary): the bake is saved and no suggestion is shown', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const before = (await getBakeLogs()).length;
    await finishWithRating(3);
    expect((await getBakeLogs()).length).toBe(before + 1);
    expect(suggestionCalls(alert)).toHaveLength(0);
  });

  it('4 stars: no suggestion', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await finishWithRating(4);
    expect(suggestionCalls(alert)).toHaveLength(0);
  });
});
