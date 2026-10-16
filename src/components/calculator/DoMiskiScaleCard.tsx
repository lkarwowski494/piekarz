// ============================================================================
// Apps4Brew Studio — DoMiskiScaleCard (Progressive Disclosure Level 1: 1-Tap)
// Kitchen-Proof: Duże pola dotykowe >= 52pt, odhaczanie na wadze, haptyka
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { DoughRecipeResult } from '../../core/domain-rules';

export interface DoMiskiPreset {
  id: string;
  name: string;
  emoji?: string;
}

export interface DoMiskiScaleCardProps {
  calculations: DoughRecipeResult;
  recipeName: string;
  loavesCount: number;
  onLoavesChange: (count: number) => void;
  presets: DoMiskiPreset[];
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
  onStartBake: () => void;
  singleLoafWeightGrams?: number;
}

export function DoMiskiScaleCard({
  calculations,
  recipeName,
  loavesCount,
  onLoavesChange,
  presets,
  selectedPresetId,
  onSelectPreset,
  onStartBake,
}: DoMiskiScaleCardProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const toggleCheck = (key: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCheckedIngredients((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLoafChange = (delta: number) => {
    const next = Math.max(1, Math.min(20, loavesCount + delta));
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onLoavesChange(next);
  };

  return (
    <View style={styles.cardContainer} testID="do-miski-scale-card">
      {/* Level 1: Quick Bread Selection Chipy */}
      <Text style={styles.sectionLabel}>{t('Co dzisiaj pieczemy?')}</Text>
      <View style={styles.presetsRow}>
        {presets.slice(0, 4).map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <Pressable
              key={preset.id}
              testID={`preset-chip-${preset.id}`}
              style={[styles.presetChip, isSelected && styles.presetChipSelected]}
              onPress={() => {
                try {
                  void Haptics.selectionAsync();
                } catch {}
                onSelectPreset(preset.id);
              }}
            >
              <Text
                style={[
                  styles.presetChipText,
                  isSelected && styles.presetChipTextSelected,
                ]}
                numberOfLines={1}
              >
                {preset.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Stepper liczby bochenków min. 52pt */}
      <View style={styles.loavesRow}>
        <View style={styles.loavesInfo}>
          <Text style={styles.loavesTitle}>{t('Liczba bochenków')}</Text>
          <Text style={styles.loavesSubtitle}>
            {recipeName} • {Math.round(calculations.targetDoughWeightGrams / loavesCount)} g / szt.
          </Text>
        </View>

        <View style={styles.stepperContainer}>
          <Pressable
            testID="loaves-decrement-btn"
            accessibilityLabel={t('Mniej')}
            style={styles.stepperBtn}
            disabled={loavesCount <= 1}
            onPress={() => handleLoafChange(-1)}
          >
            <Text style={[styles.stepperBtnText, loavesCount <= 1 && styles.stepperDisabled]}>
              −
            </Text>
          </Pressable>

          <View style={styles.stepperValueBox}>
            <Text style={styles.stepperValueText} testID="loaves-count-display">
              {loavesCount}
            </Text>
          </View>

          <Pressable
            testID="loaves-increment-btn"
            accessibilityLabel={t('Więcej')}
            style={styles.stepperBtn}
            onPress={() => handleLoafChange(1)}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* ⚖️ Wsyp do miski na wagę */}
      <View style={styles.scaleCard}>
        <View style={styles.scaleHeader}>
          <Text style={styles.scaleHeaderTitle}>⚖️ {t('Wsyp do miski na wagę')}</Text>
          <Text style={styles.scaleHeaderSubtitle}>
            {t('Odhaczaj składniki w miarę wsypywania')}
          </Text>
        </View>

        <View style={styles.ingredientsList}>
          {/* Mąka */}
          <Pressable
            testID="scale-item-flour"
            style={[
              styles.ingredientRow,
              checkedIngredients['flour'] && styles.ingredientRowChecked,
            ]}
            onPress={() => toggleCheck('flour')}
          >
            <View style={styles.checkbox}>
              <Text style={styles.checkboxMark}>
                {checkedIngredients['flour'] ? '✓' : '○'}
              </Text>
            </View>
            <View style={styles.ingredientDetails}>
              <Text
                style={[
                  styles.ingredientName,
                  checkedIngredients['flour'] && styles.ingredientNameChecked,
                ]}
              >
                🌾 {t('Mąka razem')}
              </Text>
              <Text style={styles.ingredientSubtext}>100% bazy</Text>
            </View>
            <Text
              style={[
                styles.ingredientWeight,
                checkedIngredients['flour'] && styles.ingredientWeightChecked,
              ]}
            >
              {Math.round(calculations.totalFlourGrams)} g
            </Text>
          </Pressable>

          {/* Woda */}
          <Pressable
            testID="scale-item-water"
            style={[
              styles.ingredientRow,
              checkedIngredients['water'] && styles.ingredientRowChecked,
            ]}
            onPress={() => toggleCheck('water')}
          >
            <View style={styles.checkbox}>
              <Text style={styles.checkboxMark}>
                {checkedIngredients['water'] ? '✓' : '○'}
              </Text>
            </View>
            <View style={styles.ingredientDetails}>
              <Text
                style={[
                  styles.ingredientName,
                  checkedIngredients['water'] && styles.ingredientNameChecked,
                ]}
              >
                💧 {t('Woda')}
              </Text>
              <Text style={styles.ingredientSubtext}>
                {calculations.overallHydrationPercent}% {t('hydratacji')}
              </Text>
            </View>
            <Text
              style={[
                styles.ingredientWeight,
                checkedIngredients['water'] && styles.ingredientWeightChecked,
              ]}
            >
              {Math.round(calculations.waterGrams)} g
            </Text>
          </Pressable>

          {/* Zakwas */}
          <Pressable
            testID="scale-item-starter"
            style={[
              styles.ingredientRow,
              checkedIngredients['starter'] && styles.ingredientRowChecked,
            ]}
            onPress={() => toggleCheck('starter')}
          >
            <View style={styles.checkbox}>
              <Text style={styles.checkboxMark}>
                {checkedIngredients['starter'] ? '✓' : '○'}
              </Text>
            </View>
            <View style={styles.ingredientDetails}>
              <Text
                style={[
                  styles.ingredientName,
                  checkedIngredients['starter'] && styles.ingredientNameChecked,
                ]}
              >
                🏺 {t('Aktywny zakwas')}
              </Text>
              <Text style={styles.ingredientSubtext}>{t('W szczycie aktywności')}</Text>
            </View>
            <Text
              style={[
                styles.ingredientWeight,
                checkedIngredients['starter'] && styles.ingredientWeightChecked,
              ]}
            >
              {Math.round(calculations.starterGrams)} g
            </Text>
          </Pressable>

          {/* Sól */}
          <Pressable
            testID="scale-item-salt"
            style={[
              styles.ingredientRow,
              checkedIngredients['salt'] && styles.ingredientRowChecked,
            ]}
            onPress={() => toggleCheck('salt')}
          >
            <View style={styles.checkbox}>
              <Text style={styles.checkboxMark}>
                {checkedIngredients['salt'] ? '✓' : '○'}
              </Text>
            </View>
            <View style={styles.ingredientDetails}>
              <Text
                style={[
                  styles.ingredientName,
                  checkedIngredients['salt'] && styles.ingredientNameChecked,
                ]}
              >
                🧂 {t('Sól kłodawska / morska')}
              </Text>
              <Text style={styles.ingredientSubtext}>2.0%</Text>
            </View>
            <Text
              style={[
                styles.ingredientWeight,
                checkedIngredients['salt'] && styles.ingredientWeightChecked,
              ]}
            >
              {Math.round(calculations.saltGrams)} g
            </Text>
          </Pressable>
        </View>

        {/* Podsumowanie masy ciasta surowego */}
        <View style={styles.totalDoughRow}>
          <Text style={styles.totalDoughLabel}>{t('Całkowita masa ciasta:')}</Text>
          <Text style={styles.totalDoughValue}>
            {Math.round(calculations.targetDoughWeightGrams)} g
          </Text>
        </View>
      </View>

      {/* Główny przycisk CTA: min. 52pt */}
      <Pressable
        testID="fast-start-bake-cta-btn"
        style={styles.fastStartBtn}
        onPress={onStartBake}
      >
        <Text style={styles.fastStartBtnText}>
          🚀 {t('Rozpocznij wypiek z asystentem')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  presetChip: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetChipSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  presetChipTextSelected: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  loavesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  loavesInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  loavesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  loavesSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 48,
    height: 48, // Zasada Brudnego Kciuka
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceCard,
  },
  stepperBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepperDisabled: {
    color: theme.colors.textMuted,
  },
  stepperValueBox: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  scaleCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  scaleHeader: {
    marginBottom: theme.spacing.sm,
  },
  scaleHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  scaleHeaderSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 52, // Zasada Brudnego Kciuka
  },
  ingredientRowChecked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },
  checkbox: {
    marginRight: theme.spacing.sm,
  },
  checkboxMark: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  ingredientDetails: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  ingredientNameChecked: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  ingredientSubtext: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  ingredientWeight: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  ingredientWeightChecked: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  totalDoughRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalDoughLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  totalDoughValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  fastStartBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52, // Zasada Brudnego Kciuka
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fastStartBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
