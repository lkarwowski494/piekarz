// ============================================================================
// Piekarz — wiersz dnia przy dużym tekście (AX1–AX5): jak agenda makiety roli 04 a2 `kalendarz-10-tydzien-*-ax5`
// (PRZ-08, D-107). Data jako nagłówek (600), pod nią najwyżej 3 zdarzenia, każde w osobnej linii z glifem i godziną,
// potem „i jeszcze N, szczegóły w arkuszu dnia”. Etykieta VoiceOver przycisku zostaje pełnym zdaniem dnia
// (etykietaDnia); teksty linii są poza drzewem dostępności, żeby czytnik nie czytał dnia dwa razy.
// Kolory tylko z tokenów pasa.
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { glif } from '../../lib/kalendarz-pasek';
import type { CzesciDnia } from '../../lib/kalendarz-teksty';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { GlifPiekarnika, GlifZaleglego, GlifZdarzenia } from './GlifZdarzenia';

export interface WierszDniaAx5Props {
  testID: string;
  etykieta: string;
  czesci: CzesciDnia;
  /** Id wypieków w kolejności (drugi = trójkąt). */
  wypieki: readonly string[];
  dzis: boolean;
  onPress: () => void;
}

export function WierszDniaAx5({ testID, etykieta, czesci, wypieki, dzis, onPress }: WierszDniaAx5Props) {
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={etykieta} style={[styles.wiersz, dzis && styles.ramka]} onPress={onPress}>
      <Text style={styles.data} accessible={false}>{czesci.data}</Text>
      {czesci.pusto !== null && <Text style={styles.zdarzenie} accessible={false}>{czesci.pusto}</Text>}
      {czesci.pozycje.map(({ z, tekst }, i) => (
        <View key={`${z.rodzaj}-${z.at}-${i}`} style={styles.linia}>
          <View style={styles.glif}>
            {z.rodzaj === 'piekarnik-zajety' ? (
              <GlifPiekarnika tlo={theme.colors.ostrzTlo} znak={theme.colors.ostrzTusz} rozmiar={14} />
            ) : z.zalegle ? (
              <GlifZaleglego tlo={theme.colors.ostrzTlo} znak={theme.colors.ostrzTusz} rozmiar={14} />
            ) : (
              <GlifZdarzenia glif={glif(z, wypieki)} kolor={glif(z, wypieki) === 'plan' ? theme.colors.naPasie2 : theme.colors.ratanNaPasie} rozmiar={14} />
            )}
          </View>
          <Text style={styles.zdarzenie} accessible={false}>{tekst}</Text>
        </View>
      ))}
      {czesci.reszta !== null && <Text style={styles.reszta} accessible={false}>{czesci.reszta}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wiersz: { minHeight: theme.cele.pozostale, paddingVertical: odstepy.s, paddingHorizontal: odstepy.m, gap: odstepy.xs, borderRadius: promienie.przycisk, borderWidth: 2, borderColor: 'transparent' },
  ramka: { borderColor: theme.colors.naPasie },
  data: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naPasie },
  linia: { flexDirection: 'row', alignItems: 'flex-start', gap: odstepy.s },
  glif: { minHeight: 24, justifyContent: 'center' },
  zdarzenie: { flex: 1, fontSize: typografia.style.tresc.pt, color: theme.colors.naPasie },
  reszta: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.naPasie2 },
});
