// Z-3 z zadania 080 (M2, eksport web en-US): tytuły zakładek i nagłówków zostawały po polsku, bo opcje nawigacji
// liczone były raz, przed initLanguage, bez ponownego renderu po zmianie języka. Zmiana języka → tytuły zakładek
// i nagłówków w nowym języku [M1-audytor-generalny-093].
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { setLang, t, type Lang } from '../src/lib/i18n';
import { MASTER_RECIPES } from '../src/recipes/presets';

type Opcje = { title?: string; headerBackTitle?: string };
const mockOpcje = new Map<string, Opcje>();
const mockSurowe = new Map<string, unknown>();

jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const kontener = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  const Screen = ({ name, options }: { name: string; options?: Opcje | ((a: { route: { params: object } }) => Opcje) }) => {
    mockSurowe.set(name, options);
    mockOpcje.set(name, typeof options === 'function' ? options({ route: { params: {} } }) : options ?? {});
    return null;
  };
  const Tabs = Object.assign((p: { children: React.ReactNode }) => kontener(p), { Screen });
  const Stack = Object.assign((p: { children: React.ReactNode }) => kontener(p), { Screen });
  return { Tabs, Stack, router: { push: jest.fn() } };
});
jest.mock('expo-router/react-navigation', () => ({ getFocusedRouteNameFromRoute: () => undefined }));

/* eslint-disable @typescript-eslint/no-require-imports */
const UKLADY: Array<[string, React.ComponentType]> = [
  ['(tabs)', require('../app/(tabs)/_layout').default],
  ['dzis', require('../app/(tabs)/(dzis)/_layout').default],
  ['receptury', require('../app/(tabs)/receptury/_layout').default],
  ['zakwasy', require('../app/(tabs)/zakwasy/_layout').default],
  ['dziennik', require('../app/(tabs)/dziennik/_layout').default],
];
/* eslint-enable @typescript-eslint/no-require-imports */

const tytuly = () => ({
  zakladki: ['(dzis)', 'receptury', 'zakwasy', 'dziennik'].map((n) => mockOpcje.get(n)?.title),
  planWypieku: mockOpcje.get('harmonogram')?.title,
  wsteczReceptury: mockOpcje.get('receptura')?.headerBackTitle,
});

describe('Z-3: zmiana języka przelicza tytuły nawigacji (093)', () => {
  afterEach(() => act(() => setLang('pl')));

  it.each<[Lang, string[], string]>([
    ['de', ['Heute', 'Rezepturen', 'Sauerteige', 'Tagebuch'], 'Backplan'],
    ['en', ['Today', 'Recipes', 'Starters', 'Journal'], 'Bake plan'],
  ])('po przełączeniu na %s tytuły zakładek i „Plan wypieku” są w tym języku', (l, zakladki, plan) => {
    act(() => setLang('pl'));
    const drzewa: renderer.ReactTestRenderer[] = [];
    act(() => {
      for (const [, U] of UKLADY) drzewa.push(renderer.create(<U />));
    });
    expect(tytuly().zakladki).toEqual(['Dziś', 'Receptury', 'Zakwasy', 'Dziennik']);
    act(() => setLang(l));
    expect(tytuly()).toEqual({ zakladki, planWypieku: plan, wsteczReceptury: zakladki[1] });
    act(() => drzewa.forEach((d) => d.unmount()));
  });

  it('tytuł ekranu receptury bazowej w języku aplikacji; parametr (zapisana nazwa PL) bez zmian', () => {
    const nazwa = MASTER_RECIPES[0].namePl;
    let d!: renderer.ReactTestRenderer;
    const [, Receptury] = UKLADY[2];
    act(() => {
      d = renderer.create(<Receptury />);
    });
    act(() => setLang('de'));
    const opcjeReceptury = mockSurowe.get('receptura') as (a: { route: { params: { nazwa: string } } }) => Opcje;
    expect(opcjeReceptury({ route: { params: { nazwa } } }).title).toBe(t(nazwa));
    expect(t(nazwa)).not.toBe(nazwa);
    act(() => d.unmount());
  });
});