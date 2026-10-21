// ============================================================================
// Piekarz — Ustawienia: przełącznik przypomnień o karmieniu zakwasu (DEC-22 a) [M1-audytor-generalny-179;
// 11-wzrost-503]. Wyłączenie zabiera tylko powiadomienia o karmieniu; kroki wypieku przychodzą dalej.
// Wygląd jak sekcje obok (karta), przełącznik z systemu (SwitchRow, rola switch, 48 pt).
// ============================================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { SwitchRow } from '../ui';
import { usePrzypomnieniaKarmienia, zapiszPrzypomnieniaKarmienia } from '../../lib/przypomnienia-karmienia';
import { resyncNotifications } from '../../lib/notifications';

export function PrzypomnieniaKarmieniaSection() {
  const wlaczone = usePrzypomnieniaKarmienia();
  return (
    <View style={styles.card}>
      <SwitchRow
        testID="feeding-reminders-switch"
        label={t('Przypomnienia o karmieniu')}
        description={t('Gdy zakwas czeka na karmienie. Powiadomienia o krokach wypieku działają niezależnie.')}
        value={wlaczone}
        onValueChange={(v) => {
          void zapiszPrzypomnieniaKarmienia(v).then(() => resyncNotifications());
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.md,
  },
});
