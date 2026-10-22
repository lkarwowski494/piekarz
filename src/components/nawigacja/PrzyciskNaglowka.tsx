// ============================================================================
// Piekarz — przycisk w pasku nawigacji (prawy róg): tekst albo ikona w kolorze akcji, cel 44 pt
// (design-spec §4 nawigacja systemowa, §11b „Więcej” cel 44; tokeny cele.pozostale) [M1-audytor-generalny-101]
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../ui/theme';
import { typografia } from '../../ui/tokeny';

export function PrzyciskNaglowka({ testID, etykieta, tekst, ikona, onPress }: {
  testID: string;
  /** Etykieta VoiceOver (akcja + obiekt). */
  etykieta: string;
  /** Tekst przycisku; bez tekstu przycisk pokazuje ikonę. */
  tekst?: string;
  ikona?: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={etykieta} style={styles.przycisk} onPress={onPress}>
      {tekst !== undefined ? <Text style={styles.tekst} maxFontSizeMultiplier={1.5}>{tekst}</Text> : ikona}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  przycisk: {
    minHeight: theme.cele.pozostale,
    minWidth: theme.cele.pozostale,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  tekst: {
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.akcentTekst,
  },
});
