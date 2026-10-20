// ============================================================================
// Apps4Craft Studio — StarterPeakActivityCard Component
// Sourdough starter peak activity prediction and feeding timer.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatTemperature, UnitSystem } from '../../lib/unit-converter';
import type { SourdoughPhaseResult } from '../../core/sourdough-physics';
import type { PeakPredictionResult } from '../../core/starter-peak-predictor';

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
  >;
  /** W lodówce okna szczytu nie liczymy (model temperatury 20–26 °C, FER-Q10-902) [M1-audytor-generalny-044]. */
  showPeakWindow?: boolean;
  ambientTempC: number;
  onAmbientTempChange: (temp: number) => void;
  unitSystem: UnitSystem;
}

export function StarterPeakActivityCard({
  phaseResult,
  peakPrediction,
  showPeakWindow = true,
  ambientTempC,
  onAmbientTempChange,
  unitSystem,
}: StarterPeakActivityCardProps) {
  return (
    <View style={styles.card} testID="peak-activity-card">
      <View style={styles.peakHeaderRow}>
        <Text style={styles.cardTitle}>{t('Szczyt aktywności')}</Text>
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseBadgeText}>
            ● {t(phaseResult.labelPl)}
          </Text>
        </View>
      </View>

      <Text style={styles.phaseAdvice}>{t(phaseResult.advicePl)}</Text>

      {/* Metabolic Peak Window Prediction */}
      {showPeakWindow && (
      <View style={styles.predictionBox} testID="peak-prediction-box">
        <View style={styles.predictionRow}>
          <Text style={styles.predictionLabel}>{t('Szacowane okno szczytu:')}</Text>
          <Text style={styles.predictionWindowText}>{peakPrediction.formattedWindowPl}</Text>
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
          {t(peakPrediction.statusTemplatePl, peakPrediction.statusParams)}
        </Text>

        {/* Ambient Temperature Selector */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  peakHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  phaseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.tloGrupa, // poziom info (phaseResult.poziom): kolor z komponentu, nie z danych
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  phaseAdvice: {
    fontSize: 13,
    color: theme.colors.tusz2,
    lineHeight: 18,
    marginBottom: 12,
  },
  predictionBox: {
    backgroundColor: theme.colors.powierzchnia,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: 12,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  predictionWindowText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.linia,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 6,
  },
  progressSubtext: {
    fontSize: 11,
    color: theme.colors.tusz3,
  },
  predictionStatusText: {
    fontSize: 12,
    color: theme.colors.tusz,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  tempSelectorHeading: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
    marginBottom: 6,
  },
  tempChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tempChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  tempChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  tempChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  tempChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
});
