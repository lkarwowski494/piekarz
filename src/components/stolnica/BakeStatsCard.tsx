// ============================================================================
// Apps4Craft Studio — BakeStatsCard Component
// Artisan statistics card for total bakes, crumb, and crust metrics.
// 100% Offline-First.
// M3 p5: karta systemu kart z ikoną (karty/README.md §2: wartości 17 pt 600, cyfry tabelaryczne); przy dużym tekście
// cztery pozycje jedna pod drugą (flexBasis od fontScale, §7a / D-142).
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { BakeStatisticsResult } from '../../core/bake-statistics';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';

export interface BakeStatsCardProps {
  stats: BakeStatisticsResult;
}

export function BakeStatsCard({ stats }: BakeStatsCardProps) {
  const duzy = useDuzyTekst();
  const pozycje: [string, string][] = [
    [t('Łącznie wypieków'), String(stats.totalBakes)],
    [t('Średnia ocena'), String(stats.averageRating)],
    [t('Śr. miękisz'), `${stats.averageCrumbScore}/5`],
    [t('Śr. skórka'), `${stats.averageCrustScore}/5`],
  ];
  return (
    <Karta testID="bake-stats-card" tytul={t('Statystyki piekarni domowej')} ikona={<IkonaKarty nazwa="proporcje" />}>
      <View style={styles.statsGrid}>
        {pozycje.map(([etykieta, wartosc]) => (
          <View key={etykieta} style={[styles.statsItem, { flexBasis: duzy ? '100%' : 0 }]}>
            <Text style={styles.statsLabel}>{etykieta}</Text>
            <Text style={styles.statsValue}>{wartosc}</Text>
          </View>
        ))}
      </View>
    </Karta>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: odstepy.m,
  },
  statsItem: {
    alignItems: 'center',
    flexGrow: 1,
    minWidth: 0,
  },
  statsLabel: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    marginBottom: 4,
    textAlign: 'center',
  },
  statsValue: {
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    color: theme.colors.tusz,
  },
});
