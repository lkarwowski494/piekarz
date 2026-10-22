/**
 * Podpowiedź rytmu z historii w planie wypieku (M3 D7; BR-KAL-014, D-110): gdy ostatnie wypieki z Dziennika kończyły
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

describe('D7: podpowiedź rytmu w planie wypieku', () => {
  beforeEach(async () => {
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
});
