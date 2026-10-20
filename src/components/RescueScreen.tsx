// ============================================================================
// Piekarz — ekran awaryjny [M1-audytor-generalny-018]
// Po wyjątku renderu albo dwóch nieudanych startach: eksport danych i ponowna próba.
// ============================================================================

import React, { useState } from 'react';
import { Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { collectBackupData } from '../data/sqlite-store';
import { exportBackup } from '../lib/backup';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';

interface RescueScreenProps {
  onRetry: () => Promise<void>;
}

export const RescueScreen: React.FC<RescueScreenProps> = ({ onRetry }) => {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const ok = await exportBackup(await collectBackupData());
      if (!ok) Alert.alert(t('Kopia zapasowa'), t('Nie udało się wyeksportować kopii'));
    } catch {
      Alert.alert(t('Kopia zapasowa'), t('Nie udało się wyeksportować kopii'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} testID="rescue-screen">
      <Text style={styles.title} accessibilityRole="header">
        {t('Piekarz nie uruchomił się poprawnie')}
      </Text>
      <Text style={styles.body}>
        {t('Twoje dane są zapisane w telefonie. Zanim spróbujesz ponownie, możesz wyeksportować ich kopię.')}
      </Text>
      <Pressable
        style={styles.button}
        onPress={handleExport}
        disabled={busy}
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
        testID="rescue-export"
      >
        <Text style={styles.buttonText}>{t('Eksportuj kopię danych')}</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onRetry} accessibilityRole="button" testID="rescue-retry">
        <Text style={styles.secondaryButtonText}>{t('Spróbuj ponownie')}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.tlo },
  content: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg },
  title: { fontFamily: theme.typography.krojTytulow,
           color: theme.colors.tusz, fontSize: 22, fontWeight: '700', marginBottom: theme.spacing.md },
  body: { color: theme.colors.tusz2, fontSize: 16, lineHeight: 22, marginBottom: theme.spacing.lg },
  button: {
    backgroundColor: theme.colors.akcent,
    borderRadius: theme.radius.md,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonText: { color: theme.colors.naAkcencie, fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderColor: theme.colors.akcent,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: { color: theme.colors.akcentTekst, fontSize: 16, fontWeight: '700' },
});
