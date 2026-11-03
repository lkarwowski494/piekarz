// ============================================================================
// Piekarz — prawy róg nawigacji prowadzenia (design-spec §11b „056”; D-051 2a) [M3 D4b, przegląd roli 04 z D3a]
// W trwającym wypieku „Doktor” obok „Plan wypieku” (BR-DIAG-003 „Powrót do prowadzenia”: Doktor otwiera się nad
// prowadzeniem, wstecz wraca na ten sam krok); bez wypieku sam skrót do Doktora jak dotąd. Wzorzec PrzyciskNaglowka.
// Od M3 p4b na pasie prowadzenia (naPasie, D-194).
// ============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { t } from '../../lib/i18n';
import { PrzyciskNaglowka } from '../nawigacja/PrzyciskNaglowka';

export function PrzyciskiProwadzenia({ aktywny, onPlan, onDoktor, naPasie = false }: { aktywny: boolean; onPlan: () => void; onDoktor: () => void; naPasie?: boolean }) {
  return (
    <View style={styles.rzad}>
      <PrzyciskNaglowka testID="stolnica-doctor-shortcut-btn" etykieta={t('Doktor Chleba')} tekst={t('Doktor')} naPasie={naPasie} onPress={onDoktor} />
      {aktywny && <PrzyciskNaglowka testID="bake-plan-btn" etykieta={t('Plan wypieku')} tekst={t('Plan wypieku')} naPasie={naPasie} onPress={onPlan} />}
    </View>
  );
}

const styles = StyleSheet.create({
  // Zawijany: przy 320 pt i dużym tekście na pasie oba przyciski schodzą pod siebie (D-194, PRZ-07)
  rzad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' },
});
