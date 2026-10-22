// ============================================================================
// Piekarz — pasek kciuka planu: „Zacznij wypiek” przyklejony nad wskaźnikiem Home, poza przewijaną treścią
// (`plan-sen`, design-spec §4 i §11c 107) [M1-audytor-generalny-128; 04-studio-projektowe-501]. W stanie
// „za późno” nieaktywny z powodem pod przyciskiem (§11c 107) [M1-audytor-generalny-107].
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';

export interface PasekStartuProps {
  onStart: () => void;
  /** Powód, dla którego start jest nieaktywny; brak = aktywny. */
  powodBlokady?: string | null;
  /** Start w przyszłości: „Zaplanuj” obok „Zacznij wypiek” zapisuje niezaczęty wypiek (BR-KAL-009, D-108) [M3 D5]. */
  onZaplanuj?: () => void;
}

export function PasekStartu({ onStart, powodBlokady = null, onZaplanuj }: PasekStartuProps) {
  const zablokowany = !!powodBlokady;
  return (
    <SafeAreaView edges={['bottom']} style={styles.tlo}>
      <View testID="plan-thumb-bar" style={styles.pasek}>
        {/* „Zaplanuj” drugorzędny nad głównym startem (element nowy spoza makiety, do przeglądu roli 04) */}
        {onZaplanuj && !zablokowany ? (
          <Pressable accessibilityRole="button" testID="plan-zaplanuj-btn" style={styles.drugi} onPress={onZaplanuj}>
            <Text style={styles.drugiTekst}>{t('Zaplanuj')}</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: zablokowany }}
          accessibilityHint={powodBlokady ?? undefined}
          disabled={zablokowany}
          testID="plan-start-bake-btn"
          style={[styles.glowny, zablokowany && styles.glownyZablokowany]}
          onPress={() => {
            if (!zablokowany) onStart();
          }}
        >
          <Text style={[styles.glownyTekst, zablokowany && styles.tekstZablokowany]}>{t('Zacznij wypiek')}</Text>
        </Pressable>
        {powodBlokady ? <Text style={styles.powod}>{powodBlokady}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tlo: { backgroundColor: theme.colors.tlo, borderTopWidth: 1, borderTopColor: theme.colors.linia },
  pasek: { paddingTop: odstepy.m, paddingHorizontal: odstepy.xl, paddingBottom: odstepy.m, gap: odstepy.s },
  glowny: {
    minHeight: theme.cele.przyciskKciuka,
    borderRadius: promienie.przyciskGlowny,
    backgroundColor: theme.colors.akcent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.s,
  },
  glownyZablokowany: { backgroundColor: theme.colors.powierzchnia, borderWidth: 1.5, borderColor: theme.colors.obwodka },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naAkcencie, textAlign: 'center' },
  tekstZablokowany: { color: theme.colors.zablokowane },
  powod: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2, textAlign: 'center' },
  drugi: {
    minHeight: theme.cele.pozostale,
    borderRadius: promienie.przycisk,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.xs,
  },
  drugiTekst: { fontSize: typografia.style.naglowek.pt, color: theme.colors.tusz, textAlign: 'center' },
});
