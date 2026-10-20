// ============================================================================
// Piekarz — „Plan wypieku” trwającego wypieku (arkusz z prawego rogu nawigacji prowadzenia, design-spec §11b „056”)
// [M1-audytor-generalny-056]: składniki i lista kroków planu (wybór kroku przenosi do niego), na dole listy
// „Przerwij wypiek” w kolorze błędu z alertem [Wróć do wypieku] [Przerwij] (słownik §5).
// ============================================================================

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { CloseButton } from '../CloseButton';
import { BakeStepsList } from './BakeStepsList';
import type { SessionStep } from '../../core/bake-steps';
import type { DoughRecipeResult } from '../../core/domain-rules';
import type { UnitSystem } from '../../lib/unit-converter';

export interface PlanWypiekuArkuszProps {
  visible: boolean;
  onClose: () => void;
  steps: readonly SessionStep[];
  currentStepIdx: number;
  onGoToStep: (idx: number) => void;
  calculatedRecipe?: DoughRecipeResult;
  unitSystem: UnitSystem;
  onPrzerwij: () => void;
}

export function PlanWypiekuArkusz(p: PlanWypiekuArkuszProps) {
  return (
    <Modal visible={p.visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={p.onClose}>
      <SafeAreaView style={styles.arkusz} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.naglowek}>
          <Text style={styles.tytul} accessibilityRole="header">{t('Plan wypieku')}</Text>
          <CloseButton akcja="zamknij" onPress={p.onClose} />
        </View>
        <ScrollView contentContainerStyle={styles.tresc} keyboardShouldPersistTaps="handled">
          <BakeStepsList
            steps={p.steps}
            currentStepIdx={p.currentStepIdx}
            onGoToStep={(idx) => {
              p.onGoToStep(idx);
              p.onClose();
            }}
            calculatedRecipe={p.calculatedRecipe}
            unitSystem={p.unitSystem}
          />
          <Pressable testID="discard-bake-btn" accessibilityRole="button" style={styles.przerwij} onPress={p.onPrzerwij}>
            <Text style={styles.przerwijTekst}>{t('Przerwij wypiek')}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  arkusz: { flex: 1, backgroundColor: theme.colors.tlo },
  naglowek: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: odstepy.l,
    paddingVertical: odstepy.s,
    gap: odstepy.s,
  },
  tytul: { flex: 1, fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  tresc: { padding: odstepy.l, paddingBottom: odstepy.xxxl },
  przerwij: { minHeight: theme.cele.glownyPrzeplyw, justifyContent: 'center', alignItems: 'center', marginTop: odstepy.l },
  przerwijTekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.blad },
});
