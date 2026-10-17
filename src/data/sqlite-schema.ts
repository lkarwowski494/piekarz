import * as SQLite from 'expo-sqlite';
import { dbDirectory } from '../lib/db-path';
import { saveCorruptState } from '../lib/backup';
import {
  StoredRecipe,
  StoredStarter,
  StoredBakeLog,
  StoredFlourInventoryItem,
  StoredAppAccess,
} from './db';
import { MASTER_RECIPES } from '../recipes/presets';
import { DoughRecipeResult, DoughRecipeInput } from '../core/domain-rules';

export const DB_NAME = 'piekarz.db';

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
export const memStore = {
  starters: [] as StoredStarter[],
  recipes: [] as StoredRecipe[],
  logs: [] as StoredBakeLog[],
  flourInventory: [] as StoredFlourInventoryItem[],
  completedLessons: [] as number[],
  activeBake: null as ActiveBakeState | null,
  appAccess: {
    id: 'current_user',
    trialStartedAt: Date.now(),
    trialDays: 7,
    subscriptionTier: 'none' as const,
    subscriptionExpiresAt: null,
    completedBakesCount: 0,
  } as StoredAppAccess,
  settings: {} as Record<string, string>,
};

export function _resetMemStore(): void {
  memStore.starters = [];
  memStore.recipes = [];
  memStore.logs = [];
  memStore.flourInventory = [];
  memStore.completedLessons = [];
  memStore.activeBake = null;
  memStore.settings = {};
  memStore.appAccess = {
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
  } catch (err: any) {
    try {
      void saveCorruptState(JSON.stringify({ error: err?.message || String(err) }), 'SQLite open failed');
    } catch {}
    return null; // Fallback to memory store
  }
}

export async function initDatabase(): Promise<void> {
  const db = await getDb();

  // Populate memory store defaults regardless
  if (memStore.recipes.length === 0) {
    memStore.recipes = MASTER_RECIPES.map((preset) => ({
      id: preset.id,
      name: preset.namePl,
      formula: preset.formula,
      targetDDT: preset.targetDDT,
      notes: preset.notesPl,
      isBuiltIn: true,
      createdAt: Date.now(),
    }));
  }

  if (memStore.starters.length === 0) {
    memStore.starters = [
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

  if (memStore.flourInventory.length === 0) {
    memStore.flourInventory = [
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

      CREATE TABLE IF NOT EXISTS lesson_progress (
        level_id INTEGER PRIMARY KEY NOT NULL,
        completed_at INTEGER NOT NULL
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
