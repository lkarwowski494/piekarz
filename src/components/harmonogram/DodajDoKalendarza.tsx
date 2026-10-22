// ============================================================================
// Piekarz — „Dodaj do kalendarza” w planie wypieku i w arkuszu zaplanowanego wypieku (BR-KAL-011; makieta roli 04 a2
// „1.1 f”): przycisk drugorzędny, pod nim wyjaśnienie, że aplikacja nie dostaje dostępu do kalendarza (OG-08), i po
// zmianie planu informacja, że wydarzenie w kalendarzu telefonu się nie zmieniło [M3 D8]. Funkcja Pro (BR-KAL-011,
// D-113): bez Pro przycisk widoczny, dotknięcie otwiera ekran Pro [M3 P-a].
// ============================================================================

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDodajDoKalendarza, type PlanDoKalendarza } from '../../hooks/useDodajDoKalendarza';
import { useAppAccess } from '../../lib/app-access';
import { announce } from '../../lib/announce';
import { t } from '../../lib/i18n';
import { etykietaPro } from '../../lib/platnosci/nazwy-pro';
import { OznaczeniePro } from '../OznaczeniePro';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

export function DodajDoKalendarza({ plan }: { plan: PlanDoKalendarza | null }) {
  const { dodaj, nieZmienil } = useDodajDoKalendarza(plan);
  const { chron, moze } = useAppAccess();
  const info = t('Wydarzenie w kalendarzu telefonu się nie zmieniło. Godziny zmienisz tam sam albo dodasz plan jeszcze raz.');
  useEffect(() => {
    if (nieZmienil) announce(info);
  }, [nieZmienil, info]);
  if (!plan) return null;
  const dostep = moze('kalendarz-telefonu');
  return (
    <View style={styles.blok}>
      {/* Bez Pro z oznaczeniem „Pro” (kontrakt „Reguły dostępu”, P2-4) [M3 P-b] */}
      <Pressable accessibilityRole="button" accessibilityLabel={etykietaPro(t('Dodaj do kalendarza'), dostep)} testID="plan-kalendarz-btn"
        style={styles.przycisk} onPress={chron('kalendarz-telefonu', dodaj)}>
        <Text style={styles.tekst}>{t('Dodaj do kalendarza')}</Text>
        {!dostep && <OznaczeniePro />}
      </Pressable>
      <Text style={styles.opis} testID="plan-kalendarz-opis">
        {t('Plan trafi do kalendarza telefonu jako plik z wydarzeniem. Piekarz nie dostaje dostępu do Twojego kalendarza.')}
      </Text>
      {nieZmienil ? (
        <Text style={styles.opis} testID="plan-kalendarz-nie-zmienil" accessibilityLiveRegion="polite">
          {info}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  blok: { marginTop: odstepy.s, gap: odstepy.xs },
  przycisk: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: odstepy.s,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: promienie.przycisk,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    paddingHorizontal: odstepy.m,
  },
  tekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
  opis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
});
