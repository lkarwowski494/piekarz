// ============================================================================
// Piekarz — wybór „na zakwasie / na drożdżach” na ekranie receptury (D-154; receptury z wersją drożdżową, D-173).
// Wygląd i zachowanie jak segment „świeże / suche” (SegmentDrozdzy, D-136): najbliższy element systemu roli 04,
// bo makieta przełącznika wersji nie istnieje (D-137 rysował receptury-bliźniaki; zgłoszenie do roli 04).
// Pole dotyku ≥ 44 pt; przy dużym tekście każda opcja na całą szerokość (README §7a) [M3 p9b].
// ============================================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';
import { odstepy, promienie } from '../../ui/tokeny';
import type { WersjaWypieku } from '../../data/wybory-parsery';
import { s } from './style-receptur';

export function SegmentWersji({ wersja, onWybierz }: { wersja: WersjaWypieku; onWybierz: (w: WersjaWypieku) => void }) {
  const szer = { flexBasis: useDuzyTekst() ? '100%' : 120 } as const;
  const opcja = (w: WersjaWypieku, id: string, etykieta: string) => {
    const wyb = wersja === w;
    return (
      <Pressable
        testID={id}
        accessibilityRole="radio"
        accessibilityState={{ checked: wyb, selected: wyb }}
        style={[styles.opcja, szer, wyb && styles.opcjaWybrana]}
        onPress={() => onWybierz(w)}
      >
        <Text style={[s.chipTekst, wyb && styles.tekstWybrany]}>{etykieta}</Text>
      </Pressable>
    );
  };
  return (
    <View testID="recipe-version" style={styles.grupa} accessibilityRole="radiogroup" accessibilityLabel={t('Wersja receptury')}>
      {opcja('zakwas', 'recipe-version-sourdough', t('na zakwasie|wersja receptury'))}
      {opcja('drozdze', 'recipe-version-yeast', t('na drożdżach|wersja receptury'))}
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
