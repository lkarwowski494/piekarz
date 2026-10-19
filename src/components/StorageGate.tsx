// ============================================================================
// Piekarz — StorageGate [M1-audytor-generalny-003]
// Gdy bazy danych nie da się otworzyć, zamiast aplikacji na danych pokazowych
// użytkownik widzi ekran błędu z ponowieniem. Dane w pliku bazy pozostają nietknięte.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { getStorageState, subscribeStorageState, StorageState } from '../data/storage-status';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';

interface StorageGateProps {
  children: React.ReactNode;
  onRetry: () => Promise<void>;
}

export const StorageGate: React.FC<StorageGateProps> = ({ children, onRetry }) => {
  const [state, setState] = useState<StorageState>(getStorageState());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setState(getStorageState());
    return subscribeStorageState(setState);
  }, []);

  if (state === 'ok') return <>{children}</>;

  const handleRetry = async () => {
    setBusy(true);
    try {
      await onRetry();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} testID="storage-unavailable-screen">
      <Text style={styles.title} accessibilityRole="header">
        {t('Nie można otworzyć bazy danych')}
      </Text>
      <Text style={styles.body}>
        {t('Twoje dane nie zostały zmienione, ale aplikacja nie może ich teraz odczytać ani zapisać. Uruchom aplikację ponownie. Jeśli problem wróci, zwolnij miejsce w pamięci telefonu.')}
      </Text>
      <Pressable
        style={styles.button}
        onPress={handleRetry}
        disabled={busy}
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
        testID="storage-retry"
      >
        <Text style={styles.buttonText}>{t('Spróbuj ponownie')}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  body: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
