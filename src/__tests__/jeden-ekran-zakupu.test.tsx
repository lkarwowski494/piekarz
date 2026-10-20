/**
 * Jeden stan dostępu i jeden ekran zakupu dla całej aplikacji (ADR-002, MON-05)
 * [M1-audytor-generalny-025; 02-monetyzacja-005, 05-architekt-008].
 * Prawdziwy app/_layout.tsx; zakładki Expo Router pozostają zamontowane, więc dwa ekrany renderują się razem.
 * Zakup i zwrot przychodzą z atrapy adaptera StoreKit (expo-iap w jest.setup.js).
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('../lib/pdf-sheet-generator', () => ({
  exportStarterLabelAsPdf: jest.fn().mockResolvedValue('file:///mock/label.pdf'),
  printStarterLabelDirectly: jest.fn().mockResolvedValue(undefined),
}));
// Bez natywnego SQLite w Jest baza działa w pamięci; ekran błędu bazy nie jest tu przedmiotem testu.
jest.mock('../components/StorageGate', () => ({
  StorageGate: ({ children }: { children: React.ReactNode }) => children,
}));
// Stos Expo Router: zamontowane dwa ekrany (zakładka Zakwasy i prowadzenie wypieku).
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = () => {
    const Zakwas = require('../../app/(tabs)/zakwasy/index').default;
    const Stolnica = require('../../app/stolnica').default;
    return React.createElement(React.Fragment, null, React.createElement(Zakwas), React.createElement(Stolnica));
  };
  Stack.Screen = () => null;
  return {
    Stack,
    router: { push: jest.fn() },
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import RootLayout from '../../app/_layout';
import { PaywallModal } from '../components/PaywallModal';
import { _resetMemStore } from '../data/sqlite-store';
import { odswiezDostep } from '../lib/platnosci/stan';
import { PRODUKTY } from '../lib/platnosci/konfiguracja';
import { czyEkranZakupu, subskrybujEkranZakupu, ustawEkranZakupu, _resetEkranu } from '../lib/platnosci/ekran';
import { bezUprawnienia, mockIap } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 60; i++) await Promise.resolve();
  });
};
const locks = (root: renderer.ReactTestInstance) =>
  root
    .findAll((n) => typeof n.props?.testID === 'string' && n.props.testID.startsWith('blokada-') && typeof n.props.onPress === 'function')
    .map((n) => n.props.testID);
const paywalls = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal);

const zakup = {
  id: 'tx_kup',
  transactionId: 'tx_kup',
  productId: PRODUKTY.yearly,
  purchaseState: 'purchased',
  transactionDate: 1,
  platform: 'ios',
  expirationDateIOS: Date.now() + 365 * 86400000,
};

describe('One access state and one purchase screen for all mounted tabs (025)', () => {
  beforeEach(() => {
    _resetMemStore();
    bezUprawnienia();
  });

  it('the app has exactly one purchase screen, wherever the lock is tapped', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<RootLayout />);
    });
    await flush();
    const root = tree!.root;
    expect(locks(root)).toEqual(expect.arrayContaining(['blokada-zakwas', 'blokada-stolnica']));
    expect(paywalls(root).length).toBe(1);
    await act(async () => {
      root.findAll((n) => n.props?.testID === 'blokada-stolnica' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(paywalls(root).map((p) => p.props.visible)).toEqual([true]);
    expect(czyEkranZakupu()).toBe(true);
    await act(async () => {
      paywalls(root)[0].props.onClose();
    });
    expect(czyEkranZakupu()).toBe(false);
    act(() => tree!.unmount());
  });

  it('the purchase screen visibility store notifies subscribers only on change', () => {
    const seen: boolean[] = [];
    const off = subskrybujEkranZakupu((v) => seen.push(v));
    ustawEkranZakupu(true);
    ustawEkranZakupu(true);
    ustawEkranZakupu(false);
    off();
    ustawEkranZakupu(true);
    expect(seen).toEqual([true, false]);
    _resetEkranu();
    expect(czyEkranZakupu()).toBe(false);
  });

  it('a purchase on one tab unlocks both mounted tabs and a refund locks both, without a restart', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<RootLayout />);
    });
    await flush();
    const root = tree!.root;
    await act(async () => {
      root.findAll((n) => n.props?.testID === 'blokada-zakwas' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(paywalls(root).some((p) => p.props.visible)).toBe(true);

    // Zakup: StoreKit podaje transakcję przez nasłuch uruchomiony w app/_layout.tsx.
    mockIap.entitlements = [{ ...zakup }];
    await act(async () => {
      mockIap.emit({ ...zakup });
    });
    await flush();
    expect(locks(root)).toEqual([]);
    expect(paywalls(root).some((p) => p.props.visible)).toBe(false);
    expect(mockIap.finished).toContain('tx_kup');

    // Zwrot: następny odczyt sklepu nie zawiera uprawnienia.
    mockIap.entitlements = [];
    await act(async () => {
      await odswiezDostep();
    });
    await flush();
    expect(locks(root)).toEqual(expect.arrayContaining(['blokada-zakwas', 'blokada-stolnica']));
    act(() => tree!.unmount());
  });
});
