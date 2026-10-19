// ============================================================================
// Piekarz — wejście do przewodnika testu palca w Stolnicy przy garowaniu końcowym
// (F-15, BR-ETAP-003, D-032) [M1-audytor-generalny-032]. Treść z istniejącego
// KitchenTestsGuideSection (Doktor); wygląd z tokenów motywu, do potwierdzenia przez rolę 04.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { useAppAccess } from '../../lib/app-access';
import { SessionStep, showsPokeTestEntry } from '../../core/bake-steps';
import { KitchenTestsGuideSection } from '../doktor/KitchenTestsGuideSection';

export function PokeTestEntry({ step }: { step: Pick<SessionStep, 'id' | 'category'> }) {
  const [open, setOpen] = useState<boolean>(false);
  const { chron } = useAppAccess();
  if (!showsPokeTestEntry(step)) return null;
  return (
    <View style={styles.container}>
      <Pressable
        testID="stolnica-poke-test-btn"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.entryBtn}
        onPress={chron('stolnica', () => setOpen((v) => !v))}
      >
        <Text style={styles.entryBtnText}>👆 {t('Sprawdź gotowość: test palca')}</Text>
      </Pressable>
      {open && <KitchenTestsGuideSection />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  entryBtn: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  entryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});
