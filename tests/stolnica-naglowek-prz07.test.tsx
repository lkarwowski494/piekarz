// PRZ-07 (przegląd roli 04, D-107): nagłówek Stolnicy przy 320 pt. Prawe przyciski „Doktor” i „Plan wypieku” mają
// razem ok. 176 pt, więc tytuł „Stolnica” nie mieści się poza osią: przy szerokości ≤ 336 pt tytuł jest pusty (krok i
// przełącznik wypieków mówią, gdzie jesteś). Tekst przycisku nagłówka skaluje się najwyżej 1,5× (jak podpisy zakładek, D-087).
import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

type Opcje = Record<string, unknown>;
const mockStos: { ekrany: Array<{ name: string; props: Opcje }> } = { ekrany: [] };
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = (props: Opcje & { name: string }) => {
    mockStos.ekrany.push({ name: props.name, props });
    return null;
  };
  return { Stack, router: { push: jest.fn() }, useRouter: () => ({ push: jest.fn() }) };
});
jest.mock('../src/lib/startup-guard', () => ({
  beginStartup: () => new Promise(() => undefined),
  markStartupSucceeded: jest.fn(),
  STARTUP_MILESTONE_MS: 1,
}));
jest.mock('../src/components/StorageGate', () => ({
  StorageGate: ({ children }: { children: React.ReactNode }) => children,
}));

/* eslint-disable @typescript-eslint/no-require-imports */
function tytulStolnicy(szerokosc: number): unknown {
  mockStos.ekrany = [];
  mockOkno.width = szerokosc;
  const Layout = require('../app/_layout').default as React.ComponentType;
  let t!: renderer.ReactTestRenderer;
  act(() => {
    t = renderer.create(<Layout />);
  });
  const stolnica = mockStos.ekrany.filter((e) => e.name === 'stolnica').pop();
  act(() => t.unmount());
  return (stolnica?.props.options as Opcje | undefined)?.title;
}

describe('PRZ-07: nagłówek Stolnicy', () => {
  it.each([320, 336])('szerokość %i pt: tytuł pusty (przyciski zajmują prawy róg)', (w) => {
    expect(tytulStolnicy(w)).toBe('');
  });

  it.each([375, 390, 430])('szerokość %i pt: tytuł „Stolnica”', (w) => {
    expect(tytulStolnicy(w)).toBe('Stolnica');
  });

  it('tekst przycisku nagłówka skaluje się najwyżej 1,5×', () => {
    const { PrzyciskNaglowka } = require('../src/components/nawigacja/PrzyciskNaglowka') as typeof import('../src/components/nawigacja/PrzyciskNaglowka');
    let t!: renderer.ReactTestRenderer;
    act(() => {
      t = renderer.create(<PrzyciskNaglowka testID="x" etykieta="Doktor Chleba" tekst="Doktor" onPress={() => undefined} />);
    });
    expect(t.root.findByType(Text).props.maxFontSizeMultiplier).toBe(1.5);
    act(() => t.unmount());
  });
});
