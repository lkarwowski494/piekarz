// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Canonical Core Domain Types (RD-00…RD-35, Clean Architecture)
// 100% Pure TypeScript — Zero External / React Native Dependencies
// ============================================================================

export type FlavourProfile = 'balanced' | 'mild_sweet' | 'tangy_lactic' | 'sharp_acetic' | 'earthy_malted';

export interface SensoryProfile {
  openCrumb: number;      // 1..5
  crustCrispness: number; // 1..5
  lacticSourness: number; // 1..5
  aceticSourness: number; // 1..5
  crumbElasticity: number;// 1..5
  aromaIntensity: number; // 1..5
}

export interface FlourItemInput {
  name: string;
  percentage: number;
  type?: string;
}

export interface FlourItemCalculated {
  name: string;
  percentage: number;
  weightGrams: number;
}

export interface DoughRecipeInput {
  flours: FlourItemInput[];
  waterPercentage: number;
  saltPercentage: number;
  starterPercentage: number;
  starterHydration?: number;
  extraYeastPercentage?: number;
  fatPercentage?: number;   // DEC-42: Enriched doughs
  sugarPercentage?: number; // DEC-42: Enriched doughs
  targetDoughWeightGrams: number;
}

export interface DoughRecipeResult {
  targetDoughWeightGrams: number;
  baseFlourWeightGrams: number;
  flours: FlourItemCalculated[];
  waterGrams: number;
  waterBaseGrams?: number;      // DEC-43: Bassinage primary water (90%)
  bassinageWaterGrams?: number;  // DEC-43: Bassinage delayed water (10%)
  saltGrams: number;
  starterGrams: number;
  starterFlourGrams: number;
  starterWaterGrams: number;
  yeastGrams: number;
  fatGrams?: number;
  sugarGrams?: number;
  totalFlourGrams: number;
  totalWaterGrams: number;
  overallHydrationPercent: number; // True Baker's %
  sumCheckGrams: number;
  isHighRye: boolean;
}

export interface DDTSettings {
  targetDDT: number;
  flourTemp: number;
  roomTemp: number;
  starterTemp?: number;
  frictionFactor: number;
}

export interface DDTResult {
  waterTempTarget: number;
  calculationType: '3-factor' | '4-factor';
  warningMessage?: string;
}

export interface IceCalculationResult {
  requiredWaterTemp: number;
  needsIce: boolean;
  iceGrams: number;
  tapWaterGrams: number;
  totalWaterGrams: number;
}

export type StorageState = 'ROOM_TEMP' | 'FRIDGE' | 'FREEZER' | 'DRIED';
export type FeedingRatio = '1:1:1' | '1:2:2' | '1:3:3' | '1:4:4' | '1:5:5';

export interface StoredStarter {
  id: string;
  name: string;
  flourType: string;
  hydration: number;
  birthDate: number;
  storageState: StorageState;
  lastFedAt?: number;
  feedingRatio?: FeedingRatio;
}

export interface StoredBakeLog {
  id: string;
  recipeName: string;
  startedAt: number;
  finishedAt?: number;
  ambientTemp?: number;
  actualDdt?: number;
  ratingStars?: number;
  notes?: string;
  crumbScore?: number;
  crustScore?: number;
  tasteProfile?: FlavourProfile;
  sensoryProfile?: SensoryProfile;
}

export interface StoredRecipe {
  id: string;
  name: string;
  formula: DoughRecipeInput;
  targetDDT?: number;
  notes?: string;
  isBuiltIn?: boolean;
  createdAt: number;
}

export interface StoredFlourInventoryItem {
  id: string;
  name: string;
  stockGrams: number;
  brand?: string;
  proteinPct?: number;
  updatedAt: number;
}

// ----------------------------------------------------------------------------
// Monetyzacja i Uprawnienia (DEC-11, DEC-47)
// ----------------------------------------------------------------------------
export type SubscriptionTier = 'none' | 'monthly' | 'yearly' | 'lifetime';
export type AccessStatus = 'trial_active' | 'trial_expired' | 'subscribed';

export interface AppAccessInfo {
  status: AccessStatus;
  trialStartedAt: number;
  trialDaysRemaining: number;
  completedBakesCount: number;
  bakesRemainingInTrial: number;
  subscriptionTier: SubscriptionTier;
  isSubscribed: boolean;
  canCreateNewBake: boolean;
  canEditRecipes: boolean;
  isHistoryReadOnly: boolean;
}

// ----------------------------------------------------------------------------
// Maszyna Stanów Wypieku FSM (ADR-004)
// ----------------------------------------------------------------------------
export type BakePhase =
  | 'IDLE'
  | 'AUTOLYSE'
  | 'MIXING_BASSINAGE'
  | 'BULK_FERMENTATION'
  | 'PRE_SHAPE'
  | 'BENCH_REST'
  | 'FINAL_SHAPE'
  | 'COLD_RETARD'
  | 'SCORING'
  | 'BAKING_STEAM'
  | 'BAKING_VENT'
  | 'COOLING'
  | 'COMPLETED';

export type BakeEvent =
  | { type: 'START_BAKE'; recipeId: string; ddt: number; ambientTemp: number }
  | { type: 'NEXT_STEP' }
  | { type: 'RECORD_FOLD'; foldIndex: number }
  | { type: 'DUTCH_OVEN_LID_OFF' }
  | { type: 'FINISH_BAKE'; crumbScore: number; crustScore: number; taste: FlavourProfile; notes?: string }
  | { type: 'ABORT_BAKE' };

// ----------------------------------------------------------------------------
// Kolejka Outbox Zdarzeń Asynchronicznych (DEC-45, ADR-003)
// ----------------------------------------------------------------------------
export type PendingOpStatus = 'PENDING' | 'PROCESSING' | 'SYNCED' | 'FAILED';

export interface PendingOp {
  id: string;
  opType: 'DOUBLE_TAP_FOLD' | 'BAKE_LOG_UPDATE' | 'FEEDING_LOGGED' | 'INVENTORY_DEDUCTED';
  payload: string; // JSON
  createdAt: number;
  status: PendingOpStatus;
}
