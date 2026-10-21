/**
 * Dostęp i uprzedzenie o końcu próby po powrocie aplikacji z tła, bez restartu (MON-05)
 * [M1-audytor-generalny-144; 02-monetyzacja-505, 02-monetyzacja-601]. Ekran „Dziś” z uruchomionymi płatnościami
 * (jak app/_layout.tsx), zegar ustawiony w kilku porach doby; AppState sterowany w teście.
 */
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
import { AppState } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, setActiveBake, saveBakeLog } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { _resetStanu, uruchomPlatnosci, pobierzStan } from '../lib/platnosci/stan';
import { PRODUKTY } from '../lib/platnosci/konfiguracja';

const mockIap = (Iap as unknown as { __mock: { reset: () => void; entitlements: unknown[]; products: unknown[]; failRead: boolean } }).__mock;
const H = 3600_000;
const D = 24 * H;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const ile = (root: renderer.ReactTestInstance, id: string) => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string').length;

const PORY = [
  ['08:00', new Date(2026, 9, 21, 8, 0).getTime()],
  ['14:00', new Date(2026, 9, 21, 14, 0).getTime()],
  ['23:55', new Date(2026, 9, 21, 23, 55).getTime()],
] as const;

describe.each(PORY)('Powrót z tła bez restartu, zegar %s (144; MON-05)', (_pora, start) => {
  let teraz = start;
  let sluchacze: Array<(s: string) => void> = [];
  const powrot = async (nowy: number) => {
    teraz = nowy;
    await act(async () => {
      sluchacze.forEach((fn) => fn('background'));
    });
    await act(async () => {
      sluchacze.forEach((fn) => fn('active'));
    });
    await flush();
  };
  const proba = (koniec: number) => ({
    id: 'tx_p', transactionId: 'tx_p', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: start - 10 * D,
    expirationDateIOS: koniec, offerIOS: { id: 'intro', type: 'introductory', paymentMode: 'free-trial' }, renewalInfoIOS: { willAutoRenew: true },
  });

  beforeEach(async () => {
    teraz = start;
    sluchacze = [];
    jest.spyOn(Date, 'now').mockImplementation(() => teraz);
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_e, fn) => {
      sluchacze.push(fn as (s: string) => void);
      return { remove: () => undefined } as never;
    });
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
    await saveBakeSession(null);
    await saveBakeLog({ id: 'bake_1', recipeName: 'Mój chleb', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    mockIap.reset();
    mockIap.products = [{ id: PRODUKTY.yearly, displayPrice: '29,99 zł' }, { id: PRODUKTY.monthly, displayPrice: '4,99 zł' }];
    _resetStanu();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function renderStart(): Promise<{ tree: renderer.ReactTestRenderer; stop: () => void }> {
    const stop = uruchomPlatnosci();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <AppAccessProvider>
          <StartScreen />
        </AppAccessProvider>
      );
    });
    await flush();
    return { tree, stop };
  }

  it('uprawnienie z „wygasa” w przeszłości po zdarzeniu „active”: brak dostępu i stan „tylko historia” bez restartu', async () => {
    const koniec = start + 5 * D;
    mockIap.entitlements = [proba(koniec)];
    const { tree, stop } = await renderStart();
    expect(pobierzStan().decyzja.dostep).toBe(true);
    expect(ile(tree.root, 'start-tylko-historia')).toBe(0);

    // Aplikacja w tle przez koniec oferty; sklep dalej podaje tę samą transakcję z datą końca w przeszłości
    await powrot(koniec + H);
    expect(pobierzStan().decyzja.dostep).toBe(false);
    expect(ile(tree.root, 'start-tylko-historia')).toBe(1);
    act(() => tree.unmount());
    stop();
  });

  it('bez sieci przy powrocie: pamięć ostatniego odczytu też wygasa o „wygasa”', async () => {
    const koniec = start + 5 * D;
    mockIap.entitlements = [proba(koniec)];
    const { tree, stop } = await renderStart();
    expect(pobierzStan().decyzja.dostep).toBe(true);
    mockIap.failRead = true;
    await powrot(koniec + H);
    expect(pobierzStan().decyzja).toEqual(expect.objectContaining({ dostep: false, powod: 'brak' }));
    act(() => tree.unmount());
    stop();
  });

  it('uprzedzenie: o T−4 dni bez banera; powrót o T−2 dni pokazuje baner raz, drugi powrót go nie powtarza (601)', async () => {
    const koniec = start + 4 * D;
    mockIap.entitlements = [proba(koniec)];
    const { tree, stop } = await renderStart();
    expect(ile(tree.root, 'start-uprzedzenie-proby')).toBe(0);

    await powrot(koniec - 2 * D);
    expect(ile(tree.root, 'start-uprzedzenie-proby')).toBe(1);

    await powrot(koniec - 2 * D + H);
    expect(ile(tree.root, 'start-uprzedzenie-proby')).toBe(0);
    act(() => tree.unmount());
    stop();
  });
});
