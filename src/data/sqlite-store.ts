import { autoBackup, PiekarzBackupData } from '../lib/backup';
import {
  StoredStarter,
  StoredStarterEntry,
  StoredBakeLog,
  StoredFlourInventoryItem,
} from './db';
import { STARTER_UPSERT, starterParams, getAllStarterEntries, insertStarterEntryRow } from './starter-entries-store';
import { legacyFeedingEntry } from '../core/starter-log';
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
export * from './settings-store';
export * from './recipes-store';
export * from './flour-store';
import { getRecipes } from './recipes-store';
import { getFlourInventory, writeFlourRow, rememberFlour, deductFlourStock } from './flour-store';
import { writeOrThrow, getStorageState, getStorageError, StorageReadError } from './storage-status';
import { odczytNieudany } from './odczyt';
import { czytajUstawieniaILekcje, dozwolony, zapiszUstawieniaILekcje } from './ustawienia-kopii';
import { zakonczSesjeWTransakcji, zakonczSesjeWPamieci, type KoniecSesji } from './bake-sessions-store';
import { zachowajUszkodzony, uszkodzoneWiersze } from './uszkodzone-wiersze';
import { czytajNowePola, dzienPoImporcie, dzienZKolumn, wpisPoImporcie, zapiszStalyDzien } from './nowe-pola-kopii';

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
      recipeId: string | null;
    }>(
      'SELECT id, recipe_name as recipeName, started_at as startedAt, finished_at as finishedAt, ambient_temp as ambientTemp, actual_ddt as actualDDT, rating_stars as ratingStars, notes, crumb_score as crumbScore, crust_score as crustScore, taste_profile as tasteProfile, sensory_profile as sensoryProfileRaw, recipe_id as recipeId FROM bakes ORDER BY started_at DESC;'
    );
    return rows.map((r) => {
      let sensoryProfile: StoredBakeLog['sensoryProfile'] = undefined;
      if (r.sensoryProfileRaw) {
        try {
          sensoryProfile = JSON.parse(r.sensoryProfileRaw);
        } catch {
          // Uszkodzony JSON profilu: brak zostaje brakiem (undefined), bez zgadywania wartości;
          // surowa treść do pliku ratunkowego i kopii [M1-audytor-generalny-121]
          zachowajUszkodzony({ tabela: 'bakes', id: r.id, surowe: r.sensoryProfileRaw });
        }
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
        ...(r.recipeId === null ? {} : { recipeId: r.recipeId }),
      };
    });
  } catch (e) {
    return odczytNieudany(e);
  }
}

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

/**
 * Jeden zapis wiersza wypieku dla zapisu i przywracania kopii — wszystkie kolumny [M1-audytor-generalny-002].
 * UPSERT, nie INSERT OR REPLACE (zasada wspólna 10): REPLACE usuwał wiersz, więc ocena po wypieku zerowała
 * recipe_id. Wpis bez recipeId zostawia recipe_id w bazie [M3 D1].
 */
async function writeBakeRow(db: Db, log: StoredBakeLog): Promise<void> {
  await db.runAsync(
    `INSERT INTO bakes (id, recipe_name, started_at, finished_at, ambient_temp, actual_ddt, rating_stars, notes, crumb_score, crust_score, taste_profile, sensory_profile, recipe_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET recipe_name = excluded.recipe_name, started_at = excluded.started_at, finished_at = excluded.finished_at,
       ambient_temp = excluded.ambient_temp, actual_ddt = excluded.actual_ddt, rating_stars = excluded.rating_stars, notes = excluded.notes,
       crumb_score = excluded.crumb_score, crust_score = excluded.crust_score, taste_profile = excluded.taste_profile,
       sensory_profile = excluded.sensory_profile, recipe_id = COALESCE(excluded.recipe_id, bakes.recipe_id);`,
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
    log.sensoryProfile ? JSON.stringify(log.sensoryProfile) : null,
    log.recipeId ?? null
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
      starterEntries: [...memStore.starterEntries],
      flourInventory: [...memStore.flourInventory],
      settings: Object.fromEntries(Object.entries(memStore.settings).filter(([k]) => dozwolony(k))),
      lessonProgress: memStore.completedLessons.map((levelId) => ({ levelId, completedAt: 0 })),
    };
  }
  const [bakes, starters, recipes, starterEntries, flourInventory, zTelefonu] = await Promise.all([
    getBakeLogs(),
    readStarters(db),
    getRecipes(),
    getAllStarterEntries(),
    getFlourInventory(),
    // Dozwolone ustawienia i lekcje (BR-DANE-003) [M1-audytor-generalny-139]
    czytajUstawieniaILekcje(db).catch((e: unknown) => {
      odczytNieudany(e);
      return { settings: {}, lessonProgress: [] };
    }),
  ]);
  // Nieudany odczyt dał pustą listę: kopia z niepełnych danych wyparłaby dobre kopie z puli [M1-audytor-generalny-003]
  if (getStorageState() === 'unavailable') throw new StorageReadError(getStorageError() ?? 'read failed');
  // Surowa treść wierszy pominiętych przy odczycie: kopia przed importem i czyszczeniem jej nie gubi [M1-audytor-generalny-121]
  const uszkodzone = uszkodzoneWiersze();
  if (uszkodzone.length > 0) {
    return { bakes, starters, customRecipes: recipes.filter((r) => !r.isBuiltIn), starterEntries, flourInventory, ...zTelefonu, uszkodzoneWiersze: uszkodzone };
  }
  return { bakes, starters, customRecipes: recipes.filter((r) => !r.isBuiltIn), starterEntries, flourInventory, ...zTelefonu };
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

// lastFedAt i feedingRatio wyliczane z najnowszego wpisu feeding (ADR-008, jedno źródło; indeks pokrywający)
const LAST_FEED = (col: string) =>
  `(SELECT e.${col} FROM starter_entries e WHERE e.starter_id = s.id AND e.kind = 'feeding' ORDER BY e.occurred_at DESC LIMIT 1)`;
const STARTERS_SELECT = `SELECT s.id, s.name, s.flour_type as flourType, s.hydration, s.birth_date as birthDate, s.storage_state as storageState,
  s.setup_started_at as setupStartedAt, s.setup_completed_at as setupCompletedAt,
  s.fridge_feed_weekday as fridgeFeedWeekday, s.fridge_feed_minute as fridgeFeedMinute,
  ${LAST_FEED('occurred_at')} as lastFedAt, ${LAST_FEED('feed_ratio')} as feedingRatio FROM starters s;`;

type StarterRow = Omit<StoredStarter, 'lastFedAt' | 'feedingRatio' | 'setupStartedAt' | 'setupCompletedAt' | 'fridgeFeedDay'> & {
  lastFedAt: number | null;
  feedingRatio: string | null;
  setupStartedAt: number | null;
  setupCompletedAt: number | null;
  fridgeFeedWeekday: number | null;
  fridgeFeedMinute: number | null;
};

/** Brak w bazie (NULL) zostaje brakiem (pole pominięte), bez zgadywania wartości. */
function starterFromRow({ lastFedAt, feedingRatio, setupStartedAt, setupCompletedAt, fridgeFeedWeekday, fridgeFeedMinute, ...s }: StarterRow): StoredStarter {
  const fridgeFeedDay = dzienZKolumn(fridgeFeedWeekday, fridgeFeedMinute);
  return {
    ...s,
    ...(lastFedAt === null ? {} : { lastFedAt }),
    ...(feedingRatio === null ? {} : { feedingRatio }),
    ...(setupStartedAt === null ? {} : { setupStartedAt }),
    ...(setupCompletedAt === null ? {} : { setupCompletedAt }),
    ...(fridgeFeedDay === null ? {} : { fridgeFeedDay }),
  };
}

async function readStarters(db: Db): Promise<StoredStarter[]> {
  return (await db.getAllAsync<StarterRow>(STARTERS_SELECT)).map(starterFromRow);
}

export async function getStarters(): Promise<StoredStarter[]> {
  const db = await getDb();
  if (!db) return [...memStore.starters];

  try {
    // Pusta tabela to pusta lista, nie zakwas pokazowy [M1-audytor-generalny-003]
    return await readStarters(db);
  } catch (e) {
    return odczytNieudany(e);
  }
}

/**
 * Zapis profilu zakwasu (UPSERT, dziennik zostaje). Zgodność z ekranem, który dokarmienie zapisuje dziś przez
 * nowe `lastFedAt`: gdy jest późniejsze niż ostatni wpis feeding, w tej samej transakcji powstaje wpis
 * dokarmienia z proporcją (do czasu przejścia ekranu na addStarterEntry) [M1-audytor-generalny-104].
 */
export async function saveStarter(starter: StoredStarter): Promise<void> {
  const db = await getDb();
  const fedAt = starter.lastFedAt;
  const feedEntry = (latest: number): StoredStarterEntry | null =>
    fedAt !== undefined && fedAt > 0 && fedAt > latest
      ? { id: `feed-${starter.id}-${fedAt}`, starterId: starter.id, kind: 'feeding', occurredAt: fedAt, feedRatio: starter.feedingRatio, signs: [], createdAt: fedAt, updatedAt: fedAt }
      : null;
  if (db) {
    await writeOrThrow(() =>
      db.withTransactionAsync(async () => {
        await db.runAsync(STARTER_UPSERT, ...starterParams(starter));
        const last = await db.getFirstAsync<{ at: number | null }>(
          "SELECT max(occurred_at) AS at FROM starter_entries WHERE starter_id = ? AND kind = 'feeding';",
          starter.id
        );
        const e = feedEntry(last?.at ?? 0);
        if (e) await insertStarterEntryRow(db, e, true);
      })
    );
  } else {
    const latest = Math.max(0, ...memStore.starterEntries.filter((x) => x.starterId === starter.id && x.kind === 'feeding').map((x) => x.occurredAt));
    const e = feedEntry(latest);
    if (e) memStore.starterEntries = [...memStore.starterEntries.filter((x) => x.id !== e.id), e];
  }

  const idx = memStore.starters.findIndex((s) => s.id === starter.id);
  if (idx >= 0) {
    memStore.starters[idx] = starter;
  } else {
    memStore.starters.push(starter);
  }
}

/** Usunięcie zakwasu: jawnie najpierw jego wpisy, potem zakwas, w jednej transakcji (kaskada to zabezpieczenie). */
export async function deleteStarter(id: string): Promise<void> {
  const db = await getDb();
  if (db) {
    await writeOrThrow(() =>
      db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM starter_entries WHERE starter_id = ?;', id);
        await db.runAsync('DELETE FROM starters WHERE id = ?;', id);
      })
    );
  }
  memStore.starters = memStore.starters.filter((s) => s.id !== id);
  memStore.starterEntries = memStore.starterEntries.filter((e) => e.starterId !== id);
}

/**
 * Restores entire state from a validated backup dataset.
 */
export async function restoreFromBackupData(data: PiekarzBackupData): Promise<void> {
  // Dziennik zakwasu (ADR-008): z kopii v2, a dla danych bez dziennika (kopia v1) wpis z lastFedAt jak migracja v5.
  // Wpis zakwasu spoza danych nie wchodzi (klucz obcy) [M1-audytor-generalny-104].
  const ids = new Set(data.starters.map((s) => s.id));
  const entries = (data.starterEntries ?? data.starters.flatMap((s) => legacyFeedingEntry(s) ?? [])).filter((e) => ids.has(e.starterId));
  // Pamięć dopiero po zatwierdzeniu transakcji: nieudany import nie udaje sukcesu [M1-audytor-generalny-022]
  const applyToMemory = () => {
    memStore.logs = [...data.bakes];
    memStore.starters = [...data.starters];
    memStore.starterEntries = [...entries];
    if (data.flourInventory) memStore.flourInventory = [...data.flourInventory];
    for (const [k, w] of Object.entries(data.settings ?? {})) if (dozwolony(k) && typeof w === 'string') memStore.settings[k] = w;
    if (data.lessonProgress) memStore.completedLessons = data.lessonProgress.map((l) => l.levelId);
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
    // Pola v6 z telefonu przed DELETE: kopia bez nich (sprzed D1) ich nie zmienia; sesje i plany poza kopią [M3 D1]
    const tel = await czytajNowePola(db);
    await db.execAsync('DELETE FROM bakes;');
    await db.execAsync('DELETE FROM starter_entries;');
    await db.execAsync('DELETE FROM starters;');
    await db.execAsync('DELETE FROM recipes WHERE is_built_in = 0;');

    for (const s of data.starters) {
      await db.runAsync(STARTER_UPSERT, ...starterParams(s));
      await zapiszStalyDzien(db, s.id, dzienPoImporcie(s, tel));
    }
    for (const e of entries) {
      await insertStarterEntryRow(db, e, true);
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
      await writeBakeRow(db, wpisPoImporcie(b, tel));
    }

    // Spiżarnia tylko z kopii, która ją niesie; kopia bez spiżarni (v1) zostawia zapasy [M1-audytor-generalny-097]
    if (data.flourInventory) {
      await db.execAsync('DELETE FROM flour_inventory;');
      for (const f of data.flourInventory) await writeFlourRow(db, f);
    }
    // Ustawienia i lekcje tylko z kopii, która je niesie (v2 bez nich zostawia stan telefonu) [M1-audytor-generalny-139]
    await zapiszUstawieniaILekcje(db, data.settings, data.lessonProgress);
  }));
  applyToMemory();
}

/**
 * Zakończenie wypieku w jednej transakcji: wpis do historii i odliczenie mąki
 * (dopasowanie po nazwie jak w deductFlourStock). Błąd w środku wycofuje całość [M1-audytor-generalny-021].
 * Sesja: `sessionId` kasuje wiersz tego wypieku (BR-KAL-016: koniec jednego nie rusza drugiego); bez niego żadna
 * sesja nie znika [M3 D3a]. Wpis bez recipeId dostaje recepturę z sesji, gdy ją ma [M3 D1].
 */
export async function finishBake(
  log: StoredBakeLog,
  flours: Array<{ name: string; weightGrams: number }>,
  opts: KoniecSesji = {}
): Promise<void> {
  const db = await getDb();
  if (!db) {
    const recipeId = await zakonczSesjeWTransakcji(null, opts);
    await saveBakeLog(log.recipeId === undefined && recipeId !== undefined ? { ...log, recipeId } : log);
    for (const f of flours) await deductFlourStock(f.name, f.weightGrams);
    zakonczSesjeWPamieci(opts);
    return;
  }

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

  let wpis = log;
  await writeOrThrow(() =>
    db.withTransactionAsync(async () => {
      // Skasowanie sesji w tej samej transakcji: zakończony wypiek nie wraca jako trwający [M1-audytor-generalny-120]
      const recipeId = await zakonczSesjeWTransakcji(db, opts);
      wpis = log.recipeId === undefined && recipeId !== undefined ? { ...log, recipeId } : log;
      await writeBakeRow(db, wpis);
      for (const item of changed.values()) await writeFlourRow(db, item);
    })
  );

  // Pamięć dopiero po zatwierdzeniu transakcji
  zakonczSesjeWPamieci(opts);
  memStore.logs = [wpis, ...memStore.logs.filter((l) => l.id !== log.id)];
  changed.forEach(rememberFlour);
  if (log.finishedAt) {
    void collectBackupData()
      .then((data) => autoBackup(data))
      .catch(() => null);
  }
}
