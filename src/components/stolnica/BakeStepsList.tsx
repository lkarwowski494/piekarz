// ============================================================================
// Piekarz — treść arkusza „Plan wypieku”: karta „Składniki do odważenia” i karta „Wszystkie etapy wypieku”
// (README systemu kart §1–§2, makieta docs/design/karty/wypiek.html: składniki jako wiersze karty, oś czasu jako
// wiersze z linią). Wybór kroku przenosi do niego (zachowanie bez zmian). Bieżący krok: wypełnione kółko z numerem
// i pogrubiona nazwa (nie sam kolor), krok miniony: znak „✓”. [M1-audytor-generalny-007; 04-studio-projektowe-003]
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { formatWeight, formatDoseWeight, UnitSystem } from '../../lib/unit-converter';
import { t } from '../../lib/i18n';
import { formatFixed } from '../../lib/format';
import { Karta } from '../../ui/karty/Karta';
import { WierszKarty } from '../../ui/karty/WierszKarty';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

import type { SessionStep } from '../../core/bake-steps';
import type { DoughRecipeResult } from '../../core/domain-rules';

export interface BakeStepsListProps {
  steps: readonly SessionStep[];
  currentStepIdx: number;
  onGoToStep: (idx: number) => void;
  calculatedRecipe?: DoughRecipeResult;
  unitSystem: UnitSystem;
}

/** Odstęp pionowy wiersza karty (README §2: 10/16), jak w `WierszKarty`. */
const ODSTEP_PIONOWY = 10;
const KOLKO = 28;

export function BakeStepsList({
  steps,
  currentStepIdx,
  onGoToStep,
  calculatedRecipe,
  unitSystem,
}: BakeStepsListProps) {
  return (
    <View testID="bake-steps-list" style={styles.lista}>
      {calculatedRecipe && (
        <Karta testID="karta-skladnikow-planu" tytul={t('Składniki do odważenia')} ikona={<IkonaKarty nazwa="waga" />} bezWypelnienia>
          <WierszKarty testID="plan-skladnik-maka" linia={false} etykieta={t('Mąki')} wartosc={formatWeight(calculatedRecipe.baseFlourWeightGrams, unitSystem)} />
          <WierszKarty testID="plan-skladnik-woda" etykieta={t('Woda')} wartosc={formatWeight(calculatedRecipe.waterGrams, unitSystem)} />
          <WierszKarty testID="plan-skladnik-zakwas" etykieta={t('Zakwas|składnik')} wartosc={formatWeight(calculatedRecipe.starterGrams, unitSystem)} />
          <WierszKarty testID="plan-skladnik-sol" etykieta={t('Sól')} wartosc={formatDoseWeight(calculatedRecipe.saltGrams, unitSystem)} />
          <Text style={styles.przypis}>
            {t('Masa ciasta: {masa}, hydratacja całkowita: {hydratacja}%', {
              masa: formatWeight(calculatedRecipe.targetDoughWeightGrams, unitSystem),
              hydratacja: formatFixed(calculatedRecipe.overallHydrationPercent, 1),
            })}
          </Text>
        </Karta>
      )}

      <Karta testID="karta-etapow-planu" tytul={t('Wszystkie etapy wypieku')} ikona={<IkonaKarty nazwa="lista" />} bezWypelnienia>
        {steps.map((step, idx) => {
          const isPast = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !!(isCurrent) }}
              key={step.id}
              onPress={() => onGoToStep(idx)}
              style={({ pressed }) => [styles.stepRow, idx > 0 && styles.stepRowLinia, isPast && styles.stepRowPast, pressed && styles.nacisniety]}
            >
              <Text style={[styles.stepNumber, isCurrent && styles.stepNumberCurrent]}>
                {isPast ? '✓' : `${idx + 1}`}
              </Text>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepName, isCurrent && styles.stepNameCurrent]}>
                  {t(step.name)}
                </Text>
                {step.durationMin !== null && <Text style={styles.stepTime}>{t('{n} min', { n: step.durationMin })}</Text>}
              </View>
            </Pressable>
          );
        })}
      </Karta>
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { gap: odstepy.m },
  przypis: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
    paddingHorizontal: odstepy.l,
    paddingTop: odstepy.xs,
    paddingBottom: odstepy.m,
  },
  stepRow: {
    minHeight: theme.cele.glownyPrzeplyw,
    flexDirection: 'row',
    alignItems: 'center',
    gap: odstepy.m,
    paddingVertical: ODSTEP_PIONOWY,
    paddingHorizontal: odstepy.l,
    borderTopColor: theme.colors.linia,
  },
  stepRowLinia: { borderTopWidth: 1 },
  stepRowPast: { opacity: 0.6 },
  nacisniety: { backgroundColor: theme.colors.tloGrupa },
  stepNumber: {
    minWidth: KOLKO,
    minHeight: KOLKO,
    borderRadius: KOLKO / 2,
    overflow: 'hidden',
    backgroundColor: theme.colors.powierzchnia,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: KOLKO,
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: theme.colors.tusz2,
  },
  stepNumberCurrent: {
    backgroundColor: theme.colors.akcent,
    color: theme.colors.naAkcencie,
  },
  stepInfo: { flex: 1, flexShrink: 1, gap: 2 },
  stepName: {
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.tusz,
  },
  stepNameCurrent: {
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  stepTime: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
  },
});
