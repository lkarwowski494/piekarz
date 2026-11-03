// ============================================================================
// Piekarz — PoleObjawu: jedna kontrolka wyboru objawu w zakwasie i w Doktorze (design-spec §14, karty/README.md §2) [M3 p1]
// Kwadrat 28×28, promień `znacznik` 6, obwódka 2 `obwodka`; cały wiersz w obwódce 1,5, promień `pole` 10, min 52 pt.
// Zaznaczony: wypełnienie `akcent` i znak rysowany obramowaniem (nie sam kolor, WCAG 1.4.1). Rola checkbox ze stanem
// checked. Przy dużym tekście pole nad etykietą (D-142), etykieta bez limitu linii, kwadrat się nie kurczy.
// ============================================================================

import React from 'react';
import { useDuzyTekst } from './duzy-tekst';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { odstepy, promienie, typografia } from '../tokeny';

const KWADRAT = 28;

export function PoleObjawu({ testID = 'pole-objawu', etykieta, zaznaczone, onZmien }: {
  testID?: string;
  /** Opis objawu, już przetłumaczony. */
  etykieta: string;
  zaznaczone: boolean;
  /** Dostaje wartość przeciwną do bieżącej. */
  onZmien: (zaznaczone: boolean) => void;
}) {
  const duzy = useDuzyTekst();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: zaznaczone }}
      accessibilityLabel={etykieta}
      onPress={() => onZmien(!zaznaczone)}
      style={({ pressed }) => [styles.wiersz, duzy && styles.wierszStos, pressed && styles.nacisniety]}
    >
      <View testID={`${testID}-kwadrat`} style={[styles.kwadrat, zaznaczone && styles.kwadratZaznaczony]}>
        {zaznaczone ? <View testID={`${testID}-znak`} style={styles.znak} /> : null}
      </View>
      <Text testID={`${testID}-etykieta`} style={styles.etykieta}>{etykieta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wiersz: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: odstepy.m,
    minHeight: 52, // literał: skan celów dotyku (≥ 44) czyta liczby w stylu
    paddingVertical: odstepy.s,
    paddingHorizontal: odstepy.m,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    borderRadius: promienie.pole,
  },
  // Duży tekst: pole wyboru nad tekstem, stos w jednej kolumnie (README §7a, D-142)
  wierszStos: { flexDirection: 'column', alignItems: 'flex-start' },
  nacisniety: { backgroundColor: theme.colors.tloGrupa },
  kwadrat: {
    width: KWADRAT,
    height: KWADRAT,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.obwodka,
    borderRadius: promienie.znacznik,
  },
  kwadratZaznaczony: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  // Znak „✓” rysowany obramowaniem (bez tekstu)
  znak: {
    width: 8,
    height: 14,
    marginTop: -2,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: theme.colors.naAkcencie,
    transform: [{ rotate: '45deg' }],
  },
  etykieta: { flex: 1, flexShrink: 1, fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
});
