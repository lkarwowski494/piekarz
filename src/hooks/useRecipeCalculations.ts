// ============================================================================
// Apps4Craft Studio — useRecipeCalculations Hook
// Derives dough weights, True Baker's %, DDT water temps, bake loss and preferments.
// 100% Offline-First.
// ============================================================================

import { useMemo } from 'react';
import {
  obliczRecepture,
  calculateDDTWaterTemp,
  calculateBakeLossMetrics,
  getHydrationDifficulty,
  FlourItemInput,
  DoughRecipeInput,
} from '../core/domain-rules';
import { analyzeFlourBlendAbsorption } from '../core/flour-atlas';
import { PrefermentType } from '../core/preferments';
import { procentyFormulyZZaczynem, zaczynWFormule } from '../core/zaczyn-w-formule';
import { t } from '../lib/i18n';
import { formatFixed } from '../lib/format';

export interface UseRecipeCalculationsParams {
  calcMode: 'loaves' | 'flour';
  loavesCount: number;
  loafWeightGrams: number;
  flourGrams: number;
  flourBlend: FlourItemInput[];
  waterPct: number;
  starterPct: number;
  saltPct: number;
  /** Drożdże z receptury (% mąki); 0 = receptura bez drożdży [M1-audytor-generalny-092]. */
  extraYeastPct?: number;
  starterHydration: number;
  targetDdt: number;
  flourTemp: number;
  roomTemp: number;
  /** Brak = receptura bez zakwasu i zaczynu: wzór temperatury wody z n = 3 (RD-16) [M1-audytor-generalny-146] */
  starterTemp?: number;
  frictionFactor: number;
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
  extraYeastPct = 0,
  starterHydration,
  targetDdt,
  flourTemp,
  roomTemp,
  starterTemp,
  frictionFactor,
  customBakeLossPercent,
  prefermentType,
  prefermentFlourPct,
  selectedPresetId,
  recipeName,
}: UseRecipeCalculationsParams) {
  // Zaczyn jako część formuły: woda, sól i drożdże formuły nie mniejsze niż w zaczynie (D-061) [M1-audytor-generalny-182]
  const wejscieZaczynu = useMemo(
    () => ({
      prefermentType,
      prefermentFlourPercentage: prefermentFlourPct,
      waterPercentage: waterPct,
      saltPercentage: saltPct,
      yeastPercentage: extraYeastPct,
      starterPercentage: starterPct,
      starterHydration,
    }),
    [prefermentType, prefermentFlourPct, waterPct, saltPct, extraYeastPct, starterPct, starterHydration],
  );
  const formula = useMemo(() => procentyFormulyZZaczynem(wejscieZaczynu), [wejscieZaczynu]);

  // Target Dough Weight depending on mode
  const targetDoughWeightGrams = useMemo(() => {
    if (calcMode === 'loaves') {
      return Math.round(loavesCount * loafWeightGrams);
    }
    const totalPercent = 100.0 + formula.waterPercentage + starterPct + formula.saltPercentage + formula.yeastPercentage;
    return Math.round(flourGrams * (totalPercent / 100.0));
  }, [calcMode, loavesCount, loafWeightGrams, flourGrams, formula, starterPct]);

  // Calculations
  // Suma mąk ≠ 100%: komunikat zamiast wyjątku w renderze [M1-audytor-generalny-150; 08-programista-502]
  const rachunek = useMemo(() => {
    return obliczRecepture({
      flours: flourBlend,
      waterPercentage: formula.waterPercentage,
      starterPercentage: starterPct,
      saltPercentage: formula.saltPercentage,
      extraYeastPercentage: formula.yeastPercentage,
      starterHydration,
      targetDoughWeightGrams,
    });
  }, [flourBlend, formula, starterPct, starterHydration, targetDoughWeightGrams]);
  const calculations = rachunek.wynik;
  const bladMak = rachunek.blad ? t('Suma udziałów mąk musi wynosić ~100% (obecnie: {sum}%)', { sum: formatFixed(rachunek.blad.sumaMak, 1) }) : null;

  // Cała formuła receptury, wspólna dla planu, zapisu „Zapisz jako moją” i udostępniania (JSON, QR):
  // osobne listy pól gubiły drożdże [audyt-niezalezny D-2]
  const recipeFormula: DoughRecipeInput = useMemo(
    () => ({
      flours: flourBlend,
      waterPercentage: waterPct,
      saltPercentage: saltPct,
      starterPercentage: starterPct,
      extraYeastPercentage: extraYeastPct,
      starterHydration,
      targetDoughWeightGrams,
    }),
    [flourBlend, waterPct, saltPct, starterPct, extraYeastPct, starterHydration, targetDoughWeightGrams],
  );

  const currentRecipeForShare = useMemo(
    () => ({
      id: selectedPresetId,
      name: recipeName,
      targetDDT: targetDdt,
      formula: recipeFormula,
      isBuiltIn: false,
      createdAt: Date.now(),
    }),
    [selectedPresetId, recipeName, targetDdt, recipeFormula],
  );

  const ddtResult = useMemo(() => {
    return calculateDDTWaterTemp({
      targetDDT: targetDdt,
      flourTemp,
      roomTemp,
      starterTemp,
      frictionFactor,
    });
  }, [targetDdt, flourTemp, roomTemp, starterTemp, frictionFactor]);

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

  const prefermentBreakdown = useMemo(
    () => zaczynWFormule({ ...wejscieZaczynu, ...formula, targetDoughWeightGrams }),
    [wejscieZaczynu, formula, targetDoughWeightGrams],
  );

  return {
    targetDoughWeightGrams,
    recipeFormula,
    calculations,
    bladMak,
    currentRecipeForShare,
    ddtResult,
    bakeLossMetrics,
    bakedTotalWeight,
    bakedSingleLoafWeight,
    hydrationDifficulty,
    blendAbsorption,
    prefermentBreakdown,
  };
}
