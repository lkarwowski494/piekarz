// ============================================================================
// Apps4Craft Studio — ActiveTimerDisplay Component
// Hands-in-flour digital kitchen timer with in-flight adjustments.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';

export interface ActiveTimerDisplayProps {
  formattedTime: string;
  isRunning: boolean;
  isCompleted: boolean;
  onAdjustSeconds: (deltaSec: number) => void;
  onToggleTimer: () => void;
  onAddFiveMinutes: () => void;
}

export function ActiveTimerDisplay({
  formattedTime,
  isRunning,
  isCompleted,
  onAdjustSeconds,
  onToggleTimer,
  onAddFiveMinutes,
}: ActiveTimerDisplayProps) {
  return (
    <View style={[styles.timerContainer, isCompleted && styles.timerContainerCompleted]}>
      <Text style={[styles.timerStatusText, isCompleted && styles.timerStatusTextCompleted]}>
        {isCompleted
          ? `✓ ${t('Etap ukończony!')}`
          : isRunning
          ? `● ${t('Odliczanie trwa')}`
          : t('Wstrzymano')}
      </Text>
      <Text style={[styles.digitalClock, isCompleted && styles.digitalClockCompleted]}>
        {formattedTime}
      </Text>

      {/* In-Flight Time Adjustment Pills (Zadanie P8) */}
      <View style={styles.timeAdjustmentRow} testID="timer-in-flight-adjustments">
        <Pressable
          testID="adjust-time-minus-5m"
          accessibilityRole="button"
          accessibilityLabel={t('-5 min')}
          style={styles.timePillBtn}
          onPress={() => onAdjustSeconds(-300)}
        >
          <Text style={styles.timePillText}>-5m</Text>
        </Pressable>
        <Pressable
          testID="adjust-time-minus-10s"
          accessibilityRole="button"
          accessibilityLabel={t('-10 sek')}
          style={styles.timePillBtn}
          onPress={() => onAdjustSeconds(-10)}
        >
          <Text style={styles.timePillText}>-10s</Text>
        </Pressable>
        <Pressable
          testID="adjust-time-plus-10s"
          accessibilityRole="button"
          accessibilityLabel={t('+10 sek')}
          style={styles.timePillBtn}
          onPress={() => onAdjustSeconds(10)}
        >
          <Text style={styles.timePillText}>+10s</Text>
        </Pressable>
        <Pressable
          testID="adjust-time-plus-5m"
          accessibilityRole="button"
          accessibilityLabel={t('+5 min')}
          style={styles.timePillBtn}
          onPress={() => onAdjustSeconds(300)}
        >
          <Text style={styles.timePillText}>+5m</Text>
        </Pressable>
      </View>

      {/* Big Hands-in-Flour Timer Action Controls */}
      <View style={styles.timerControlsRow}>
        <Pressable
          accessibilityRole="button"
          style={[styles.timerPrimaryBtn, isRunning && styles.timerPrimaryBtnPause]}
          onPress={onToggleTimer}
        >
          <Text style={styles.timerPrimaryBtnText}>
            {isRunning ? t('Wstrzymaj') : t('Start')}
          </Text>
        </Pressable>

        <Pressable accessibilityRole="button" style={styles.timerSecondaryBtn} onPress={onAddFiveMinutes}>
          <Text style={styles.timerSecondaryBtnText}>{t('+5 min')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.linia,
  },
  timerContainerCompleted: {
    borderColor: theme.colors.linia,
    backgroundColor: theme.colors.powierzchnia,
  },
  timerStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz3,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerStatusTextCompleted: {
    color: theme.colors.akcentTekst,
  },
  digitalClock: {
    fontSize: 52,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    color: theme.colors.akcentTekst,
    marginVertical: 4,
  },
  digitalClockCompleted: {
    color: theme.colors.akcentTekst,
  },
  timeAdjustmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  timePillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  timePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz2,
  },
  timerControlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  timerPrimaryBtn: {
    flex: 2,
    backgroundColor: theme.colors.akcent,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  timerPrimaryBtnPause: {
    backgroundColor: theme.colors.akcent,
  },
  timerPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  timerSecondaryBtn: {
    flex: 1,
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  timerSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
});
