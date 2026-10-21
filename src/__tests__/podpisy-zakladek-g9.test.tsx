/**
 * Podpisy zakładek miały allowFontScaling={false}: przy większym tekście w Ustawieniach iOS zostawały 10 pt.
 * Podpis rośnie z Dynamic Type do 1,5× (pasek zakładek ma stałą wysokość, więc bez wzrostu do AX5),
 * bez limitu linii i bez zmniejszania kroju (reguła 054) [audyt-niezalezny G-9].
 */
import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { TabLabel } from '../components/TabIcon';

describe('G-9: podpis zakładki skaluje się z Dynamic Type', () => {
  it.each(['below-icon', 'beside-icon'] as const)('%s: skalowanie włączone z ograniczeniem 1,5× i jednym wierszem', async (position) => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<TabLabel color="#000" position={position}>Receptury</TabLabel>);
    });
    const p = tree.root.findByType(Text).props;
    // Bez limitu linii i bez zmniejszania kroju: reguła 054 (tests/pasek-zakladek.test.tsx), podpis się nie ucina.
    expect({ allowFontScaling: p.allowFontScaling !== false, max: p.maxFontSizeMultiplier, linie: p.numberOfLines, dopasuj: !!p.adjustsFontSizeToFit })
      .toEqual({ allowFontScaling: true, max: 1.5, linie: undefined, dopasuj: false });
  });
});
