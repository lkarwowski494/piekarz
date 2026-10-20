// ============================================================================
// Apps4Craft Studio — BakeStepsList Component
// Steps progression timeline and active dough batch ingredients card.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { formatWeight, formatDoseWeight } from '../../lib/unit-converter';
import { t } from '../../lib/i18n';
import { formatFixed } from '../../lib/format';

import type { SessionStep } from '../../core/bake-steps';

export interface BakeStepsListProps {
  steps: readonly SessionStep[];
  currentStepIdx: number;
  onGoToStep: (idx: number) => void;
  calculatedRecipe?: any;
  unitSystem: any;
}

export function BakeStepsList({
  steps,
  currentStepIdx,
  onGoToStep,
  calculatedRecipe,
  unitSystem,
}: BakeStepsListProps) {
  return (
    <View>
      {/* Active Recipe Ingredients Card */}
      {calculatedRecipe && (
        <View style={styles.ingredientsCard}>
          <Text style={styles.ingredientsTitle}>⚖️ {t('Składniki do odważenia')}</Text>
          <View style={styles.ingredientsGrid}>
            <View style={styles.ingredientPill}>
              <Text style={styles.ingredientLabel}>{t('Mąki')}</Text>
              <Text style={styles.ingredientValue}>
                {formatWeight(calculatedRecipe.baseFlourWeightGrams, unitSystem)}
              </Text>
            </View>
            <View style={styles.ingredientPill}>
              <Text style={styles.ingredientLabel}>{t('Woda')}</Text>
              <Text style={styles.ingredientValue}>
                {formatWeight(calculatedRecipe.waterGrams, unitSystem)}
              </Text>
            </View>
            <View style={styles.ingredientPill}>
              <Text style={styles.ingredientLabel}>{t('Zakwas|składnik')}</Text>
              <Text style={styles.ingredientValue}>
                {formatWeight(calculatedRecipe.starterGrams, unitSystem)}
              </Text>
            </View>
            <View style={styles.ingredientPill}>
              <Text style={styles.ingredientLabel}>{t('Sól')}</Text>
              <Text style={styles.ingredientValue}>
                {formatDoseWeight(calculatedRecipe.saltGrams, unitSystem)}
              </Text>
            </View>
          </View>
          <Text style={styles.ingredientsCaption}>
            {t('Masa ciasta: {masa} · Hydratacja całkowita: {hydratacja}% (True Baker’s %)', {
              masa: formatWeight(calculatedRecipe.targetDoughWeightGrams, unitSystem),
              hydratacja: formatFixed(calculatedRecipe.overallHydrationPercent, 1),
            })}
          </Text>
        </View>
      )}

      {/* Steps Overview (Clickable) */}
      <Text style={styles.sectionHeading}>{t('Wszystkie etapy wypieku')}</Text>
      {steps.map((step, idx) => {
        const isPast = idx < currentStepIdx;
        const isCurrent = idx === currentStepIdx;
        return (
          <Pressable
            key={step.id}
            onPress={() => onGoToStep(idx)}
            style={[
              styles.stepRow,
              isCurrent && styles.stepRowCurrent,
              isPast && styles.stepRowPast,
            ]}
          >
            <Text style={[styles.stepNumber, isCurrent && styles.stepNumberCurrent]}>
              {isPast ? '✓' : `${idx + 1}`}
            </Text>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepName, isCurrent && styles.stepNameCurrent]}>
                {t(step.name)}
              </Text>
              {step.durationMin !== null && <Text style={styles.stepTime}>{t('{n} min', { n: step.durationMin })}</Text>}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ingredientsCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.accentLight,
  },
  ingredientsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.accentDark,
    marginBottom: 8,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 8,
  },
  ingredientPill: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ingredientLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  ingredientValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  ingredientsCaption: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepRowCurrent: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  stepRowPast: {
    opacity: 0.6,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundSecondary,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginRight: 10,
  },
  stepNumberCurrent: {
    backgroundColor: theme.colors.accent,
    color: '#FFFFFF',
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  stepNameCurrent: {
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  stepTime: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
