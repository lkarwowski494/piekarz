// ============================================================================
// Piekarz — strefa planu na ekranie prowadzenia (design-spec §11b „056”): nazwa receptury, Spirala koszyka
// z planu tego wypieku (058) i „Krok n z N”. Wydzielona z app/stolnica.tsx [M1-audytor-generalny-114].
// ============================================================================

import React from 'react';
import { Text } from 'react-native';
import { t } from '../../lib/i18n';
import type { SessionStep } from '../../core/bake-steps';
import { SpiralaWypieku } from '../Spirala';
import { styles } from './stolnica-screen.styles';

export interface StrefaPlanuProps {
  recipeName: string;
  steps: readonly SessionStep[];
  stepIdx: number;
  /** Pozostały czas kroku (s); null = krok bez minutnika. */
  pozostaloSec: number | null;
  /** Pełny czas kroku (s). */
  pelnySec: number;
}

export function StrefaPlanu({ recipeName, steps, stepIdx, pozostaloSec, pelnySec }: StrefaPlanuProps) {
  return (
    <>
      <Text style={styles.recipeTag}>{recipeName}</Text>
      <SpiralaWypieku steps={steps} stepIdx={stepIdx} pozostaloSec={pozostaloSec} pelnySec={pelnySec} />
      <Text style={styles.krokNzN}>{t('Krok {n} z {m}', { n: stepIdx + 1, m: steps.length })}</Text>
    </>
  );
}
