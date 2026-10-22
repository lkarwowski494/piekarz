// ============================================================================
// Piekarz — parsowanie danych z zewnątrz (plik kopii, wiersz bazy, zapis sesji) z `unknown`
// Strażniki typów bez asercji `as`: zły rekord daje null, nie zgadnięte wartości.
// ============================================================================

import { DoughRecipeInput, DoughRecipeResult, normalizujMaki } from '../core/domain-rules';
import type { StalyDzienKarmienia, StoredBakeLog, StoredFlourInventoryItem, StoredRecipe, StoredStarter, StoredStarterEntry } from './db';
import { isStarterSign, type StarterSign } from '../core/starter-log';

export type Obj = Record<string, unknown>;
export const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
export const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
export const isStr = (v: unknown): v is string => typeof v === 'string';
export const numOrNull = (v: unknown): v is number | null => v === null || isNum(v);
export const optNum = (v: unknown): boolean => v === undefined || isNum(v);

function isFlourCalc(v: unknown): boolean {
  return isObj(v) && isStr(v.name) && isNum(v.percentage) && isNum(v.weightGrams);
}

export function isRecipeResult(v: unknown): v is DoughRecipeResult {
  if (!isObj(v) || !Array.isArray(v.flours) || !v.flours.every(isFlourCalc) || typeof v.isHighRye !== 'boolean') return false;
  const nums = ['targetDoughWeightGrams', 'baseFlourWeightGrams', 'waterGrams', 'saltGrams', 'starterGrams', 'starterFlourGrams',
    'starterWaterGrams', 'yeastGrams', 'totalFlourGrams', 'totalWaterGrams', 'overallHydrationPercent', 'sumCheckGrams'];
  return nums.every((k) => isNum(v[k]));
}

export function isRecipeInput(v: unknown): v is DoughRecipeInput {
  if (!isObj(v) || !Array.isArray(v.flours)) return false;
  const floursOk = v.flours.every((f) => isObj(f) && isStr(f.name) && isNum(f.percentage) && (f.type === undefined || isStr(f.type)));
  return floursOk && isNum(v.waterPercentage) && isNum(v.saltPercentage) && isNum(v.starterPercentage) &&
    isNum(v.targetDoughWeightGrams) && optNum(v.starterHydration) && optNum(v.extraYeastPercentage);
}

// Wiersze kopii i bazy [M1-audytor-generalny-022]: brak pola wymaganego → wiersz pominięty;
// błędne pole opcjonalne → puste (brak zostaje brakiem, nic nie zgadujemy).
const optN = (v: unknown): number | undefined => (isNum(v) ? v : undefined);
const optS = (v: unknown): string | undefined => (isStr(v) ? v : undefined);
const TASTES = ['mild', 'balanced', 'sour', 'tangy'] as const;
type Taste = (typeof TASTES)[number];
const isTaste = (v: unknown): v is Taste => TASTES.some((x) => x === v);

function sensory(v: unknown): StoredBakeLog['sensoryProfile'] {
  if (!isObj(v)) return undefined;
  const { crustCrispness, crumbElasticity, acidity, openCrumb, caramelization } = v;
  if (![crustCrispness, crumbElasticity, acidity, openCrumb, caramelization].every(isNum)) return undefined;
  return {
    crustCrispness: Number(crustCrispness),
    crumbElasticity: Number(crumbElasticity),
    acidity: Number(acidity),
    openCrumb: Number(openCrumb),
    caramelization: Number(caramelization),
  };
}

/** Pole opcjonalne kopii v2 (D1-2): nieobecne albo złe → undefined (import zostawia telefon), null → null. */
const optSN = (v: unknown): string | null | undefined => (v === null || isStr(v) ? v : undefined);

export function parseStalyDzien(v: unknown): StalyDzienKarmienia | null | undefined {
  if (v === null) return null;
  if (!isObj(v) || !Number.isInteger(v.weekday) || !Number.isInteger(v.minuteOfDay)) return undefined;
  const { weekday, minuteOfDay } = v;
  if (!isNum(weekday) || !isNum(minuteOfDay) || weekday < 1 || weekday > 7 || minuteOfDay < 0 || minuteOfDay > 1439) return undefined;
  return { weekday, minuteOfDay };
}

export function parseBakeRow(v: unknown): StoredBakeLog | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.recipeName) || !isNum(v.startedAt)) return null;
  return {
    id: v.id,
    recipeName: v.recipeName,
    recipeId: optSN(v.recipeId),
    startedAt: v.startedAt,
    finishedAt: optN(v.finishedAt),
    ambientTemp: optN(v.ambientTemp),
    actualDDT: optN(v.actualDDT),
    ratingStars: optN(v.ratingStars),
    notes: optS(v.notes),
    crumbScore: optN(v.crumbScore),
    crustScore: optN(v.crustScore),
    tasteProfile: isTaste(v.tasteProfile) ? v.tasteProfile : undefined,
    sensoryProfile: sensory(v.sensoryProfile),
  };
}

export function parseStarterRow(v: unknown): StoredStarter | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.name) || !isStr(v.flourType) || !isNum(v.hydration) || !isNum(v.birthDate)) return null;
  if (v.storageState !== 'ROOM_TEMP' && v.storageState !== 'FRIDGE') return null;
  return {
    id: v.id,
    name: v.name,
    flourType: v.flourType,
    hydration: v.hydration,
    birthDate: v.birthDate,
    storageState: v.storageState,
    lastFedAt: optN(v.lastFedAt),
    feedingRatio: optS(v.feedingRatio),
    setupStartedAt: optN(v.setupStartedAt),
    setupCompletedAt: optN(v.setupCompletedAt),
    fridgeFeedDay: parseStalyDzien(v.fridgeFeedDay),
  };
}

/** Pozycja spiżarni mąk z kopii (F-30, F-33): zapas ≥ 0; brak marki i białka zostaje brakiem [M1-audytor-generalny-097]. */
export function parseFlourInventoryRow(v: unknown): StoredFlourInventoryItem | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.name) || !isNum(v.stockGrams) || v.stockGrams < 0 || !isNum(v.updatedAt)) return null;
  return { id: v.id, name: v.name, stockGrams: v.stockGrams, brand: optS(v.brand), proteinPct: optN(v.proteinPct), updatedAt: v.updatedAt };
}

const optPos =(v: unknown): number | undefined => (isNum(v) && v > 0 ? v : undefined);

/**
 * Wpis dziennika zakwasu z kopii albo wiersza bazy (signs jako tablica albo tekst JSON) [M1-audytor-generalny-104].
 * Wymagane: id, starterId, kind, occurredAt > 0, createdAt, updatedAt; nieznany kod obserwacji = wiersz odrzucony.
 * Obserwacja nie niesie proporcji ani gramów (CHECK w bazie), więc te pola dla niej są pomijane.
 */
export function parseStarterEntryRow(v: unknown): StoredStarterEntry | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.starterId) || !isNum(v.occurredAt) || !(v.occurredAt > 0)) return null;
  if ((v.kind !== 'feeding' && v.kind !== 'observation') || !isNum(v.createdAt) || !isNum(v.updatedAt)) return null;
  let signs: unknown = v.signs ?? [];
  if (isStr(signs)) {
    try {
      signs = JSON.parse(signs);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(signs)) return null;
  const known: StarterSign[] = [];
  for (const s of signs) {
    if (!isStarterSign(s)) return null;
    known.push(s);
  }
  const feeding = v.kind === 'feeding';
  return {
    id: v.id,
    starterId: v.starterId,
    kind: v.kind,
    occurredAt: v.occurredAt,
    feedRatio: feeding ? optS(v.feedRatio) : undefined,
    flourGrams: feeding ? optPos(v.flourGrams) : undefined,
    waterGrams: feeding ? optPos(v.waterGrams) : undefined,
    signs: known,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

export function parseRecipeRow(v: unknown): StoredRecipe | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.name) || !isRecipeInput(v.formula) || !isNum(v.targetDDT) || !isNum(v.createdAt)) return null;
  // Suma mąk jak przy imporcie JSON: 95–105% normalizowane do 100%, inaczej wiersz pominięty (licznik
  // pominiętych na ekranie importu) [M1-audytor-generalny-150; 08-programista-502]
  // Suma poza 95–105% (dane z dawnych importów): receptura zostaje z proporcjami bez zmian — ekran liczy ją
  // proporcjonalnie z komunikatem o sumie mąk (`obliczRecepture`), import jej nie gubi [reaudit-noc N-8]
  const flours = normalizujMaki(v.formula.flours) ?? v.formula.flours.map((f) => ({ ...f }));
  return {
    id: v.id,
    name: v.name,
    formula: { ...v.formula, flours },
    targetDDT: v.targetDDT,
    notes: optS(v.notes),
    isBuiltIn: v.isBuiltIn === true,
    createdAt: v.createdAt,
  };
}

/** Lista wierszy po parsowaniu: poprawne rekordy i liczba pominiętych. */
export function parseRows<T>(rows: unknown[], parse: (v: unknown) => T | null): { rows: T[]; skipped: number } {
  const out: T[] = [];
  for (const r of rows) {
    const p = parse(r);
    if (p) out.push(p);
  }
  return { rows: out, skipped: rows.length - out.length };
}
