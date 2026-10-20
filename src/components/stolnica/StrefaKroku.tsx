// ============================================================================
// Piekarz — strefa kroku na ekranie prowadzenia (design-spec §11b „056”): tytuł kroku, czas do końca
// (etap żytni bez czasu w planie idzie bez minutnika, 030), treść kroku, test palca i dwie fazy garnka.
// ============================================================================

import React from 'react';
import { Text } from 'react-native';
import { t } from '../../lib/i18n';
import { formatTextUnits, UnitSystem } from '../../lib/unit-converter';
import { SessionStep, isDutchOvenStep } from '../../core/bake-steps';
import { stepHasTimer } from '../../core/bake-session';
import type { DutchOvenBakePhase } from '../../core/baking-phases';
import { PokeTestEntry } from './PokeTestEntry';
import { DutchOvenController } from './DutchOvenController';
import { styles } from './stolnica-screen.styles';
import { Ostrzezenie } from '../Ostrzezenie';
import type { StepWarning } from '../../core/step-warnings';

export interface StrefaKrokuProps {
  step: SessionStep;
  formattedTime: string;
  unitSystem: UnitSystem;
  dutchOvenPhase: DutchOvenBakePhase;
  isCompleted: boolean;
  onSwitchPhase: (phase: DutchOvenBakePhase) => void;
  onStartPhase2AfterSteamAlert: () => void;
  /** Ostrzeżenia bezpieczeństwa kroku według rodzaju (103); pusta lista = brak pola. */
  ostrzezenia: readonly StepWarning[];
}

export function StrefaKroku({ step, formattedTime, unitSystem, dutchOvenPhase, isCompleted, onSwitchPhase, onStartPhase2AfterSteamAlert, ostrzezenia }: StrefaKrokuProps) {
  return (
    <>
      <Text testID="step-title" style={styles.activeStepTitle}>{t(step.name)}</Text>
      {stepHasTimer(step) && <Text testID="step-time" style={styles.czas}>{formattedTime}</Text>}
      <Text style={styles.activeStepDesc}>{formatTextUnits(t(step.instructions), unitSystem)}</Text>
      {ostrzezenia.length > 0 && <Ostrzezenie tytul={t('Bezpieczeństwo')} teksty={ostrzezenia.map((w) => t(w.text))} />}
      <PokeTestEntry step={step} />

      {/* Dutch Oven Two-Phase Controller for the bake step */}
      {isDutchOvenStep(step) && (
        <DutchOvenController
          dutchOvenPhase={dutchOvenPhase}
          onSwitchPhase={onSwitchPhase}
          unitSystem={unitSystem}
          isCompleted={isCompleted}
          onStartPhase2AfterSteamAlert={onStartPhase2AfterSteamAlert}
        />
      )}
    </>
  );
}
