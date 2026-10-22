/**
 * Bez Piekarz Pro przypomnienia o dokarmianiu zakwasu nie czekają (poza zakładaniem zakwasu, które jest w Basic),
 * a „Dziś” nie mówi o końcu Pro osobie, która nigdy go nie miała (MON-11; kontrakt Basic/Pro docs/monetyzacja.md,
 * D-113: przypomnienia o dokarmianiu w Pro, zakładanie w Basic, po wygaśnięciu przypomnienia ustają)
 * [M1-audytor-generalny-143; 02-monetyzacja-504]. Przepisane z kontraktu D-038 („tylko historia”, nagłówek końca próby)
 * [M3 P-a]. Zegar ustawiony w kilku porach doby; atrapy StoreKit i powiadomień z jest.setup.js.
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
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import * as Notifications from 'expo-notifications';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, setActiveBake, saveBakeLog, saveStarter, getStarters, deleteStarter } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { planBakeSteps } from '../core/bake-steps';
import { _resetStanu, odswiezDostep } from '../lib/platnosci/stan';
import { PRODUKTY } from '../lib/platnosci/konfiguracja';
import { resyncNotifications, uzgadniajZDostepem } from '../lib/notifications';
import { EN } from '../lib/i18n.en';

const mockIap = (Iap as unknown as { __mock: { reset: () => void; entitlements: unknown[] } }).__mock;
const notif = (Notifications as unknown as { __mock: { pending: Map<string, unknown>; iosStatus: number } }).__mock;
const H = 3600_000;
const D = 24 * H;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 60; i++) await new Promise((r) => setImmediate(r));
  });
};
const ids = () => [...notif.pending.keys()].sort();
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');

const PORY = [
  ['08:00', new Date(2026, 9, 21, 8, 0).getTime()],
  ['14:00', new Date(2026, 9, 21, 14, 0).getTime()],
  ['23:55', new Date(2026, 9, 21, 23, 55).getTime()],
] as const;

describe.each(PORY)('Przypomnienia o zakwasie i baner bez uprawnienia, zegar %s (143; BR-ZAK-004 Po końcu próby)', (_pora, teraz) => {
  const zakup = () => ({ id: 'tx_l', transactionId: 'tx_l', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: teraz - 10 * D, expirationDateIOS: teraz + 4 * D });

  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => teraz);
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
    await saveBakeSession(null);
    mockIap.reset();
    _resetStanu();
    notif.pending.clear();
    notif.iosStatus = 2;
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function zakwasIWypiek() {
    await saveStarter({ id: 'z1', name: 'Ania', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: teraz - H });
    const steps = planBakeSteps({ startAt: teraz, isHighRye: false }) ?? [];
    await saveBakeSession({ version: 2, steps, stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: teraz + H, pausedLeftSec: 600, recipeName: 'Chleb', startedAt: teraz, bake: null });
  }

  it('bez uprawnienia plan nie zawiera przypomnień o zakwasie (kroki wypieku zostają), z uprawnieniem zawiera', async () => {
    await zakwasIWypiek();
    await odswiezDostep(); // sklep: brak uprawnienia
    await resyncNotifications();
    expect(ids().filter((i) => i.includes('karmienie'))).toEqual([]);
    expect(ids()).toContain('piekarz.wypiek.sesja-1014.krok');

    mockIap.entitlements = [zakup()];
    await odswiezDostep();
    await resyncNotifications();
    expect(ids()).toContain('piekarz.karmienie.z1.1');
    expect(ids()).toContain('piekarz.wypiek.sesja-1014.krok');
  });

  it('zmiana dostępu (koniec próby, zakup) uzgadnia listę oczekujących bez innej akcji użytkownika', async () => {
    await zakwasIWypiek();
    const off = uzgadniajZDostepem();
    mockIap.entitlements = [zakup()];
    await odswiezDostep();
    await flush();
    expect(ids()).toContain('piekarz.karmienie.z1.1');

    mockIap.entitlements = [];
    await odswiezDostep();
    await flush();
    expect(ids().filter((i) => i.includes('karmienie'))).toEqual([]);
    expect(ids()).toContain('piekarz.wypiek.sesja-1014.krok');
    off();
  });

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

  it('W-10 zakładanie zakwasu w Basic: przypomnienie zakładania czeka bez Pro; po „gotowy” przypomnienie o dokarmianiu tylko z Pro', async () => {
    await saveStarter({ id: 'z2', name: 'Nowy', flourType: 'Żytnia', hydration: 100, birthDate: teraz - 3 * D, storageState: 'ROOM_TEMP', lastFedAt: teraz - H, setupStartedAt: teraz - 3 * D });
    await odswiezDostep(); // sklep: brak Pro
    await resyncNotifications();
    expect(ids().filter((i) => i.includes('karmienie'))).toEqual(['piekarz.karmienie.z2.1']);
    const [z] = (await getStarters()).filter((s) => s.id === 'z2');
    await saveStarter({ ...z, setupCompletedAt: teraz - 1 });
    await resyncNotifications();
    expect(ids().filter((i) => i.includes('karmienie'))).toEqual([]);
  });

  // M3 P-a-fix P2-2: przed pierwszym odczytem sklepu (stan nieustalony) nowe przypomnienia Pro nie są planowane,
  // a czekające nie są kasowane (brak odpowiedzi App Store to nie koniec Pro)
  it('przed pierwszym odczytem sklepu: czekające przypomnienie o dokarmianiu zostaje, nowe nie jest planowane', async () => {
    await saveStarter({ id: 'z1', name: 'Ania', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: teraz - H });
    await resyncNotifications(); // stan nieustalony, nic nie czeka
    expect(ids().filter((i) => i.includes('karmienie'))).toEqual([]);
    mockIap.entitlements = [zakup()];
    await odswiezDostep();
    await resyncNotifications();
    expect(ids()).toContain('piekarz.karmienie.z1.1');
    _resetStanu(); // następne uruchomienie, sklep jeszcze nie odpowiedział
    await resyncNotifications();
    expect(ids()).toContain('piekarz.karmienie.z1.1');
  });

  it('Basic bez wcześniejszego Pro (np. sam import danych): bez komunikatu o końcu Pro i bez stanu „tylko historia”', async () => {
    await saveBakeLog({ id: 'bake_1', recipeName: 'Mój chleb', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    const tree = await renderStart();
    expect(tree.root.findAllByProps({ testID: 'start-tylko-historia' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'start-koniec-pro' })).toHaveLength(0);
    expect(teksty(tree.root)).not.toContain('Piekarz Pro nie jest aktywny');
    act(() => tree.unmount());
  });

  it('po subskrypcji, która się skończyła: „Piekarz Pro nie jest aktywny” i zdanie o przypomnieniach, raz', async () => {
    mockIap.entitlements = [zakup()];
    await odswiezDostep();
    mockIap.entitlements = [];
    _resetStanu(); // następne uruchomienie po końcu Pro
    const tree = await renderStart();
    const t = teksty(tree.root);
    expect(t).toContain('Piekarz Pro nie jest aktywny');
    expect(t).toContain('Przypomnienia o dokarmianiu wyłączyły się. Twoje receptury, zakwasy i dziennik zostają.');
    expect(t).not.toContain('Okres próbny');
    expect(EN['Piekarz Pro nie jest aktywny']).toBe("Baker Pro isn't active"); // D-053, D-063
    act(() => tree.unmount());
    _resetStanu();
    const drugi = await renderStart();
    expect(teksty(drugi.root)).not.toContain('Piekarz Pro nie jest aktywny');
    act(() => drugi.unmount());
  });
});
