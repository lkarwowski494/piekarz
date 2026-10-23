/**
 * W-fix2, 04-studio-projektowe-018 (decyzja M1 wg rekomendacji): po zakupie Pro wstrzymana akcja, która otworzyła
 * ekran Pro, wykonuje się sama (np. „Miesiąc”, „Zaplanuj wypiek na ten dzień” z arkusza dnia). Zamknięcie ekranu Pro
 * bez zakupu porzuca akcję: późniejszy zakup (np. z Ustawień) jej nie wykona. Bez nowych tekstów.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
const mockNavigate = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  const nawigacja = { push: jest.fn(), navigate: (...a: unknown[]) => mockNavigate(...a), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    get router() {
      return nawigacja;
    },
    useRouter: () => nawigacja,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { Modal } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { PaywallModal } from '../components/PaywallModal';
import { ArkuszDnia } from '../components/kalendarz/ArkuszDnia';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { localDateKey } from '../core/dzien-lokalny';
import { _resetStanu, odswiezDostep } from '../lib/platnosci/stan';
import { ustawEkranZakupu } from '../lib/platnosci/ekran';
import { PRODUKTY } from '../lib/platnosci/konfiguracja';
import { ustawDzienGotowe } from '../lib/plan-receptury';
import { mockIap } from '../../tests/helpers/platnosci';

const H = 3_600_000;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const host = (root: renderer.ReactTestInstance, id: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const ekranPro = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const nacisnij = async (root: renderer.ReactTestInstance, testID: string) => {
  const p = root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function');
  expect({ testID, jest: p.length > 0 }).toEqual({ testID, jest: true });
  await act(async () => p[p.length - 1].props.onPress());
  await flush();
};
/** Zakup Pro: sklep zwraca uprawnienie, odczyt stanu jak po transakcji. */
const kupPro = async () => {
  mockIap.entitlements = [{ id: 'tx_w2', transactionId: 'tx_w2', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: 1, expirationDateIOS: Date.now() + 30 * 86400000 }];
  await act(async () => { await odswiezDostep(); });
  await flush();
};

let tree: renderer.ReactTestRenderer | null = null;
async function zamontuj() {
  await act(async () => { tree = renderer.create(<AppAccessProvider><StartScreen /></AppAccessProvider>); });
  await flush();
  return tree!.root;
}

beforeEach(async () => {
  jest.clearAllMocks();
  _resetMemStore();
  mockIap.reset(); // bez Pro
  _resetStanu();
  ustawDzienGotowe(null);
  await initDatabase();
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  ustawEkranZakupu(false);
});

describe('018: po zakupie Pro wstrzymana akcja się wykonuje', () => {
  it('„Miesiąc” bez Pro → ekran Pro → zakup: widok miesiąca bez drugiego stuknięcia', async () => {
    const root = await zamontuj();
    await nacisnij(root, 'kalendarz-tryb-miesiac');
    expect(ekranPro(root)).toBe(true);
    await kupPro();
    expect(ekranPro(root)).toBe(false);
    expect(host(root, 'kalendarz-tryb-tydzien')).toHaveLength(1);
  });

  it('„Zaplanuj wypiek na ten dzień” z arkusza dnia → ekran Pro po zamknięciu arkusza → zakup: przejście do Receptur', async () => {
    const root = await zamontuj();
    await nacisnij(root, `pasek-dzien-${localDateKey(Date.now() + 24 * H)}`);
    await nacisnij(root, 'arkusz-zaplanuj-btn');
    await act(async () => root.findByType(ArkuszDnia).findByType(Modal).props.onDismiss?.());
    await flush();
    expect(ekranPro(root)).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalledWith('/receptury');
    await kupPro();
    expect(mockNavigate).toHaveBeenCalledWith('/receptury');
  });

  it('ekran Pro zamknięty bez zakupu: późniejszy zakup nie wykonuje porzuconej akcji', async () => {
    const root = await zamontuj();
    await nacisnij(root, 'kalendarz-tryb-miesiac');
    await act(async () => root.findByType(PaywallModal).props.onClose());
    await flush();
    await kupPro();
    expect(host(root, 'kalendarz-tryb-tydzien')).toHaveLength(0);
    expect(host(root, 'kalendarz-tryb-miesiac')).toHaveLength(1);
  });
});
