// ============================================================================
// Piekarz — Karta: treść ekranu wyłącznie w kartach (design-spec §14, karty/README.md §1–§3, D-141) [M3 p1]
// Tło `powierzchnia`, obwódka 1 px `kartaLinia` (w ciemnym równa powierzchni, więc niewidoczna), promień `karta`,
// wypełnienie 16 (przy dużym tekście 12). Nagłówek: ikona 24 pt + tytuł jednym krojem (tytul2 − 2 = 20 pt, 700) +
// opcjonalny znacznik po prawej (np. „Pro”). Przy dużym tekście ikona i znacznik nad tytułem, tytuł bez limitu linii.
// Komponent nie ma własnych tekstów: tytuł i znacznik dostaje od ekranu.
// ============================================================================

import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../theme';
import { odstepy, promienie, typografia } from '../tokeny';
import { usePogrubionyTekst, wagaTytulu } from '../pogrubiony-tekst';
import { useDuzyTekst } from './duzy-tekst';

/** Rozmiar ikony w nagłówku karty (README §2). */
const IKONA = 24;

/** Wygląd karty bez wypełnienia i nagłówka: tło, obwódka i promień (README §2). Także dla karty-przycisku na liście. */
export const wygladKarty = {
  backgroundColor: theme.colors.powierzchnia,
  borderWidth: 1,
  borderColor: theme.colors.kartaLinia,
  borderRadius: promienie.karta,
} as const;

/** Nagłówek karty (ikona, tytuł, znacznik); też nagłówek grupy kart na tle (lista receptur, O2b). */
export function NaglowekKarty({ testID, tytul, ikona, znacznik, style }: {
  testID: string;
  tytul: string;
  ikona?: React.ReactNode;
  znacznik?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const duzy = useDuzyTekst();
  const waga = { fontWeight: wagaTytulu(usePogrubionyTekst()) };
  const ik = ikona ? (
    <View testID={`${testID}-ikona`} style={styles.ikona} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {ikona}
    </View>
  ) : null;
  const zn = znacznik ? <View testID={`${testID}-znacznik`}>{znacznik}</View> : null;
  const tyt = (
    <Text testID={`${testID}-tytul`} accessibilityRole="header" style={[styles.tytul, !duzy && styles.tytulWiersz, waga]}>{tytul}</Text>
  );
  return (
    <View testID={`${testID}-naglowek`} style={[styles.naglowek, duzy ? styles.naglowekStos : styles.naglowekRzad, style]}>
      {duzy ? (
        <>
          {ik || zn ? <View style={styles.wstep}>{ik}{zn}</View> : null}
          {tyt}
        </>
      ) : (
        <>
          {ik}
          {tyt}
          {zn}
        </>
      )}
    </View>
  );
}

export function Karta({ testID = 'karta', tytul, ikona, znacznik, bezWypelnienia = false, children }: {
  testID?: string;
  /** Tytuł już przetłumaczony; nagłówek dla VoiceOver. */
  tytul: string;
  /** Ikona nagłówka (kolor `ratan`): dekoracja, ukryta przed czytnikiem. */
  ikona?: React.ReactNode;
  /** Znacznik po prawej nagłówka (np. oznaczenie Pro). */
  znacznik?: React.ReactNode;
  /** Karta z wierszami `WierszKarty`: wiersze niosą własne wypełnienie, karta tylko zaokrągla i przycina. */
  bezWypelnienia?: boolean;
  children?: React.ReactNode;
}) {
  const duzy = useDuzyTekst();
  return (
    <View testID={testID} style={[styles.karta, bezWypelnienia ? styles.bezWypelnienia : { padding: duzy ? odstepy.m : odstepy.l }]}>
      <NaglowekKarty testID={testID} tytul={tytul} ikona={ikona} znacznik={znacznik} style={bezWypelnienia && styles.naglowekWKarcie} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  karta: {
    ...wygladKarty,
    gap: odstepy.m,
    minWidth: 0,
  },
  bezWypelnienia: { padding: 0, gap: 0, overflow: 'hidden' },
  naglowek: { gap: odstepy.m },
  naglowekRzad: { flexDirection: 'row', alignItems: 'center' },
  naglowekStos: { flexDirection: 'column', alignItems: 'stretch' },
  // Nagłówek karty z wierszami: własne wypełnienie (w makiecie 14/16/6; tu najbliższe tokeny)
  naglowekWKarcie: { paddingHorizontal: odstepy.l, paddingTop: odstepy.m, paddingBottom: odstepy.xs },
  wstep: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: odstepy.m },
  ikona: { width: IKONA, height: IKONA, alignItems: 'center', justifyContent: 'center' },
  tytul: {
    get fontFamily() { return theme.typography.krojTytulow; },
    // Jeden krój i rozmiar dla wszystkich kart (README §2): tytul2 − 2 = 20 pt
    fontSize: typografia.style.tytul2.pt - 2,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  tytulWiersz: { flex: 1, flexShrink: 1 },
});
