import { autoBackup, PiekarzBackupData } from '../lib/backup';
import {
  StoredRecipe,
  StoredStarter,
  StoredBakeLog,
  StoredFlourInventoryItem,
  StoredAppAccess,
} from './db';
import { MASTER_RECIPES } from '../recipes/presets';
import {
  getDb,
  memStore,
  ActiveBakeState,
  initDatabase,
  _resetMemStore,
} from './sqlite-schema';

export {
  getDb,
  initDatabase,
  _resetMemStore,
  ActiveBakeState,
};
export * from './app-access-store';
export * from './settings-store';
import { writeOrThrow } from './storage-status';
import { getAppAccess, incrementCompletedBakes } from './app-access-store';
import { signAppAccessRecord } from '../lib/app-access-crypto';
import { isRecipeInput } from './row-parsers';

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

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

/** Jeden zapis wiersza wypieku dla zapisu i przywracania kopii — wszystkie kolumny [M1-audytor-generalny-002]. */
async function writeBakeRow(db: Db, log: StoredBakeLog): Promise<void> {
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
    log.sensoryProfile ? JSON.stringify(log.sensoryProfile) : null
  );
}

export async function saveBakeLog(log: StoredBakeLog): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => writeBakeRow(db, log));

  const existingIdx = memStore.logs.findIndex((l) => l.id === log.id);
  if (existingIdx >= 0) {
    memStore.logs[existingIdx] = log;
  } else {
    memStore.logs.unshift(log);
  }

  // Auto-backup triggered upon finished bake (Apps4Craft T-012 standard)
  if (log.finishedAt) {
    void collectBackupData()
      .then((data) => autoBackup(data))
      .catch(() => null);
  }
}

/**
 * Stan do kopii zapasowej czytany z bazy (cała historia użytkownika), bez receptur wbudowanych
 * i bez danych demonstracyjnych, których nie ma w bazie [M1-audytor-generalny-001].
 */
export async function collectBackupData(): Promise<PiekarzBackupData> {
  const db = await getDb();
  if (!db) {
    return {
      bakes: [...memStore.logs],
      starters: [...memStore.starters],
      customRecipes: memStore.recipes.filter((r) => !r.isBuiltIn),
    };
  }
  const [bakes, starters, recipes] = await Promise.all([
    getBakeLogs(),
    db.getAllAsync<StoredStarter>(STARTERS_SELECT),
    getRecipes(),
  ]);
  return { bakes, starters, customRecipes: recipes.filter((r) => !r.isBuiltIn) };
}

export async function deleteBakeLog(id: string): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => db.runAsync('DELETE FROM bakes WHERE id = ?;', id));
  memStore.logs = memStore.logs.filter((l) => l.id !== id);
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

const STARTERS_SELECT =
  'SELECT id, name, flour_type as flourType, hydration, birth_date as birthDate, storage_state as storageState, last_fed_at as lastFedAt FROM starters;';

export async function getStarters(): Promise<StoredStarter[]> {
  const db = await getDb();
  if (!db) return [...memStore.starters];

  try {
    const rows = await db.getAllAsync<StoredStarter>(STARTERS_SELECT);
    return rows.length > 0 ? rows : [...memStore.starters];
  } catch {
    return [...memStore.starters];
  }
}

export async function saveStarter(starter: StoredStarter): Promise<void> {
  const db = await getDb();
  if (db) {
    await writeOrThrow(() =>
      db.runAsync(
        `INSERT OR REPLACE INTO starters (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        starter.id,
        starter.name,
        starter.flourType,
        starter.hydration,
        starter.birthDate,
        starter.storageState,
        starter.lastFedAt ?? null
      )
    );
  }

  const idx = memStore.starters.findIndex((s) => s.id === starter.id);
  if (idx >= 0) {
    memStore.starters[idx] = starter;
  } else {
    memStore.starters.push(starter);
  }
}

export async function deleteStarter(id: string): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => db.runAsync('DELETE FROM starters WHERE id = ?;', id));
  memStore.starters = memStore.starters.filter((s) => s.id !== id);
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

    // Wiersz z uszkodzonym formula_json jest pomijany, nie ukrywa pozostałych [M1-audytor-generalny-022]
    const out: StoredRecipe[] = [];
    for (const r of rows) {
      let formula: unknown;
      try {
        formula = JSON.parse(r.formula_json);
      } catch {
        continue;
      }
      if (!isRecipeInput(formula)) continue;
      out.push({
        id: r.id,
        name: r.name,
        formula,
        targetDDT: r.target_ddt,
        notes: r.notes ?? undefined,
        isBuiltIn: r.is_built_in === 1,
        createdAt: r.created_at,
      });
    }
    return out;
  } catch {
    return [...memStore.recipes];
  }
}

export async function saveRecipe(recipe: StoredRecipe): Promise<void> {
  const db = await getDb();
  if (db) {
    await writeOrThrow(() =>
      db.runAsync(
        `INSERT OR REPLACE INTO recipes (id, name, formula_json, target_ddt, notes, is_built_in, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        recipe.id,
        recipe.name,
        JSON.stringify(recipe.formula),
        recipe.targetDDT,
        recipe.notes ?? null,
        recipe.isBuiltIn ? 1 : 0,
        recipe.createdAt
      )
    );
  }

  const idx = memStore.recipes.findIndex((r) => r.id === recipe.id);
  if (idx >= 0) {
    memStore.recipes[idx] = recipe;
  } else {
    memStore.recipes.push(recipe);
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => db.runAsync('DELETE FROM recipes WHERE id = ?;', id));
  memStore.recipes = memStore.recipes.filter((r) => r.id !== id);
}

/**
 * Restores entire state from a validated backup dataset.
 */
export async function restoreFromBackupData(data: PiekarzBackupData): Promise<void> {
  // Pamięć dopiero po zatwierdzeniu transakcji: nieudany import nie udaje sukcesu [M1-audytor-generalny-022]
  const applyToMemory = () => {
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
  };

  const db = await getDb();
  if (!db) {
    applyToMemory();
    return;
  }

  await writeOrThrow(() => db.withTransactionAsync(async () => {
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
      await writeBakeRow(db, b);
    }
  }));
  applyToMemory();
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

async function writeFlourRow(db: Db, item: StoredFlourInventoryItem): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO flour_inventory (id, name, stock_grams, brand, protein_pct, updated_at) VALUES (?, ?, ?, ?, ?, ?);',
    item.id,
    item.name,
    item.stockGrams,
    item.brand ?? null,
    item.proteinPct ?? null,
    item.updatedAt
  );
}

function rememberFlour(item: StoredFlourInventoryItem): void {
  const existingIdx = memStore.flourInventory.findIndex((f) => f.id === item.id);
  if (existingIdx >= 0) {
    memStore.flourInventory[existingIdx] = item;
  } else {
    memStore.flourInventory.push(item);
  }
}

export async function saveFlourInventoryItem(item: StoredFlourInventoryItem): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => writeFlourRow(db, item));
  rememberFlour(item);
}

/**
 * Zakończenie wypieku w jednej transakcji: wpis do historii, licznik wypieków i odliczenie mąki
 * (dopasowanie po nazwie jak w deductFlourStock). Błąd w środku wycofuje całość [M1-audytor-generalny-021].
 */
export async function finishBake(log: StoredBakeLog, flours: Array<{ name: string; weightGrams: number }>): Promise<void> {
  const db = await getDb();
  if (!db) {
    await saveBakeLog(log);
    await incrementCompletedBakes();
    for (const f of flours) await deductFlourStock(f.name, f.weightGrams);
    return;
  }

  const current = await getAppAccess();
  const access: StoredAppAccess = { ...current, completedBakesCount: current.completedBakesCount + 1 };
  access.signature = signAppAccessRecord(access);
  const inventory = (await getFlourInventory()).map((i) => ({ ...i }));
  const changed = new Map<string, StoredFlourInventoryItem>();
  for (const f of flours) {
    const matched = inventory.find((inv) => inv.name.trim().toLowerCase() === f.name.trim().toLowerCase());
    if (matched) {
      matched.stockGrams = Math.max(0, Math.round(matched.stockGrams - f.weightGrams));
      matched.updatedAt = Date.now();
      changed.set(matched.id, matched);
    }
  }

  await writeOrThrow(() =>
    db.withTransactionAsync(async () => {
      await writeBakeRow(db, log);
      await db.runAsync(
        `UPDATE app_access SET completed_bakes_count = ?, signature = ? WHERE id = 'current_user';`,
        access.completedBakesCount,
        access.signature ?? null
      );
      for (const item of changed.values()) await writeFlourRow(db, item);
    })
  );

  // Pamięć dopiero po zatwierdzeniu transakcji
  memStore.logs = [log, ...memStore.logs.filter((l) => l.id !== log.id)];
  memStore.appAccess = { ...access };
  changed.forEach(rememberFlour);
  if (log.finishedAt) {
    void collectBackupData()
      .then((data) => autoBackup(data))
      .catch(() => null);
  }
}

export async function deleteFlourInventoryItem(id: string): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => db.runAsync('DELETE FROM flour_inventory WHERE id = ?;', id));
  memStore.flourInventory = memStore.flourInventory.filter((f) => f.id !== id);
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
