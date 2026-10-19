import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../../ui/theme';
import { t } from '../../../lib/i18n';
import { formatFixed } from '../../../lib/format';
import { HydrationDifficultyInfo } from '../../../core/domain-rules';
import { BlendAbsorptionAnalysis } from '../../../core/flour-atlas';
import { useUnitSystem, formatWeight, formatTemperature } from '../../../lib/unit-converter';

export interface AccordionDdtSectionProps {
  targetDdt: number;
  onTargetDdtChange: (val: number) => void;
  waterTempTarget: number;
  /** Ostrzeżenie reguły RD-05 (status too_hot_danger); brak = woda w zakresie [M1-audytor-generalny-039]. */
  waterTempWarning?: string;
  iceGrams?: number;
  waterPct: number;
  onWaterPctChange: (pct: number) => void;
  hydrationDifficulty?: HydrationDifficultyInfo;
  blendAbsorption?: BlendAbsorptionAnalysis;
}

export function AccordionDdtSection({
  targetDdt,
  onTargetDdtChange,
  waterTempTarget,
  waterTempWarning,
  iceGrams,
  waterPct,
  onWaterPctChange,
  hydrationDifficulty,
  blendAbsorption,
}: AccordionDdtSectionProps) {
  const unitSystem = useUnitSystem();

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionHeaderTitle}>
        🌡️ {t('Kalkulator 4-DDT i Temperatura Wody')}
      </Text>
      <Text style={styles.sectionDesc}>
        {t(
          'Właściwa temperatura wody zapewnia docelową temperaturę ciasta po wymieszaniu.'
        )}
      </Text>

      <View style={styles.ddtResultCard}>
        <View style={styles.ddtResultRow}>
          <Text style={styles.ddtResultLabel}>{t('Docelowa temp. wody:')}</Text>
          <Text style={styles.ddtResultValue}>
            {waterTempTarget > 0 ? formatTemperature(waterTempTarget, unitSystem) : t('0°C (Lód)')}
          </Text>
        </View>

        {waterTempWarning !== undefined && (
          <View style={styles.hotAlertRow} testID="ddt-too-hot-warning" accessibilityRole="alert">
            <Text style={styles.hotAlertText}>⚠️ {t(waterTempWarning)}</Text>
          </View>
        )}

        {iceGrams !== undefined && iceGrams > 0 && (
          <View style={styles.iceAlertRow}>
            <Text style={styles.iceIcon}>🧊</Text>
            <Text style={styles.iceText}>
              {t('Zastąp część wody lodem:')} {formatWeight(iceGrams, unitSystem)} {t('lodu')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.gridParams}>
        <View style={styles.paramBox}>
          <Text style={styles.paramLabel}>{t('Docelowe DDT')}</Text>
          <View style={styles.stepperInline}>
            <Pressable
              testID="ddt-minus-btn"
              style={styles.miniBtn}
              onPress={() => onTargetDdtChange(Math.max(18, targetDdt - 0.5))}
            >
              <Text style={styles.miniBtnText}>−</Text>
            </Pressable>
            <Text style={styles.paramValue}>{formatTemperature(targetDdt, unitSystem)}</Text>
            <Pressable
              testID="ddt-plus-btn"
              style={styles.miniBtn}
              onPress={() => onTargetDdtChange(Math.min(32, targetDdt + 0.5))}
            >
              <Text style={styles.miniBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.paramBox}>
          <Text style={styles.paramLabel}>{t('Hydratacja bazy')}</Text>
          <View style={styles.stepperInline}>
            <Pressable
              testID="water-pct-minus-btn"
              style={styles.miniBtn}
              onPress={() => onWaterPctChange(Math.max(50, Number((waterPct - 1).toFixed(1))))}
            >
              <Text style={styles.miniBtnText}>−</Text>
            </Pressable>
            <Text style={styles.paramValue}>{formatFixed(waterPct, 1)}%</Text>
            <Pressable
              testID="water-pct-plus-btn"
              style={styles.miniBtn}
              onPress={() => onWaterPctChange(Math.min(100, Number((waterPct + 1).toFixed(1))))}
            >
              <Text style={styles.miniBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Steppery -5%, -1%, +1%, +5% */}
      <View style={styles.stepperRow}>
        <Pressable
          style={styles.paramStepBtn}
          onPress={() => onWaterPctChange(Math.max(50, Number((waterPct - 5).toFixed(1))))}
        >
          <Text style={styles.paramStepText}>-5%</Text>
        </Pressable>
        <Pressable
          style={styles.paramStepBtn}
          onPress={() => onWaterPctChange(Math.max(50, Number((waterPct - 1).toFixed(1))))}
        >
          <Text style={styles.paramStepText}>-1%</Text>
        </Pressable>
        <Pressable
          style={styles.paramStepBtn}
          onPress={() => onWaterPctChange(Math.min(100, Number((waterPct + 1).toFixed(1))))}
        >
          <Text style={styles.paramStepText}>+1%</Text>
        </Pressable>
        <Pressable
          style={styles.paramStepBtn}
          onPress={() => onWaterPctChange(Math.min(100, Number((waterPct + 5).toFixed(1))))}
        >
          <Text style={styles.paramStepText}>+5%</Text>
        </Pressable>
      </View>

      {/* Badge trudności hydratacji */}
      {hydrationDifficulty && (
        <View style={styles.diffBadgeRow}>
          <View style={[styles.diffBadge, { backgroundColor: hydrationDifficulty.badgeColor + '20' }]}>
            <Text style={[styles.diffBadgeText, { color: hydrationDifficulty.badgeColor }]}>
              ● {t(hydrationDifficulty.labelPl)}
            </Text>
          </View>
          <Text style={styles.diffTipText}>{t(hydrationDifficulty.tipPl)}</Text>
        </View>
      )}

      {/* Chłonność mąk */}
      {blendAbsorption && (
        <View style={styles.absorptionBadge} testID="flour-absorption-badge">
          <Text style={styles.absorptionLabel}>
            🌾 {t('Chłonność mąk:')} {blendAbsorption.weightedAbsorptionPercent}% ({t('zalecana')}: {blendAbsorption.recommendedHydrationRange[0]}–{blendAbsorption.recommendedHydrationRange[1]}%) • {t('Białko')}: ~{blendAbsorption.estimatedProteinPercent}%
          </Text>
          <Text style={styles.absorptionAdviceText}>
            💡 {t(blendAbsorption.doughFeelAdvicePl)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },
  ddtResultCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  ddtResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ddtResultLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  ddtResultValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  iceAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  hotAlertRow: {
    marginTop: 6,
    padding: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.statusDanger,
  },
  hotAlertText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  iceIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  iceText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  gridParams: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  paramBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paramLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  stepperInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniBtn: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  miniBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  paramValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  paramStepBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  paramStepText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  diffBadgeRow: {
    marginTop: 10,
    gap: 4,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  diffTipText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  absorptionBadge: {
    marginTop: 10,
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  absorptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  absorptionAdviceText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});
