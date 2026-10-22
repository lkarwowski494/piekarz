// M3 P1-1: dotknięcie powiadomienia kroku przy otwartej Stolnicy (listener w app/_layout.tsx: router.push(trasa))
// kładło na stos drugą Stolnicę. Dolna instancja żyła dalej ze starym krokiem i zegarem: zapisywała starszy stan
// i mogła zakończyć wypiek drugi raz (dowody/p1-master-potwierdzenie.txt). Test bierze opcje ekranu „stolnica”
// z prawdziwego układu korzenia, przepuszcza akcję PUSH z dotknięcia przez prawdziwy StackRouter expo-router 57
// i liczy Stolnice w stosie. Przeliczenie `dangerouslySingular` na getId jak w expo-router/build/useScreens.js:98-108.
import React from 'react';
import renderer, { act } from 'react-test-renderer';

type Opcje = Record<string, unknown>;
const mockStos: { ekrany: Array<{ name: string; props: Opcje }> } = { ekrany: [] };
const mockPush = jest.fn();

jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = (props: Opcje & { name: string }) => {
    mockStos.ekrany.push({ name: props.name, props });
    return null;
  };
  return { Stack, router: { push: (...a: unknown[]) => mockPush(...a) }, useRouter: () => ({ push: mockPush }) };
});
// Układ korzenia bez startu aplikacji (baza, płatności, znacznik startu): listener dotknięcia działa od pierwszego renderu
jest.mock('../src/lib/startup-guard', () => ({
  beginStartup: () => new Promise(() => undefined),
  markStartupSucceeded: jest.fn(),
  STARTUP_MILESTONE_MS: 1,
}));
jest.mock('../src/components/StorageGate', () => ({
  StorageGate: ({ children }: { children: React.ReactNode }) => children,
}));

/* eslint-disable @typescript-eslint/no-require-imports */
type Trasa = { key: string; name: string; params?: Opcje };
type Stan = { key: string; type: 'stack'; index: number; routeNames: string[]; routes: Trasa[]; preloadedRoutes: Trasa[]; stale: false };
type GetId = (o: { params?: Opcje }) => string | undefined;

/** Układ korzenia: opcje ekranów stosu i funkcja dotknięcia powiadomienia zarejestrowana w expo-notifications. */
function ukladKorzenia() {
  mockStos.ekrany = [];
  const Notifications = require('expo-notifications') as { addNotificationResponseReceivedListener: jest.Mock };
  Notifications.addNotificationResponseReceivedListener.mockClear();
  const Layout = require('../app/_layout').default as React.ComponentType;
  let t!: renderer.ReactTestRenderer;
  act(() => {
    t = renderer.create(<Layout />);
  });
  const [[dotkniecie]] = Notifications.addNotificationResponseReceivedListener.mock.calls as [[(r: unknown) => void]];
  return { ekrany: [...mockStos.ekrany], dotkniecie, zamknij: () => act(() => t.unmount()) };
}

/** routeGetIdList stosu z propsów Stack.Screen (jak useScreens w expo-router 57). */
function getIdZEkranow(ekrany: Array<{ name: string; props: Opcje }>): Record<string, GetId | undefined> {
  const { getSingularId } = jest.requireActual('expo-router/build/useScreens') as { getSingularId: (n: string, o: { params?: Opcje }) => string };
  const out: Record<string, GetId | undefined> = {};
  for (const e of ekrany) {
    const s = e.props.dangerouslySingular;
    out[e.name] =
      typeof s === 'string' ? () => s : typeof s === 'function' ? (o) => s(e.name, o.params ?? {}) : s === true ? (o) => getSingularId(e.name, o) : undefined;
  }
  return out;
}

/** Stan stosu po akcji z wywołania router.push(trasa): PUSH ekranu w stosie korzenia (getNavigationAction.js). */
function poPush(stan: Stan, trasa: unknown, routeGetIdList: Record<string, GetId | undefined>): Stan {
  const { StackRouter } = jest.requireActual('expo-router/build/layouts/StackClient') as {
    StackRouter: (o: object) => { getStateForAction: (s: Stan, a: object, o: object) => Stan | null };
  };
  // D3a: trasa bywa obiektem { pathname, params } (Stolnica wybranego wypieku, ?wypiek=<id>)
  const obiekt = typeof trasa === 'object' && trasa !== null ? (trasa as { pathname: string; params?: Opcje }) : null;
  const nazwa = String(obiekt ? obiekt.pathname : trasa).replace(/^\//, '');
  const akcja = { type: 'PUSH', target: stan.key, payload: { name: nazwa, params: obiekt?.params ?? {} } };
  const wynik = StackRouter({}).getStateForAction(stan, akcja, { routeNames: stan.routeNames, routeParamList: {}, routeGetIdList });
  if (!wynik) throw new Error('StackRouter odrzucił akcję');
  return wynik;
}

const stan = (routes: Trasa[]): Stan => ({
  key: 'root', type: 'stack', index: routes.length - 1, routeNames: ['(tabs)', 'stolnica', 'doktor'], routes, preloadedRoutes: [], stale: false,
});
const powiadomienieKroku = { notification: { request: { content: { data: { route: '/stolnica' } } } } };

describe('M3 P1-1: powiadomienie przy otwartej Stolnicy nie kładzie drugiej instancji', () => {
  beforeEach(() => mockPush.mockClear());

  it.each([
    ['Stolnica na wierzchu', [{ key: 'tabs-1', name: '(tabs)' }, { key: 'stolnica-1', name: 'stolnica', params: {} }]],
    ['Doktor otwarty ze Stolnicy', [{ key: 'tabs-1', name: '(tabs)' }, { key: 'stolnica-1', name: 'stolnica', params: {} }, { key: 'doktor-1', name: 'doktor', params: {} }]],
  ])('%s: po dotknięciu jedna Stolnica w stosie, ta sama instancja (klucz)', (_opis, routes) => {
    const { ekrany, dotkniecie, zamknij } = ukladKorzenia();
    act(() => dotkniecie(powiadomienieKroku));
    zamknij();
    expect(mockPush).toHaveBeenCalledTimes(1);
    const po = poPush(stan(routes), mockPush.mock.calls[0][0], getIdZEkranow(ekrany));
    const stolnice = po.routes.filter((r) => r.name === 'stolnica');
    expect(stolnice.map((r) => r.key)).toEqual(['stolnica-1']);
    expect(po.routes[po.index].name).toBe('stolnica');
  });

  // D3a: powiadomienie kroku wypieku B przy Stolnicy prowadzącej A: ta sama instancja dostaje parametr wypiek=B
  // (useLocalSearchParams w app/stolnica.tsx przełącza wypiek w tej samej instancji)
  it('D3a: dotknięcie powiadomienia innego wypieku przy otwartej Stolnicy: ta sama instancja z nowym id wypieku w parametrach', () => {
    const { ekrany, dotkniecie, zamknij } = ukladKorzenia();
    act(() => dotkniecie({ notification: { request: { identifier: 'piekarz.wypiek.bake_b.krok', content: { data: { route: '/stolnica', wypiek: 'bake_b' } } } } }));
    zamknij();
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: 'bake_b' } });
    const routes = [{ key: 'tabs-1', name: '(tabs)' }, { key: 'stolnica-1', name: 'stolnica', params: { wypiek: 'bake_a' } }];
    const po = poPush(stan(routes), mockPush.mock.calls[0][0], getIdZEkranow(ekrany));
    const stolnice = po.routes.filter((r) => r.name === 'stolnica');
    expect(stolnice.map((r) => [r.key, r.params])).toEqual([['stolnica-1', { wypiek: 'bake_b' }]]);
  });

  it('bez otwartej Stolnicy (zakładki): dotknięcie otwiera Stolnicę nad zakładkami', () => {
    const { ekrany, dotkniecie, zamknij } = ukladKorzenia();
    act(() => dotkniecie(powiadomienieKroku));
    zamknij();
    const po = poPush(stan([{ key: 'tabs-1', name: '(tabs)' }]), mockPush.mock.calls[0][0], getIdZEkranow(ekrany));
    expect(po.routes.map((r) => r.name)).toEqual(['(tabs)', 'stolnica']);
  });
});
