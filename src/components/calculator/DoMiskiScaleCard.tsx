// ============================================================================
// Apps4Brew Studio — DoMiskiScaleCard (Progressive Disclosure Level 1: 1-Tap)
// Kitchen-Proof: Duże pola dotykowe >= 52pt, odhaczanie na wadze, haptyka
// ============================================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { formatFixed } from '../../lib/format';
import { DoughRecipeResult } from '../../core/domain-rules';
import { useUnitSystem, formatWeight, formatDoseWeight } from '../../lib/unit-converter';
import { ScaleIngredientRow } from './ScaleIngredientRow';

export interface DoMiskiPreset {
  id: string;
  name: string;
  emoji?: string;
}

export interface DoMiskiScaleCardProps {
  calculations: DoughRecipeResult;
  /** Procent soli z receptury (True Baker's %); bez stałej w karcie [M1-audytor-generalny-059]. */
  saltPercent: number;
  recipeName: string;
  loavesCount: number;
  onLoavesChange: (count: number) => void;
  presets: DoMiskiPreset[];
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
  onStartBake: () => void;
  singleLoafWeightGrams?: number;
  calcMode?: 'loaves' | 'flour';
  onCalcModeChange?: (mode: 'loaves' | 'flour') => void;
  flourGrams?: number;
  onFlourGramsChange?: (grams: number) => void;
  loafWeightGrams?: number;
  onLoafWeightGramsChange?: (grams: number) => void;
}

export function DoMiskiScaleCard({
  calculations,
  saltPercent,
  recipeName,
  loavesCount,
  onLoavesChange,
  presets,
  selectedPresetId,
  onSelectPreset,
  onStartBake,
  calcMode = 'loaves',
  onCalcModeChange,
  flourGrams = 500,
  onFlourGramsChange,
  loafWeightGrams = 850,
}: DoMiskiScaleCardProps) {
  const unitSystem = useUnitSystem();
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
      {/* Calculation Mode Switcher */}
      <View style={styles.modeSwitcherContainer}>
        <Pressable
          style={[styles.modeTab, calcMode === 'loaves' && styles.modeTabActive]}
          onPress={() => onCalcModeChange?.('loaves')}
        >
          <Text style={[styles.modeTabText, calcMode === 'loaves' && styles.modeTabTextActive]}>
            🥖 {t('Bochenki')} ({loavesCount} × {loafWeightGrams}g)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeTab, calcMode === 'flour' && styles.modeTabActive]}
          onPress={() => onCalcModeChange?.('flour')}
        >
          <Text style={[styles.modeTabText, calcMode === 'flour' && styles.modeTabTextActive]}>
            🌾 {t('Masa mąki')} ({flourGrams}g)
          </Text>
        </Pressable>
      </View>

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

      {/* Mode-Specific Input Card */}
      {calcMode === 'flour' ? (
        <View style={styles.loavesRow}>
          <View style={styles.loavesInfo}>
            <Text style={styles.loavesTitle}>{t('Masa mąki bazowej')}</Text>
            <Text style={styles.loavesSubtitle}>
              {t('Mąka stanowi 100% bazy w procentach piekarskich')}
            </Text>
          </View>
          <View style={styles.stepperContainer}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => onFlourGramsChange?.(Math.max(100, flourGrams - 50))}
            >
              <Text style={styles.stepperBtnText}>-50</Text>
            </Pressable>
            <View style={styles.stepperValueBox}>
              <Text style={styles.stepperValueText}>{flourGrams}g</Text>
            </View>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => onFlourGramsChange?.(flourGrams + 50)}
            >
              <Text style={styles.stepperBtnText}>+50</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.loavesRow}>
          <View style={styles.loavesInfo}>
            <Text style={styles.loavesTitle}>{t('Liczba bochenków i gramatura')}</Text>
            <Text style={styles.loavesSubtitle}>
              {recipeName} • {t('{masa} / szt.', { masa: formatWeight(calculations.targetDoughWeightGrams / loavesCount, unitSystem) })}
            </Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 4].map((count) => (
                <Pressable
                  key={count}
                  onPress={() => onLoavesChange(count)}
                  style={[styles.smallChip, loavesCount === count && styles.smallChipActive]}
                >
                  <Text style={[styles.smallChipText, loavesCount === count && styles.smallChipTextActive]}>
                    {t('{n} szt.', { n: count })}
                  </Text>
                </Pressable>
              ))}
            </View>
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
      )}

      {/* ⚖️ Do miski na wagę */}
      <View style={styles.scaleCard}>
        <View style={styles.scaleHeader}>
          <Text style={styles.scaleHeaderTitle}>⚖️ {t('Do miski na wagę')}</Text>
          <Text style={styles.scaleHeaderSubtitle}>
            {t('Odhaczaj składniki w miarę wsypywania')}
          </Text>
        </View>

        <View style={styles.ingredientsList}>
          <ScaleIngredientRow
            testID="scale-item-flour"
            label={`🌾 ${t('Mąka dodana')}`}
            subtext="100% bazy"
            weight={formatWeight(calculations.baseFlourWeightGrams, unitSystem)}
            checked={!!checkedIngredients['flour']}
            onPress={() => toggleCheck('flour')}
          />
          <ScaleIngredientRow
            testID="scale-item-water"
            label={`💧 ${t('Woda')}`}
            subtext={`${calculations.overallHydrationPercent}% ${t('hydratacji')}`}
            weight={formatWeight(calculations.waterGrams, unitSystem)}
            checked={!!checkedIngredients['water']}
            onPress={() => toggleCheck('water')}
          />
          {calculations.starterGrams > 0 && (
            <ScaleIngredientRow
              testID="scale-item-starter"
              label={`🏺 ${t('Aktywny zakwas')}`}
              subtext={t('W szczycie aktywności')}
              weight={formatWeight(calculations.starterGrams, unitSystem)}
              checked={!!checkedIngredients['starter']}
              onPress={() => toggleCheck('starter')}
            />
          )}
          <ScaleIngredientRow
            testID="scale-item-salt"
            label={`🧂 ${t('Sól kłodawska / morska')}`}
            subtext={`${formatFixed(saltPercent, 1)}%`}
            weight={formatDoseWeight(calculations.saltGrams, unitSystem)}
            checked={!!checkedIngredients['salt']}
            onPress={() => toggleCheck('salt')}
          />
          {calculations.yeastGrams > 0 && (
            <ScaleIngredientRow
              testID="scale-item-yeast"
              label={`🫧 ${t('Drożdże')}`}
              weight={formatDoseWeight(calculations.yeastGrams, unitSystem)}
              checked={!!checkedIngredients['yeast']}
              onPress={() => toggleCheck('yeast')}
            />
          )}
        </View>

        {/* Podsumowanie masy ciasta surowego */}
        <View style={styles.totalDoughRow}>
          <Text style={styles.totalDoughLabel}>{t('Całkowita masa ciasta:')}</Text>
          <Text style={styles.totalDoughValue}>
            {formatWeight(calculations.targetDoughWeightGrams, unitSystem)}
          </Text>
        </View>
      </View>

      {/* Główny przycisk CTA: min. 52pt */}
      <Pressable
        testID="fast-start-bake-cta-btn"
        style={styles.fastStartBtn}
        onPress={onStartBake}
      >
        <Pressable testID="start-bake-btn" onPress={onStartBake}>
          <Text style={styles.fastStartBtnText}>
            🥖 {t('Rozpocznij wypiek na Stolnicy')}
          </Text>
        </Pressable>
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
    backgroundColor: theme.colors.accentMuted,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  presetChipTextSelected: {
    color: theme.colors.accent,
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
  modeSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: 4,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  modeTabActive: {
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modeTabTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  smallChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  smallChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  smallChipTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
});
