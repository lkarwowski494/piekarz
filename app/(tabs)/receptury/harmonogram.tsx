import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../src/ui/theme';
import { t } from '../../../src/lib/i18n';
import {
  calculateReverseSchedule,
  autoResolveSleepCollision,
} from '../../../src/scheduler/reverse-scheduler';
import { getStarters } from '../../../src/data/sqlite-store';
import type { StoredStarter } from '../../../src/data/db';
import { withFridgeWake } from '../../../src/core/fridge-wake';
import { zakwasPlanu, etapyPlanu } from '../../../src/lib/zakwas-planu';
import { ryeStepsEndingAt, stepsFromSchedule } from '../../../src/core/bake-steps';
import { copyScheduleToClipboard, planDoKopii } from '../../../src/lib/schedule-formatter';
import { recepturaPlanu, powodBezZakwasu, odbierzDzienGotowe, TEMPERATURA_MODELU_PLANU_C } from '../../../src/lib/plan-receptury';
import { useUnitSystem } from '../../../src/lib/unit-converter';
import { formatTime as formatGodziny, formatDzienData } from '../../../src/lib/format';
import { useAppAccess } from '../../../src/lib/app-access';
import { useStartPlanu } from '../../../src/hooks/useStartPlanu';
import { BlokadaFunkcji } from '../../../src/components/BlokadaFunkcji';
import { TargetReadyCard } from '../../../src/components/harmonogram/TargetReadyCard';
import { useRytmPlanu } from '../../../src/hooks/useRytmPlanu';
import { SleepGuardBanner } from '../../../src/components/harmonogram/SleepGuardBanner';
import { ScheduleSummaryCard } from '../../../src/components/harmonogram/ScheduleSummaryCard';
import { TimelineStagesList } from '../../../src/components/harmonogram/TimelineStagesList';
import { UstawieniaPlanu } from '../../../src/components/harmonogram/UstawieniaPlanu';
import { DodajDoKalendarza } from '../../../src/components/harmonogram/DodajDoKalendarza';
import { oknoSnu, useProfilSnu } from '../../../src/lib/godziny-snu';
import { PasekStartu } from '../../../src/components/harmonogram/PasekStartu';
import { Spirala } from '../../../src/components/Spirala';
import { krokiSpiraliZSesji } from '../../../src/lib/spirala-geometria';
import { etykietaPlanuPrzedStartem } from '../../../src/lib/spirala-etykieta';
import { celGotowosci, stanZaPozno, tekstZaPozno } from '../../../src/lib/plan-za-pozno';
import { godzinaBezNocy, kolizjeKrokow, krokCzynnyWNocy } from '../../../src/lib/plan-bez-nocy';
import { PlanZaPozno } from '../../../src/components/harmonogram/PlanZaPozno';
import { atLocalTime } from '../../../src/core/dzien-lokalny';

import { typografia } from '../../../src/ui/tokeny';
const MINUTA_MS = 60_000;


export default function HarmonogramScreen() {
  const unitSystem = useUnitSystem();

  // Dzień „gotowe”: 0 = dziś … ZASIEG_DNI_PLANU (D-108); ze skrótu arkusza dnia dzień z kalendarza (BR-KAL-015),
  // inaczej jutro [M3 D5]
  const [zeSkrotu] = useState(() => odbierzDzienGotowe(Date.now()));
  const [targetDayOffset, setTargetDayOffset] = useState<number>(zeSkrotu ?? 1);
  // Bez skrótu: propozycja dnia z rytmu Dziennika (BR-KAL-014), którą użytkownik zmienia jak każdy dzień [M3 D7]
  const { rytm, wczytany: rytmWczytany } = useRytmPlanu(zeSkrotu === null, recepturaPlanu()?.recipeId);
  const [targetHour, setTargetHour] = useState<number>(10);
  const [targetMinute, setTargetMinute] = useState<number>(0);

  // Baking environment
  // 23 °C to założenie modelu planu, nie pomiar: do wypieku i dziennika trafia tylko temperatura wybrana
  // przez użytkownika [M1-audytor-generalny-017; 08-programista-005]. Z „Ułóż plan”: temperatura kuchni z receptury,
  // ta sama liczba co w arkuszu „Temperatura wody” [audyt-niezalezny D-4]
  const [ambientTemp, setAmbientTemp] = useState<number>(() => recepturaPlanu()?.temperaturaKuchni?.c ?? TEMPERATURA_MODELU_PLANU_C);
  const [tempWybrana, setTempWybrana] = useState(() => recepturaPlanu()?.temperaturaKuchni?.wybrana ?? false);
  const [coldRetardHours, setColdRetardHours] = useState<number>(14.0);

  // Godziny snu z Ustawień (D-066 1a, BR-HARMO-002); „Bez godzin snu” = okno puste (0–0), plan nie sprawdza nocy
  // [M1-audytor-generalny-130]
  const oknoPlanu = oknoSnu(useProfilSnu());
  const sleepStartHour = oknoPlanu?.startH ?? 0;
  const sleepEndHour = oknoPlanu?.koniecH ?? 0;

  // Target Date object. W dniu wiosennej zmiany czasu godziny z luki (02:30) nie ma: chwila wypada po luce (03:30), plan
  // i powiadomienia kończą się o niej, a karta mówi o tym (`shifted`; D-13, D-093)
  const celLokalny = useMemo(() => atLocalTime(Date.now(), targetDayOffset, targetHour, targetMinute), [targetDayOffset, targetHour, targetMinute]);
  const targetDate = useMemo(() => new Date(celLokalny.ms), [celLokalny]);

  // Basic: plan od teraz (PR-02), BR-HARMO-004; Pro: „gotowe o…” (BR-HARMO-001…003), rytm, „Zaplanuj” [D-116]
  const { blokada, requireActionAccess, moze, loading } = useAppAccess();
  const planWstecz = moze('plan-wstecz');
  // Czas z temperatury kuchni (BR-HARMO-003) w Pro; w Basic temperatura modelu [M3 P-a-fix P2-1]
  const zTemperatura = planWstecz || loading;
  const tempPlanu = zTemperatura ? ambientTemp : TEMPERATURA_MODELU_PLANU_C;

  // Reverse schedule calculation
  const schedule = useMemo(() => {
    return calculateReverseSchedule(targetDate, {
      ambientTemperatureC: tempPlanu,
      coldRetardHours,
      sleepStartHour,
      sleepEndHour,
    });
  }, [targetDate, tempPlanu, coldRetardHours, sleepStartHour, sleepEndHour]);

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
  // „Piecz ponownie” ze starego wpisu chałki albo bagietki: receptura bazowa ma teraz więcej drożdży (217) [M3 D3a]
  const [bazowaZmieniona] = useState(() => recepturaPlanu()?.bazowaZmieniona === true);
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
  // Dzień z rytmu przychodzi po odczycie Dziennika; tylko póki użytkownik nie zmienił dnia ani godziny [M3 D7]
  useEffect(() => {
    if (rytm && godzinaDomyslna.current && moze('rytm')) setTargetDayOffset(rytm.offset);
  }, [rytm, moze]);
  const dzienZalozony = zeSkrotu ?? rytm?.offset ?? null;
  // Basic: „gotowe” = najwcześniejsza godzina (start teraz); do odczytu sklepu bez zmian [D-116]
  useEffect(() => {
    if (planWstecz || loading || stanCzasu.najwczesniejMs === null) return;
    if (celLokalny.ms !== stanCzasu.najwczesniejMs) ustawGotowe(stanCzasu.najwczesniejMs);
  }, [planWstecz, loading, stanCzasu.najwczesniejMs]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!godzinaDomyslna.current || !planWstecz) return;
    const okno = { startH: sleepStartHour, koniecH: sleepEndHour }; // „Bez godzin snu”: 0–0, żaden krok nie jest w nocy
    if (stanCzasu.najwczesniejMs !== null && (stanCzasu.zaPozno || krokCzynnyWNocy(steps, okno))) {
      const kroki = (celMs: number) =>
        krokiDla(calculateReverseSchedule(new Date(celMs), { ambientTemperatureC: tempPlanu, coldRetardHours, sleepStartHour, sleepEndHour }), celMs);
      // Dzień ze skrótu arkusza dnia (BR-KAL-015) albo z rytmu (BR-KAL-014) zostaje: godzina bez nocy od początku tego dnia [M3 D5, D7]
      const od = dzienZalozony === null ? stanCzasu.najwczesniejMs : Math.max(stanCzasu.najwczesniejMs, atLocalTime(Date.now(), dzienZalozony, 0, 0).ms);
      const bezNocy = godzinaBezNocy(od, kroki, okno);
      if (bezNocy !== null) ustawGotowe(bezNocy);
      else if (stanCzasu.zaPozno) ustawGotowe(stanCzasu.najwczesniejMs);
    }
    if (zakwasWczytany && rytmWczytany) godzinaDomyslna.current = false;
  }, [stanCzasu, zakwasWczytany, rytmWczytany, planWstecz]); // eslint-disable-line react-hooks/exhaustive-deps
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
      ambientTemperatureC: tempPlanu,
      coldRetardHours,
      sleepStartHour,
      sleepEndHour,
    });
  }, [schedule.hasSleepCollision, targetDate, tempPlanu, coldRetardHours, sleepStartHour, sleepEndHour]);

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
    // dzień tygodnia z datą przez Intl w języku aplikacji [audyt-niezalezny F-5]
    return formatDzienData(d);
  };

  // „Zacznij wypiek” (migawka planu na Stolnicę, pytanie D-104) i „Zaplanuj” (BR-KAL-009, D-108): src/hooks/useStartPlanu.ts
  const { zacznij, zaplanuj } = useStartPlanu({ steps, zakwas, ambientTemp: tempPlanu, tempWybrana: zTemperatura && tempWybrana, zablokowany: !!zaPozno || !!bezZakwasu, requireActionAccess });

  const handleCopySchedule = async () => {
    // Kopia z planu na ekranie: etapy `stages` (żytnie z kroków) i kolizje tych kroków [M1-audytor-generalny-197]
    await copyScheduleToClipboard(planDoKopii(schedule, stages, kolizjePlanu), {
      ambientTempC: tempPlanu,
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
        {notatkaPoprzednia ? (
          <Text style={styles.bezSnu} testID="plan-notatka-poprzednia">
            {t('Notatka z poprzedniego wypieku: {notatka}', { notatka: notatkaPoprzednia })}
          </Text>
        ) : null}
        {bazowaZmieniona ? (
          <Text style={styles.bezSnu} testID="plan-bazowa-zmieniona">
            {t('Receptura bazowa zmieniła się od tamtego wypieku: ma teraz więcej drożdży.')}
          </Text>
        ) : null}
        {/* „Kiedy chleb ma być gotowy?”, temperatura i noc: plan wstecz w Pro; w Basic karta pokazuje plan od teraz,
            a dotknięcie otwiera ekran Pro (BlokadaFunkcji, [M1-audytor-generalny-027]) */}
        <BlokadaFunkcji {...blokada('plan-wstecz')}>
        <TargetReadyCard
          targetDayOffset={targetDayOffset}
          onTargetDayOffsetChange={zmianaGodziny(setTargetDayOffset)}
          targetHour={targetHour}
          targetMinute={targetMinute}
          onAdjustTargetTime={zmianaGodziny(adjustTargetTime)}
          formattedDayBadge={formatDayBadge(targetDate)}
          podpowiedz={moze('rytm') ? rytm?.tekst : undefined}
          faktycznaGodzina={targetDate}
          zmianaCzasu={celLokalny.shifted}
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
        </BlokadaFunkcji>

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
        {/* Plan w kalendarzu telefonu jako plik .ics (BR-KAL-011); bez kroków do zrobienia („za późno”) nie ma czego dodać [M3 D8] */}
        <DodajDoKalendarza
          plan={startPlanu === null ? null : { id: `plan_${startPlanu.getTime()}`, nazwa: recepturaPlanu()?.recipeName ?? t('Klasyczny chleb rzemieślniczy'), kroki: steps }}
        />
      </ScrollView>
      <PasekStartu
        onStart={zacznij}
        powodBlokady={zaPozno ? t('Najpierw ustaw godzinę, na którą zdążysz.') : bezZakwasu}
        // Start w przyszłości: plan można zapisać na później (BR-KAL-009) [M3 D5]; w Basic plan zaczyna się teraz,
        // więc „Zaplanuj” pojawia się tylko z planem wstecz (Pro)
        onZaplanuj={planWstecz && startPlanu !== null && startPlanu.getTime() > teraz ? zaplanuj : undefined}
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
