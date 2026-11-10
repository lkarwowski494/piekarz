import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PasZakladki, usePasekStanuJasny } from '../../../src/components/nawigacja/PasZakladki';
import { EkranZPasem } from '../../../src/components/nawigacja/EkranZPasem';
import { nazwaReceptury } from '../../../src/lib/nazwa-receptury';
import { t } from '../../../src/lib/i18n';
import {
  calculateReverseSchedule,
  autoResolveSleepCollision,
} from '../../../src/scheduler/reverse-scheduler';
import { withFridgeWake } from '../../../src/core/fridge-wake';
import { etapyPlanu } from '../../../src/lib/zakwas-planu';
import { useZakwasPlanu } from '../../../src/hooks/useZakwasPlanu';
import { ryeStepsEndingAt, stepsFromSchedule } from '../../../src/core/bake-steps';
import { copyScheduleToClipboard, planDoKopii } from '../../../src/lib/schedule-formatter';
import { recepturaPlanu, powodBezPlanu, odbierzDzienGotowe, TEMPERATURA_MODELU_PLANU_C } from '../../../src/lib/plan-receptury';
import { pieczenieDlaPlanu } from '../../../src/lib/pieczenie-planu';
import { krokiDrozdzoweKonczaceSie } from '../../../src/recipes/yeast-stages';
import { useUnitSystem } from '../../../src/lib/unit-converter';
import { formatTime as formatGodziny } from '../../../src/lib/format';
import { plakietkaDnia } from '../../../src/lib/plakietka-dnia';
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
import { godzinaPrzyOtwarciu, kolizjeKrokow } from '../../../src/lib/plan-bez-nocy';
import { PlanZaPozno } from '../../../src/components/harmonogram/PlanZaPozno';
import { atLocalTime } from '../../../src/core/dzien-lokalny';
import { przesunGotowe } from '../../../src/lib/godzina-gotowe';
import { Karta } from '../../../src/ui/karty/Karta';
import { IkonaKarty } from '../../../src/ui/karty/IkonaKarty';
import { NotatkiPlanu } from '../../../src/components/harmonogram/NotatkiPlanu';
import { styles } from '../../../src/components/harmonogram/harmonogram-styles';
const MINUTA_MS = 60_000;


export default function HarmonogramScreen() {
  // Pas marki zamiast nagłówka stosu (O3a, D-194; makieta wypiek.html#plan): powrót „Receptura”, tytuł, nazwa receptury
  const router = useRouter();
  const gora = useSafeAreaInsets().top;
  usePasekStanuJasny();
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

  // Pieczenie z danych receptury (D-304) [M1-audytor-generalny-008]
  const [pieczenie] = useState(() => pieczenieDlaPlanu(recepturaPlanu()));
  const opcje = { ambientTemperatureC: tempPlanu, coldRetardHours, sleepStartHour, sleepEndHour, pieczenie };
  const schedule = useMemo(() => calculateReverseSchedule(targetDate, opcje), [targetDate, tempPlanu, coldRetardHours, sleepStartHour, sleepEndHour]); // eslint-disable-line react-hooks/exhaustive-deps

  // Zakwas planu (wybrany na Zakwasach albo pierwszy); z lodówki: jedno dokarmienie 12 h przed mieszaniem
  // zamiast dokarmienia z planu (BR-ZAKW-006, D-052) [M1-audytor-generalny-104]
  const { zakwas, zakwasWczytany } = useZakwasPlanu();
  // Receptura żytnia z „Ułóż plan”: etapy żytnie z czasami planu, studzenie kończy się o godzinie „gotowe”;
  // te same kroki dostaje Stolnica (DEC-04 a) [M1-audytor-generalny-030; 03-zakres-501]
  // Wersja drożdżowa (D-155): kroki z yeast-stages.ts kończą się o „gotowe”, bez zakwasu i lodówki [M3 p9b]
  const [drozdzowa] = useState(() => (recepturaPlanu()?.wersja === 'drozdze' ? recepturaPlanu()?.recipeId ?? null : null));
  const [zytni] = useState(() => !drozdzowa && (recepturaPlanu()?.calculatedRecipe.isHighRye ?? false));
  const bezLodowki = zytni || drozdzowa !== null;
  // „Piecz ponownie” z Dziennika: notatka z poprzedniego wypieku nad planem (BR-RECP-003) [M1-audytor-generalny-146]
  const [notatkaPoprzednia] = useState(() => recepturaPlanu()?.notatka ?? null);
  // „Piecz ponownie” ze starego wpisu chałki albo bagietki: receptura bazowa ma teraz więcej drożdży (217) [M3 D3a]
  const [bazowaZmieniona] = useState(() => recepturaPlanu()?.bazowaZmieniona === true);
  // Receptura bez zakwasu (np. z „Piecz ponownie”): plan zakwasowy jej nie prowadzi, start nieaktywny z powodem (D-3)
  const [bezZakwasu] = useState(() => {
    const r = recepturaPlanu();
    return r ? powodBezPlanu(r.recipeFormula, r) : null;
  });
  const krokiDla = (plan: ReturnType<typeof calculateReverseSchedule>, celMs: number) => {
    if (drozdzowa) return krokiDrozdzoweKonczaceSie(drozdzowa, celMs) ?? [];
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
  // Rytm bez osiągalnego dnia w zasięgu D-108: bez propozycji i bez zdania [M3 TZ]
  const [rytmPoza, setRytmPoza] = useState(false);
  // Basic: „gotowe” = najwcześniejsza godzina (start teraz); do odczytu sklepu bez zmian [D-116]
  useEffect(() => {
    if (planWstecz || loading || stanCzasu.najwczesniejMs === null) return;
    if (celLokalny.ms !== stanCzasu.najwczesniejMs) ustawGotowe(stanCzasu.najwczesniejMs);
  }, [planWstecz, loading, stanCzasu.najwczesniejMs]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!godzinaDomyslna.current || !planWstecz) return;
    const okno = { startH: sleepStartHour, koniecH: sleepEndHour }; // „Bez godzin snu”: 0–0, żaden krok nie jest w nocy
    const kroki = (celMs: number) =>
      krokiDla(calculateReverseSchedule(new Date(celMs), opcje), celMs);
    // Dzień ze skrótu (BR-KAL-015) albo rytmu (BR-KAL-014) nie zmienia się po cichu (src/lib/plan-bez-nocy.ts) [M3 TZ]
    const z = godzinaPrzyOtwarciu({
      terazMs: Date.now(), najwczesniejMs: stanCzasu.najwczesniejMs, zaPozno: stanCzasu.zaPozno, krokiNaEkranie: steps, kroki, okno,
      skrot: zeSkrotu, rytm: rytm && !rytmPoza ? rytm.offset : null, hour: targetHour, minute: targetMinute,
    });
    if (z.rytmPoza) setRytmPoza(true);
    if (z.celMs !== undefined) ustawGotowe(z.celMs);
    else if (z.dzien !== undefined && z.dzien !== targetDayOffset) setTargetDayOffset(z.dzien);
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
    return autoResolveSleepCollision(targetDate, opcje);
  }, [schedule.hasSleepCollision, targetDate, tempPlanu, coldRetardHours, sleepStartHour, sleepEndHour]); // eslint-disable-line react-hooks/exhaustive-deps

  // ±30 min do pełnej lub połówkowej godziny, ±2 h wprost; przez północ zmienia się dzień (src/lib/godzina-gotowe.ts) [128, N1]
  const adjustTargetTime = (deltaMinutes: number) => {
    const nowy = przesunGotowe({ dayOffset: targetDayOffset, hour: targetHour, minute: targetMinute }, deltaMinutes);
    if (!nowy) return;
    setTargetDayOffset(nowy.dayOffset);
    setTargetHour(nowy.hour);
    setTargetMinute(nowy.minute);
  };

  // Godzina w formacie regionu (PL 24 h, en-US 12 h; design-spec §7) [M1-audytor-generalny-096]
  const formatTime = (d: Date) => formatGodziny(d);

  // Dzień kroku względem dziś: „Dziś”, „Jutro”, „Pojutrze”, „Wczoraj” albo dzień tygodnia z datą (src/lib/plakietka-dnia.ts)
  const formatDayBadge = (d: Date) => plakietkaDnia(d, new Date());

  // „Zacznij wypiek” (migawka planu na Stolnicę, pytanie D-104) i „Zaplanuj” (BR-KAL-009, D-108): src/hooks/useStartPlanu.ts
  const { zacznij, zaplanuj } = useStartPlanu({ steps, zakwas: drozdzowa ? null : zakwas, ambientTemp: tempPlanu, tempWybrana: zTemperatura && tempWybrana, zablokowany: !!zaPozno || !!bezZakwasu, requireActionAccess, moze });

  const handleCopySchedule = async () => {
    // Kopia z planu na ekranie: etapy `stages` (żytnie z kroków) i kolizje tych kroków [M1-audytor-generalny-197]
    await copyScheduleToClipboard(planDoKopii(schedule, stages, kolizjePlanu), {
      ambientTempC: tempPlanu,
      // Plan żytni nie ma garowania chłodniczego (rozrost w formie), więc bez tej linii
      ...(bezLodowki ? {} : { coldRetardHours }),
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
      {/* Ekran z pasem i czapką paska stanu (README §2, 04-001) [M3 p7] */}
      <EkranZPasem gora={gora} tytul={t('Plan wypieku')} style={styles.przewijane} pas={(onLayout) => (
        <PasZakladki gora={gora} tytul={t('Plan wypieku')} podtytul={recepturaPlanu() ? nazwaReceptury(recepturaPlanu()?.recipeName ?? '') : undefined}
          wstecz={{ tekst: t('Receptura'), onPress: () => router.back() }} onLayout={onLayout} />
      )}>
        <View style={styles.container}>
        {/* Z „Piecz ponownie”: notatka i zmiana receptury bazowej w karcie (src/components/harmonogram/NotatkiPlanu.tsx) */}
        <NotatkiPlanu notatka={notatkaPoprzednia} bazowaZmieniona={bazowaZmieniona} />
        {/* „Kiedy chleb ma być gotowy?”, temperatura i noc: plan wstecz w Pro; w Basic karta pokazuje plan od teraz,
            a dotknięcie otwiera ekran Pro (BlokadaFunkcji, [M1-audytor-generalny-027]) */}
        <BlokadaFunkcji {...blokada('plan-wstecz')} podglad>
        <TargetReadyCard
          targetDayOffset={targetDayOffset}
          onTargetDayOffsetChange={zmianaGodziny(setTargetDayOffset)}
          targetHour={targetHour}
          targetMinute={targetMinute}
          onAdjustTargetTime={zmianaGodziny(adjustTargetTime)}
          formattedDayBadge={formatDayBadge(targetDate)}
          podpowiedz={moze('rytm') && !rytmPoza ? rytm?.tekst : undefined}
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
          <Karta testID="karta-snu" tytul={t('Godziny snu')} ikona={<IkonaKarty nazwa="zegar" />}>
            <Text style={styles.bezSnu}>{t('Plan nie sprawdza godzin snu. Możesz je ustawić w Ustawieniach.')}</Text>
          </Karta>
        ) : (
          // Sleep Guard Banner: ukryty, dopóki trwa stan „za późno” (najpierw godzina, potem noc; §11c 107)
          // Żyto: kolizje z kroków żytnich, bez propozycji z planu pszennego (lodówka zmienia tam rozrost w formie) (030)
          <SleepGuardBanner
            hasSleepCollision={kolizjePlanu.length > 0}
            sleepCollisions={kolizjePlanu}
            suggestedActionPl={bezLodowki ? undefined : schedule.suggestedActionPl}
            autoResolved={bezLodowki ? null : autoResolved}
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
        <TimelineStagesList stages={stages} formatTime={formatTime} formatDayBadge={formatDayBadge}>
          <View style={styles.kosz}>
            <Spirala kroki={krokiSpirali} wariant="plan" etykieta={etykietaSpirali} />
            <ScheduleSummaryCard start={startPlanu} czasMin={czasPlanuMin} teraz={teraz} />
          </View>
        </TimelineStagesList>

        <UstawieniaPlanu
          okno={oknoPlanu}
          coldRetardHours={coldRetardHours}
          onColdRetardHoursChange={setColdRetardHours}
          onCopySchedule={bezZakwasu ? undefined : handleCopySchedule}
          bezLodowki={bezLodowki}
        >
          {/* Plan w kalendarzu telefonu jako plik .ics (BR-KAL-011); bez kroków („za późno”) i bez planu (089) nic [M3 D8] */}
          <DodajDoKalendarza
            plan={startPlanu === null || bezZakwasu ? null : { id: `plan_${startPlanu.getTime()}`, nazwa: recepturaPlanu()?.recipeName ?? t('Klasyczny chleb rzemieślniczy'), kroki: steps }}
          />
        </UstawieniaPlanu>
        </View>
      </EkranZPasem>
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
