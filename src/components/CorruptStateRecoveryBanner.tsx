// ============================================================================
// Piekarz (Crust) — CorruptStateRecoveryBanner (BR-TEST-023)
// Nieinwazyjny baner odzyskiwania uszkodzonego stanu przy starcie
// ============================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { checkCorruptState, dismissCorruptState, CorruptStateRecovery } from '../lib/backup';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';

export const CorruptStateRecoveryBanner: React.FC = () => {
  const [corruptInfo, setCorruptInfo] = useState<CorruptStateRecovery | null>(null);

  useEffect(() => {
    void checkCorruptState().then((info) => {
      if (info) setCorruptInfo(info);
    });
  }, []);

  if (!corruptInfo) return null;

  const handleDismiss = async () => {
    await dismissCorruptState(corruptInfo.corruptFile);
    setCorruptInfo(null);
  };

  return (
    <View style={styles.banner} testID="corrupt-state-recovery-banner">
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t('Baza danych nie otworzyła się przy poprzednim uruchomieniu')}</Text>
        <Text style={styles.message}>
          {corruptInfo.rawFiles.length > 0
            ? t('Kopia plików bazy z tej chwili jest w aplikacji Pliki: Piekarz › Backup › kopie-ratunkowe.')
            : t('Zapisano opis błędu w pliku: {file}. Kopii plików bazy nie udało się wykonać.', { file: corruptInfo.corruptFile })}
        </Text>
      </View>
      <Pressable
        style={styles.dismissButton}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel={t('Rozumiem, zamknij komunikat ratunkowy')}
      >
        <Text style={styles.dismissText}>{t('Ukryj')}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.powierzchnia, // błąd: tekst blad + obwódka blad (mapa-rol.md §3)
    borderColor: theme.colors.blad,
    borderWidth: 1.5,
    borderRadius: theme.radius.sm,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: theme.colors.blad,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  message: {
    color: theme.colors.tusz,
    fontSize: 12,
    lineHeight: 16,
  },
  dismissButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    color: theme.colors.tusz,
    fontWeight: '600',
    fontSize: 13,
  },
});
