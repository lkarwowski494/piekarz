/**
 * „Zrobione” przy zaległym karmieniu na „Dziś” na prawdziwym SQLite (node:sqlite; M3 D4b, BR-KAL-003 „Zrobione”,
 * BR-KAL-007): zapis dokarmienia istniejącą ścieżką addStarterEntry z godziną teraz, następny termin od niego (pozycja
 * „Zaległe” znika po odczycie z bazy: lastFedAt wynika z wpisów, ADR-008), pasek „Przywróć” usuwa ten jeden wpis,
 * PRAGMA user_version bez zmian.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, deleteStarter, getStarters, saveStarter } from '../data/sqlite-store';
import { getStarterEntries } from '../data/starter-entries-store';
import { dbFilePath, openRaw, useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';

const H = 3_600_000;
// Zegar ustawiony na 12:00 (tylko Date; timery i mikrozadania prawdziwe), żeby wynik nie zależał od godziny przebiegu:
// zaległe karmienie sprzed 13 h między 0:00 a 1:00 wypada „z wczoraj” i etykieta ma wtedy datę [M3; wzorzec jak w zakwas-104-ekrany.test.tsx]
const ustawZegar = (godz: number, min: number) => {
  const now = new Date(2026, 9, 21, godz, min, 0, 0).getTime();
  jest.useFakeTimers({
    now,
    doNotFake: ['nextTick', 'setImmediate', 'clearImmediate', 'queueMicrotask', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'hrtime', 'performance'],
  });
  return now;
};
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 60; i++) await Promise.resolve();
  });
};
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
const przycisk = (root: renderer.ReactTestInstance, p: (id: string) => boolean) =>
  root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && p(n.props.testID) && typeof n.props.onPress === 'function');
const userVersion = () => {
  const db = openRaw(dbFilePath());
  const v = (db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version;
  db.close();
  return v;
};

describe('D4b: „Zrobione” przy zaległym karmieniu (SQLite)', () => {
  beforeAll(() => {
    useTempDbDir();
  });
  beforeEach(async () => {
    ustawZegar(12, 0);
    zUprawnieniem();
    setLang('pl');
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('BR-KAL-003 Zrobione: zapis dokarmienia z godziną teraz, „Zaległe” znika, „Przywróć” cofa wpis; BR-KAL-007 bez zmiany user_version', async () => {
    await saveStarter({ id: 'zyt', name: 'Żytni', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 13 * H });
    const przed = (await getStarterEntries('zyt')).length;
    const wersja = userVersion();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<AppAccessProvider><StartScreen /></AppAccessProvider>);
    });
    await flush();
    expect(teksty(tree.root)).toMatch(/Zaległe: karmienie zakwasu Żytni \(\d\d:\d\d\)/);
    const [zrobione] = przycisk(tree.root, (id) => id.startsWith('zalegle-zrobione-'));
    expect(zrobione.props.accessibilityLabel).toMatch(/^karmienie zakwasu Żytni z \d\d:\d\d: zrobione$/);
    await act(async () => zrobione.props.onPress());
    await flush();
    const po = await getStarterEntries('zyt');
    expect(po).toHaveLength(przed + 1);
    expect(po.some((e) => e.kind === 'feeding' && Date.now() - e.occurredAt < 60_000)).toBe(true);
    expect(teksty(tree.root)).not.toContain('Zaległe:');
    expect(teksty(tree.root)).toContain('Zapisano dokarmienie zakwasu Żytni.');
    expect(teksty(tree.root)).toMatch(/Następne: .*karmienie zakwasu Żytni/);
    // „Przywróć” usuwa ten jeden wpis i zaległe wraca
    await act(async () => przycisk(tree.root, (id) => id === 'undo-restore-btn')[0].props.onPress());
    await flush();
    expect(await getStarterEntries('zyt')).toHaveLength(przed);
    expect(teksty(tree.root)).toContain('Zaległe:');
    expect(userVersion()).toBe(wersja);
    act(() => tree.unmount());
  });
});
