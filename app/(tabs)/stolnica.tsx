import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import { confirmDiscardBake, confirmDeleteBakeLog } from '../../src/lib/confirm';
import {
  saveBakeLog,
  getBakeLogs,
  deleteBakeLog,
  getActiveBake,
  setActiveBake,
  ActiveBakeState,
  deductFlourStock,
  getRecipes,
} from '../../src/data/sqlite-store';
import { StoredBakeLog } from '../../src/data/db';
import { MASTER_RECIPES } from '../../src/recipes/presets';
import { setPendingRecipeToLoad } from '../../src/lib/recipe-navigation';
import {
  SensoryRadarChart,
  BreadSensoryProfile,
  DEFAULT_BREAD_SENSORY_PROFILE,
} from '../../src/components/SensoryRadarChart';
import { notifyTimerFinished, notifySteamReleaseAlert } from '../../src/lib/timer-audio';
import { DUTCH_OVEN_PHASES, DutchOvenBakePhase } from '../../src/core/baking-phases';
import { calculateBakeStatistics, filterBakeLogs } from '../../src/core/bake-statistics';

export interface BakeStep {
  id: string;
  name: string;
  desc: string;
  timerMin: number;
}

const BAKE_STEPS: BakeStep[] = [
  {
    id: 'step_1',
    name: 'Autoliza',
    desc: 'Połącz mąkę z wodą, nie dodawaj jeszcze zakwasu ani soli. Pozwól glutenowi i enzymom samoczynnie rozwinąć strukturę ciasta.',
    timerMin: 45,
  },
  {
    id: 'step_2',
    name: 'Mieszanie i zaszczepienie',
    desc: 'Dodaj aktywny zakwas i sól. Wyrabiaj techniką Rubaud lub delikatnym podwijaniem aż ciasto stanie się gładkie i elastyczne.',
    timerMin: 15,
  },
  {
    id: 'step_3',
    name: 'Składanie 1 (Stretch & Fold)',
    desc: 'Mokrymi dłońmi podciągnij 4 brzegi ciasta ku górze i złóż do środka miski.',
    timerMin: 30,
  },
  {
    id: 'step_4',
    name: 'Składanie 2 (Coil Fold)',
    desc: 'Delikatnie podłóż obie dłonie pod środek ciasta, unieś i pozwól końcom zawinąć się pod spód.',
    timerMin: 30,
  },
  {
    id: 'step_5',
    name: 'Składanie 3 (Coil Fold)',
    desc: 'Ostatnie składanie budujące napięcie powierzchniowe. Ciasto powinno być puszyste i trzymać kształt kuli.',
    timerMin: 30,
  },
  {
    id: 'step_6',
    name: 'Formowanie wstępne (Pre-shape)',
    desc: 'Wyłóż ciasto na blat, podtocz delikatnie w kulę skrobakiem bez nadmiaru mąki. Zostaw na 20 min odpoczynku.',
    timerMin: 20,
  },
  {
    id: 'step_7',
    name: 'Formowanie do koszyka i chłód',
    desc: 'Nadaj ostateczny kształt (baton lub bochenek okrągły), umieść w oprószonym koszyku i schowaj do lodówki (4°C) na 12–16h.',
    timerMin: 720,
  },
  {
    id: 'step_8',
    name: 'Wypiek w garnku z parą',
    desc: '20 min w nagrzanym garnku żeliwnym (240°C) pod pokrywką + 22–25 min bez pokrywki (210°C) do głębokiego zbrązowienia.',
    timerMin: 45,
  },
];

export default function StolnicaScreen() {
  // Prevent screen sleep while in Stolnica
  useKeepAwake();
  const router = useRouter();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [recipeName, setRecipeName] = useState<string>('Wiejski chleb 72%');
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [activeBakeData, setActiveBakeData] = useState<ActiveBakeState | null>(null);

  // Timer states
  const [timeLeftSec, setTimeLeftSec] = useState<number>(BAKE_STEPS[0].timerMin * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [dutchOvenPhase, setDutchOvenPhase] = useState<DutchOvenBakePhase>('lid_on');

  // Finish Bake Modal & History
  const [isFinishModalOpen, setIsFinishModalOpen] = useState<boolean>(false);
  const [finishRating, setFinishRating] = useState<number>(5);
  const [finishNotes, setFinishNotes] = useState<string>('Chrupiąca skórka, otwarty miękisz i potężne ucho.');
  const [finishCrumbScore, setFinishCrumbScore] = useState<number>(3);
  const [finishCrustScore, setFinishCrustScore] = useState<number>(3);
  const [finishTasteProfile, setFinishTasteProfile] = useState<'mild' | 'balanced' | 'sour' | 'tangy'>('balanced');
  const [finishSensoryProfile, setFinishSensoryProfile] = useState<BreadSensoryProfile>(DEFAULT_BREAD_SENSORY_PROFILE);
  const [bakeHistory, setBakeHistory] = useState<StoredBakeLog[]>([]);
  const [selectedTasteFilter, setSelectedTasteFilter] = useState<'all' | 'mild' | 'balanced' | 'sour' | 'tangy'>('all');

  const bakeStats = useMemo(() => calculateBakeStatistics(bakeHistory), [bakeHistory]);
  const filteredHistory = useMemo(() => {
    return filterBakeLogs(bakeHistory, { tasteProfile: selectedTasteFilter });
  }, [bakeHistory, selectedTasteFilter]);

  const handleBakeAgain = async (log: StoredBakeLog) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }

    try {
      const custom = await getRecipes();
      const allPresets = [...custom, ...MASTER_RECIPES];
      const match = allPresets.find(
        (r) => ('namePl' in r ? r.namePl : r.name).toLowerCase() === log.recipeName.toLowerCase()
      );

      if (match) {
        setPendingRecipeToLoad({
          id: match.id,
          name: 'namePl' in match ? match.namePl : match.name,
          targetDDT: match.targetDDT,
          formula: match.formula,
        });
      } else {
        setPendingRecipeToLoad({
          name: log.recipeName,
          targetDDT: log.actualDDT ?? 25.0,
          formula: {
            flours: [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100.0, type: 'pszenna_750' }],
            waterPercentage: 70.0,
            saltPercentage: 2.0,
            starterPercentage: 20.0,
            starterHydration: 100.0,
            targetDoughWeightGrams: 850,
          },
        });
      }

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
  };

  const loadHistory = useCallback(async () => {
    const logs = await getBakeLogs();
    setBakeHistory(logs);
  }, []);

  useEffect(() => {
    loadHistory();
    const existing = getActiveBake();
    if (existing) {
      setIsActive(true);
      setRecipeName(existing.recipeName);
      setStartedAt(existing.startedAt);
      setActiveBakeData(existing);
      setTimeLeftSec(BAKE_STEPS[0].timerMin * 60);
      setIsRunning(false);
      setIsCompleted(false);
    }
  }, [loadHistory]);

  // Timer countdown tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && timeLeftSec > 0) {
      interval = setInterval(() => {
        setTimeLeftSec((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            if (BAKE_STEPS[currentStepIdx].id === 'step_8' && dutchOvenPhase === 'lid_on') {
              void notifySteamReleaseAlert();
            } else if (BAKE_STEPS[currentStepIdx].id === 'step_8' && dutchOvenPhase === 'lid_off') {
              void notifyTimerFinished(t('Wypiek w garnku zakończony! Wyjmij chleb na kratkę.'));
            } else {
              void notifyTimerFinished(BAKE_STEPS[currentStepIdx].name);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeftSec, currentStepIdx, dutchOvenPhase]);

  const currentStep = BAKE_STEPS[currentStepIdx];

  // Start new bake from idle
  const handleStartBake = () => {
    setIsActive(true);
    setCurrentStepIdx(0);
    setStartedAt(Date.now());
    setTimeLeftSec(BAKE_STEPS[0].timerMin * 60);
    setIsRunning(false);
    setIsCompleted(false);
  };

  // Jump to or advance step
  const goToStep = (idx: number) => {
    if (idx < 0 || idx >= BAKE_STEPS.length) return;
    setCurrentStepIdx(idx);
    if (BAKE_STEPS[idx].id === 'step_8') {
      setDutchOvenPhase('lid_on');
      setTimeLeftSec(DUTCH_OVEN_PHASES.lid_on.durationMin * 60);
    } else {
      setTimeLeftSec(BAKE_STEPS[idx].timerMin * 60);
    }
    setIsRunning(false);
    setIsCompleted(false);
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored
    }
  };

  const handleSwitchDutchOvenPhase = (phase: DutchOvenBakePhase) => {
    setDutchOvenPhase(phase);
    setTimeLeftSec(DUTCH_OVEN_PHASES[phase].durationMin * 60);
    setIsRunning(false);
    setIsCompleted(false);
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignored
    }
  };

  const handleStartPhase2AfterSteamAlert = () => {
    setDutchOvenPhase('lid_off');
    setTimeLeftSec(DUTCH_OVEN_PHASES.lid_off.durationMin * 60);
    setIsCompleted(false);
    setIsRunning(true);
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Ignored
    }
  };

  const handleNextStep = () => {
    if (currentStepIdx < BAKE_STEPS.length - 1) {
      goToStep(currentStepIdx + 1);
    } else {
      setIsFinishModalOpen(true);
    }
  };

  // Timer Controls
  const toggleTimer = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignored
    }
    setIsRunning((prev) => !prev);
  };

  const addFiveMinutes = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored
    }
    setTimeLeftSec((prev) => prev + 300);
    setIsCompleted(false);
  };

  const adjustTimerSeconds = (deltaSeconds: number) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored
    }
    setTimeLeftSec((prev) => Math.max(0, prev + deltaSeconds));
    setIsCompleted(false);
  };

  const resetCurrentStepTimer = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored
    }
    setIsRunning(false);
    setIsCompleted(false);
    if (currentStep.id === 'step_8') {
      setTimeLeftSec(DUTCH_OVEN_PHASES[dutchOvenPhase].durationMin * 60);
    } else {
      setTimeLeftSec(currentStep.timerMin * 60);
    }
  };

  // Finish bake & save to SQLite
  const handleSaveFinishBake = async () => {
    await saveBakeLog({
      id: `bake_${Date.now()}`,
      recipeName,
      startedAt,
      finishedAt: Date.now(),
      ambientTemp: activeBakeData?.ambientTempC ?? 22.0,
      actualDDT: activeBakeData?.actualDdtC ?? 25.0,
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
    });

    // Deduct flour inventory if calculated recipe is present
    if (activeBakeData?.calculatedRecipe?.flours) {
      for (const f of activeBakeData.calculatedRecipe.flours) {
        await deductFlourStock(f.name, f.weightGrams);
      }
    }

    setActiveBake(null);
    setActiveBakeData(null);
    setIsActive(false);
    setCurrentStepIdx(0);
    setIsFinishModalOpen(false);
    setFinishCrumbScore(3);
    setFinishCrustScore(3);
    setFinishTasteProfile('balanced');
    setFinishSensoryProfile(DEFAULT_BREAD_SENSORY_PROFILE);
    await loadHistory();
  };

  const handleDiscard = () => {
    confirmDiscardBake(() => {
      setActiveBake(null);
      setActiveBakeData(null);
      setIsActive(false);
      setCurrentStepIdx(0);
      setIsRunning(false);
    });
  };

  const handleDeleteBakeLog = (id: string) => {
    confirmDeleteBakeLog(async () => {
      await deleteBakeLog(id);
      await loadHistory();
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Stolnica')}</Text>
          <Text style={styles.subtitle}>Asystent wypieku na żywo (Hands-in-flour)</Text>
        </View>

        {!isActive ? (
          <View>
            <View style={styles.idleCard}>
              <Text style={styles.idleTitle}>Brak aktywnego wypieku</Text>
              <Text style={styles.idleText}>
                Wybierz recepturę w Kalkulatorze i kliknij „Rozpocznij wypiek na Stolnicy”, lub
                uruchom standardowy harmonogram rzemieślniczy poniżej.
              </Text>

              <Pressable style={styles.startBtn} onPress={handleStartBake}>
                <Text style={styles.startBtnText}>🥖 Rozpocznij wypiek</Text>
              </Pressable>
            </View>

            {/* History of Bakes */}
            <Text style={styles.sectionHeading}>{t('Historia wypieków')}</Text>

            {/* Artisan Statistics Card */}
            {bakeHistory.length > 0 && (
              <View style={styles.statsCard} testID="bake-stats-card">
                <Text style={styles.statsCardTitle}>📊 {t('Statystyki piekarni domowej')}</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsLabel}>{t('Łącznie wypieków')}</Text>
                    <Text style={styles.statsValue}>{bakeStats.totalBakes}</Text>
                  </View>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsLabel}>{t('Średnia ocena')}</Text>
                    <Text style={styles.statsValue}>⭐ {bakeStats.averageRating}</Text>
                  </View>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsLabel}>{t('Śr. miękisz')}</Text>
                    <Text style={styles.statsValue}>🍞 {bakeStats.averageCrumbScore}/5</Text>
                  </View>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsLabel}>{t('Śr. skórka')}</Text>
                    <Text style={styles.statsValue}>🔥 {bakeStats.averageCrustScore}/5</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Taste Profile Filter */}
            {bakeHistory.length > 0 && (
              <View style={styles.tasteFilterContainer}>
                <Text style={styles.filterLabel}>{t('Filtruj profil smakowy:')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tasteFilterScroll}>
                  {[
                    { id: 'all' as const, label: t('Wszystkie') },
                    { id: 'mild' as const, label: t('Łagodny') },
                    { id: 'balanced' as const, label: t('Zbalansowany') },
                    { id: 'sour' as const, label: t('Kwaśny') },
                    { id: 'tangy' as const, label: t('Bardzo kwaśny') },
                  ].map((p) => (
                    <Pressable
                      key={p.id}
                      testID={`filter-taste-${p.id}`}
                      style={[
                        styles.tasteFilterChip,
                        selectedTasteFilter === p.id && styles.tasteFilterChipActive,
                      ]}
                      onPress={() => setSelectedTasteFilter(p.id)}
                    >
                      <Text
                        style={[
                          styles.tasteFilterText,
                          selectedTasteFilter === p.id && styles.tasteFilterTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {bakeHistory.length === 0 ? (
              <View style={styles.emptyHistoryBox}>
                <Text style={styles.emptyHistoryText}>{t('Brak wcześniejszych wypieków')}</Text>
              </View>
            ) : (
              filteredHistory.slice(0, 15).map((log) => {
                const dateStr = new Date(log.startedAt).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <View key={log.id} style={styles.historyCard} testID={`bake-log-card-${log.id}`}>
                    <View style={styles.historyCardHeader}>
                      <Text style={styles.historyRecipeName}>{log.recipeName}</Text>
                      <View style={styles.historyActionsRow}>
                        <Text style={styles.historyStars}>
                          {'⭐'.repeat(log.ratingStars ?? 5)}
                        </Text>
                        <Pressable
                          testID={`delete-bake-log-${log.id}`}
                          onPress={() => handleDeleteBakeLog(log.id)}
                          style={styles.deleteHistoryBtn}
                          accessibilityLabel={t('Usuń wpis')}
                        >
                          <Text style={styles.deleteHistoryBtnText}>🗑️</Text>
                        </Pressable>
                      </View>
                    </View>
                    <Text style={styles.historyDate}>{dateStr}</Text>

                    {/* Crumb, crust & taste pills */}
                    <View style={styles.historyPillsRow}>
                      {log.crumbScore !== undefined && (
                        <View style={styles.historyPill}>
                          <Text style={styles.historyPillText}>
                            🍞 {t('Miękisz:')} {log.crumbScore}/5
                          </Text>
                        </View>
                      )}
                      {log.crustScore !== undefined && (
                        <View style={styles.historyPill}>
                          <Text style={styles.historyPillText}>
                            🔥 {t('Skórka:')} {log.crustScore}/5
                          </Text>
                        </View>
                      )}
                      {log.tasteProfile && (
                        <View style={styles.historyPill}>
                          <Text style={styles.historyPillText}>
                            👅 {log.tasteProfile === 'sour' ? t('Kwaśny') : log.tasteProfile === 'mild' ? t('Łagodny') : log.tasteProfile === 'tangy' ? t('Bardzo kwaśny') : t('Zbalansowany')}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Sensory Radar Chart (Zadanie P4) */}
                    <View style={styles.historyRadarBox}>
                      <SensoryRadarChart
                        profile={
                          log.sensoryProfile ?? {
                            crustCrispness: log.crustScore ?? 3,
                            crumbElasticity: 4,
                            acidity: log.tasteProfile === 'sour' ? 4 : log.tasteProfile === 'tangy' ? 5 : log.tasteProfile === 'mild' ? 2 : 3,
                            openCrumb: log.crumbScore ?? 3,
                            caramelization: log.ratingStars ?? 4,
                          }
                        }
                        size={170}
                        showLabels={true}
                        testID={`history-radar-${log.id}`}
                      />
                    </View>

                    {log.notes && <Text style={styles.historyNotes}>{log.notes}</Text>}

                    {/* Bake Again Button (Zadanie P3) */}
                    <Pressable
                      testID={`bake-again-btn-${log.id}`}
                      accessibilityRole="button"
                      accessibilityLabel={`${t('Piecz ponownie')}: ${log.recipeName}`}
                      style={styles.bakeAgainBtn}
                      onPress={() => handleBakeAgain(log)}
                    >
                      <Text style={styles.bakeAgainBtnText}>🔁 {t('Piecz ponownie')}</Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          <View>
            {/* Active Header & Recipe Badge */}
            <View style={styles.activeCard}>
              <View style={styles.badgeRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>
                    Krok {currentStepIdx + 1} z {BAKE_STEPS.length}
                  </Text>
                </View>
                <Text style={styles.recipeTag}>{recipeName}</Text>
              </View>

              <Text style={styles.activeStepTitle}>{currentStep.name}</Text>
              <Text style={styles.activeStepDesc}>{currentStep.desc}</Text>

              {/* Dutch Oven Two-Phase Controller for Step 8 */}
              {currentStep.id === 'step_8' && (
                <View style={styles.dutchOvenContainer} testID="dutch-oven-phase-card">
                  {/* Phase selector tabs */}
                  <View style={styles.phaseTabsRow}>
                    <Pressable
                      testID="phase-tab-lid-on"
                      style={[
                        styles.phaseTabBtn,
                        dutchOvenPhase === 'lid_on' && styles.phaseTabBtnActive,
                      ]}
                      onPress={() => handleSwitchDutchOvenPhase('lid_on')}
                    >
                      <Text
                        style={[
                          styles.phaseTabBtnText,
                          dutchOvenPhase === 'lid_on' && styles.phaseTabBtnTextActive,
                        ]}
                      >
                        🍲 {t('Faza 1: Pod pokrywką (Para)')}
                      </Text>
                    </Pressable>

                    <Pressable
                      testID="phase-tab-lid-off"
                      style={[
                        styles.phaseTabBtn,
                        dutchOvenPhase === 'lid_off' && styles.phaseTabBtnActive,
                      ]}
                      onPress={() => handleSwitchDutchOvenPhase('lid_off')}
                    >
                      <Text
                        style={[
                          styles.phaseTabBtnText,
                          dutchOvenPhase === 'lid_off' && styles.phaseTabBtnTextActive,
                        ]}
                      >
                        🔥 {t('Faza 2: Bez pokrywki (Karmelizacja)')}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Phase Info Card */}
                  <View style={styles.phaseInfoCard}>
                    <View style={styles.phaseHeaderRow}>
                      <Text style={styles.phaseTitle}>
                        {dutchOvenPhase === 'lid_on'
                          ? t('Faza 1: Pod pokrywką (Para)')
                          : t('Faza 2: Bez pokrywki (Karmelizacja)')}
                      </Text>
                      <View style={styles.phaseTempBadge}>
                        <Text style={styles.phaseTempBadgeText}>
                          {DUTCH_OVEN_PHASES[dutchOvenPhase].temperatureC}°C
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.phaseDesc}>
                      {DUTCH_OVEN_PHASES[dutchOvenPhase].descriptionPl}
                    </Text>
                    <Text style={styles.phaseTip}>
                      💡 {DUTCH_OVEN_PHASES[dutchOvenPhase].tipPl}
                    </Text>
                  </View>

                  {/* Steam Release Alert Gate (if lid_on finished) */}
                  {dutchOvenPhase === 'lid_on' && isCompleted && (
                    <View style={styles.steamAlertBanner} testID="steam-gate-alert">
                      <Text style={styles.steamAlertTitle}>
                        🔥 {t('Zdejmij pokrywkę garnka! Wypuść parę.')}
                      </Text>
                      <Text style={styles.steamAlertDesc}>
                        Zdejmij ostrożnie pokrywkę, pozwól parze ulecieć i obniż temperaturę pieca do 210°C dla karmelizacji skórki.
                      </Text>
                      <Pressable
                        testID="start-phase-2-btn"
                        style={styles.steamAlertActionBtn}
                        onPress={handleStartPhase2AfterSteamAlert}
                      >
                        <Text style={styles.steamAlertActionBtnText}>
                          ▶ {t('Rozpocznij Fazę 2')} (25 min @ 210°C)
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {/* Big Digital Kitchen Timer Display */}
              <View style={[styles.timerContainer, isCompleted && styles.timerContainerCompleted]}>
                <Text style={[styles.timerStatusText, isCompleted && styles.timerStatusTextCompleted]}>
                  {isCompleted
                    ? `✓ ${t('Etap ukończony!')}`
                    : isRunning
                    ? `● ${t('Odliczanie trwa')}`
                    : `⏸ ${t('Wstrzymano')}`}
                </Text>
                <Text style={[styles.digitalClock, isCompleted && styles.digitalClockCompleted]}>
                  {formattedTime}
                </Text>

                {/* In-Flight Time Adjustment Pills (Zadanie P8) */}
                <View style={styles.timeAdjustmentRow} testID="timer-in-flight-adjustments">
                  <Pressable
                    testID="adjust-time-minus-5m"
                    accessibilityRole="button"
                    accessibilityLabel={t('-5 min')}
                    style={styles.timePillBtn}
                    onPress={() => adjustTimerSeconds(-300)}
                  >
                    <Text style={styles.timePillText}>-5m</Text>
                  </Pressable>
                  <Pressable
                    testID="adjust-time-minus-10s"
                    accessibilityRole="button"
                    accessibilityLabel={t('-10 sek')}
                    style={styles.timePillBtn}
                    onPress={() => adjustTimerSeconds(-10)}
                  >
                    <Text style={styles.timePillText}>-10s</Text>
                  </Pressable>
                  <Pressable
                    testID="adjust-time-plus-10s"
                    accessibilityRole="button"
                    accessibilityLabel={t('+10 sek')}
                    style={styles.timePillBtn}
                    onPress={() => adjustTimerSeconds(10)}
                  >
                    <Text style={styles.timePillText}>+10s</Text>
                  </Pressable>
                  <Pressable
                    testID="adjust-time-plus-5m"
                    accessibilityRole="button"
                    accessibilityLabel={t('+5 min')}
                    style={styles.timePillBtn}
                    onPress={() => adjustTimerSeconds(300)}
                  >
                    <Text style={styles.timePillText}>+5m</Text>
                  </Pressable>
                </View>

                {/* Big Hands-in-Flour Timer Action Controls */}
                <View style={styles.timerControlsRow}>
                  <Pressable
                    style={[styles.timerPrimaryBtn, isRunning && styles.timerPrimaryBtnPause]}
                    onPress={toggleTimer}
                  >
                    <Text style={styles.timerPrimaryBtnText}>
                      {isRunning ? `⏸ ${t('Wstrzymaj')}` : `▶ ${t('Start')}`}
                    </Text>
                  </Pressable>

                  <Pressable style={styles.timerSecondaryBtn} onPress={addFiveMinutes}>
                    <Text style={styles.timerSecondaryBtnText}>{t('+5 min')}</Text>
                  </Pressable>

                  <Pressable style={styles.timerSecondaryBtn} onPress={resetCurrentStepTimer}>
                    <Text style={styles.timerSecondaryBtnText}>⟲ {t('Resetuj')}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Step Navigation Controls */}
              <View style={styles.controlsRow}>
                <Pressable
                  testID="next-or-finish-step-btn"
                  style={styles.actionBtnNext}
                  onPress={handleNextStep}
                >
                  <Text style={styles.actionBtnNextText}>
                    {currentStepIdx === BAKE_STEPS.length - 1
                      ? `🏆 ${t('Zakończ wypiek')}`
                      : `${t('Następny krok')} (${BAKE_STEPS[currentStepIdx + 1]?.name}) ✓`}
                  </Text>
                </Pressable>
              </View>

              <Pressable style={styles.discardBtn} onPress={handleDiscard}>
                <Text style={styles.discardBtnText}>{t('Odrzuć wypiek')}</Text>
              </Pressable>
            </View>

            {/* Active Recipe Ingredients Card */}
            {activeBakeData?.calculatedRecipe && (
              <View style={styles.ingredientsCard}>
                <Text style={styles.ingredientsTitle}>⚖️ Składniki do odważenia</Text>
                <View style={styles.ingredientsGrid}>
                  <View style={styles.ingredientPill}>
                    <Text style={styles.ingredientLabel}>Mąki</Text>
                    <Text style={styles.ingredientValue}>
                      {activeBakeData.calculatedRecipe.baseFlourWeightGrams} g
                    </Text>
                  </View>
                  <View style={styles.ingredientPill}>
                    <Text style={styles.ingredientLabel}>Woda</Text>
                    <Text style={styles.ingredientValue}>
                      {activeBakeData.calculatedRecipe.waterGrams} g
                    </Text>
                  </View>
                  <View style={styles.ingredientPill}>
                    <Text style={styles.ingredientLabel}>Zakwas</Text>
                    <Text style={styles.ingredientValue}>
                      {activeBakeData.calculatedRecipe.starterGrams} g
                    </Text>
                  </View>
                  <View style={styles.ingredientPill}>
                    <Text style={styles.ingredientLabel}>Sól</Text>
                    <Text style={styles.ingredientValue}>
                      {activeBakeData.calculatedRecipe.saltGrams} g
                    </Text>
                  </View>
                </View>
                <Text style={styles.ingredientsCaption}>
                  Masa ciasta: {activeBakeData.calculatedRecipe.targetDoughWeightGrams} g · Hydratacja całkowita: {activeBakeData.calculatedRecipe.overallHydrationPercent.toFixed(1)}% (True Baker's %)
                </Text>
              </View>
            )}

            {/* Steps Overview (Clickable) */}
            <Text style={styles.sectionHeading}>Wszystkie etapy wypieku</Text>
            {BAKE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <Pressable
                  key={step.id}
                  onPress={() => goToStep(idx)}
                  style={[
                    styles.stepRow,
                    isCurrent && styles.stepRowCurrent,
                    isPast && styles.stepRowPast,
                  ]}
                >
                  <Text style={[styles.stepNumber, isCurrent && styles.stepNumberCurrent]}>
                    {isPast ? '✓' : `${idx + 1}`}
                  </Text>
                  <View style={styles.stepInfo}>
                    <Text style={[styles.stepName, isCurrent && styles.stepNameCurrent]}>
                      {step.name}
                    </Text>
                    <Text style={styles.stepTime}>{step.timerMin} min</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Modal: Finish Bake Evaluation */}
        <Modal visible={isFinishModalOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>🎉 {t('Zakończ wypiek')}</Text>
              <Text style={styles.modalSubtitle}>
                Oceń bochenek i zapisz notatki do historii piekarskiej
              </Text>

              {/* Star Rating */}
              <Text style={styles.modalSectionLabel}>{t('Ocena wypieku')}</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setFinishRating(star)}>
                    <Text style={[styles.starIcon, finishRating >= star && styles.starIconActive]}>
                      ★
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Notes */}
              <Text style={styles.modalSectionLabel}>{t('Notatki z wypieku')}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder={t('Wpisz swoje uwagi (miękisz, skórka, czas pieca)...')}
                placeholderTextColor={theme.colors.textMuted}
                value={finishNotes}
                onChangeText={setFinishNotes}
                multiline
                numberOfLines={3}
              />

              {/* Crumb Score */}
              <Text style={styles.modalSectionLabel}>🍞 {t('Struktura miękiszu')} (1–5)</Text>
              <View style={styles.scoreRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable
                    key={s}
                    testID={`crumb-score-${s}`}
                    style={[styles.scoreBtn, finishCrumbScore === s && styles.scoreBtnActive]}
                    onPress={() => setFinishCrumbScore(s)}
                  >
                    <Text style={[styles.scoreBtnText, finishCrumbScore === s && styles.scoreBtnTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.scoreHint}>
                {finishCrumbScore <= 2 ? '🧱 Zbity, gęsty miękisz — rozważaj dłuższy bulk' : finishCrumbScore >= 5 ? '🌟 Dzika, otwarta struktura rzemieślnicza!' : '✅ Ładna równomierna alweolatura'}
              </Text>

              {/* Crust Score */}
              <Text style={styles.modalSectionLabel}>🔥 {t('Jakość skórki')} (1–5)</Text>
              <View style={styles.scoreRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable
                    key={s}
                    testID={`crust-score-${s}`}
                    style={[styles.scoreBtn, finishCrustScore === s && styles.scoreBtnActive]}
                    onPress={() => setFinishCrustScore(s)}
                  >
                    <Text style={[styles.scoreBtnText, finishCrustScore === s && styles.scoreBtnTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.scoreHint}>
                {finishCrustScore <= 2 ? '🫧 Blada, miękka skórka — zwiększ parę lub temperaturę' : finishCrustScore >= 5 ? '💎 Perfekcyjna chrupiąca skórka z pęcherzykami' : '✅ Dobra skórka z lekkim połyskiem'}
              </Text>

              {/* Taste Profile */}
              <Text style={styles.modalSectionLabel}>👅 {t('Profil smakowy')}</Text>
              <View style={styles.tasteRow}>
                {(['mild', 'balanced', 'sour', 'tangy'] as const).map((profile) => {
                  const labels: Record<string, string> = {
                    mild: '🍞 Łagodny',
                    balanced: '⚖️ Zbalansowany',
                    sour: '🍋 Kwaśny',
                    tangy: '🔥 Bardzo kwaśny',
                  };
                  return (
                    <Pressable
                      key={profile}
                      testID={`taste-${profile}`}
                      style={[styles.tasteChip, finishTasteProfile === profile && styles.tasteChipActive]}
                      onPress={() => setFinishTasteProfile(profile)}
                    >
                      <Text style={[styles.tasteChipText, finishTasteProfile === profile && styles.tasteChipTextActive]}>
                        {labels[profile]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Sensory Radar Profile (5 Osi Rzemieślniczych - Zadanie P4) */}
              <Text style={styles.modalSectionLabel}>🕸️ {t('Wektorowy radar sensoryczny')}</Text>
              <View style={styles.modalRadarBox}>
                <SensoryRadarChart
                  profile={finishSensoryProfile}
                  size={190}
                  showLabels={true}
                  interactive={true}
                  onChangeProfile={setFinishSensoryProfile}
                  testID="finish-sensory-radar"
                />
              </View>

              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => setIsFinishModalOpen(false)}
                >
                  <Text style={styles.modalCancelBtnText}>{t('Anuluj')}</Text>
                </Pressable>
                <Pressable
                  style={styles.modalConfirmBtn}
                  onPress={handleSaveFinishBake}
                >
                  <Text style={styles.modalConfirmBtnText}>{t('Zapisz w historii')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  idleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  idleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  idleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  recipeTag: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  activeStepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  activeStepDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  timerContainer: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  timerContainerCompleted: {
    borderColor: theme.colors.statusSuccess,
    backgroundColor: '#F0FDF4',
  },
  timerStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerStatusTextCompleted: {
    color: theme.colors.statusSuccess,
  },
  digitalClock: {
    fontSize: 52,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    color: theme.colors.accentDark,
    marginVertical: 4,
  },
  digitalClockCompleted: {
    color: theme.colors.statusSuccess,
  },
  timerControlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  timerPrimaryBtn: {
    flex: 2,
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  timerPrimaryBtnPause: {
    backgroundColor: theme.colors.statusWarning,
  },
  timerPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timerSecondaryBtn: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timerSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  controlsRow: {
    marginBottom: 10,
  },
  actionBtnNext: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  actionBtnNextText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  discardBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  discardBtnText: {
    fontSize: 13,
    color: theme.colors.statusDanger,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepRowCurrent: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  stepRowPast: {
    opacity: 0.6,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundSecondary,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginRight: 10,
  },
  stepNumberCurrent: {
    backgroundColor: theme.colors.accent,
    color: '#FFFFFF',
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  stepNameCurrent: {
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  stepTime: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  ingredientsCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.accentLight,
  },
  ingredientsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.accentDark,
    marginBottom: 8,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 8,
  },
  ingredientPill: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ingredientLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  ingredientValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  ingredientsCaption: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyRecipeName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  historyStars: {
    fontSize: 14,
  },
  historyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteHistoryBtn: {
    padding: 4,
    borderRadius: theme.radius.sm,
  },
  deleteHistoryBtnText: {
    fontSize: 14,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  historyNotes: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyHistoryBox: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  starIcon: {
    fontSize: 32,
    color: theme.colors.border,
  },
  starIconActive: {
    color: '#F59E0B',
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  modalCancelBtnText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  modalConfirmBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  scoreBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreBtnActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  scoreBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  scoreBtnTextActive: {
    color: '#FFFFFF',
  },
  scoreHint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 14,
    lineHeight: 16,
  },
  tasteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18,
  },
  tasteChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tasteChipActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  tasteChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tasteChipTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  dutchOvenContainer: {
    marginVertical: 12,
  },
  phaseTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  phaseTabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseTabBtnActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  phaseTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  phaseTabBtnTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '800',
  },
  phaseInfoCard: {
    backgroundColor: theme.colors.surfaceCard,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  phaseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  phaseTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  phaseTempBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  phaseTempBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  phaseDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  phaseTip: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  steamAlertBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: theme.colors.statusDanger,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: 8,
  },
  steamAlertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.statusDanger,
    marginBottom: 4,
  },
  steamAlertDesc: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 17,
    marginBottom: 10,
  },
  steamAlertActionBtn: {
    backgroundColor: theme.colors.statusDanger,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  steamAlertActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  statsValue: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.accentDark,
    textAlign: 'center',
  },
  tasteFilterContainer: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  tasteFilterScroll: {
    flexDirection: 'row',
  },
  tasteFilterChip: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  tasteFilterChipActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  tasteFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tasteFilterTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  historyPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    marginBottom: 4,
  },
  historyPill: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.sm,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderWidth: 1,
    borderColor: theme.colors.border + '60',
  },
  historyPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  bakeAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    marginTop: 10,
    minHeight: 44,
  },
  bakeAgainBtnText: {
    color: theme.colors.accentDark,
    fontSize: 14,
    fontWeight: '700',
  },
  historyRadarBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  modalRadarBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  timeAdjustmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
  },
  timePillBtn: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 40,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
