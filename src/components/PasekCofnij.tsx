// ============================================================================
// Piekarz — Pasek „Cofnij” (komponent systemu, design-spec §4, §5; D-051 1a) [M1-audytor-generalny-102]
// Po działaniu rutynowym: zdanie o skutku i „Przywróć”; znika sam po kilku sekundach (PASEK_COFNIJ_MS).
// Kolory: tło tusz, tekst tlo, promień 14 (makieta .pasek-cofnij w docs/design/ekrany/wspolne.css).
// ============================================================================

import React, { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../ui/theme';
import { odstepy, promienie, typografia } from '../ui/tokeny';
import { t } from '../lib/i18n';

/** „Przez kilka sekund” (design-spec §5, D-051 1a); dokładnej wartości system nie podaje — do potwierdzenia przez rolę 04. */
export const PASEK_COFNIJ_MS = 6000;

export function PasekCofnij({ tekst, onPrzywroc, onUkryj }: { tekst: string; onPrzywroc: () => void; onUkryj: () => void }) {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(tekst);
    const czas = setTimeout(onUkryj, PASEK_COFNIJ_MS);
    return () => clearTimeout(czas);
  }, [tekst, onUkryj]);
  return (
    <View testID="undo-bar" style={styles.pasek} accessibilityLiveRegion="polite">
      <Text style={styles.tekst}>{tekst}</Text>
      <Pressable testID="undo-restore-btn" accessibilityRole="button" onPress={onPrzywroc} style={styles.przycisk}>
        <Text style={styles.przyciskTekst}>{t('Przywróć')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pasek: {
    marginHorizontal: odstepy.m,
    backgroundColor: theme.colors.tusz,
    borderRadius: promienie.przycisk,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  tekst: { flexGrow: 1, flexShrink: 1, flexBasis: 160, fontSize: typografia.style.objasnienie.pt, color: theme.colors.tlo },
  przycisk: { minHeight: theme.cele.pozostale, justifyContent: 'center', marginLeft: 'auto' },
  przyciskTekst: { fontSize: typografia.style.objasnienie.pt, fontWeight: '700', color: theme.colors.tlo, textDecorationLine: 'underline' },
});
