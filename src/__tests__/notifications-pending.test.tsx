/**
 * Lista oczekujących powiadomień nadąża za stanem: start, pauza, +5 min, krok, odrzucenie, karmienie, import, brak zgody
 * [M1-audytor-generalny-006; 05-architekt-005, 03-zakres-001, 08-programista-004] — ADR-006 „Potwierdzenie”.
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
jest.mock('../lib/confirm', () => ({
  confirmDiscardBake: (onConfirm: () => void) => onConfirm(),
  confirmDeleteBakeLog: (onConfirm: () => void) => onConfirm(),
  confirmDeleteStarter: (_n: string, onConfirm: () => void) => onConfirm(),
  confirmResetStarter: (onConfirm: () => void) => onConfirm(),
}));
jest.mock('../lib/pdf-sheet-generator', () => ({
  exportStarterLabelAsPdf: jest.fn().mockResolvedValue('file:///mock/label.pdf'),
  printStarterLabelDirectly: jest.fn().mockResolvedValue(undefined),
}));

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Notifications from 'expo-notifications';
import StolnicaScreen from '../../app/stolnica';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { initDatabase, setActiveBake, saveStarter, restoreFromBackupData } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { resyncNotifications } from '../lib/notifications';
import { planBakeSteps } from '../core/bake-steps';

import { zUprawnieniem } from '../../tests/helpers/platnosci';
type Mock = { pending: Map<string, { identifier: string; trigger: { date: number } }>; iosStatus: number; grantOnRequest: boolean };
const mock = (Notifications as unknown as { __mock: Mock }).__mock;
const ids = () => [...mock.pending.keys()].sort();
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const press = async (root: renderer.ReactTestInstance, label: string) => {
  const b = root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label))[0];
  await act(async () => {
    await b.props.onPress();
  });
  await settle();
};
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 60; i++) await new Promise((r) => setImmediate(r));
  });
};
async function mount(el: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  await settle();
  return tree!;
}

describe('Pending notifications follow the saved state (006)', () => {
  let now = Date.UTC(2026, 9, 19, 10, 0);
  beforeAll(() => {
    useTempDbDir();
  });
  beforeEach(async () => {
    zUprawnieniem(); // dostęp z App Store (009): dawniej lokalny okres próbny
    mock.pending.clear();
    mock.iosStatus = 2;
    mock.grantOnRequest = true;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await initDatabase();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 056: czas kroku biegnie od planu (bez Start/Wstrzymaj/+5 min), „Przerwij wypiek” na „Plan wypieku”
  // 102 (BR-HARMO-005): czeka powiadomienie bieżącego kroku i kolejnych kroków planu (piekarz.krok.<indeks>)
  it('Stolnica: start → krok and next steps; next step → krok of the next step; discard → none (BR-CZAS-002 Koniec wypieku: przerwanie)', async () => {
    setActiveBake({ id: 'bake_n', recipeName: 'Chleb', startedAt: now, currentStageId: 'step_1' });
    const tree = await mount(<StolnicaScreen />);
    // Krok w garnku ma też zdjęcie pokrywki po fazie 1 (piekarz.krok.<indeks>.pokrywka)
    const garnek = `piekarz.krok.${planBakeSteps({ startAt: now, isHighRye: false }).findIndex((s) => s.category === 'bake')}.pokrywka`;
    expect(ids()).toEqual(['piekarz.krok', garnek, ...Array.from({ length: 10 }, (_, i) => `piekarz.krok.${i + 1}`)].sort());
    const first = mock.pending.get('piekarz.krok')!.trigger.date;
    // Pierwszy etap planu: dokarmienie zakwasu, 6 h [M1-audytor-generalny-030]
    expect(first).toBe(now + 360 * 60 * 1000);

    await press(tree.root, 'Zrobione');
    expect(ids()).toEqual(['piekarz.krok', garnek, ...Array.from({ length: 9 }, (_, i) => `piekarz.krok.${i + 2}`)].sort());
    // Drugi etap planu: autoliza, 45 min
    expect(mock.pending.get('piekarz.krok')!.trigger.date).toBe(now + 45 * 60 * 1000);
    await press(tree.root, 'Plan wypieku');
    await press(tree.root, 'Przerwij wypiek');
    expect(ids()).toEqual([]);
    act(() => tree.unmount());
  });

  it('Zakwas: feeding a fridge starter schedules +6 d and +7 d reminders', async () => {
    await saveStarter({ id: 'z1', name: 'Ania', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE', lastFedAt: 1 });
    const tree = await mount(<ZakwasScreen />);
    await press(tree.root, 'Zapisz dokarmienie');
    expect(ids()).toEqual(['piekarz.karmienie.z1.1', 'piekarz.karmienie.z1.2']);
    act(() => tree.unmount());
  });

  it('import replaces reminders: new starters get them, removed ones lose them', async () => {
    // Baza jest wspólna dla pliku: czysty stan zakwasów przed scenariuszem
    await restoreFromBackupData({ bakes: [], starters: [], customRecipes: [] });
    await saveStarter({ id: 'stary', name: 'Stary', flourType: 'P', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: now });
    await resyncNotifications();
    expect(ids()).toEqual(['piekarz.karmienie.stary.1']);
    const { BackupAndDataSection } = require('../components/settings/BackupAndDataSection');
    const tree = await mount(React.createElement(BackupAndDataSection));
    await act(async () => {
      tree.root.findByProps({ testID: 'import-backup-btn' }).props.onPress();
    });
    const backup = { format: 'piekarz-backup', schemaVersion: 1, exportedAt: '', state: { bakes: [], customRecipes: [], starters: [{ id: 'nowy', name: 'Nowy', flourType: 'P', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: now }] } };
    await act(async () => {
      tree.root.findByProps({ testID: 'import-json-input' }).props.onChangeText(JSON.stringify(backup));
    });
    await act(async () => {
      await tree.root.findByProps({ testID: 'confirm-import-btn' }).props.onPress();
    });
    await settle();
    expect(ids()).toEqual(['piekarz.karmienie.nowy.1']);
    act(() => tree.unmount());
    await restoreFromBackupData({ bakes: [], starters: [], customRecipes: [] });
  });

  it('without permission nothing waits and Stolnica shows "Powiadomienia wyłączone"; the first timer asks once (BR-CZAS-003 Odmowa)', async () => {
    mock.iosStatus = 0;
    mock.grantOnRequest = false;
    setActiveBake({ id: 'bake_d', recipeName: 'Chleb', startedAt: now, currentStageId: 'step_1' });
    // 056: pierwszy zegar rusza sam przy wejściu w wypiek — wtedy jedna prośba o zgodę
    const tree = await mount(<StolnicaScreen />);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(ids()).toEqual([]);
    expect(textOf(tree.toJSON())).toContain('Powiadomienia wyłączone');
    await press(tree.root, 'Zrobione');
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    await press(tree.root, 'Plan wypieku');
    await press(tree.root, 'Przerwij wypiek');
    act(() => tree.unmount());
  });
});
