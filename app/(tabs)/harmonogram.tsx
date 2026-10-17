import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CraftHeader } from '@apps4craft/ui';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import {
  calculateReverseSchedule,
  autoResolveSleepCollision,
} from '../../src/scheduler/reverse-scheduler';
import { setActiveBake } from '../../src/data/sqlite-store';
import { copyScheduleToClipboard } from '../../src/lib/schedule-formatter';
import { useUnitSystem } from '../../src/lib/unit-converter';
import { useAppAccess } from '../../src/lib/app-access';
import { PaywallModal } from '../../src/components/PaywallModal';
import { TargetReadyCard } from '../../src/components/harmonogram/TargetReadyCard';
import { SleepGuardBanner } from '../../src/components/harmonogram/SleepGuardBanner';
import { ScheduleSummaryCard } from '../../src/components/harmonogram/ScheduleSummaryCard';
import { TimelineStagesList } from '../../src/components/harmonogram/TimelineStagesList';

const POLISH_DAYS = ['Niedz.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.'];
const POLISH_MONTHS = [
  'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
  'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
];

export default function HarmonogramScreen() {
  const router = useRouter();
  const unitSystem = useUnitSystem();

  // Target ready settings:
  // targetDayOffset: 0 = Today, 1 = Tomorrow, 2 = Day after tomorrow
  const [targetDayOffset, setTargetDayOffset] = useState<number>(1);
  const [targetHour, setTargetHour] = useState<number>(10);
  const [targetMinute, setTargetMinute] = useState<number>(0);

  // Baking environment
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

  // Apps4Craft Monetization & Access (Cheaper than espresso)
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
        <TargetReadyCard
          targetDayOffset={targetDayOffset}
          onTargetDayOffsetChange={setTargetDayOffset}
          targetHour={targetHour}
          onTargetHourChange={setTargetHour}
          targetMinute={targetMinute}
          onTargetMinuteChange={setTargetMinute}
          onAdjustTargetTime={adjustTargetTime}
          formattedDayBadge={formatDayBadge(targetDate)}
          ambientTemp={ambientTemp}
          onAmbientTempChange={setAmbientTemp}
          coldRetardHours={coldRetardHours}
          onColdRetardHoursChange={setColdRetardHours}
          sleepStartHour={sleepStartHour}
          sleepEndHour={sleepEndHour}
          onSleepHoursChange={(start, end) => {
            setSleepStartHour(start);
            setSleepEndHour(end);
          }}
          unitSystem={unitSystem}
        />

        {/* Sleep Guard Banner */}
        <SleepGuardBanner
          hasSleepCollision={schedule.hasSleepCollision}
          collisionDetailsPl={schedule.collisionDetailsPl}
          suggestedActionPl={schedule.suggestedActionPl}
          autoResolved={autoResolved}
          onApplyAutoResolution={(hours) => setColdRetardHours(hours)}
        />

        {/* Summary Card */}
        <ScheduleSummaryCard
          firstStage={firstStage}
          targetDate={targetDate}
          journeyDurationHours={journeyDurationHours}
          formatTime={formatTime}
          formatDayBadge={formatDayBadge}
          onStartBakeOnWorkbench={handleStartBakeOnWorkbench}
          onCopySchedule={handleCopySchedule}
        />

        {/* Timeline Stages List */}
        <TimelineStagesList
          stages={schedule.stages}
          formatTime={formatTime}
          formatDayBadge={formatDayBadge}
        />

        {/* Apps4Craft Pass Paywall Modal */}
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
});
