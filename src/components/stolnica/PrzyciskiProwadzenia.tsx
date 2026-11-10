// ============================================================================
// Piekarz — prawy róg nawigacji prowadzenia (design-spec §11b „056”; D-051 2a) [M3 D4b, przegląd roli 04 z D3a]
// W trwającym wypieku „Doktor” obok „Plan wypieku” (BR-DIAG-003 „Powrót do prowadzenia”: Doktor otwiera się nad
// prowadzeniem, wstecz wraca na ten sam krok); bez wypieku sam skrót do Doktora jak dotąd. Wzorzec PrzyciskNaglowka.
// Od M3 p4b na pasie prowadzenia (naPasie, D-194). Zwarty pas (niski ekran): same ikony 44×44 pt z etykietą
// VoiceOver, żeby wstecz, „Krok n z m” i akcje mieściły się w jednym rzędzie przy 320 pt (KO-018, D-337)
// [M1-audytor-generalny-005].
// ============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { t } from '../../lib/i18n';
import { theme } from '../../ui/theme';
import { IkonaKarty, type NazwaIkonyKarty } from '../../ui/karty/IkonaKarty';
import { PrzyciskNaglowka } from '../nawigacja/PrzyciskNaglowka';

/** Ikony akcji pasa w zwartym pasie (D-337): kształty kart Doktora (bochenek) i karty „Plan wypieku” (kalendarz). */
export const IKONY_AKCJI_PASA: { doktor: NazwaIkonyKarty; plan: NazwaIkonyKarty } = { doktor: 'bochenek', plan: 'kalendarz' };

export function PrzyciskiProwadzenia({ aktywny, onPlan, onDoktor, naPasie = false, ikony = false }: {
  aktywny: boolean; onPlan: () => void; onDoktor: () => void; naPasie?: boolean;
  /** Same ikony (cel 44×44 pt, etykieta VoiceOver z tekstu przycisku) zamiast tekstu: zwarty pas (D-337). */
  ikony?: boolean;
}) {
  const kolor = naPasie ? theme.colors.naPasie : theme.colors.akcentTekst;
  return (
    <View style={styles.rzad}>
      <PrzyciskNaglowka testID="stolnica-doctor-shortcut-btn" etykieta={t('Doktor Chleba')} tekst={ikony ? undefined : t('Doktor')} naPasie={naPasie} onPress={onDoktor}
        ikona={ikony ? <IkonaKarty nazwa={IKONY_AKCJI_PASA.doktor} kolor={kolor} /> : undefined} />
      {aktywny && <PrzyciskNaglowka testID="bake-plan-btn" etykieta={t('Plan wypieku')} tekst={ikony ? undefined : t('Plan wypieku')} naPasie={naPasie} onPress={onPlan}
        ikona={ikony ? <IkonaKarty nazwa={IKONY_AKCJI_PASA.plan} kolor={kolor} /> : undefined} />}
    </View>
  );
}

const styles = StyleSheet.create({
  // Zawijany: przy 320 pt i dużym tekście na pasie oba przyciski schodzą pod siebie (D-194, PRZ-07)
  rzad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' },
});
