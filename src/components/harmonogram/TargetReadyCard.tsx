// ============================================================================
// Apps4Craft Studio — TargetReadyCard Component
// Target ready time, scenarios, sleep profiles, temperature & cold retard selectors.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatTemperature } from '../../lib/unit-converter';

export const BAKING_SCENARIOS = [
  {
    id: 'saturday_breakfast',
    namePl: 'Sobotnie śniadanie',
    icon: '☕',
    targetDayOffset: 1,
    targetHour: 8,
    targetMinute: 30,
    coldRetardHours: 14,
  },
  {
    id: 'sunday_dinner',
    namePl: 'Niedzielny obiad',
    icon: '🍲',
    targetDayOffset: 1,
    targetHour: 13,
    targetMinute: 0,
    coldRetardHours: 16,
  },
  {
    id: 'after_work',
    namePl: 'Świeży po pracy',
    icon: '🌆',
    targetDayOffset: 0,
    targetHour: 18,
    targetMinute: 30,
    coldRetardHours: 10,
  },
  {
    id: 'same_day_direct',
    namePl: 'Wypiek jednodniowy (Direct)',
    icon: '⚡',
    targetDayOffset: 0,
    targetHour: 19,
    targetMinute: 0,
    coldRetardHours: 0,
  },
];

export const SLEEP_PROFILES = [
  { id: 'standard', namePl: 'Standard', label: '23:00 – 06:30', start: 23.0, end: 6.5, icon: '⚖️' },
  { id: 'early_bird', namePl: 'Ranny ptaszek', label: '22:00 – 06:00', start: 22.0, end: 6.0, icon: '🌅' },
  { id: 'night_owl', namePl: 'Nocny marek', label: '00:00 – 08:00', start: 24.0, end: 8.0, icon: '🌙' },
];

export interface TargetReadyCardProps {
  targetDayOffset: number;
  onTargetDayOffsetChange: (offset: number) => void;
  targetHour: number;
  onTargetHourChange: (hour: number) => void;
  targetMinute: number;
  onTargetMinuteChange: (minute: number) => void;
  onAdjustTargetTime: (deltaMinutes: number) => void;
  formattedDayBadge: string;
  ambientTemp: number;
  onAmbientTempChange: (temp: number) => void;
  coldRetardHours: number;
  onColdRetardHoursChange: (hours: number) => void;
  sleepStartHour: number;
  sleepEndHour: number;
  onSleepHoursChange: (start: number, end: number) => void;
  unitSystem: any;
}

export function TargetReadyCard({
  targetDayOffset,
  onTargetDayOffsetChange,
  targetHour,
  onTargetHourChange,
  targetMinute,
  onTargetMinuteChange,
  onAdjustTargetTime,
  formattedDayBadge,
  ambientTemp,
  onAmbientTempChange,
  coldRetardHours,
  onColdRetardHoursChange,
  sleepStartHour,
  sleepEndHour,
  onSleepHoursChange,
  unitSystem,
}: TargetReadyCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t('Godzina gotowości chleba do krojenia')}</Text>
      <Text style={styles.cardSubtitle}>
        {t('Wyznacz kroki wstecz, aby nie zarywać nocy')}
      </Text>

      {/* Baking Scenarios */}
      <Text style={styles.inputGroupLabel}>{t('Scenariusze wypieku')}:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scenariosScroll}
      >
        {BAKING_SCENARIOS.map((scen) => (
          <Pressable
            key={scen.id}
            testID={`scenario-${scen.id}`}
            style={styles.scenarioChip}
            onPress={() => {
              onTargetDayOffsetChange(scen.targetDayOffset);
              onTargetHourChange(scen.targetHour);
              onTargetMinuteChange(scen.targetMinute);
              onColdRetardHoursChange(scen.coldRetardHours);
            }}
          >
            <Text style={styles.scenarioIcon}>{scen.icon}</Text>
            <Text style={styles.scenarioText}>{scen.namePl}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Day Selector */}
      <Text style={styles.inputGroupLabel}>{t('Dzień gotowości:')}</Text>
      <View style={styles.daySelector}>
        {[
          { label: t('Dziś'), offset: 0 },
          { label: t('Jutro'), offset: 1 },
          { label: t('Pojutrze'), offset: 2 },
        ].map((item) => {
          const isSelected = item.offset === targetDayOffset;
          return (
            <Pressable
              key={item.offset}
              onPress={() => onTargetDayOffsetChange(item.offset)}
              style={[styles.dayChip, isSelected && styles.dayChipActive]}
            >
              <Text style={[styles.dayChipText, isSelected && styles.dayChipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Hour Selector Quick Chips */}
      <Text style={styles.inputGroupLabel}>{t('Godzina podania na stół:')}</Text>
      <View style={styles.hourSelector}>
        {[8, 10, 13, 18, 20].map((h) => {
          const isSelected = h === targetHour && targetMinute === 0;
          return (
            <Pressable
              key={h}
              onPress={() => {
                onTargetHourChange(h);
                onTargetMinuteChange(0);
              }}
              style={[styles.hourChip, isSelected && styles.hourChipActive]}
            >
              <Text style={[styles.hourChipText, isSelected && styles.hourChipTextActive]}>
                {h}:00
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Fine Tuning Controls */}
      <View style={styles.fineTuneRow}>
        <Pressable
          style={styles.fineTuneBtn}
          onPress={() => onAdjustTargetTime(-30)}
        >
          <Text style={styles.fineTuneBtnText}>-30 min</Text>
        </Pressable>

        <View style={styles.timeDisplayBox}>
          <Text style={styles.timeDisplayText}>
            {String(targetHour).padStart(2, '0')}:{String(targetMinute).padStart(2, '0')}
          </Text>
          <Text style={styles.timeDisplayDay}>{formattedDayBadge}</Text>
        </View>

        <Pressable
          style={styles.fineTuneBtn}
          onPress={() => onAdjustTargetTime(30)}
        >
          <Text style={styles.fineTuneBtnText}>+30 min</Text>
        </Pressable>
      </View>

      {/* Sleep Guard Profile Selector */}
      <Text style={styles.inputGroupLabel}>
        🌙 {t('Godziny snu (Sleep Guard):')}{' '}
        {sleepStartHour === 24 ? '00' : Math.floor(sleepStartHour)}:00 –{' '}
        {String(Math.floor(sleepEndHour)).padStart(2, '0')}:{sleepEndHour % 1 !== 0 ? '30' : '00'}
      </Text>
      <View style={styles.sleepProfilesRow}>
        {SLEEP_PROFILES.map((p) => {
          const isSelected = sleepStartHour === p.start && sleepEndHour === p.end;
          return (
            <Pressable
              key={p.id}
              testID={`sleep-profile-${p.id}`}
              style={[styles.sleepProfileChip, isSelected && styles.sleepProfileChipActive]}
              onPress={() => onSleepHoursChange(p.start, p.end)}
            >
              <Text
                style={[
                  styles.sleepProfileText,
                  isSelected && styles.sleepProfileTextActive,
                ]}
              >
                {p.icon} {p.namePl} ({p.label})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Temperature Adaptation */}
      <View style={styles.paramSection}>
        <View style={styles.paramHeader}>
          <Text style={styles.paramLabel}>{t('Temperatura w kuchni:')}</Text>
          <Text style={styles.paramValue}>{formatTemperature(ambientTemp, unitSystem)}</Text>
        </View>
        <View style={styles.paramChips}>
          {[20, 22, 24, 26].map((temp) => (
            <Pressable
              key={temp}
              onPress={() => onAmbientTempChange(temp)}
              style={[styles.paramChip, ambientTemp === temp && styles.paramChipActive]}
            >
              <Text
                style={[styles.paramChipText, ambientTemp === temp && styles.paramChipTextActive]}
              >
                {formatTemperature(temp, unitSystem)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.paramHint}>
          {t('Wpływa na tempo fermentacji burzliwej (Q10 = 2.0)')}
        </Text>
      </View>

      {/* Cold Retard (Garowanie chłodnicze w lodówce) */}
      <View style={styles.paramSection}>
        <View style={styles.paramHeader}>
          <Text style={styles.paramLabel}>{t('Czas w lodówce (Cold Retard):')}</Text>
          <Text style={styles.paramValue}>{coldRetardHours}h</Text>
        </View>
        <View style={styles.paramChips}>
          {[10, 12, 14, 16, 18].map((hours) => (
            <Pressable
              key={hours}
              onPress={() => onColdRetardHoursChange(hours)}
              style={[styles.paramChip, coldRetardHours === hours && styles.paramChipActive]}
            >
              <Text
                style={[styles.paramChipText, coldRetardHours === hours && styles.paramChipTextActive]}
              >
                {hours}h
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.paramHint}>
          {t('Elastyczny bufor regulujący porę formowania i pieczenia')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 14,
  },
  inputGroupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  scenariosScroll: {
    marginBottom: 14,
  },
  scenarioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  scenarioIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  scenarioText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  dayChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  hourSelector: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  hourChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  hourChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  hourChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  hourChipTextActive: {
    color: '#FFFFFF',
  },
  fineTuneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceCard,
    padding: 8,
    borderRadius: theme.radius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fineTuneBtn: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fineTuneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  timeDisplayBox: {
    alignItems: 'center',
  },
  timeDisplayText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  timeDisplayDay: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  sleepProfilesRow: {
    gap: 6,
    marginBottom: 14,
  },
  sleepProfileChip: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sleepProfileChipActive: {
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.accent,
  },
  sleepProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  sleepProfileTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  paramSection: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 8,
  },
  paramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  paramLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  paramValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  paramChips: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  paramChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  paramChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  paramChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  paramChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  paramHint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
