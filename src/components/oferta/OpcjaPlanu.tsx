// ============================================================================
// Piekarz — Opcja planu (komponent systemu, design-spec §4, §11e 127; makieta .plan-opcja w docs/design/ekrany/wspolne.css):
// obwódka 1,5 (wybrana: akcent 3), znacznik wyboru kształtem, nazwa, cena krojem tytułów 22 pt (największy element
// cenowy), opis drobniej; VoiceOver: radio z „checked”, etykieta z widocznych tekstów. [M1-audytor-generalny-127]
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

export function OpcjaPlanu({
  nazwa,
  cena,
  opis,
  wybrana,
  onPress,
  testID,
}: {
  nazwa: string;
  /** null = cena jeszcze nieznana (ładowanie): pusta linia tej samej wysokości, nigdy „—”. */
  cena: string | null;
  opis?: string;
  wybrana: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ checked: wybrana }}
      accessibilityLabel={[nazwa, cena, opis].filter(Boolean).join('. ')}
      onPress={onPress}
      style={[styles.opcja, wybrana && styles.wybrana]}
    >
      <View style={styles.tresc}>
        <Text style={styles.nazwa}>{nazwa}</Text>
        <Text style={styles.cena}>{cena ?? ' '}</Text>
        {opis ? <Text style={styles.opis}>{opis}</Text> : null}
      </View>
      <View style={[styles.znacznik, wybrana && styles.znacznikWybrany]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  opcja: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: odstepy.m,
    minHeight: theme.cele.przyciskKciuka,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    borderRadius: promienie.przycisk,
    paddingVertical: odstepy.m,
    paddingHorizontal: odstepy.l - 2,
    backgroundColor: theme.colors.powierzchnia,
  },
  wybrana: { borderWidth: 3, borderColor: theme.colors.akcent },
  tresc: { flex: 1, minWidth: 0, gap: 2 },
  nazwa: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  cena: { fontSize: typografia.style.tytul2.pt, fontWeight: '700', fontFamily: theme.typography.krojTytulow, color: theme.colors.tusz },
  opis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
  znacznik: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.obwodka,
    marginTop: 2,
  },
  znacznikWybrany: { borderWidth: 8, borderColor: theme.colors.akcent },
});
