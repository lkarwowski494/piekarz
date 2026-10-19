import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../../ui/theme';
import { t } from '../../../lib/i18n';
import {
  BAKE_LOSS_PRESETS,
  BakeTypePresetId,
  BakeLossMetricsResult,
} from '../../../core/domain-rules';
import { useUnitSystem, formatWeight } from '../../../lib/unit-converter';

export interface AccordionBakeLossSectionProps {
  bakeLossPercent: number;
  onBakeLossPercentChange?: (pct: number) => void;
  bakedTotalWeightGrams: number;
  bakeLossMetrics?: BakeLossMetricsResult;
  selectedBakeLossPresetId?: BakeTypePresetId;
  onSelectBakeLossPreset?: (id: BakeTypePresetId) => void;
}

export function AccordionBakeLossSection({
  bakeLossPercent,
  onBakeLossPercentChange,
  bakedTotalWeightGrams,
  bakeLossMetrics,
  selectedBakeLossPresetId,
  onSelectBakeLossPreset,
}: AccordionBakeLossSectionProps) {
  const unitSystem = useUnitSystem();

  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionHeaderTitle}>🔥 {t('Strata wypiekowa i wilgotność miękiszu')}</Text>
      <Text style={styles.sectionDesc}>
        {t('Strata Piecowa')} • {t('Szacowany ubytek masy')} ({bakeLossPercent}%): ≈ {formatWeight(bakedTotalWeightGrams, unitSystem)} {t('upieczonego')}
      </Text>

      {/* Presets */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blendScroll}>
        {BAKE_LOSS_PRESETS.map((p) => {
          const isSelected = selectedBakeLossPresetId === p.id;
          return (
            <Pressable
              key={p.id}
              testID={`bake-loss-preset-${p.id}`}
              onPress={() => onSelectBakeLossPreset?.(p.id)}
              style={[styles.presetChip, isSelected && styles.presetChipActive]}
            >
              <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                {t(p.namePl)} ({p.defaultLossPercent}%)
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.bakeLossStepperRow}>
        <Text style={styles.bakeLossLabel}>{t('Strata piecowa')}:</Text>
        <View style={styles.stepperInline}>
          <Pressable
            testID="bake-loss-minus"
            style={styles.miniBtn}
            onPress={() => onBakeLossPercentChange?.(Math.max(5, Number((bakeLossPercent - 0.5).toFixed(1))))}
          >
            <Text style={styles.miniBtnText}>−</Text>
          </Pressable>
          <Text style={styles.paramValue}>{bakeLossPercent.toFixed(1)}%</Text>
          <Pressable
            testID="bake-loss-plus"
            style={styles.miniBtn}
            onPress={() => onBakeLossPercentChange?.(Math.min(30, Number((bakeLossPercent + 0.5).toFixed(1))))}
          >
            <Text style={styles.miniBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      {bakeLossMetrics && (
        <View style={styles.bakeLossGrid}>
          <View style={styles.bakeLossMetricCol}>
            <Text style={styles.bakeLossMetricLabel}>{t('Upieczony bochenek')}</Text>
            <Text style={styles.bakeLossMetricValue} testID="bake-loss-baked-grams">
              {formatWeight(bakeLossMetrics.bakedWeightGrams, unitSystem)}
            </Text>
          </View>
          <View style={styles.bakeLossMetricCol}>
            <Text style={styles.bakeLossMetricLabel}>{t('Odparowana woda')}</Text>
            <Text style={styles.bakeLossMetricValue} testID="bake-loss-evaporated-grams">
              -{formatWeight(bakeLossMetrics.evaporatedWaterGrams, unitSystem)}
            </Text>
          </View>
          <View style={styles.bakeLossMetricCol}>
            <Text style={styles.bakeLossMetricLabel}>{t('Szacowana wilgotność miękiszu')}</Text>
            <Text style={[styles.bakeLossMetricValue, { color: theme.colors.accentDark }]} testID="bake-loss-moisture-value">
              {bakeLossMetrics.retainedMoisturePercent}%
            </Text>
          </View>
        </View>
      )}

      {bakeLossMetrics && (
        <View style={styles.crumbMoistureBox}>
          <Text style={styles.crumbMoistureTitle} testID="bake-loss-category-label">
            🥖 {t(bakeLossMetrics.categoryLabelPl)}
          </Text>
          <Text style={styles.crumbMoistureAdvice}>{t(bakeLossMetrics.coolingAdvicePl)}</Text>
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
  blendScroll: {
    marginVertical: 6,
  },
  presetChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  presetChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  presetChipText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  bakeLossStepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  bakeLossLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
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
  bakeLossGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 6,
  },
  bakeLossMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  bakeLossMetricLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 2,
  },
  bakeLossMetricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  crumbMoistureBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 2,
  },
  crumbMoistureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  crumbMoistureAdvice: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});
