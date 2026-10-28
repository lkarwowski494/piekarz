/**
 * Podpowiedź rytmu z historii w planie wypieku (M3 D7; BR-KAL-014, D-114): gdy ostatnie wypieki z Dziennika kończyły
 * się zwykle tego samego dnia tygodnia, plan proponuje ten dzień jako dzień „gotowe” i mówi skąd propozycja; użytkownik
 * zmienia dzień jak zwykle. Dzień ze skrótu arkusza dnia (BR-KAL-015) ma pierwszeństwo; bez rytmu — jutro, bez zdania.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn() }),
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

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, setActiveBake, _resetMemStore, saveBakeLog, getBakeLogs, deleteBakeLog } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';
import { ustawDzienGotowe } from '../lib/plan-receptury';
import { addCalendarDays, startOfLocalDay } from '../core/dzien-lokalny';
import { godzinaPola } from '../../tests/helpers/plan-godzina';

const poId = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button');
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
const wybrany = (root: renderer.ReactTestInstance) => [
  ...new Set(
    root
      .findAll((n) => typeof n.type !== 'string' && /^plan-dzien-\d+$/.test(String(n.props.testID)) && n.props.accessibilityRole === 'button' && n.props.accessibilityState?.selected === true)
      .map((n) => String(n.props.testID))
  ),
];

const drzewa: renderer.ReactTestRenderer[] = [];
async function render(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<HarmonogramScreen />);
  });
  drzewa.push(tree!);
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
  return tree!;
}

const SOBOTA = 6;
/** Ostatnie `n` sobót przed dziś (koniec wypieku 15:00). */
async function soboty(n: number) {
  const dzis = startOfLocalDay(Date.now());
  const wstecz = (new Date(dzis).getDay() - SOBOTA + 7) % 7 || 7;
  for (let i = 0; i < n; i++) {
    const dzien = addCalendarDays(dzis, -wstecz - 7 * i);
    const koniec = dzien + 15 * 3_600_000;
    await saveBakeLog({ id: `sob${i}`, recipeName: 'Chleb', startedAt: koniec - 8 * 3_600_000, finishedAt: koniec });
  }
}
const doSoboty = () => (SOBOTA - new Date().getDay() + 7) % 7 || 7;
const ZDANIE = 'Propozycja z Dziennika: sobota, jak ostatnie wypieki. Możesz wybrać inny dzień.';

// Zegar stały w czasie lokalnym strefy procesu (TZ Matrix): wynik nie zależy od chwili uruchomienia. Dawniej test brał
// Date.now() i w piątek wieczorem (Tokio, Sydney, Auckland ok. 08:30 UTC) dzień przeskakiwał na niedzielę (CI 39923870529) [M3 TZ]
const zegar = (dzien: number, h: number, min = 0) =>
  jest.useFakeTimers({ now: new Date(2026, 9, dzien, h, min, 0, 0), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
const SRODA_14 = () => zegar(21, 14); // środa 21.10.2026 14:00: sobota za 3 dni, osiągalna z godziną bez nocy
// Plan domyślny trwa 29 h 45 min: w piątek 17:30 najwcześniej sobota 23:15 (tylko z krokiem w nocy), w piątek 21:30
// najwcześniej niedziela 03:15 (sobota nieosiągalna)
const PIATEK_1730 = () => zegar(23, 17, 30);
const PIATEK_2130 = () => zegar(23, 21, 30);

describe('D7: podpowiedź rytmu w planie wypieku', () => {
  beforeEach(async () => {
    SRODA_14();
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    ustawDzienGotowe(null);
    await initDatabase();
    await saveBakeSession(null);
    for (const b of await getBakeLogs()) await deleteBakeLog(b.id);
  });
  // Zegar minutowy planu: odmontowanie, żeby nic nie aktualizowało ekranu po teście
  afterEach(() => {
    for (const d of drzewa.splice(0)) act(() => d.unmount());
    jest.useRealTimers();
  });

  it('BR-KAL-014 Zwykle w sobotę: cztery ostatnie wypieki w sobotę → wybrana najbliższa sobota ze zdaniem o propozycji; dzień można zmienić', async () => {
    await soboty(4);
    const harm = await render();
    expect(wybrany(harm.root)).toEqual([`plan-dzien-${doSoboty()}`]);
    expect(teksty(harm.root)).toContain('Propozycja z Dziennika: sobota, jak ostatnie wypieki. Możesz wybrać inny dzień.');
    const inny = doSoboty() === 1 ? 2 : 1;
    await act(async () => poId(harm.root, `plan-dzien-${inny}`)[0].props.onPress());
    expect(wybrany(harm.root)).toEqual([`plan-dzien-${inny}`]);
  });

  it('BR-KAL-014 bez rytmu (dwa wypieki) — dzień jak bez historii (jutro albo najbliższy bez nocy) i bez zdania o propozycji', async () => {
    const bezHistorii = await render();
    const domyslny = wybrany(bezHistorii.root);
    act(() => bezHistorii.unmount());
    drzewa.splice(drzewa.indexOf(bezHistorii), 1);
    await soboty(2);
    const harm = await render();
    expect(wybrany(harm.root)).toEqual(domyslny);
    expect(teksty(harm.root)).not.toContain('Propozycja z Dziennika');
  });

  it('BR-KAL-014 dzień ze skrótu arkusza dnia ma pierwszeństwo przed rytmem', async () => {
    await soboty(4);
    const dzien = doSoboty() === 3 ? 4 : 3;
    ustawDzienGotowe(addCalendarDays(startOfLocalDay(Date.now()), dzien));
    const harm = await render();
    expect(wybrany(harm.root)).toEqual([`plan-dzien-${dzien}`]);
    expect(teksty(harm.root)).not.toContain('Propozycja z Dziennika');
  });

  // Dzień założony (rytm albo skrót) nie zmienia się po cichu: godzina bez nocy tylko w tym dniu, a bez niej
  // najwcześniejsza możliwa w tym dniu (baner nocy); dzień rytmu nieosiągalny → ten sam dzień tygodnia tydzień później [M3 TZ]
  it('BR-KAL-014 piątek 17:30, sobota osiągalna tylko z krokiem w nocy: dzień zostaje sobotą, godzina najwcześniejsza (23:15)', async () => {
    PIATEK_1730();
    await soboty(4);
    const harm = await render();
    expect(wybrany(harm.root)).toEqual(['plan-dzien-1']);
    expect(godzinaPola(harm.root)).toBe(23 * 60 + 15);
    expect(teksty(harm.root)).toContain(ZDANIE);
    expect(teksty(harm.root)).not.toContain('Nie zdążysz na tę godzinę');
  });

  it('BR-KAL-014 piątek 21:30, najbliższa sobota nieosiągalna: propozycja na sobotę za tydzień (+7, w zasięgu D-108), zdanie prawdziwe', async () => {
    PIATEK_2130();
    await soboty(4);
    const harm = await render();
    expect(wybrany(harm.root)).toEqual(['plan-dzien-8']);
    expect(new Date(addCalendarDays(startOfLocalDay(Date.now()), 8)).getDay()).toBe(SOBOTA);
    expect(teksty(harm.root)).toContain(ZDANIE);
    expect(teksty(harm.root)).not.toContain('Nie zdążysz na tę godzinę');
  });

  it('BR-KAL-015 piątek 17:30, skrót arkusza dnia na sobotę: dzień zostaje sobotą (bez przeskoku na niedzielę)', async () => {
    PIATEK_1730();
    ustawDzienGotowe(addCalendarDays(startOfLocalDay(Date.now()), 1));
    const harm = await render();
    expect(wybrany(harm.root)).toEqual(['plan-dzien-1']);
    expect(godzinaPola(harm.root)).toBe(23 * 60 + 15);
  });

  it('BR-KAL-015 piątek 21:30, skrót na dziś (dzień nieosiągalny): dzień zostaje, komunikat „Nie zdążysz” z najwcześniejszą godziną', async () => {
    PIATEK_2130();
    ustawDzienGotowe(startOfLocalDay(Date.now()));
    const harm = await render();
    expect(wybrany(harm.root)).toEqual(['plan-dzien-0']);
    expect(teksty(harm.root)).toContain('Nie zdążysz na tę godzinę');
    // 03:15 czasu ściennego, w Europe/Warsaw 02:15 (zmiana czasu 25.10 w nocy)
    expect(teksty(harm.root)).toMatch(/Najwcześniej chleb będzie gotowy pojutrze o 0[23]:15\./);
  });
});
