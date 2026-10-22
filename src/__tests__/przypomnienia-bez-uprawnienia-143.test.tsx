/**
 * Bez uprawnienia przypomnienia o zakwasie nie czekają, a baner „Dziś” nie mówi o końcu próby osobie, która nigdy
 * nie miała dostępu (MON-11; kontrakt: przypomnienia ustają po wygaśnięciu) [M1-audytor-generalny-143; 02-monetyzacja-504].
 * Zegar ustawiony w kilku porach doby; atrapy StoreKit i powiadomień z jest.setup.js.
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
import { _resetStanu, odswiezDostep, rodzajDostepu } from '../lib/platnosci/stan';
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

  it('baner „tylko historia” bez transakcji w historii (np. sam import) nie mówi o końcu próby', async () => {
    await saveBakeLog({ id: 'bake_1', recipeName: 'Mój chleb', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    const tree = await renderStart();
    expect(tree.root.findAllByProps({ testID: 'start-tylko-historia' }).length).toBeGreaterThan(0);
    const t = teksty(tree.root);
    expect(t).not.toContain('Okres próbny się skończył');
    expect(t).toContain('Piekarz Pro nie jest aktywny');
    expect(EN['Piekarz Pro nie jest aktywny']).toBe("Baker Pro isn't active"); // D-053, D-063
    act(() => tree.unmount());
  });

  it('po okresie próbnym z App Store, który się skończył: nagłówek „Okres próbny się skończył”', async () => {
    await saveBakeLog({ id: 'bake_1', recipeName: 'Mój chleb', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    expect(await rodzajDostepu()).toBeNull();
    // Próba = oferta wprowadzająca (offerIOS.paymentMode FreeTrial); bez tej informacji dostęp liczy się jako płatny (C-7)
    mockIap.entitlements = [{ ...zakup(), offerIOS: { paymentMode: 'FreeTrial' } }];
    await odswiezDostep();
    expect(await rodzajDostepu()).toBe('proba');
    mockIap.entitlements = [];
    _resetStanu(); // następne uruchomienie po końcu próby
    const tree = await renderStart();
    const t = teksty(tree.root);
    expect(t).toContain('Okres próbny się skończył');
    expect(t).not.toContain('Piekarz Pro nie jest aktywny');
    act(() => tree.unmount());
  });

  it('po płatnej subskrypcji, która się skończyła: nagłówek neutralny, nie „Okres próbny się skończył” [audyt-niezalezny C-7]', async () => {
    await saveBakeLog({ id: 'bake_1', recipeName: 'Mój chleb', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    mockIap.entitlements = [zakup()];
    await odswiezDostep();
    expect(await rodzajDostepu()).toBe('platny');
    mockIap.entitlements = [];
    _resetStanu();
    const tree = await renderStart();
    const t = teksty(tree.root);
    expect(t).not.toContain('Okres próbny się skończył');
    expect(t).toContain('Piekarz Pro nie jest aktywny');
    act(() => tree.unmount());
  });
});
