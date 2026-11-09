/**
 * BR-ETAP-001 „Gotowość żytniego ciasta drożdżowego” (ER-88, docs/brd/wymagania-wypiek.md) [07-przek-2; 08-p3b-N3]:
 * wypiek wersji drożdżowej chleba żytniego 100% w formie — przy pierwszym rośnięciu zdanie, że czasy są wskazówką
 * (DRO-MOD-016), przy drugim „Zostaw ciasto w formie, aż jego powierzchnia dojdzie do brzegu formy.” (ZYT-ETA-005:
 * „until the dough surface reached the top of the tin”, Stępniewska i in., Foods 2019), bez testu palca, który opisuje
 * ciasto pszenne z glutenem (ZYT-CIA-001; D-256 pkt c, D-258). Kontrola: graham na drożdżach ma test palca.
 * Wejście „test palca” jest za flagą wejść późniejszych, więc test je włącza: brak wejścia przy życie wynika z kroku.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('../lib/wejscia-pozniej', () => ({ wejscieWidoczne: () => true }));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, getActiveBake, setActiveBake } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { calculateDoughRecipe } from '../core/domain-rules';
import { formulaWersji } from '../recipes/wersje-drozdzowe';
import { MASTER_RECIPES } from '../recipes/presets';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const WSKAZOWKA = 'Czasy są wskazówką, bo tempo rośnięcia zależy od składników, siły ciasta, temperatury i wilgotności.';
const POWIERZCHNIA = 'Zostaw ciasto w formie, aż jego powierzchnia dojdzie do brzegu formy.';
const PALEC = /palc/i;

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!;
}
async function pressId(tree: renderer.ReactTestRenderer, testID: string): Promise<void> {
  const all = tree.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
  expect([testID, all.length > 0]).toEqual([testID, true]);
  await act(async () => {
    await all[all.length - 1].props.onPress();
  });
  await flush();
}

const START = new Date(2026, 10, 9, 8, 0).getTime();

/** Wypiek wersji drożdżowej z planu; zwraca ekran prowadzenia i funkcję przejścia na krok o nazwie (tekst ekranu + wejście w test palca). */
async function prowadzenie(id: string) {
  const p = MASTER_RECIPES.find((r) => r.id === id)!;
  const recipeFormula = formulaWersji(p.formula, id, 'drozdze');
  ustawRecepturePlanu({ recipeName: p.namePl, recipeId: id, wersja: 'drozdze', calculatedRecipe: calculateDoughRecipe(recipeFormula), recipeFormula });
  const plan = await render(<HarmonogramScreen />);
  await pressId(plan, 'plan-start-bake-btn');
  act(() => plan.unmount());
  const tree = await render(<StolnicaScreen />);
  const kroki = getActiveBake()?.steps ?? [];
  const naKroku = async (nazwa: string) => {
    const nr = kroki.findIndex((k) => k.name === nazwa) + 1;
    expect([nazwa, nr > 0]).toEqual([nazwa, true]);
    const naglowek = `Krok ${nr} z ${kroki.length}`;
    for (let i = 0; i < 10 && !textOf(tree.toJSON()).includes(naglowek); i++) await pressId(tree, 'next-or-finish-step-btn');
    const ekran = textOf(tree.toJSON());
    expect(ekran).toContain(naglowek);
    return { ekran, testPalca: tree.root.findAll((n) => n.props?.testID === 'stolnica-poke-test-btn').length > 0 };
  };
  return { tree, naKroku };
}

describe('BR-ETAP-001 Gotowość żytniego ciasta drożdżowego (ER-88)', () => {
  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => START);
    _resetMemStore();
    setActiveBake(null);
    await saveBakeSession(null);
    await initDatabase();
    zUprawnieniem();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    ustawRecepturePlanu(null);
  });

  it('BR-ETAP-001 Gotowość żytniego ciasta drożdżowego: pierwsze rośnięcie — czasy są wskazówką; drugie — powierzchnia ciasta przy brzegu formy; bez testu palca', async () => {
    const { tree, naKroku } = await prowadzenie('rye_100_pan');
    const pierwsze = await naKroku('Pierwsze rośnięcie');
    expect(pierwsze.ekran).toContain(WSKAZOWKA);
    expect({ palec: PALEC.test(pierwsze.ekran), wejscie: pierwsze.testPalca }).toEqual({ palec: false, wejscie: false });
    const drugie = await naKroku('Drugie rośnięcie');
    expect(drugie.ekran).toContain(POWIERZCHNIA);
    expect({ palec: PALEC.test(drugie.ekran), wejscie: drugie.testPalca }).toEqual({ palec: false, wejscie: false });
    act(() => tree.unmount());
  });

  it('BR-ETAP-001 Gotowość żytniego ciasta drożdżowego: kontrola — graham na drożdżach przy drugim rośnięciu ma test palca i wejście do niego, bez zdania o brzegu formy', async () => {
    const { tree, naKroku } = await prowadzenie('graham_bread_honey');
    const drugie = await naKroku('Drugie rośnięcie');
    expect(drugie.ekran).toContain('Ciasto jest gotowe, gdy wgłębienie po naciśnięciu palcem zostaje.');
    expect(drugie.testPalca).toBe(true);
    expect(drugie.ekran).not.toContain(POWIERZCHNIA);
    act(() => tree.unmount());
  });
});
