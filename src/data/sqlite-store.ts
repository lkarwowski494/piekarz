import * as SQLite from 'expo-sqlite';
import { dbDirectory } from '../lib/db-path';
import { autoBackup, PiekarzBackupData } from '../lib/backup';
import { StoredRecipe, StoredStarter, StoredBakeLog, StoredFlourInventoryItem, StoredAppAccess, SubscriptionTier } from './db';
import { MASTER_RECIPES } from '../recipes/presets';
import { DoughRecipeResult, DoughRecipeInput } from '../core/domain-rules';

const DB_NAME = 'piekarz.db';

export interface ActiveBakeState {
  id: string;
  recipeName: string;
  startedAt: number;
  currentStageId: string;
  ambientTempC: number;
  actualDdtC: number;
  calculatedRecipe?: DoughRecipeResult;
  recipeFormula?: DoughRecipeInput;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;

// In-memory fallback for test and non-native environments
let memStarters: StoredStarter[] = [];
let memRecipes: StoredRecipe[] = [];
let memLogs: StoredBakeLog[] = [];
let memFlourInventory: StoredFlourInventoryItem[] = [];
let memCompletedLessons: number[] = [];
let memActiveBake: ActiveBakeState | null = null;
let memAppAccess: StoredAppAccess = {
  id: 'current_user',
  trialStartedAt: Date.now(),
  trialDays: 7,
  subscriptionTier: 'none',
  subscriptionExpiresAt: null,
  completedBakesCount: 0,
};

let memSettings: Record<string, string> = {};

export function _resetMemStore(): void {
  memStarters = [];
  memRecipes = [];
  memLogs = [];
  memFlourInventory = [];
  memCompletedLessons = [];
  memActiveBake = null;
  memSettings = {};
  memAppAccess = {
    id: 'current_user',
    trialStartedAt: Date.now(),
    trialDays: 7,
    subscriptionTier: 'none',
    subscriptionExpiresAt: null,
    completedBakesCount: 0,
  };
}

export async function getDb(): Promise<SQLite.SQLiteDatabase | null> {
  if (dbInstance) return dbInstance;
  try {
    const defaultDir = SQLite.defaultDatabaseDirectory;
    const safeDir = dbDirectory(defaultDir);
    dbInstance = safeDir
      ? await SQLite.openDatabaseAsync(DB_NAME, undefined, safeDir)
      : await SQLite.openDatabaseAsync(DB_NAME);
    return dbInstance;
  } catch {
    return null; // Fallback to memory store
  }
}

export async function initDatabase(): Promise<void> {
  const db = await getDb();

  // Populate memory store defaults regardless
  if (memRecipes.length === 0) {
    memRecipes = MASTER_RECIPES.map((preset) => ({
      id: preset.id,
      name: preset.namePl,
      formula: preset.formula,
      targetDDT: preset.targetDDT,
      notes: preset.notesPl,
      isBuiltIn: true,
      createdAt: Date.now(),
    }));
  }

  if (memStarters.length === 0) {
    memStarters = [
      {
        id: 'starter_default',
        name: 'Zakwas żytni (Bolesław)',
        flourType: 'Żytnia razowa typ 2000',
        hydration: 100.0,
        birthDate: Date.now() - 1000 * 60 * 60 * 24 * 120,
        storageState: 'FRIDGE',
        lastFedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      },
    ];
  }

  if (memFlourInventory.length === 0) {
    memFlourInventory = [
      {
        id: 'flour_inv_wheat_750',
        name: 'Mąka pszenna chlebowa typ 750',
        stockGrams: 2000,
        proteinPct: 12.0,
        updatedAt: Date.now(),
      },
      {
        id: 'flour_inv_rye_2000',
        name: 'Mąka żytnia razowa typ 2000',
        stockGrams: 1500,
        proteinPct: 10.0,
        updatedAt: Date.now(),
      },
      {
        id: 'flour_inv_manitoba',
        name: 'Mąka Manitoba / Forte (W > 350)',
        stockGrams: 1000,
        proteinPct: 14.5,
        updatedAt: Date.now(),
      },
    ];
  }

  if (!db) return;

  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS bakes (
        id TEXT PRIMARY KEY NOT NULL,
        recipe_name TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        finished_at INTEGER,
        ambient_temp REAL,
        actual_ddt REAL,
        rating_stars INTEGER,
        notes TEXT,
        crumb_score INTEGER,
        crust_score INTEGER,
        taste_profile TEXT,
        sensory_profile TEXT
      );

      CREATE TABLE IF NOT EXISTS starters (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        flour_type TEXT NOT NULL,
        hydration REAL NOT NULL DEFAULT 100.0,
        birth_date INTEGER NOT NULL,
        storage_state TEXT NOT NULL DEFAULT 'ROOM_TEMP',
        last_fed_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        formula_json TEXT NOT NULL,
        target_ddt REAL NOT NULL DEFAULT 25.0,
        notes TEXT,
        is_built_in INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS flour_inventory (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        stock_grams REAL NOT NULL DEFAULT 0.0,
        brand TEXT,
        protein_pct REAL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_access (
        id TEXT PRIMARY KEY NOT NULL,
        trial_started_at INTEGER NOT NULL,
        trial_days INTEGER NOT NULL DEFAULT 7,
        subscription_tier TEXT NOT NULL DEFAULT 'none',
        subscription_expires_at INTEGER,
        completed_bakes_count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);

    try {
      await db.runAsync(
        `INSERT OR IGNORE INTO app_access (id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count)
         VALUES ('current_user', ?, 7, 'none', NULL, 0);`,
        Date.now()
      );
    } catch {}

    try {
      await db.execAsync('ALTER TABLE bakes ADD COLUMN crumb_score INTEGER;');
    } catch {}
    try {
      await db.execAsync('ALTER TABLE bakes ADD COLUMN crust_score INTEGER;');
    } catch {}
    try {
      await db.execAsync('ALTER TABLE bakes ADD COLUMN taste_profile TEXT;');
    } catch {}
    try {
      await db.execAsync('ALTER TABLE bakes ADD COLUMN sensory_profile TEXT;');
    } catch {}

    // Populate built-in master recipes into SQLite table
    for (const preset of MASTER_RECIPES) {
      try {
        await db.runAsync(
          `INSERT OR IGNORE INTO recipes (id, name, formula_json, target_ddt, notes, is_built_in, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          preset.id,
          preset.namePl,
          JSON.stringify(preset.formula),
          preset.targetDDT,
          preset.notesPl,
          1,
          0
        );
      } catch {}
    }
  } catch {
    // Memory fallback handles errors in non-native contexts
  }
}

// ==========================================
// Bakes & Stolnica
// ==========================================

export async function getBakeLogs(): Promise<StoredBakeLog[]> {
  const db = await getDb();
  if (!db) return [...memLogs];

  try {
    const rows = await db.getAllAsync<{
      id: string;
      recipeName: string;
      startedAt: number;
      finishedAt: number | null;
      ambientTemp: number | null;
      actualDDT: number | null;
      ratingStars: number | null;
      notes: string | null;
      crumbScore: number | null;
      crustScore: number | null;
      tasteProfile: string | null;
      sensoryProfileRaw: string | null;
    }>(
      'SELECT id, recipe_name as recipeName, started_at as startedAt, finished_at as finishedAt, ambient_temp as ambientTemp, actual_ddt as actualDDT, rating_stars as ratingStars, notes, crumb_score as crumbScore, crust_score as crustScore, taste_profile as tasteProfile, sensory_profile as sensoryProfileRaw FROM bakes ORDER BY started_at DESC;'
    );
    return rows.map((r) => {
      let sensoryProfile: StoredBakeLog['sensoryProfile'] = undefined;
      if (r.sensoryProfileRaw) {
        try {
          sensoryProfile = JSON.parse(r.sensoryProfileRaw);
        } catch {}
      }
      return {
        id: r.id,
        recipeName: r.recipeName,
        startedAt: r.startedAt,
        finishedAt: r.finishedAt ?? undefined,
        ambientTemp: r.ambientTemp ?? undefined,
        actualDDT: r.actualDDT ?? undefined,
        ratingStars: r.ratingStars ?? undefined,
        notes: r.notes ?? undefined,
        crumbScore: r.crumbScore ?? undefined,
        crustScore: r.crustScore ?? undefined,
        tasteProfile: (r.tasteProfile as any) ?? undefined,
        sensoryProfile,
      };
    });
  } catch {
    return [...memLogs];
  }
}

export async function saveBakeLog(log: StoredBakeLog): Promise<void> {
  const existingIdx = memLogs.findIndex((l) => l.id === log.id);
  if (existingIdx >= 0) {
    memLogs[existingIdx] = log;
  } else {
    memLogs.unshift(log);
  }

  const db = await getDb();
  if (db) {
    try {
      const sensoryStr = log.sensoryProfile ? JSON.stringify(log.sensoryProfile) : null;
      await db.runAsync(
        `INSERT OR REPLACE INTO bakes (id, recipe_name, started_at, finished_at, ambient_temp, actual_ddt, rating_stars, notes, crumb_score, crust_score, taste_profile, sensory_profile)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        log.id,
        log.recipeName,
        log.startedAt,
        log.finishedAt ?? null,
        log.ambientTemp ?? null,
        log.actualDDT ?? null,
        log.ratingStars ?? null,
        log.notes ?? null,
        log.crumbScore ?? null,
        log.crustScore ?? null,
        log.tasteProfile ?? null,
        sensoryStr
      );
    } catch {
      // Memory store preserved
    }
  }

  // Auto-backup triggered upon finished bake (Apps4Brew T-012 standard)
  if (log.finishedAt) {
    void autoBackup({
      bakes: memLogs,
      starters: memStarters,
      customRecipes: memRecipes,
    });
  }
}

export async function deleteBakeLog(id: string): Promise<void> {
  memLogs = memLogs.filter((l) => l.id !== id);
  const db = await getDb();
  if (db) {
    try {
      await db.runAsync('DELETE FROM bakes WHERE id = ?;', id);
    } catch {
      // Memory state preserved
    }
  }
}

export function getActiveBake(): ActiveBakeState | null {
  return memActiveBake;
}

export function setActiveBake(bake: ActiveBakeState | null): void {
  memActiveBake = bake;
}

// ==========================================
// Starters (Zakwas)
// ==========================================

export async function getStarters(): Promise<StoredStarter[]> {
  const db = await getDb();
  if (!db) return [...memStarters];

  try {
    const rows = await db.getAllAsync<StoredStarter>(
      'SELECT id, name, flour_type as flourType, hydration, birth_date as birthDate, storage_state as storageState, last_fed_at as lastFedAt FROM starters;'
    );
    return rows.length > 0 ? rows : [...memStarters];
  } catch {
    return [...memStarters];
  }
}

export async function saveStarter(starter: StoredStarter): Promise<void> {
  const idx = memStarters.findIndex((s) => s.id === starter.id);
  if (idx >= 0) {
    memStarters[idx] = starter;
  } else {
    memStarters.push(starter);
  }

  const db = await getDb();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO starters (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        starter.id,
        starter.name,
        starter.flourType,
        starter.hydration,
        starter.birthDate,
        starter.storageState,
        starter.lastFedAt ?? null
      );
    } catch {
      // Memory fallback holds state
    }
  }
}

export async function deleteStarter(id: string): Promise<void> {
  memStarters = memStarters.filter((s) => s.id !== id);
  const db = await getDb();
  if (db) {
    try {
      await db.runAsync('DELETE FROM starters WHERE id = ?;', id);
    } catch {
      // Memory fallback holds state
    }
  }
}

// ==========================================
// Recipes (Kalkulator)
// ==========================================

export async function getRecipes(): Promise<StoredRecipe[]> {
  const db = await getDb();
  if (!db) return [...memRecipes];

  try {
    const rows = await db.getAllAsync<{
      id: string;
      name: string;
      formula_json: string;
      target_ddt: number;
      notes: string | null;
      is_built_in: number;
      created_at: number;
    }>('SELECT * FROM recipes ORDER BY created_at ASC;');

    if (rows.length === 0) return [...memRecipes];

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      formula: JSON.parse(r.formula_json),
      targetDDT: r.target_ddt,
      notes: r.notes ?? undefined,
      isBuiltIn: r.is_built_in === 1,
      createdAt: r.created_at,
    }));
  } catch {
    return [...memRecipes];
  }
}

export async function saveRecipe(recipe: StoredRecipe): Promise<void> {
  const idx = memRecipes.findIndex((r) => r.id === recipe.id);
  if (idx >= 0) {
    memRecipes[idx] = recipe;
  } else {
    memRecipes.push(recipe);
  }

  const db = await getDb();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO recipes (id, name, formula_json, target_ddt, notes, is_built_in, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        recipe.id,
        recipe.name,
        JSON.stringify(recipe.formula),
        recipe.targetDDT,
        recipe.notes ?? null,
        recipe.isBuiltIn ? 1 : 0,
        recipe.createdAt
      );
    } catch {
      // Memory state preserved
    }
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  memRecipes = memRecipes.filter((r) => r.id !== id);
  const db = await getDb();
  if (db) {
    try {
      await db.runAsync('DELETE FROM recipes WHERE id = ?;', id);
    } catch {
      // Memory state preserved
    }
  }
}

/**
 * Restores entire state from a validated backup dataset.
 */
export async function restoreFromBackupData(data: PiekarzBackupData): Promise<void> {
  // Always update memory store
  memLogs = [...data.bakes];
  memStarters = [...data.starters];
  memRecipes = [
    ...MASTER_RECIPES.map((preset) => ({
      id: preset.id,
      name: preset.namePl,
      formula: preset.formula,
      targetDDT: preset.targetDDT,
      notes: preset.notesPl,
      isBuiltIn: true,
      createdAt: Date.now(),
    })),
    ...data.customRecipes,
  ];

  const db = await getDb();
  if (!db) return;

  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM bakes;');
    await db.execAsync('DELETE FROM starters;');
    await db.execAsync('DELETE FROM recipes WHERE is_built_in = 0;');

    for (const s of data.starters) {
      await db.runAsync(
        'INSERT OR REPLACE INTO starters (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
        s.id,
        s.name,
        s.flourType,
        s.hydration,
        s.birthDate,
        s.storageState,
        s.lastFedAt ?? null
      );
    }

    for (const r of data.customRecipes) {
      await db.runAsync(
        'INSERT OR REPLACE INTO recipes (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
        r.id,
        r.name,
        JSON.stringify(r.formula),
        r.targetDDT,
        r.notes ?? null,
        0,
        r.createdAt
      );
    }

    for (const b of data.bakes) {
      await db.runAsync(
        'INSERT OR REPLACE INTO bakes (id, recipe_name, started_at, finished_at, ambient_temp, actual_ddt, rating_stars, notes, crumb_score, crust_score, taste_profile) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
        b.id,
        b.recipeName,
        b.startedAt,
        b.finishedAt ?? null,
        b.ambientTemp ?? null,
        b.actualDDT ?? null,
        b.ratingStars ?? null,
        b.notes ?? null,
        b.crumbScore ?? null,
        b.crustScore ?? null,
        b.tasteProfile ?? null
      );
    }
  });
}

// ==========================================
// Flour Inventory (Magazyn Mąk)
// ==========================================

export async function getFlourInventory(): Promise<StoredFlourInventoryItem[]> {
  const db = await getDb();
  if (!db) return [...memFlourInventory];

  try {
    const rows = await db.getAllAsync<any>(
      'SELECT id, name, stock_grams as stockGrams, brand, protein_pct as proteinPct, updated_at as updatedAt FROM flour_inventory ORDER BY name ASC;'
    );
    return rows;
  } catch {
    return [...memFlourInventory];
  }
}

export async function saveFlourInventoryItem(item: StoredFlourInventoryItem): Promise<void> {
  const existingIdx = memFlourInventory.findIndex((f) => f.id === item.id);
  if (existingIdx >= 0) {
    memFlourInventory[existingIdx] = item;
  } else {
    memFlourInventory.push(item);
  }

  const db = await getDb();
  if (!db) return;

  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO flour_inventory (id, name, stock_grams, brand, protein_pct, updated_at) VALUES (?, ?, ?, ?, ?, ?);',
      item.id,
      item.name,
      item.stockGrams,
      item.brand ?? null,
      item.proteinPct ?? null,
      item.updatedAt
    );
  } catch {}
}

export async function deleteFlourInventoryItem(id: string): Promise<void> {
  memFlourInventory = memFlourInventory.filter((f) => f.id !== id);

  const db = await getDb();
  if (!db) return;

  try {
    await db.runAsync('DELETE FROM flour_inventory WHERE id = ?;', id);
  } catch {}
}

export async function deductFlourStock(flourName: string, amountGrams: number): Promise<void> {
  const inventory = await getFlourInventory();
  const matched = inventory.find(
    (inv) => inv.name.trim().toLowerCase() === flourName.trim().toLowerCase()
  );
  if (matched) {
    const updated = {
      ...matched,
      stockGrams: Math.max(0, Math.round(matched.stockGrams - amountGrams)),
      updatedAt: Date.now(),
    };
    await saveFlourInventoryItem(updated);
  }
}

// ----------------------------------------------------------------------------
// Bread School Lesson Progress (Z-084…090 / SCI)
// ----------------------------------------------------------------------------

export async function getCompletedLessons(): Promise<number[]> {
  const db = await getDb();
  if (!db) {
    return [...memCompletedLessons];
  }

  try {
    const rows = (await db.getAllAsync(
      'SELECT level_id FROM lesson_progress ORDER BY level_id ASC;'
    )) as Array<{ level_id: number }>;
    return rows.map((r) => r.level_id);
  } catch {
    return [...memCompletedLessons];
  }
}

export async function toggleLessonProgress(levelId: number): Promise<boolean> {
  const current = await getCompletedLessons();
  const isCurrentlyCompleted = current.includes(levelId);

  const db = await getDb();
  if (!db) {
    if (isCurrentlyCompleted) {
      memCompletedLessons = memCompletedLessons.filter((l) => l !== levelId);
      return false;
    } else {
      memCompletedLessons.push(levelId);
      return true;
    }
  }

  try {
    if (isCurrentlyCompleted) {
      await db.runAsync('DELETE FROM lesson_progress WHERE level_id = ?;', levelId);
      memCompletedLessons = memCompletedLessons.filter((l) => l !== levelId);
      return false;
    } else {
      await db.runAsync(
        'INSERT OR REPLACE INTO lesson_progress (level_id, completed_at) VALUES (?, ?);',
        levelId,
        Date.now()
      );
      if (!memCompletedLessons.includes(levelId)) {
        memCompletedLessons.push(levelId);
      }
      return true;
    }
  } catch {
    return !isCurrentlyCompleted;
  }
}

export async function isLessonCompleted(levelId: number): Promise<boolean> {
  const list = await getCompletedLessons();
  return list.includes(levelId);
}

// ----------------------------------------------------------------------------
// Apps4Brew App Access & Monetization Store (Cheaper than espresso)
// ----------------------------------------------------------------------------

export async function getAppAccess(): Promise<StoredAppAccess> {
  const db = await getDb();
  if (!db) {
    return { ...memAppAccess };
  }
  try {
    const row = (await db.getFirstAsync(
      'SELECT id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count FROM app_access WHERE id = ?;',
      'current_user'
    )) as {
      id: string;
      trial_started_at: number;
      trial_days: number;
      subscription_tier: string;
      subscription_expires_at: number | null;
      completed_bakes_count: number;
    } | null;

    if (!row) {
      const now = Date.now();
      await db.runAsync(
        `INSERT OR REPLACE INTO app_access (id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count)
         VALUES ('current_user', ?, 7, 'none', NULL, 0);`,
        now
      );
      memAppAccess = {
        id: 'current_user',
        trialStartedAt: now,
        trialDays: 7,
        subscriptionTier: 'none',
        subscriptionExpiresAt: null,
        completedBakesCount: 0,
      };
      return { ...memAppAccess };
    }

    const data: StoredAppAccess = {
      id: row.id,
      trialStartedAt: row.trial_started_at,
      trialDays: row.trial_days,
      subscriptionTier: (row.subscription_tier as SubscriptionTier) || 'none',
      subscriptionExpiresAt: row.subscription_expires_at,
      completedBakesCount: row.completed_bakes_count || 0,
    };
    memAppAccess = { ...data };
    return data;
  } catch {
    return { ...memAppAccess };
  }
}

export async function setSubscriptionTier(tier: SubscriptionTier, expiresAt?: number | null): Promise<void> {
  memAppAccess = {
    ...memAppAccess,
    subscriptionTier: tier,
    subscriptionExpiresAt: expiresAt ?? null,
  };
  const db = await getDb();
  if (!db) return;
  try {
    await db.runAsync(
      `UPDATE app_access SET subscription_tier = ?, subscription_expires_at = ? WHERE id = 'current_user';`,
      tier,
      expiresAt ?? null
    );
  } catch {}
}

export async function incrementCompletedBakes(): Promise<number> {
  const current = await getAppAccess();
  const nextCount = current.completedBakesCount + 1;
  memAppAccess = {
    ...memAppAccess,
    completedBakesCount: nextCount,
  };
  const db = await getDb();
  if (!db) return nextCount;
  try {
    await db.runAsync(
      `UPDATE app_access SET completed_bakes_count = ? WHERE id = 'current_user';`,
      nextCount
    );
  } catch {}
  return nextCount;
}

export async function resetAppAccess(custom?: Partial<StoredAppAccess>): Promise<StoredAppAccess> {
  const resetData: StoredAppAccess = {
    id: 'current_user',
    trialStartedAt: custom?.trialStartedAt ?? Date.now(),
    trialDays: custom?.trialDays ?? 7,
    subscriptionTier: custom?.subscriptionTier ?? 'none',
    subscriptionExpiresAt: custom?.subscriptionExpiresAt ?? null,
    completedBakesCount: custom?.completedBakesCount ?? 0,
  };
  memAppAccess = { ...resetData };
  const db = await getDb();
  if (!db) return resetData;
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO app_access (id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count)
       VALUES ('current_user', ?, ?, ?, ?, ?);`,
      resetData.trialStartedAt,
      resetData.trialDays,
      resetData.subscriptionTier,
      resetData.subscriptionExpiresAt ?? null,
      resetData.completedBakesCount
    );
  } catch {}
  return resetData;
}

// ==========================================
// Generic App Settings (Key-Value)
// ==========================================

export async function getAppSetting(key: string, defaultValue?: string): Promise<string | undefined> {
  const db = await getDb();
  if (!db) return memSettings[key] ?? defaultValue;
  try {
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?;',
      key
    );
    return row?.value ?? memSettings[key] ?? defaultValue;
  } catch {
    return memSettings[key] ?? defaultValue;
  }
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  memSettings[key] = value;
  const db = await getDb();
  if (!db) return;
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);',
      key,
      value
    );
  } catch {}
}

export type BakerRitualProfile = 'sourdough_purist' | 'artisan_hybrid' | 'beginner';
export type BakingVessel = 'dutch_oven' | 'cloche' | 'baking_steel' | 'pullman_pan';

export async function hasCompletedOnboarding(): Promise<boolean> {
  const val = await getAppSetting('has_completed_onboarding', 'false');
  return val === 'true';
}

export async function setOnboardingCompleted(completed = true): Promise<void> {
  await setAppSetting('has_completed_onboarding', completed ? 'true' : 'false');
}

export async function getBakerRitualProfile(): Promise<BakerRitualProfile> {
  const val = await getAppSetting('baker_ritual_profile', 'artisan_hybrid');
  if (val === 'sourdough_purist' || val === 'beginner') return val;
  return 'artisan_hybrid';
}

export async function setBakerRitualProfile(profile: BakerRitualProfile): Promise<void> {
  await setAppSetting('baker_ritual_profile', profile);
}

export async function getBakingVessel(): Promise<BakingVessel> {
  const val = await getAppSetting('selected_baking_vessel', 'dutch_oven');
  if (val === 'cloche' || val === 'baking_steel' || val === 'pullman_pan') return val;
  return 'dutch_oven';
}

export async function setBakingVessel(vessel: BakingVessel): Promise<void> {
  await setAppSetting('selected_baking_vessel', vessel);
}


