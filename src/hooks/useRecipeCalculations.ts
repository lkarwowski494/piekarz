// ============================================================================
// Apps4Craft Studio — useRecipeCalculations Hook
// Derives dough weights, True Baker's %, DDT water temps, bake loss and preferments.
// 100% Offline-First.
// ============================================================================

import { useMemo } from 'react';
import {
  calculateDoughRecipe,
  calculateDDTWaterTemp,
  calculateIceRequirement,
  calculateBakeLossMetrics,
  getHydrationDifficulty,
  FlourItemInput,
} from '../core/domain-rules';
import { analyzeFlourBlendAbsorption } from '../core/flour-atlas';
import { calculatePrefermentBreakdown, PrefermentType } from '../core/preferments';

export interface UseRecipeCalculationsParams {
  calcMode: 'loaves' | 'flour';
  loavesCount: number;
  loafWeightGrams: number;
  flourGrams: number;
  flourBlend: FlourItemInput[];
  waterPct: number;
  starterPct: number;
  saltPct: number;
  starterHydration: number;
  targetDdt: number;
  flourTemp: number;
  roomTemp: number;
  starterTemp: number;
  frictionFactor: number;
  tapWaterTemp: number;
  customBakeLossPercent: number;
  prefermentType: PrefermentType;
  prefermentFlourPct: number;
  selectedPresetId: string;
  recipeName: string;
}

export function useRecipeCalculations({
  calcMode,
  loavesCount,
  loafWeightGrams,
  flourGrams,
  flourBlend,
  waterPct,
  starterPct,
  saltPct,
  starterHydration,
  targetDdt,
  flourTemp,
  roomTemp,
  starterTemp,
  frictionFactor,
  tapWaterTemp,
  customBakeLossPercent,
  prefermentType,
  prefermentFlourPct,
  selectedPresetId,
  recipeName,
}: UseRecipeCalculationsParams) {
  // Target Dough Weight depending on mode
  const targetDoughWeightGrams = useMemo(() => {
    if (calcMode === 'loaves') {
      return Math.round(loavesCount * loafWeightGrams);
    }
    const totalPercent = 100.0 + waterPct + starterPct + saltPct;
    return Math.round(flourGrams * (totalPercent / 100.0));
  }, [calcMode, loavesCount, loafWeightGrams, flourGrams, waterPct, starterPct, saltPct]);

  // Calculations
  const calculations = useMemo(() => {
    return calculateDoughRecipe({
      flours: flourBlend,
      waterPercentage: waterPct,
      starterPercentage: starterPct,
      saltPercentage: saltPct,
      starterHydration,
      targetDoughWeightGrams,
    });
  }, [flourBlend, waterPct, starterPct, saltPct, starterHydration, targetDoughWeightGrams]);

  const currentRecipeForShare = useMemo(() => {
    return {
      id: selectedPresetId,
      name: recipeName,
      targetDDT: targetDdt,
      formula: {
        flours: flourBlend,
        waterPercentage: waterPct,
        saltPercentage: saltPct,
        starterPercentage: starterPct,
        starterHydration,
        targetDoughWeightGrams,
      },
      isBuiltIn: false,
      createdAt: Date.now(),
    };
  }, [
    selectedPresetId,
    recipeName,
    targetDdt,
    flourBlend,
    waterPct,
    saltPct,
    starterPct,
    starterHydration,
    targetDoughWeightGrams,
  ]);

  const ddtResult = useMemo(() => {
    return calculateDDTWaterTemp({
      targetDDT: targetDdt,
      flourTemp,
      roomTemp,
      starterTemp,
      frictionFactor,
    });
  }, [targetDdt, flourTemp, roomTemp, starterTemp, frictionFactor]);

  const iceResult = useMemo(() => {
    if (ddtResult.status === 'requires_ice') {
      return calculateIceRequirement(
        calculations.waterGrams,
        tapWaterTemp,
        ddtResult.waterTempTarget
      );
    }
    return null;
  }, [ddtResult, calculations.waterGrams, tapWaterTemp]);

  const bakeLossMetrics = useMemo(() => {
    return calculateBakeLossMetrics(
      calculations.targetDoughWeightGrams,
      customBakeLossPercent,
      calculations.totalWaterGrams,
      calcMode === 'loaves' ? loavesCount : 1
    );
  }, [
    calculations.targetDoughWeightGrams,
    customBakeLossPercent,
    calculations.totalWaterGrams,
    calcMode,
    loavesCount,
  ]);

  const bakedTotalWeight = bakeLossMetrics.bakedWeightGrams;
  const bakedSingleLoafWeight = bakeLossMetrics.singleLoafBakedGrams ?? bakeLossMetrics.bakedWeightGrams;

  const hydrationDifficulty = useMemo(() => {
    return getHydrationDifficulty(waterPct);
  }, [waterPct]);

  const blendAbsorption = useMemo(() => {
    return analyzeFlourBlendAbsorption(flourBlend, waterPct);
  }, [flourBlend, waterPct]);

  const prefermentBreakdown = useMemo(() => {
    if (prefermentType === 'direct') return null;
    return calculatePrefermentBreakdown({
      prefermentType,
      prefermentFlourPercentage: prefermentFlourPct,
      totalFlourGrams: calculations.totalFlourGrams,
      totalTargetHydration: calculations.overallHydrationPercent,
      saltPercentage: saltPct,
      customPrefermentHydration: prefermentType === 'levain' ? starterHydration : undefined,
    });
  }, [
    prefermentType,
    prefermentFlourPct,
    calculations.totalFlourGrams,
    calculations.overallHydrationPercent,
    saltPct,
    starterHydration,
  ]);

  return {
    targetDoughWeightGrams,
    calculations,
    currentRecipeForShare,
    ddtResult,
    iceResult,
    bakeLossMetrics,
    bakedTotalWeight,
    bakedSingleLoafWeight,
    hydrationDifficulty,
    blendAbsorption,
    prefermentBreakdown,
  };
}
