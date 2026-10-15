import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import { confirmDiscardBake } from '../../src/lib/confirm';
import {
  saveBakeLog,
  getBakeLogs,
  getActiveBake,
  setActiveBake,
  ActiveBakeState,
} from '../../src/data/sqlite-store';
import { StoredBakeLog } from '../../src/data/db';

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

  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [recipeName, setRecipeName] = useState<string>('Wiejski chleb 72%');
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [activeBakeData, setActiveBakeData] = useState<ActiveBakeState | null>(null);

  // Timer states
  const [timeLeftSec, setTimeLeftSec] = useState<number>(BAKE_STEPS[0].timerMin * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Finish Bake Modal & History
  const [isFinishModalOpen, setIsFinishModalOpen] = useState<boolean>(false);
  const [finishRating, setFinishRating] = useState<number>(5);
  const [finishNotes, setFinishNotes] = useState<string>('Chrupiąca skórka, otwarty miękisz i potężne ucho.');
  const [bakeHistory, setBakeHistory] = useState<StoredBakeLog[]>([]);

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
            try {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              // Non-native fallback
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
  }, [isRunning, timeLeftSec]);

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
    setTimeLeftSec(BAKE_STEPS[idx].timerMin * 60);
    setIsRunning(false);
    setIsCompleted(false);
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const resetCurrentStepTimer = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored
    }
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeftSec(currentStep.timerMin * 60);
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
    });

    setActiveBake(null);
    setActiveBakeData(null);
    setIsActive(false);
    setCurrentStepIdx(0);
    setIsFinishModalOpen(false);
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
            {bakeHistory.length === 0 ? (
              <View style={styles.emptyHistoryBox}>
                <Text style={styles.emptyHistoryText}>{t('Brak wcześniejszych wypieków')}</Text>
              </View>
            ) : (
              bakeHistory.slice(0, 5).map((log) => {
                const dateStr = new Date(log.startedAt).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <View key={log.id} style={styles.historyCard}>
                    <View style={styles.historyCardHeader}>
                      <Text style={styles.historyRecipeName}>{log.recipeName}</Text>
                      <Text style={styles.historyStars}>
                        {'⭐'.repeat(log.ratingStars ?? 5)}
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>{dateStr}</Text>
                    {log.notes && <Text style={styles.historyNotes}>{log.notes}</Text>}
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
                <Pressable style={styles.actionBtnNext} onPress={handleNextStep}>
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
});
