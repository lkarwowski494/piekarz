// ============================================================================
// Apps4Craft Studio — TargetReadyCard Component
// Target ready time, scenarios, sleep profiles, temperature & cold retard selectors.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatTemperature, UnitSystem } from '../../lib/unit-converter';
import { formatTime } from '../../lib/format';

/** Godzina w formacie regionu (PL 24 h, en-US 12 h; design-spec §7) [M1-audytor-generalny-096]. */
const godzina = (h: number, m: number): string => formatTime(new Date(2000, 0, 1, Math.floor(h) % 24, m));

export const BAKING_SCENARIOS = [
  {
    id: 'saturday_breakfast',
    namePl: 'Sobotnie śniadanie',
    targetDayOffset: 1,
    targetHour: 8,
    targetMinute: 30,
    coldRetardHours: 14,
  },
  {
    id: 'sunday_dinner',
    namePl: 'Niedzielny obiad',
    targetDayOffset: 1,
    targetHour: 13,
    targetMinute: 0,
    coldRetardHours: 16,
  },
  {
    id: 'after_work',
    namePl: 'Świeży po pracy',
    targetDayOffset: 0,
    targetHour: 18,
    targetMinute: 30,
    coldRetardHours: 10,
  },
  {
    id: 'same_day_direct',
    namePl: 'Wypiek jednodniowy (Direct)',
    targetDayOffset: 0,
    targetHour: 19,
    targetMinute: 0,
    coldRetardHours: 0,
  },
];

export const SLEEP_PROFILES = [
  { id: 'standard', namePl: 'Standard', label: '23:00 – 06:30', start: 23.0, end: 6.5 },
  { id: 'early_bird', namePl: 'Ranny ptaszek', label: '22:00 – 06:00', start: 22.0, end: 6.0 },
  { id: 'night_owl', namePl: 'Nocny marek', label: '00:00 – 08:00', start: 24.0, end: 8.0 },
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
  unitSystem: UnitSystem;
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
            accessibilityRole="button"
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
            <Text style={styles.scenarioText}>{t(scen.namePl)}</Text>
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
              accessibilityRole="button"
              accessibilityState={{ selected: !!(isSelected) }}
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
              accessibilityRole="button"
              accessibilityState={{ selected: !!(isSelected) }}
              key={h}
              onPress={() => {
                onTargetHourChange(h);
                onTargetMinuteChange(0);
              }}
              style={[styles.hourChip, isSelected && styles.hourChipActive]}
            >
              <Text style={[styles.hourChipText, isSelected && styles.hourChipTextActive]}>
                {godzina(h, 0)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Fine Tuning Controls */}
      <View style={styles.fineTuneRow}>
        <Pressable
          accessibilityRole="button"
          style={styles.fineTuneBtn}
          onPress={() => onAdjustTargetTime(-30)}
        >
          <Text style={styles.fineTuneBtnText}>{t('{n} min', { n: -30 })}</Text>
        </Pressable>

        <View style={styles.timeDisplayBox}>
          <Text style={styles.timeDisplayText}>
            {godzina(targetHour, targetMinute)}
          </Text>
          <Text style={styles.timeDisplayDay}>{formattedDayBadge}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          style={styles.fineTuneBtn}
          onPress={() => onAdjustTargetTime(30)}
        >
          <Text style={styles.fineTuneBtnText}>{t('{n} min', { n: '+30' })}</Text>
        </Pressable>
      </View>

      {/* Sleep Guard Profile Selector */}
      <Text style={styles.inputGroupLabel}>
        {t('Godziny snu:')}{' '}
        {godzina(sleepStartHour, 0)} –{' '}
        {godzina(sleepEndHour, sleepEndHour % 1 !== 0 ? 30 : 0)}
      </Text>
      <View style={styles.sleepProfilesRow}>
        {SLEEP_PROFILES.map((p) => {
          const isSelected = sleepStartHour === p.start && sleepEndHour === p.end;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !!(isSelected) }}
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
                {t(p.namePl)} ({p.label})
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
              accessibilityRole="button"
              accessibilityState={{ selected: ambientTemp === temp }}
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
          {t('Wpływa na tempo fermentacji burzliwej: 10 °C niżej to około 3 razy dłuższa fermentacja (przybliżenie z modelu badawczego, ważne w 20–26 °C).')}
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
              accessibilityRole="button"
              accessibilityState={{ selected: coldRetardHours === hours }}
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
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.tusz3,
    marginBottom: 14,
  },
  inputGroupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
    marginBottom: 6,
  },
  scenariosScroll: {
    marginBottom: 14,
  },
  scenarioChip: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    marginRight: 8,
  },
  scenarioText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  dayChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  dayChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  hourSelector: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  hourChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  hourChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  hourChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz2,
  },
  hourChipTextActive: {
    color: theme.colors.naAkcencie,
  },
  fineTuneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.powierzchnia,
    padding: 8,
    borderRadius: theme.radius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  fineTuneBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  fineTuneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  timeDisplayBox: {
    alignItems: 'center',
  },
  timeDisplayText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.akcentTekst,
  },
  timeDisplayDay: {
    fontSize: 11,
    color: theme.colors.tusz3,
    fontWeight: '600',
  },
  sleepProfilesRow: {
    gap: 6,
    marginBottom: 14,
  },
  sleepProfileChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  sleepProfileChipActive: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.akcent,
  },
  sleepProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  sleepProfileTextActive: {
    color: theme.colors.akcentTekst,
    fontWeight: '700',
  },
  paramSection: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.linia,
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
    color: theme.colors.tusz2,
  },
  paramValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  paramChips: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  paramChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  paramChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  paramChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  paramChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  paramHint: {
    fontSize: 11,
    color: theme.colors.tusz3,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
