// ============================================================================
// Piekarz — wybór „świeże / suche” przy wierszu drożdży na karcie „Do miski” (D-136, BR-KALK-012; makieta
// docs/design/karty/receptury.html #receptura-drozdze). Ten sam wybór co w arkuszu „Składniki” (BR-KALK-009):
// useRodzajDrozdzy + zapiszRodzajDrozdzy (app_settings `rodzaj_drozdzy`, guardSave → „Nie zapisano”, wybór działa
// w sesji). W Basic, bez blokady Pro (D-152). Pole dotyku ≥ 44 pt; przy dużym tekście każda opcja na całą
// szerokość (README §7a, D-142), bez limitu linii. [M3 p6a]
// ============================================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { useRodzajDrozdzy, zapiszRodzajDrozdzy, type RodzajDrozdzy } from '../../lib/rodzaj-drozdzy';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';
import { odstepy, promienie } from '../../ui/tokeny';
import { s } from './style-receptur';

export function SegmentDrozdzy() {
  const rodzaj = useRodzajDrozdzy();
  const szer = { flexBasis: useDuzyTekst() ? '100%' : 120 } as const;
  const opcja = (r: RodzajDrozdzy, id: string, etykieta: string) => {
    const wyb = rodzaj === r;
    return (
      <Pressable
        testID={id}
        accessibilityRole="radio"
        accessibilityState={{ checked: wyb, selected: wyb }}
        style={[styles.opcja, szer, wyb && styles.opcjaWybrana]}
        onPress={() => zapiszRodzajDrozdzy(r)}
      >
        <Text style={[s.chipTekst, wyb && styles.tekstWybrany]}>{etykieta}</Text>
      </Pressable>
    );
  };
  return (
    <View style={styles.miejsce}>
      <View testID="do-miski-yeast-type" style={styles.grupa} accessibilityRole="radiogroup" accessibilityLabel={t('Drożdże')}>
        {opcja('swieze', 'do-miski-yeast-fresh', t('świeże|drożdże'))}
        {opcja('suche', 'do-miski-yeast-dry', t('suche|drożdże'))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  miejsce: { paddingHorizontal: theme.spacing.md, paddingBottom: odstepy.s },
  grupa: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: odstepy.xs,
    padding: odstepy.xs,
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
  // Jak segment arkusza „Składniki”; obwódka 1,5 bez tokenu grubości (zgłoszenie do roli 04)
  opcjaWybrana: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
  },
  tekstWybrany: { fontWeight: '600' },
});
