/**
 * Zmiana języka a etykieta „Ostatnie dokarmienie” na zamontowanym ekranie Zakwasy (KO-072, recenzja AC-01, D-427).
 * `lastFedLabel` było w `useMemo` z zależnością tylko od `starter.lastFedAt`, więc po zmianie języka ekran przerysowywał się
 * (D-424), ale etykieta zostawała w starym języku do następnego dokarmienia. Test: ekran zamontowany, `setLang('en')`, ta
 * sama etykieta po angielsku bez remontowania. Prawdziwa baza SQLite (node:sqlite), render jak w gratulacje-zakwasu-pb.test.tsx.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('expo-router', () => {
  const push = jest.fn();
  return {
    useRouter: () => ({ push, navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: unknown }) => children, { Screen: () => null }),
  };
});

import type React from 'react';
import type renderer from 'react-test-renderer';
import { useTempDbDir, restartApp } from '../data/__tests__/helpers/node-sqlite-adapter';
import type { StoredStarter, StoredStarterEntry } from '../data/db';

jest.setTimeout(30000);

const H = 3600_000;
const starter = (id: string): StoredStarter => ({
  id, name: `Zakwas ${id}`, flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP',
});
const feed = (id: string, starterId: string, at: number): StoredStarterEntry => ({
  id, starterId, kind: 'feeding', occurredAt: at, signs: [], createdAt: at, updatedAt: at,
});

describe('etykieta ostatniego dokarmienia po zmianie języka (AC-01)', () => {
  beforeEach(() => useTempDbDir());

  it('zamontowany ekran Zakwasy: „7 h temu” → po setLang(en) etykieta po angielsku', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    const entries = require('../data/starter-entries-store') as typeof import('../data/starter-entries-store');
    await app.store.deleteStarter('starter_default');
    await entries.createStarterWithEntry(starter('z'), feed('f1', 'z', Date.now() - 7 * H - 60_000));
    const platnosci = require('../../tests/helpers/platnosci') as typeof import('../../tests/helpers/platnosci');
    platnosci.zUprawnieniem();
    const R: typeof React = require('react');
    const TR: typeof renderer = require('react-test-renderer');
    const RN: typeof import('react-native') = require('react-native');
    const { AppAccessProvider } = require('../components/AppAccessProvider') as typeof import('../components/AppAccessProvider');
    const i18n = require('../lib/i18n') as typeof import('../lib/i18n');
    const Ekran = require('../../app/(tabs)/zakwasy/index').default as React.ComponentType;
    const flush = () => TR.act(async () => { for (let i = 0; i < 40; i++) await Promise.resolve(); });
    i18n.setLang('pl');
    let tree!: renderer.ReactTestRenderer;
    await TR.act(async () => {
      tree = TR.create(R.createElement(AppAccessProvider, null, R.createElement(Ekran)));
    });
    await flush();
    const etykieta = () => {
      const [w] = tree.root.findAll((n) => n.props.testID === 'profil-dokarmienie' && typeof n.type === 'string');
      expect(w).toBeDefined();
      return w!.findAllByType(RN.Text).map((n) => [n.props.children].flat().filter((c) => typeof c === 'string').join('')).join(' ');
    };
    expect(etykieta()).toContain('7 h temu');
    await TR.act(async () => {
      i18n.setLang('en');
    });
    await flush();
    expect(etykieta()).toContain('7 h ago');
    expect(etykieta()).not.toContain('temu');
    await TR.act(async () => { i18n.setLang('pl'); });
    await TR.act(async () => tree.unmount());
  });
});
