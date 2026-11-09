// ============================================================================
// Apps4Craft Studio — StarterPeakActivityCard Component
// Sourdough starter peak activity prediction and feeding timer.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { czasSlownie } from '../../lib/spirala-etykieta';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t, tPlural } from '../../lib/i18n';
import { formatTemperature, UnitSystem } from '../../lib/unit-converter';
import type { SourdoughPhaseResult } from '../../core/sourdough-physics';
import type { PeakPredictionResult } from '../../core/starter-peak-predictor';
import { formatTime } from '../../lib/format';
import { czasTrwania } from '../../lib/czas-trwania';

import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';
const DNI = { one: '{n} dzień', few: '{n} dni', many: '{n} dni', other: '{n} dnia' };

/** Etykieta fazy zakwasu w języku aplikacji; liczba dni formami CLDR [M1-audytor-generalny-093; M1-audytor-generalny-071]. */
export function etykietaFazyZakwasu(f: SourdoughPhaseResult): string {
  if (!f.labelTemplatePl) return t(f.labelPl);
  return t(f.labelTemplatePl, f.labelDni === undefined ? f.labelParams : { dni: tPlural(f.labelDni, DNI) });
}

/**
 * Okno szczytu i parametry komunikatu w języku aplikacji: godziny przez Intl (formatTime), czas „{h} h {m} min”
 * z kluczy (czasTrwania); bez znaczników czasu — tekst z rdzenia [audyt-niezalezny F-2].
 */
export function oknoIStatusSzczytu(p: StarterPeakActivityCardProps['peakPrediction']): { okno: string; params: Record<string, string> } {
  const okno =
    p.peakWindowStartTimestamp !== undefined && p.peakWindowEndTimestamp !== undefined
      ? `${formatTime(p.peakWindowStartTimestamp)} – ${formatTime(p.peakWindowEndTimestamp)}`
      : p.formattedWindowPl;
  const params = { ...p.statusParams };
  if (p.statusMinuty !== undefined && 'czas' in params) params.czas = czasTrwania(p.statusMinuty).tekst;
  if ('okno' in params) params.okno = okno;
  return { okno, params };
}

export interface StarterPeakActivityCardProps {
  phaseResult: SourdoughPhaseResult;
  peakPrediction: Pick<
    PeakPredictionResult,
    | 'formattedWindowPl'
    | 'progressPercent'
    | 'isCurrentlyInPeak'
    | 'hasPassedPeak'
    | 'statusMessagePl'
    | 'statusTemplatePl'
    | 'statusParams'
  > &
    Partial<Pick<PeakPredictionResult, 'peakWindowStartTimestamp' | 'peakWindowEndTimestamp' | 'statusMinuty'>>;
  /** W lodówce okna szczytu nie liczymy (model temperatury 20–26 °C, FER-Q10-902) [M1-audytor-generalny-044]. */
  showPeakWindow?: boolean;
  /** Wybór temperatury otoczenia (faza na odznace); w lodówce ukryty. */
  pokazTemperature?: boolean;
  ambientTempC: number;
  onAmbientTempChange: (temp: number) => void;
  unitSystem: UnitSystem;
}

export function StarterPeakActivityCard({
  phaseResult,
  peakPrediction,
  showPeakWindow = true,
  pokazTemperature = true,
  ambientTempC,
  onAmbientTempChange,
  unitSystem,
}: StarterPeakActivityCardProps) {
  const szczyt = oknoIStatusSzczytu(peakPrediction);
  // Bez okna szczytu (reguła bez źródła, OP-39 [DO USTALENIA]) faza z okna i rada według niej znikają; znacznik pokazuje
  // czas od dokarmienia. Faza w lodówce i „brak danych” zostają (BR-ZAKW-003, ER-79) [M1-audytor-generalny-004]
  const bezFazy = !showPeakWindow && ['before', 'peak', 'after'].includes(phaseResult.phase);
  const znacznikFazy = bezFazy ? t('{czas} od dokarmienia', { czas: czasSlownie(Math.round(phaseResult.elapsedHours * 60)) }) : etykietaFazyZakwasu(phaseResult);
  // Chipy temperatury: przy dużym tekście dwa w rzędzie zamiast czterech (flexBasis od fontScale, README §7a) [M3 p2]
  const chipSzer = { flexBasis: useDuzyTekst() ? '45%' : '20%' } as const;
  // Karta systemu kart; faza jako znacznik po prawej nagłówka (karty/README.md §2–§3) [M3 p2]
  return (
    <View testID="peak-activity-card">
    <Karta
      testID="karta-szczyt"
      tytul={t('Szczyt aktywności')}
      ikona={<IkonaKarty nazwa="zegar" />}
      znacznik={
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseBadgeText}>
            ● {znacznikFazy}
          </Text>
        </View>
      }
    >

      {!bezFazy && <Text style={styles.phaseAdvice}>{t(phaseResult.advicePl)}</Text>}

      {/* Metabolic Peak Window Prediction */}
      {showPeakWindow && (
      <View style={styles.predictionBox} testID="peak-prediction-box">
        <View style={styles.predictionRow}>
          <Text style={styles.predictionLabel}>{t('Szacowane okno szczytu:')}</Text>
          <Text style={styles.predictionWindowText}>{szczyt.okno}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${peakPrediction.progressPercent}%`,
                backgroundColor: theme.colors.akcent,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressSubtext}>
            {t('Postęp do szczytu:')} {peakPrediction.progressPercent}%
          </Text>
          <Text style={styles.progressSubtext}>
            {peakPrediction.isCurrentlyInPeak ? t('W szczycie') : ''}
          </Text>
        </View>

        <Text style={styles.predictionStatusText}>
          {t(peakPrediction.statusTemplatePl, szczyt.params)}
        </Text>
      </View>
      )}

      {/* Temperatura otoczenia także bez okna szczytu: z niej liczy się faza na odznace (bez wyboru byłoby
          ciche założenie 22 °C); w lodówce bez niej, jak dotąd [M1-audytor-generalny-130] */}
      {pokazTemperature && (
      <View style={styles.predictionBox}>
        <Text style={styles.tempSelectorHeading}>
          {t('Temperatura otoczenia')}: {formatTemperature(ambientTempC, unitSystem)}
        </Text>
        <View style={styles.tempChipsRow}>
          {[
            { temp: 19, label: formatTemperature(19, unitSystem), id: 'temp-19' },
            { temp: 22, label: formatTemperature(22, unitSystem), id: 'temp-22' },
            { temp: 25, label: formatTemperature(25, unitSystem), id: 'temp-25' },
            { temp: 28, label: formatTemperature(28, unitSystem), id: 'temp-28' },
          ].map((item) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: ambientTempC === item.temp }}
              key={item.id}
              testID={`temp-chip-${item.temp}`}
              style={[
                styles.tempChip,
                chipSzer,
                ambientTempC === item.temp && styles.tempChipActive,
              ]}
              onPress={() => onAmbientTempChange(item.temp)}
            >
              <Text
                style={[
                  styles.tempChipText,
                  ambientTempC === item.temp && styles.tempChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      )}
    </Karta>
    </View>
  );
}

const styles = StyleSheet.create({
  phaseBadge: {
    paddingHorizontal: odstepy.s,
    paddingVertical: odstepy.xs,
    borderRadius: promienie.znacznik,
    backgroundColor: theme.colors.tloGrupa, // poziom info (phaseResult.poziom): kolor z komponentu, nie z danych
  },
  phaseBadgeText: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  phaseAdvice: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
  },
  // Grupa w karcie: promień `grupa` 12 (hierarchia promieni, karty/README.md §2) [M3 p2]
  predictionBox: {
    padding: odstepy.m,
    gap: odstepy.xs,
    borderRadius: promienie.grupa,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  predictionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: odstepy.xs,
  },
  predictionLabel: {
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  predictionWindowText: {
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
    fontVariant: ['tabular-nums'],
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: theme.colors.linia,
    borderRadius: 10 / 2,
    overflow: 'hidden',
    marginVertical: odstepy.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: promienie.znacznik,
  },
  progressLabelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressSubtext: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
  },
  predictionStatusText: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz,
  },
  tempSelectorHeading: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  tempChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: odstepy.s,
  },
  // Chip na karcie jak chip pasa: promień `chip`, wybrany `akcent` (karty/README.md §2) [M3 p2]
  tempChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    flexGrow: 1,
    paddingHorizontal: odstepy.s,
    borderRadius: promienie.chip,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
  },
  tempChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  tempChipText: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz,
  },
  tempChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '600',
  },
});
