/**
 * 04-studio-projektowe-004 (P1, weryfikacja W przebiegu M3): wiersz okresu kalendarza na pasie „Dziś”
 * („‹ okres Dziś › [Miesiąc]”) był jednym rzędem bez zawijania. Przy AX5 (fontScale ok. 3,1–3,6) i 320 pt sam
 * „Miesiąc” z „Pro” ma ok. 300 pt, więc „›” i „Miesiąc” wypadały poza ekran i zostawał tylko gest.
 * Teraz przy dużym tekście (próg 2, jak kafle „Dziś”, D-118 pkt 1) wiersz ma dwa rzędy: „‹ okres ›” oraz
 * „Dziś” i „Miesiąc” w rzędzie zawijanym, w którym przyciski mogą się zwężać (tekst zawija się w przycisku).
 * Przy zwykłym tekście układ bez zmian.
 */
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 3.1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { StyleSheet, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { NawigacjaKalendarza } from '../components/kalendarz/NawigacjaKalendarza';
import type { NawigacjaWidoku } from '../hooks/useKalendarz';

const widok = (): NawigacjaWidoku => ({
  tryb: 'tydzien', tytul: '12–18 października', biezacy: false, przesun: jest.fn(), dzis: jest.fn(), ustawTryb: jest.fn(), miesiacPro: true,
});
const host = (root: renderer.ReactTestInstance, id: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === id)[0]!;
/** Najbliższy rząd (View z flexDirection row) zawierający element; sam przycisk (ten sam testID) się nie liczy. */
function rzad(el: renderer.ReactTestInstance): renderer.ReactTestInstance {
  let n: renderer.ReactTestInstance | null = el.parent;
  while (n && !(n.type === View && n.props.testID !== el.props.testID && StyleSheet.flatten(n.props.style)?.flexDirection === 'row')) n = n.parent;
  return n!;
}
const zawiera = (r: renderer.ReactTestInstance, el: renderer.ReactTestInstance) => r.findAll((x) => x === el).length > 0;

function render() {
  let tree: renderer.ReactTestRenderer | null = null;
  act(() => { tree = renderer.create(<NawigacjaKalendarza widok={widok()}><View /></NawigacjaKalendarza>); });
  return tree!;
}

describe('04-studio-projektowe-004: wiersz okresu kalendarza przy dużym tekście', () => {
  it.each([3.1, 3.571])('fontScale %f przy 320 pt: „‹ okres ›” w jednym rzędzie, „Dziś” i „Miesiąc” w drugim, zawijanym', (fs) => {
    Object.assign(mockOkno, { fontScale: fs });
    const tree = render();
    const root = tree.root;
    const nastepny = host(root, 'kalendarz-nastepny');
    const miesiac = host(root, 'kalendarz-tryb-miesiac');
    const dzis = host(root, 'kalendarz-dzis');
    const rzadStrzalek = rzad(nastepny);
    expect(zawiera(rzadStrzalek, host(root, 'kalendarz-poprzedni'))).toBe(true);
    expect(zawiera(rzadStrzalek, host(root, 'kalendarz-tytul'))).toBe(true);
    expect(zawiera(rzadStrzalek, miesiac)).toBe(false);
    expect(zawiera(rzadStrzalek, dzis)).toBe(false);
    const rzadPrzyciskow = rzad(miesiac);
    expect(zawiera(rzadPrzyciskow, dzis)).toBe(true);
    expect(StyleSheet.flatten(rzadPrzyciskow.props.style)?.flexWrap).toBe('wrap');
    // Przycisk węższy niż ekran zawija swój tekst („Miesiąc” + „Pro”), zamiast wychodzić poza ekran
    for (const p of [miesiac, dzis]) {
      const s = StyleSheet.flatten(p.props.style);
      expect(s.flexShrink).toBe(1);
      expect(s.maxWidth).toBe('100%');
      expect(Number(s.minHeight)).toBeGreaterThanOrEqual(44);
    }
    act(() => tree.unmount());
  });

  it('zwykły tekst: jeden rząd „‹ okres Dziś › [Miesiąc]” jak dotąd (D-118)', () => {
    Object.assign(mockOkno, { fontScale: 1 });
    const tree = render();
    const r = rzad(host(tree.root, 'kalendarz-nastepny'));
    for (const id of ['kalendarz-poprzedni', 'kalendarz-tytul', 'kalendarz-dzis', 'kalendarz-tryb-miesiac']) expect(zawiera(r, host(tree.root, id))).toBe(true);
    act(() => tree.unmount());
  });

  // PRZ-18 (zrzut E2E 39873090932, krok 21): „Month” przyklejony do górnej krawędzi ramki wyższej niż tekst. Przycisk ma
  // flexWrap 'wrap' (zawijanie przy AX5) i minHeight 44: linia treści idzie wtedy według alignContent, a w React Native
  // domyślnie to 'flex-start' (Yoga), więc alignItems/justifyContent jej nie centrują. Wyśrodkowanie w pionie: alignContent.
  it.each([1, 3.1])('fontScale %f: „Dziś” i „Miesiąc” mają treść wyśrodkowaną w pionie przy minHeight 44', (fs) => {
    Object.assign(mockOkno, { fontScale: fs });
    const tree = render();
    for (const id of ['kalendarz-dzis', 'kalendarz-tryb-miesiac']) {
      const s = StyleSheet.flatten(host(tree.root, id).props.style);
      expect(Number(s.minHeight)).toBeGreaterThanOrEqual(44);
      expect({ id, justifyContent: s.justifyContent, alignItems: s.alignItems }).toEqual({ id, justifyContent: 'center', alignItems: 'center' });
      if (s.flexWrap === 'wrap') expect({ id, alignContent: s.alignContent }).toEqual({ id, alignContent: 'center' });
    }
    act(() => tree.unmount());
  });
});
