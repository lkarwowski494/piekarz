/**
 * Nieudany zapis trwającego wypieku nie jest cichy, a zakończony wypiek nie wraca jako trwający
 * [M1-audytor-generalny-120; 05-architekt-501]. Prawdziwy SQLite (node:sqlite) z błędem zapisu tylko w app_settings,
 * ekran Stolnicy przy zegarze ustawionym na kilka godzin doby (SYS-06).
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
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake, finishBake, toggleLessonProgress, getCompletedLessons, _resetMemStore } from '../data/sqlite-store';
import { getDb } from '../data/sqlite-store';
import { useTempDbDir, control, openRaw } from '../data/__tests__/helpers/node-sqlite-adapter';
import { loadBakeSession, saveBakeSession, BakeSession } from '../data/bake-session-store';
import { StorageWriteError } from '../data/storage-status';
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
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
};
/** Wiersze wypieku o danym id w pliku bazy, który otworzyła aplikacja (osobne połączenie). */
const bakesInDb = async (id: string): Promise<number> => {
  const file = (await getDb())?.databasePath;
  if (!file) throw new Error('brak bazy');
  const raw = openRaw(file);
  const n = (raw.prepare('SELECT count(*) AS c FROM bakes WHERE id = ?').get(id) as { c: number }).c;
  raw.close();
  return Number(n);
};

function sesja(now: number, stepIdx: number): BakeSession {
  const steps = planBakeSteps({ startAt: now, isHighRye: false, ambientTempC: 22 }) ?? [];
  return {
    version: 2,
    steps,
    stepIdx,
    dutchOvenPhase: 'lid_on',
    timerEndsAt: null,
    pausedLeftSec: null,
    recipeName: 'Chleb B',
    startedAt: now,
    bake: { id: 'bake_b', recipeName: 'Chleb B', startedAt: now, currentStageId: steps[0]?.id ?? 'mix' },
  };
}

// Pory doby: rano, po południu i tuż przed północą (lokalnie), jeden dzień
const PORY = [
  ['08:00', new Date(2026, 9, 21, 8, 0).getTime()],
  ['14:00', new Date(2026, 9, 21, 14, 0).getTime()],
  ['23:55', new Date(2026, 9, 21, 23, 55).getTime()],
] as const;

describe.each(PORY)('Zapis sesji wypieku przy błędzie zapisu, zegar %s (120)', (_pora, start) => {
  let now = start;
  beforeEach(async () => {
    now = start;
    useTempDbDir();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });
  afterEach(() => {
    control().failWritesMatching = null;
    jest.restoreAllMocks();
  });

  it('saveBakeSession odrzuca StorageWriteError, a po restarcie zostaje poprzedni zapis', async () => {
    await saveBakeSession(sesja(now, 1));
    control().failWritesMatching = /app_settings/;
    await expect(saveBakeSession(sesja(now, 4))).rejects.toBeInstanceOf(StorageWriteError);
    control().failWritesMatching = null;
    _resetMemStore();
    expect((await loadBakeSession())?.stepIdx).toBe(1);
  });

  it('Stolnica: „Zrobione” przy błędzie zapisu pokazuje „Nie zapisano” raz na wypiek, a krok idzie dalej', async () => {
    setActiveBake({ id: 'bake_live', recipeName: 'Chleb na błąd', startedAt: now, currentStageId: 'mix', ambientTempC: 22 });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<StolnicaScreen />);
    });
    await flush();
    control().failWritesMatching = /app_settings/;
    for (let i = 0; i < 2; i++) {
      await act(async () => {
        button(tree.root, 'Zrobione').props.onPress();
      });
      await flush();
    }
    const nieZapisano = (Alert.alert as jest.Mock).mock.calls.filter((c) => c[0] === 'Nie zapisano');
    expect(nieZapisano).toHaveLength(1);
    expect(textOf(tree.toJSON())).toContain('Chleb na błąd');
    act(() => tree.unmount());
  });

  it('zakończenie wypieku: wpis i skasowanie sesji razem albo wcale; po restarcie zakończony wypiek nie wraca', async () => {
    await saveBakeSession(sesja(now, 8));
    const log = { id: `bake_done_${start}`, recipeName: 'Chleb B', startedAt: now, finishedAt: now + 1000 };

    // Błąd w środku zakończenia (kasowanie sesji): ani wpis bez skasowanej sesji, ani odwrotnie
    control().failWritesMatching = /app_settings/;
    await expect(finishBake(log, [], { clearSession: true })).rejects.toBeInstanceOf(StorageWriteError);
    control().failWritesMatching = null;
    expect(await bakesInDb(log.id)).toBe(0);
    _resetMemStore();
    expect((await loadBakeSession())?.stepIdx).toBe(8);

    // Udane zakończenie: wpis jest, sesji nie ma, także po restarcie
    await finishBake(log, [], { clearSession: true });
    expect(await bakesInDb(log.id)).toBe(1);
    _resetMemStore();
    expect(await loadBakeSession()).toBeNull();
  });

  it('lekcja: nieudany zapis postępu odrzuca StorageWriteError zamiast udawać sukces', async () => {
    control().failWrites = true;
    await expect(toggleLessonProgress(3)).rejects.toBeInstanceOf(StorageWriteError);
    control().failWrites = false;
    _resetMemStore();
    expect(await getCompletedLessons()).toEqual([]);
  });
});
