// ============================================================================
// Piekarz — Ustawienia: zakupy (MON-03) [M1-audytor-generalny-010; 02-monetyzacja-003].
// „Przywróć zakupy” dostępne bez otwierania ekranu zakupu, także bez uprawnienia.
// Wygląd z istniejących tokenów motywu (karta i link jak w StudioEcosystemSection); do akceptacji roli 04.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { przywrocZakupy } from '../../lib/app-access';
import { przywrocZKomunikatem } from '../przywroc-zakupy';

export function ZakupySection() {
  const [trwa, setTrwa] = useState(false);

  const handleRestore = async () => {
    setTrwa(true);
    try {
      await przywrocZKomunikatem(przywrocZakupy);
    } finally {
      setTrwa(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('Zakupy')}</Text>
      <Pressable
        style={styles.linkRow}
        onPress={handleRestore}
        disabled={trwa}
        accessibilityRole="button"
        accessibilityLabel={t('Przywróć zakupy')}
        accessibilityState={{ disabled: trwa, busy: trwa }}
        testID="settings-restore-purchases-btn"
      >
        <Text style={styles.linkText}>{trwa ? t('Przetwarzanie...') : t('Przywróć zakupy')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  linkRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },
});
