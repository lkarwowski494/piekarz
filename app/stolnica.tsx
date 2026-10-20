import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { t } from '../src/lib/i18n';
import { tapHaptic } from '../src/lib/haptics';
import { useBakeSession } from '../src/hooks/useBakeSession';
import { useFinishBake } from '../src/hooks/useFinishBake';
import { saveBakeSession } from '../src/data/bake-session-store';
import { resyncNotifications, ensureNotificationPermission } from '../src/lib/notifications';
import { NotificationsOffBanner } from '../src/components/NotificationsOffBanner';
import { confirmDiscardBake } from '../src/lib/confirm';
import {
  setActiveBake,
  ActiveBakeState,
  getBakingVessel,
  setBakingVessel,
  BakingVessel,
} from '../src/data/sqlite-store';
import { useUnitSystem, formatTextUnits } from '../src/lib/unit-converter';
import { notifyTimerFinished, notifySteamReleaseAlert } from '../src/lib/timer-audio';
import { DUTCH_OVEN_PHASES, DutchOvenBakePhase } from '../src/core/baking-phases';
import { SessionStep, isDutchOvenStep, planBakeSteps } from '../src/core/bake-steps';
import { BakeProgress, restoreTimerState, stepDurationSec, stepHasTimer } from '../src/core/bake-session';
import { StepUndo, canUndoConfirm, confirmStep, undoConfirm } from '../src/core/step-confirm';
import { useBakeHistory } from '../src/hooks/useBakeHistory';
import { useAppAccess } from '../src/lib/app-access';
import { BlokadaFunkcji } from '../src/components/BlokadaFunkcji';
import { FinishBakeModal } from '../src/components/stolnica/FinishBakeModal';
import { PokeTestEntry } from '../src/components/stolnica/PokeTestEntry';
import { DutchOvenController } from '../src/components/stolnica/DutchOvenController';
import { BakeStatsCard } from '../src/components/stolnica/BakeStatsCard';
import { BakeHistorySection } from '../src/components/stolnica/BakeHistorySection';
import { IdleBakeCard } from '../src/components/stolnica/IdleBakeCard';
import { StolnicaKeepAwake } from '../src/components/stolnica/StolnicaKeepAwake';
import { PasekKciuka } from '../src/components/stolnica/PasekKciuka';
import { PlanWypiekuArkusz } from '../src/components/stolnica/PlanWypiekuArkusz';
import { PasekCofnij } from '../src/components/PasekCofnij';
import { PrzyciskNaglowka } from '../src/components/nawigacja/PrzyciskNaglowka';
import { SpiralaWypieku } from '../src/components/Spirala';
import { styles } from '../src/components/stolnica/stolnica-screen.styles';

export default function StolnicaScreen() {
  const router = useRouter();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [recipeName, setRecipeName] = useState<string>(t('Wypiek bez receptury'));
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [activeBakeData, setActiveBakeData] = useState<ActiveBakeState | null>(null);
  const [bakingVessel, setBakingVesselState] = useState<BakingVessel>('dutch_oven');
  const [planOpen, setPlanOpen] = useState<boolean>(false);

  const handleSelectVessel = (vessel: BakingVessel) => {
    void setBakingVessel(vessel);
    setBakingVesselState(vessel);
    tapHaptic(Haptics.ImpactFeedbackStyle.Light);
  };

  // Kroki z planu sesji; żyto: etapy roli 06 z czasami planu [M1-audytor-generalny-030]
  const [steps, setSteps] = useState<readonly SessionStep[]>([]);

  // Timer states
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [dutchOvenPhase, setDutchOvenPhase] = useState<DutchOvenBakePhase>('lid_on');

  // Apps4Craft Monetization & Access (Cheaper than espresso)
  const {
    blokada,
    chron,
    requireActionAccess,
  } = useAppAccess();
  const unitSystem = useUnitSystem();

  const {
    bakeHistory,
    bakeStats,
    filteredHistory,
    selectedTasteFilter,
    setSelectedTasteFilter,
    loadHistory,
    handleBakeAgain,
    handleDeleteBakeLog,
  } = useBakeHistory(requireActionAccess);

  const finish = useFinishBake({
    recipeName,
    startedAt,
    activeBakeData,
    onFinished: () => {
      setActiveBakeData(null);
      setIsActive(false);
      setCurrentStepIdx(0);
    },
    loadHistory,
    openDoctor: chron('doktor', () => router.push('/doktor')),
  });

  useEffect(() => {
    void getBakingVessel().then((v) => {
      setBakingVesselState(v);
    });
  }, []);

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

  // Trwający wypiek w bazie: powrót do kroku i zegara po zabiciu procesu [M1-audytor-generalny-019]
  useBakeSession(
    isActive
      ? { version: 2, steps, stepIdx: currentStepIdx, dutchOvenPhase,
          timerEndsAt: isRunning ? endAtMsRef.current ?? Date.now() + timeLeftSec * 1000 : null,
          pausedLeftSec: isRunning ? null : timeLeftSec, recipeName, startedAt, bake: activeBakeData }
      : null,
    (s) => {
      setIsActive(true);
      setRecipeName(s.recipeName);
      setStartedAt(s.startedAt);
      setActiveBakeData(s.bake);
      // Zegar stojący (nowy wypiek albo zapis sprzed 056) rusza sam; zgoda na powiadomienia przy pierwszym zegarze (ADR-006)
      if (zastosuj(s)) void ensureNotificationPermission();
    }
  );

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
          void notifyTimerFinished(t('Wypiek w garnku zakończony! Wyjmij chleb na kratkę.'));
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

  // Start new bake from idle: domyślny chleb pszenny z planu liczonego od teraz [M1-audytor-generalny-030]
  const handleStartBake = () => {
    requireActionAccess(() => {
      const now = Date.now();
      const planned = planBakeSteps({ startAt: now, isHighRye: false });
      setSteps(planned);
      setIsActive(true);
      setCurrentStepIdx(0);
      setStartedAt(now);
      setDutchOvenPhase('lid_on');
      runFor(stepDurationSec(planned[0], 'lid_on'));
      void ensureNotificationPermission(); // zgoda przy pierwszym zegarze (ADR-006)
    });
  };

  // Jump to or advance step
  const goToStep = (idx: number) => {
    if (idx < 0 || idx >= steps.length) return;
    setCurrentStepIdx(idx);
    setDutchOvenPhase('lid_on');
    runFor(stepDurationSec(steps[idx], 'lid_on'));
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
    void ensureNotificationPermission();
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
      setActiveBake(null);
      void saveBakeSession(null).then(() => resyncNotifications()).catch(() => {});
      setActiveBakeData(null);
      setIsActive(false);
      setCurrentStepIdx(0);
      setIsRunning(false);
    });
  };

  // Format time remaining
  const formattedTime = useMemo(() => {
    const hours = Math.floor(timeLeftSec / 3600);
    const minutes = Math.floor((timeLeftSec % 3600) / 60);
    const seconds = timeLeftSec % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [timeLeftSec]);

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
      <StolnicaKeepAwake active={isActive} />
      <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        {!aktywny ? (
          <View>
            {/* Bez uprawnienia: tylko przegląd historii (BEZ_UPRAWNIENIA) [M1-audytor-generalny-027] */}
            <BlokadaFunkcji {...blokada('stolnica')}>
            <IdleBakeCard
              bakingVessel={bakingVessel}
              onSelectVessel={handleSelectVessel}
              onStartBake={handleStartBake}
            />
            </BlokadaFunkcji>

            {/* History of Bakes & Artisan Statistics */}
            <BlokadaFunkcji {...blokada('historia')}>
            {bakeHistory.length > 0 && <BakeStatsCard stats={bakeStats} />}
            <BakeHistorySection
              bakeHistory={bakeHistory}
              selectedTasteFilter={selectedTasteFilter}
              onSelectTasteFilter={setSelectedTasteFilter}
              filteredHistory={filteredHistory}
              onDeleteBakeLog={handleDeleteBakeLog}
              onBakeAgain={handleBakeAgain}
            />
            </BlokadaFunkcji>
          </View>
        ) : (
          <BlokadaFunkcji {...blokada('stolnica')}>
          <View>
            <NotificationsOffBanner />
            {/* Strefa planu: nazwa receptury, Spirala koszyka z planu tego wypieku (058), krok n z N */}
            <Text style={styles.recipeTag}>{recipeName}</Text>
            <SpiralaWypieku steps={steps} stepIdx={currentStepIdx} pozostaloSec={stepHasTimer(currentStep) ? timeLeftSec : null}
              pelnySec={stepDurationSec(currentStep, dutchOvenPhase)} />
            <Text style={styles.krokNzN}>{t('Krok {n} z {m}', { n: currentStepIdx + 1, m: steps.length })}</Text>

            {/* Strefa kroku: tytuł, czas do końca (etap żytni bez czasu w planie idzie bez minutnika, 030), treść */}
            <Text testID="step-title" style={styles.activeStepTitle}>{t(currentStep.name)}</Text>
            {stepHasTimer(currentStep) && <Text testID="step-time" style={styles.czas}>{formattedTime}</Text>}
            <Text style={styles.activeStepDesc}>{formatTextUnits(t(currentStep.instructions), unitSystem)}</Text>
            <PokeTestEntry step={currentStep} />

            {/* Dutch Oven Two-Phase Controller for the bake step */}
            {isDutchOvenStep(currentStep) && (
              <DutchOvenController
                dutchOvenPhase={dutchOvenPhase}
                onSwitchPhase={handleSwitchDutchOvenPhase}
                unitSystem={unitSystem}
                isCompleted={isCompleted}
                onStartPhase2AfterSteamAlert={handleStartPhase2AfterSteamAlert}
              />
            )}
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
        <BlokadaFunkcji {...blokada('stolnica')}>
          <PasekKciuka
            nazwaKroku={t(currentStep.name)}
            onZrobione={handleNextStep}
            onCofnij={handleUndo}
            cofnijDostepne={cofnijDostepne}
            onPoCo={() => undefined}
            poCoDostepne={false}
          />
        </BlokadaFunkcji>
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
