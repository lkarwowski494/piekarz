// ============================================================================
// Piekarz — przelicznik hydratacji zakwasu i wylewki (przepisy na resztki zakwasu) w Basic, poza kartą proporcji
// dokarmiania (Pro, BR-ZAKW-002) [M3 P-b2]. Decyzja właściciela przez M1, 2026-10-22: „2 zgodnie z rekomendacja”
// (przegląd P-a P2-5, D-117). Przyciski i style przeniesione bez zmian z StarterFeedingCard (najmniejsza zmiana
// układu, do przeglądu roli 04). Oba wejścia PÓŹNIEJ w 1.0 (F-49, F-47; D-043): bez widocznego wejścia nic się nie rysuje.
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../lib/i18n';
import { wejscieWidoczne } from '../../lib/wejscia-pozniej';
import { theme } from '../../ui/theme';
import { typografia } from '../../ui/tokeny';

export function NarzedziaZakwasu({ onOpenConverter, onOpenDiscardRecipes }: { onOpenConverter: () => void; onOpenDiscardRecipes: () => void }) {
  const przelicznik = wejscieWidoczne('konwerter-zakwasu');
  const wylewki = wejscieWidoczne('odrzut-zakwasu');
  if (!przelicznik && !wylewki) return null;
  return (
    <View style={styles.blok}>
      {przelicznik && (
        <Pressable accessibilityRole="button" testID="open-converter-btn" style={styles.przycisk} onPress={onOpenConverter}>
          <Text style={styles.tekst}>{t('Konwerter zakwasu & Lievito Madre')}</Text>
        </Pressable>
      )}
      {wylewki && (
        <Pressable accessibilityRole="button" testID="open-discard-recipes-btn" style={styles.przycisk} onPress={onOpenDiscardRecipes}>
          <Text style={styles.tekst}>{t('Przepisy na Odrzut Zakwasu')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  blok: { marginBottom: theme.spacing.md },
  przycisk: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    marginBottom: 8,
  },
  tekst: { fontSize: typografia.style.przypis.pt, fontWeight: '600', color: theme.colors.tusz2 },
});
