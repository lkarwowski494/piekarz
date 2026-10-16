// ============================================================================
// Apps4Brew Studio — ArtisanAccordionPro (Progressive Disclosure Level 2)
// Zwijany panel dla rzemieślników: 4-DDT, lód, prefermenty, strata piecowa
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import {
  PrefermentType,
  PREFERMENT_DEFINITIONS,
  PrefermentBreakdownResult,
} from '../../core/preferments';
import {
  FlourItemInput,
  POPULAR_FLOUR_BLENDS,
  HydrationDifficultyInfo,
  BAKE_LOSS_PRESETS,
  BakeTypePresetId,
  BakeLossMetricsResult,
} from '../../core/domain-rules';
import { BlendAbsorptionAnalysis } from '../../core/flour-atlas';
import { useUnitSystem, formatWeight, formatTemperature } from '../../lib/unit-converter';

export interface ArtisanAccordionProProps {
  isOpen: boolean;
  onToggle: () => void;
  // DDT
  targetDdt: number;
  onTargetDdtChange: (val: number) => void;
  waterTempTarget: number;
  iceGrams?: number;
  ambientTemp: number;
  flourTemp: number;
  frictionFactor: number;
  // Flour blend
  flourBlend: FlourItemInput[];
  onOpenBlendModal: () => void;
  onSelectFlourBlend?: (blend: (typeof POPULAR_FLOUR_BLENDS)[number]) => void;
  onOpenInventory?: () => void;
  onOpenEquivalents?: () => void;
  // Water & Hydration
  waterPct: number;
  onWaterPctChange: (pct: number) => void;
  hydrationDifficulty?: HydrationDifficultyInfo;
  blendAbsorption?: BlendAbsorptionAnalysis;
  // Preferments
  prefermentType: PrefermentType;
  onPrefermentTypeChange: (type: PrefermentType) => void;
  prefermentFlourPct?: number;
  onPrefermentFlourPctChange?: (pct: number) => void;
  prefermentBreakdown?: PrefermentBreakdownResult | null;
  // Bake Loss
  bakeLossPercent: number;
  onBakeLossPercentChange?: (pct: number) => void;
  bakedTotalWeightGrams: number;
  bakeLossMetrics?: BakeLossMetricsResult;
  selectedBakeLossPresetId?: BakeTypePresetId;
  onSelectBakeLossPreset?: (id: BakeTypePresetId) => void;
}

export function ArtisanAccordionPro({
  isOpen,
  onToggle,
  targetDdt,
  onTargetDdtChange,
  waterTempTarget,
  iceGrams,
  ambientTemp,
  flourTemp,
  frictionFactor,
  flourBlend,
  onOpenBlendModal,
  onSelectFlourBlend,
  onOpenInventory,
  onOpenEquivalents,
  waterPct,
  onWaterPctChange,
  hydrationDifficulty,
  blendAbsorption,
  prefermentType,
  onPrefermentTypeChange,
  prefermentFlourPct = 20,
  onPrefermentFlourPctChange,
  prefermentBreakdown,
  bakeLossPercent,
  onBakeLossPercentChange,
  bakedTotalWeightGrams,
  bakeLossMetrics,
  selectedBakeLossPresetId,
  onSelectBakeLossPreset,
}: ArtisanAccordionProProps) {
  const unitSystem = useUnitSystem();
  return (
    <View style={styles.container} testID="artisan-accordion-pro">
      {/* Accordion Header / Toggle */}
      <Pressable
        testID="artisan-accordion-toggle-btn"
        style={styles.toggleHeader}
        onPress={onToggle}
      >
        <View style={styles.toggleTitleRow}>
          <Text style={styles.toggleEmoji}>🔬</Text>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>
              {t('Parametry Rzemieślnicze & Mąki')}
            </Text>
            <Text style={styles.toggleSubtitle}>
              {t('4-DDT, matematyka lodu, prefermenty, strata piecowa')}
            </Text>
          </View>
        </View>
        <View style={[styles.arrowBadge, isOpen && styles.arrowBadgeOpen]}>
          <Text style={styles.arrowText}>{isOpen ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {/* Accordion Body */}
      {isOpen && (
        <View style={styles.bodyContent} testID="artisan-accordion-body">
          {/* 1. Sekcja 4-DDT & Temperatura Wody */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>
              🌡️ {t('Kalkulator 4-DDT i Temperatura Wody')}
            </Text>
            <Text style={styles.sectionDesc}>
              {t(
                'Właściwa temperatura wody zapewnia docelową temperaturę ciasta po wymieszaniu.'
              )}
            </Text>

            <View style={styles.ddtResultCard}>
              <View style={styles.ddtResultRow}>
                <Text style={styles.ddtResultLabel}>{t('Docelowa temp. wody:')}</Text>
                <Text style={styles.ddtResultValue}>
                  {waterTempTarget > 0 ? formatTemperature(waterTempTarget, unitSystem) : '0°C (Lód)'}
                </Text>
              </View>

              {iceGrams !== undefined && iceGrams > 0 && (
                <View style={styles.iceAlertRow}>
                  <Text style={styles.iceIcon}>🧊</Text>
                  <Text style={styles.iceText}>
                    {t('Zastąp część wody lodem:')} {formatWeight(iceGrams, unitSystem)} {t('lodu')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.gridParams}>
              <View style={styles.paramBox}>
                <Text style={styles.paramLabel}>{t('Docelowe DDT')}</Text>
                <View style={styles.stepperInline}>
                  <Pressable
                    testID="ddt-minus-btn"
                    style={styles.miniBtn}
                    onPress={() => onTargetDdtChange(Math.max(18, targetDdt - 0.5))}
                  >
                    <Text style={styles.miniBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.paramValue}>{formatTemperature(targetDdt, unitSystem)}</Text>
                  <Pressable
                    testID="ddt-plus-btn"
                    style={styles.miniBtn}
                    onPress={() => onTargetDdtChange(Math.min(32, targetDdt + 0.5))}
                  >
                    <Text style={styles.miniBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.paramBox}>
                <Text style={styles.paramLabel}>{t('Hydratacja bazy')}</Text>
                <View style={styles.stepperInline}>
                  <Pressable
                    testID="water-pct-minus-btn"
                    style={styles.miniBtn}
                    onPress={() => onWaterPctChange(Math.max(50, Number((waterPct - 1).toFixed(1))))}
                  >
                    <Text style={styles.miniBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.paramValue}>{waterPct.toFixed(1)}%</Text>
                  <Pressable
                    testID="water-pct-plus-btn"
                    style={styles.miniBtn}
                    onPress={() => onWaterPctChange(Math.min(100, Number((waterPct + 1).toFixed(1))))}
                  >
                    <Text style={styles.miniBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Steppery -5%, -1%, +1%, +5% */}
            <View style={styles.stepperRow}>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => onWaterPctChange(Math.max(50, Number((waterPct - 5).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>-5%</Text>
              </Pressable>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => onWaterPctChange(Math.max(50, Number((waterPct - 1).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>-1%</Text>
              </Pressable>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => onWaterPctChange(Math.min(100, Number((waterPct + 1).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>+1%</Text>
              </Pressable>
              <Pressable
                style={styles.paramStepBtn}
                onPress={() => onWaterPctChange(Math.min(100, Number((waterPct + 5).toFixed(1))))}
              >
                <Text style={styles.paramStepText}>+5%</Text>
              </Pressable>
            </View>

            {/* Badge trudności hydratacji */}
            {hydrationDifficulty && (
              <View style={styles.diffBadgeRow}>
                <View style={[styles.diffBadge, { backgroundColor: hydrationDifficulty.badgeColor + '20' }]}>
                  <Text style={[styles.diffBadgeText, { color: hydrationDifficulty.badgeColor }]}>
                    ● {hydrationDifficulty.labelPl}
                  </Text>
                </View>
                <Text style={styles.diffTipText}>{hydrationDifficulty.tipPl}</Text>
              </View>
            )}

            {/* Chłonność mąk */}
            {blendAbsorption && (
              <View style={styles.absorptionBadge} testID="flour-absorption-badge">
                <Text style={styles.absorptionLabel}>
                  🌾 {t('Chłonność mąk:')} {blendAbsorption.weightedAbsorptionPercent}% ({t('zalecana')}: {blendAbsorption.recommendedHydrationRange[0]}–{blendAbsorption.recommendedHydrationRange[1]}%) • {t('Białko')}: ~{blendAbsorption.estimatedProteinPercent}%
                </Text>
                <Text style={styles.absorptionAdviceText}>
                  💡 {blendAbsorption.doughFeelAdvicePl}
                </Text>
              </View>
            )}
          </View>

          {/* 2. Blend Mąk i Chłonność */}
          <View style={styles.sectionBlock}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionHeaderTitle}>🌾 {t('Mieszanka mąk')}</Text>
              <Pressable
                testID="edit-blend-pro-btn"
                style={styles.pillActionBtn}
                onPress={onOpenBlendModal}
              >
                <Text style={styles.pillActionText}>{t('Edytuj blend')}</Text>
              </Pressable>
            </View>

            {/* Popular flour blend presets */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blendScroll}>
              {POPULAR_FLOUR_BLENDS.map((blend) => (
                <Pressable
                  key={blend.id}
                  onPress={() => onSelectFlourBlend?.(blend)}
                  style={styles.blendPresetChip}
                >
                  <Text style={styles.blendPresetText}>{blend.namePl}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.flourPillsContainer}>
              {flourBlend.map((f, i) => (
                <View key={i} style={styles.flourTag}>
                  <Text style={styles.flourTagText}>
                    {f.name}: {f.percentage}%
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.flourActionsRow}>
              <Pressable
                testID="open-blend-builder-btn"
                style={styles.flourActionBtn}
                onPress={onOpenBlendModal}
              >
                <Text style={styles.flourActionBtnText}>⚙️ {t('Skomponuj własną mieszankę mąk')}</Text>
              </Pressable>
              {onOpenInventory && (
                <Pressable
                  testID="open-flour-inventory-btn"
                  style={styles.flourActionBtn}
                  onPress={onOpenInventory}
                >
                  <Text style={styles.flourActionBtnText}>🌾 {t('Spiżarnia mąk & Stan zapasów')}</Text>
                </Pressable>
              )}
              {onOpenEquivalents && (
                <Pressable
                  testID="open-flour-equivalents-btn"
                  style={styles.flourActionBtn}
                  onPress={onOpenEquivalents}
                >
                  <Text style={styles.flourActionBtnText}>🌍 {t('Słownik Odpowiedników Mąk')}</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* 3. Prefermenty Rzemieślnicze */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>🏺 {t('Zaczyny rzemieślnicze (Preferments)')}</Text>
            <View style={styles.prefermentButtonsRow}>
              {(['direct', 'poolish', 'biga', 'pate_fermentee', 'levain'] as PrefermentType[]).map(
                (pType) => {
                  const isSel = prefermentType === pType;
                  return (
                    <Pressable
                      key={pType}
                      testID={`pref-type-${pType}`}
                      style={[styles.prefBtn, isSel && styles.prefBtnSelected]}
                      onPress={() => onPrefermentTypeChange(pType)}
                    >
                      <Pressable
                        testID={`preferment-type-${pType}`}
                        onPress={() => onPrefermentTypeChange(pType)}
                      >
                        <Text
                          style={[
                            styles.prefBtnText,
                            isSel && styles.prefBtnTextSelected,
                          ]}
                        >
                          {pType === 'direct'
                            ? t('Bezpośrednie')
                            : pType === 'poolish'
                            ? 'Poolish'
                            : pType === 'biga'
                            ? 'Biga'
                            : pType === 'pate_fermentee'
                            ? 'Pâte Fermentée'
                            : 'Levain'}
                        </Text>
                      </Pressable>
                    </Pressable>
                  );
                }
              )}
            </View>

            {prefermentBreakdown && (
              <View style={styles.prefermentDetailsBlock} testID="preferment-details-block">
                <View style={styles.rowBetween}>
                  <Text style={styles.paramLabel}>{t('Udział mąki w zaczynie')}:</Text>
                  <View style={styles.chipRow}>
                    {[15, 20, 25, 30, 40].map((pct) => (
                      <Pressable
                        key={pct}
                        testID={`preferment-pct-${pct}`}
                        style={[styles.smallChip, prefermentFlourPct === pct && styles.smallChipActive]}
                        onPress={() => onPrefermentFlourPctChange?.(pct)}
                      >
                        <Text style={[styles.smallChipText, prefermentFlourPct === pct && styles.smallChipTextActive]}>
                          {pct}%
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.prefermentGrid}>
                  <View style={styles.prefermentCol}>
                    <Text style={styles.prefermentColHeader}>🥣 Zaczyn ({prefermentBreakdown.prefermentTotalWeightGrams} g)</Text>
                    <Text style={styles.prefermentItemText}>🌾 {t('Mąka w zaczynie')}: {prefermentBreakdown.prefermentFlourGrams} g</Text>
                    <Text style={styles.prefermentItemText}>💧 {t('Woda w zaczynie')}: {prefermentBreakdown.prefermentWaterGrams} g</Text>
                  </View>
                  <View style={styles.prefermentCol}>
                    <Text style={styles.prefermentColHeader}>🥖 Do miski (Ciasto właściwe)</Text>
                    <Text style={styles.prefermentItemText}>🌾 Pozostała mąka: {prefermentBreakdown.doughAddedFlourGrams} g</Text>
                    <Text style={styles.prefermentItemText}>💧 Pozostała woda: {prefermentBreakdown.doughAddedWaterGrams} g</Text>
                  </View>
                </View>

                <Text style={styles.fermentationTipText}>💡 {prefermentBreakdown.fermentationTipPl}</Text>
              </View>
            )}
          </View>

          {/* 4. Strata Piecowa */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>🔥 {t('Strata wypiekowa i wilgotność miękiszu')}</Text>
            <Text style={styles.sectionDesc}>
              {t('Strata Piecowa')} • {t('Szacowany ubytek masy')} ({bakeLossPercent}%): ≈ {formatWeight(bakedTotalWeightGrams, unitSystem)} {t('upieczonego')}
            </Text>

            {/* Presets */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blendScroll}>
              {BAKE_LOSS_PRESETS.map((p) => {
                const isSelected = selectedBakeLossPresetId === p.id;
                return (
                  <Pressable
                    key={p.id}
                    testID={`bake-loss-preset-${p.id}`}
                    onPress={() => onSelectBakeLossPreset?.(p.id)}
                    style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  >
                    <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                      {p.namePl} ({p.defaultLossPercent}%)
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.bakeLossStepperRow}>
              <Text style={styles.bakeLossLabel}>{t('Strata piecowa')}:</Text>
              <View style={styles.stepperInline}>
                <Pressable
                  testID="bake-loss-minus"
                  style={styles.miniBtn}
                  onPress={() => onBakeLossPercentChange?.(Math.max(5, Number((bakeLossPercent - 0.5).toFixed(1))))}
                >
                  <Text style={styles.miniBtnText}>−</Text>
                </Pressable>
                <Text style={styles.paramValue}>{bakeLossPercent.toFixed(1)}%</Text>
                <Pressable
                  testID="bake-loss-plus"
                  style={styles.miniBtn}
                  onPress={() => onBakeLossPercentChange?.(Math.min(30, Number((bakeLossPercent + 0.5).toFixed(1))))}
                >
                  <Text style={styles.miniBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            {bakeLossMetrics && (
              <View style={styles.bakeLossGrid}>
                <View style={styles.bakeLossMetricCol}>
                  <Text style={styles.bakeLossMetricLabel}>{t('Upieczony bochenek')}</Text>
                  <Text style={styles.bakeLossMetricValue} testID="bake-loss-baked-grams">
                    {formatWeight(bakeLossMetrics.bakedWeightGrams, unitSystem)}
                  </Text>
                </View>
                <View style={styles.bakeLossMetricCol}>
                  <Text style={styles.bakeLossMetricLabel}>{t('Odparowana woda')}</Text>
                  <Text style={styles.bakeLossMetricValue} testID="bake-loss-evaporated-grams">
                    -{formatWeight(bakeLossMetrics.evaporatedWaterGrams, unitSystem)}
                  </Text>
                </View>
                <View style={styles.bakeLossMetricCol}>
                  <Text style={styles.bakeLossMetricLabel}>{t('Szacowana wilgotność miękiszu')}</Text>
                  <Text style={[styles.bakeLossMetricValue, { color: theme.colors.accentDark }]} testID="bake-loss-moisture-value">
                    {bakeLossMetrics.retainedMoisturePercent}%
                  </Text>
                </View>
              </View>
            )}

            {bakeLossMetrics && (
              <View style={styles.crumbMoistureBox}>
                <Text style={styles.crumbMoistureTitle} testID="bake-loss-category-label">
                  🥖 {t(bakeLossMetrics.categoryLabelPl)}
                </Text>
                <Text style={styles.crumbMoistureAdvice}>{bakeLossMetrics.coolingAdvicePl}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceCard,
    minHeight: 52, // Zasada Brudnego Kciuka
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  arrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBadgeOpen: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  arrowText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  bodyContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sectionBlock: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },
  ddtResultCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  ddtResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ddtResultLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  ddtResultValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  iceAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  iceIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  iceText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  gridParams: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  paramBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paramLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  stepperInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniBtn: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  miniBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  paramValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  paramStepBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  paramStepText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  diffBadgeRow: {
    marginTop: 10,
    gap: 4,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  diffTipText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  absorptionBadge: {
    marginTop: 10,
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  absorptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  absorptionAdviceText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  pillActionBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  pillActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  blendScroll: {
    marginVertical: 6,
  },
  blendPresetChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  blendPresetText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  flourPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  flourTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flourTagText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  flourActionsRow: {
    gap: 6,
    marginTop: 8,
  },
  flourActionBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  flourActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  prefermentButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing.xs,
  },
  prefBtn: {
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  prefBtnSelected: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  prefBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  prefBtnTextSelected: {
    color: theme.colors.textPrimary,
  },
  prefermentDetailsBlock: {
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 4,
  },
  smallChip: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smallChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  smallChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  smallChipTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  prefermentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  prefermentCol: {
    flex: 1,
    gap: 4,
  },
  prefermentColHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  prefermentItemText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  fermentationTipText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  presetChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  presetChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  presetChipText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  bakeLossStepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  bakeLossLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  bakeLossGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 6,
  },
  bakeLossMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  bakeLossMetricLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 2,
  },
  bakeLossMetricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  crumbMoistureBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 2,
  },
  crumbMoistureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  crumbMoistureAdvice: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});
