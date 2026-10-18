// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// SQLite Repositories Implementation (Clean Architecture / Ports & Adapters)
// 100% Parameterized Queries, Defensive Deserialization, Memory Fallback
// ============================================================================

import {
  StoredBakeLog,
  StoredStarter,
  StoredRecipe,
  StoredFlourInventoryItem,
  PendingOp,
  PendingOpStatus,
  FlavourProfile,
} from '../../core/domain/types';
import {
  StoredBakeLog as DbBakeLog,
  StoredStarter as DbStarter,
  StoredRecipe as DbRecipe,
} from '../db';
import {
  IBakeRepository,
  IStarterRepository,
  IRecipeRepository,
  IFlourInventoryRepository,
  IPendingOpsQueue,
} from '../../core/domain/interfaces';
import { getDb, memStore } from '../sqlite-schema';
import {
  getBakeLogs as storeGetBakeLogs,
  saveBakeLog as storeSaveBakeLog,
  deleteBakeLog as storeDeleteBakeLog,
  getStarters as storeGetStarters,
  saveStarter as storeSaveStarter,
  deleteStarter as storeDeleteStarter,
  getRecipes as storeGetRecipes,
  saveRecipe as storeSaveRecipe,
  deleteRecipe as storeDeleteRecipe,
  getFlourInventory as storeGetFlourInventory,
  saveFlourInventoryItem as storeSaveFlourInventoryItem,
  deductFlourStock as storeDeductFlourStock,
} from '../sqlite-store';

function toDomainTaste(taste?: string): FlavourProfile | undefined {
  if (!taste) return undefined;
  if (taste === 'mild' || taste === 'mild_sweet') return 'mild_sweet';
  if (taste === 'tangy' || taste === 'tangy_lactic') return 'tangy_lactic';
  if (taste === 'sour' || taste === 'sharp_acetic') return 'sharp_acetic';
  if (taste === 'earthy_malted') return 'earthy_malted';
  return 'balanced';
}

function toDbTaste(taste?: FlavourProfile): 'mild' | 'balanced' | 'sour' | 'tangy' | undefined {
  if (!taste) return undefined;
  if (taste === 'mild_sweet') return 'mild';
  if (taste === 'tangy_lactic') return 'tangy';
  if (taste === 'sharp_acetic') return 'sour';
  return 'balanced';
}

function mapDbBakeLogToDomain(log: DbBakeLog): StoredBakeLog {
  return {
    ...log,
    actualDdt: log.actualDDT,
    tasteProfile: toDomainTaste(log.tasteProfile),
    sensoryProfile: log.sensoryProfile
      ? {
          openCrumb: log.sensoryProfile.openCrumb,
          crustCrispness: log.sensoryProfile.crustCrispness,
          lacticSourness: log.sensoryProfile.acidity,
          aceticSourness: log.sensoryProfile.acidity,
          crumbElasticity: log.sensoryProfile.crumbElasticity,
          aromaIntensity: log.sensoryProfile.caramelization,
        }
      : undefined,
  };
}

function mapDomainBakeLogToDb(log: StoredBakeLog): DbBakeLog {
  return {
    ...log,
    actualDDT: log.actualDdt,
    tasteProfile: toDbTaste(log.tasteProfile),
    sensoryProfile: log.sensoryProfile
      ? {
          openCrumb: log.sensoryProfile.openCrumb,
          crustCrispness: log.sensoryProfile.crustCrispness,
          acidity: Math.round((log.sensoryProfile.lacticSourness + log.sensoryProfile.aceticSourness) / 2),
          crumbElasticity: log.sensoryProfile.crumbElasticity,
          caramelization: log.sensoryProfile.aromaIntensity,
        }
      : undefined,
  };
}

function mapDbStarterToDomain(s: DbStarter): StoredStarter {
  return {
    ...s,
    storageState: s.storageState ?? 'ROOM_TEMP',
    feedingRatio: s.feedingRatio as StoredStarter['feedingRatio'],
  };
}

function mapDomainStarterToDb(s: StoredStarter): DbStarter {
  return {
    ...s,
    storageState: s.storageState === 'FREEZER' || s.storageState === 'DRIED' ? 'FRIDGE' : s.storageState,
  };
}

function mapDbRecipeToDomain(r: DbRecipe): StoredRecipe {
  return {
    ...r,
    targetDDT: r.targetDDT,
    isBuiltIn: r.isBuiltIn,
  };
}

function mapDomainRecipeToDb(r: StoredRecipe): DbRecipe {
  return {
    ...r,
    targetDDT: r.targetDDT ?? 26,
    isBuiltIn: r.isBuiltIn ?? false,
  };
}

/**
 * SQLite implementation of IBakeRepository
 */
export class SQLiteBakeRepository implements IBakeRepository {
  async getBakeLogs(): Promise<StoredBakeLog[]> {
    const logs = await storeGetBakeLogs();
    return logs.map(mapDbBakeLogToDomain);
  }

  async getBakeLogById(id: string): Promise<StoredBakeLog | null> {
    const logs = await this.getBakeLogs();
    return logs.find((l) => l.id === id) ?? null;
  }

  async saveBakeLog(log: StoredBakeLog): Promise<void> {
    return storeSaveBakeLog(mapDomainBakeLogToDb(log));
  }

  async deleteBakeLog(id: string): Promise<void> {
    return storeDeleteBakeLog(id);
  }
}

/**
 * SQLite implementation of IStarterRepository
 */
export class SQLiteStarterRepository implements IStarterRepository {
  async getStarters(): Promise<StoredStarter[]> {
    const starters = await storeGetStarters();
    return starters.map(mapDbStarterToDomain);
  }

  async getStarterById(id: string): Promise<StoredStarter | null> {
    const starters = await this.getStarters();
    return starters.find((s) => s.id === id) ?? null;
  }

  async saveStarter(starter: StoredStarter): Promise<void> {
    return storeSaveStarter(mapDomainStarterToDb(starter));
  }

  async deleteStarter(id: string): Promise<void> {
    return storeDeleteStarter(id);
  }

  async logFeeding(starterId: string, timestamp: number): Promise<void> {
    const starter = await this.getStarterById(starterId);
    if (starter) {
      starter.lastFedAt = timestamp;
      await this.saveStarter(starter);
    }
  }
}

/**
 * SQLite implementation of IRecipeRepository
 */
export class SQLiteRecipeRepository implements IRecipeRepository {
  async getRecipes(): Promise<StoredRecipe[]> {
    const recipes = await storeGetRecipes();
    return recipes.map(mapDbRecipeToDomain);
  }

  async getRecipeById(id: string): Promise<StoredRecipe | null> {
    const recipes = await this.getRecipes();
    return recipes.find((r) => r.id === id) ?? null;
  }

  async saveRecipe(recipe: StoredRecipe): Promise<void> {
    return storeSaveRecipe(mapDomainRecipeToDb(recipe));
  }

  async deleteRecipe(id: string): Promise<void> {
    return storeDeleteRecipe(id);
  }
}

/**
 * SQLite implementation of IFlourInventoryRepository
 */
export class SQLiteFlourInventoryRepository implements IFlourInventoryRepository {
  async getInventory(): Promise<StoredFlourInventoryItem[]> {
    return storeGetFlourInventory();
  }

  async saveInventoryItem(item: StoredFlourInventoryItem): Promise<void> {
    return storeSaveFlourInventoryItem(item);
  }

  async deductStock(flourName: string, grams: number): Promise<void> {
    return storeDeductFlourStock(flourName, grams);
  }
}

/**
 * SQLite implementation of IPendingOpsQueue (Outbox Queue ADR-003)
 */
export class SQLitePendingOpsQueue implements IPendingOpsQueue {
  async enqueue(
    opType: PendingOp['opType'],
    payload: Record<string, unknown> | string
  ): Promise<PendingOp> {
    const op: PendingOp = {
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      opType,
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
      createdAt: Date.now(),
      status: 'PENDING',
    };

    const inMem = memStore.pendingOps as PendingOp[];
    inMem.push(op);

    const db = await getDb();
    if (db) {
      try {
        await db.runAsync(
          `INSERT INTO pending_ops (id, op_type, payload, created_at, status)
           VALUES (?, ?, ?, ?, ?);`,
          op.id,
          op.opType,
          op.payload,
          op.createdAt,
          op.status
        );
      } catch {
        // Kept in memory fallback
      }
    }

    return op;
  }

  async getPending(): Promise<PendingOp[]> {
    const inMem = memStore.pendingOps as PendingOp[];
    const db = await getDb();
    if (!db) {
      return inMem.filter((o) => o.status === 'PENDING');
    }

    try {
      const rows = await db.getAllAsync<{
        id: string;
        opType: string;
        payload: string;
        createdAt: number;
        status: string;
      }>(
        `SELECT id, op_type as opType, payload, created_at as createdAt, status
         FROM pending_ops
         WHERE status = 'PENDING'
         ORDER BY created_at ASC;`
      );

      return rows.map((r) => ({
        id: r.id,
        opType: r.opType as PendingOp['opType'],
        payload: r.payload,
        createdAt: r.createdAt,
        status: r.status as PendingOpStatus,
      }));
    } catch {
      return inMem.filter((o) => o.status === 'PENDING');
    }
  }

  async updateStatus(id: string, status: PendingOpStatus): Promise<void> {
    const inMem = memStore.pendingOps as PendingOp[];
    const found = inMem.find((o) => o.id === id);
    if (found) {
      found.status = status;
    }

    const db = await getDb();
    if (db) {
      try {
        await db.runAsync(
          `UPDATE pending_ops SET status = ? WHERE id = ?;`,
          status,
          id
        );
      } catch {
        // Ignored
      }
    }
  }

  async purgeSynced(): Promise<void> {
    const inMem = memStore.pendingOps as PendingOp[];
    memStore.pendingOps = inMem.filter((o) => o.status !== 'SYNCED');

    const db = await getDb();
    if (db) {
      try {
        await db.runAsync(`DELETE FROM pending_ops WHERE status = 'SYNCED';`);
      } catch {
        // Ignored
      }
    }
  }
}
