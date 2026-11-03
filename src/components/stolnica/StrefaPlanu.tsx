// ============================================================================
// Piekarz — strefa planu na ekranie prowadzenia (design-spec §11b „056”): nazwa receptury, Spirala koszyka
// z planu tego wypieku (058) i „Gotowe {dzień} o {godzina}” (makieta prowadzenia, 04-studio-projektowe-029); „Krok n z N”
// jest nagłówkiem karty instrukcji (StrefaKroku, M3 p4, D-192). Wydzielona z app/stolnica.tsx [M1-audytor-generalny-114].
// ============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import { nazwaReceptury } from '../../lib/nazwa-receptury';
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
  /** „Gotowe {dzień} o {godzina}”; null = plan bez godziny końca (linia znika). */
  gotowe?: string | null;
  /** Koniec zegara kroku (ms), ten sam co dla tekstów prowadzenia: Spirala mówi tę samą godzinę „gotowe” (N-4). */
  koniecKrokuMs?: number | null;
}

export function StrefaPlanu({ recipeName, steps, stepIdx, pozostaloSec, pelnySec, gotowe = null, koniecKrokuMs = null }: StrefaPlanuProps) {
  return (
    <>
      <Text testID="stolnica-nazwa-wypieku" style={styles.recipeTag}>{nazwaReceptury(recipeName)}</Text>
      <SpiralaWypieku steps={steps} stepIdx={stepIdx} pozostaloSec={pozostaloSec} pelnySec={pelnySec} koniecKrokuMs={koniecKrokuMs} />
      <View style={styles.planOpis}>
        {gotowe !== null && <Text testID="plan-ready" style={styles.gotowe}>{gotowe}</Text>}
      </View>
    </>
  );
}
