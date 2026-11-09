// ============================================================================
// Piekarz — strefa kroku na ekranie prowadzenia (design-spec §11b „056”): tytuł kroku, czas do końca
// (etap żytni bez czasu w planie idzie bez minutnika, 030), „do {godzina}, potem …”, treść kroku, Ostrzeżenie,
// „Ekran nie zgaśnie…” w kroku czynnym (114), test palca i dwie fazy garnka. Na prowadzeniu tytuł, czas i „potem …” są
// na pasie ekranu (O3a, D-194: `naglowekNaPasie`, CzasKroku); ogłoszenie nowego kroku zostaje tutaj.
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { announce } from '../../lib/announce';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useMotyw } from '../../ui/motyw';
import { typografia } from '../../ui/tokeny';
import { usePogrubionyTekst, wagaTytulu } from '../../ui/pogrubiony-tekst';
import { t } from '../../lib/i18n';
import { formatTextUnits, UnitSystem } from '../../lib/unit-converter';
import { SessionStep, isDutchOvenStep } from '../../core/bake-steps';
import { stepHasTimer } from '../../core/bake-session';
import { fazyGarnka, type DutchOvenBakePhase } from '../../core/baking-phases';
import { PokeTestEntry } from './PokeTestEntry';
import { DutchOvenController } from './DutchOvenController';
import { styles } from './stolnica-screen.styles';
import { Ostrzezenie } from '../Ostrzezenie';
import { tytulOstrzezen, type StepWarning } from '../../core/step-warnings';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

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
  /** Numer kroku i liczba kroków planu: nagłówek karty instrukcji „Krok {n} z {m}” (M3 p4, D-192); bez numeru nazwa kroku. */
  numer?: { n: number; m: number };
  /** Tytuł, czas i „potem …” są na pasie ekranu (O3a, D-194): strefa pokazuje tylko kartę „Co zrobić” (numer kroku na pasie, D-209), ostrzeżenie i garnek. */
  naglowekNaPasie?: boolean;
}

type CzasKrokuProps = Pick<StrefaKrokuProps, 'step' | 'formattedTime' | 'czasEtykieta' | 'potem'>;

/**
 * Czas kroku na pasie prowadzenia (D-194): kolory pasa, waga z „Pogrubionego tekstu” jak tytuł pasa. Zwarty (niski
 * ekran, rola 04 p4b, 005): czas 28 pt i „potem …” obok niego w jednym rzędzie, zawija się pod czas, gdy brak miejsca.
 */
export function CzasKrokuNaPasie({ zwarty = false, ...p }: CzasKrokuProps & { zwarty?: boolean }) {
  const czas = <CzasKroku {...p} waga={{ fontWeight: wagaTytulu(usePogrubionyTekst()) }} naPasie zwarty={zwarty} />;
  return zwarty ? <View testID="czas-rzad" style={styles.czasRzad}>{czas}</View> : czas;
}

/** Czas kroku i „do {godzina}, potem …”; waga od rodzica (jeden słuchacz „Pogrubionego tekstu” na strefę). */
function CzasKroku({ step, formattedTime, czasEtykieta, potem = null, naPasie = false, zwarty = false, waga }: CzasKrokuProps & { naPasie?: boolean; zwarty?: boolean; waga: { fontWeight: ReturnType<typeof wagaTytulu> } }) {
  return (
    <>
      {/* Czas rośnie z Dynamic Type najwyżej do tokenu AX5 (56 → 99 pt); „1:05:00” przy 320 pt zmniejsza się w jednym
          wierszu zamiast łamać cyfry [M1-audytor-generalny-201; reaudit-noc N-2] */}
      {stepHasTimer(step) && (
        <Text testID="step-time" style={[styles.czas, zwarty && styles.czasZwarty, waga, naPasie && styles.naPasie]} accessibilityLabel={czasEtykieta}
          maxFontSizeMultiplier={typografia.style.czas.ax5 / typografia.style.czas.pt}
          numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
          {formattedTime}
        </Text>
      )}
      {potem !== null && <Text testID="step-next" style={[styles.potem, zwarty && styles.potemZwarty, naPasie && styles.naPasie2]}>{potem}</Text>}
    </>
  );
}

export function StrefaKroku({ step, formattedTime, unitSystem, dutchOvenPhase, isCompleted, onSwitchPhase, onStartPhase2AfterSteamAlert, ostrzezenia, czasEtykieta, potem = null, ekran = null, numer, naglowekNaPasie = false }: StrefaKrokuProps) {
  const tytul = tytulOstrzezen(ostrzezenia);
  const { kolory } = useMotyw();
  // „Pogrubiony tekst” iOS: tytuł kroku i czas w kroju tytułów o stopień ciężej [M1-audytor-generalny-158]
  const waga = { fontWeight: wagaTytulu(usePogrubionyTekst()) };
  // Po „Zrobione” albo „Cofnij” VoiceOver zostaje na przycisku: ogłoś nowy krok (bez ogłoszenia przy wejściu na ekran)
  // [audyt-niezalezny G-1]
  const poprzedniKrok = useRef(step.id);
  useEffect(() => {
    if (poprzedniKrok.current === step.id) return;
    poprzedniKrok.current = step.id;
    announce(t('Teraz: {nazwa}', { nazwa: t(step.name) }));
  }, [step.id, step.name]);
  return (
    <>
      {!naglowekNaPasie && (
        <>
          <Text testID="step-title" style={[styles.activeStepTitle, waga]}>{t(step.name)}</Text>
          <CzasKroku step={step} formattedTime={formattedTime} czasEtykieta={czasEtykieta} potem={potem} waga={waga} />
        </>
      )}
      {/* Instrukcja kroku i „Ekran nie zgaśnie…” w karcie (README §4 prowadzenie, makieta wypiek.html#prowadzenie, M3 p4);
          Ostrzeżenie bez zmian treści i zachowania, jak w makiecie pod kartą instrukcji */}
      <Karta testID="karta-kroku" tytul={naglowekNaPasie ? t('Co zrobić') : numer ? t('Krok {n} z {m}', numer) : t(step.name)} ikona={<IkonaKarty nazwa="ksiazka" />}>
      <Text style={styles.activeStepDesc}>{formatTextUnits(t(step.instructions), unitSystem)}</Text>
      {ekran !== null && (
        <View testID="step-screen-on" style={styles.ekran}>
          <Svg width={20} height={20} viewBox="0 0 24 24" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Rect x={7} y={2.5} width={10} height={19} rx={2.5} fill="none" stroke={kolory.tusz2} strokeWidth={1.8} />
            <Circle cx={12} cy={9} r={2.2} fill={kolory.tusz2} />
          </Svg>
          <Text style={styles.ekranTekst}>{ekran}</Text>
        </View>
      )}
      </Karta>
      {tytul !== null && <Ostrzezenie tytul={t(tytul)} teksty={ostrzezenia.map((w) => t(w.text))} />}
      <PokeTestEntry step={step} />

      {/* Dutch Oven Two-Phase Controller for the bake step */}
      {isDutchOvenStep(step) && (
        <DutchOvenController
          fazy={fazyGarnka(step)}
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
