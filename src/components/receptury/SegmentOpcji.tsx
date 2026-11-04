// ============================================================================
// Piekarz — segment z opcjami w jednym rzędzie (radiogroup) na ekranie receptury: jeden wzór dla „na zakwasie /
// na drożdżach” (SegmentWersji, D-154) i „Piekarnik / Maszyna do chleba” (D-138, karty/README.md O4 a). Wygląd jak
// segment „świeże / suche” (SegmentDrozdzy, D-136). Pole dotyku ≥ 44 pt; przy dużym tekście każda opcja na całą
// szerokość (README §7a) [M3 p9b, p9b2].
// ============================================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../../ui/theme';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';
import { odstepy, promienie } from '../../ui/tokeny';
import { s } from './style-receptur';

export interface OpcjaSegmentu<T extends string> {
  wartosc: T;
  testID: string;
  /** Etykieta już przetłumaczona. */
  etykieta: string;
}

export function SegmentOpcji<T extends string>({ testID, etykieta, wybrana, opcje, onWybierz, style }: {
  testID: string;
  /** Etykieta grupy dla VoiceOver, już przetłumaczona. */
  etykieta: string;
  wybrana: T;
  opcje: readonly OpcjaSegmentu<T>[];
  onWybierz: (w: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const szer = { flexBasis: useDuzyTekst() ? '100%' : 120 } as const;
  return (
    <View testID={testID} style={[styles.grupa, style]} accessibilityRole="radiogroup" accessibilityLabel={etykieta}>
      {opcje.map((o) => {
        const wyb = wybrana === o.wartosc;
        return (
          <Pressable
            key={o.wartosc}
            testID={o.testID}
            accessibilityRole="radio"
            accessibilityState={{ checked: wyb, selected: wyb }}
            style={[styles.opcja, szer, wyb && styles.opcjaWybrana]}
            onPress={() => onWybierz(o.wartosc)}
          >
            <Text style={[s.chipTekst, wyb && styles.tekstWybrany]}>{o.etykieta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grupa: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: odstepy.xs,
    padding: odstepy.xs,
    marginBottom: theme.spacing.md,
    borderRadius: promienie.grupa,
    backgroundColor: theme.colors.tloGrupa,
  },
  opcja: {
    flexGrow: 1,
    minHeight: theme.cele.pozostale,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: promienie.pole,
  },
  // Jak SegmentDrozdzy; obwódka 1,5 bez tokenu grubości (zgłoszenie do roli 04 z p6a)
  opcjaWybrana: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
  },
  tekstWybrany: { fontWeight: '600' },
});
