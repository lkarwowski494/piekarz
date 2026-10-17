import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { DoughRecipeResult } from '../core/domain-rules';
import { BakeLossMetricsResult } from '../core/domain-rules';
import { t } from './i18n';

export interface RecipeFormatOptions {
  recipeName: string;
  calc: DoughRecipeResult;
  bakeLoss?: BakeLossMetricsResult;
  targetDdt?: number;
  waterTempTarget?: number;
  iceGrams?: number;
  tapWaterTemp?: number;
  loavesCount?: number;
}

/**
 * Formats a dough recipe into a clean, human-readable text document
 * suitable for printing, sharing with fellow bakers, or baking notes.
 */
export function formatRecipeText(opts: RecipeFormatOptions): string {
  const {
    recipeName,
    calc,
    bakeLoss,
    targetDdt,
    waterTempTarget,
    iceGrams,
    tapWaterTemp,
    loavesCount = 1,
  } = opts;

  const lines: string[] = [];

  // Header
  lines.push(`🥖 ${recipeName}`);
  lines.push('='.repeat(recipeName.length + 4));

  // Yield & Weights Summary
  if (loavesCount > 1) {
    const singleBaked = bakeLoss?.singleLoafBakedGrams ?? Math.round((bakeLoss?.bakedWeightGrams ?? calc.targetDoughWeightGrams * 0.86) / loavesCount);
    lines.push(
      `${t('Masa ciasta')}: ${calc.targetDoughWeightGrams} g (${loavesCount}x ~${singleBaked} g ${t('Upieczony bochenek').toLowerCase()})`
    );
  } else {
    lines.push(
      `${t('Masa ciasta')}: ${calc.targetDoughWeightGrams} g (po upieczeniu: ~${bakeLoss?.bakedWeightGrams ?? Math.round(calc.targetDoughWeightGrams * 0.86)} g)`
    );
  }

  lines.push(`${t('Hydratacja całkowita')}: ${calc.overallHydrationPercent.toFixed(1)}% (True Baker's %)`);

  if (bakeLoss) {
    lines.push(`${t('Strata piecowa')}: ${bakeLoss.bakeLossPercent.toFixed(1)}% (-${bakeLoss.evaporatedWaterGrams} g pary)`);
    lines.push(`${t('Szacowana wilgotność miękiszu')}: ${bakeLoss.retainedMoisturePercent}% (${bakeLoss.categoryLabelPl})`);
  }

  lines.push('');
  lines.push(`📋 ${t('Do miski na wagę')}:`);

  // Flour breakdown
  calc.flours.forEach((f) => {
    lines.push(`  • ${f.name} (${f.percentage.toFixed(1)}%): ${f.weightGrams} g`);
  });

  // Water
  if (waterTempTarget !== undefined) {
    lines.push(`  • ${t('Woda')} (${((calc.waterGrams / calc.baseFlourWeightGrams) * 100).toFixed(1)}%): ${calc.waterGrams} g [temp. ${waterTempTarget.toFixed(1)}°C]`);
    if (iceGrams && iceGrams > 0) {
      lines.push(`    ↳ ${t('w tym lód')}: ${iceGrams} g + woda z kranu (${tapWaterTemp ?? 16}°C): ${calc.waterGrams - iceGrams} g`);
    }
  } else {
    lines.push(`  • ${t('Woda')}: ${calc.waterGrams} g`);
  }

  // Sourdough starter
  lines.push(`  • ${t('Zakwas')} (${((calc.starterGrams / calc.baseFlourWeightGrams) * 100).toFixed(1)}%): ${calc.starterGrams} g (${calc.starterFlourGrams} g mąki + ${calc.starterWaterGrams} g wody)`);

  // Salt
  lines.push(`  • ${t('Sól')} (${((calc.saltGrams / calc.baseFlourWeightGrams) * 100).toFixed(1)}%): ${calc.saltGrams} g`);

  // Yeast if present
  if (calc.yeastGrams && calc.yeastGrams > 0) {
    lines.push(`  • ${t('Drożdże')}: ${calc.yeastGrams} g`);
  }

  // DDT section
  if (targetDdt !== undefined) {
    lines.push('');
    lines.push(`🌡️ ${t('Docelowa temperatura ciasta (DDT)')}: ${targetDdt.toFixed(1)}°C`);
  }

  // Cooling advice
  if (bakeLoss?.coolingAdvicePl) {
    lines.push('');
    lines.push(`⏱️ ${t('Zalecenie studzenia na kratce')}:`);
    lines.push(`  ${bakeLoss.coolingAdvicePl}`);
  }

  lines.push('');
  lines.push('— Apps4Craft Studio • Piekarz 🥖 • 100% Offline-First');

  return lines.join('\n');
}

/**
 * Copies the formatted recipe string to system clipboard with haptic feedback.
 */
export async function copyRecipeToClipboard(formattedText: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(formattedText);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return true;
  } catch {
    return false;
  }
}
