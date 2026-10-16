// ============================================================================
// Piekarz (Crust) — Artisan Recipe Sharing & JSON Serialization (BR-DANE-002)
// Safe, offline-first export and import of baking formulas with schema validation.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import { StoredRecipe } from '../data/db';
import { MasterRecipe } from '../recipes/presets';
import { FlourItemInput } from '../core/domain-rules';
import { t } from './i18n';

export const PIEKARZ_RECIPE_SCHEMA_V1 = 'piekarz/recipe/v1' as const;

export interface SharedRecipePayload {
  schema: typeof PIEKARZ_RECIPE_SCHEMA_V1;
  exportedAt: number;
  appName: 'Piekarz';
  recipe: {
    name: string;
    targetDDT: number;
    notes?: string;
    formula: {
      flours: FlourItemInput[];
      waterPercentage: number;
      saltPercentage: number;
      starterPercentage: number;
      starterHydration?: number;
      extraYeastPercentage?: number;
      targetDoughWeightGrams: number;
    };
  };
}

export type RecipeValidationResult =
  | { success: true; recipe: StoredRecipe }
  | { success: false; error: string };

/**
 * Serializes a StoredRecipe or MasterRecipe into a standardized, shareable JSON string.
 */
export function exportRecipeToJson(recipe: StoredRecipe | MasterRecipe): string {
  const isMaster = 'namePl' in recipe;
  const name = isMaster ? recipe.namePl : recipe.name;
  const notes = isMaster ? recipe.descriptionPl : recipe.notes;

  const payload: SharedRecipePayload = {
    schema: PIEKARZ_RECIPE_SCHEMA_V1,
    exportedAt: Date.now(),
    appName: 'Piekarz',
    recipe: {
      name,
      targetDDT: recipe.targetDDT ?? 25.0,
      notes: notes || undefined,
      formula: {
        flours: recipe.formula.flours.map((f: FlourItemInput) => ({
          name: f.name,
          percentage: Math.round(f.percentage * 10) / 10,
          type: f.type,
        })),
        waterPercentage: Math.round(recipe.formula.waterPercentage * 10) / 10,
        saltPercentage: Math.round(recipe.formula.saltPercentage * 10) / 10,
        starterPercentage: Math.round(recipe.formula.starterPercentage * 10) / 10,
        starterHydration: recipe.formula.starterHydration ?? 100.0,
        extraYeastPercentage: recipe.formula.extraYeastPercentage,
        targetDoughWeightGrams: recipe.formula.targetDoughWeightGrams ?? 850,
      },
    },
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Validates and parses a JSON string containing a shared recipe.
 * Prevents prototype pollution, invalid numbers, and corrupted formulas.
 */
export function parseAndValidateRecipeJson(jsonString: string): RecipeValidationResult {
  if (!jsonString || typeof jsonString !== 'string') {
    return { success: false, error: t('Pusty lub nieprawidłowy tekst JSON') };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonString);
  } catch {
    return { success: false, error: t('Błąd składni JSON — upewnij się, że tekst jest poprawny') };
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { success: false, error: t('Oczekiwano obiektu receptury') };
  }

  const root = raw as Record<string, unknown>;

  // Detect whether wrapped in { recipe: ... } payload or flat object
  const recipeData = (root.recipe && typeof root.recipe === 'object' && !Array.isArray(root.recipe)
    ? root.recipe
    : root) as Record<string, unknown>;

  // 1. Validate recipe name
  const name = typeof recipeData.name === 'string' ? recipeData.name.trim() : '';
  if (!name || name.length > 120) {
    return { success: false, error: t('Receptura musi posiadać nazwę (1-120 znaków)') };
  }

  // 2. Validate targetDDT
  let targetDDT = 25.0;
  if (recipeData.targetDDT !== undefined) {
    if (typeof recipeData.targetDDT !== 'number' || isNaN(recipeData.targetDDT)) {
      return { success: false, error: t('Nieprawidłowa wartość temperatury docelowej (DDT)') };
    }
    if (recipeData.targetDDT < 10 || recipeData.targetDDT > 40) {
      return { success: false, error: t('Temperatura DDT musi mieścić się w zakresie 10–40°C') };
    }
    targetDDT = Math.round(recipeData.targetDDT * 10) / 10;
  }

  // 3. Validate formula object
  if (!recipeData.formula || typeof recipeData.formula !== 'object' || Array.isArray(recipeData.formula)) {
    return { success: false, error: t('Brak sekcji formuły ciasta (formula)') };
  }

  const formulaData = recipeData.formula as Record<string, unknown>;

  // 4. Validate flours array
  if (!Array.isArray(formulaData.flours) || formulaData.flours.length === 0) {
    return { success: false, error: t('Receptura musi zawierać co najmniej jedną mąkę') };
  }

  if (formulaData.flours.length > 12) {
    return { success: false, error: t('Maksymalna liczba mąk w mieszance wynosi 12') };
  }

  const validatedFlours: FlourItemInput[] = [];
  let flourPercentageSum = 0;

  for (let i = 0; i < formulaData.flours.length; i++) {
    const f = formulaData.flours[i];
    if (!f || typeof f !== 'object') {
      return { success: false, error: t('Nieprawidłowy wpis mąki na pozycji {index}', { index: i + 1 }) };
    }
    const flourItem = f as Record<string, unknown>;
    const fName = typeof flourItem.name === 'string' ? flourItem.name.trim() : '';
    if (!fName) {
      return { success: false, error: t('Każda mąka musi posiadać nazwę') };
    }
    const fPct = typeof flourItem.percentage === 'number' && !isNaN(flourItem.percentage) ? flourItem.percentage : null;
    if (fPct === null || fPct <= 0 || fPct > 100) {
      return { success: false, error: t('Procent mąki „{name}” musi być liczbą z zakresu 0.1–100%', { name: fName }) };
    }
    flourPercentageSum += fPct;
    validatedFlours.push({
      name: fName,
      percentage: Math.round(fPct * 10) / 10,
      type: typeof flourItem.type === 'string' ? flourItem.type : undefined,
    });
  }

  // Ensure total flours sum close to 100% (tolerance 95% - 105%, normalize if within tolerance)
  if (flourPercentageSum < 95 || flourPercentageSum > 105) {
    return {
      success: false,
      error: t('Suma udziałów mąk musi wynosić ~100% (obecnie: {sum}%)', {
        sum: flourPercentageSum.toFixed(1),
      }),
    };
  }

  // Normalize flours strictly to 100.0% if small discrepancy
  if (Math.abs(flourPercentageSum - 100.0) > 0.05) {
    const factor = 100.0 / flourPercentageSum;
    let runningSum = 0;
    for (let i = 0; i < validatedFlours.length; i++) {
      if (i === validatedFlours.length - 1) {
        validatedFlours[i].percentage = Math.round((100.0 - runningSum) * 10) / 10;
      } else {
        const normalized = Math.round(validatedFlours[i].percentage * factor * 10) / 10;
        validatedFlours[i].percentage = normalized;
        runningSum += normalized;
      }
    }
  }

  // 5. Validate waterPercentage
  const waterPct = typeof formulaData.waterPercentage === 'number' && !isNaN(formulaData.waterPercentage)
    ? formulaData.waterPercentage
    : null;
  if (waterPct === null || waterPct < 35 || waterPct > 120) {
    return { success: false, error: t('Hydratacja wody musi mieścić się w zakresie 35–120%') };
  }

  // 6. Validate saltPercentage
  const saltPct = typeof formulaData.saltPercentage === 'number' && !isNaN(formulaData.saltPercentage)
    ? formulaData.saltPercentage
    : null;
  if (saltPct === null || saltPct < 0 || saltPct > 6) {
    return { success: false, error: t('Udział soli musi mieścić się w zakresie 0–6%') };
  }

  // 7. Validate starterPercentage
  const starterPct = typeof formulaData.starterPercentage === 'number' && !isNaN(formulaData.starterPercentage)
    ? formulaData.starterPercentage
    : 0;
  if (starterPct < 0 || starterPct > 150) {
    return { success: false, error: t('Udział zakwasu musi mieścić się w zakresie 0–150%') };
  }

  // 8. Validate starterHydration
  let starterHydration = 100.0;
  if (formulaData.starterHydration !== undefined) {
    if (typeof formulaData.starterHydration !== 'number' || isNaN(formulaData.starterHydration)) {
      return { success: false, error: t('Nieprawidłowa hydratacja zakwasu') };
    }
    if (formulaData.starterHydration < 40 || formulaData.starterHydration > 200) {
      return { success: false, error: t('Hydratacja zakwasu musi mieścić się w zakresie 40–200%') };
    }
    starterHydration = formulaData.starterHydration;
  }

  // 9. Extra yeast percentage
  let extraYeastPercentage: number | undefined;
  if (formulaData.extraYeastPercentage !== undefined) {
    if (typeof formulaData.extraYeastPercentage === 'number' && !isNaN(formulaData.extraYeastPercentage)) {
      if (formulaData.extraYeastPercentage >= 0 && formulaData.extraYeastPercentage <= 5) {
        extraYeastPercentage = formulaData.extraYeastPercentage;
      }
    }
  }

  // 10. Target dough weight
  let targetDoughWeightGrams = 850;
  if (formulaData.targetDoughWeightGrams !== undefined) {
    if (typeof formulaData.targetDoughWeightGrams === 'number' && !isNaN(formulaData.targetDoughWeightGrams)) {
      if (formulaData.targetDoughWeightGrams >= 100 && formulaData.targetDoughWeightGrams <= 50000) {
        targetDoughWeightGrams = Math.round(formulaData.targetDoughWeightGrams);
      }
    }
  }

  // 11. Notes
  const notes = typeof recipeData.notes === 'string' ? recipeData.notes.trim() : undefined;

  const validStoredRecipe: StoredRecipe = {
    id: `recipe_import_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name,
    formula: {
      flours: validatedFlours,
      waterPercentage: Math.round(waterPct * 10) / 10,
      saltPercentage: Math.round(saltPct * 10) / 10,
      starterPercentage: Math.round(starterPct * 10) / 10,
      starterHydration,
      extraYeastPercentage,
      targetDoughWeightGrams,
    },
    targetDDT,
    notes,
    isBuiltIn: false,
    createdAt: Date.now(),
  };

  return { success: true, recipe: validStoredRecipe };
}

export const RECIPE_SHARE_PROTOCOL = 'piekarz://recipe';
export const RECIPE_SHARE_WEB_URL = 'https://piekarz.app/recipe';

/**
 * Encodes string to Base64 in UTF-8 safely for Hermes, Node, and browser
 */
export function utf8ToBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

/**
 * Decodes Base64 to UTF-8 safely
 */
export function base64ToUtf8(b64: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
  const binary = atob(b64);
  return decodeURIComponent(
    binary
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Exports recipe into deep link (piekarz://recipe?v=1&d=<base64>) or web url
 */
export function encodeRecipeToShareUrl(
  recipe: StoredRecipe | MasterRecipe,
  useWebScheme = false
): string {
  const jsonStr = exportRecipeToJson(recipe);
  let minified = jsonStr;
  try {
    minified = JSON.stringify(JSON.parse(jsonStr));
  } catch {
    // fallback
  }
  const base64Str = utf8ToBase64(minified);
  const base = useWebScheme ? RECIPE_SHARE_WEB_URL : RECIPE_SHARE_PROTOCOL;
  return `${base}?v=1&d=${encodeURIComponent(base64Str)}`;
}

/**
 * Decodes recipe from deep link, universal link, base64 payload, or raw JSON
 */
export function decodeRecipeFromShareUrl(urlOrRawData: string): RecipeValidationResult {
  if (!urlOrRawData || typeof urlOrRawData !== 'string') {
    return { success: false, error: t('Pusty lub nieprawidłowy link') };
  }

  const trimmed = urlOrRawData.trim();
  let candidate = trimmed;

  if (trimmed.includes('d=')) {
    try {
      const match = trimmed.match(/[?&]d=([^&#]+)/);
      if (match && match[1]) {
        candidate = decodeURIComponent(match[1]);
      }
    } catch {
      // fallback
    }
  }

  // If candidate is base64
  try {
    const decoded = base64ToUtf8(candidate);
    if (decoded.trim().startsWith('{')) {
      return parseAndValidateRecipeJson(decoded);
    }
  } catch {
    // Not valid base64
  }

  // Fallback: try candidate or original trimmed as raw JSON
  if (candidate.startsWith('{')) {
    return parseAndValidateRecipeJson(candidate);
  }
  if (trimmed.startsWith('{')) {
    return parseAndValidateRecipeJson(trimmed);
  }

  return { success: false, error: t('Nie udało się odczytać receptury z linku lub kodu QR') };
}
