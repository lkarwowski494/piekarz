/**
 * „Usuń wszystkie dane” w Ustawieniach z kopią przed czyszczeniem [M1-audytor-generalny-124; 03-zakres-502, 05-architekt-505,
 * 01-odkrywanie-501] (F-65, BR-DANE-004 Usunięcie z potwierdzeniem). Prawdziwy SQLite (node:sqlite), ekran Ustawień
 * bez zakupu (po próbie), zegar ustawiony na kilka godzin doby (SYS-06). Zakres usuwania: wybór P-124 a.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import { Alert, AlertButton } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import { SettingsModal } from '../components/SettingsModal';
import {
  initDatabase,
  saveStarter,
  saveRecipe,
  saveBakeLog,
  saveFlourInventoryItem,
  toggleLessonProgress,
  getStarters,
  getBakeLogs,
  getRecipes,
  getFlourInventory,
  getCompletedLessons,
  getAppSetting,
  setAppSetting,
  _resetMemStore,
} from '../data/sqlite-store';
import { saveBakeSession, loadBakeSession } from '../data/bake-session-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { resyncNotifications } from '../lib/notifications';
import { planBakeSteps } from '../core/bake-steps';
import { bezUprawnienia } from '../../tests/helpers/platnosci';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
type Mock = { pending: Map<string, unknown>; iosStatus: number };
const notif = (Notifications as unknown as { __mock: Mock }).__mock;
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await new Promise((r) => setImmediate(r));
  });
};
const przedCzyszczeniem = () => [...mockFiles.keys()].filter((k) => /piekarz-przed-czyszczeniem-[^/]+\.json$/.test(k));

const PORY = [
  ['08:00', new Date(2026, 9, 21, 8, 0).getTime()],
  ['14:00', new Date(2026, 9, 21, 14, 0).getTime()],
  ['23:55', new Date(2026, 9, 21, 23, 55).getTime()],
] as const;

describe.each(PORY)('Usuń wszystkie dane, zegar %s (124; BR-DANE-004 Usunięcie z potwierdzeniem)', (_pora, now) => {
  let alerts: Array<{ title: string; buttons?: AlertButton[] }> = [];

  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    alerts = [];
    jest.spyOn(Alert, 'alert').mockImplementation((title, _msg, buttons) => {
      alerts.push({ title, buttons });
    });
    useTempDbDir();
    mockFiles.clear();
    notif.iosStatus = 2;
    notif.pending.clear();
    _resetMemStore();
    bezUprawnienia(); // po próbie, bez zakupu: prawo do danych zostaje (DEC-01 d)
    await initDatabase();
    await saveStarter({ id: 's_user', name: 'Zakwas Ani', flourType: 'Żytnia', hydration: 100, birthDate: now - 864e5, storageState: 'ROOM_TEMP', lastFedAt: now - 2 * 3600e3 });
    await saveRecipe({ id: 'r_user', name: 'Mój chleb', formula: { flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, starterHydration: 100, targetDoughWeightGrams: 1000 }, targetDDT: 25, isBuiltIn: false, createdAt: now });
    await saveBakeLog({ id: 'b_user', recipeName: 'Mój chleb', startedAt: now - 864e5, finishedAt: now - 800e5 });
    await saveFlourInventoryItem({ id: 'f_user', name: 'Mąka 750', stockGrams: 1000, updatedAt: now });
    await toggleLessonProgress(2);
    const steps = planBakeSteps({ startAt: now, isHighRye: false, ambientTempC: 22 }) ?? [];
    await saveBakeSession({ version: 2, steps, stepIdx: 1, dutchOvenPhase: 'lid_on', timerEndsAt: now + 3600e3, pausedLeftSec: null, recipeName: 'Mój chleb', startedAt: now, bake: { id: 'live', recipeName: 'Mój chleb', startedAt: now, currentStageId: steps[0]?.id ?? 'mix' } });
    await setAppSetting('unit_system', 'imperial');
    await resyncNotifications();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function otworzIUsun(): Promise<renderer.ReactTestRenderer> {
    expect(notif.pending.size).toBeGreaterThan(0);
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<SettingsModal visible onClose={() => undefined} />);
    });
    await settle();
    const wiersz = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children) === 'Usuń wszystkie dane')[0];
    expect(wiersz).toBeDefined();
    await act(async () => {
      wiersz.props.onPress();
    });
    const pytanie = alerts.find((a) => a.title === 'Usunąć wszystkie dane?');
    expect(pytanie?.buttons?.map((b) => [b.text, b.style])).toEqual([
      ['Anuluj', 'cancel'],
      ['Usuń wszystko', 'destructive'],
    ]);
    await act(async () => {
      pytanie?.buttons?.[1]?.onPress?.();
    });
    await settle();
    return tree;
  }

  it('potwierdzenie → kopia bezpieczeństwa z pełnym stanem, potem receptury, zakwasy, historia, sesja i powiadomienia znikają; ustawienia zostają', async () => {
    const tree = await otworzIUsun();
    const kopie = przedCzyszczeniem();
    expect(kopie).toHaveLength(1);
    const stan = JSON.parse(String(mockFiles.get(kopie[0]))).state;
    expect(stan.starters.map((s: { id: string }) => s.id)).toEqual(['s_user']);
    expect(stan.customRecipes.map((r: { id: string }) => r.id)).toEqual(['r_user']);
    expect(stan.bakes.map((b: { id: string }) => b.id)).toEqual(['b_user']);

    _resetMemStore(); // jak po ponownym uruchomieniu: odczyt z bazy
    expect(await getStarters()).toEqual([]);
    expect(await getBakeLogs()).toEqual([]);
    expect((await getRecipes()).filter((r) => !r.isBuiltIn)).toEqual([]);
    expect(await getFlourInventory()).toEqual([]);
    expect(await getCompletedLessons()).toEqual([]);
    expect(await loadBakeSession()).toBeNull();
    expect(notif.pending.size).toBe(0);
    expect(await getAppSetting('unit_system')).toBe('imperial');
    expect(alerts.some((a) => a.title === 'Nie zapisano')).toBe(false);
    // Drugie wywołanie usunWszystkieDane na pustych danych: znowu kopia przed czyszczeniem, nic się nie psuje
    const { usunWszystkieDane } = require('../data/usun-wszystko') as typeof import('../data/usun-wszystko');
    await usunWszystkieDane();
    expect(przedCzyszczeniem().length).toBeGreaterThanOrEqual(1);
    expect(await getStarters()).toEqual([]);
    act(() => tree.unmount());
  });

  it('nieudana kopia bezpieczeństwa blokuje usunięcie: „Nie zapisano”, dane zostają', async () => {
    (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValueOnce(new Error('ENOSPC: no space left on device'));
    const tree = await otworzIUsun();
    expect(alerts.some((a) => a.title === 'Nie zapisano')).toBe(true);
    expect(przedCzyszczeniem()).toEqual([]);
    _resetMemStore();
    expect((await getStarters()).map((s) => s.id)).toEqual(['s_user']);
    expect((await getBakeLogs()).map((b) => b.id)).toEqual(['b_user']);
    expect(notif.pending.size).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
});
