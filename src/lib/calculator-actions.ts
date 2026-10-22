// ============================================================================
// Apps4Craft Studio — Calculator Actions
// Handlers for exporting, copying, cloning, and saving bread recipes.
// 100% Offline-First.
// ============================================================================

import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { t } from './i18n';
import { exportRecipeSheetAsPdf } from './pdf-sheet-generator';
import { exportRecipeToJson } from './recipe-sharing';
import { formatRecipeText, copyRecipeToClipboard } from './recipe-formatter';
import { wejscieWidoczne } from './wejscia-pozniej';
import { saveRecipe } from '../data/sqlite-store';
import { StoredRecipe } from '../data/db';
import { MASTER_RECIPES } from '../recipes/presets';
import { DoughRecipeResult, DoughRecipeInput, BakeLossMetricsResult } from '../core/domain-rules';

export interface PrintRecipePdfParams {
  recipeName: string;
  calculations: DoughRecipeResult;
  starterHydration: number;
  saltPct: number;
  targetDdt: number;
  waterTempTarget: number;
  roomTemp: number;
  loavesCount: number;
  bakedSingleLoafWeight: number;
  selectedPresetId: string;
}

export async function executePrintRecipePdf({
  recipeName,
  calculations,
  starterHydration,
  saltPct,
  targetDdt,
  waterTempTarget,
  roomTemp,
  loavesCount,
  bakedSingleLoafWeight,
  selectedPresetId,
}: PrintRecipePdfParams): Promise<void> {
  try {
    await exportRecipeSheetAsPdf({
      recipeName,
      totalFlourGrams: calculations.totalFlourGrams,
      overallHydrationPercent: calculations.overallHydrationPercent,
      flours: calculations.flours,
      waterGrams: calculations.waterGrams,
      starterGrams: calculations.starterGrams,
      starterHydration,
      saltGrams: calculations.saltGrams,
      saltPercent: saltPct,
      targetDDT: targetDdt,
      waterTempTarget,
      ambientTemp: roomTemp,
      targetDoughWeightGrams: calculations.targetDoughWeightGrams,
      loavesCount,
      bakedSingleLoafWeight,
      notes: MASTER_RECIPES.find((r) => r.id === selectedPresetId)?.notesPl,
    });
  } catch {
    Alert.alert(t('Karta receptury'), t('Nie udało się wygenerować pliku PDF'));
  }
}

export async function executeExportRecipeJson(payload: StoredRecipe): Promise<void> {
  const json = exportRecipeToJson(payload);
  await Clipboard.setStringAsync(json);
  Alert.alert(t('Eksport JSON'), t('Skopiowano kod JSON receptury do schowka.'));
}

export async function executeCopyRecipe(params: {
  recipeName: string;
  calculations: DoughRecipeResult;
  bakeLossMetrics?: BakeLossMetricsResult;
  targetDdt: number;
  waterTempTarget: number;
  iceGrams?: number;
  tapWaterTemp: number;
  loavesCount: number;
}): Promise<void> {
  const text = formatRecipeText({
    recipeName: params.recipeName,
    calc: params.calculations,
    // Strata piecowa, wilgotność i masa po upieczeniu tylko z widocznym F-48 (DEC-25 a) [M1-audytor-generalny-199]
    bakeLoss: wejscieWidoczne('strata-piecowa') ? params.bakeLossMetrics : undefined,
    targetDdt: params.targetDdt,
    waterTempTarget: params.waterTempTarget,
    iceGrams: params.iceGrams,
    tapWaterTemp: params.tapWaterTemp,
    loavesCount: params.loavesCount,
  });
  const copied = await copyRecipeToClipboard(text);
  if (copied) {
    Alert.alert(t('Kopiuj jako tekst'), t('Skopiowano przepis do schowka'));
  }
}

// Zapis i kopia biorą całą formułę receptury (z drożdżami), nie listę wybranych pól [audyt-niezalezny D-2]
export async function executeCloneRecipe(
  recipeName: string,
  formula: DoughRecipeInput,
  targetDdt: number
): Promise<StoredRecipe> {
  const cloneName = `${recipeName} (${t('Kopia')})`;
  const cloned: StoredRecipe = {
    id: `recipe_${Date.now()}`,
    name: cloneName,
    formula: { ...formula, flours: [...formula.flours] },
    targetDDT: targetDdt,
    isBuiltIn: false,
    createdAt: Date.now(),
  };

  await saveRecipe(cloned);
  Alert.alert(t('Sklonowano przepis'), t('Utworzono edytowalną kopię w Twojej bibliotece.'));
  return cloned;
}

/**
 * Zapis zmian własnej receptury: to samo id, nazwa, data utworzenia i notatki, nowa formuła i temperatura ciasta
 * (zapisane działają w całości, kontrakt Basic/Pro; nie jest dodaniem) [M3 P-a-fix P1-1].
 */
export async function executeUpdateCustomRecipe(wlasna: StoredRecipe, formula: DoughRecipeInput, targetDdt: number): Promise<StoredRecipe> {
  const zmieniona: StoredRecipe = { ...wlasna, formula: { ...formula, flours: [...formula.flours] }, targetDDT: targetDdt };
  await saveRecipe(zmieniona);
  Alert.alert(t('Zapisano przepis'), t('Zapisano zmiany w recepturze „{name}”.', { name: wlasna.name }));
  return zmieniona;
}

export async function executeSaveCustomRecipe(
  name: string,
  formula: DoughRecipeInput,
  targetDdt: number
): Promise<StoredRecipe | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const newCustom: StoredRecipe = {
    id: `recipe_${Date.now()}`,
    name: trimmed,
    formula: { ...formula, flours: [...formula.flours] },
    targetDDT: targetDdt,
    isBuiltIn: false,
    createdAt: Date.now(),
  };

  await saveRecipe(newCustom);
  Alert.alert(t('Zapisano przepis'), t('Przepis „{name}” został zapisany w Twojej bibliotece.', { name: trimmed }));
  return newCustom;
}
