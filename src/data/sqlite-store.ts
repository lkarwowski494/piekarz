import { autoBackup, PiekarzBackupData } from '../lib/backup';
import {
  StoredRecipe,
  StoredStarter,
  StoredBakeLog,
  StoredFlourInventoryItem,
  StoredAppAccess,
  SubscriptionTier,
} from './db';
import { MASTER_RECIPES } from '../recipes/presets';
import {
  getDb,
  memStore,
  ActiveBakeState,
  initDatabase,
  _resetMemStore,
} from './sqlite-schema';
import { signAppAccessRecord, verifyAppAccessRecord } from '../lib/app-access-crypto';

export {
  getDb,
  initDatabase,
  _resetMemStore,
  ActiveBakeState,
};

// ==========================================
// Bakes & Stolnica
// ==========================================

export async function getBakeLogs(): Promise<StoredBakeLog[]> {
  const db = await getDb();
  if (!db) return [...memStore.logs];

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
        tasteProfile: (r.tasteProfile as StoredBakeLog['tasteProfile']) ?? undefined,
        sensoryProfile,
      };
    });
  } catch {
    return [...memStore.logs];
  }
}

export async function saveBakeLog(log: StoredBakeLog): Promise<void> {
  const existingIdx = memStore.logs.findIndex((l) => l.id === log.id);
  if (existingIdx >= 0) {
    memStore.logs[existingIdx] = log;
  } else {
    memStore.logs.unshift(log);
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

  // Auto-backup triggered upon finished bake (Apps4Craft T-012 standard)
  if (log.finishedAt) {
    void autoBackup({
      bakes: memStore.logs,
      starters: memStore.starters,
      customRecipes: memStore.recipes,
    });
  }
}

export async function deleteBakeLog(id: string): Promise<void> {
  memStore.logs = memStore.logs.filter((l) => l.id !== id);
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
  return memStore.activeBake;
}

export function setActiveBake(bake: ActiveBakeState | null): void {
  memStore.activeBake = bake;
}

// ==========================================
// Starters (Zakwas)
// ==========================================

export async function getStarters(): Promise<StoredStarter[]> {
  const db = await getDb();
  if (!db) return [...memStore.starters];

  try {
    const rows = await db.getAllAsync<StoredStarter>(
      'SELECT id, name, flour_type as flourType, hydration, birth_date as birthDate, storage_state as storageState, last_fed_at as lastFedAt FROM starters;'
    );
    return rows.length > 0 ? rows : [...memStore.starters];
  } catch {
    return [...memStore.starters];
  }
}

export async function saveStarter(starter: StoredStarter): Promise<void> {
  const idx = memStore.starters.findIndex((s) => s.id === starter.id);
  if (idx >= 0) {
    memStore.starters[idx] = starter;
  } else {
    memStore.starters.push(starter);
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
  memStore.starters = memStore.starters.filter((s) => s.id !== id);
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
  if (!db) return [...memStore.recipes];

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

    if (rows.length === 0) return [...memStore.recipes];

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
    return [...memStore.recipes];
  }
}

export async function saveRecipe(recipe: StoredRecipe): Promise<void> {
  const idx = memStore.recipes.findIndex((r) => r.id === recipe.id);
  if (idx >= 0) {
    memStore.recipes[idx] = recipe;
  } else {
    memStore.recipes.push(recipe);
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
  memStore.recipes = memStore.recipes.filter((r) => r.id !== id);
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
  memStore.logs = [...data.bakes];
  memStore.starters = [...data.starters];
  memStore.recipes = [
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
  if (!db) return [...memStore.flourInventory];

  try {
    const rows = await db.getAllAsync<StoredFlourInventoryItem>(
      'SELECT id, name, stock_grams as stockGrams, brand, protein_pct as proteinPct, updated_at as updatedAt FROM flour_inventory ORDER BY name ASC;'
    );
    return rows;
  } catch {
    return [...memStore.flourInventory];
  }
}

export async function saveFlourInventoryItem(item: StoredFlourInventoryItem): Promise<void> {
  const existingIdx = memStore.flourInventory.findIndex((f) => f.id === item.id);
  if (existingIdx >= 0) {
    memStore.flourInventory[existingIdx] = item;
  } else {
    memStore.flourInventory.push(item);
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
  memStore.flourInventory = memStore.flourInventory.filter((f) => f.id !== id);

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
    return [...memStore.completedLessons];
  }

  try {
    const rows = (await db.getAllAsync(
      'SELECT level_id FROM lesson_progress ORDER BY level_id ASC;'
    )) as Array<{ level_id: number }>;
    return rows.map((r) => r.level_id);
  } catch {
    return [...memStore.completedLessons];
  }
}

export async function toggleLessonProgress(levelId: number): Promise<boolean> {
  const current = await getCompletedLessons();
  const isCurrentlyCompleted = current.includes(levelId);

  const db = await getDb();
  if (!db) {
    if (isCurrentlyCompleted) {
      memStore.completedLessons = memStore.completedLessons.filter((l) => l !== levelId);
      return false;
    } else {
      memStore.completedLessons.push(levelId);
      return true;
    }
  }

  try {
    if (isCurrentlyCompleted) {
      await db.runAsync('DELETE FROM lesson_progress WHERE level_id = ?;', levelId);
      memStore.completedLessons = memStore.completedLessons.filter((l) => l !== levelId);
      return false;
    } else {
      await db.runAsync(
        'INSERT OR REPLACE INTO lesson_progress (level_id, completed_at) VALUES (?, ?);',
        levelId,
        Date.now()
      );
      if (!memStore.completedLessons.includes(levelId)) {
        memStore.completedLessons.push(levelId);
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
// Apps4Craft App Access & Monetization Store (Cheaper than espresso)
// ----------------------------------------------------------------------------

export async function getAppAccess(): Promise<StoredAppAccess> {
  const db = await getDb();
  if (!db) {
    return { ...memStore.appAccess };
  }
  try {
    const row = (await db.getFirstAsync(
      'SELECT id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count, signature FROM app_access WHERE id = ?;',
      'current_user'
    )) as {
      id: string;
      trial_started_at: number;
      trial_days: number;
      subscription_tier: string;
      subscription_expires_at: number | null;
      completed_bakes_count: number;
      signature?: string | null;
    } | null;

    if (!row) {
      const now = Date.now();
      const initialData: StoredAppAccess = {
        id: 'current_user',
        trialStartedAt: now,
        trialDays: 14,
        subscriptionTier: 'none',
        subscriptionExpiresAt: null,
        completedBakesCount: 0,
      };
      const signature = signAppAccessRecord(initialData);
      initialData.signature = signature;

      await db.runAsync(
        `INSERT OR REPLACE INTO app_access (id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count, signature)
         VALUES ('current_user', ?, 14, 'none', NULL, 0, ?);`,
        now,
        signature
      );
      memStore.appAccess = { ...initialData };
      return { ...memStore.appAccess };
    }

    const candidateData: StoredAppAccess = {
      id: row.id,
      trialStartedAt: row.trial_started_at,
      trialDays: row.trial_days,
      subscriptionTier: (row.subscription_tier as SubscriptionTier) || 'none',
      subscriptionExpiresAt: row.subscription_expires_at,
      completedBakesCount: row.completed_bakes_count || 0,
    };

    // TASK-R03-03: Cryptographic verification of subscription status
    if (row.signature) {
      const isValid = verifyAppAccessRecord(candidateData, row.signature);
      if (!isValid) {
        // Tamper detected! Reset illegitimate subscription rights
        candidateData.subscriptionTier = 'none';
        const resealed = signAppAccessRecord(candidateData);
        await db.runAsync(
          `UPDATE app_access SET subscription_tier = 'none', signature = ? WHERE id = 'current_user';`,
          resealed
        );
        candidateData.signature = resealed;
      } else {
        candidateData.signature = row.signature;
      }
    } else {
      // First boot or upgrade from v1: seal and persist signature
      const newSignature = signAppAccessRecord(candidateData);
      await db.runAsync(
        `UPDATE app_access SET signature = ? WHERE id = 'current_user';`,
        newSignature
      );
      candidateData.signature = newSignature;
    }

    memStore.appAccess = { ...candidateData };
    return candidateData;
  } catch {
    return { ...memStore.appAccess };
  }
}

export async function setSubscriptionTier(tier: SubscriptionTier, expiresAt?: number | null): Promise<void> {
  const current = await getAppAccess();
  const updated: StoredAppAccess = {
    ...current,
    subscriptionTier: tier,
    subscriptionExpiresAt: expiresAt ?? null,
  };
  const signature = signAppAccessRecord(updated);
  updated.signature = signature;

  memStore.appAccess = { ...updated };
  const db = await getDb();
  if (!db) return;
  try {
    await db.runAsync(
      `UPDATE app_access SET subscription_tier = ?, subscription_expires_at = ?, signature = ? WHERE id = 'current_user';`,
      tier,
      expiresAt ?? null,
      signature
    );
  } catch {}
}

export async function incrementCompletedBakes(): Promise<number> {
  const current = await getAppAccess();
  const nextCount = current.completedBakesCount + 1;
  const updated: StoredAppAccess = {
    ...current,
    completedBakesCount: nextCount,
  };
  const signature = signAppAccessRecord(updated);
  updated.signature = signature;

  memStore.appAccess = { ...updated };
  const db = await getDb();
  if (!db) return nextCount;
  try {
    await db.runAsync(
      `UPDATE app_access SET completed_bakes_count = ?, signature = ? WHERE id = 'current_user';`,
      nextCount,
      signature
    );
  } catch {}
  return nextCount;
}

export async function resetAppAccess(custom?: Partial<StoredAppAccess>): Promise<StoredAppAccess> {
  const resetData: StoredAppAccess = {
    id: 'current_user',
    trialStartedAt: custom?.trialStartedAt ?? Date.now(),
    trialDays: custom?.trialDays ?? 14,
    subscriptionTier: custom?.subscriptionTier ?? 'none',
    subscriptionExpiresAt: custom?.subscriptionExpiresAt ?? null,
    completedBakesCount: custom?.completedBakesCount ?? 0,
  };
  const signature = signAppAccessRecord(resetData);
  resetData.signature = signature;

  memStore.appAccess = { ...resetData };
  const db = await getDb();
  if (!db) return resetData;
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO app_access (id, trial_started_at, trial_days, subscription_tier, subscription_expires_at, completed_bakes_count, signature)
       VALUES ('current_user', ?, ?, ?, ?, ?, ?);`,
      resetData.trialStartedAt,
      resetData.trialDays,
      resetData.subscriptionTier,
      resetData.subscriptionExpiresAt ?? null,
      resetData.completedBakesCount,
      signature
    );
  } catch {}
  return resetData;
}

// ==========================================
// Generic App Settings (Key-Value)
// ==========================================

export async function getAppSetting(key: string, defaultValue?: string): Promise<string | undefined> {
  const db = await getDb();
  if (!db) return memStore.settings[key] ?? defaultValue;
  try {
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?;',
      key
    );
    return row?.value ?? memStore.settings[key] ?? defaultValue;
  } catch {
    return memStore.settings[key] ?? defaultValue;
  }
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  memStore.settings[key] = value;
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
