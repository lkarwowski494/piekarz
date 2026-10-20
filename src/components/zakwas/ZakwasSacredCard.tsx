// ============================================================================
// Apps4Craft Studio — ZakwasSacredCard Component
// Sacred numbers glanceable countertop display for sourdough starter metrics.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CraftCard, CraftStatDisplay } from '@apps4craft/ui';
import { theme } from '../../ui/theme';
import { useMotyw } from '../../ui/motyw';
import { t } from '../../lib/i18n';
import { useUnitSystem, celsiusToFahrenheit } from '../../lib/unit-converter';

export interface ZakwasSacredCardProps {
  ageDays: number;
  hydration: number;
  selectedRatio: [number, number, number];
  ambientTempC: number;
}

export function ZakwasSacredCard({
  ageDays,
  hydration,
  selectedRatio,
  ambientTempC,
}: ZakwasSacredCardProps) {
  const motyw = useMotyw();
  // Temperatura w jednostce z ustawienia (design-spec §7, D-044) [M1-audytor-generalny-096]
  const imperialne = useUnitSystem() === 'imperial';
  return (
    <CraftCard
      testID="zakwas-sacred-card"
      style={styles.sacredNumbersCard}
      accentBorder={motyw.kolory.akcent}
    >
      <View style={styles.sacredGrid}>
        <CraftStatDisplay
          testID="stat-zakwas-age"
          label={t('Wiek')}
          value={ageDays}
          unit="d"
          size="md"
        />
        <CraftStatDisplay
          testID="stat-zakwas-hydration"
          label={t('Hydratacja')}
          value={hydration}
          unit="%"
          size="md"
        />
        <CraftStatDisplay
          testID="stat-zakwas-ratio"
          label={t('Proporcja')}
          value={`${selectedRatio[0]}:${selectedRatio[1]}:${selectedRatio[2]}`}
          size="md"
        />
        <CraftStatDisplay
          testID="stat-zakwas-temp"
          label={t('Temp')}
          value={imperialne ? celsiusToFahrenheit(ambientTempC) : ambientTempC}
          unit={imperialne ? '°F' : '°C'}
          size="md"
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
