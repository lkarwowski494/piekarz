// ============================================================================
// Piekarz — WierszKarty: wiersz w karcie (design-spec §14, karty/README.md §2) [M3 p1]
// Min 52 pt, odstępy 10/16, linia `linia` między wierszami; wartość 17 pt / 600, cyfry tabelaryczne. Z `onPress` to
// przycisk (cel ≥ 44 pt) z szewronem. Przy dużym tekście stos pionowy: ikona (i szewron) nad etykietą, wartość pod nią.
// Teksty dostaje od ekranu; komponent nie ma własnych.
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { odstepy, typografia } from '../tokeny';
import { useDuzyTekst } from './duzy-tekst';

/** Wysokość wiersza i odstęp pionowy z README §2 (nie ma na nie tokenu; ≥ cele.pozostale 44). */
const WYSOKOSC_WIERSZA = 52;
const ODSTEP_PIONOWY = 10;
const IKONA = 28;

export function WierszKarty({ testID = 'wiersz', etykieta, wartosc, podpis, ikona, onPress, linia = true }: {
  testID?: string;
  /** Etykieta już przetłumaczona. */
  etykieta: string;
  /** Wartość (liczba z jednostką) już sformatowana. */
  wartosc?: string;
  podpis?: string;
  /** Ikona wiersza (kolor `ratan`): dekoracja. */
  ikona?: React.ReactNode;
  /** Z `onPress` wiersz jest przyciskiem. */
  onPress?: () => void;
  /** Linia nad wierszem; pierwszy wiersz karty dostaje `false`. */
  linia?: boolean;
}) {
  const duzy = useDuzyTekst();
  const ik = ikona ? (
    <View testID={`${testID}-ikona`} style={styles.ikona} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {ikona}
    </View>
  ) : null;
  const szewron = onPress ? <View style={styles.szewron} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden /> : null;
  const opis = (
    <View style={styles.opis}>
      <Text testID={`${testID}-etykieta`} style={styles.etykieta}>{etykieta}</Text>
      {podpis ? <Text testID={`${testID}-podpis`} style={styles.podpis}>{podpis}</Text> : null}
    </View>
  );
  const war = wartosc ? <Text testID={`${testID}-wartosc`} style={styles.wartosc}>{wartosc}</Text> : null;
  const tresc = duzy ? (
    <>
      {ik || szewron ? <View style={styles.wstep}>{ik}{szewron}</View> : null}
      {opis}
      {war}
    </>
  ) : (
    <>
      {ik}
      {opis}
      {war}
      {szewron}
    </>
  );
  const ukladStyle = [styles.wiersz, duzy ? styles.stos : styles.rzad, { borderTopWidth: linia ? 1 : 0 }];
  if (!onPress) return <View testID={testID} style={ukladStyle}>{tresc}</View>;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={[etykieta, wartosc, podpis].filter(Boolean).join(', ')}
      onPress={onPress}
      style={({ pressed }) => [...ukladStyle, pressed && styles.nacisniety]}
    >
      {tresc}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wiersz: {
    minHeight: WYSOKOSC_WIERSZA,
    paddingVertical: ODSTEP_PIONOWY,
    paddingHorizontal: odstepy.l,
    gap: odstepy.m,
    borderTopColor: theme.colors.linia,
  },
  rzad: { flexDirection: 'row', alignItems: 'center' },
  stos: { flexDirection: 'column', alignItems: 'stretch' },
  wstep: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: odstepy.m },
  nacisniety: { backgroundColor: theme.colors.tloGrupa },
  ikona: { width: IKONA, height: IKONA, alignItems: 'center', justifyContent: 'center' },
  opis: { flex: 1, flexShrink: 1, gap: 2 },
  etykieta: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  podpis: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  wartosc: {
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
    fontVariant: ['tabular-nums'],
  },
  // Szewron „›” rysowany obramowaniem (bez tekstu i bez nowej ikony)
  szewron: {
    width: 9,
    height: 9,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: theme.colors.tusz3,
    transform: [{ rotate: '45deg' }],
  },
});
