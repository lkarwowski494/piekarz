/**
 * Kalendarz na „Dziś” po D7 (M3 D7; BR-KAL-008, BR-KAL-013; makieta roli 04 a2 `101-przewijanie` i `12-miesiac`;
 * D-114): strzałki „Poprzedni tydzień”/„Następny tydzień”, przesunięcie palcem w bok, „Dziś” wraca do bieżącego
 * okresu; przełącznik „Tydzień”/„Miesiąc”; miesiąc ze znacznikami wpisów Dziennika i przejściem do każdego wpisu
 * (arkusz dnia → Dziennik z tym wpisem); AX5: lista dni z wpisami; 320 pt: dni od krawędzi do krawędzi.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: mockNavigate, replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, deleteStarter, getStarters, saveBakeLog, getBakeLogs, deleteBakeLog } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { deleteBakeSession, loadPlannedBakes } from '../data/bake-sessions-store';
import { addCalendarDays, daysOfWeek, localDateKey, startOfLocalDay } from '../core/dzien-lokalny';
import { systemFirstWeekday } from '../lib/format';
import { _resetStanu } from '../lib/platnosci/stan';
import { setLang } from '../lib/i18n';
import { odstepy } from '../ui/tokeny';

const mockIap = (Iap as unknown as { __mock: { reset: () => void; entitlements: Array<Record<string, unknown>> } }).__mock;

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const host = (root: renderer.ReactTestInstance, testID: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === testID);
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button');
const zPrefiksem = (root: renderer.ReactTestInstance, prefiks: string) =>
  root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith(prefiks) && typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button');
const styl = (n: renderer.ReactTestInstance) => StyleSheet.flatten(n.props.style) as Record<string, unknown>;
const nacisnij = async (n: renderer.ReactTestInstance | undefined) => {
  expect(n).toBeDefined();
  await act(async () => n?.props.onPress());
  await flush();
};

let tree: renderer.ReactTestRenderer | null = null;
async function renderStart() {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><StartScreen /></AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}

/** Pięć wpisów Dziennika w poprzednim miesiącu (dni 3, 8, 13, 18, 23, 12:00). */
function poprzedniMiesiac() {
  const d = new Date();
  return { y: d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear(), m: (d.getMonth() + 11) % 12 };
}
async function piecWpisow() {
  const { y, m } = poprzedniMiesiac();
  const dni = [3, 8, 13, 18, 23];
  for (const [i, dz] of dni.entries()) {
    const koniec = new Date(y, m, dz, 12).getTime();
    await saveBakeLog({ id: `b${i}`, recipeName: `Chleb ${i}`, startedAt: koniec - 6 * 3_600_000, finishedAt: koniec, ratingStars: 4 });
  }
  return dni.map((dz, i) => ({ id: `b${i}`, klucz: localDateKey(new Date(y, m, dz).getTime()) }));
}

beforeEach(async () => {
  jest.clearAllMocks();
  _resetMemStore();
  mockIap.reset();
  _resetStanu();
  mockIap.entitlements = [{ id: 't', transactionId: 't', productId: 'com.apps4brew.baker.pro.lifetime', purchaseState: 'purchased', transactionDate: 1 }];
  mockOkno.width = 390;
  mockOkno.fontScale = 1;
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await initDatabase();
  await saveBakeSession(null);
  for (const p of await loadPlannedBakes()) await deleteBakeSession(p.id);
  for (const s of await getStarters()) await deleteStarter(s.id);
  for (const b of await getBakeLogs()) await deleteBakeLog(b.id);
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  jest.restoreAllMocks();
  setLang('pl');
});

describe('D7: poprzedni i następny tydzień na „Dziś”', () => {
  it('BR-KAL-008 Następny tydzień: strzałka pokazuje dni od dziś + 7 dni kalendarza, bez wyróżnionego dnia; „Dziś” wraca', async () => {
    const root = await renderStart();
    const first = systemFirstWeekday();
    const dzis = localDateKey(Date.now());
    const nastepny = daysOfWeek(addCalendarDays(startOfLocalDay(Date.now()), 7), first).map(localDateKey);
    const [nast] = przycisk(root, 'kalendarz-nastepny');
    const [pop] = przycisk(root, 'kalendarz-poprzedni');
    expect(nast?.props.accessibilityLabel).toBe('Następny tydzień');
    expect(pop?.props.accessibilityLabel).toBe('Poprzedni tydzień');
    for (const b of [nast, pop]) {
      expect(Number(styl(b).minHeight)).toBeGreaterThanOrEqual(44);
      expect(Number(styl(b).minWidth)).toBeGreaterThanOrEqual(44);
    }
    // W bieżącym tygodniu „Dziś” nic by nie zmieniło
    expect(przycisk(root, 'kalendarz-dzis')).toHaveLength(0);
    await nacisnij(nast);
    expect(zPrefiksem(root, 'pasek-dzien-').map((d) => d.props.testID)).toEqual(nastepny.map((k) => `pasek-dzien-${k}`));
    expect(zPrefiksem(root, 'pasek-dzien-').some((d) => d.props.accessibilityState?.selected)).toBe(false);
    await nacisnij(przycisk(root, 'kalendarz-dzis')[0]);
    const dzien = przycisk(root, `pasek-dzien-${dzis}`);
    expect(dzien).toHaveLength(1);
    expect(dzien[0].props.accessibilityState?.selected).toBe(true);
  });

  it('BR-KAL-008 Powrót do dziś: po pięciu tygodniach wstecz jeden ruch „Dziś” pokazuje tydzień z wyróżnionym dniem', async () => {
    const root = await renderStart();
    for (let i = 0; i < 5; i++) await nacisnij(przycisk(root, 'kalendarz-poprzedni')[0]);
    const wstecz = localDateKey(addCalendarDays(startOfLocalDay(Date.now()), -35));
    expect(przycisk(root, `pasek-dzien-${wstecz}`)).toHaveLength(1);
    expect(host(root, 'kalendarz-tytul').length).toBeGreaterThan(0);
    await nacisnij(przycisk(root, 'kalendarz-dzis')[0]);
    expect(przycisk(root, `pasek-dzien-${localDateKey(Date.now())}`)[0]?.props.accessibilityState?.selected).toBe(true);
    expect(przycisk(root, 'kalendarz-dzis')).toHaveLength(0);
  });

  it('BR-KAL-008 gest: przesunięcie palcem w lewo → następny tydzień, w prawo → poprzedni (makieta 101)', async () => {
    const root = await renderStart();
    const [gest] = host(root, 'kalendarz-gest');
    expect(gest).toBeDefined();
    await act(async () => {
      gest.props.onTouchStart({ nativeEvent: { pageX: 300, pageY: 200 } });
      gest.props.onTouchEnd({ nativeEvent: { pageX: 150, pageY: 210 } });
    });
    await flush();
    const plus7 = localDateKey(addCalendarDays(startOfLocalDay(Date.now()), 7));
    expect(przycisk(root, `pasek-dzien-${plus7}`)).toHaveLength(1);
    await act(async () => {
      gest.props.onTouchStart({ nativeEvent: { pageX: 100, pageY: 200 } });
      gest.props.onTouchEnd({ nativeEvent: { pageX: 260, pageY: 200 } });
    });
    await flush();
    expect(przycisk(root, `pasek-dzien-${localDateKey(Date.now())}`)).toHaveLength(1);
  });
});

describe('D7: widok miesiąca na „Dziś”', () => {
  it('BR-KAL-013 Miesiąc wypieków: pięć dni ze znacznikiem wypieku i przejście do każdego wpisu Dziennika', async () => {
    const wpisy = await piecWpisow();
    const root = await renderStart();
    const [miesiac] = przycisk(root, 'kalendarz-tryb-miesiac');
    // PRZ-18 (b): jeden przycisk w wierszu okresu zamiast segmentu Tydzień/Miesiąc; w tygodniu „Miesiąc”, w miesiącu „Tydzień”
    expect(przycisk(root, 'kalendarz-tryb-tydzien')).toHaveLength(0);
    expect(root.findAll((n) => n.props.accessibilityRole === 'tablist')).toHaveLength(0);
    expect(miesiac?.findAllByType(Text).map((x) => x.props.children).join('')).toBe('Miesiąc');
    await nacisnij(miesiac);
    expect(przycisk(root, 'kalendarz-tryb-miesiac')).toHaveLength(0);
    expect(przycisk(root, 'kalendarz-tryb-tydzien')[0].findAllByType(Text).map((x) => x.props.children).join('')).toBe('Tydzień');
    expect(przycisk(root, 'kalendarz-poprzedni')[0].props.accessibilityLabel).toBe('Poprzedni miesiąc');
    expect(przycisk(root, 'kalendarz-nastepny')[0].props.accessibilityLabel).toBe('Następny miesiąc');
    await nacisnij(przycisk(root, 'kalendarz-poprzedni')[0]);
    const zWpisem = zPrefiksem(root, 'miesiac-dzien-').filter((d) => /Chleb \d/.test(String(d.props.accessibilityLabel)));
    expect(zWpisem.map((d) => d.props.testID)).toEqual(wpisy.map((w) => `miesiac-dzien-${w.klucz}`));
    for (const d of zWpisem) {
      expect(d.findAll((n) => n.props.glif === 'dziennik').length).toBeGreaterThan(0);
    }
    for (const w of wpisy) {
      await nacisnij(przycisk(root, `miesiac-dzien-${w.klucz}`)[0]);
      await nacisnij(przycisk(root, `arkusz-zdarzenie-dziennik:${w.id}`)[0]);
      expect(mockNavigate).toHaveBeenLastCalledWith({ pathname: '/dziennik', params: { wpis: w.id } });
    }
  });

  it('BR-KAL-013 AX5: zamiast siatki lista dni z wpisami (każdy dzień przyciskiem z etykietą słowami)', async () => {
    const wpisy = await piecWpisow();
    mockOkno.fontScale = 3.1;
    const root = await renderStart();
    await nacisnij(przycisk(root, 'kalendarz-tryb-miesiac')[0]);
    await nacisnij(przycisk(root, 'kalendarz-poprzedni')[0]);
    expect(host(root, 'miesiac-siatka')).toHaveLength(0);
    const dni = zPrefiksem(root, 'miesiac-dzien-');
    expect(dni.map((d) => d.props.testID)).toEqual(wpisy.map((w) => `miesiac-dzien-${w.klucz}`));
    expect(dni.every((d) => /Chleb \d/.test(String(d.props.accessibilityLabel)))).toBe(true);
  });

  it('BR-KAL-013 320 pt: siatka od krawędzi do krawędzi, 7 dni w rzędzie, każdy dzień ≥ 44 pt wysokości', async () => {
    mockOkno.width = 320;
    const root = await renderStart();
    await nacisnij(przycisk(root, 'kalendarz-tryb-miesiac')[0]);
    const [siatka] = host(root, 'miesiac-siatka');
    expect(siatka).toBeDefined();
    expect(styl(siatka).marginHorizontal).toBe(-odstepy.l);
    const dni = zPrefiksem(root, 'miesiac-dzien-');
    expect(dni.length % 7).toBe(0);
    expect(dni.length).toBeGreaterThanOrEqual(28);
    for (const d of dni) expect(Number(styl(d).minHeight)).toBeGreaterThanOrEqual(44);
    // Powrót do tygodnia
    await nacisnij(przycisk(root, 'kalendarz-tryb-tydzien')[0]);
    expect(zPrefiksem(root, 'pasek-dzien-')).toHaveLength(7);
  });
});
