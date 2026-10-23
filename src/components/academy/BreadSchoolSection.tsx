import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { BreadSchoolLesson } from '../../core/bread-school';

import { typografia } from '../../ui/tokeny';
export interface BreadSchoolSectionProps {
  lessons: BreadSchoolLesson[];
  completedLevels: number[];
  onToggleLesson: (level: number) => void;
  /** Strażnik otwarcia lekcji (pierwszy poziom w Basic, dalsze w Pro; BR-NAUK-001, D-116); brak = bez strażnika. */
  otworzLekcje?: (level: number, otworz: () => void) => void;
}

export function BreadSchoolSection({
  lessons,
  completedLevels,
  onToggleLesson,
  otworzLekcje,
}: BreadSchoolSectionProps) {
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  return (
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
              accessibilityRole="button"
              testID={`expand-lesson-btn-${lesson.level}`}
              style={styles.lessonHeaderPressable}
              onPress={() => {
                const przelacz = () => setExpandedLessonId((prev) => (prev === lesson.id ? null : lesson.id));
                // Zwinięcie zawsze; rozwinięcie przez strażnika poziomu
                if (isExpanded || !otworzLekcje) przelacz();
                else otworzLekcje(lesson.level, przelacz);
              }}
            >
              <View style={styles.lessonTitleBlock}>
                <View style={styles.levelPillRow}>
                  <Text style={styles.lessonLevelTag}>
                    {t('POZIOM')} {lesson.level}
                  </Text>
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>{t('Zaliczona')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.lessonTitle}>{t(lesson.titlePl)}</Text>
              </View>
              <Text style={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</Text>
            </Pressable>

            {/* Didactic Goal summary */}
            <Text style={styles.goalText}>{t(lesson.didacticGoalPl)}</Text>

            {/* Parameters Pill Grid */}
            <View style={styles.paramsGrid}>
              <Text style={styles.paramChip}>
                {lesson.hydrationPercent}% {t('hydratacji')}
              </Text>
              <Text style={styles.paramChip}>
                {lesson.saltPercent}% {t('soli')}
              </Text>
              <Text style={styles.paramChip}>{t(lesson.flourBlendPl)}</Text>
            </View>

            {isExpanded && (
              <View style={styles.expandedLessonBox}>
                <Text style={styles.subSectionTitle}>{t('Fermentacja i prowadzenie:')}</Text>
                <Text style={styles.fermentTypeText}>{t(lesson.fermentationTypePl)}</Text>

                <Text style={styles.subSectionTitle}>{t('Kroki technologiczne:')}</Text>
                {lesson.stepsPl.map((step, idx) => (
                  <View key={idx} style={styles.stepItemRow}>
                    <View style={styles.stepNumBadge}>
                      <Text style={styles.stepNumText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.stepItemText}>{t(step)}</Text>
                  </View>
                ))}

                <View style={styles.scienceCallout}>
                  <Text style={styles.scienceCalloutTitle}>{t('Fizjologia i chemia:')}</Text>
                  <Text style={styles.scienceCalloutText}>{t(lesson.scientificInsightPl)}</Text>
                </View>

                <View style={styles.passingCallout}>
                  <Text style={styles.passingTitle}>{t('Kryterium zaliczenia:')}</Text>
                  <Text style={styles.passingText}>{t(lesson.passingCriteriaPl)}</Text>
                </View>

                {/* Completion Toggle Button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: !!(isCompleted) }}
                  testID={`toggle-lesson-completed-btn-${lesson.level}`}
                  style={[
                    styles.toggleCompleteBtn,
                    isCompleted ? styles.toggleCompleteBtnActive : styles.toggleCompleteBtnDefault,
                  ]}
                  onPress={() => onToggleLesson(lesson.level)}
                >
                  <Text
                    style={[
                      styles.toggleCompleteBtnText,
                      isCompleted && styles.toggleCompleteBtnTextActive,
                    ]}
                  >
                    {isCompleted
                      ? t('Lekcja ukończona (stuknij, aby cofnąć)')
                      : t('Oznacz lekcję jako zaliczoną')}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabIntroText: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  cardCompleted: {
    borderColor: theme.colors.linia,
    backgroundColor: theme.colors.powierzchnia,
  },
  lessonHeaderPressable: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lessonTitleBlock: {
    get fontFamily() { return theme.typography.krojTytulow; },
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
  lessonLevelTag: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz3,
  },
  completedBadge: {
    backgroundColor: theme.colors.powierzchnia,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  lessonTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  toggleIcon: {
    fontSize: 14,
    color: theme.colors.tusz3,
    padding: 4,
  },
  goalText: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
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
    backgroundColor: theme.colors.tlo,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    color: theme.colors.tusz,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  expandedLessonBox: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.linia,
    paddingTop: theme.spacing.sm,
  },
  subSectionTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: 8,
    marginBottom: 4,
  },
  fermentTypeText: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
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
    backgroundColor: theme.colors.akcent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  stepItemText: {
    flex: 1,
    fontSize: typografia.style.podpis.pt,
    lineHeight: 17,
    color: theme.colors.tusz,
  },
  scienceCallout: {
    backgroundColor: theme.colors.tloGrupa,
    borderRadius: theme.radius.sm,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.obwodka,
  },
  scienceCalloutTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 2,
  },
  scienceCalloutText: {
    fontSize: 11,
    color: theme.colors.tusz,
    lineHeight: 15,
  },
  passingCallout: {
    backgroundColor: theme.colors.tloGrupa,
    borderRadius: theme.radius.sm,
    padding: 8,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.obwodka,
  },
  passingTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 2,
  },
  passingText: {
    fontSize: 11,
    color: theme.colors.tusz,
    lineHeight: 15,
  },
  toggleCompleteBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleCompleteBtnDefault: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  toggleCompleteBtnActive: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.obwodka,
  },
  toggleCompleteBtnText: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
  toggleCompleteBtnTextActive: {
    color: theme.colors.tusz,
  },
});
