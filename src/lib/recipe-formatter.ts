import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { DoughRecipeResult } from '../core/domain-rules';
import { BakeLossMetricsResult } from '../core/domain-rules';
import { t } from './i18n';
import { formatFixed, formatNumber } from './format';
import { UnitSystem, getUnitSystem, formatWeight, formatDoseWeight, formatTemperature } from './unit-converter';

export interface RecipeFormatOptions {
  recipeName: string;
  calc: DoughRecipeResult;
  bakeLoss?: BakeLossMetricsResult;
  targetDdt?: number;
  waterTempTarget?: number;
  iceGrams?: number;
  tapWaterTemp?: number;
  loavesCount?: number;
  /** Jednostki użytkownika; domyślnie bieżące ustawienie aplikacji [M1-audytor-generalny-072]. */
  unitSystem?: UnitSystem;
}

/**
 * Formats a dough recipe into a clean, human-readable text document
 * suitable for printing, sharing with fellow bakers, or baking notes.
 * Teksty przez t(), masy i temperatury w jednostkach użytkownika [M1-audytor-generalny-072].
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
  const units = opts.unitSystem ?? getUnitSystem();
  const w = (grams: number) => formatWeight(grams, units);
  const dose = (grams: number) => formatDoseWeight(grams, units);
  // Metrycznie jak dotąd: jedno miejsce po przecinku (25,0°C); imperialnie °F z unit-converter
  const temp = (c: number) => (units === 'imperial' ? formatTemperature(c, units) : `${formatFixed(c, 1)}°C`);
  const pct = (part: number) => formatFixed((part / calc.baseFlourWeightGrams) * 100, 1);

  const lines: string[] = [];

  // Header
  lines.push(recipeName);
  lines.push('='.repeat(recipeName.length + 4));

  // Yield & Weights Summary. Masa po upieczeniu tylko ze straty piecowej podanej przez wołającego
  // (F-48 PÓŹNIEJ: bez stałej 14% bez źródła, DEC-25 a) [M1-audytor-generalny-199]
  if (!bakeLoss) {
    lines.push(`${t('Masa ciasta')}: ${w(calc.targetDoughWeightGrams)}`);
  } else if (loavesCount > 1) {
    const singleBaked = bakeLoss.singleLoafBakedGrams ?? Math.round(bakeLoss.bakedWeightGrams / loavesCount);
    lines.push(
      `${t('Masa ciasta')}: ${w(calc.targetDoughWeightGrams)} (${loavesCount}x ~${w(singleBaked)} ${t('Upieczony bochenek').toLowerCase()})`
    );
  } else {
    lines.push(`${t('Masa ciasta')}: ${w(calc.targetDoughWeightGrams)} (${t('po upieczeniu: ~{masa}', { masa: w(bakeLoss.bakedWeightGrams) })})`);
  }

  lines.push(`${t('Hydratacja całkowita')}: ${formatFixed(calc.overallHydrationPercent, 1)}%`);

  if (bakeLoss) {
    lines.push(`${t('Strata piecowa')}: ${formatFixed(bakeLoss.bakeLossPercent, 1)}% (${t('-{masa} pary', { masa: w(bakeLoss.evaporatedWaterGrams) })})`);
    lines.push(`${t('Szacowana wilgotność miękiszu')}: ${formatNumber(bakeLoss.retainedMoisturePercent)}% (${t(bakeLoss.categoryLabelPl)})`);
  }

  lines.push('');
  lines.push(`${t('Do miski na wagę')}:`);

  // Flour breakdown
  calc.flours.forEach((f) => {
    lines.push(`  • ${f.name} (${formatFixed(f.percentage, 1)}%): ${w(f.weightGrams)}`);
  });

  // Water
  if (waterTempTarget !== undefined) {
    lines.push(`  • ${t('Woda')} (${pct(calc.waterGrams)}%): ${w(calc.waterGrams)} [temp. ${temp(waterTempTarget)}]`);
    if (iceGrams && iceGrams > 0) {
      const tap = formatTemperature(tapWaterTemp ?? 16, units);
      lines.push(`    ↳ ${t('w tym lód')}: ${w(iceGrams)} + ${t('woda z kranu ({temp})', { temp: tap })}: ${w(calc.waterGrams - iceGrams)}`);
    }
  } else {
    lines.push(`  • ${t('Woda')}: ${w(calc.waterGrams)}`);
  }

  // Sourdough starter
  lines.push(
    `  • ${t('Zakwas|składnik')} (${pct(calc.starterGrams)}%): ${w(calc.starterGrams)} (${t('{maka} mąki + {woda} wody', { maka: w(calc.starterFlourGrams), woda: w(calc.starterWaterGrams) })})`
  );

  // Salt
  lines.push(`  • ${t('Sól')} (${pct(calc.saltGrams)}%): ${dose(calc.saltGrams)}`);

  // Yeast if present
  if (calc.yeastGrams && calc.yeastGrams > 0) {
    lines.push(`  • ${t('Drożdże')}: ${dose(calc.yeastGrams)}`);
  }

  // DDT section
  if (targetDdt !== undefined) {
    lines.push('');
    lines.push(`${t('Docelowa temperatura ciasta (DDT)')}: ${temp(targetDdt)}`);
  }

  // Cooling advice
  if (bakeLoss?.coolingAdvicePl) {
    lines.push('');
    lines.push(`${t('Zalecenie studzenia na kratce')}:`);
    lines.push(`  ${t(bakeLoss.coolingAdvicePl)}`);
  }

  lines.push('');
  lines.push('— Apps4Craft Studio • Piekarz');

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
