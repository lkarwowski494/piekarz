import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { t } from '../src/lib/i18n';
import { przerwijSesjeWypieku } from '../src/lib/przerwij-wypiek';
import { tapHaptic } from '../src/lib/haptics';
import { useBakeSession } from '../src/hooks/useBakeSession';
import { useFinishBake } from '../src/hooks/useFinishBake';
import { zaczetyZDostepem } from '../src/data/bake-session-store';
import { ensureNotificationPermission, getNotificationPermission } from '../src/lib/notifications';
import { ZgodaPowiadomien } from '../src/components/stolnica/ZgodaPowiadomien';
import { SkladnikiKroku } from '../src/components/stolnica/SkladnikiKroku';
import { SleepGuardBanner } from '../src/components/harmonogram/SleepGuardBanner';
import { oknoSnu, useProfilSnu } from '../src/lib/godziny-snu';
import { kolizjeKrokow } from '../src/lib/plan-bez-nocy';
import { formatTime } from '../src/lib/format';
import { NotificationsOffBanner } from '../src/components/NotificationsOffBanner';
import { confirmDiscardBake } from '../src/lib/confirm';
import type { ActiveBakeState } from '../src/data/sqlite-store';
import { useUnitSystem } from '../src/lib/unit-converter';
import { notifyTimerFinished, notifySteamReleaseAlert } from '../src/lib/timer-audio';
import { DUTCH_OVEN_PHASES, DutchOvenBakePhase } from '../src/core/baking-phases';
import { SessionStep, isDutchOvenStep } from '../src/core/bake-steps';
import { BakeProgress, restoreTimerState, stepDurationSec, stepHasTimer } from '../src/core/bake-session';
import { StepUndo, canUndoConfirm, confirmStep, skokDoKroku, undoConfirm } from '../src/core/step-confirm';
import { poCoTenKrok } from '../src/core/po-co-ten-krok';
import { ostrzezeniaKroku } from '../src/core/ostrzezenia-kroku';
import { useAppAccess } from '../src/lib/app-access';
import { BlokadaFunkcji } from '../src/components/BlokadaFunkcji';
import { FinishBakeModal } from '../src/components/stolnica/FinishBakeModal';
import { StrefaKroku } from '../src/components/stolnica/StrefaKroku';
import { StolnicaKeepAwake } from '../src/components/stolnica/StolnicaKeepAwake';
import { PasekKciuka } from '../src/components/stolnica/PasekKciuka';
import { PlanWypiekuArkusz } from '../src/components/stolnica/PlanWypiekuArkusz';
import { PasekCofnij } from '../src/components/PasekCofnij';
import { PoCoTenKrokArkusz } from '../src/components/stolnica/PoCoTenKrokArkusz';
import { PrzyciskNaglowka } from '../src/components/nawigacja/PrzyciskNaglowka';
import { StrefaPlanu } from '../src/components/stolnica/StrefaPlanu';
import { useTekstyProwadzenia } from '../src/hooks/useTekstyProwadzenia';
import { czekaNaStart } from '../src/lib/prowadzenie-teksty';
import { styles } from '../src/components/stolnica/stolnica-screen.styles';

export default function StolnicaScreen() {
  const router = useRouter();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [recipeName, setRecipeName] = useState<string>(t('Wypiek bez receptury'));
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [activeBakeData, setActiveBakeData] = useState<ActiveBakeState | null>(null);
  const [planOpen, setPlanOpen] = useState<boolean>(false);
  const [poCoOpen, setPoCoOpen] = useState<boolean>(false);

  // Kroki z planu sesji; żyto: etapy roli 06 z czasami planu [M1-audytor-generalny-030]
  const [steps, setSteps] = useState<readonly SessionStep[]>([]);

  // Timer states
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [dutchOvenPhase, setDutchOvenPhase] = useState<DutchOvenBakePhase>('lid_on');

  // Apps4Craft Monetization & Access (Cheaper than espresso)
  const { blokada, chron } = useAppAccess();
  const unitSystem = useUnitSystem();

  const finish = useFinishBake({
    recipeName,
    startedAt,
    activeBakeData,
    onFinished: () => {
      setActiveBakeData(null);
      setIsActive(false);
      setCurrentStepIdx(0);
    },
    // Historię pokazuje Dziennik (czyta wpisy przy wejściu na zakładkę); Stolnica po zapisie wraca na Dziś
    loadHistory: async () => undefined,
    openDoctor: chron('doktor', () => router.push('/doktor')),
  });

  const endAtMsRef = useRef<number | null>(null);
  // Koniec zegara bieżącego kroku także po jego upływie: termin kroku dla „Zrobione” (BR-HARMO-005) [M1-audytor-generalny-102]
  const ostatniKoniecRef = useRef<number | null>(null);
  // Migawka do „Cofnij poprzedni” w pamięci ekranu (bez nowego pola w zapisie sesji) i pasek „Cofnięto …” z „Przywróć”
  const [undo, setUndo] = useState<StepUndo | null>(null);
  const [cofniete, setCofniete] = useState<{ nazwa: string; ponow: BakeProgress; undo: StepUndo } | null>(null);
  const ukryjCofniete = useCallback(() => setCofniete(null), []);

  // Czas kroku biegnie od planu, bez „Start”/„Wstrzymaj” (design-spec §11b „056”) [M1-audytor-generalny-056]
  const runFor = (sec: number) => {
    endAtMsRef.current = sec > 0 ? Date.now() + sec * 1000 : null;
    ostatniKoniecRef.current = endAtMsRef.current;
    setTimeLeftSec(sec);
    setIsRunning(sec > 0);
    setIsCompleted(false);
  };

  /** Postęp z ekranu na wejście logiki kroków (src/core/step-confirm.ts). */
  const postep = (): BakeProgress => ({
    steps, stepIdx: currentStepIdx, dutchOvenPhase, pausedLeftSec: null,
    timerEndsAt: isRunning || isCompleted ? ostatniKoniecRef.current : null,
  });

  /** Krok, plan i zegar z postępu; zegar stojący rusza sam. Zwraca, czy zegar ruszył od nowa. */
  const zastosuj = (p: BakeProgress): boolean => {
    setSteps(p.steps);
    setCurrentStepIdx(p.stepIdx);
    setDutchOvenPhase(p.dutchOvenPhase);
    const timer = restoreTimerState(p, Date.now());
    endAtMsRef.current = timer.isRunning ? p.timerEndsAt : null;
    ostatniKoniecRef.current = p.timerEndsAt;
    setTimeLeftSec(timer.timeLeftSec);
    setIsRunning(timer.isRunning);
    setIsCompleted(timer.isCompleted);
    const rusza = !timer.isRunning && !timer.isCompleted && timer.timeLeftSec > 0 && stepHasTimer(p.steps[p.stepIdx]);
    if (rusza) runFor(timer.timeLeftSec);
    return rusza;
  };

  // Prośba systemowa o zgodę dopiero po zdaniu „po co” (ZgodaPowiadomien); przy decyzji już podjętej tylko uzgodnienie
  const [zgodaOpen, setZgodaOpen] = useState(false);
  const zapytajOZgode = async () => {
    if ((await getNotificationPermission().catch(() => 'denied' as const)) === 'undetermined') setZgodaOpen(true);
    else void ensureNotificationPermission();
  };

  // Trwający wypiek w bazie: powrót do kroku i zegara po zabiciu procesu [M1-audytor-generalny-019]; zegar skończony
  // na pierwszym planie zostawia w zapisie termin kroku, żeby po powrocie było widać, o ile minął
  // (BR-ETAP-005 „Termin minął”) [M1-audytor-generalny-130]
  const sesjaWczytana = useBakeSession(
    isActive
      ? { version: 2, steps, stepIdx: currentStepIdx, dutchOvenPhase,
          timerEndsAt: isRunning ? endAtMsRef.current ?? Date.now() + timeLeftSec * 1000 : isCompleted ? ostatniKoniecRef.current : null,
          pausedLeftSec: isRunning || isCompleted ? null : timeLeftSec, recipeName, startedAt, bake: activeBakeData }
      : null,
    (s) => {
      setIsActive(true);
      setRecipeName(s.recipeName);
      setStartedAt(s.startedAt);
      setActiveBakeData(s.bake);
      // Zegar stojący (nowy wypiek albo zapis sprzed 056) rusza sam; zgoda na powiadomienia przy pierwszym zegarze (ADR-006),
      // najpierw zdanie „po co” (BR-CZAS-003) [M1-audytor-generalny-130]
      // Wypiek przed godziną startu planu (D-5): zgoda także wtedy, bo powiadomienie przyjdzie o starcie
      if (zastosuj(s) || czekaNaStart(s.steps, s.stepIdx, Date.now()) !== null) void zapytajOZgode();
    }
  );

  // Bez trwającego wypieku (koniec, przerwanie, powiadomienie po wypieku) Stolnica przekierowuje na Dziś:
  // wypiek zaczyna się z receptury, historia jest w Dzienniku (decyzja właściciela 2a) [M1-audytor-generalny-117]
  useEffect(() => {
    if (sesjaWczytana && !isActive) router.replace('/');
  }, [sesjaWczytana, isActive, router]);

  useEffect(() => {
    if (isRunning && endAtMsRef.current === null) {
      endAtMsRef.current = Date.now() + timeLeftSec * 1000;
    } else if (!isRunning) {
      endAtMsRef.current = null;
    }
  }, [isRunning, timeLeftSec]);

  // Timer countdown tick & background resilience (RD-ENG-06, NFR-PERF-004)
  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      if (!endAtMsRef.current) return;
      const left = Math.max(0, Math.ceil((endAtMsRef.current - Date.now()) / 1000));
      setTimeLeftSec(left);
      if (left <= 0) {
        endAtMsRef.current = null;
        setIsRunning(false);
        setIsCompleted(true);
        const step = steps[currentStepIdx];
        if (step && isDutchOvenStep(step) && dutchOvenPhase === 'lid_on') {
          void notifySteamReleaseAlert();
        } else if (step && isDutchOvenStep(step)) {
          void notifyTimerFinished(t('Wypiek w garnku zakończony. Wyjmij chleb na kratkę.'));
        } else {
          void notifyTimerFinished(t(step?.name ?? ''));
        }
      }
    };
    const interval = setInterval(tick, 1000);
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') tick();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [isRunning, currentStepIdx, dutchOvenPhase, steps]);

  const currentStep: SessionStep | undefined = steps[currentStepIdx];
  const aktywny = isActive && !!currentStep;
  // Wypiek zaczęty z dostępem prowadzi się do końca po wygaśnięciu: kroki, „Zrobione”, „Cofnij” i zapis wyniku
  // bez ekranu zakupu; nowy wypiek i „Piecz ponownie” zostają za strażnikiem (D-039) [M1-audytor-generalny-125]
  const blokadaWypieku = zaczetyZDostepem(activeBakeData) ? { ...blokada('stolnica'), odblokowane: true } : blokada('stolnica');
  // „Po co ten krok” z treści roli 06; krok bez źródła (KRO-POC-900) ma przycisk nieaktywny (100)
  const poCo = currentStep ? poCoTenKrok(currentStep, isDutchOvenStep(currentStep) ? dutchOvenPhase : undefined) : null;

  // Jump to or advance step
  const goToStep = (idx: number) => {
    if (idx < 0 || idx >= steps.length) return;
    // Wybrany krok od teraz, dalsze kroki i powiadomienia razem z nim [audyt-niezalezny D-8]
    const skok = skokDoKroku(postep(), idx, Date.now());
    setSteps(skok.steps);
    setCurrentStepIdx(idx);
    setDutchOvenPhase('lid_on');
    runFor(stepDurationSec(skok.steps[idx], 'lid_on'));
    setUndo(null);
    setCofniete(null);
    tapHaptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSwitchDutchOvenPhase = (phase: DutchOvenBakePhase) => {
    setDutchOvenPhase(phase);
    runFor(DUTCH_OVEN_PHASES[phase].durationMin * 60);
    tapHaptic(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStartPhase2AfterSteamAlert = () => {
    setDutchOvenPhase('lid_off');
    runFor(DUTCH_OVEN_PHASES.lid_off.durationMin * 60);
    void zapytajOZgode();
    tapHaptic(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // „Zrobione” przed terminem przesuwa dalsze kroki i powiadomienia wcześniej, po terminie — później (BR-HARMO-005)
  const handleNextStep = () => {
    if (currentStepIdx >= steps.length - 1) {
      finish.open();
      return;
    }
    const wynik = confirmStep(postep(), Date.now());
    zastosuj(wynik.progress);
    setUndo(wynik.undo);
    setCofniete(null);
    tapHaptic(Haptics.ImpactFeedbackStyle.Medium);
  };

  // „Cofnij poprzedni”: poprzedni krok, plan i zegar sprzed potwierdzenia; powiadomienia idą za planem (design-spec §5)
  const cofnijDostepne = undo !== null && canUndoConfirm(postep(), undo);
  const handleUndo = () => {
    if (!undo || !cofnijDostepne) return;
    const ponow = postep();
    const { progress } = undoConfirm(undo, Date.now());
    zastosuj(progress);
    setCofniete({ nazwa: t(progress.steps[progress.stepIdx]?.name ?? ''), ponow, undo });
    setUndo(null);
    tapHaptic(Haptics.ImpactFeedbackStyle.Light);
  };
  const handleRestore = () => {
    if (!cofniete) return;
    zastosuj(cofniete.ponow);
    setUndo(cofniete.undo);
    setCofniete(null);
  };

  // „Przerwij wypiek” na „Plan wypieku”: skutek dla danych jak dawne „Odrzuć wypiek” (056)
  const handleDiscard = () => {
    confirmDiscardBake(() => {
      setPlanOpen(false);
      // Pamięć, zapis sesji i powiadomienia: ta sama ścieżka co przerwanie przy starcie nowego wypieku w planie (a1b)
      void przerwijSesjeWypieku();
      setActiveBakeData(null);
      setIsActive(false);
      setCurrentStepIdx(0);
      setIsRunning(false);
    });
  };

  // Kroki czynne od bieżącego w oknie snu z Ustawień (po przesunięciu planu „Zrobione”); „Bez godzin snu” = brak
  const oknoProwadzenia = oknoSnu(useProfilSnu());
  const kolizjeNocy = oknoProwadzenia ? kolizjeKrokow(steps.slice(currentStepIdx), oknoProwadzenia, formatTime) : [];

  // „Gotowe {dzień} o {godzina}”, czas kroku, „do {godzina}, potem …”, „Ekran nie zgaśnie…” (makieta prowadzenia, 114)
  const teksty = useTekstyProwadzenia({ steps, stepIdx: currentStepIdx, dutchOvenPhase, koniecKrokuMs: ostatniKoniecRef.current, poCzasie: isCompleted });

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      {/* Nawigacja: „Dziś” (wstecz) · „Plan wypieku” w trwającym wypieku, inaczej skrót do Doktora (D-051 2a, §11b „056”) */}
      <Stack.Screen
        options={{
          headerRight: () =>
            aktywny ? (
              <PrzyciskNaglowka testID="bake-plan-btn" etykieta={t('Plan wypieku')} tekst={t('Plan wypieku')} onPress={() => setPlanOpen(true)} />
            ) : (
              <PrzyciskNaglowka testID="stolnica-doctor-shortcut-btn" etykieta={t('Doktor Chleba')} tekst={t('Doktor')} onPress={() => router.push('/doktor')} />
            ),
        }}
      />
      {/* Ekran nie gaśnie tylko w kroku czynnym; w biernym (chłodnia) gaśnie jak zwykle (BR-REKA-001) [M1-audytor-generalny-130] */}
      <StolnicaKeepAwake active={aktywny && !currentStep.isPassive && czekaNaStart(steps, currentStepIdx, Date.now()) === null} />
      <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        {/* Bez trwającego wypieku nic: ekran przekierowuje na Dziś [M1-audytor-generalny-117] */}
        {!aktywny ? null : (
          <BlokadaFunkcji {...blokadaWypieku}>
          <View>
            <NotificationsOffBanner />
            {/* Strefa planu: nazwa receptury, Spirala koszyka z planu tego wypieku (058), krok n z N */}
            <StrefaPlanu recipeName={recipeName} steps={steps} stepIdx={currentStepIdx} gotowe={teksty.gotowe} koniecKrokuMs={ostatniKoniecRef.current}
              pozostaloSec={stepHasTimer(currentStep) ? timeLeftSec : null} pelnySec={stepDurationSec(currentStep, dutchOvenPhase)} />

            {/* Strefa kroku: tytuł, czas do końca, treść, test palca, fazy garnka */}
            <StrefaKroku
              step={currentStep}
              formattedTime={teksty.czas?.tekst ?? ''}
              czasEtykieta={teksty.czas?.etykieta}
              potem={teksty.potem}
              ekran={teksty.ekran}
              unitSystem={unitSystem}
              dutchOvenPhase={dutchOvenPhase}
              isCompleted={isCompleted}
              onSwitchPhase={handleSwitchDutchOvenPhase}
              onStartPhase2AfterSteamAlert={handleStartPhase2AfterSteamAlert}
              ostrzezenia={ostrzezeniaKroku(steps, currentStepIdx, isDutchOvenStep(currentStep) ? dutchOvenPhase : undefined)}
            />
            {/* Krok czynny przesunięty w godziny snu z Ustawień: kolizja jak w planie (BR-HARMO-004, D-066 1a) [130] */}
            {kolizjeNocy.length > 0 && (
              <SleepGuardBanner hasSleepCollision sleepCollisions={kolizjeNocy} autoResolved={null} onApplyAutoResolution={() => {}} />
            )}
            {/* Składniki przy bieżącym kroku (BR-ETAP-001) [M1-audytor-generalny-130] */}
            <SkladnikiKroku steps={steps} stepIdx={currentStepIdx} calculatedRecipe={activeBakeData?.calculatedRecipe} unitSystem={unitSystem} />
          </View>
          </BlokadaFunkcji>
        )}

        {/* Arkusz oceny po ostatnim kroku */}
        <FinishBakeModal {...finish.modalProps} />

      </ScrollView>

      {aktywny && cofniete && (
        <PasekCofnij
          tekst={t('Cofnięto „{krok}”. Powiadomienia wróciły do poprzednich godzin.', { krok: cofniete.nazwa })}
          onPrzywroc={handleRestore}
          onUkryj={ukryjCofniete}
        />
      )}
      {aktywny && (
        <BlokadaFunkcji {...blokadaWypieku}>
          <PasekKciuka
            nazwaKroku={t(currentStep.name)}
            onZrobione={handleNextStep}
            onCofnij={handleUndo}
            cofnijDostepne={cofnijDostepne}
            onPoCo={() => setPoCoOpen(true)}
            poCoDostepne={poCo !== null}
          />
        </BlokadaFunkcji>
      )}
      {aktywny && (
        <ZgodaPowiadomien
          visible={zgodaOpen}
          onDalej={() => {
            setZgodaOpen(false);
            void ensureNotificationPermission();
          }}
        />
      )}
      {aktywny && (
        <PoCoTenKrokArkusz zdania={poCoOpen ? poCo : null} nazwaKroku={t(currentStep.name)} onClose={() => setPoCoOpen(false)} />
      )}
      {aktywny && (
        <PlanWypiekuArkusz
          visible={planOpen}
          onClose={() => setPlanOpen(false)}
          steps={steps}
          currentStepIdx={currentStepIdx}
          onGoToStep={goToStep}
          calculatedRecipe={activeBakeData?.calculatedRecipe}
          unitSystem={unitSystem}
          onPrzerwij={handleDiscard}
        />
      )}
    </SafeAreaView>
  );
}
