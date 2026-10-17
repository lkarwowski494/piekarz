import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CraftHeader } from '@apps4craft/ui';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import {
  calculateReverseSchedule,
  autoResolveSleepCollision,
  ScheduledStage,
} from '../../src/scheduler/reverse-scheduler';
import { setActiveBake } from '../../src/data/sqlite-store';
import { copyScheduleToClipboard } from '../../src/lib/schedule-formatter';
import { useUnitSystem, formatTemperature } from '../../src/lib/unit-converter';
import { useAppAccess } from '../../src/lib/app-access';
import { PaywallModal } from '../../src/components/PaywallModal';

const POLISH_DAYS = ['Niedz.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.'];
const POLISH_MONTHS = [
  'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
  'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
];

function getStageIcon(category: string): string {
  switch (category) {
    case 'starter_feed':
      return '🥣';
    case 'autolyse':
      return '🌾';
    case 'mix':
      return '🧂';
    case 'bulk_ferment':
      return '👐';
    case 'pre_shape':
      return '🥯';
    case 'bench_rest':
      return '⏳';
    case 'final_shape':
      return '🧺';
    case 'final_proof':
      return '❄️';
    case 'preheat_oven':
      return '🔥';
    case 'bake':
      return '♨️';
    case 'cool':
      return '🍞';
    default:
      return '🥖';
  }
}

const BAKING_SCENARIOS = [
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

const SLEEP_PROFILES = [
  { id: 'standard', namePl: 'Standard', label: '23:00 – 06:30', start: 23.0, end: 6.5, icon: '⚖️' },
  { id: 'early_bird', namePl: 'Ranny ptaszek', label: '22:00 – 06:00', start: 22.0, end: 6.0, icon: '🌅' },
  { id: 'night_owl', namePl: 'Nocny marek', label: '00:00 – 08:00', start: 24.0, end: 8.0, icon: '🌙' },
];

export default function HarmonogramScreen() {
  const router = useRouter();

  // Target ready settings:
  // targetDayOffset: 0 = Today, 1 = Tomorrow, 2 = Day after tomorrow
  const [targetDayOffset, setTargetDayOffset] = useState<number>(1);
  const [targetHour, setTargetHour] = useState<number>(10);
  const [targetMinute, setTargetMinute] = useState<number>(0);

  // Baking environment
  const unitSystem = useUnitSystem();
  const [ambientTemp, setAmbientTemp] = useState<number>(23.0);
  const [coldRetardHours, setColdRetardHours] = useState<number>(14.0);

  // Sleep Guard settings
  const [sleepStartHour, setSleepStartHour] = useState<number>(23.0);
  const [sleepEndHour, setSleepEndHour] = useState<number>(6.5);

  // Target Date object
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + targetDayOffset);
    d.setHours(targetHour, targetMinute, 0, 0);
    return d;
  }, [targetDayOffset, targetHour, targetMinute]);

  // Apps4Brew Monetization & Access (Cheaper than espresso)
  const {
    access,
    isPaywallVisible,
    setPaywallVisible,
    requireActionAccess,
    subscribe,
    restorePurchases,
  } = useAppAccess();

  // Reverse schedule calculation
  const schedule = useMemo(() => {
    return calculateReverseSchedule(targetDate, {
      ambientTemperatureC: ambientTemp,
      coldRetardHours,
      sleepStartHour,
      sleepEndHour,
    });
  }, [targetDate, ambientTemp, coldRetardHours, sleepStartHour, sleepEndHour]);

  // Automatic sleep collision resolution helper
  const autoResolved = useMemo(() => {
    if (!schedule.hasSleepCollision) return null;
    return autoResolveSleepCollision(targetDate, {
      ambientTemperatureC: ambientTemp,
      coldRetardHours,
      sleepStartHour,
      sleepEndHour,
    });
  }, [schedule.hasSleepCollision, targetDate, ambientTemp, coldRetardHours, sleepStartHour, sleepEndHour]);

  // Adjust time by minutes
  const adjustTargetTime = (deltaMinutes: number) => {
    let total = targetHour * 60 + targetMinute + deltaMinutes;
    if (total < 0) total += 24 * 60;
    total = total % (24 * 60);
    setTargetHour(Math.floor(total / 60));
    setTargetMinute(total % 60);
  };

  const formatTime = (d: Date) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const formatDayBadge = (d: Date) => {
    const today = new Date();
    const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const diffDays = Math.round((dDay - todayDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Dziś';
    if (diffDays === 1) return 'Jutro';
    if (diffDays === 2) return 'Pojutrze';
    if (diffDays === -1) return 'Wczoraj';
    return `${POLISH_DAYS[d.getDay()]}, ${d.getDate()} ${POLISH_MONTHS[d.getMonth()]}`;
  };

  // Transfer to Stolnica
  const handleStartBakeOnWorkbench = () => {
    requireActionAccess(() => {
      setActiveBake({
        id: `bake_${Date.now()}`,
        recipeName: 'Klasyczny chleb rzemieślniczy (Harmonogram)',
        startedAt: Date.now(),
        currentStageId: 'step_1',
        ambientTempC: ambientTemp,
        actualDdtC: 25.0,
      });
      router.push('/(tabs)/stolnica');
    });
  };

  const handleCopySchedule = async () => {
    await copyScheduleToClipboard(schedule, {
      ambientTempC: ambientTemp,
      coldRetardHours,
    });
  };

  // Total journey time
  const journeyDurationHours = useMemo(() => {
    if (schedule.stages.length === 0) return 0;
    const start = schedule.stages[0].startTime.getTime();
    const end = schedule.stages[schedule.stages.length - 1].endTime.getTime();
    return Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10;
  }, [schedule.stages]);

  const firstStage = schedule.stages[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CraftHeader
        title={t('Harmonogram')}
        subtitle={t('Harmonogram wsteczny z ochroną snu (Sleep Guard)')}
        testID="harmonogram-header"
      />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Target Ready Selector Card */}
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
                  setTargetDayOffset(scen.targetDayOffset);
                  setTargetHour(scen.targetHour);
                  setTargetMinute(scen.targetMinute);
                  setColdRetardHours(scen.coldRetardHours);
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
                  onPress={() => setTargetDayOffset(item.offset)}
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
                    setTargetHour(h);
                    setTargetMinute(0);
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
              onPress={() => adjustTargetTime(-30)}
            >
              <Text style={styles.fineTuneBtnText}>-30 min</Text>
            </Pressable>

            <View style={styles.timeDisplayBox}>
              <Text style={styles.timeDisplayText}>
                {String(targetHour).padStart(2, '0')}:{String(targetMinute).padStart(2, '0')}
              </Text>
              <Text style={styles.timeDisplayDay}>{formatDayBadge(targetDate)}</Text>
            </View>

            <Pressable
              style={styles.fineTuneBtn}
              onPress={() => adjustTargetTime(30)}
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
                  onPress={() => {
                    setSleepStartHour(p.start);
                    setSleepEndHour(p.end);
                  }}
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
                  onPress={() => setAmbientTemp(temp)}
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
                  onPress={() => setColdRetardHours(hours)}
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

        {/* Sleep Guard Banner */}
        {schedule.hasSleepCollision ? (
          <View style={styles.sleepGuardAlert}>
            <Text style={styles.sleepGuardTitle}>🌙 {t('Uwaga: Kolizja ze snem!')}</Text>
            <Text style={styles.sleepGuardBody}>{schedule.collisionDetailsPl}</Text>
            {autoResolved && (
              <Pressable
                style={styles.autoFixBtn}
                onPress={() => setColdRetardHours(autoResolved.adjustedColdRetardHours)}
              >
                <Text style={styles.autoFixBtnText}>
                  ⚡ {t('Rozwiąż kolizję')} ({t('lodówka')}: {autoResolved.adjustedColdRetardHours}h)
                </Text>
              </Pressable>
            )}
            {schedule.suggestedActionPl && (
              <Text style={styles.sleepGuardAction}>{schedule.suggestedActionPl}</Text>
            )}
          </View>
        ) : (
          <View style={styles.sleepGuardSafe}>
            <Text style={styles.sleepGuardSafeTitle}>
              ✓ {t('Ochrona snu aktywna (Sleep Guard)')}
            </Text>
            <Text style={styles.sleepGuardSafeBody}>
              {t(
                'Wszystkie etapy manualne (mieszanie, składanie, pieczenie) odbywają się poza oknem snu (23:00 – 06:30).'
              )}
            </Text>
          </View>
        )}

        {/* Summary Card */}
        {firstStage && (
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

            {/* Transfer to Stolnica Action Button */}
            <Pressable
              style={styles.transferBtn}
              onPress={handleStartBakeOnWorkbench}
            >
              <Text style={styles.transferBtnText}>
                🥖 {t('Rozpocznij wypiek na Stolnicy')}
              </Text>
            </Pressable>

            {/* Copy Schedule Action Button */}
            <Pressable
              testID="copy-schedule-btn"
              style={styles.copyScheduleBtn}
              onPress={handleCopySchedule}
            >
              <Text style={styles.copyScheduleBtnText}>
                📋 {t('Kopiuj harmonogram')}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Timeline Stages Heading */}
        <Text style={styles.sectionHeading}>{t('Oś czasu przygotowania (Timeline)')}</Text>

        {/* Timeline Stages List */}
        <View style={styles.timeline}>
          {schedule.stages.map((stage: ScheduledStage, idx: number) => {
            const isColliding = stage.isSleepCollision;
            return (
              <View key={stage.id} style={styles.timelineItem}>
                <View style={styles.timeColumn}>
                  <Text style={[styles.startTimeText, isColliding && styles.timeCollision]}>
                    {formatTime(stage.startTime)}
                  </Text>
                  <Text style={styles.endTimeText}>– {formatTime(stage.endTime)}</Text>
                  <Text style={styles.dateText}>{formatDayBadge(stage.startTime)}</Text>
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
                  >
                    <Text style={styles.bulletIcon}>{getStageIcon(stage.category)}</Text>
                  </View>
                  {idx < schedule.stages.length - 1 && <View style={styles.verticalLine} />}
                </View>

                <View style={styles.contentColumn}>
                  <View style={styles.stageTitleRow}>
                    <Text style={styles.stageName}>{stage.namePl}</Text>
                  </View>

                  <View style={styles.stageMetaRow}>
                    <Text style={styles.stageDuration}>
                      {stage.durationMinutes >= 60
                        ? `${Math.floor(stage.durationMinutes / 60)}h ${
                            stage.durationMinutes % 60 > 0 ? (stage.durationMinutes % 60) + 'min' : ''
                          }`
                        : `${stage.durationMinutes} min`}
                    </Text>
                    <View
                      style={[
                        styles.typeBadge,
                        stage.isPassive ? styles.typeBadgePassive : styles.typeBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          stage.isPassive ? styles.typeBadgeTextPassive : styles.typeBadgeTextActive,
                        ]}
                      >
                        {stage.isPassive ? t('Pasywne') : t('Wymaga obecności')}
                      </Text>
                    </View>
                    {isColliding && (
                      <View style={styles.collisionBadge}>
                        <Text style={styles.collisionBadgeText}>⚠️ {t('Kolizja nocna!')}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.stageInstructions}>{stage.instructionsPl}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Apps4Brew Pass Paywall Modal ($0.99 / $4.99 / $14.99) */}
        <PaywallModal
          visible={isPaywallVisible}
          onClose={() => setPaywallVisible(false)}
          onSubscribe={subscribe}
          onRestore={restorePurchases}
          trialDaysRemaining={access.trialDaysRemaining}
          completedBakesCount={access.completedBakesCount}
        />
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
    marginBottom: 14,
  },
  inputGroupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
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
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  paramChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  paramChipTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  paramHint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
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
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.accentDark,
    marginBottom: 4,
  },
  sleepGuardBody: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  autoFixBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    marginTop: 8,
  },
  autoFixBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sleepGuardAction: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accentDark,
    marginTop: 6,
    lineHeight: 16,
  },
  sleepGuardSafe: {
    backgroundColor: '#F0FDF4',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.statusSuccess,
    marginBottom: theme.spacing.md,
  },
  sleepGuardSafeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.statusSuccess,
    marginBottom: 2,
  },
  sleepGuardSafeBody: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  summaryTime: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  summaryDate: {
    fontSize: 11,
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  summaryDivider: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  summaryArrow: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  summaryHours: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  transferBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  transferBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeColumn: {
    width: 76,
    paddingRight: 6,
    alignItems: 'flex-end',
  },
  startTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  endTimeText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  timeCollision: {
    color: theme.colors.statusDanger,
  },
  dateText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  bulletColumn: {
    width: 28,
    alignItems: 'center',
  },
  bullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bulletActive: {
    backgroundColor: theme.colors.accentLight,
  },
  bulletPassive: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  bulletCollision: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: theme.colors.statusDanger,
  },
  bulletIcon: {
    fontSize: 12,
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
  stageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  stageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 3,
  },
  stageDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  typeBadgeActive: {
    backgroundColor: theme.colors.accentLight,
  },
  typeBadgePassive: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  typeBadgeTextActive: {
    color: theme.colors.accentDark,
  },
  typeBadgeTextPassive: {
    color: theme.colors.textMuted,
  },
  collisionBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  collisionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.statusDanger,
  },
  stageInstructions: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  copyScheduleBtn: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  copyScheduleBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  scenariosScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  scenarioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    gap: 6,
  },
  scenarioIcon: {
    fontSize: 14,
  },
  scenarioText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sleepProfilesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  sleepProfileChip: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepProfileChipActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  sleepProfileText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  sleepProfileTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
});
