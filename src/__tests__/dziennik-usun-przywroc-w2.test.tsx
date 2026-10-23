/**
 * W-fix2, 04-studio-projektowe-011 (decyzja M1: pasek „Przywróć” zamiast pytania, wzorzec D-051 1a): usunięcie wpisu
 * Dziennika bez pytania „trwale”, pasek „Usunięto wpis” z „Przywróć”; przywrócenie wraca ten sam wiersz ze wszystkimi
 * kolumnami (ocena, notatki, profil sensoryczny, receptura) na prawdziwym SQLite (adapter node:sqlite), bez kopii po
 * wypieku (pula kopii się nie przesuwa).
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
import { Alert, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, getBakeLogs, saveBakeLog, deleteBakeLog, restoreBakeLog } from '../data/sqlite-store';
import type { StoredBakeLog } from '../data/db';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import * as backup from '../lib/backup';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';

jest.setTimeout(30000);

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await new Promise((r) => setImmediate(r));
  });
};
const host = (root: renderer.ReactTestInstance, id: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const nacisnij = async (root: renderer.ReactTestInstance, id: string) => {
  const p = root.findAll((n) => typeof n.type !== 'string' && n.props.testID === id && typeof n.props.onPress === 'function');
  expect({ id, jest: p.length > 0 }).toEqual({ id, jest: true });
  await act(async () => p[0].props.onPress());
  await flush();
};

const WPIS: StoredBakeLog = {
  id: 'b1', recipeName: 'Wiejski', startedAt: 1_800_000_000_000, finishedAt: 1_800_000_100_000, ambientTemp: 22, ratingStars: 4,
  notes: 'Dłużej garować', crumbScore: 4, crustScore: 3, tasteProfile: 'sour',
  sensoryProfile: { crustCrispness: 4, crumbElasticity: 3, acidity: 4, openCrumb: 3, caramelization: 5 }, recipeId: 'r1',
};

describe('011: wpis Dziennika usuwany z paskiem „Przywróć”', () => {
  beforeAll(() => useTempDbDir());
  beforeEach(async () => {
    zUprawnieniem();
    setLang('pl');
    await initDatabase();
  });
  afterEach(() => jest.restoreAllMocks());

  it('„Usuń wpis” bez pytania; „Przywróć” wraca ten sam wiersz z wszystkimi polami, bez nowej kopii', async () => {
    await saveBakeLog(WPIS);
    await flush(); // kopia po zapisie wypieku (saveBakeLog) kończy się przed obserwacją kopii
    const przed = (await getBakeLogs()).find((l) => l.id === 'b1');
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const kopia = jest.spyOn(backup, 'autoBackup');
    let tree!: renderer.ReactTestRenderer;
    await act(async () => { tree = renderer.create(<AppAccessProvider><DziennikScreen /></AppAccessProvider>); });
    await flush();
    await nacisnij(tree.root, 'delete-bake-log-b1');
    expect(alert).not.toHaveBeenCalled();
    expect((await getBakeLogs()).some((l) => l.id === 'b1')).toBe(false);
    expect(host(tree.root, 'bake-log-card-b1')).toHaveLength(0);
    const pasek = host(tree.root, 'dziennik-usun-cofnij')[0]!;
    expect(pasek.findAllByType(Text).map((x) => [x.props.children].flat().join(''))).toContain('Usunięto wpis');
    await nacisnij(tree.root, 'dziennik-usun-cofnij-przywroc');
    expect((await getBakeLogs()).find((l) => l.id === 'b1')).toEqual(przed);
    expect(host(tree.root, 'bake-log-card-b1')).toHaveLength(1);
    expect(host(tree.root, 'dziennik-usun-cofnij')).toHaveLength(0);
    expect(kopia).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('restoreBakeLog: wiersz po usunięciu wraca z tymi samymi kolumnami; istniejący wpis zostaje nietknięty', async () => {
    await saveBakeLog({ ...WPIS, id: 'b2' });
    await flush();
    const przed = (await getBakeLogs()).find((l) => l.id === 'b2')!;
    await deleteBakeLog('b2');
    await restoreBakeLog(przed);
    expect((await getBakeLogs()).find((l) => l.id === 'b2')).toEqual(przed);
    await restoreBakeLog(przed);
    expect((await getBakeLogs()).filter((l) => l.id === 'b2')).toHaveLength(1);
  });
});
