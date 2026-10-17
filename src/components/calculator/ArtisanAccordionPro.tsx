// ============================================================================
// Apps4Craft Studio — ArtisanAccordionPro (Progressive Disclosure Level 2)
// Zwijany panel dla rzemieślników: 4-DDT, lód, prefermenty, strata piecowa
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import {
  PrefermentType,
  PrefermentBreakdownResult,
} from '../../core/preferments';
import {
  FlourItemInput,
  POPULAR_FLOUR_BLENDS,
  HydrationDifficultyInfo,
  BakeTypePresetId,
  BakeLossMetricsResult,
} from '../../core/domain-rules';
import { BlendAbsorptionAnalysis } from '../../core/flour-atlas';
import { AccordionDdtSection } from './accordion/AccordionDdtSection';
import { AccordionFlourBlendSection } from './accordion/AccordionFlourBlendSection';
import { AccordionPrefermentSection } from './accordion/AccordionPrefermentSection';
import { AccordionBakeLossSection } from './accordion/AccordionBakeLossSection';

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
          <AccordionDdtSection
            targetDdt={targetDdt}
            onTargetDdtChange={onTargetDdtChange}
            waterTempTarget={waterTempTarget}
            iceGrams={iceGrams}
            waterPct={waterPct}
            onWaterPctChange={onWaterPctChange}
            hydrationDifficulty={hydrationDifficulty}
            blendAbsorption={blendAbsorption}
          />

          {/* 2. Blend Mąk i Chłonność */}
          <AccordionFlourBlendSection
            flourBlend={flourBlend}
            onOpenBlendModal={onOpenBlendModal}
            onSelectFlourBlend={onSelectFlourBlend}
            onOpenInventory={onOpenInventory}
            onOpenEquivalents={onOpenEquivalents}
          />

          {/* 3. Prefermenty Rzemieślnicze */}
          <AccordionPrefermentSection
            prefermentType={prefermentType}
            onPrefermentTypeChange={onPrefermentTypeChange}
            prefermentFlourPct={prefermentFlourPct}
            onPrefermentFlourPctChange={onPrefermentFlourPctChange}
            prefermentBreakdown={prefermentBreakdown}
          />

          {/* 4. Strata Piecowa */}
          <AccordionBakeLossSection
            bakeLossPercent={bakeLossPercent}
            onBakeLossPercentChange={onBakeLossPercentChange}
            bakedTotalWeightGrams={bakedTotalWeightGrams}
            bakeLossMetrics={bakeLossMetrics}
            selectedBakeLossPresetId={selectedBakeLossPresetId}
            onSelectBakeLossPreset={onSelectBakeLossPreset}
          />
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
});
