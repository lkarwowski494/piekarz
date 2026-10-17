// ============================================================================
// Piekarz (Crust) — First Launch Onboarding Modal (Ritual Personalization)
// Apps4Craft Studio: Dark Basalt Ceramic (#121214) with Warm Crust Gold (#D49B42)
// 100% Offline-First (SQLite). No tracking, no clouds.
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PiekarzAppIcon } from '@apps4craft/ui';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import {
  BakerRitualProfile,
  setOnboardingCompleted,
  setBakerRitualProfile,
} from '../data/sqlite-store';

export interface OnboardingModalProps {
  visible: boolean;
  onComplete: (profile: BakerRitualProfile) => void;
}

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const [selectedProfile, setSelectedProfile] = useState<BakerRitualProfile>('artisan_hybrid');

  const handleStart = async () => {
    await setBakerRitualProfile(selectedProfile);
    await setOnboardingCompleted(true);
    onComplete(selectedProfile);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Brand Header */}
          <View style={styles.header}>
            <View style={styles.iconStage}>
              <View style={styles.iconSquircle}>
                <PiekarzAppIcon size={44} color={theme.colors.accent} strokeWidth={2} />
              </View>
            </View>
            <Text style={styles.eyebrow}>{t('APPS4CRAFT STUDIO · 100% OFFLINE')}</Text>
            <Text style={styles.title}>{t('Witaj w Piekarzu')}</Text>
            <Text style={styles.subtitle}>
              {t('Spersonalizuj swój rytuał. Aplikacja dostosuje interfejs i kalkulatory do Twojej filozofii wypieku.')}
            </Text>
          </View>

          {/* Section: Choose Prompt */}
          <Text style={styles.choosePrompt}>{t('Jaki jest Twój styl wypieku?')}</Text>

          {/* 3 Ritual Preference Cards */}
          <View style={styles.cardsContainer}>
            {/* 1. Klasyczny Zakwasowiec (Sourdough Purist) */}
            <Pressable
              testID="onboarding-pref-purist"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedProfile === 'sourdough_purist' }}
              style={[
                styles.prefCard,
                selectedProfile === 'sourdough_purist' && styles.prefCardActive,
              ]}
              onPress={() => setSelectedProfile('sourdough_purist')}
            >
              <View style={[styles.cardIconBox, selectedProfile === 'sourdough_purist' && styles.cardIconBoxActive]}>
                <Text style={styles.cardEmoji}>🌾</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, selectedProfile === 'sourdough_purist' && styles.cardTitleActive]}>
                    {t('Klasyczny Zakwasowiec')}
                  </Text>
                  {selectedProfile === 'sourdough_purist' && (
                    <View style={styles.checkIndicator}>
                      <Text style={styles.checkIndicatorText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardDesc}>
                  {t('Dziki zakwas, 100% naturalna fermentacja, długi rozrost w chłodzie (4°C) i garnek żeliwny. Zero drożdży komercyjnych.')}
                </Text>
              </View>
            </Pressable>

            {/* 2. Nowoczesny Piekarz Rzemieślniczy (Artisan Hybrid) */}
            <Pressable
              testID="onboarding-pref-hybrid"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedProfile === 'artisan_hybrid' }}
              style={[
                styles.prefCard,
                selectedProfile === 'artisan_hybrid' && styles.prefCardActive,
              ]}
              onPress={() => setSelectedProfile('artisan_hybrid')}
            >
              <View style={[styles.cardIconBox, selectedProfile === 'artisan_hybrid' && styles.cardIconBoxActive]}>
                <Text style={styles.cardEmoji}>🥖</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, selectedProfile === 'artisan_hybrid' && styles.cardTitleActive]}>
                    {t('Nowoczesny Rzemieślnik')}
                  </Text>
                  {selectedProfile === 'artisan_hybrid' && (
                    <View style={styles.checkIndicator}>
                      <Text style={styles.checkIndicatorText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardDesc}>
                  {t('Zakwas, prefermenty (biga, poolish), ciabatty, bagietki, focaccia i chleby mieszane. Pełna swoboda technik.')}
                </Text>
              </View>
            </Pressable>

            {/* 3. Początkujący Piekarz (Minimalism / Step-by-Step) */}
            <Pressable
              testID="onboarding-pref-beginner"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedProfile === 'beginner' }}
              style={[
                styles.prefCard,
                selectedProfile === 'beginner' && styles.prefCardActive,
              ]}
              onPress={() => setSelectedProfile('beginner')}
            >
              <View style={[styles.cardIconBox, selectedProfile === 'beginner' && styles.cardIconBoxActive]}>
                <Text style={styles.cardEmoji}>🍞</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, selectedProfile === 'beginner' && styles.cardTitleActive]}>
                    {t('Początkujący Piekarz')}
                  </Text>
                  {selectedProfile === 'beginner' && (
                    <View style={styles.checkIndicator}>
                      <Text style={styles.checkIndicatorText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardDesc}>
                  {t('Przewidywalne receptury z bezpieczną hydratacją (65–68%), proste prowadzenie za rękę i brak skomplikowanych wzorów.')}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Privacy & Rygor Badge */}
          <View style={styles.privacyBadge}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              {t('100% Offline. Twoje receptury i notatki są zapisywane wyłącznie w lokalnej bazie na Twoim urządzeniu.')}
            </Text>
          </View>

          {/* Start Ritual Button */}
          <Pressable
            testID="onboarding-start-btn"
            accessibilityRole="button"
            style={styles.startButton}
            onPress={handleStart}
          >
            <Text style={styles.startButtonText}>{t('Rozpocznij rytuał wypieku')}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconStage: {
    marginBottom: 14,
  },
  iconSquircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appEmoji: {
    fontSize: 34,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.accent,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  choosePrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  prefCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'flex-start',
  },
  prefCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surfaceCard,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardIconBoxActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  cardEmoji: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardTitleActive: {
    color: theme.colors.accent,
  },
  checkIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIndicatorText: {
    color: '#121214',
    fontSize: 12,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
    gap: 10,
  },
  privacyIcon: {
    fontSize: 18,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 16,
  },
  startButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#121214',
  },
});
