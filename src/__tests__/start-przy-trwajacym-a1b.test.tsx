/**
 * a1b → D3a: „Zacznij wypiek” w planie przy trwającym wypieku. Do D3a pytanie dawało „Wróć do trwającego” albo
 * „Przerwij tamten i zacznij nowy” (jeden wypiek naraz, D-091). Od D3a (D-092: kilka wypieków naraz, limit 2
 * trwających) przy jednym trwającym pytanie ma „Prowadź oba” (domyślne), „Wróć do: {nazwa}” i „Anuluj”; przy dwóch
 * trwających (limit) „Prowadzisz już 2 wypieki” z „Wróć do: {A}”, „Wróć do: {B}” i „Anuluj”, bez przerwania
 * (przerwanie na Stolnicy). Bez trwającego wypieku start jak dotąd, bez pytania [M3 p1b a1b; M3 D3a, D-104].
 * Zmiana testu z D3a: wybory i trasa ze Stolnicą wybranego wypieku (`wypiek` = id) zamiast „/stolnica”.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush, navigate: jest.fn(), replace: jest.fn() }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
  useLocalSearchParams: () => ({}),
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
const mockResync = jest.fn(() => Promise.resolve({ status: 'granted', ok: true }));
jest.mock('../lib/notifications', () => ({ ...jest.requireActual('../lib/notifications'), resyncNotifications: () => mockResync() }));

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, getActiveBake, setActiveBake, _resetMemStore, getStarters, deleteStarter } from '../data/sqlite-store';
import { loadBakeSession, saveBakeSession } from '../data/bake-session-store';
import { loadActiveBakeSessions } from '../data/bake-sessions-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
import { zacznijWypiekBezReceptury } from '../../tests/helpers/wypiek';
import { setLang } from '../lib/i18n';
import { przerwijWypiek, czyTrwaWypiek, trwajaceWypieki, utrwalWypiekZPamieci } from '../lib/przerwij-wypiek';
import { MAX_TRWAJACYCH_WYPIEKOW } from '../core/limity-wypiekow';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const button = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label))[0];

async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

type Przycisk = { text: string; style?: string; isPreferred?: boolean; onPress?: () => void };
let alertSpy: jest.SpyInstance;
const ostatniAlert = () => {
  const [tytul, tresc, przyciski] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string | undefined, Przycisk[]];
  return { tytul, tresc, przyciski };
};

/** Plan na pojutrze 12:00 (bez „za późno”), start przyciskiem „Zacznij wypiek”. */
async function nacisnijStart(): Promise<renderer.ReactTestRenderer> {
  const harm = await render(<HarmonogramScreen />);
  await ustawGodzinePlanu(harm.root, 'Pojutrze', 12, 0);
  await act(async () => {
    button(harm.root, 'Zacznij wypiek').props.onPress();
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return harm;
}
const naStolnice = (id: string) => ({ pathname: '/stolnica', params: { wypiek: id } });
const idsZapisu = async () => (await loadActiveBakeSessions()).map((s) => s.bake?.id);

describe('a1b → D3a: start kolejnego wypieku przy trwającym', () => {
  const STARY = Date.now() - 600_000;
  const STARY_ID = `bake_${STARY}`;
  const DRUGI = STARY + 1000;
  const DRUGI_ID = `bake_${DRUGI}`;

  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    mockPush.mockClear();
    mockResync.mockClear();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await initDatabase();
    await saveBakeSession(null);
    for (const s of await getStarters()) await deleteStarter(s.id);
  });
  afterEach(() => alertSpy.mockRestore());

  it('bez trwającego wypieku: start jak dotąd, bez pytania, Stolnica nowego wypieku', async () => {
    const harm = await nacisnijStart();
    act(() => harm.unmount());
    expect(alertSpy).not.toHaveBeenCalled();
    const nowy = getActiveBake();
    expect(nowy).not.toBeNull();
    expect(mockPush).toHaveBeenCalledWith(naStolnice(nowy!.id));
  });

  it.each([
    ['zapis sesji (po restarcie, pamięć pusta)', 'zapis'],
    ['wypiek w pamięci (zapis jeszcze nie powstał)', 'pamiec'],
  ])('BR-ETAP-006 jeden trwający: %s → „Prowadź oba” (domyślne), „Wróć do: {nazwa}”, „Anuluj”; do odpowiedzi nic nie zmienione', async (_opis, zrodlo) => {
    let staryWPamieci: ReturnType<typeof getActiveBake> = null;
    if (zrodlo === 'zapis') {
      await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    } else {
      staryWPamieci = { id: STARY_ID, recipeName: 'Wypiek bez receptury', startedAt: STARY, currentStageId: 'x', zaczetyZDostepem: true };
      setActiveBake(staryWPamieci);
    }
    const zapisPrzed = JSON.stringify(await loadBakeSession());

    const harm = await nacisnijStart();
    act(() => harm.unmount());

    expect(alertSpy).toHaveBeenCalledTimes(1);
    const { tytul, przyciski } = ostatniAlert();
    expect(tytul).toBe('Trwa już inny wypiek');
    expect(przyciski.map((p) => p.text)).toEqual(['Prowadź oba', 'Wróć do: Wypiek bez receptury', 'Anuluj']);
    expect(przyciski[0].isPreferred).toBe(true);
    expect(przyciski.some((p) => p.style === 'destructive')).toBe(false);
    expect(przyciski[2].style).toBe('cancel');
    expect(JSON.stringify(await loadBakeSession())).toBe(zapisPrzed);
    expect(getActiveBake()).toBe(staryWPamieci);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('„Prowadź oba”: trwający zostaje na tym samym kroku z tym samym zegarem, nowy zaczyna się i Stolnica otwiera nowy', async () => {
    await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    const przed = JSON.stringify(await loadBakeSession());
    const harm = await nacisnijStart();
    act(() => harm.unmount());

    await act(async () => {
      ostatniAlert().przyciski[0].onPress?.();
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });

    expect(JSON.stringify((await loadActiveBakeSessions()).find((s) => s.bake?.id === STARY_ID))).toBe(przed);
    const nowy = getActiveBake();
    expect(nowy).not.toBeNull();
    expect(nowy!.id).not.toBe(STARY_ID);
    expect(nowy!.steps!.length).toBeGreaterThan(0);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(naStolnice(nowy!.id));
    expect(mockResync).not.toHaveBeenCalled();
  });

  it('„Prowadź oba” przy wypieku tylko w pamięci: pierwszy trafia do zapisu, zanim pamięć dostanie nowy', async () => {
    setActiveBake({ id: STARY_ID, recipeName: 'Żytni 70%', startedAt: STARY, currentStageId: 'x', zaczetyZDostepem: true });
    const harm = await nacisnijStart();
    act(() => harm.unmount());
    expect(ostatniAlert().przyciski[1].text).toBe('Wróć do: Żytni 70%');
    await act(async () => {
      ostatniAlert().przyciski[0].onPress?.();
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    expect(await idsZapisu()).toEqual([STARY_ID]);
    expect(getActiveBake()?.id).not.toBe(STARY_ID);
  });

  it('„Wróć do: {nazwa}”: Stolnica tego wypieku bez zmian zapisu', async () => {
    await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    const zapisPrzed = JSON.stringify(await loadBakeSession());
    const harm = await nacisnijStart();
    act(() => harm.unmount());

    await act(async () => {
      ostatniAlert().przyciski[1].onPress?.();
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(naStolnice(STARY_ID));
    expect(JSON.stringify(await loadBakeSession())).toBe(zapisPrzed);
    expect(getActiveBake()).toBeNull();
    expect(mockResync).not.toHaveBeenCalled();
  });

  it('„Anuluj”: nic się nie zmienia, zostajemy w planie', async () => {
    await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    const zapisPrzed = JSON.stringify(await loadBakeSession());
    const harm = await nacisnijStart();
    act(() => harm.unmount());

    await act(async () => {
      ostatniAlert().przyciski[2].onPress?.();
    });

    expect(JSON.stringify(await loadBakeSession())).toBe(zapisPrzed);
    expect(getActiveBake()).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockResync).not.toHaveBeenCalled();
  });

  it('stary zapis bez nazwy: „Wróć do wypieku” zamiast „Wróć do: ”', async () => {
    await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    const sesja = await loadBakeSession();
    await saveBakeSession({ ...sesja!, recipeName: '' });
    const harm = await nacisnijStart();
    act(() => harm.unmount());
    expect(ostatniAlert().przyciski.map((p) => p.text)).toEqual(['Prowadź oba', 'Wróć do wypieku', 'Anuluj']);
  });

  it('dwa trwające (limit): „Prowadzisz już 2 wypieki” z „Wróć do: {A}”, „Wróć do: {B}”, „Anuluj”, bez przerwania i bez nowego wypieku', async () => {
    expect(MAX_TRWAJACYCH_WYPIEKOW).toBe(2); // tekst pytania zakłada limit 2 (D-092); zmiana limitu = nowy tekst
    await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    const pierwszy = await loadBakeSession();
    await saveBakeSession({ ...pierwszy!, recipeName: 'Pizza', startedAt: DRUGI, bake: { ...pierwszy!.bake!, id: DRUGI_ID, recipeName: 'Pizza', startedAt: DRUGI } });
    const przed = JSON.stringify(await loadActiveBakeSessions());

    const harm = await nacisnijStart();
    act(() => harm.unmount());

    const { tytul, przyciski } = ostatniAlert();
    expect(tytul).toBe('Prowadzisz już 2 wypieki');
    expect(przyciski.map((p) => p.text)).toEqual(['Wróć do: Wypiek bez receptury', 'Wróć do: Pizza', 'Anuluj']);
    expect(przyciski.some((p) => p.style === 'destructive')).toBe(false);
    expect(przyciski[2].style).toBe('cancel');

    await act(async () => {
      przyciski[1].onPress?.();
    });
    expect(mockPush).toHaveBeenCalledWith(naStolnice(DRUGI_ID));
    expect(JSON.stringify(await loadActiveBakeSessions())).toBe(przed);
    expect(getActiveBake()).toBeNull();
  });

  it('trwajaceWypieki, czyTrwaWypiek, utrwalWypiekZPamieci i przerwijWypiek: zapis, pamięć, brak; przerwanie jednego nie rusza drugiego', async () => {
    expect(await czyTrwaWypiek()).toBe(false);
    expect(await trwajaceWypieki()).toEqual([]);
    expect(await utrwalWypiekZPamieci()).toBe(true);
    await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    // Zmiana M3 D4b: wpis niesie też klucz bieżącego kroku (treść pytania przy starcie, przegląd roli 04) — id i nazwa
    // sprawdzane dokładnie jak dotąd, krok osobno
    const idINazwa = async () => (await trwajaceWypieki()).map(({ id, nazwa }) => ({ id, nazwa }));
    expect(await idINazwa()).toEqual([{ id: STARY_ID, nazwa: 'Wypiek bez receptury' }]);
    expect((await trwajaceWypieki())[0].krok).toBe('Dokarmienie zakwasu (osiągnięcie szczytu)');
    setActiveBake({ id: DRUGI_ID, recipeName: 'Pizza', startedAt: DRUGI, currentStageId: 'x' });
    expect(await idINazwa()).toEqual([{ id: STARY_ID, nazwa: 'Wypiek bez receptury' }, { id: DRUGI_ID, nazwa: 'Pizza' }]);
    expect(await utrwalWypiekZPamieci()).toBe(true);
    expect(await idsZapisu()).toEqual([STARY_ID, DRUGI_ID]);
    await przerwijWypiek(DRUGI_ID);
    expect(getActiveBake()).toBeNull();
    expect(await idsZapisu()).toEqual([STARY_ID]);
    expect(await czyTrwaWypiek()).toBe(true);
    await przerwijWypiek(STARY_ID);
    expect(await czyTrwaWypiek()).toBe(false);
    expect(mockResync).toHaveBeenCalledTimes(2);
  });
});
