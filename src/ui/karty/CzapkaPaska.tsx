// ============================================================================
// Piekarz — CzapkaPaska: pas stanu przypięty u góry ekranu (design-spec §14, karty/README.md §2) [M3 p1]
// Gdy pas ekranu odjedzie przy przewijaniu, pod paskiem stanu nie przewija się treść (znalezisko „Zakwasy”, D-139):
// czapka ma kolor `pas` i wysokość górnego bezpieczeństwa obszaru. Gdy ekran zdecyduje (`pokazTytul`, po
// zniknięciu tytułu pasa), w czapce pojawia się mały tytuł. Nie przechwytuje dotyku; tytuł jest ukryty przed
// czytnikiem, bo nagłówek ekranu jest na pasie. Tekst dostaje od ekranu.
// ============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { odstepy, typografia } from '../tokeny';

export function CzapkaPaska({ testID = 'czapka-paska', gora, tytul, pokazTytul = false }: {
  testID?: string;
  /** Wysokość paska stanu (safe area). */
  gora: number;
  /** Mały tytuł ekranu, już przetłumaczony. */
  tytul?: string;
  /** Czy pokazać mały tytuł (ekran wylicza z przewinięcia). */
  pokazTytul?: boolean;
}) {
  const z = pokazTytul && tytul ? tytul : null;
  return (
    <View testID={testID} pointerEvents="none" style={[styles.czapka, z ? { paddingTop: gora } : { height: gora }]}>
      {z ? (
        <Text
          testID={`${testID}-tytul`}
          style={styles.tytul}
          maxFontSizeMultiplier={1.5}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {z}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  czapka: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, backgroundColor: theme.colors.pas },
  tytul: {
    textAlign: 'center',
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '600',
    color: theme.colors.naPasie,
    paddingHorizontal: odstepy.l,
    paddingBottom: odstepy.m,
  },
});
