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
        <Text style={styles.title}>{t('Wykryto uszkodzony stan bazy danych')}</Text>
        <Text style={styles.message}>
          {t('Aplikacja bezpiecznie zabezpieczyła surowe dane w pliku ratunkowym:')} {corruptInfo.corruptFile}
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
    backgroundColor: '#7F1D1D', // Deep safety red
    borderColor: '#EF4444',
    borderWidth: 1,
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
    color: '#FEE2E2',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  message: {
    color: '#FECACA',
    fontSize: 12,
    lineHeight: 16,
  },
  dismissButton: {
    backgroundColor: '#991B1B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
