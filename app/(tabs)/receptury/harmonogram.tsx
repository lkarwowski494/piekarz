import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
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
import { ryeStepsEndingAt, stepsFromSchedule } from '../../../src/core/bake-steps';
import { copyScheduleToClipboard, planDoKopii } from '../../../src/lib/schedule-formatter';
import { recepturaPlanu, powodBezZakwasu } from '../../../src/lib/plan-receptury';
import { useUnitSystem } from '../../../src/lib/unit-converter';
import { formatTime as formatGodziny } from '../../../src/lib/format';
import { useAppAccess } from '../../../src/lib/app-access';
import { BlokadaFunkcji } from '../../../src/components/BlokadaFunkcji';
import { TargetReadyCard } from '../../../src/components/harmonogram/TargetReadyCard';
import { SleepGuardBanner } from '../../../src/components/harmonogram/SleepGuardBanner';
import { ScheduleSummaryCard } from '../../../src/components/harmonogram/ScheduleSummaryCard';
import { TimelineStagesList } from '../../../src/components/harmonogram/TimelineStagesList';
import { UstawieniaPlanu } from '../../../src/components/harmonogram/UstawieniaPlanu';
import { oknoSnu, useProfilSnu } from '../../../src/lib/godziny-snu';
import { PasekStartu } from '../../../src/components/harmonogram/PasekStartu';
import { Spirala } from '../../../src/components/Spirala';
import { krokiSpiraliZSesji } from '../../../src/lib/spirala-geometria';
import { etykietaPlanuPrzedStartem } from '../../../src/lib/spirala-etykieta';
import { celGotowosci, stanZaPozno, tekstZaPozno } from '../../../src/lib/plan-za-pozno';
import { godzinaBezNocy, kolizjeKrokow, krokCzynnyWNocy } from '../../../src/lib/plan-bez-nocy';
import { PlanZaPozno } from '../../../src/components/harmonogram/PlanZaPozno';

import { typografia } from '../../../src/ui/tokeny';
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
  // 23 °C to założenie modelu planu, nie pomiar: do wypieku i dziennika trafia tylko temperatura wybrana
  // przez użytkownika [M1-audytor-generalny-017; 08-programista-005]. Z „Ułóż plan”: temperatura kuchni z receptury,
  // ta sama liczba co w arkuszu „Temperatura wody” [audyt-niezalezny D-4]
  const [ambientTemp, setAmbientTemp] = useState<number>(() => recepturaPlanu()?.temperaturaKuchni?.c ?? 23.0);
  const [tempWybrana, setTempWybrana] = useState(() => recepturaPlanu()?.temperaturaKuchni?.wybrana ?? false);
  const [coldRetardHours, setColdRetardHours] = useState<number>(14.0);

  // Godziny snu z Ustawień (D-066 1a, BR-HARMO-002); „Bez godzin snu” = okno puste (0–0), plan nie sprawdza nocy
  // [M1-audytor-generalny-130]
  const oknoPlanu = oknoSnu(useProfilSnu());
  const sleepStartHour = oknoPlanu?.startH ?? 0;
  const sleepEndHour = oknoPlanu?.koniecH ?? 0;

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
  // Receptura żytnia z „Ułóż plan”: etapy żytnie z czasami planu, studzenie kończy się o godzinie „gotowe”;
  // te same kroki dostaje Stolnica (DEC-04 a) [M1-audytor-generalny-030; 03-zakres-501]
  const [zytni] = useState(() => recepturaPlanu()?.calculatedRecipe.isHighRye ?? false);
  // „Piecz ponownie” z Dziennika: notatka z poprzedniego wypieku nad planem (BR-RECP-003) [M1-audytor-generalny-146]
  const [notatkaPoprzednia] = useState(() => recepturaPlanu()?.notatka ?? null);
  // Receptura bez zakwasu (np. z „Piecz ponownie”): plan zakwasowy jej nie prowadzi, start nieaktywny z powodem (D-3)
  const [bezZakwasu] = useState(() => {
    const r = recepturaPlanu();
    return r ? powodBezZakwasu(r.recipeFormula) : null;
  });
  const krokiDla = (plan: ReturnType<typeof calculateReverseSchedule>, celMs: number) => {
    const zPlanu = stepsFromSchedule(plan);
    const bazowe = zytni ? ryeStepsEndingAt(zPlanu, celMs) : zPlanu;
    return zakwas ? withFridgeWake(bazowe, zakwas) : bazowe;
  };
  const steps = useMemo(() => krokiDla(schedule, targetDate.getTime()), [schedule, zakwas]); // eslint-disable-line react-hooks/exhaustive-deps

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
  // Godzina domyślna zostaje, gdy nie daje „za późno” ani kroku czynnego w oknie snu; inaczej pole dostaje najbliższą
  // godzinę ≥ najwcześniejszej, przy której żaden krok czynny nie zachodzi na sen (brak takiej: najwcześniejsza, baner nocy)
  // [M1-audytor-generalny-129; DEC-18 a]
  useEffect(() => {
    if (!godzinaDomyslna.current) return;
    const okno = { startH: sleepStartHour, koniecH: sleepEndHour }; // „Bez godzin snu”: 0–0, żaden krok nie jest w nocy
    if (stanCzasu.najwczesniejMs !== null && (stanCzasu.zaPozno || krokCzynnyWNocy(steps, okno))) {
      const kroki = (celMs: number) =>
        krokiDla(calculateReverseSchedule(new Date(celMs), { ambientTemperatureC: ambientTemp, coldRetardHours, sleepStartHour, sleepEndHour }), celMs);
      const bezNocy = godzinaBezNocy(stanCzasu.najwczesniejMs, kroki, okno);
      if (bezNocy !== null) ustawGotowe(bezNocy);
      else if (stanCzasu.zaPozno) ustawGotowe(stanCzasu.najwczesniejMs);
    }
    if (zakwasWczytany) godzinaDomyslna.current = false;
  }, [stanCzasu, zakwasWczytany]); // eslint-disable-line react-hooks/exhaustive-deps
  // Kolizje ze snem z kroków tego planu (także dokarmienie z lodówki i kroki z rękami na starcie), dla każdego planu:
  // baner mówi o krokach, które są na ekranie, nie o etapach harmonogramu zastąpionych w planie [audyt-niezalezny D-6]
  const kolizjePlanu = useMemo(
    () => kolizjeKrokow(steps, { startH: sleepStartHour, koniecH: sleepEndHour }, formatGodziny),
    [steps, sleepStartHour, sleepEndHour],
  );
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

  // ±30 min do najbliższej pełnej lub połówkowej godziny w tym kierunku (np. 23:50 → 00:00 albo 23:30), bo pole
  // „Kiedy chleb ma być gotowy?” nie ma już chipów godziny (128) [M1-audytor-generalny-128]
  const adjustTargetTime = (deltaMinutes: number) => {
    const teraz = targetHour * 60 + targetMinute;
    const krok = Math.abs(deltaMinutes);
    let total = deltaMinutes > 0 ? Math.floor(teraz / krok) * krok + krok : Math.ceil(teraz / krok) * krok - krok;
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
    if (zaPozno || bezZakwasu) return; // start z krokami w przeszłości: nieaktywny z powodem (§11c 107) [M1-audytor-generalny-107]
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
    // Kopia z planu na ekranie: etapy `stages` (żytnie z kroków) i kolizje tych kroków [M1-audytor-generalny-197]
    await copyScheduleToClipboard(planDoKopii(schedule, stages, kolizjePlanu), {
      ambientTempC: ambientTemp,
      // Plan żytni nie ma garowania chłodniczego (rozrost w formie), więc bez tej linii
      ...(zytni ? {} : { coldRetardHours }),
    });
  };

  // Długość planu w minutach (format czasu trwania, §11c 116) [M1-audytor-generalny-116]
  const czasPlanuMin = useMemo(() => {
    if (stages.length === 0) return 0;
    return (stages[stages.length - 1].endTime.getTime() - stages[0].startTime.getTime()) / MINUTA_MS;
  }, [stages]);
  const startPlanu = stages.length > 0 && !zaPozno ? stages[0].startTime : null;

  // Układ `plan-sen` (design-spec §6): pytanie i pole godziny, informacja pod polem, temperatura, Spirala z opisem,
  // kroki, ustawienia nocy; „Zacznij wypiek” w pasku kciuka poza przewijaną treścią [M1-audytor-generalny-128]
  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      {/* Nagłówek systemowy „Plan wypieku” w stosie zakładki Receptury: app/(tabs)/receptury/_layout.tsx */}
      <ScrollView style={styles.przewijane} contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        {/* Bez uprawnienia cały planer otwiera ekran zakupu [M1-audytor-generalny-027]; start w pasku kciuka
            przechodzi przez tego samego strażnika (requireActionAccess) */}
        <BlokadaFunkcji {...blokada('harmonogram')}>
        {notatkaPoprzednia ? (
          <Text style={styles.bezSnu} testID="plan-notatka-poprzednia">
            {t('Notatka z poprzedniego wypieku: {notatka}', { notatka: notatkaPoprzednia })}
          </Text>
        ) : null}
        <TargetReadyCard
          targetDayOffset={targetDayOffset}
          onTargetDayOffsetChange={zmianaGodziny(setTargetDayOffset)}
          targetHour={targetHour}
          targetMinute={targetMinute}
          onAdjustTargetTime={zmianaGodziny(adjustTargetTime)}
          formattedDayBadge={formatDayBadge(targetDate)}
          ambientTemp={ambientTemp}
          onAmbientTempChange={(c: number) => {
            setAmbientTemp(c);
            setTempWybrana(true);
          }}
          unitSystem={unitSystem}
          // Noc po temperaturze jak w `plan-sen`; „za późno” zostaje pod polem jak w `plan-za-pozno` [M1-audytor-generalny-128]
          poTemperaturze={zaPozno ? null : oknoPlanu === null ? (
          // „Bez godzin snu” w Ustawieniach: plan bez sprawdzania nocy i informacja, gdzie je ustawić (BR-HARMO-002) [130]
          <Text style={styles.bezSnu}>{t('Plan nie sprawdza godzin snu. Możesz je ustawić w Ustawieniach.')}</Text>
        ) : (
          // Sleep Guard Banner: ukryty, dopóki trwa stan „za późno” (najpierw godzina, potem noc; §11c 107)
          // Żyto: kolizje z kroków żytnich, bez propozycji z planu pszennego (lodówka zmienia tam rozrost w formie) (030)
          <SleepGuardBanner
            hasSleepCollision={kolizjePlanu.length > 0}
            sleepCollisions={kolizjePlanu}
            suggestedActionPl={zytni ? undefined : schedule.suggestedActionPl}
            autoResolved={zytni ? null : autoResolved}
            onApplyAutoResolution={(hours) => setColdRetardHours(hours)}
            okno={oknoPlanu}
          />
        )}
        >
        {zaPozno ? (
          <PlanZaPozno
            tytul={zaPozno.tytul}
            tresc={zaPozno.tresc}
            onUstawNajwczesniej={zmianaGodziny(() => {
              if (stanCzasu.najwczesniejMs !== null) ustawGotowe(stanCzasu.najwczesniejMs);
            })}
          />
        ) : null}
        </TargetReadyCard>

        {/* Spirala i opis w jednym rzędzie z zawijaniem (`.kosz` w makiecie): „Start … o …” obok Spirali, nie pod paskiem
            kciuka; przy dużym tekście opis schodzi pod Spiralę [M1-audytor-generalny-128] */}
        <View style={styles.kosz}>
          <Spirala kroki={krokiSpirali} wariant="plan" etykieta={etykietaSpirali} />
          <ScheduleSummaryCard start={startPlanu} czasMin={czasPlanuMin} teraz={teraz} />
        </View>

        <TimelineStagesList
          stages={stages}
          formatTime={formatTime}
          formatDayBadge={formatDayBadge}
        />

        <UstawieniaPlanu
          okno={oknoPlanu}
          coldRetardHours={coldRetardHours}
          onColdRetardHoursChange={setColdRetardHours}
          onCopySchedule={handleCopySchedule}
          bezLodowki={zytni}
        />
        </BlokadaFunkcji>
      </ScrollView>
      <PasekStartu
        onStart={handleStartBakeOnWorkbench}
        powodBlokady={zaPozno ? t('Najpierw ustaw godzinę, na którą zdążysz.') : bezZakwasu}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  przewijane: {
    flex: 1,
  },
  bezSnu: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
    marginBottom: theme.spacing.md,
  },
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  kosz: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 14,
    marginBottom: theme.spacing.md,
  },
});
