/**
 * Audyt niezależny D-4: temperatura wody liczyła się ze stałych (receptura.tsx), wzór zawsze 4-czynnikowy, a plan
 * zakładał 23 °C przy 22 °C na ekranie receptury. Pola temperatur i wzór n = 3 bez zakwasu dodał p13b (KALK-004,
 * zadanie 146); tu reszta: plan z „Ułóż plan” bierze temperaturę kuchni z receptury (ta sama liczba na obu
 * ekranach), a do wypieku i dziennika trafia tylko wtedy, gdy użytkownik ją wpisał [audyt-niezalezny D-4].
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: jest.fn(), setParams: jest.fn(), replace: jest.fn() }),
    useLocalSearchParams: () => ({}),
  };
});
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, setActiveBake, _resetMemStore, getActiveBake } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { clearPendingRecipeToLoad } from '../lib/recipe-navigation';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';

jest.setTimeout(20000);

const host = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const nacisnij = async (root: renderer.ReactTestInstance, id: string) => {
  const el = root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function')[0];
  if (!el) throw new Error(`brak ${id}`);
  await act(async () => {
    el.props.onPress();
  });
};
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const teksty = (t: renderer.ReactTestRenderer) =>
  t.root.findAll((n) => (n.type as unknown) === 'Text').map((n) => textOf(n.props.children)).join(' | ');

async function zReceptury(kuchnia?: string): Promise<renderer.ReactTestRenderer> {
  let rec: renderer.ReactTestRenderer | null = null;
  await act(async () => { rec = renderer.create(<EkranReceptury />); });
  if (kuchnia !== undefined) {
    await nacisnij(rec!.root, 'water-temp-btn');
    await act(async () => {
      const pole = host(rec!.root, 'ddt-room-temp-input')[0];
      pole.props.onFocus?.();
      pole.props.onChangeText(kuchnia);
    });
    await act(async () => {
      host(rec!.root, 'ddt-room-temp-input')[0].props.onBlur?.({});
    });
  }
  await nacisnij(rec!.root, 'start-bake-btn');
  act(() => rec!.unmount());
  let plan: renderer.ReactTestRenderer | null = null;
  await act(async () => { plan = renderer.create(<HarmonogramScreen />); });
  await act(async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); });
  return plan!;
}

describe('D-4: temperatura kuchni z receptury w planie', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    clearPendingRecipeToLoad();
    ustawRecepturePlanu(null);
    mockPush.mockClear();
    await initDatabase();
  });
  afterEach(() => ustawRecepturePlanu(null));

  it('kitchen 25 °C typed in "Water Temperature": the plan shows 25 °C and the bake records it', async () => {
    const plan = await zReceptury('25');
    expect(teksty(plan)).toContain('Temperatura w kuchni: 25°C');
    await act(async () => {
      plan.root.findAll((n) => n.props?.testID === 'plan-start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(getActiveBake()?.ambientTempC).toBe(25);
    act(() => plan.unmount());
  });

  it('kitchen temperature not touched: the plan shows the same 22 °C as the recipe, the bake does not record a guess', async () => {
    const plan = await zReceptury();
    expect(teksty(plan)).toContain('Temperatura w kuchni: 22°C');
    await act(async () => {
      plan.root.findAll((n) => n.props?.testID === 'plan-start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(getActiveBake()?.ambientTempC).toBeUndefined();
    act(() => plan.unmount());
  });
});
