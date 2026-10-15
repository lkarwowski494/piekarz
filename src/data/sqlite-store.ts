import * as SQLite from 'expo-sqlite';
import { dbDirectory } from '../lib/db-path';
import { autoBackup, PiekarzBackupData } from '../lib/backup';
import { StoredRecipe, StoredStarter, StoredBakeLog } from './db';
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
let memActiveBake: ActiveBakeState | null = null;

export function _resetMemStore(): void {
  memStarters = [];
  memRecipes = [];
  memLogs = [];
  memActiveBake = null;
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
        notes TEXT
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
    `);
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
    const rows = await db.getAllAsync<StoredBakeLog>(
      'SELECT id, recipe_name as recipeName, started_at as startedAt, finished_at as finishedAt, ambient_temp as ambientTemp, actual_ddt as actualDDT, rating_stars as ratingStars, notes FROM bakes ORDER BY started_at DESC;'
    );
    return rows;
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
      await db.runAsync(
        `INSERT OR REPLACE INTO bakes (id, recipe_name, started_at, finished_at, ambient_temp, actual_ddt, rating_stars, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        log.id,
        log.recipeName,
        log.startedAt,
        log.finishedAt ?? null,
        log.ambientTemp ?? null,
        log.actualDDT ?? null,
        log.ratingStars ?? null,
        log.notes ?? null
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
        'INSERT OR REPLACE INTO bakes (id, recipe_name, started_at, finished_at, ambient_temp, actual_ddt, rating_stars, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        b.id,
        b.recipeName,
        b.startedAt,
        b.finishedAt ?? null,
        b.ambientTemp ?? null,
        b.actualDDT ?? null,
        b.ratingStars ?? null,
        b.notes ?? null
      );
    }
  });
}


