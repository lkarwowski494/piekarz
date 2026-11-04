// ============================================================================
// Piekarz — Ustawienia: przełącznik przypomnień o karmieniu zakwasu (DEC-22 a) [M1-audytor-generalny-179;
// 11-wzrost-503]. Wyłączenie zabiera tylko powiadomienia o karmieniu; kroki wypieku przychodzą dalej.
// Wygląd jak sekcje obok (karta), przełącznik z rolą switch i stanem checked, 48 pt. Przełącznik w tym pliku:
// wspólny SwitchRow z src/components/ui.tsx usunięto jako nieosiągalny (M1-audytor-generalny-211).
// ============================================================================

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { usePrzypomnieniaKarmienia, zapiszPrzypomnieniaKarmienia } from '../../lib/przypomnienia-karmienia';
import { resyncNotifications } from '../../lib/notifications';
import { evaluateAppAccess } from '../../lib/app-access';
import { pobierzStan, subskrybujStan } from '../../lib/platnosci/stan';
import { dozwolona } from '../../lib/platnosci/dostep';
import { wygladKarty } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

export function PrzypomnieniaKarmieniaSection() {
  const wlaczone = usePrzypomnieniaKarmienia();
  // Bez Pro przypomnienia gotowego zakwasu nie przychodzą (BR-ZAKW-004, D-113): informacja zamiast cichego braku (P2-4) [M3 P-b]
  // (przed pierwszym odczytem sklepu bez informacji: nie mówi subskrybentowi, że nie ma Pro). Sam stan, bez odczytu sklepu:
  // odczyt robi dostawca dostępu (AppAccessProvider).
  const [stan, setStan] = useState(pobierzStan);
  useEffect(() => subskrybujStan(setStan), []);
  const pro = !stan.gotowe || dozwolona('przypomnienia-zakwasu', evaluateAppAccess(stan.decyzja).canCreateNewBake);
  const etykieta = t('Przypomnienia o karmieniu');
  return (
    <View style={styles.card}>
      <Pressable
        testID="feeding-reminders-switch"
        accessibilityRole="switch"
        accessibilityState={{ checked: wlaczone }}
        accessibilityLabel={etykieta}
        onPress={() => {
          void zapiszPrzypomnieniaKarmienia(!wlaczone).then(() => resyncNotifications());
        }}
        style={styles.wiersz}
      >
        {/* Wiersz-karta z ikoną (makieta: dzwonek przy nagłówku; etykieta przełącznika jest tytułem, bez drugiej kopii) [M3 p5] */}
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden><IkonaKarty nazwa="dzwonek" /></View>
        <View style={styles.tekst}>
          <Text style={styles.etykieta}>{etykieta}</Text>
          <Text style={styles.opis}>{t('Gdy zakwas czeka na karmienie. Powiadomienia o krokach wypieku działają niezależnie.')}</Text>
          {!pro && (
            <Text style={styles.opis} testID="feeding-reminders-pro">
              {t('Przypomnienia o dokarmianiu gotowego zakwasu są w Piekarz Pro. W czasie zakładania zakwasu przychodzą bez Pro.')}
            </Text>
          )}
        </View>
        <View style={[styles.tor, wlaczone && styles.torWlaczony]}>
          <View style={[styles.galka, wlaczone && styles.galkaWlaczona]} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...wygladKarty,
    paddingHorizontal: odstepy.l,
  },
  wiersz: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: odstepy.m, paddingVertical: 10, minHeight: 52 },
  tekst: { flex: 1, flexShrink: 1 },
  etykieta: { fontSize: typografia.style.tresc.pt, fontWeight: '600', color: theme.colors.tusz },
  opis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2, marginTop: 2 },
  tor: { width: 48, height: 28, borderRadius: 14, backgroundColor: theme.colors.obwodka, padding: 2, justifyContent: 'center' },
  torWlaczony: { backgroundColor: theme.colors.akcent },
  galka: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.powierzchnia },
  galkaWlaczona: { alignSelf: 'flex-end' },
});
