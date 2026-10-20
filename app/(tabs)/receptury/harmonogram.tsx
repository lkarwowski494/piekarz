import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../../src/ui/theme';
import { t } from '../../../src/lib/i18n';
import {
  calculateReverseSchedule,
  autoResolveSleepCollision,
} from '../../../src/scheduler/reverse-scheduler';
import { setActiveBake, getStarters } from '../../../src/data/sqlite-store';
import type { StoredStarter } from '../../../src/data/db';
import { withFridgeWake } from '../../../src/core/fridge-wake';
import { zakwasPlanu, etapyPlanu } from '../../../src/lib/zakwas-planu';
import { stepsFromSchedule } from '../../../src/core/bake-steps';
import { copyScheduleToClipboard } from '../../../src/lib/schedule-formatter';
import { recepturaPlanu } from '../../../src/lib/plan-receptury';
import { useUnitSystem } from '../../../src/lib/unit-converter';
import { formatTime as formatGodziny } from '../../../src/lib/format';
import { useAppAccess } from '../../../src/lib/app-access';
import { BlokadaFunkcji } from '../../../src/components/BlokadaFunkcji';
import { TargetReadyCard } from '../../../src/components/harmonogram/TargetReadyCard';
import { SleepGuardBanner } from '../../../src/components/harmonogram/SleepGuardBanner';
import { ScheduleSummaryCard } from '../../../src/components/harmonogram/ScheduleSummaryCard';
import { TimelineStagesList } from '../../../src/components/harmonogram/TimelineStagesList';
import { Spirala } from '../../../src/components/Spirala';
import { krokiSpiraliZSesji } from '../../../src/lib/spirala-geometria';
import { etykietaPlanuPrzedStartem } from '../../../src/lib/spirala-etykieta';

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
    blokada,
    requireActionAccess,
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

  // Zakwas planu (wybrany na Zakwasach albo pierwszy); z lodówki: jedno dokarmienie 12 h przed mieszaniem
  // zamiast dokarmienia z planu (BR-ZAKW-006, D-052) [M1-audytor-generalny-104]
  const [zakwas, setZakwas] = useState<StoredStarter | null>(null);
  useEffect(() => {
    let zywy = true;
    void getStarters().then((lista) => { if (zywy) setZakwas(zakwasPlanu(lista)); }).catch(() => {});
    return () => { zywy = false; };
  }, []);
  const steps = useMemo(() => {
    const zPlanu = stepsFromSchedule(schedule);
    return zakwas ? withFridgeWake(zPlanu, zakwas) : zPlanu;
  }, [schedule, zakwas]);
  const stages = useMemo(() => etapyPlanu(steps, schedule.stages), [steps, schedule.stages]);
  // Spirala planu przed startem: kroki tego planu, wszystkie zwoje cienkie (design-spec §11b 058) [M1-audytor-generalny-058]
  const krokiSpirali = useMemo(() => krokiSpiraliZSesji(steps), [steps]);
  const koniecPlanu = steps[steps.length - 1]?.plannedEnd ?? null;
  const etykietaSpirali = etykietaPlanuPrzedStartem({
    liczbaKrokow: steps.length,
    gotowe: koniecPlanu === null ? null : new Date(koniecPlanu),
    teraz: new Date(),
  });

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

  // Godzina w formacie regionu (PL 24 h, en-US 12 h; design-spec §7) [M1-audytor-generalny-096]
  const formatTime = (d: Date) => formatGodziny(d);

  const formatDayBadge = (d: Date) => {
    const today = new Date();
    const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const diffDays = Math.round((dDay - todayDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('Dziś');
    if (diffDays === 1) return t('Jutro');
    if (diffDays === 2) return t('Pojutrze');
    if (diffDays === -1) return t('Wczoraj');
    return t('{dzien}, {d} {miesiac}', { dzien: t(POLISH_DAYS[d.getDay()]), d: d.getDate(), miesiac: t(POLISH_MONTHS[d.getMonth()]) });
  };

  // Transfer to Stolnica: migawka etapów pokazanego planu (F-07) [M1-audytor-generalny-030];
  // z „Ułóż plan” wypiek dostaje nazwę i ilości tej receptury (057) [M1-audytor-generalny-057]
  const handleStartBakeOnWorkbench = () => {
    requireActionAccess(() => {
      const receptura = recepturaPlanu();
      setActiveBake({
        id: `bake_${Date.now()}`,
        recipeName: receptura ? receptura.recipeName : t('Klasyczny chleb rzemieślniczy'),
        startedAt: Date.now(),
        currentStageId: steps[0]?.id ?? '',
        ambientTempC: ambientTemp,
        isHighRye: receptura ? receptura.calculatedRecipe.isHighRye : false,
        steps,
        ...(zakwas ? { starterId: zakwas.id } : {}),
        ...(receptura ? { calculatedRecipe: receptura.calculatedRecipe, recipeFormula: receptura.recipeFormula } : {}),
      });
      router.push('/stolnica');
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
    if (stages.length === 0) return 0;
    const start = stages[0].startTime.getTime();
    const end = stages[stages.length - 1].endTime.getTime();
    return Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10;
  }, [stages]);

  const firstStage = stages[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      {/* Nagłówek systemowy „Plan wypieku” w stosie zakładki Receptury: app/(tabs)/receptury/_layout.tsx */}
      <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        {/* Bez uprawnienia cały planer otwiera ekran zakupu [M1-audytor-generalny-027] */}
        <BlokadaFunkcji {...blokada('harmonogram')}>
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
          sleepCollisions={schedule.sleepCollisions}
          suggestedActionPl={schedule.suggestedActionPl}
          autoResolved={autoResolved}
          onApplyAutoResolution={(hours) => setColdRetardHours(hours)}
        />

        <View style={styles.spirala}>
          <Spirala kroki={krokiSpirali} wariant="plan" etykieta={etykietaSpirali} />
        </View>

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
          stages={stages}
          formatTime={formatTime}
          formatDayBadge={formatDayBadge}
        />
        </BlokadaFunkcji>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  spirala: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
});
