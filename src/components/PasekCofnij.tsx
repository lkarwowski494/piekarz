// ============================================================================
// Piekarz — komponent systemu „Pasek Cofnij” (design-spec §4, §5; D-051 1a): po rutynowym usunięciu bez pytania
// pasek „Usunięto {obiekt}” z „Przywróć” na kilka sekund. [M1-audytor-generalny-104]
// ============================================================================

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../lib/i18n';
import { theme } from '../ui/theme';
import { odstepy, promienie, typografia } from '../ui/tokeny';

/** Czas widoczności paska (ms). */
export const PASEK_COFNIJ_MS = 6000;

export function PasekCofnij({ tekst, onPrzywroc, onZniknij }: { tekst: string; onPrzywroc: () => void; onZniknij: () => void }) {
  useEffect(() => {
    const id = setTimeout(onZniknij, PASEK_COFNIJ_MS);
    return () => clearTimeout(id);
  }, [tekst, onZniknij]);
  return (
    <View testID="pasek-cofnij" accessibilityLiveRegion="polite" style={styles.pasek}>
      <Text style={styles.tekst}>{tekst}</Text>
      <Pressable testID="pasek-cofnij-przywroc" accessibilityRole="button" style={styles.przycisk} onPress={onPrzywroc}>
        <Text style={styles.przyciskTekst}>{t('Przywróć')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pasek: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: odstepy.s,
    paddingHorizontal: odstepy.l,
    paddingVertical: odstepy.s,
    borderRadius: promienie.grupa,
    backgroundColor: theme.colors.tusz,
  },
  tekst: { flexShrink: 1, fontSize: typografia.style.tresc.pt, color: theme.colors.tlo },
  przycisk: { minHeight: theme.cele.pozostale, justifyContent: 'center', paddingHorizontal: odstepy.s },
  przyciskTekst: { fontSize: typografia.style.tresc.pt, fontWeight: '700', color: theme.colors.tlo },
});
