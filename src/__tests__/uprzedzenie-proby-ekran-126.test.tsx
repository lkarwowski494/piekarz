/**
 * Uprzedzenie o końcu Piekarz Pro na „Dziś” (D-113 pkt 3, kontrakt docs/monetyzacja.md „Wygaśnięcie Pro”, D-116;
 * dawniej uprzedzenie przed końcem próby, design-spec §11d 126, wybór P-126 a) [M1-audytor-generalny-126; M3 P-a]:
 * baner w treści, raz dla daty końca, bez okna i bez powiadomienia; przy trwającym wypieku pod „Wróć do wypieku”.
 * Przepisane z kontraktu D-038: próby nie ma (D-112), więc baner dotyczy subskrypcji, która się nie odnowi, i mówi
 * jednym zdaniem, że przypomnienia o dokarmianiu wyłączą się; bez ceny, bez odliczania, bez „ostatniej szansy”.
 * Atrapa StoreKit (jest.setup.js): subskrypcja roczna kończąca się za 30 h; zegar w kilku porach doby.
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
import { Modal, Text, AppState } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import * as Notifications from 'expo-notifications';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, getAppSetting, setActiveBake } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { planBakeSteps } from '../core/bake-steps';
import { _resetStanu } from '../lib/platnosci/stan';
import { PRODUKTY } from '../lib/platnosci/konfiguracja';
import { KLUCZ_UPRZEDZENIA } from '../lib/platnosci/uprzedzenie';
import { formatDate, appLocale } from '../lib/format';
import { t as tr } from '../lib/i18n';

const mockIap = (Iap as unknown as { __mock: { reset: () => void; entitlements: unknown[]; products: unknown[]; restoreCalls: number } }).__mock;
const notif = (Notifications as unknown as { __mock: { pending: Map<string, unknown> } }).__mock;
const H = 3600_000;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
const baner = (root: renderer.ReactTestInstance) => root.findAll((n) => n.props?.testID === 'start-uprzedzenie-konca-pro' && typeof n.type === 'string');

async function renderStart(): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <AppAccessProvider>
        <StartScreen />
      </AppAccessProvider>
    );
  });
  await flush();
  return tree;
}

const PORY = [
  ['08:00', new Date(2026, 9, 21, 8, 0).getTime()],
  ['14:00', new Date(2026, 9, 21, 14, 0).getTime()],
  ['23:55', new Date(2026, 9, 21, 23, 55).getTime()],
] as const;

describe.each(PORY)('Baner uprzedzenia o końcu Pro na „Dziś”, zegar %s (D-113; BR-ZAK-004)', (_pora, teraz) => {
  const koniec = teraz + 30 * H;
  const sub = (o: Record<string, unknown> = {}) => ({
    id: 'tx_p', transactionId: 'tx_p', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: teraz - 300 * 24 * H,
    expirationDateIOS: koniec, renewalInfoIOS: { willAutoRenew: false }, ...o,
  });

  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => teraz);
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
    await saveBakeSession(null);
    mockIap.reset();
    mockIap.entitlements = [sub()];
    mockIap.products = [{ id: PRODUKTY.yearly, displayPrice: '29,99 zł' }, { id: PRODUKTY.monthly, displayPrice: '4,99 zł' }];
    _resetStanu();
    notif.pending.clear();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('raz: tytuł z datą końca i zdanie o przypomnieniach; bez ceny, odliczania, okna i powiadomienia', async () => {
    const tree = await renderStart();
    expect(baner(tree.root)).toHaveLength(1);
    const t = teksty(tree.root);
    const data = formatDate(koniec, appLocale(), { day: 'numeric', month: 'long' });
    expect(t).toContain(tr('Piekarz Pro kończy się {data}', { data }));
    expect(t).toContain(tr('Subskrypcja się nie odnowi. Potem przypomnienia o dokarmianiu wyłączą się, a Twoje receptury, zakwasy i dziennik zostaną.'));
    expect(t).not.toMatch(/29,99 zł|Za 3 dni|prób/);
    expect(tree.root.findAllByType(Modal).filter((m) => m.props.visible)).toHaveLength(0);
    expect(notif.pending.size).toBe(0);
    expect(await getAppSetting(KLUCZ_UPRZEDZENIA)).toBe(String(koniec));
    const zamknij = tree.root.findByProps({ testID: 'koniec-pro-close-btn' });
    expect(zamknij.props.accessibilityLabel).toBe('Zamknij informację o Piekarz Pro');
    expect(tree.root.findByProps({ testID: 'koniec-pro-manage-btn' })).toBeDefined();
    await act(async () => {
      zamknij.props.onPress();
    });
    expect(baner(tree.root)).toHaveLength(0);
    act(() => tree.unmount());

    // Ponowne uruchomienie: ta sama data końca — bez banera
    _resetStanu();
    const drugi = await renderStart();
    expect(baner(drugi.root)).toHaveLength(0);
    act(() => drugi.unmount());
  });

  it('subskrypcja odnawia się albo stan odnawiania nieznany (OP-M03): brak banera', async () => {
    mockIap.entitlements = [sub({ renewalInfoIOS: { willAutoRenew: true } })];
    _resetStanu();
    const a = await renderStart();
    expect(baner(a.root)).toHaveLength(0);
    act(() => a.unmount());
    mockIap.entitlements = [sub({ renewalInfoIOS: undefined })];
    _resetStanu();
    const b = await renderStart();
    expect(baner(b.root)).toHaveLength(0);
    act(() => b.unmount());
  });

  it('73 h do końca albo dożywotni obok: brak banera', async () => {
    mockIap.entitlements = [sub({ expirationDateIOS: teraz + 73 * H })];
    _resetStanu();
    const a = await renderStart();
    expect(baner(a.root)).toHaveLength(0);
    act(() => a.unmount());
    mockIap.entitlements = [sub(), { id: 'tx_l', transactionId: 'tx_l', productId: PRODUKTY.lifetime, purchaseState: 'purchased', transactionDate: 1 }];
    _resetStanu();
    const b = await renderStart();
    expect(baner(b.root)).toHaveLength(0);
    act(() => b.unmount());
  });

  it('z trwającym wypiekiem baner jest pod „Wróć do wypieku”; przejście aplikacji w tło go chowa', async () => {
    const steps = planBakeSteps({ startAt: teraz, isHighRye: false }) ?? [];
    await saveBakeSession({ version: 2, steps, stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: null, pausedLeftSec: 600, recipeName: 'Chleb', startedAt: teraz, bake: null });
    const listeners: Array<(s: string) => void> = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_e, fn) => {
      listeners.push(fn as (s: string) => void);
      return { remove: () => undefined } as never;
    });
    const tree = await renderStart();
    const ids = tree.root.findAll((n) => typeof n.type === 'string' && typeof n.props?.testID === 'string').map((n) => n.props.testID as string);
    const wroc = ids.indexOf('resume-bake-btn');
    const ban = ids.indexOf('start-uprzedzenie-konca-pro');
    expect(wroc).toBeGreaterThanOrEqual(0);
    expect(ban).toBeGreaterThan(wroc);
    await act(async () => {
      listeners.forEach((fn) => fn('background'));
    });
    expect(baner(tree.root)).toHaveLength(0);
    act(() => tree.unmount());
  });
});
