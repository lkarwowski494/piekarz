import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import { confirmDiscardBake } from '../../src/lib/confirm';
import { saveBakeLog } from '../../src/data/sqlite-store';

const BAKE_STEPS = [
  { id: 'step_1', name: 'Autoliza', desc: 'Mąka + woda, odpoczynek 45 min.', timerMin: 45 },
  { id: 'step_2', name: 'Mieszanie i zaszczepienie', desc: 'Dodanie zakwasu i soli, wyrabianie do gładkości.', timerMin: 15 },
  { id: 'step_3', name: 'Składanie 1 (Stretch & Fold)', desc: 'Podciągnij 4 brzegi ciasta do środka z miski.', timerMin: 30 },
  { id: 'step_4', name: 'Składanie 2 (Coil Fold)', desc: 'Delikatne podłożenie rąk i zawinięcie pod spód.', timerMin: 30 },
  { id: 'step_5', name: 'Składanie 3 (Coil Fold)', desc: 'Budowanie napięcia powierzchniowego.', timerMin: 30 },
  { id: 'step_6', name: 'Formowanie wstępne (Pre-shape)', desc: 'Podtoczenie w kulę na blacie bez nadmiaru mąki.', timerMin: 20 },
  { id: 'step_7', name: 'Formowanie do koszyka', desc: 'Nadanie ostatecznego kształtu i do lodówki.', timerMin: 720 },
  { id: 'step_8', name: 'Wypiek z parą', desc: '20 min w 240°C pod pokrywką + 25 min w 210°C.', timerMin: 45 },
];

export default function StolnicaScreen() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [recipeName, setRecipeName] = useState('Country Loaf 72%');
  const [startedAt, setStartedAt] = useState<number>(Date.now());

  const handleStartBake = () => {
    setIsActive(true);
    setCurrentStepIdx(0);
    setStartedAt(Date.now());
  };

  const handleNextStep = () => {
    if (currentStepIdx < BAKE_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      handleFinishBake();
    }
  };

  const handleFinishBake = async () => {
    await saveBakeLog({
      id: `bake_${Date.now()}`,
      recipeName,
      startedAt,
      finishedAt: Date.now(),
      ratingStars: 5,
      notes: 'Udany wypiek z chrupiącą skórką i otwartym uchem.',
    });
    setIsActive(false);
    setCurrentStepIdx(0);
  };

  const handleDiscard = () => {
    confirmDiscardBake(() => {
      setIsActive(false);
      setCurrentStepIdx(0);
    });
  };

  const currentStep = BAKE_STEPS[currentStepIdx];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Stolnica')}</Text>
          <Text style={styles.subtitle}>Asystent wypieku na żywo (Hands-in-flour)</Text>
        </View>

        {!isActive ? (
          <View style={styles.idleCard}>
            <Text style={styles.idleTitle}>Brak aktywnego wypieku</Text>
            <Text style={styles.idleText}>
              Przygotuj mąkę, wodę i aktywny zakwas. Stolnica poprowadzi Cię krok po kroku
              przez proces autolizy, składania i wypieku z dużymi przyciskami ułatwiającymi obsługę oprószonymi mąką dłońmi.
            </Text>

            <Pressable style={styles.startBtn} onPress={handleStartBake}>
              <Text style={styles.startBtnText}>Rozpocznij wypiek</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            {/* Active Header Card */}
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

              {/* Big Hands-in-Flour Controls */}
              <View style={styles.controlsRow}>
                <Pressable style={styles.actionBtnNext} onPress={handleNextStep}>
                  <Text style={styles.actionBtnNextText}>
                    {currentStepIdx === BAKE_STEPS.length - 1 ? 'Zakończ wypiek' : 'Kolejny krok ✓'}
                  </Text>
                </Pressable>
              </View>

              <Pressable style={styles.discardBtn} onPress={handleDiscard}>
                <Text style={styles.discardBtnText}>Odrzuć wypiek</Text>
              </Pressable>
            </View>

            {/* Steps Overview */}
            <Text style={styles.sectionHeading}>Wszystkie etapy wypieku</Text>
            {BAKE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <View
                  key={step.id}
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
                </View>
              );
            })}
          </View>
        )}
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 20,
  },
  idleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  idleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: theme.radius.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  activeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepBadge: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  recipeTag: {
    fontSize: 12,
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
    marginBottom: 18,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  actionBtnNext: {
    flex: 1,
    backgroundColor: theme.colors.accent,
    minHeight: 52,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnNextText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  discardBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  discardBtnText: {
    color: theme.colors.statusDanger,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 10,
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
});
