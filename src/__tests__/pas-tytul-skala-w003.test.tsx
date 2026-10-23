/**
 * 04-studio-projektowe-003 (P1, weryfikacja W przebiegu M3): tytuł pasa nocy (PasZakladki, token tytulDuzy 34 pt)
 * rósł z Dynamic Type bez limitu. Przy AX5 (fontScale ok. 3,1–3,6) i 320 pt łamał słowa w środku („Rece/ptury”,
 * fi „Hapanjuuret” w 3 wierszach), a pas zajmował cały pierwszy ekran.
 *
 * Teraz tytuł skaluje się najwyżej 1,5× (51 pt) jak inne elementy nagłówka (D-087 podpisy zakładek, PRZ-07 przyciski
 * pasa), bez limitu linii i bez zmniejszania kroju. Pomiar (Chromium, krój Sofia Sans Semi Condensed 700 z repo):
 * najdłuższe słowo tytułów zakładek w 35 językach („Hapanjuuret”, fi) ma przy 51 pt 263 pt wobec 288 pt miejsca
 * (320 − 2×16), przy limicie z tokenu (60 pt) 309 pt — łamałoby się. Wysokość pasa przy 320 pt i fontScale 3,571
 * (przybliżenie HTML): Receptury 811 → 582 pt, Zakwasy fi 475 → 101 pt; resztę wysokości dają filtry i zdanie
 * pod tytułem (decyzja roli 04, raport W-fix).
 */
jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { PasZakladki } from '../components/nawigacja/PasZakladki';
import { typografia } from '../ui/tokeny';

describe('04-studio-projektowe-003: tytuł pasa z limitem skali, bez łamania słów', () => {
  it('tytuł (nagłówek VoiceOver) skaluje się najwyżej 1,5×, bez limitu linii i bez zmniejszania kroju', () => {
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(<PasZakladki gora={20} tytul="Receptury" podtytul="Ostatni wypiek: niedziela" />);
    });
    const tytul = tree!.root.findAll((n) => n.type === Text && n.props.accessibilityRole === 'header');
    expect(tytul).toHaveLength(1);
    expect(tytul[0].props.maxFontSizeMultiplier).toBe(1.5);
    expect(tytul[0].props.numberOfLines).toBeUndefined();
    expect(tytul[0].props.adjustsFontSizeToFit).toBeUndefined();
    expect(StyleSheet.flatten(tytul[0].props.style).fontSize).toBe(typografia.style.tytulDuzy.pt);
    // Przy limicie 1,5× tytuł ma 51 pt (najdłuższe słowo 35 języków: 263 pt z 288 pt przy 320 pt)
    expect(typografia.style.tytulDuzy.pt * tytul[0].props.maxFontSizeMultiplier).toBe(51);
    act(() => tree!.unmount());
  });
});
