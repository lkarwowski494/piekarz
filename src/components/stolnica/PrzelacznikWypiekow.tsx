// ============================================================================
// Piekarz — przełącznik trwających wypieków nad prowadzeniem (BR-KAL-016 „Który krok czyj”) [M3 D3a]
// Według makiety roli 04 „przełącznik nad jedną spiralą” (audit/M3-2026-10-22/role/04-a2, arkusz dwa-wypieki-390,
// wariant `przelacznik`): segmenty w jednym rzędzie, wybrany wypełniony akcentem; w każdym nazwa receptury i bieżący
// krok. Druga linia „do {godzina}” (koniec bieżącego kroku) jak w makiecie „{r}, do {h}” (przegląd roli 04 z D3a,
// M3 D4b); bez godziny — nazwa kroku; VoiceOver czyta krok i godzinę. Wygląd z tokenów, bez nowych.
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../lib/i18n';
import { nazwaReceptury } from '../../lib/nazwa-receptury';
import { formatTime } from '../../lib/format';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

export interface WypiekPrzelacznika {
  id: string;
  nazwa: string;
  /** Nazwa bieżącego kroku (klucz tekstu kroku z planu). */
  krok: string;
  /** Koniec bieżącego kroku (ms): druga linia „do {godzina}” jak w makiecie roli 04; null = sam krok. */
  doMs: number | null;
}

export function PrzelacznikWypiekow({ wypieki, wybrany, onWybierz }: {
  wypieki: readonly WypiekPrzelacznika[];
  wybrany: string;
  onWybierz: (id: string) => void;
}) {
  return (
    <View style={styles.rzad} accessibilityRole="tablist" testID="przelacznik-wypiekow">
      {wypieki.map((w) => {
        const wyb = w.id === wybrany;
        const nazwa = nazwaReceptury(w.nazwa);
        const krok = t(w.krok);
        const godzina = w.doMs === null ? null : formatTime(w.doMs);
        return (
          <Pressable
            key={w.id}
            testID={`przelacznik-wypiek-${w.id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: wyb }}
            accessibilityLabel={
              godzina === null ? t('{wypiek}, krok: {krok}', { wypiek: nazwa, krok }) : t('{wypiek}, krok: {krok}, do {godzina}', { wypiek: nazwa, krok, godzina })
            }
            style={[styles.segment, wyb && styles.wybrany]}
            onPress={() => onWybierz(w.id)}
          >
            <Text style={[styles.nazwa, wyb && styles.tekstWybrany]}>{nazwa}</Text>
            <Text style={[styles.krok, wyb && styles.tekstWybrany]}>{godzina === null ? krok : t('do {godzina}', { godzina })}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rzad: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.xs, marginBottom: odstepy.m },
  segment: {
    flexGrow: 1,
    flexBasis: 140,
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.s,
    borderRadius: promienie.przycisk,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
  },
  wybrany: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  nazwa: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz },
  krok: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  tekstWybrany: { color: theme.colors.naAkcencie },
});
