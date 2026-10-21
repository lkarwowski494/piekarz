import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { celGotowosci, stanZaPozno, tekstZaPozno } from '../../../src/lib/plan-za-pozno';
import { PlanZaPozno } from '../../../src/components/harmonogram/PlanZaPozno';

const MINUTA_MS = 60_000;

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
  // 23 °C to założenie modelu planu, nie pomiar: do wypieku i dziennika trafia tylko temperatura wybrana
  // przez użytkownika [M1-audytor-generalny-017; 08-programista-005]
  const [tempWybrana, setTempWybrana] = useState(false);
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
  const [zakwasWczytany, setZakwasWczytany] = useState(false);
  useEffect(() => {
    let zywy = true;
    void getStarters()
      .then((lista) => { if (zywy) setZakwas(zakwasPlanu(lista)); })
      .catch(() => {})
      .finally(() => { if (zywy) setZakwasWczytany(true); });
    return () => { zywy = false; };
  }, []);
  const steps = useMemo(() => {
    const zPlanu = stepsFromSchedule(schedule);
    return zakwas ? withFridgeWake(zPlanu, zakwas) : zPlanu;
  }, [schedule, zakwas]);

  // Stan „za późno”: start pierwszego kroku przed teraz; liczony przy zmianach i co minutę (§11c 107) [M1-audytor-generalny-107]
  const [teraz, setTeraz] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTeraz(Date.now()), MINUTA_MS);
    return () => clearInterval(id);
  }, []);
  const stanCzasu = useMemo(() => stanZaPozno(steps, teraz), [steps, teraz]);
  const zaPozno = tekstZaPozno(stanCzasu, teraz);
  const ustawGotowe = (ms: number) => {
    const cel = celGotowosci(ms, Date.now());
    setTargetDayOffset(cel.dayOffset);
    setTargetHour(cel.hour);
    setTargetMinute(cel.minute);
  };
  // Przy otwarciu planu domyślna godzina, która dałaby „za późno”, ustępuje najwcześniejszej (do wczytania zakwasu
  // planu i do pierwszej zmiany godziny przez użytkownika)
  const godzinaDomyslna = useRef(true);
  const zmianaGodziny = <A extends unknown[]>(f: (...a: A) => void) => (...a: A) => {
    godzinaDomyslna.current = false;
    f(...a);
  };
  useEffect(() => {
    if (!godzinaDomyslna.current) return;
    if (stanCzasu.zaPozno && stanCzasu.najwczesniejMs !== null) ustawGotowe(stanCzasu.najwczesniejMs);
    if (zakwasWczytany) godzinaDomyslna.current = false;
  }, [stanCzasu, zakwasWczytany]);
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
    if (zaPozno) return; // start z krokami w przeszłości: nieaktywny z powodem (§11c 107) [M1-audytor-generalny-107]
    requireActionAccess(() => {
      const receptura = recepturaPlanu();
      setActiveBake({
        id: `bake_${Date.now()}`,
        recipeName: receptura ? receptura.recipeName : t('Klasyczny chleb rzemieślniczy'),
        startedAt: Date.now(),
        currentStageId: steps[0]?.id ?? '',
        ...(tempWybrana ? { ambientTempC: ambientTemp } : {}),
        isHighRye: receptura ? receptura.calculatedRecipe.isHighRye : false,
        steps,
        ...(zakwas ? { starterId: zakwas.id } : {}),
        // Start tylko z dostępem: wypiek prowadzi się do końca także po wygaśnięciu (D-039) [M1-audytor-generalny-125]
        zaczetyZDostepem: true,
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

  // Długość planu w minutach (format czasu trwania, §11c 116) [M1-audytor-generalny-116]
  const czasPlanuMin = useMemo(() => {
    if (stages.length === 0) return 0;
    return (stages[stages.length - 1].endTime.getTime() - stages[0].startTime.getTime()) / MINUTA_MS;
  }, [stages]);
  const startPlanu = stages.length > 0 && !zaPozno ? stages[0].startTime : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      {/* Nagłówek systemowy „Plan wypieku” w stosie zakładki Receptury: app/(tabs)/receptury/_layout.tsx */}
      <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        {/* Bez uprawnienia cały planer otwiera ekran zakupu [M1-audytor-generalny-027] */}
        <BlokadaFunkcji {...blokada('harmonogram')}>
        <TargetReadyCard
          targetDayOffset={targetDayOffset}
          onTargetDayOffsetChange={zmianaGodziny(setTargetDayOffset)}
          targetHour={targetHour}
          onTargetHourChange={zmianaGodziny(setTargetHour)}
          targetMinute={targetMinute}
          onTargetMinuteChange={zmianaGodziny(setTargetMinute)}
          onAdjustTargetTime={zmianaGodziny(adjustTargetTime)}
          formattedDayBadge={formatDayBadge(targetDate)}
          ambientTemp={ambientTemp}
          onAmbientTempChange={(c: number) => {
            setAmbientTemp(c);
            setTempWybrana(true);
          }}
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

        {zaPozno ? (
          <PlanZaPozno
            tytul={zaPozno.tytul}
            tresc={zaPozno.tresc}
            onUstawNajwczesniej={zmianaGodziny(() => {
              if (stanCzasu.najwczesniejMs !== null) ustawGotowe(stanCzasu.najwczesniejMs);
            })}
          />
        ) : (
          // Sleep Guard Banner: ukryty, dopóki trwa stan „za późno” (najpierw godzina, potem noc; §11c 107)
          <SleepGuardBanner
            hasSleepCollision={schedule.hasSleepCollision}
            sleepCollisions={schedule.sleepCollisions}
            suggestedActionPl={schedule.suggestedActionPl}
            autoResolved={autoResolved}
            onApplyAutoResolution={(hours) => setColdRetardHours(hours)}
          />
        )}

        <View style={styles.spirala}>
          <Spirala kroki={krokiSpirali} wariant="plan" etykieta={etykietaSpirali} />
        </View>

        {/* Summary Card */}
        <ScheduleSummaryCard
          start={startPlanu}
          czasMin={czasPlanuMin}
          teraz={teraz}
          onStartBakeOnWorkbench={handleStartBakeOnWorkbench}
          onCopySchedule={handleCopySchedule}
          powodBlokady={zaPozno ? t('Najpierw ustaw godzinę, na którą zdążysz.') : null}
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
