import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import {
  getBreadSchoolLessons,
  calculateBakerRank,
  BreadSchoolLesson,
} from '../core/bread-school';
import {
  getBakingTechniques,
  filterTechniques,
  TechniqueCategory,
  TechniqueCard,
} from '../core/baking-techniques';
import {
  generateDrillQuestion,
  getBiochemicalFlashcards,
  DrillQuestion,
  BiochemicalFlashcard,
  DrillLevel,
} from '../core/baker-drill';
import {
  getCompletedLessons,
  toggleLessonProgress,
} from '../data/sqlite-store';

type AcademyTab = 'school' | 'techniques' | 'drill';

interface BreadAcademyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BreadAcademyModal({ visible, onClose }: BreadAcademyModalProps) {
  const [activeTab, setActiveTab] = useState<AcademyTab>('school');

  // School state
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  // Techniques state
  const [techCategory, setTechCategory] = useState<TechniqueCategory | 'all'>('all');
  const [expandedTechId, setExpandedTechId] = useState<string | null>(null);

  // Drill & Flashcards state
  const [drillLevel, setDrillLevel] = useState<DrillLevel>(1);
  const [currentQuestion, setCurrentQuestion] = useState<DrillQuestion>(() => generateDrillQuestion(1));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    const list = await getCompletedLessons();
    setCompletedLevels(list);
  }, []);

  useEffect(() => {
    if (visible) {
      loadProgress();
    }
  }, [visible, loadProgress]);

  const lessons = useMemo(() => getBreadSchoolLessons(), []);
  const techniques = useMemo(() => filterTechniques(techCategory), [techCategory]);
  const flashcards = useMemo(() => getBiochemicalFlashcards(), []);
  const rankInfo = useMemo(() => calculateBakerRank(completedLevels), [completedLevels]);

  const handleToggleLesson = async (level: number) => {
    await toggleLessonProgress(level);
    await loadProgress();
  };

  const handleAnswerDrill = (option: number) => {
    if (selectedAnswer !== null) return; // Already answered
    setSelectedAnswer(option);
    const isCorrect = option === currentQuestion.correctAnswer;
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestion(generateDrillQuestion(drillLevel));
  };

  const handleChangeDrillLevel = (lvl: DrillLevel) => {
    setDrillLevel(lvl);
    setSelectedAnswer(null);
    setCurrentQuestion(generateDrillQuestion(lvl));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.title}>🎓 {t('Akademia Piekarza')}</Text>
            <Pressable
              testID="close-academy-modal-btn"
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityLabel={t('Zamknij Akademię')}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Rank Summary Badge */}
          <View style={styles.rankBadgeRow}>
            <Text style={styles.rankText}>
              🏅 {rankInfo.currentRankPl} ({rankInfo.completedCount}/{rankInfo.totalLessons} {t('lekcji')})
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, { width: `${rankInfo.progressPercent}%` }]}
              />
            </View>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabNavRow}>
            <Pressable
              testID="academy-tab-school"
              style={[styles.navTab, activeTab === 'school' && styles.navTabActive]}
              onPress={() => setActiveTab('school')}
            >
              <Text style={[styles.navTabText, activeTab === 'school' && styles.navTabTextActive]}>
                🥖 {t('Szkoła Chleba')}
              </Text>
            </Pressable>
            <Pressable
              testID="academy-tab-techniques"
              style={[styles.navTab, activeTab === 'techniques' && styles.navTabActive]}
              onPress={() => setActiveTab('techniques')}
            >
              <Text style={[styles.navTabText, activeTab === 'techniques' && styles.navTabTextActive]}>
                📖 {t('Techniki')}
              </Text>
            </Pressable>
            <Pressable
              testID="academy-tab-drill"
              style={[styles.navTab, activeTab === 'drill' && styles.navTabActive]}
              onPress={() => setActiveTab('drill')}
            >
              <Text style={[styles.navTabText, activeTab === 'drill' && styles.navTabTextActive]}>
                🧠 {t('Trener i Fiszki')}
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: SZKOŁA CHLEBA (SCI) */}
          {activeTab === 'school' && (
            <View>
              <Text style={styles.tabIntroText}>
                {t(
                  '6-stopniowa rzemieślnicza ścieżka wtajemniczenia. Od prostego chleba bez wyrabiania do mistrzowskiego Tartine i pizzy neapolitańskiej.'
                )}
              </Text>

              {lessons.map((lesson) => {
                const isCompleted = completedLevels.includes(lesson.level);
                const isExpanded = expandedLessonId === lesson.id;
                return (
                  <View
                    key={lesson.id}
                    style={[styles.card, isCompleted && styles.cardCompleted]}
                    testID={`lesson-card-${lesson.level}`}
                  >
                    <Pressable
                      testID={`expand-lesson-btn-${lesson.level}`}
                      style={styles.lessonHeaderPressable}
                      onPress={() =>
                        setExpandedLessonId((prev) => (prev === lesson.id ? null : lesson.id))
                      }
                    >
                      <View style={styles.lessonTitleBlock}>
                        <View style={styles.levelPillRow}>
                          <Text style={styles.lessonBadge}>{lesson.badge}</Text>
                          <Text style={styles.lessonLevelTag}>
                            {t('POZIOM')} {lesson.level}: {lesson.rankTitlePl}
                          </Text>
                          {isCompleted && (
                            <View style={styles.completedBadge}>
                              <Text style={styles.completedBadgeText}>✓ {t('Zaliczona')}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.lessonTitle}>{lesson.titlePl}</Text>
                      </View>
                      <Text style={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</Text>
                    </Pressable>

                    {/* Didactic Goal summary */}
                    <Text style={styles.goalText}>🎯 {lesson.didacticGoalPl}</Text>

                    {/* Parameters Pill Grid */}
                    <View style={styles.paramsGrid}>
                      <Text style={styles.paramChip}>
                        💧 {lesson.hydrationPercent}% {t('hydratacji')}
                      </Text>
                      <Text style={styles.paramChip}>
                        🧂 {lesson.saltPercent}% {t('soli')}
                      </Text>
                      <Text style={styles.paramChip}>🌾 {lesson.flourBlendPl}</Text>
                    </View>

                    {isExpanded && (
                      <View style={styles.expandedLessonBox}>
                        <Text style={styles.subSectionTitle}>{t('Fermentacja i prowadzenie:')}</Text>
                        <Text style={styles.fermentTypeText}>⏱️ {lesson.fermentationTypePl}</Text>

                        <Text style={styles.subSectionTitle}>{t('Kroki technologiczne:')}</Text>
                        {lesson.stepsPl.map((step, idx) => (
                          <View key={idx} style={styles.stepItemRow}>
                            <View style={styles.stepNumBadge}>
                              <Text style={styles.stepNumText}>{idx + 1}</Text>
                            </View>
                            <Text style={styles.stepItemText}>{step}</Text>
                          </View>
                        ))}

                        <View style={styles.scienceCallout}>
                          <Text style={styles.scienceCalloutTitle}>🔬 {t('Fizjologia i chemia:')}</Text>
                          <Text style={styles.scienceCalloutText}>{lesson.scientificInsightPl}</Text>
                        </View>

                        <View style={styles.passingCallout}>
                          <Text style={styles.passingTitle}>🏅 {t('Kryterium zaliczenia:')}</Text>
                          <Text style={styles.passingText}>{lesson.passingCriteriaPl}</Text>
                        </View>

                        {/* Completion Toggle Button */}
                        <Pressable
                          testID={`toggle-lesson-completed-btn-${lesson.level}`}
                          style={[
                            styles.toggleCompleteBtn,
                            isCompleted ? styles.toggleCompleteBtnActive : styles.toggleCompleteBtnDefault,
                          ]}
                          onPress={() => handleToggleLesson(lesson.level)}
                        >
                          <Text
                            style={[
                              styles.toggleCompleteBtnText,
                              isCompleted && styles.toggleCompleteBtnTextActive,
                            ]}
                          >
                            {isCompleted
                              ? `✓ ${t('Lekcja ukończona (stuknij, aby cofnąć)')}`
                              : `Mark as done: ${t('Oznacz lekcję jako zaliczoną')} ✓`}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* TAB 2: BIBLIOTEKA TECHNIK (BIB) */}
          {activeTab === 'techniques' && (
            <View>
              <Text style={styles.tabIntroText}>
                {t(
                  '12 autorskich kart rzemieślniczych z fizykochemicznymi regułami, krokami wykonania i typowymi błędami.'
                )}
              </Text>

              {/* Technique Category Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.techCategoryScroll}
              >
                <Pressable
                  style={[styles.smallChip, techCategory === 'all' && styles.smallChipActive]}
                  onPress={() => setTechCategory('all')}
                >
                  <Text style={[styles.smallChipText, techCategory === 'all' && styles.smallChipTextActive]}>
                    {t('Wszystkie')} (12)
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.smallChip, techCategory === 'dough_prep' && styles.smallChipActive]}
                  onPress={() => setTechCategory('dough_prep')}
                >
                  <Text style={[styles.smallChipText, techCategory === 'dough_prep' && styles.smallChipTextActive]}>
                    🥣 {t('Wyrabianie')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.smallChip, techCategory === 'bulk_fermentation' && styles.smallChipActive]}
                  onPress={() => setTechCategory('bulk_fermentation')}
                >
                  <Text style={[styles.smallChipText, techCategory === 'bulk_fermentation' && styles.smallChipTextActive]}>
                    🌀 {t('Składania')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.smallChip, techCategory === 'shaping' && styles.smallChipActive]}
                  onPress={() => setTechCategory('shaping')}
                >
                  <Text style={[styles.smallChipText, techCategory === 'shaping' && styles.smallChipTextActive]}>
                    🥖 {t('Formowanie')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.smallChip, techCategory === 'baking_cooling' && styles.smallChipActive]}
                  onPress={() => setTechCategory('baking_cooling')}
                >
                  <Text style={[styles.smallChipText, techCategory === 'baking_cooling' && styles.smallChipTextActive]}>
                    🔥 {t('Wypiek i studzenie')}
                  </Text>
                </Pressable>
              </ScrollView>

              {techniques.map((tech) => {
                const isExpanded = expandedTechId === tech.id;
                return (
                  <View key={tech.id} style={styles.card} testID={`tech-card-${tech.code}`}>
                    <Pressable
                      style={styles.lessonHeaderPressable}
                      onPress={() =>
                        setExpandedTechId((prev) => (prev === tech.id ? null : tech.id))
                      }
                    >
                      <View style={styles.lessonTitleBlock}>
                        <View style={styles.levelPillRow}>
                          <Text style={styles.lessonBadge}>{tech.icon}</Text>
                          <Text style={styles.techCodeTag}>{tech.code}</Text>
                        </View>
                        <Text style={styles.cardTitle}>{tech.titlePl}</Text>
                      </View>
                      <Text style={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</Text>
                    </Pressable>

                    <Text style={styles.techPrincipleText}>💡 {tech.physicalPrinciplePl}</Text>

                    {isExpanded && (
                      <View style={styles.expandedLessonBox}>
                        <Text style={styles.subSectionTitle}>{t('Prawidłowe wykonanie:')}</Text>
                        {tech.executionStepsPl.map((step, idx) => (
                          <View key={idx} style={styles.stepItemRow}>
                            <Text style={styles.checkBullet}>✓</Text>
                            <Text style={styles.stepItemText}>{step}</Text>
                          </View>
                        ))}

                        <Text style={styles.subSectionTitleMistake}>{t('Czego unikać (typowe błędy):')}</Text>
                        {tech.commonMistakesPl.map((mistake, idx) => (
                          <View key={idx} style={styles.stepItemRow}>
                            <Text style={styles.crossBullet}>✕</Text>
                            <Text style={styles.mistakeText}>{mistake}</Text>
                          </View>
                        ))}

                        <View style={styles.techProTipBox}>
                          <Text style={styles.proTipTitle}>🌟 {t('Złota rada rzemieślnika:')}</Text>
                          <Text style={styles.proTipText}>{tech.proTipsPl}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* TAB 3: TRENER PROCENTU & FISZKI (TRE) */}
          {activeTab === 'drill' && (
            <View>
              {/* Mental Baker Drill Game */}
              <View style={styles.drillBox}>
                <View style={styles.drillHeaderRow}>
                  <Text style={styles.drillTitle}>🧠 {t('Trener Szybkiego Rachunku')}</Text>
                  <Text style={styles.drillScore}>
                    🏆 {score.correct}/{score.total} ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%)
                  </Text>
                </View>
                <Text style={styles.drillSubtitle}>
                  {t('Ćwicz intuicję proporcji piekarskich w pamięci (Mental Baker Drill)')}
                </Text>

                {/* Level selector */}
                <View style={styles.drillLevelRow}>
                  {[1, 2, 3].map((lvl) => (
                    <Pressable
                      key={lvl}
                      testID={`drill-level-${lvl}`}
                      style={[styles.smallChip, drillLevel === lvl && styles.smallChipActive]}
                      onPress={() => handleChangeDrillLevel(lvl as DrillLevel)}
                    >
                      <Text
                        style={[
                          styles.smallChipText,
                          drillLevel === lvl && styles.smallChipTextActive,
                        ]}
                      >
                        {t('Poziom')} {lvl} {lvl === 1 ? '(Woda & Sól)' : lvl === 2 ? '(Mieszanki mąk)' : '(True Baker %)'}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Question */}
                <View style={styles.questionCard}>
                  <Text style={styles.questionText} testID="drill-question-text">
                    {currentQuestion.questionPl}
                  </Text>

                  {/* 4 Clickable Options */}
                  <View style={styles.optionsGrid}>
                    {currentQuestion.options.map((opt, idx) => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrect = opt === currentQuestion.correctAnswer;
                      let btnStyle = styles.optionBtn;
                      if (selectedAnswer !== null) {
                        if (isCorrect) btnStyle = styles.optionBtnCorrect;
                        else if (isSelected) btnStyle = styles.optionBtnWrong;
                      }
                      return (
                        <Pressable
                          key={idx}
                          testID={`drill-option-${opt}`}
                          style={btnStyle}
                          onPress={() => handleAnswerDrill(opt)}
                          disabled={selectedAnswer !== null}
                        >
                          <Text
                            style={[
                              styles.optionBtnText,
                              selectedAnswer !== null && isCorrect && styles.optionBtnTextCorrect,
                            ]}
                          >
                            {opt} {currentQuestion.unit}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Immediate Explanation */}
                  {selectedAnswer !== null && (
                    <View style={styles.explanationBox} testID="drill-explanation-box">
                      <Text style={styles.explanationTitle}>
                        {selectedAnswer === currentQuestion.correctAnswer
                          ? `🎉 ${t('Świetnie! Prawidłowa odpowiedź!')}`
                          : `💡 ${t('Krok obliczeniowy:')}`}
                      </Text>
                      <Text style={styles.explanationText}>{currentQuestion.explanationPl}</Text>
                      <Pressable
                        testID="drill-next-question-btn"
                        style={styles.nextQuestionBtn}
                        onPress={handleNextQuestion}
                      >
                        <Text style={styles.nextQuestionBtnText}>➡️ {t('Następne pytanie')}</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>

              {/* Biochemical Flashcards Section */}
              <Text style={styles.sectionHeading}>🔬 {t('Baza Fiszek Biochemicznych')}</Text>
              <Text style={styles.sectionSubheading}>
                {t('Naukowa wiedza o strukturze ziarna, enzymach i mikrobiologii zakwasu')}
              </Text>

              {flashcards.map((card) => {
                const isRevealed = expandedCardId === card.id;
                return (
                  <View key={card.id} style={styles.card} testID={`flashcard-${card.id}`}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{card.titlePl}</Text>
                      <View style={styles.leitnerBadge}>
                        <Text style={styles.leitnerBadgeText}>📚 Box {card.box}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardPromptText}>❓ {card.frontSummaryPl}</Text>

                    <Pressable
                      testID={`reveal-card-${card.id}`}
                      style={styles.revealBtn}
                      onPress={() =>
                        setExpandedCardId((prev) => (prev === card.id ? null : card.id))
                      }
                    >
                      <Text style={styles.revealBtnText}>
                        {isRevealed ? `▲ ${t('Zwiń wyjaśnienie')}` : `▼ ${t('Odkryj wiedzę naukową')}`}
                      </Text>
                    </Pressable>

                    {isRevealed && (
                      <View style={styles.revealedContent}>
                        <Text style={styles.backDeepDiveText}>{card.backDeepDivePl}</Text>
                        <View style={styles.takeawayBox}>
                          <Text style={styles.takeawayTitle}>🎯 {t('Wniosek do wypieku:')}</Text>
                          <Text style={styles.takeawayText}>{card.keyTakeawayPl}</Text>
                        </View>
                        <Text style={styles.citationText}>📖 {card.citation}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  rankBadgeRow: {
    backgroundColor: theme.colors.surfaceCard,
    padding: 8,
    borderRadius: theme.radius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
    marginBottom: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  navTabActive: {
    backgroundColor: theme.colors.surface,
  },
  navTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  navTabTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 36,
  },
  tabIntroText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardCompleted: {
    borderColor: '#A5D6A7',
    backgroundColor: '#F1F8E9',
  },
  lessonHeaderPressable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lessonTitleBlock: {
    flex: 1,
    marginRight: 8,
  },
  levelPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  lessonBadge: {
    fontSize: 18,
  },
  lessonLevelTag: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#81C784',
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  toggleIcon: {
    fontSize: 14,
    color: theme.colors.textMuted,
    padding: 4,
  },
  goalText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  paramsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  paramChip: {
    fontSize: 11,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  expandedLessonBox: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  subSectionTitleMistake: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.statusDanger,
    marginTop: 8,
    marginBottom: 4,
  },
  fermentTypeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  stepNumBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkBullet: {
    color: '#2E7D32',
    fontWeight: '700',
    marginRight: 6,
  },
  crossBullet: {
    color: theme.colors.statusDanger,
    fontWeight: '700',
    marginRight: 6,
  },
  stepItemText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textPrimary,
  },
  mistakeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary,
  },
  scienceCallout: {
    backgroundColor: '#E8EAF6',
    borderRadius: theme.radius.sm,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3F51B5',
  },
  scienceCalloutTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 2,
  },
  scienceCalloutText: {
    fontSize: 11,
    color: '#283593',
    lineHeight: 15,
  },
  passingCallout: {
    backgroundColor: '#FFF8E1',
    borderRadius: theme.radius.sm,
    padding: 8,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FFA000',
  },
  passingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#795548',
    marginBottom: 2,
  },
  passingText: {
    fontSize: 11,
    color: '#4E342E',
    lineHeight: 15,
  },
  toggleCompleteBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleCompleteBtnDefault: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  toggleCompleteBtnActive: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
  },
  toggleCompleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleCompleteBtnTextActive: {
    color: '#1B5E20',
  },
  techCategoryScroll: {
    marginBottom: theme.spacing.md,
  },
  techCodeTag: {
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    color: theme.colors.accentDark,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  techPrincipleText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  techProTipBox: {
    backgroundColor: theme.colors.surfaceCard,
    padding: 8,
    borderRadius: theme.radius.sm,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  proTipTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accent,
    marginBottom: 2,
  },
  proTipText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    lineHeight: 15,
  },
  smallChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 6,
  },
  smallChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  smallChipText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  smallChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  drillBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  drillHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  drillTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  drillScore: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  drillSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  drillLevelRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionBtnCorrect: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#C8E6C9',
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  optionBtnWrong: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#FFCDD2',
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E53935',
  },
  optionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  optionBtnTextCorrect: {
    color: '#1B5E20',
    fontWeight: '700',
  },
  explanationBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accent,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  nextQuestionBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  nextQuestionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  sectionSubheading: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leitnerBadge: {
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  leitnerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  cardPromptText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 18,
  },
  revealBtn: {
    paddingVertical: 6,
  },
  revealBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  revealedContent: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  backDeepDiveText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  takeawayBox: {
    backgroundColor: theme.colors.surfaceCard,
    padding: 8,
    borderRadius: theme.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    marginBottom: 6,
  },
  takeawayTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accent,
    marginBottom: 2,
  },
  takeawayText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    lineHeight: 15,
  },
  citationText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
});
