/**
 * M3 P-b2: przelicznik hydratacji zakwasu i wylewki (przepisy na resztki zakwasu) w Basic, poza kartą proporcji
 * dokarmiania (Pro, BR-ZAKW-002). Decyzja właściciela przez M1, 2026-10-22: „2 zgodnie z rekomendacja” (opcja a; przegląd
 * P-a P2-5; D-117). W-01 (Basic w całości) i szczegóły Basic („Basic tylko rośnie”, BASIC_SZCZEGOLY, basic-1.0.json).
 * Oba wejścia są w 1.0 ukryte jako PÓŹNIEJ (F-49, F-47; D-043, src/lib/wejscia-pozniej.ts) — test włącza je atrapą, żeby
 * sprawdzić przypisanie do Basic; widoczność w 1.0 to decyzja zakresu (rola 03), nie tej partii.
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
  const nawigacja = { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
  return {
    get router() {
      return nawigacja;
    },
    useRouter: () => nawigacja,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children), { Screen: () => null }),
  };
});
let mockWidoczne = true;
jest.mock('../lib/wejscia-pozniej', () => {
  const prawdziwy = jest.requireActual('../lib/wejscia-pozniej');
  return {
    ...prawdziwy,
    wejscieWidoczne: (w: string) => ((w === 'konwerter-zakwasu' || w === 'odrzut-zakwasu') ? mockWidoczne : prawdziwy.wejscieWidoczne(w)),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { PaywallModal } from '../components/PaywallModal';
import { StarterConverterModal } from '../components/StarterConverterModal';
import { DiscardRecipesModal } from '../components/DiscardRecipesModal';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { BASIC_SZCZEGOLY } from '../lib/platnosci/konfiguracja';
import { bezUprawnienia } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const ekranPro = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const przyciski = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
/** Element leży w obszarze BlokadaFunkcji (wiersz albo treść). */
const wBlokadzie = (n: renderer.ReactTestInstance): boolean => {
  for (let p: renderer.ReactTestInstance | null = n; p; p = p.parent) if (typeof p.props?.testID === 'string' && p.props.testID.startsWith('blokada-')) return true;
  return false;
};

let tree: renderer.ReactTestRenderer | null = null;
async function zamontuj() {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><ZakwasScreen /></AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}

beforeEach(async () => {
  mockWidoczne = true;
  _resetMemStore();
  bezUprawnienia();
  await initDatabase();
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
});

describe('W-01 (P-b2): przelicznik hydratacji i wylewki w Basic, proporcje dokarmiania w Pro', () => {
  it.each([
    ['przelicznik hydratacji', 'open-converter-btn', StarterConverterModal],
    ['wylewki', 'open-discard-recipes-btn', DiscardRecipesModal],
  ] as const)('%s: bez Pro widoczny poza kartą proporcji, otwiera się bez ekranu Pro', async (_n, testID, Okno) => {
    const root = await zamontuj();
    const p = przyciski(root, testID);
    expect(p.length).toBeGreaterThan(0);
    expect(wBlokadzie(p[0])).toBe(false);
    await act(async () => p[0].props.onPress());
    await flush();
    expect(ekranPro(root)).toBe(false);
    expect(root.findByType(Okno).props.visible).toBe(true);
  });

  it('proporcje dokarmiania (BR-ZAKW-002) zostają za ekranem Pro z oznaczeniem „Pro”', async () => {
    const root = await zamontuj();
    const wiersz = przyciski(root, 'blokada-proporcje-zakwasu')[0];
    expect(wiersz.findAll((n) => n.props?.testID === 'oznaczenie-pro').length).toBeGreaterThan(0);
    await act(async () => wiersz.props.onPress());
    await flush();
    expect(ekranPro(root)).toBe(true);
  });

  it('szczegóły Basic: przelicznik i wylewki na liście „Basic tylko rośnie”', () => {
    expect(BASIC_SZCZEGOLY).toEqual(expect.arrayContaining(['zakwas-przelicznik-hydratacji', 'zakwas-wylewki']));
  });

  it('w 1.0 oba wejścia zostają ukryte jako PÓŹNIEJ (D-043), bez zmiany zakresu w tej partii', async () => {
    mockWidoczne = false;
    const root = await zamontuj();
    expect(przyciski(root, 'open-converter-btn')).toHaveLength(0);
    expect(przyciski(root, 'open-discard-recipes-btn')).toHaveLength(0);
  });
});
