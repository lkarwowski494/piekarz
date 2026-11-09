// ============================================================================
// Piekarz — „Plan wypieku” trwającego wypieku (arkusz z prawego rogu nawigacji prowadzenia, design-spec §11b „056”)
// [M1-audytor-generalny-056]: składniki i lista kroków planu (wybór kroku przenosi do niego), na dole listy
// „Przerwij wypiek” w kolorze błędu z alertem [Wróć do wypieku] [Przerwij] (słownik §5).
// Na systemie kart: „Zamknij” i tytuł w pasku arkusza, składniki i etapy w kartach (README §1, §3, makieta
// wypiek.html: „Składniki do odważenia”, „Oś czasu”) [M1-audytor-generalny-007; 04-studio-projektowe-003].
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { CLOSE_TEST_ID } from '../CloseButton';
import { ArkuszKart } from '../arkusz/ArkuszKart';
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
    <ArkuszKart visible={p.visible} onRequestClose={p.onClose} tytul={t('Plan wypieku')}
      lewy={{ tekst: t('Zamknij'), onPress: p.onClose, testID: CLOSE_TEST_ID }}>
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
    </ArkuszKart>
  );
}

const styles = StyleSheet.create({
  przerwij: { minHeight: theme.cele.glownyPrzeplyw, justifyContent: 'center', alignItems: 'center', marginTop: odstepy.s },
  przerwijTekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.blad },
});
