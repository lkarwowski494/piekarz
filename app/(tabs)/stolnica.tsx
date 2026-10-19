import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import { guardSave } from '../../src/lib/save-guard';
import { tapHaptic } from '../../src/lib/haptics';
import { useBakeSession } from '../../src/hooks/useBakeSession';
import { saveBakeSession } from '../../src/data/bake-session-store';
import { resyncNotifications, ensureNotificationPermission } from '../../src/lib/notifications';
import { NotificationsOffBanner } from '../../src/components/NotificationsOffBanner';
import { confirmDiscardBake, confirmDeleteBakeLog } from '../../src/lib/confirm';
import {
  finishBake,
  getBakeLogs,
  deleteBakeLog,
  setActiveBake,
  ActiveBakeState,
  getRecipes,
  getBakingVessel,
  setBakingVessel,
  BakingVessel,
} from '../../src/data/sqlite-store';
import {
  CraftHeader,
  sharedCraftTokens,
} from '@apps4craft/ui';
import { useUnitSystem, formatTextUnits } from '../../src/lib/unit-converter';
import { StoredBakeLog } from '../../src/data/db';
import { setPendingRecipeToLoad, prepareBakeAgainRecipe } from '../../src/lib/recipe-navigation';
import { BreadSensoryProfile, DEFAULT_BREAD_SENSORY_PROFILE } from '../../src/components/SensoryRadarChart';
import { notifyTimerFinished, notifySteamReleaseAlert } from '../../src/lib/timer-audio';
import { DUTCH_OVEN_PHASES, DutchOvenBakePhase } from '../../src/core/baking-phases';
import { SessionStep, isDutchOvenStep, planBakeSteps } from '../../src/core/bake-steps';
import { stepDurationSec, stepHasTimer } from '../../src/core/bake-session';
import { calculateBakeStatistics, filterBakeLogs } from '../../src/core/bake-statistics';
import { useAppAccess } from '../../src/lib/app-access';
import { BlokadaFunkcji } from '../../src/components/BlokadaFunkcji';
import { suggestDoctorAfterRating } from '../../src/lib/doctor-suggestion';
import { FinishBakeModal } from '../../src/components/stolnica/FinishBakeModal';
import { DutchOvenController } from '../../src/components/stolnica/DutchOvenController';
import { ActiveTimerDisplay } from '../../src/components/stolnica/ActiveTimerDisplay';
import { BakeStatsCard } from '../../src/components/stolnica/BakeStatsCard';
import { BakeHistorySection } from '../../src/components/stolnica/BakeHistorySection';
import { BakeStepsList } from '../../src/components/stolnica/BakeStepsList';
import { StolnicaSacredCard } from '../../src/components/stolnica/StolnicaSacredCard';
import { IdleBakeCard } from '../../src/components/stolnica/IdleBakeCard';
import { styles } from '../../src/components/stolnica/stolnica-screen.styles';

export default function StolnicaScreen() {
  // Prevent screen sleep while in Stolnica
  useKeepAwake();
  const router = useRouter();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [recipeName, setRecipeName] = useState<string>(t('Wypiek bez receptury'));
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [activeBakeData, setActiveBakeData] = useState<ActiveBakeState | null>(null);
  const [bakingVessel, setBakingVesselState] = useState<BakingVessel>('dutch_oven');

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

  // Finish Bake Modal & History
  const [isFinishModalOpen, setIsFinishModalOpen] = useState<boolean>(false);
  const [finishRating, setFinishRating] = useState<number>(5);
  const [finishNotes, setFinishNotes] = useState<string>('');
  const [finishCrumbScore, setFinishCrumbScore] = useState<number>(3);
  const [finishCrustScore, setFinishCrustScore] = useState<number>(3);
  const [finishTasteProfile, setFinishTasteProfile] = useState<'mild' | 'balanced' | 'sour' | 'tangy'>('balanced');
  const [finishSensoryProfile, setFinishSensoryProfile] = useState<BreadSensoryProfile>(DEFAULT_BREAD_SENSORY_PROFILE);
  const [bakeHistory, setBakeHistory] = useState<StoredBakeLog[]>([]);
  const [selectedTasteFilter, setSelectedTasteFilter] = useState<'all' | 'mild' | 'balanced' | 'sour' | 'tangy'>('all');

  // Apps4Craft Monetization & Access (Cheaper than espresso)
  const {
    blokada,
    chron,
    requireActionAccess,
  } = useAppAccess();
  const unitSystem = useUnitSystem();

  const bakeStats = useMemo(() => calculateBakeStatistics(bakeHistory), [bakeHistory]);
  const filteredHistory = useMemo(() => {
    return filterBakeLogs(bakeHistory, { tasteProfile: selectedTasteFilter });
  }, [bakeHistory, selectedTasteFilter]);

  const handleBakeAgain = async (log: StoredBakeLog) => {
    requireActionAccess(async () => {
      tapHaptic(Haptics.ImpactFeedbackStyle.Medium);

      try {
        const custom = await getRecipes();
        const pending = prepareBakeAgainRecipe(log, custom);
        setPendingRecipeToLoad(pending);

        router.navigate('/(tabs)');
        Alert.alert(
          t('Załadowano recepturę'),
          t('Parametry bochenka „{name}” zostały załadowane do kalkulatora.', {
            name: log.recipeName,
          })
        );
      } catch {
        router.navigate('/(tabs)');
      }
    });
  };

  const loadHistory = useCallback(async () => {
    const logs = await getBakeLogs();
    setBakeHistory(logs);
  }, []);

  useEffect(() => {
    loadHistory();
    void getBakingVessel().then((v) => {
      setBakingVesselState(v);
    });
  }, [loadHistory]);

  const endAtMsRef = useRef<number | null>(null);

  // Trwający wypiek w bazie: powrót do kroku i zegara po zabiciu procesu [M1-audytor-generalny-019]
  useBakeSession(
    isActive
      ? { version: 2, steps, stepIdx: currentStepIdx, dutchOvenPhase,
          timerEndsAt: isRunning ? endAtMsRef.current ?? Date.now() + timeLeftSec * 1000 : null,
          pausedLeftSec: isRunning ? null : timeLeftSec, recipeName, startedAt, bake: activeBakeData }
      : null,
    (s, timer) => {
      setIsActive(true);
      setSteps(s.steps);
      setRecipeName(s.recipeName);
      setStartedAt(s.startedAt);
      setActiveBakeData(s.bake);
      setCurrentStepIdx(s.stepIdx);
      setDutchOvenPhase(s.dutchOvenPhase);
      endAtMsRef.current = timer.isRunning ? s.timerEndsAt : null;
      setTimeLeftSec(timer.timeLeftSec);
      setIsRunning(timer.isRunning);
      setIsCompleted(timer.isCompleted);
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
      setTimeLeftSec(stepDurationSec(planned[0], 'lid_on'));
      setIsRunning(false);
      setIsCompleted(false);
    });
  };

  // Jump to or advance step
  const goToStep = (idx: number) => {
    if (idx < 0 || idx >= steps.length) return;
    setCurrentStepIdx(idx);
    setDutchOvenPhase('lid_on');
    setTimeLeftSec(stepDurationSec(steps[idx], 'lid_on'));
    setIsRunning(false);
    setIsCompleted(false);
    tapHaptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSwitchDutchOvenPhase = (phase: DutchOvenBakePhase) => {
    setDutchOvenPhase(phase);
    setTimeLeftSec(DUTCH_OVEN_PHASES[phase].durationMin * 60);
    setIsRunning(false);
    setIsCompleted(false);
    tapHaptic(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStartPhase2AfterSteamAlert = () => {
    setDutchOvenPhase('lid_off');
    setTimeLeftSec(DUTCH_OVEN_PHASES.lid_off.durationMin * 60);
    setIsCompleted(false);
    setIsRunning(true);
    void ensureNotificationPermission();
    tapHaptic(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      goToStep(currentStepIdx + 1);
    } else {
      setIsFinishModalOpen(true);
    }
  };

  // Timer Controls
  const toggleTimer = () => {
    tapHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (!isRunning) void ensureNotificationPermission(); // zgoda przy pierwszym zegarze (ADR-006)
    setIsRunning((prev) => !prev);
  };

  const addFiveMinutes = () => {
    tapHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (endAtMsRef.current) endAtMsRef.current += 300000;
    setTimeLeftSec((prev) => prev + 300);
    setIsCompleted(false);
  };

  const adjustTimerSeconds = (deltaSeconds: number) => {
    tapHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (endAtMsRef.current) endAtMsRef.current += deltaSeconds * 1000;
    setTimeLeftSec((prev) => Math.max(0, prev + deltaSeconds));
    setIsCompleted(false);
  };

  const resetCurrentStepTimer = () => {
    tapHaptic(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeftSec(stepDurationSec(currentStep, dutchOvenPhase));
  };

  // Finish bake: wpis, licznik wypieków i odliczenie mąki w jednej transakcji [M1-audytor-generalny-021]
  const handleSaveFinishBake = guardSave(async () => {
    await finishBake({
      id: `bake_${Date.now()}`,
      recipeName,
      startedAt,
      finishedAt: Date.now(),
      ambientTemp: activeBakeData?.ambientTempC,
      actualDDT: activeBakeData?.actualDdtC,
      ratingStars: finishRating,
      notes: finishNotes.trim() || undefined,
      crumbScore: finishCrumbScore,
      crustScore: finishCrustScore,
      tasteProfile: finishTasteProfile,
      sensoryProfile: {
        ...finishSensoryProfile,
        openCrumb: finishCrumbScore,
        crustCrispness: finishCrustScore,
      },
    }, activeBakeData?.calculatedRecipe?.flours ?? []);

    setActiveBake(null);
    await saveBakeSession(null);
    void resyncNotifications();
    setActiveBakeData(null);
    setIsActive(false);
    setCurrentStepIdx(0);
    setIsFinishModalOpen(false);
    setFinishCrumbScore(3);
    setFinishCrustScore(3);
    setFinishTasteProfile('balanced');
    setFinishSensoryProfile(DEFAULT_BREAD_SENSORY_PROFILE);
    setFinishNotes('');
    await loadHistory();
    // Po zapisanym wpisie: propozycja Doktora przy ocenie <= 2 (BR-DIAG-001) [M1-audytor-generalny-032]
    suggestDoctorAfterRating(finishRating, chron('doktor', () => router.push('/(tabs)/doktor')));
  });

  const handleDiscard = () => {
    confirmDiscardBake(() => {
      setActiveBake(null);
      void saveBakeSession(null).then(() => resyncNotifications()).catch(() => {});
      setActiveBakeData(null);
      setIsActive(false);
      setCurrentStepIdx(0);
      setIsRunning(false);
    });
  };

  const handleDeleteBakeLog = (id: string) => {
    confirmDeleteBakeLog(guardSave(async () => {
      await deleteBakeLog(id);
      await loadHistory();
    }));
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CraftHeader
        title={t('Stolnica')}
        subtitle={t('Asystent wypieku na żywo (Hands-in-flour)')}
        testID="stolnica-header"
        rightAction={
          <Pressable
            testID="stolnica-doctor-shortcut-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Doktor Chleba')}
            hitSlop={sharedCraftTokens.hitSlopStandard}
            style={styles.headerDoctorBtn}
            onPress={() => router.push('/(tabs)/doktor')}
          >
            <Text style={styles.headerDoctorBtnText}>🩺 {t('Doktor')}</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {!isActive || !currentStep ? (
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
            {/* Sacred Numbers Glanceable Countertop Card */}
            <StolnicaSacredCard
              currentStepIdx={currentStepIdx}
              totalSteps={steps.length}
              formattedTime={stepHasTimer(currentStep) ? formattedTime : '—'}
              activeBakeData={activeBakeData}
            />

            {/* Active Header & Recipe Badge */}
            <View style={styles.activeCard}>
              <View style={styles.badgeRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>
                    Krok {currentStepIdx + 1} z {steps.length}
                  </Text>
                </View>
                <Text style={styles.recipeTag}>{recipeName}</Text>
              </View>

              <Text style={styles.activeStepTitle}>{t(currentStep.name)}</Text>
              <Text style={styles.activeStepDesc}>{formatTextUnits(t(currentStep.instructions), unitSystem)}</Text>

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

              {/* Zegar; etap żytni bez czasu w planie idzie bez minutnika (030) */}
              {stepHasTimer(currentStep) && <ActiveTimerDisplay
                formattedTime={formattedTime}
                isRunning={isRunning}
                isCompleted={isCompleted}
                onAdjustSeconds={adjustTimerSeconds}
                onToggleTimer={toggleTimer}
                onAddFiveMinutes={addFiveMinutes}
                onResetTimer={resetCurrentStepTimer}
              />}

              {/* Step Navigation Controls */}
              <View style={styles.controlsRow}>
                <Pressable
                  testID="next-or-finish-step-btn"
                  style={styles.actionBtnNext}
                  onPress={handleNextStep}
                >
                  <Text style={styles.actionBtnNextText}>
                    {currentStepIdx === steps.length - 1
                      ? `🏆 ${t('Zakończ wypiek')}`
                      : `${t('Następny krok')} (${t(steps[currentStepIdx + 1]?.name ?? '')}) ✓`}
                  </Text>
                </Pressable>
              </View>

              <Pressable style={styles.discardBtn} onPress={handleDiscard}>
                <Text style={styles.discardBtnText}>{t('Odrzuć wypiek')}</Text>
              </Pressable>
            </View>

            {/* Active Recipe Ingredients Card & Steps Timeline */}
            <BakeStepsList
              steps={steps}
              currentStepIdx={currentStepIdx}
              onGoToStep={goToStep}
              calculatedRecipe={activeBakeData?.calculatedRecipe}
              unitSystem={unitSystem}
            />
          </View>
          </BlokadaFunkcji>
        )}

        {/* Modal: Finish Bake Evaluation */}
        <FinishBakeModal
          visible={isFinishModalOpen}
          onClose={() => setIsFinishModalOpen(false)}
          onSave={handleSaveFinishBake}
          rating={finishRating}
          onRatingChange={setFinishRating}
          notes={finishNotes}
          onNotesChange={setFinishNotes}
          crumbScore={finishCrumbScore}
          onCrumbScoreChange={setFinishCrumbScore}
          crustScore={finishCrustScore}
          onCrustScoreChange={setFinishCrustScore}
          tasteProfile={finishTasteProfile}
          onTasteProfileChange={setFinishTasteProfile}
          sensoryProfile={finishSensoryProfile}
          onSensoryProfileChange={setFinishSensoryProfile}
        />

      </ScrollView>
    </SafeAreaView>
  );
}
