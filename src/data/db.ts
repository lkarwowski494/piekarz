// ============================================================================
// Piekarz (Crust) — Local Database Repository (BR-DANE-001)
// Typy zapisanych rekordów; zapis i odczyt: src/data/sqlite-store.ts, schemat: sqlite-schema.ts.
// ============================================================================

import { DoughRecipeInput } from '../core/domain-rules';
import type { StarterEntryKind, StarterSign } from '../core/starter-log';

export interface StoredRecipe {
  id: string;
  name: string;
  formula: DoughRecipeInput;
  targetDDT: number;
  notes?: string;
  isBuiltIn: boolean;
  createdAt: number;
}

export interface StoredStarter {
  id: string;
  name: string;
  flourType: string;
  hydration: number;
  birthDate: number;
  storageState: 'ROOM_TEMP' | 'FRIDGE';
  /** Od v5 wyliczane z najnowszego wpisu `feeding` (ADR-008); zapis przez wpis dziennika. */
  lastFedAt?: number;
  /** Proporcja najnowszego dokarmienia (wyliczana jak lastFedAt). */
  feedingRatio?: string;
  /** Początek zakładania (dzień 1); brak = zakwas dojrzały (ADR-008). */
  setupStartedAt?: number;
  /** Chwila „gotowy”; brak przy trwającym zakładaniu. */
  setupCompletedAt?: number;
}

/** Wpis dziennika zakwasu: dokarmienie albo obserwacja (tabela starter_entries, migracja v5, ADR-008). */
export interface StoredStarterEntry {
  id: string;
  starterId: string;
  kind: StarterEntryKind;
  occurredAt: number;
  feedRatio?: string;
  flourGrams?: number;
  waterGrams?: number;
  signs: StarterSign[];
  createdAt: number;
  updatedAt: number;
}

export interface StoredBakeLog {
  id: string;
  recipeName: string;
  startedAt: number;
  finishedAt?: number;
  ambientTemp?: number;
  actualDDT?: number;
  ratingStars?: number;
  notes?: string;
  crumbScore?: number; // 1-5 (1: gęsty/zbity, 5: dzika otwarta struktura / open crumb)
  crustScore?: number; // 1-5 (1: blada/miękka, 5: chrupiąca, pęcherzykowata)
  tasteProfile?: 'mild' | 'balanced' | 'sour' | 'tangy';
  sensoryProfile?: {
    crustCrispness: number;
    crumbElasticity: number;
    acidity: number;
    openCrumb: number;
    caramelization: number;
  };
}

export interface StoredFlourInventoryItem {
  id: string;
  name: string;
  stockGrams: number;
  brand?: string;
  proteinPct?: number;
  updatedAt: number;
}

export interface StoredLessonProgress {
  levelId: number;
  completedAt: number;
}
