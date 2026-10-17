// ============================================================================
// Apps4Craft Studio — BakeHistorySection Component
// History log list, sensory radar visualization, and "bake again" shortcuts.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
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
          const dateStr = new Date(log.startedAt).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          return (
            <View key={log.id} style={styles.historyCard} testID={`bake-log-card-${log.id}`}>
              <View style={styles.historyCardHeader}>
                <Text style={styles.historyRecipeName}>{log.recipeName}</Text>
                <View style={styles.historyActionsRow}>
                  <Text style={styles.historyStars}>
                    {'⭐'.repeat(log.ratingStars ?? 5)}
                  </Text>
                  <Pressable
                    testID={`delete-bake-log-${log.id}`}
                    onPress={() => onDeleteBakeLog(log.id)}
                    style={styles.deleteHistoryBtn}
                    accessibilityLabel={t('Usuń wpis')}
                  >
                    <Text style={styles.deleteHistoryBtnText}>🗑️</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.historyDate}>{dateStr}</Text>

              {/* Crumb, crust & taste pills */}
              <View style={styles.historyPillsRow}>
                {log.crumbScore !== undefined && (
                  <View style={styles.historyPill}>
                    <Text style={styles.historyPillText}>
                      🍞 {t('Miękisz:')} {log.crumbScore}/5
                    </Text>
                  </View>
                )}
                {log.crustScore !== undefined && (
                  <View style={styles.historyPill}>
                    <Text style={styles.historyPillText}>
                      🔥 {t('Skórka:')} {log.crustScore}/5
                    </Text>
                  </View>
                )}
                {log.tasteProfile && (
                  <View style={styles.historyPill}>
                    <Text style={styles.historyPillText}>
                      👅 {log.tasteProfile === 'sour' ? t('Kwaśny') : log.tasteProfile === 'mild' ? t('Łagodny') : log.tasteProfile === 'tangy' ? t('Bardzo kwaśny') : t('Zbalansowany')}
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
                <Text style={styles.bakeAgainBtnText}>🔁 {t('Piecz ponownie')}</Text>
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
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tasteFilterChipActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  tasteFilterText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  tasteFilterTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  emptyHistoryBox: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyRecipeName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
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
    padding: 4,
  },
  deleteHistoryBtnText: {
    fontSize: 14,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
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
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  historyPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  historyRadarBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    marginVertical: 8,
  },
  historyNotes: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginVertical: 6,
  },
  bakeAgainBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bakeAgainBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
});
