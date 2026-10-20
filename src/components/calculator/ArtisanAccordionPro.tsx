// ============================================================================
// Apps4Craft Studio — ArtisanAccordionPro (Progressive Disclosure Level 2)
// Zwijany panel dla rzemieślników: 4-DDT, prefermenty, strata piecowa; obliczenie dla schłodzenia wody poza interfejsem (F-53 NIE) [M1-audytor-generalny-099]
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
import { wejscieWidoczne } from '../../lib/wejscia-pozniej';

export interface ArtisanAccordionProProps {
  isOpen: boolean;
  onToggle: () => void;
  // DDT
  targetDdt: number;
  onTargetDdtChange: (val: number) => void;
  waterTempTarget: number;
  waterTempWarning?: string;
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
  waterTempWarning,
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
        accessibilityRole="button"
        testID="artisan-accordion-toggle-btn"
        style={styles.toggleHeader}
        onPress={onToggle}
      >
        <View style={styles.toggleTitleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>
              {t('Parametry Rzemieślnicze & Mąki')}
            </Text>
            <Text style={styles.toggleSubtitle}>
              {wejscieWidoczne('strata-piecowa')
                ? t('Temperatura wody, zaczyny, strata piecowa')
                : t('Temperatura wody i zaczyny')}
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
            waterTempWarning={waterTempWarning}
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

          {/* 4. Strata Piecowa — F-48 PÓŹNIEJ: sekcja ukryta (ZM-08, D-034) [M1-audytor-generalny-032] */}
          {wejscieWidoczne('strata-piecowa') && (
            <AccordionBakeLossSection
              bakeLossPercent={bakeLossPercent}
              onBakeLossPercentChange={onBakeLossPercentChange}
              bakedTotalWeightGrams={bakedTotalWeightGrams}
              bakeLossMetrics={bakeLossMetrics}
              selectedBakeLossPresetId={selectedBakeLossPresetId}
              onSelectBakeLossPreset={onSelectBakeLossPreset}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.powierzchnia,
    minHeight: 52, // Zasada Brudnego Kciuka
  },
  toggleTitleRow: {
    fontFamily: theme.typography.krojTytulow,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: theme.colors.tusz3,
    marginTop: 1,
  },
  arrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBadgeOpen: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.akcent,
  },
  arrowText: {
    fontSize: 12,
    color: theme.colors.tusz,
  },
  bodyContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
});
