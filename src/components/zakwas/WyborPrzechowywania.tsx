// ============================================================================
// Piekarz — wybór miejsca przechowywania zakwasu w arkuszach dodania i edycji (karty, README §2) [M3 p7, 04-002]
// Dwa przyciski z zaznaczeniem; kolejność podaje arkusz (dodanie: blat pierwszy, edycja: lodówka pierwsza, jak
// dotąd). Teksty z istniejących kluczy.
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';

export type MiejsceZakwasu = 'ROOM_TEMP' | 'FRIDGE';

export function WyborPrzechowywania({ wartosc, onZmiana, kolejnosc }: {
  wartosc: MiejsceZakwasu;
  onZmiana: (m: MiejsceZakwasu) => void;
  kolejnosc: readonly MiejsceZakwasu[];
}) {
  const napis = (m: MiejsceZakwasu) => (m === 'FRIDGE' ? t('W lodówce (4°C)') : t('Temperatura pokojowa'));
  return (
    <View style={styles.wybory}>
      {kolejnosc.map((m) => (
        <Pressable
          key={m}
          accessibilityRole="button"
          accessibilityState={{ selected: wartosc === m }}
          style={[styles.wybor, wartosc === m && styles.wyborAktywny]}
          onPress={() => onZmiana(m)}
        >
          <Text style={[styles.tekst, wartosc === m && styles.tekstAktywny]}>{napis(m)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wybory: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.s },
  wybor: {
    minHeight: theme.cele.pozostale,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.s,
    borderRadius: promienie.przycisk,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
  },
  wyborAktywny: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  tekst: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz2, textAlign: 'center' },
  tekstAktywny: { color: theme.colors.naAkcencie, fontWeight: '700' },
});
