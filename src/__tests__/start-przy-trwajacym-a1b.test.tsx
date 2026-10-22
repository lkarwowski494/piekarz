/**
 * a1b: „Zacznij wypiek” w planie robiło setActiveBake(nowy) bez sprawdzenia, czy trwa inny wypiek; Stolnica
 * (pickBakeSession) zastępowała wtedy zapis `active_bake_session`, a stan pierwszego wypieku przepadał bez pytania.
 * Teraz przy trwającym wypieku pytanie z trzema wyborami: „Wróć do trwającego” (domyślne, na Stolnicę bez zmian),
 * „Przerwij tamten i zacznij nowy” (przerwanie jak na Stolnicy: sesja, powiadomienia; potem start nowego), „Anuluj”.
 * Bez trwającego wypieku start jak dotąd, bez pytania [M3 p1b a1b].
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush, navigate: jest.fn(), replace: jest.fn() }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
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
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
import { zacznijWypiekBezReceptury } from '../../tests/helpers/wypiek';
import { setLang } from '../lib/i18n';
import { przerwijSesjeWypieku, czyTrwaWypiek } from '../lib/przerwij-wypiek';

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
  const [tytul, tresc, przyciski] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string, Przycisk[]];
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

describe('a1b: start drugiego wypieku przy trwającym', () => {
  const STARY = Date.now() - 600_000;
  const STARY_ID = `bake_${STARY}`;

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

  it('bez trwającego wypieku: start jak dotąd, bez pytania', async () => {
    const harm = await nacisnijStart();
    act(() => harm.unmount());
    expect(alertSpy).not.toHaveBeenCalled();
    expect(getActiveBake()).not.toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/stolnica');
  });

  it.each([
    ['zapis sesji (po restarcie, pamięć pusta)', 'zapis'],
    ['wypiek w pamięci (zapis jeszcze nie powstał)', 'pamiec'],
  ])('trwa inny wypiek: %s → pytanie z trzema wyborami, nic nie zmienione', async (_opis, zrodlo) => {
    let staryWPamieci: ReturnType<typeof getActiveBake> = null;
    if (zrodlo === 'zapis') {
      await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    } else {
      staryWPamieci = { id: STARY_ID, recipeName: 'Stary', startedAt: STARY, currentStageId: 'x', zaczetyZDostepem: true };
      setActiveBake(staryWPamieci);
    }
    const zapisPrzed = JSON.stringify(await loadBakeSession());

    const harm = await nacisnijStart();
    act(() => harm.unmount());

    expect(alertSpy).toHaveBeenCalledTimes(1);
    const { tytul, przyciski } = ostatniAlert();
    expect(tytul).toBe('Trwa już inny wypiek');
    expect(przyciski.map((p) => p.text)).toEqual(['Wróć do trwającego', 'Przerwij tamten i zacznij nowy', 'Anuluj']);
    expect(przyciski[0].isPreferred).toBe(true);
    expect(przyciski[1].style).toBe('destructive');
    expect(przyciski[2].style).toBe('cancel');
    // Do odpowiedzi użytkownika stary wypiek nietknięty: ani zapis, ani pamięć, ani przejście na Stolnicę
    expect(JSON.stringify(await loadBakeSession())).toBe(zapisPrzed);
    expect(getActiveBake()).toBe(staryWPamieci);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('„Wróć do trwającego”: Stolnica bez zmian zapisu', async () => {
    await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    const zapisPrzed = JSON.stringify(await loadBakeSession());
    const harm = await nacisnijStart();
    act(() => harm.unmount());

    await act(async () => {
      ostatniAlert().przyciski[0].onPress?.();
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/stolnica');
    expect(JSON.stringify(await loadBakeSession())).toBe(zapisPrzed);
    expect(getActiveBake()).toBeNull();
    expect(mockResync).not.toHaveBeenCalled();
  });

  it('„Przerwij tamten i zacznij nowy”: stara sesja wyczyszczona z powiadomieniami, nowy wypiek zaczęty', async () => {
    await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    const harm = await nacisnijStart();
    act(() => harm.unmount());

    await act(async () => {
      ostatniAlert().przyciski[1].onPress?.();
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });

    expect(await loadBakeSession()).toBeNull();
    expect(mockResync).toHaveBeenCalled();
    const nowy = getActiveBake();
    expect(nowy).not.toBeNull();
    expect(nowy!.id).not.toBe(STARY_ID);
    expect(nowy!.steps!.length).toBeGreaterThan(0);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/stolnica');
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

  it('czyTrwaWypiek i przerwijSesjeWypieku: zapis, pamięć, brak', async () => {
    expect(await czyTrwaWypiek()).toBe(false);
    await zacznijWypiekBezReceptury(STARY, { zaczetyZDostepem: true });
    expect(await czyTrwaWypiek()).toBe(true);
    await przerwijSesjeWypieku();
    expect(await czyTrwaWypiek()).toBe(false);
    setActiveBake({ id: STARY_ID, recipeName: 'Stary', startedAt: STARY, currentStageId: 'x' });
    expect(await czyTrwaWypiek()).toBe(true);
    await przerwijSesjeWypieku();
    expect(getActiveBake()).toBeNull();
    expect(mockResync).toHaveBeenCalledTimes(2);
  });
});
