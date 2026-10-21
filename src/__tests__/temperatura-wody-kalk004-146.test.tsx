/**
 * M1-audytor-generalny-146 (01-odkrywanie-504), BR-KALK-004: arkusz „Temperatura wody” ma pola temperatury mąki,
 * kuchni, zakwasu albo zaczynu i przyrostu od tarcia; pusty wpis daje prośbę o uzupełnienie zamiast wyniku (RD-16).
 * Wzór bez zaczynu (n = 3), gdy receptura nie ma zakwasu ani zaczynu (RD-16-W1), z zaczynem n = 4 (RD-16-W2).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { clearPendingRecipeToLoad } from '../lib/recipe-navigation';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang, t } from '../lib/i18n';
import { formatTemperature } from '../lib/unit-converter';

jest.setTimeout(30000);

jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = () => null;
  return { Stack, useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), setParams: jest.fn() }), useLocalSearchParams: () => ({}) };
});
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const host = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const nacisnij = async (root: renderer.ReactTestInstance, id: string) => {
  const el = root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function')[0];
  if (!el) throw new Error(`brak ${id}`);
  await act(async () => {
    el.props.onPress();
  });
};
const wpisz = async (root: renderer.ReactTestInstance, id: string, wartosc: string) => {
  const pole = host(root, id)[0];
  if (!pole) throw new Error(`brak pola ${id}`);
  await act(async () => {
    pole.props.onFocus?.();
    pole.props.onChangeText(wartosc);
  });
  await act(async () => {
    pole.props.onBlur?.({});
  });
};

let tree: renderer.ReactTestRenderer | null = null;
async function ekran() {
  await act(async () => {
    tree = renderer.create(<EkranReceptury />);
  });
  return tree!.root;
}

/** Ustawia DDT 25 °C (domyślne) i temperatury z wektora RD-16. */
async function dane(root: renderer.ReactTestInstance, zaczyn: string | null) {
  await nacisnij(root, 'water-temp-btn');
  await wpisz(root, 'ddt-flour-temp-input', '20');
  await wpisz(root, 'ddt-room-temp-input', '22');
  await wpisz(root, 'ddt-friction-input', '10');
  if (zaczyn !== null) await wpisz(root, 'ddt-starter-temp-input', zaczyn);
}

describe('BR-KALK-004 Temperatura wody dla docelowej temperatury ciasta', () => {
  beforeEach(async () => {
    zUprawnieniem();
    setLang('pl');
    _resetMemStore();
    setActiveBake(null);
    clearPendingRecipeToLoad();
    await initDatabase();
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    setLang('pl');
  });

  it('BR-KALK-004 Ciasto bez zaczynu: DDT 25 °C, mąka 20 °C, kuchnia 22 °C, tarcie 10 °C → 23 °C (RD-16-W1)', async () => {
    const root = await ekran();
    await nacisnij(root, 'edit-ingredients-btn');
    await wpisz(root, 'starter-pct-input', '0');
    await dane(root, null);
    expect(host(root, 'ddt-starter-temp-input')).toHaveLength(0);
    expect(tekst(host(root, 'ddt-water-result')[0])).toContain(formatTemperature(23));
  });

  it('BR-KALK-004 Ciasto z zaczynem: dane jak wyżej i zakwas 24 °C → 24 °C (RD-16-W2)', async () => {
    const root = await ekran();
    await dane(root, '24');
    expect(tekst(host(root, 'ddt-water-result')[0])).toContain(formatTemperature(24));
  });

  it('BR-KALK-004 Brak temperatury mąki: puste pole → prośba o uzupełnienie zamiast wyniku (RD-16-W4)', async () => {
    const root = await ekran();
    await dane(root, '24');
    await wpisz(root, 'ddt-flour-temp-input', '');
    expect(host(root, 'ddt-water-result')).toHaveLength(0);
    const prosba = host(root, 'ddt-missing-input');
    expect(prosba).toHaveLength(1);
    expect(tekst(prosba[0])).toBe('Uzupełnij pole „Temperatura mąki”, żeby policzyć temperaturę wody.');
    expect(t('Uzupełnij pole „{pole}”, żeby policzyć temperaturę wody.', { pole: 'Temperatura mąki' })).toBe(tekst(prosba[0]));
  });

  it('po angielsku: etykiety pól i prośba', async () => {
    setLang('en');
    const root = await ekran();
    await dane(root, '24');
    await wpisz(root, 'ddt-room-temp-input', '');
    expect(tekst(host(root, 'ddt-missing-input')[0])).toBe('Fill in "Kitchen temperature" to calculate the water temperature.');
    expect(host(root, 'ddt-starter-temp-input')[0].props.accessibilityLabel).toBe('Starter or preferment temperature');
    expect(host(root, 'ddt-friction-input')[0].props.accessibilityLabel).toBe('Friction factor');
  });
});
