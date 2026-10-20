// Nawigacja D-051 (2a): 4 zakładki Dziś, Receptury, Zakwasy, Dziennik, każda ze stosem z dużym tytułem
// (nawigacja systemowa zamiast CraftHeader, design-spec §4, mapa-rol.md §4); prowadzenie wypieku i Doktor
// Chleba nad zakładkami, bez paska (spec §11b „056”: prowadzenie otwierane z „Dziś”). [M1-audytor-generalny-101]
import fs from 'fs';
import path from 'path';
import React from 'react';
import renderer, { act } from 'react-test-renderer';

type Opcje = Record<string, unknown> & { title?: string; headerRight?: () => React.ReactElement };
const mockZakladki: Array<{ name: string; options: Opcje }> = [];
const mockStos: { screenOptions?: Opcje; ekrany: Array<{ name: string; options: Opcje }> } = { ekrany: [] };

jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Tabs = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Tabs.Screen = ({ name, options }: { name: string; options: Opcje }) => {
    mockZakladki.push({ name, options });
    return null;
  };
  const Stack = ({ screenOptions, children }: { screenOptions?: Opcje; children: React.ReactNode }) => {
    mockStos.screenOptions = screenOptions;
    return ReactMod.createElement(ReactMod.Fragment, null, children);
  };
  Stack.Screen = ({ name, options }: { name: string; options?: Opcje }) => {
    mockStos.ekrany.push({ name, options: options ?? {} });
    return null;
  };
  return { Tabs, Stack, router: { push: jest.fn() }, useRouter: () => ({ push: jest.fn() }) };
});
// Układ korzenia bez startu aplikacji (baza, płatności, znacznik startu): test czyta tylko opcje ekranów
jest.mock('../src/lib/startup-guard', () => ({
  beginStartup: () => new Promise(() => undefined),
  markStartupSucceeded: jest.fn(),
  STARTUP_MILESTONE_MS: 1,
}));
jest.mock('../src/components/StorageGate', () => ({
  StorageGate: ({ children }: { children: React.ReactNode }) => children,
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const uklad = (plik: string) => {
  mockStos.screenOptions = undefined;
  mockStos.ekrany = [];
  const Komponent = require(plik).default;
  let t!: renderer.ReactTestRenderer;
  act(() => {
    t = renderer.create(<Komponent />);
  });
  act(() => t.unmount());
  const screenOptions: Opcje = mockStos.screenOptions ?? {};
  return { screenOptions, ekrany: [...mockStos.ekrany] };
};
const testIdPrzycisku = (o: Opcje) => {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(o.headerRight!());
  });
  const id = tree.root.findAll((n) => typeof n.props.testID === 'string')[0]?.props.testID;
  act(() => tree.unmount());
  return id;
};

describe('101 / D-051 2a: 4 zakładki i nawigacja systemowa z dużym tytułem', () => {
  it('pasek ma dokładnie 4 zakładki w kolejności Dziś, Receptury, Zakwasy, Dziennik', () => {
    mockZakladki.length = 0;
    const Tabs = require('../app/(tabs)/_layout').default;
    let t!: renderer.ReactTestRenderer;
    act(() => {
      t = renderer.create(<Tabs />);
    });
    act(() => t.unmount());
    expect(mockZakladki.map((z) => z.name)).toEqual(['(dzis)', 'receptury', 'zakwasy', 'dziennik']);
    expect(mockZakladki.map((z) => z.options.title)).toEqual(['Dziś', 'Receptury', 'Zakwasy', 'Dziennik']);
    expect(mockZakladki.every((z) => z.options.href === undefined)).toBe(true);
  });

  it.each([
    ['../app/(tabs)/(dzis)/_layout', 'Dziś'],
    ['../app/(tabs)/receptury/_layout', 'Receptury'],
    ['../app/(tabs)/zakwasy/_layout', 'Zakwasy'],
    ['../app/(tabs)/dziennik/_layout', 'Dziennik'],
  ])('%s: stos z dużym tytułem „%s”', (plik, tytul) => {
    const { screenOptions, ekrany } = uklad(plik);
    expect(screenOptions.headerLargeTitleEnabled).toBe(true);
    expect(screenOptions.headerShown).toBe(true);
    expect(ekrany.find((e) => e.name === 'index')?.options.title).toBe(tytul);
  });

  it('Receptury: plan wypieku w tym samym stosie, zwykły tytuł „Plan wypieku”, wejście z paska nawigacji', () => {
    const { ekrany } = uklad('../app/(tabs)/receptury/_layout');
    const plan = ekrany.find((e) => e.name === 'harmonogram');
    expect(plan?.options).toMatchObject({ title: 'Plan wypieku', headerLargeTitleEnabled: false });
    expect(testIdPrzycisku(ekrany.find((e) => e.name === 'index')!.options)).toBe('open-plan-btn');
  });

  it('Zakwasy: skrót do Doktora Chleba w pasku nawigacji', () => {
    const { ekrany } = uklad('../app/(tabs)/zakwasy/_layout');
    expect(testIdPrzycisku(ekrany.find((e) => e.name === 'index')!.options)).toBe('zakwas-doctor-shortcut-btn');
  });

  it('prowadzenie (Stolnica) i Doktor Chleba otwierają się nad zakładkami, z nagłówkiem systemowym', () => {
    const { ekrany } = uklad('../app/_layout');
    expect(ekrany.map((e) => e.name)).toEqual(['(tabs)', 'stolnica', 'doktor']);
    const stolnica = ekrany.find((e) => e.name === 'stolnica')!.options;
    expect(stolnica).toMatchObject({ headerShown: true, title: 'Stolnica', headerLargeTitleEnabled: false });
    expect(testIdPrzycisku(stolnica)).toBe('stolnica-doctor-shortcut-btn');
    expect(ekrany.find((e) => e.name === 'doktor')!.options).toMatchObject({ headerShown: true, title: 'Doktor Chleba' });
  });

  it('żaden ekran w app/ nie rysuje własnego nagłówka CraftHeader', () => {
    const walk = (d: string): string[] =>
      fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    const zCraftHeader = walk(path.resolve(__dirname, '../app')).filter((f) => fs.readFileSync(f, 'utf8').includes('CraftHeader'));
    expect(zCraftHeader).toEqual([]);
  });
});
