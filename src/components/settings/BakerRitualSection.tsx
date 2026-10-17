import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { BakerRitualProfile, BakingVessel } from '../../data/sqlite-store';

export interface BakerRitualSectionProps {
  ritualProfile: BakerRitualProfile;
  onProfileChange: (profile: BakerRitualProfile) => void;
  bakingVessel: BakingVessel;
  onVesselChange: (vessel: BakingVessel) => void;
}

export function BakerRitualSection({
  ritualProfile,
  onProfileChange,
  bakingVessel,
  onVesselChange,
}: BakerRitualSectionProps) {
  return (
    <>
      {/* Baking Ritual Profile Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Rytuał piekarski')}</Text>
        <Text style={styles.cardDescription}>
          {t('Wybierz styl prowadzenia ciasta i filozofię wypieku:')}
        </Text>
        <View style={styles.optionsCol}>
          <Pressable
            testID="ritual-purist-btn"
            style={[styles.optionCard, ritualProfile === 'sourdough_purist' && styles.optionCardActive]}
            onPress={() => onProfileChange('sourdough_purist')}
          >
            <Text style={styles.optionEmoji}>🌾</Text>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, ritualProfile === 'sourdough_purist' && styles.optionTitleActive]}>
                {t('Klasyczny Zakwasowiec')}
              </Text>
              <Text style={styles.optionSubtitle}>
                {t('Dziki zakwas, 100% naturalna fermentacja, długi rozrost w chłodzie (4°C) i garnek żeliwny. Zero drożdży komercyjnych.')}
              </Text>
            </View>
            {ritualProfile === 'sourdough_purist' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            testID="ritual-hybrid-btn"
            style={[styles.optionCard, ritualProfile === 'artisan_hybrid' && styles.optionCardActive]}
            onPress={() => onProfileChange('artisan_hybrid')}
          >
            <Text style={styles.optionEmoji}>🥖</Text>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, ritualProfile === 'artisan_hybrid' && styles.optionTitleActive]}>
                {t('Nowoczesny Rzemieślnik')}
              </Text>
              <Text style={styles.optionSubtitle}>
                {t('Zakwas, prefermenty (biga, poolish), ciabatty, bagietki, focaccia i chleby mieszane. Pełna swoboda technik.')}
              </Text>
            </View>
            {ritualProfile === 'artisan_hybrid' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            testID="ritual-beginner-btn"
            style={[styles.optionCard, ritualProfile === 'beginner' && styles.optionCardActive]}
            onPress={() => onProfileChange('beginner')}
          >
            <Text style={styles.optionEmoji}>🍞</Text>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, ritualProfile === 'beginner' && styles.optionTitleActive]}>
                {t('Początkujący Piekarz')}
              </Text>
              <Text style={styles.optionSubtitle}>
                {t('Przewidywalne receptury z bezpieczną hydratacją (65–68%), proste prowadzenie za rękę i brak skomplikowanych wzorów.')}
              </Text>
            </View>
            {ritualProfile === 'beginner' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>
        </View>
      </View>

      {/* Baking Equipment Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('Sprzęt i naczynie do wypieku')}</Text>
        <Text style={styles.cardDescription}>
          {t('Wybierz domyślne naczynie piecowe dla procedury Stolnicy:')}
        </Text>
        <View style={styles.optionsCol}>
          <Pressable
            testID="vessel-dutch-oven-btn"
            style={[styles.optionCard, bakingVessel === 'dutch_oven' && styles.optionCardActive]}
            onPress={() => onVesselChange('dutch_oven')}
          >
            <Text style={styles.optionEmoji}>🍲</Text>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'dutch_oven' && styles.optionTitleActive]}>
                {t('Garnek żeliwny (Dutch Oven)')}
              </Text>
            </View>
            {bakingVessel === 'dutch_oven' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            testID="vessel-cloche-btn"
            style={[styles.optionCard, bakingVessel === 'cloche' && styles.optionCardActive]}
            onPress={() => onVesselChange('cloche')}
          >
            <Text style={styles.optionEmoji}>🏺</Text>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'cloche' && styles.optionTitleActive]}>
                {t('Klosz ceramiczny (Cloche)')}
              </Text>
            </View>
            {bakingVessel === 'cloche' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            testID="vessel-steel-btn"
            style={[styles.optionCard, bakingVessel === 'baking_steel' && styles.optionCardActive]}
            onPress={() => onVesselChange('baking_steel')}
          >
            <Text style={styles.optionEmoji}>🛡️</Text>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'baking_steel' && styles.optionTitleActive]}>
                {t('Stal / Kamień szamotowy')}
              </Text>
            </View>
            {bakingVessel === 'baking_steel' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>

          <Pressable
            testID="vessel-pullman-btn"
            style={[styles.optionCard, bakingVessel === 'pullman_pan' && styles.optionCardActive]}
            onPress={() => onVesselChange('pullman_pan')}
          >
            <Text style={styles.optionEmoji}>🍞</Text>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, bakingVessel === 'pullman_pan' && styles.optionTitleActive]}>
                {t('Foremka z pokrywą (Pullman)')}
              </Text>
            </View>
            {bakingVessel === 'pullman_pan' && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  optionsCol: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentMuted,
  },
  optionEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  optionTitleActive: {
    color: theme.colors.accent,
  },
  optionSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.accent,
    marginLeft: 8,
  },
});
