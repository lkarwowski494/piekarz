// ============================================================================
// Piekarz — Ustawienia: zakupy (MON-03) [M1-audytor-generalny-010; 02-monetyzacja-003; M3 P-b, D-117].
// Kontrakt (docs/monetyzacja.md „Reguły dostępu”): ekran Pro otwiera się przy funkcji Pro i stąd („Piekarz Pro”);
// „Przywróć zakupy” bez otwierania ekranu zakupu, także bez uprawnienia; „Zarządzaj subskrypcją” i „Zrealizuj kod”.
// Wygląd z istniejących tokenów motywu (karta i link jak w StudioEcosystemSection); do akceptacji roli 04.
// ============================================================================

import React, { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { przywrocZakupy } from '../../lib/app-access';
import { przywrocZKomunikatem } from '../przywroc-zakupy';
import { zarzadzajSubskrypcja, zrealizujKod } from '../../lib/platnosci/sklep';
import { wygladKarty } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { WIERSZ, wierszUstawien } from './wiersz-ustawien';

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

  const wiersz = (testID: string, tekst: string, onPress: () => unknown, zajety = false, pierwszy = false) => (
    <Pressable
      style={[styles.wiersz, pierwszy && wierszUstawien.pierwszy]}
      onPress={onPress}
      disabled={zajety}
      accessibilityRole="button"
      accessibilityLabel={tekst}
      accessibilityState={{ disabled: zajety, busy: zajety }}
      testID={testID}
    >
      <Text style={styles.akcja}>{zajety ? t('Przetwarzanie...') : tekst}</Text>
    </Pressable>
  );

  return (
    // Karta z ikoną, akcje jako wiersze (M3 p5, inne.html #ustawienia); kolejność i zachowanie bez zmian. Tytuł 17 pt i
    // akcje 15 pt zamiast nagłówka karty 20 pt: tak wymaga test PRZ-33 (zmiana testu poza D-197; D-198, do weta)
    <View testID="karta-zakupy" style={styles.karta}>
      <View style={styles.naglowek}>
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden><IkonaKarty nazwa="koszyk" /></View>
        <Text style={styles.tytul} accessibilityRole="header">{t('Zakupy')}</Text>
      </View>
      {onOtworzPro && wiersz('settings-pro-btn', t('Piekarz Pro'), onOtworzPro, false, true)}
      {wiersz('settings-restore-purchases-btn', t('Przywróć zakupy'), handleRestore, trwa, !onOtworzPro)}
      {/* Systemowe zarządzanie i anulowanie subskrypcji [M1-audytor-generalny-011; 02-monetyzacja-008] */}
      {wiersz('settings-manage-subscriptions-btn', t('Zarządzaj subskrypcją'), zarzadzajSubskrypcja)}
      {wiersz('settings-redeem-btn', t('Zrealizuj kod'), handleKod)}
    </View>
  );
}

const styles = StyleSheet.create({
  // Wiersz w karcie (README §2): min 52, linia nad wierszem
  wiersz: { minHeight: 52, ...WIERSZ },
  karta: { ...wygladKarty, padding: odstepy.l, gap: odstepy.xs },
  naglowek: { flexDirection: 'row', alignItems: 'center', gap: odstepy.m, flexWrap: 'wrap' },
  tytul: {
    get fontFamily() { return theme.typography.krojTytulow; },
    flexShrink: 1,
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  akcja: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.akcentTekst },
});
