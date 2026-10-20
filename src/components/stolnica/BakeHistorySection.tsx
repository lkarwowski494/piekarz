// ============================================================================
// Apps4Craft Studio — BakeHistorySection Component
// History log list, sensory radar visualization, and "bake again" shortcuts.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { appLocale, formatDate } from '../../lib/format';
import { StoredBakeLog } from '../../data/db';
import { SensoryRadarChart } from '../SensoryRadarChart';

export interface BakeHistorySectionProps {
  bakeHistory: StoredBakeLog[];
  selectedTasteFilter: 'all' | 'mild' | 'balanced' | 'sour' | 'tangy';
  onSelectTasteFilter: (filter: 'all' | 'mild' | 'balanced' | 'sour' | 'tangy') => void;
  filteredHistory: StoredBakeLog[];
  onDeleteBakeLog: (id: string) => void;
  onBakeAgain: (log: StoredBakeLog) => void;
}

export function BakeHistorySection({
  bakeHistory,
  selectedTasteFilter,
  onSelectTasteFilter,
  filteredHistory,
  onDeleteBakeLog,
  onBakeAgain,
}: BakeHistorySectionProps) {
  return (
    <View style={styles.historyContainer}>
      <Text style={styles.sectionHeading}>{t('Historia wypieków')}</Text>

      {/* Taste Filter Chips */}
      {bakeHistory.length > 0 && (
        <View style={styles.filterScrollContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tasteFilterRow}>
            {[
              { id: 'all' as const, label: t('Wszystkie') },
              { id: 'mild' as const, label: t('Łagodny') },
              { id: 'balanced' as const, label: t('Zbalansowany') },
              { id: 'sour' as const, label: t('Kwaśny') },
              { id: 'tangy' as const, label: t('Bardzo kwaśny') },
            ].map((p) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedTasteFilter === p.id }}
                key={p.id}
                testID={`filter-taste-${p.id}`}
                style={[
                  styles.tasteFilterChip,
                  selectedTasteFilter === p.id && styles.tasteFilterChipActive,
                ]}
                onPress={() => onSelectTasteFilter(p.id)}
              >
                <Text
                  style={[
                    styles.tasteFilterText,
                    selectedTasteFilter === p.id && styles.tasteFilterTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {bakeHistory.length === 0 ? (
        <View style={styles.emptyHistoryBox}>
          <Text style={styles.emptyHistoryText}>{t('Brak wcześniejszych wypieków')}</Text>
        </View>
      ) : (
        filteredHistory.slice(0, 15).map((log) => {
          const dateStr = formatDate(log.startedAt, appLocale(), {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          return (
            <View key={log.id} style={styles.historyCard} testID={`bake-log-card-${log.id}`}>
              <View style={styles.historyCardHeader}>
                <Text style={styles.historyRecipeName}>{log.recipeName}</Text>
                <View style={styles.historyActionsRow}>
                  {log.ratingStars !== undefined && (
                    <Text style={styles.historyStars}>{t('Ocena: {n}/5', { n: log.ratingStars })}</Text>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    testID={`delete-bake-log-${log.id}`}
                    onPress={() => onDeleteBakeLog(log.id)}
                    style={styles.deleteHistoryBtn}
                    accessibilityLabel={t('Usuń wpis')}
                  >
                    <Text style={styles.deleteHistoryBtnText}>{t('Usuń wpis')}</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.historyDate}>{dateStr}</Text>

              {/* Crumb, crust & taste pills */}
              <View style={styles.historyPillsRow}>
                {log.crumbScore !== undefined && (
                  <View style={styles.historyPill}>
                    <Text style={styles.historyPillText}>
                      {t('Miękisz:')} {log.crumbScore}/5
                    </Text>
                  </View>
                )}
                {log.crustScore !== undefined && (
                  <View style={styles.historyPill}>
                    <Text style={styles.historyPillText}>
                      {t('Skórka:')} {log.crustScore}/5
                    </Text>
                  </View>
                )}
                {log.tasteProfile && (
                  <View style={styles.historyPill}>
                    <Text style={styles.historyPillText}>
                      {log.tasteProfile === 'sour' ? t('Kwaśny') : log.tasteProfile === 'mild' ? t('Łagodny') : log.tasteProfile === 'tangy' ? t('Bardzo kwaśny') : t('Zbalansowany')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Sensory Radar Chart (Zadanie P4) */}
              <View style={styles.historyRadarBox}>
                <SensoryRadarChart
                  profile={
                    log.sensoryProfile ?? {
                      crustCrispness: log.crustScore ?? 3,
                      crumbElasticity: 4,
                      acidity: log.tasteProfile === 'sour' ? 4 : log.tasteProfile === 'tangy' ? 5 : log.tasteProfile === 'mild' ? 2 : 3,
                      openCrumb: log.crumbScore ?? 3,
                      caramelization: log.ratingStars ?? 4,
                    }
                  }
                  size={170}
                  showLabels={true}
                  testID={`history-radar-${log.id}`}
                />
              </View>

              {log.notes && <Text style={styles.historyNotes}>{log.notes}</Text>}

              {/* Bake Again Button (Zadanie P3) */}
              <Pressable
                testID={`bake-again-btn-${log.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${t('Piecz ponownie')}: ${log.recipeName}`}
                style={styles.bakeAgainBtn}
                onPress={() => onBakeAgain(log)}
              >
                <Text style={styles.bakeAgainBtnText}>{t('Piecz ponownie')}</Text>
              </Pressable>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyContainer: {
    marginTop: 10,
  },
  sectionHeading: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 10,
    marginTop: 6,
  },
  filterScrollContainer: {
    marginBottom: 12,
  },
  tasteFilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tasteFilterChip: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  tasteFilterChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  tasteFilterText: {
    fontSize: 12,
    color: theme.colors.tusz2,
    fontWeight: '600',
  },
  tasteFilterTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  emptyHistoryBox: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: theme.colors.tusz3,
  },
  historyCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyRecipeName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.tusz,
    flex: 1,
  },
  historyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyStars: {
    fontSize: 13,
  },
  deleteHistoryBtn: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    padding: 4,
  },
  deleteHistoryBtnText: {
    fontSize: 14,
    color: theme.colors.blad,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.tusz3,
    marginTop: 2,
    marginBottom: 8,
  },
  historyPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  historyPill: {
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  historyPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  historyRadarBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    marginVertical: 8,
  },
  historyNotes: {
    fontSize: 13,
    color: theme.colors.tusz2,
    fontStyle: 'italic',
    lineHeight: 18,
    marginVertical: 6,
  },
  bakeAgainBtn: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  bakeAgainBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
});
