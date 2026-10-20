// ============================================================================
// Apps4Craft Studio — ScheduleSummaryCard Component
// Overview card for start of feeding, total baking journey, and transfer CTA.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { ScheduledStage } from '../../scheduler/reverse-scheduler';

export interface ScheduleSummaryCardProps {
  firstStage: ScheduledStage;
  targetDate: Date;
  journeyDurationHours: number;
  formatTime: (d: Date) => string;
  formatDayBadge: (d: Date) => string;
  onStartBakeOnWorkbench: () => void;
  onCopySchedule: () => void;
  /** Powód, dla którego „Zacznij wypiek” jest nieaktywny (stan „za późno”); brak = aktywny. */
  powodBlokady?: string | null;
}

export function ScheduleSummaryCard({
  firstStage,
  targetDate,
  journeyDurationHours,
  formatTime,
  formatDayBadge,
  onStartBakeOnWorkbench,
  onCopySchedule,
  powodBlokady = null,
}: ScheduleSummaryCardProps) {
  if (!firstStage) return null;
  const zablokowany = !!powodBlokady;

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t('Rozpoczęcie dokarmiania')}</Text>
          <Text style={styles.summaryTime}>{formatTime(firstStage.startTime)}</Text>
          <Text style={styles.summaryDate}>{formatDayBadge(firstStage.startTime)}</Text>
        </View>
        <View style={styles.summaryDivider}>
          <Text style={styles.summaryArrow}>➔</Text>
          <Text style={styles.summaryHours}>{journeyDurationHours}h</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t('Gotowy do krojenia')}</Text>
          <Text style={styles.summaryTime}>{formatTime(targetDate)}</Text>
          <Text style={styles.summaryDate}>{formatDayBadge(targetDate)}</Text>
        </View>
      </View>

      {/* Transfer to Stolnica Action Button; w stanie „za późno” nieaktywny z powodem (§11c 107) [M1-audytor-generalny-107] */}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: zablokowany }}
        accessibilityHint={powodBlokady ?? undefined}
        disabled={zablokowany}
        testID="plan-start-bake-btn"
        style={[styles.transferBtn, zablokowany && styles.transferBtnZablokowany]}
        onPress={() => {
          if (!zablokowany) onStartBakeOnWorkbench();
        }}
      >
        <Text style={[styles.transferBtnText, zablokowany && styles.transferBtnTextZablokowany]}>
          {t('Zacznij wypiek')}
        </Text>
      </Pressable>
      {powodBlokady ? <Text style={styles.powod}>{powodBlokady}</Text> : null}

      {/* Copy Schedule Action Button */}
      <Pressable
        accessibilityRole="button"
        testID="copy-schedule-btn"
        style={styles.copyScheduleBtn}
        onPress={onCopySchedule}
      >
        <Text style={styles.copyScheduleBtnText}>
          {t('Kopiuj harmonogram')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.colors.tusz3,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryTime: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.akcentTekst,
  },
  summaryDate: {
    fontSize: 12,
    color: theme.colors.tusz2,
    marginTop: 2,
  },
  summaryDivider: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  summaryArrow: {
    fontSize: 18,
    color: theme.colors.tusz3,
  },
  summaryHours: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz3,
    marginTop: 2,
  },
  transferBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.akcent,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginBottom: 8,
  },
  transferBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  transferBtnZablokowany: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
  },
  transferBtnTextZablokowany: {
    color: theme.colors.zablokowane,
  },
  powod: {
    fontSize: 13,
    color: theme.colors.tusz2,
    textAlign: 'center',
    marginBottom: 8,
  },
  copyScheduleBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  copyScheduleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
});
