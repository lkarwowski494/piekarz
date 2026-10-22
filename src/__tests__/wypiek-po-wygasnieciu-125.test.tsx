/**
 * Wypiek rozpoczęty z dostępem prowadzi się do końca także po wygaśnięciu próby albo subskrypcji (D-039 pkt 3)
 * [M1-audytor-generalny-125; 02-monetyzacja-501, 01-odkrywanie-501]. Ekrany Harmonogramu i Stolnicy jak w aplikacji
 * (jeden ekran zakupu z AppAccessProvider), zegar ustawiony na kilka godzin doby (SYS-06).
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

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { PaywallModal } from '../components/PaywallModal';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, getActiveBake, setActiveBake, getBakeLogs } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { zacznijWypiekBezReceptury } from '../../tests/helpers/wypiek';
import { zUprawnieniem, bezUprawnienia } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const paywallShown = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const locks = (root: renderer.ReactTestInstance): string[] =>
  root
    .findAll((n) => typeof n.props?.testID === 'string' && n.props.testID.startsWith('blokada-') && typeof n.props.onPress === 'function')
    .map((n) => String(n.props.testID));
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
async function press(tree: renderer.ReactTestRenderer, testID: string): Promise<void> {
  const all = tree.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
  expect(all.length).toBeGreaterThan(0);
  await act(async () => {
    await all[all.length - 1].props.onPress();
  });
  await flush();
}

const PORY = [
  ['08:00', new Date(2026, 9, 21, 8, 0).getTime()],
  ['14:00', new Date(2026, 9, 21, 14, 0).getTime()],
  ['23:55', new Date(2026, 9, 21, 23, 55).getTime()],
] as const;

describe.each(PORY)('Wypiek zaczęty z dostępem po końcu próby, zegar %s (125; BR-ZAK-004 Koniec próby w trakcie wypieku)', (_pora, start) => {
  let now = start;
  beforeEach(async () => {
    now = start;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    _resetMemStore();
    setActiveBake(null);
    await saveBakeSession(null);
    await initDatabase();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('start z Harmonogramu w czasie próby, potem koniec próby: kroki, „Zrobione”, „Cofnij” i zapis wyniku bez ekranu zakupu', async () => {
    zUprawnieniem();
    const plan = await render(<HarmonogramScreen />);
    await press(plan, 'plan-start-bake-btn');
    expect(getActiveBake()?.zaczetyZDostepem).toBe(true);
    act(() => plan.unmount());

    bezUprawnienia(); // próba wygasła bez zakupu
    const tree = await render(<StolnicaScreen />);
    expect(locks(tree.root)).toEqual([]);
    await press(tree, 'next-or-finish-step-btn');
    await press(tree, 'step-undo-btn');
    expect(paywallShown(tree.root)).toBe(false);
    // Do ostatniego kroku i zapis oceny
    for (let i = 0; i < 40 && !textOf(tree.toJSON()).includes('Oceń bochenek'); i++) await press(tree, 'next-or-finish-step-btn');
    const zapisz = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children) === 'Zapisz');
    expect(zapisz.length).toBeGreaterThan(0);
    await act(async () => {
      await zapisz[zapisz.length - 1].props.onPress();
    });
    await flush();
    expect(paywallShown(tree.root)).toBe(false);
    expect((await getBakeLogs()).length).toBe(1);
    act(() => tree.unmount());
  });

  // Przepisane z kontraktu D-038 (po próbie nowy wypiek za ekranem zakupu) na Basic/Pro [M3 P-a]: start wypieku jest
  // w Basic (PR-02 „start wypieku bez planu”), za ekranem Pro tylko „gotowe o…” (BR-HARMO-001…003, D-112, D-113)
  it('po końcu Pro nowy wypiek z planu zaczyna się w Basic; „gotowe o…” otwiera ekran Pro', async () => {
    bezUprawnienia();
    const plan = await render(<HarmonogramScreen />);
    await press(plan, 'blokada-plan-wstecz');
    expect(paywallShown(plan.root)).toBe(true);
    await act(async () => {
      plan.root.findByType(PaywallModal).props.onClose();
    });
    await press(plan, 'plan-start-bake-btn');
    expect(paywallShown(plan.root)).toBe(false);
    expect(getActiveBake()).not.toBeNull();
    act(() => plan.unmount());
  });

  // Przepisane z kontraktu D-038 [M3 P-a]: prowadzenie wypieku jest w Basic, więc kłódki nie ma także przy wypieku
  // jawnie zaczętym bez dostępu (znacznik zostaje w danych, nic od niego nie zależy)
  it('wypiek zapisany przed tą wersją (bez znacznika) i zaczęty bez Pro prowadzą się bez kłódki', async () => {
    bezUprawnienia();
    await zacznijWypiekBezReceptury(now); // zapis sesji sprzed aktualizacji: brak znacznika (wybór P-125 a)
    const stary = await render(<StolnicaScreen />);
    expect(locks(stary.root)).toEqual([]);
    act(() => stary.unmount());

    _resetMemStore();
    await zacznijWypiekBezReceptury(now, { zaczetyZDostepem: false });
    const bez = await render(<StolnicaScreen />);
    expect(locks(bez.root)).toEqual([]);
    expect(paywallShown(bez.root)).toBe(false);
    act(() => bez.unmount());
  });
});
