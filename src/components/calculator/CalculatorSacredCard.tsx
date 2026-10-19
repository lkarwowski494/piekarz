// ============================================================================
// Apps4Craft Studio — CalculatorSacredCard Component
// Glanceable sacred numbers countertop display for bread parameters.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CraftCard, CraftStatDisplay } from '@apps4craft/ui';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatFixed } from '../../lib/format';

export interface CalculatorSacredCardProps {
  overallHydrationPercent: number;
  targetDoughWeightGrams: number;
  totalFlourGrams: number;
  targetDdt: number;
}

export function CalculatorSacredCard({
  overallHydrationPercent,
  targetDoughWeightGrams,
  totalFlourGrams,
  targetDdt,
}: CalculatorSacredCardProps) {
  return (
    <CraftCard
      testID="sacred-numbers-panel"
      style={styles.sacredNumbersCard}
      accentBorder={theme.colors.borderActive}
    >
      <View style={styles.sacredGrid}>
        <CraftStatDisplay
          testID="stat-hydration"
          label={t('Hydratacja')}
          value={formatFixed(overallHydrationPercent, 1)}
          unit="%"
          accentColor={theme.colors.accent}
          size="md"
        />
        <CraftStatDisplay
          testID="stat-dough-weight"
          label={t('Masa')}
          value={targetDoughWeightGrams}
          unit="g"
          size="md"
        />
        <CraftStatDisplay
          testID="stat-total-flour"
          label={t('Mąka')}
          value={totalFlourGrams}
          unit="g"
          size="md"
        />
        <CraftStatDisplay
          testID="stat-target-ddt"
          label={t('DDT')}
          value={targetDdt}
          unit="°C"
          size="md"
          accentColor={theme.colors.accentLight}
        />
      </View>
    </CraftCard>
  );
}

const styles = StyleSheet.create({
  sacredNumbersCard: {
    marginVertical: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  sacredGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
