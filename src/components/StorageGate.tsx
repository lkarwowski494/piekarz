// ============================================================================
// Piekarz — StorageGate [M1-audytor-generalny-003]
// Gdy bazy danych nie da się otworzyć, zamiast aplikacji na danych pokazowych
// użytkownik widzi ekran błędu z ponowieniem. Dane w pliku bazy pozostają nietknięte.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import * as Sharing from 'expo-sharing';
import { getStorageState, getRescueFile, getRescueKind, subscribeStorageState, StorageState } from '../data/storage-status';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';

/** Udostępnia plik kopii bazy (np. do Plików) — droga eksportu po nieudanej migracji [M1-audytor-generalny-004]. */
export async function shareRescueFile(filePath: string): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;
  const uri = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
  // Komplet plików bazy w jednym JSON-ie (122) albo kopia SQLite sprzed migracji (004)
  const mimeType = uri.endsWith('.json') ? 'application/json' : 'application/x-sqlite3';
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: t('Udostępnij kopię bazy') });
  return true;
}

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
  // Start: kopia i migracje trwają, ekrany danych czekają (bez danych pokazowych) [M1-audytor-generalny-003; 05-architekt-502]
  if (state === 'initializing') {
    return (
      <View style={[styles.screen, styles.content]} testID="storage-initializing">
        <ActivityIndicator color={theme.colors.akcent} />
      </View>
    );
  }
  // Baza nowsza niż aplikacja: dane do przeglądania, komunikat nad aplikacją [M1-audytor-generalny-061]
  if (state === 'newer') {
    return (
      <View style={styles.screen}>
        <View style={styles.notice} accessibilityRole="alert" testID="storage-newer-notice">
          <Text style={styles.noticeText}>{t('Dane zapisała nowsza wersja Piekarza. Zaktualizuj aplikację, żeby dalej zapisywać. Do tego czasu możesz tylko przeglądać.')}</Text>
        </View>
        {children}
      </View>
    );
  }
  const rescue = getRescueFile();

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
      {rescue ? (
        <>
          <Text style={[styles.body, styles.rescueText]}>
            {getRescueKind() === 'pliki-bazy'
              ? t('Twoje dane są zapisane w telefonie. Zanim spróbujesz ponownie, możesz wyeksportować ich kopię.')
              : t('Kopia danych sprzed aktualizacji jest zapisana w telefonie. Możesz ją udostępnić, np. zapisać w Plikach.')}
          </Text>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => void shareRescueFile(rescue)}
            accessibilityRole="button"
            testID="storage-share-rescue"
          >
            <Text style={styles.secondaryButtonText}>{t('Udostępnij kopię bazy')}</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  notice: {
    borderColor: theme.colors.akcent,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    margin: theme.spacing.md,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
  },
  noticeText: {
    color: theme.colors.tusz,
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.krojTytulow,
    color: theme.colors.tusz,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  body: {
    color: theme.colors.tusz2,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.akcent,
    borderRadius: theme.radius.md,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.naAkcencie,
    fontSize: 16,
    fontWeight: '700',
  },
  rescueText: {
    marginTop: theme.spacing.lg,
  },
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
  secondaryButtonText: {
    color: theme.colors.akcentTekst,
    fontSize: 16,
    fontWeight: '700',
  },
});
