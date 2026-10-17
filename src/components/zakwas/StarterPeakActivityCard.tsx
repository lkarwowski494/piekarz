// ============================================================================
// Apps4Craft Studio — StarterPeakActivityCard Component
// Sourdough starter peak activity prediction and feeding timer.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatTemperature } from '../../lib/unit-converter';

export interface StarterPeakActivityCardProps {
  phaseResult: any;
  peakPrediction: any;
  ambientTempC: number;
  onAmbientTempChange: (temp: number) => void;
  unitSystem: any;
  onLogFeeding: () => void;
}

export function StarterPeakActivityCard({
  phaseResult,
  peakPrediction,
  ambientTempC,
  onAmbientTempChange,
  unitSystem,
  onLogFeeding,
}: StarterPeakActivityCardProps) {
  return (
    <View style={styles.card} testID="peak-activity-card">
      <View style={styles.peakHeaderRow}>
        <Text style={styles.cardTitle}>🕒 {t('Szczyt aktywności (Peak Timer)')}</Text>
        <View style={[styles.phaseBadge, { backgroundColor: phaseResult.badgeColor + '20' }]}>
          <Text style={[styles.phaseBadgeText, { color: phaseResult.badgeColor }]}>
            ● {phaseResult.labelPl}
          </Text>
        </View>
      </View>

      <Text style={styles.phaseAdvice}>{phaseResult.advicePl}</Text>

      {/* Metabolic Peak Window Prediction */}
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
                backgroundColor: peakPrediction.isCurrentlyInPeak
                  ? theme.colors.statusSuccess
                  : peakPrediction.hasPassedPeak
                  ? theme.colors.statusWarning
                  : theme.colors.accent,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressSubtext}>
            {t('Postęp do szczytu:')} {peakPrediction.progressPercent}%
          </Text>
          <Text style={styles.progressSubtext}>
            {peakPrediction.isCurrentlyInPeak ? `✓ ${t('W szczycie')}` : ''}
          </Text>
        </View>

        <Text style={styles.predictionStatusText}>{peakPrediction.statusMessagePl}</Text>

        {/* Ambient Temperature Selector */}
        <Text style={styles.tempSelectorHeading}>
          {t('Temperatura otoczenia')}: {formatTemperature(ambientTempC, unitSystem)}
        </Text>
        <View style={styles.tempChipsRow}>
          {[
            { temp: 19, label: `❄️ ${formatTemperature(19, unitSystem)}`, id: 'temp-19' },
            { temp: 22, label: `🏠 ${formatTemperature(22, unitSystem)}`, id: 'temp-22' },
            { temp: 25, label: `☀️ ${formatTemperature(25, unitSystem)}`, id: 'temp-25' },
            { temp: 28, label: `♨️ ${formatTemperature(28, unitSystem)}`, id: 'temp-28' },
          ].map((item) => (
            <Pressable
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

      <Pressable style={styles.feedNowBtn} onPress={onLogFeeding}>
        <Text style={styles.feedNowBtnText}>🥣 {t('Zarejestruj dokarmienie')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
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
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  phaseAdvice: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  predictionBox: {
    backgroundColor: theme.colors.surfaceCard,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.textSecondary,
  },
  predictionWindowText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.border,
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
    color: theme.colors.textMuted,
  },
  predictionStatusText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  tempSelectorHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  tempChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tempChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tempChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  tempChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tempChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  feedNowBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  feedNowBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
