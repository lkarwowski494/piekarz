/**
 * D-393 (KO-055, właściciel 2026-11-12: „B: karta wyżej (Recommended)”): na ekranie Zakwasy karta „Cykl dokarmiania”
 * (codzienna akcja: „Podwoił objętość”, „Gotowy do ciasta.”, „Zapisz dokarmienie”) stoi nad kartą „Profil zakwasu”
 * (dane stałe). Dzięki temu ramka 05 pokazuje pas ze spiralą i „Gotowy do ciasta.” bez przewijania na 6,3″ i 6,9″
 * (rachunek kadru: tests/zrzuty-sklepu-kadry.test.ts).
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import ZakwasyScreen from '../../app/(tabs)/zakwasy/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { theme } from '../ui/theme';
import { typografia } from '../ui/tokeny';
import { setLang } from '../lib/i18n';

type Wezel = renderer.ReactTestInstance;
const ROZMIAR_TYTULU_KARTY = typografia.style.tytul2.pt - 2;

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

async function zamontuj(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree;
}

const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
/** Nagłówki kart: tekst z rolą nagłówka w kroju tytułów i rozmiarze karty. */
const naglowkiKart = (root: Wezel): string[] =>
  root
    .findAllByType(Text)
    .filter((n) => n.props.accessibilityRole === 'header')
    .filter((n) => {
      const s = StyleSheet.flatten(n.props.style) ?? {};
      return s.fontSize === ROZMIAR_TYTULU_KARTY && s.fontFamily === theme.typography.krojTytulow;
    })
    .map(tekst);

describe('D-393: kolejność kart na ekranie Zakwasy', () => {
  beforeEach(async () => {
    setLang('pl');
    Object.assign(mockOkno, { fontScale: 1 });
    _resetMemStore();
    zUprawnieniem();
    await initDatabase();
  });

  it('„Cykl dokarmiania” nad „Profilem zakwasu”, reszta kart pod nimi', async () => {
    const tree = await zamontuj(<ZakwasyScreen />);
    const n = naglowkiKart(tree.root);
    const i = (tytul: string) => n.indexOf(tytul);
    expect(i('Cykl dokarmiania')).toBeGreaterThan(-1);
    expect(i('Profil zakwasu')).toBeGreaterThan(-1);
    expect(i('Cykl dokarmiania')).toBeLessThan(i('Profil zakwasu'));
    expect(i('Profil zakwasu')).toBeLessThan(i('Szczyt aktywności'));
    act(() => tree.unmount());
  });
});
