// ============================================================================
// Piekarz (Crust) — Local Database Repository (BR-DANE-001)
// Typy zapisanych rekordów; zapis i odczyt: src/data/sqlite-store.ts, schemat: sqlite-schema.ts.
// ============================================================================

import { DoughRecipeInput } from '../core/domain-rules';

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
  lastFedAt?: number;
  feedingRatio?: string;
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
