// ============================================================================
// Piekarz — strefa kroku na ekranie prowadzenia (design-spec §11b „056”): tytuł kroku, czas do końca
// (etap żytni bez czasu w planie idzie bez minutnika, 030), „do {godzina}, potem …”, treść kroku, Ostrzeżenie,
// „Ekran nie zgaśnie…” w kroku czynnym (114), test palca i dwie fazy garnka.
// ============================================================================

import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useMotyw } from '../../ui/motyw';
import { typografia } from '../../ui/tokeny';
import { usePogrubionyTekst, wagaTytulu } from '../../ui/pogrubiony-tekst';
import { t } from '../../lib/i18n';
import { formatTextUnits, UnitSystem } from '../../lib/unit-converter';
import { SessionStep, isDutchOvenStep } from '../../core/bake-steps';
import { stepHasTimer } from '../../core/bake-session';
import type { DutchOvenBakePhase } from '../../core/baking-phases';
import { PokeTestEntry } from './PokeTestEntry';
import { DutchOvenController } from './DutchOvenController';
import { styles } from './stolnica-screen.styles';
import { Ostrzezenie } from '../Ostrzezenie';
import { tytulOstrzezen, type StepWarning } from '../../core/step-warnings';

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
  /** Etykieta VoiceOver czasu kroku (słownie, liczba mnoga przez i18n) [M1-audytor-generalny-114]. */
  czasEtykieta?: string;
  /** „do {godzina}, potem {następny krok}” albo po czasie „Potem: …”; null = brak linii. */
  potem?: string | null;
  /** „Ekran nie zgaśnie do końca kroku. Powiadomienie o {godzina}.” tylko w kroku czynnym; null = brak. */
  ekran?: string | null;
}

export function StrefaKroku({ step, formattedTime, unitSystem, dutchOvenPhase, isCompleted, onSwitchPhase, onStartPhase2AfterSteamAlert, ostrzezenia, czasEtykieta, potem = null, ekran = null }: StrefaKrokuProps) {
  const tytul = tytulOstrzezen(ostrzezenia);
  const { kolory } = useMotyw();
  // „Pogrubiony tekst” iOS: tytuł kroku i czas w kroju tytułów o stopień ciężej [M1-audytor-generalny-158]
  const waga = { fontWeight: wagaTytulu(usePogrubionyTekst()) };
  return (
    <>
      <Text testID="step-title" style={[styles.activeStepTitle, waga]}>{t(step.name)}</Text>
      {/* Czas rośnie z Dynamic Type najwyżej do tokenu AX5 (56 → 99 pt); „1:05:00” przy 320 pt zmniejsza się w jednym
          wierszu zamiast łamać cyfry [M1-audytor-generalny-201; reaudit-noc N-2] */}
      {stepHasTimer(step) && (
        <Text testID="step-time" style={[styles.czas, waga]} accessibilityLabel={czasEtykieta}
          maxFontSizeMultiplier={typografia.style.czas.ax5 / typografia.style.czas.pt}
          numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
          {formattedTime}
        </Text>
      )}
      {potem !== null && <Text testID="step-next" style={styles.potem}>{potem}</Text>}
      <Text style={styles.activeStepDesc}>{formatTextUnits(t(step.instructions), unitSystem)}</Text>
      {tytul !== null && <Ostrzezenie tytul={t(tytul)} teksty={ostrzezenia.map((w) => t(w.text))} />}
      {ekran !== null && (
        <View testID="step-screen-on" style={styles.ekran}>
          <Svg width={20} height={20} viewBox="0 0 24 24" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Rect x={7} y={2.5} width={10} height={19} rx={2.5} fill="none" stroke={kolory.tusz2} strokeWidth={1.8} />
            <Circle cx={12} cy={9} r={2.2} fill={kolory.tusz2} />
          </Svg>
          <Text style={styles.ekranTekst}>{ekran}</Text>
        </View>
      )}
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
