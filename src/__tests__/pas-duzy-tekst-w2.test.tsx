/**
 * W-fix2, D-120 opcja (b) wg rekomendacji (M1): przy dużym tekście (fontScale ≥ 2, ten sam próg co kafle „Dziś”,
 * wiersz okresu kalendarza i ekran Pro) filtry i zdanie pod tytułem schodzą pod pas nocy; na pasie zostaje rząd
 * nawigacji, tytuł i sterowanie ekranu (dzieci: kalendarz, spirala). Pod pasem filtry w wariancie na tle ekranu
 * (obwódka, tusz; wybrany akcent), cel 44 pt. Przy zwykłym tekście układ D-119 bez zmian.
 */
jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 3.12 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { PasZakladki } from '../components/nawigacja/PasZakladki';
import { theme } from '../ui/theme';

const host = (root: renderer.ReactTestInstance, id: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const teksty = (n: renderer.ReactTestInstance) => n.findAllByType(Text).map((x) => [x.props.children].flat().join(''));
const onWybierz = jest.fn();

function render() {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <PasZakladki gora={20} tytul="Dziennik" podtytul="Ostatni wypiek: niedziela"
        filtry={{ filtry: [{ id: 'all', testID: 'f-all', etykieta: 'Wszystkie' }, { id: 'sour', testID: 'f-sour', etykieta: 'Kwaśny' }], wybrany: 'all', onWybierz }}>
        <View testID="sterowanie" />
      </PasZakladki>,
    );
  });
  return tree;
}

describe('W-fix2 (D-120 b): pas przy dużym tekście bez filtrów i zdania', () => {
  it.each([2, 3.12, 3.571])('fontScale %f: na pasie tytuł i sterowanie; filtry i zdanie pod pasem na tle ekranu', (fs) => {
    Object.assign(mockOkno, { fontScale: fs });
    const tree = render();
    const pas = host(tree.root, 'pas-zakladki')[0]!;
    expect(teksty(pas)).toEqual(['Dziennik']);
    expect(host(pas, 'sterowanie')).toHaveLength(1);
    expect(host(pas, 'pas-filtry')).toHaveLength(0);
    const pod = host(tree.root, 'pas-pod')[0]!;
    expect(teksty(pod)).toEqual(expect.arrayContaining(['Ostatni wypiek: niedziela', 'Wszystkie', 'Kwaśny']));
    const chip = host(pod, 'f-sour')[0]!;
    const s = StyleSheet.flatten(chip.props.style);
    expect(s.borderColor).toBe(theme.colors.obwodka);
    expect(Number(s.minHeight)).toBeGreaterThanOrEqual(44);
    expect(StyleSheet.flatten(host(pod, 'f-all')[0]!.props.style).backgroundColor).toBe(theme.colors.akcent);
    act(() => tree.unmount());
  });

  it('zwykły tekst: zdanie i filtry na pasie (D-119)', () => {
    Object.assign(mockOkno, { fontScale: 1 });
    const tree = render();
    const pas = host(tree.root, 'pas-zakladki')[0]!;
    expect(teksty(pas)).toEqual(expect.arrayContaining(['Dziennik', 'Ostatni wypiek: niedziela', 'Wszystkie']));
    expect(host(pas, 'pas-filtry')).toHaveLength(1);
    expect(host(tree.root, 'pas-pod')).toHaveLength(0);
    act(() => tree.unmount());
  });
});
