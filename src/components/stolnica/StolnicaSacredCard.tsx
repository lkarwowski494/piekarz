// ============================================================================
// Apps4Craft Studio — StolnicaSacredCard Component
// Sacred numbers glanceable countertop card for live bake session.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CraftCard, CraftStatDisplay, sharedCraftTokens } from '@apps4craft/ui';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatFixed } from '../../lib/format';
import { ActiveBakeState } from '../../data/sqlite-store';

export interface StolnicaSacredCardProps {
  currentStepIdx: number;
  totalSteps: number;
  formattedTime: string;
  activeBakeData: ActiveBakeState | null;
}

export function StolnicaSacredCard({
  currentStepIdx,
  totalSteps,
  formattedTime,
  activeBakeData,
}: StolnicaSacredCardProps) {
  return (
    <CraftCard
      testID="stolnica-sacred-card"
      style={styles.sacredNumbersCard}
      accentBorder={theme.colors.borderActive}
    >
      <View style={styles.sacredGrid}>
        <CraftStatDisplay
          testID="stat-stolnica-step"
          label={t('Etap')}
          value={`${currentStepIdx + 1}/${totalSteps}`}
          accentColor={theme.colors.accent}
          size="md"
        />
        <CraftStatDisplay
          testID="stat-stolnica-time"
          label={t('Pozostało')}
          value={formattedTime}
          size="md"
        />
        <CraftStatDisplay
          testID="stat-stolnica-ddt"
          label={t('DDT')}
          value={activeBakeData?.actualDdtC ?? '—'}
          unit={activeBakeData?.actualDdtC === undefined ? undefined : '°C'}
          size="md"
        />
        {activeBakeData?.calculatedRecipe ? (
          <CraftStatDisplay
            testID="stat-stolnica-hydration"
            label={t('Hydratacja')}
            value={formatFixed(activeBakeData.calculatedRecipe.overallHydrationPercent, 1)}
            unit="%"
            size="md"
          />
        ) : (
          <CraftStatDisplay
            testID="stat-stolnica-temp"
            label={t('Otoczenie')}
            value={activeBakeData?.ambientTempC ?? '—'}
            unit={activeBakeData?.ambientTempC === undefined ? undefined : '°C'}
            size="md"
          />
        )}
      </View>
    </CraftCard>
  );
}

const styles = StyleSheet.create({
  sacredNumbersCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: sharedCraftTokens.colors.bgCard,
  },
  sacredGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
