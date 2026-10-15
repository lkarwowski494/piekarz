import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import { calculateReverseSchedule } from '../../src/scheduler/reverse-scheduler';

export default function HarmonogramScreen() {
  // Target ready time: default tomorrow at 10:00 AM
  const [targetHour, setTargetHour] = useState(10);
  const [ambientTemp, setAmbientTemp] = useState(23.0);

  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(targetHour, 0, 0, 0);
    return d;
  }, [targetHour]);

  const schedule = useMemo(() => {
    return calculateReverseSchedule(targetDate, {
      ambientTemperatureC: ambientTemp,
      sleepStartHour: 23.0,
      sleepEndHour: 6.5,
    });
  }, [targetDate, ambientTemp]);

  const formatTime = (d: Date) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const formatDateLabel = (d: Date) => {
    const days = ['Niedz.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.'];
    return `${days[d.getDay()]}, ${d.getDate()} paź`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Harmonogram')}</Text>
          <Text style={styles.subtitle}>Harmonogram wsteczny z ochroną snu (Sleep Guard)</Text>
        </View>

        {/* Target Ready Selector Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Godzina gotowości chleba do krojenia</Text>
          <Text style={styles.cardSubtitle}>Wyznacz kroki wstecz, aby nie zarywać nocy</Text>

          <View style={styles.hourSelector}>
            {[8, 10, 13, 18, 20].map((h) => {
              const isSelected = h === targetHour;
              return (
                <Pressable
                  key={h}
                  onPress={() => setTargetHour(h)}
                  style={[styles.hourChip, isSelected && styles.hourChipActive]}
                >
                  <Text style={[styles.hourChipText, isSelected && styles.hourChipTextActive]}>
                    {h}:00
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Temperature Adaptation */}
          <View style={styles.tempRow}>
            <Text style={styles.tempLabel}>Temperatura w kuchni:</Text>
            <View style={styles.tempChips}>
              {[20, 23, 26].map((temp) => (
                <Pressable
                  key={temp}
                  onPress={() => setAmbientTemp(temp)}
                  style={[styles.tempChip, ambientTemp === temp && styles.tempChipActive]}
                >
                  <Text style={[styles.tempChipText, ambientTemp === temp && styles.tempChipTextActive]}>
                    {temp}°C
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Sleep Guard Warning */}
        {schedule.hasSleepCollision && (
          <View style={styles.sleepGuardAlert}>
            <Text style={styles.sleepGuardTitle}>🌙 Uwaga: Kolizja ze snem!</Text>
            <Text style={styles.sleepGuardBody}>{schedule.collisionDetailsPl}</Text>
            {schedule.suggestedActionPl && (
              <Text style={styles.sleepGuardAction}>{schedule.suggestedActionPl}</Text>
            )}
          </View>
        )}

        {/* Timeline Stages */}
        <Text style={styles.sectionHeading}>Oś czasu przygotowania (Timeline)</Text>
        <View style={styles.timeline}>
          {schedule.stages.map((stage, idx) => {
            const isColliding = stage.isSleepCollision;
            return (
              <View key={stage.id} style={styles.timelineItem}>
                <View style={styles.timeColumn}>
                  <Text style={styles.startTimeText}>{formatTime(stage.startTime)}</Text>
                  <Text style={styles.dateText}>{formatDateLabel(stage.startTime)}</Text>
                </View>

                <View style={styles.bulletColumn}>
                  <View
                    style={[
                      styles.bullet,
                      isColliding
                        ? styles.bulletCollision
                        : stage.isPassive
                        ? styles.bulletPassive
                        : styles.bulletActive,
                    ]}
                  />
                  {idx < schedule.stages.length - 1 && <View style={styles.verticalLine} />}
                </View>

                <View style={styles.contentColumn}>
                  <Text style={styles.stageName}>{stage.namePl}</Text>
                  <Text style={styles.stageDuration}>
                    {stage.durationMinutes >= 60
                      ? `${Math.floor(stage.durationMinutes / 60)}h ${stage.durationMinutes % 60 > 0 ? (stage.durationMinutes % 60) + 'min' : ''}`
                      : `${stage.durationMinutes} min`}
                    {' · '}
                    {stage.isPassive ? 'Pasywne' : 'Wymaga obecności'}
                  </Text>
                  <Text style={styles.stageInstructions}>{stage.instructionsPl}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
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
    marginBottom: 12,
  },
  hourSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  hourChip: {
    flex: 1,
    paddingVertical: 10,
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
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  hourChipTextActive: {
    color: '#FFFFFF',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tempLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  tempChips: {
    flexDirection: 'row',
    gap: 6,
  },
  tempChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tempChipActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  tempChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  tempChipTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  sleepGuardAlert: {
    backgroundColor: '#FEF3C7',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.statusWarning,
    marginBottom: theme.spacing.md,
  },
  sleepGuardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.accentDark,
    marginBottom: 4,
  },
  sleepGuardBody: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  sleepGuardAction: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.statusSuccess,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeColumn: {
    width: 65,
    paddingRight: 6,
    alignItems: 'flex-end',
  },
  startTimeText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  dateText: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  bulletColumn: {
    width: 24,
    alignItems: 'center',
  },
  bullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  bulletActive: {
    backgroundColor: theme.colors.accent,
  },
  bulletPassive: {
    backgroundColor: theme.colors.passiveStageBadge,
  },
  bulletCollision: {
    backgroundColor: theme.colors.statusDanger,
  },
  verticalLine: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 8,
  },
  stageName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stageDuration: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginVertical: 2,
  },
  stageInstructions: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
});
