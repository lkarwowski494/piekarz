// ============================================================================
// Apps4Craft Studio — BakeStatsCard Component
// Artisan statistics card for total bakes, crumb, and crust metrics.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { BakeStatisticsResult } from '../../core/bake-statistics';

export interface BakeStatsCardProps {
  stats: BakeStatisticsResult;
}

export function BakeStatsCard({ stats }: BakeStatsCardProps) {
  return (
    <View style={styles.statsCard} testID="bake-stats-card">
      <Text style={styles.statsCardTitle}>{t('Statystyki piekarni domowej')}</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>{t('Łącznie wypieków')}</Text>
          <Text style={styles.statsValue}>{stats.totalBakes}</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>{t('Średnia ocena')}</Text>
          <Text style={styles.statsValue}>{stats.averageRating}</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>{t('Śr. miękisz')}</Text>
          <Text style={styles.statsValue}>{stats.averageCrumbScore}/5</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>{t('Śr. skórka')}</Text>
          <Text style={styles.statsValue}>{stats.averageCrustScore}/5</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  statsCardTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsLabel: {
    fontSize: 11,
    color: theme.colors.tusz3,
    marginBottom: 4,
    textAlign: 'center',
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.tusz,
  },
});
