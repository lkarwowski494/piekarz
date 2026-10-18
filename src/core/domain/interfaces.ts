// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Canonical Domain Repository & Service Ports (Clean Architecture)
// 100% Pure TypeScript — Port and Adapter Pattern
// ============================================================================

import {
  StoredBakeLog,
  StoredStarter,
  StoredRecipe,
  StoredFlourInventoryItem,
  AppAccessInfo,
  SubscriptionTier,
  PendingOp,
  PendingOpStatus,
  BakePhase,
  BakeEvent,
} from './types';

export interface IBakeRepository {
  getBakeLogs(): Promise<StoredBakeLog[]>;
  getBakeLogById(id: string): Promise<StoredBakeLog | null>;
  saveBakeLog(log: StoredBakeLog): Promise<void>;
  deleteBakeLog(id: string): Promise<void>;
}

export interface IStarterRepository {
  getStarters(): Promise<StoredStarter[]>;
  getStarterById(id: string): Promise<StoredStarter | null>;
  saveStarter(starter: StoredStarter): Promise<void>;
  deleteStarter(id: string): Promise<void>;
  logFeeding(starterId: string, timestamp: number): Promise<void>;
}

export interface IRecipeRepository {
  getRecipes(): Promise<StoredRecipe[]>;
  getRecipeById(id: string): Promise<StoredRecipe | null>;
  saveRecipe(recipe: StoredRecipe): Promise<void>;
  deleteRecipe(id: string): Promise<void>;
}

export interface IFlourInventoryRepository {
  getInventory(): Promise<StoredFlourInventoryItem[]>;
  saveInventoryItem(item: StoredFlourInventoryItem): Promise<void>;
  deductStock(flourName: string, grams: number): Promise<void>;
}

export interface IPendingOpsQueue {
  enqueue(opType: PendingOp['opType'], payload: Record<string, unknown> | string): Promise<PendingOp>;
  getPending(): Promise<PendingOp[]>;
  updateStatus(id: string, status: PendingOpStatus): Promise<void>;
  purgeSynced(): Promise<void>;
}

export interface IAppAccessService {
  getAccessInfo(): Promise<AppAccessInfo>;
  subscribe(tier: SubscriptionTier): Promise<void>;
  restorePurchases(): Promise<boolean>;
  requireActionAccess(action?: () => void | Promise<void>): boolean;
  addListener(listener: (info: AppAccessInfo) => void): () => void;
}

export interface IBakeFSMService {
  getCurrentPhase(): BakePhase;
  dispatch(event: BakeEvent): Promise<BakePhase>;
  restoreActiveSession(): Promise<BakePhase>;
}
