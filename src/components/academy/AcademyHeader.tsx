import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { BakerRankInfo } from '../../core/bread-school';

export type AcademyTab = 'school' | 'techniques';

export interface AcademyHeaderProps {
  onClose: () => void;
  rankInfo: BakerRankInfo;
  activeTab: AcademyTab;
  onSelectTab: (tab: AcademyTab) => void;
}

export function AcademyHeader({
  onClose,
  rankInfo,
  activeTab,
  onSelectTab,
}: AcademyHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <Text style={styles.title}>🎓 {t('Akademia Piekarza')}</Text>
        <Pressable
          testID="close-academy-modal-btn"
          style={styles.closeBtn}
          onPress={onClose}
          accessibilityLabel={t('Zamknij Akademię')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Rank Summary Badge */}
      <View style={styles.rankBadgeRow}>
        <Text style={styles.rankText}>
          🏅 {rankInfo.currentRankPl} ({rankInfo.completedCount}/{rankInfo.totalLessons} {t('lekcji')})
        </Text>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${rankInfo.progressPercent}%` }]}
          />
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabNavRow}>
        <Pressable
          testID="academy-tab-school"
          style={[styles.navTab, activeTab === 'school' && styles.navTabActive]}
          onPress={() => onSelectTab('school')}
        >
          <Text style={[styles.navTabText, activeTab === 'school' && styles.navTabTextActive]}>
            🥖 {t('Szkoła Chleba')}
          </Text>
        </Pressable>
        <Pressable
          testID="academy-tab-techniques"
          style={[styles.navTab, activeTab === 'techniques' && styles.navTabActive]}
          onPress={() => onSelectTab('techniques')}
        >
          <Text style={[styles.navTabText, activeTab === 'techniques' && styles.navTabTextActive]}>
            📖 {t('Techniki')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  rankBadgeRow: {
    backgroundColor: theme.colors.surfaceCard,
    padding: 8,
    borderRadius: theme.radius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
    marginBottom: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  navTabActive: {
    backgroundColor: theme.colors.surface,
  },
  navTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  navTabTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
});
