/**
 * BR-OPIN-001, BR-OPIN-002 (DEC-13 a, D-042): Stolnica prosi o ocenę dopiero po zapisanym wypieku i podaje
 * ocenę tylko wtedy, gdy użytkownik dotknął gwiazdki; Ustawienia nie pokazują „Oceń w App Store”, dopóki
 * Apple ID aplikacji jest znacznikiem; aplikacja nie ma własnego okna oceny
 * [M1-audytor-generalny-082; 11-wzrost-004]. Wektory M03, M06: docs/wzrost/wektory-prosba-o-ocene.json.
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
jest.mock('../lib/prosba-o-ocene-wywolanie', () => ({
  KLUCZ_DAT_PROSBY: 'prosba_o_ocene_daty',
  poprosOOceneJesliWarto: jest.fn(async () => undefined),
}));
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(async () => true),
  hasAction: jest.fn(async () => true),
  requestReview: jest.fn(async () => undefined),
}));

import React from 'react';
import { Alert, Linking } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import * as StoreReview from 'expo-store-review';
import StolnicaScreen from '../../app/(tabs)/stolnica';
import * as store from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { StorageWriteError } from '../data/storage-status';
import { poprosOOceneJesliWarto } from '../lib/prosba-o-ocene-wywolanie';
import { StudioEcosystemSection } from '../components/settings/StudioEcosystemSection';
import { APP_STORE_ID, APP_STORE_REVIEW_URL } from '../lib/links';
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
const prosba = poprosOOceneJesliWarto as jest.MockedFunction<typeof poprosOOceneJesliWarto>;

async function finishBake(stars: number | null): Promise<void> {
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
  if (stars !== null) {
    await act(async () => {
      tree!.root.findByProps({ testID: `finish-rating-star-${stars}` }).props.onPress();
    });
  }
  await act(async () => {
    await pressables(tree!.root, 'Zapisz')[0].props.onPress();
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  act(() => tree!.unmount());
}

describe('Stolnica: prośba o ocenę po zapisanym wypieku', () => {
  beforeAll(() => {
    useTempDbDir();
  });
  beforeEach(async () => {
    zUprawnieniem();
    prosba.mockClear();
    await store.initDatabase();
    store.setActiveBake({ id: 'bake_live', recipeName: 'Chleb', startedAt: 1, currentStageId: 'mix', ambientTempC: 22, actualDdtC: 25 });
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('M03: gwiazdka 4★ dotknięta — po zapisie jedno wywołanie z oceną 4', async () => {
    const before = (await store.getBakeLogs()).length;
    await finishBake(4);
    expect((await store.getBakeLogs()).length).toBe(before + 1);
    expect(prosba).toHaveBeenCalledTimes(1);
    expect(prosba).toHaveBeenCalledWith(4);
  });

  it('W06: gwiazdki nietknięte (domyślne 5★) — wywołanie z null, nie z 5', async () => {
    await finishBake(null);
    expect(prosba).toHaveBeenCalledTimes(1);
    expect(prosba).toHaveBeenCalledWith(null);
  });

  it('M06: zapis wypieku nie powiódł się — brak wywołania', async () => {
    jest.spyOn(store, 'finishBake').mockRejectedValue(new StorageWriteError('disk full'));
    await finishBake(5);
    expect(prosba).not.toHaveBeenCalled();
  });
});

describe('Ustawienia: link „Oceń w App Store” (BR-OPIN-002)', () => {
  it('Apple ID to znacznik [DO USTALENIA] — wiersz się nie renderuje, adres nie trafia do openURL', () => {
    expect(/^\d+$/.test(APP_STORE_ID)).toBe(false);
    expect(APP_STORE_REVIEW_URL).toContain('action=write-review');
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(<StudioEcosystemSection />);
    });
    expect(tree!.root.findAllByProps({ testID: 'settings-rate-link' })).toHaveLength(0);
    expect(tree!.root.findAllByProps({ testID: 'settings-privacy-link' }).length).toBeGreaterThan(0);
    expect(openURL).not.toHaveBeenCalledWith(APP_STORE_REVIEW_URL);
    expect(StoreReview.requestReview).not.toHaveBeenCalled();
    act(() => tree!.unmount());
    openURL.mockRestore();
  });
});

describe('Bez własnego okna oceny (BR-OPIN-001, wytyczna 5.6.1)', () => {
  const root = join(__dirname, '../..');
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) return name === '__tests__' || name === 'node_modules' ? [] : walk(p);
      return /\.tsx?$/.test(name) ? [p] : [];
    });
  const files = ['app', 'src'].flatMap((d) => walk(join(root, d)));

  it('żaden plik nie pyta, czy aplikacja się podoba, i nie prosi o ocenę własnym oknem', () => {
    const zakazane = /czy podoba|podoba ci si|lubisz piekarza|oceń nas|do you (like|enjoy)|enjoying|rate us|love (this|the) app/i;
    const trafienia = files.filter((f) => zakazane.test(readFileSync(f, 'utf8')));
    expect(trafienia).toEqual([]);
  });

  it('requestReview() woła tylko opakowanie po wypieku, nigdy wiersz Ustawień (M04)', () => {
    const wolajacy = files
      .filter((f) => /requestReview\s*\(/.test(readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')))
      .map((f) => f.slice(root.length + 1).replace(/\\/g, '/'));
    expect(wolajacy).toEqual(['src/lib/prosba-o-ocene-wywolanie.ts']);
  });
});
