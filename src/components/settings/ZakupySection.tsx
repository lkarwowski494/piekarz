// ============================================================================
// Piekarz — Ustawienia: zakupy (MON-03) [M1-audytor-generalny-010; 02-monetyzacja-003; M3 P-b, D-117].
// Kontrakt (docs/monetyzacja.md „Reguły dostępu”): ekran Pro otwiera się przy funkcji Pro i stąd („Piekarz Pro”);
// „Przywróć zakupy” bez otwierania ekranu zakupu, także bez uprawnienia; „Zarządzaj subskrypcją” i „Zrealizuj kod”.
// Wygląd z istniejących tokenów motywu (karta i link jak w StudioEcosystemSection); do akceptacji roli 04.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { przywrocZakupy } from '../../lib/app-access';
import { przywrocZKomunikatem } from '../przywroc-zakupy';
import { zarzadzajSubskrypcja, zrealizujKod } from '../../lib/platnosci/sklep';

export function ZakupySection({ onOtworzPro }: { onOtworzPro?: () => void }) {
  const [trwa, setTrwa] = useState(false);

  const handleRestore = async () => {
    setTrwa(true);
    try {
      await przywrocZKomunikatem(przywrocZakupy);
    } finally {
      setTrwa(false);
    }
  };

  // Arkusz realizacji kodu wymaga App Store; błąd nie jest cichy [M3 P-b]
  const handleKod = async () => {
    try {
      await zrealizujKod();
    } catch {
      Alert.alert(t('Zrealizuj kod'), t('Nie udało się otworzyć realizacji kodu. Realizacja kodu wymaga połączenia z App Store: sprawdź internet i spróbuj ponownie.'));
    }
  };

  const wiersz = (testID: string, tekst: string, onPress: () => unknown, zajety = false) => (
    <Pressable
      style={styles.linkRow}
      onPress={onPress}
      disabled={zajety}
      accessibilityRole="button"
      accessibilityLabel={tekst}
      accessibilityState={{ disabled: zajety, busy: zajety }}
      testID={testID}
    >
      <Text style={styles.linkText}>{zajety ? t('Przetwarzanie...') : tekst}</Text>
    </Pressable>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('Zakupy')}</Text>
      {onOtworzPro && wiersz('settings-pro-btn', t('Piekarz Pro'), onOtworzPro)}
      {wiersz('settings-restore-purchases-btn', t('Przywróć zakupy'), handleRestore, trwa)}
      {/* Systemowe zarządzanie i anulowanie subskrypcji [M1-audytor-generalny-011; 02-monetyzacja-008] */}
      {wiersz('settings-manage-subscriptions-btn', t('Zarządzaj subskrypcją'), zarzadzajSubskrypcja)}
      {wiersz('settings-redeem-btn', t('Zrealizuj kod'), handleKod)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  sectionTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: theme.spacing.sm,
  },
  linkRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
    textDecorationLine: 'underline',
  },
});
