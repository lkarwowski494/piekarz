import * as SQLite from 'expo-sqlite';
import { dbDirectory } from '../lib/db-path';
import { PRE_MIGRATION_BACKUP_NAME } from '../lib/backup';
import { ratujPlikiBazy } from '../lib/kopia-plikow-bazy';
import {
  StoredRecipe,
  StoredStarter,
  StoredBakeLog,
  StoredFlourInventoryItem,
  StoredStarterEntry,
} from './db';
import { MASTER_RECIPES } from '../recipes/presets';
import { DoughRecipeResult, DoughRecipeInput } from '../core/domain-rules';
import type { SessionStep } from '../core/bake-steps';
import { markStorageUnavailable, markStorageNewer, markStorageReady } from './storage-status';

export const DB_NAME = 'piekarz.db';

export interface ActiveBakeState {
  id: string;
  recipeName: string;
  startedAt: number;
  currentStageId: string;
  /** Temperatura otoczenia podana przez użytkownika; brak = nie podano [M1-audytor-generalny-017]. */
  ambientTempC?: number;
  /** Zmierzone DDT ciasta; brak = nie zmierzono (nie DDT docelowe) [M1-audytor-generalny-017]. */
  actualDdtC?: number;
  calculatedRecipe?: DoughRecipeResult;
  recipeFormula?: DoughRecipeInput;
  /** Wypiek żytni (Harmonogram: false dla domyślnego pszennego) [M1-audytor-generalny-030]. */
  isHighRye?: boolean;
  /** Migawka etapów planu z Harmonogramu; brak = plan liczony od startu wypieku [M1-audytor-generalny-030]. */
  steps?: SessionStep[];
  /** Zakwas wybrany do wypieku (plan z lodówki, D-052); brak = nie wybrano [M1-audytor-generalny-104]. */
  starterId?: string;
  /**
   * Wypiek zaczęty z dostępem (próba, subskrypcja, dożywotni): prowadzi się do końca także po wygaśnięciu (D-039 pkt 3).
   * Brak = zapis sprzed tej wersji, traktowany jak zaczęty z dostępem (wybór P-125 a) [M1-audytor-generalny-125].
   */
  zaczetyZDostepem?: boolean;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbOpening: Promise<SQLite.SQLiteDatabase | null> | null = null;

// In-memory fallback for test and non-native environments
export const memStore = {
  starters: [] as StoredStarter[],
  starterEntries: [] as StoredStarterEntry[],
  recipes: [] as StoredRecipe[],
  logs: [] as StoredBakeLog[],
  flourInventory: [] as StoredFlourInventoryItem[],
  completedLessons: [] as number[],
  activeBake: null as ActiveBakeState | null,
  pendingOps: [] as Array<{
    id: string;
    opType: 'DOUBLE_TAP_FOLD' | 'BAKE_LOG_UPDATE' | 'FEEDING_LOGGED' | 'INVENTORY_DEDUCTED';
    payload: string;
    createdAt: number;
    status: 'PENDING' | 'PROCESSING' | 'SYNCED' | 'FAILED';
  }>,
  settings: {} as Record<string, string>,
};

export function _resetMemStore(): void {
  memStore.starters = [];
  memStore.starterEntries = [];
  memStore.recipes = [];
  memStore.logs = [];
  memStore.flourInventory = [];
  memStore.completedLessons = [];
  memStore.activeBake = null;
  memStore.pendingOps = [];
  memStore.settings = {};
}

/**
 * Jedno połączenie na proces: równoległe wywołania czekają na to samo otwarcie, a klucze obce (starter_entries,
 * ADR-008) włączamy zaraz po otwarciu, poza transakcją (05-architekt-fix-p5-001) [M1-audytor-generalny-104].
 */
export function getDb(): Promise<SQLite.SQLiteDatabase | null> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (!dbOpening) {
    dbOpening = openDb().then((db) => {
      dbOpening = null;
      return db;
    });
  }
  return dbOpening;
}

async function openDb(): Promise<SQLite.SQLiteDatabase | null> {
  try {
    const defaultDir = SQLite.defaultDatabaseDirectory;
    const safeDir = dbDirectory(defaultDir);
    const db = safeDir
      ? await SQLite.openDatabaseAsync(DB_NAME, undefined, safeDir)
      : await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync('PRAGMA foreign_keys = ON;');
    dbInstance = db;
    return dbInstance;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Brak bazy nie jest cichym trybem pamięci: StorageGate pokazuje ekran błędu [M1-audytor-generalny-003]
    markStorageUnavailable(msg);
    // Surowa kopia plików bazy i plik ratunkowy z ich listą [M1-audytor-generalny-024]; pakiet do udostępnienia [M1-audytor-generalny-122]
    void ratunekPoBledzie(msg);
    return null; // Pamięć tylko dla testów bez natywnego SQLite
  }
}

/** Adres pliku bazy bez otwierania jej (tryb awaryjny, kopie ratunkowe). */
export function dbFileUri(): string | null {
  const dir = dbDirectory(SQLite.defaultDatabaseDirectory) ?? SQLite.defaultDatabaseDirectory;
  if (typeof dir !== 'string') return null;
  const path = `${dir.replace(/\/+$/, '')}/${DB_NAME}`;
  return path.startsWith('file://') ? path : `file://${path}`;
}

/**
 * Kopie surowych plików i plik ratunkowy, potem pakiet do udostępnienia z ekranu błędu [M1-audytor-generalny-122].
 * Także po błędzie odczytu uszkodzonej tabeli z otwartej bazy (odczyt.ts) [M1-audytor-generalny-187].
 */
export async function ratunekPoBledzie(msg: string): Promise<void> {
  const uri = dbFileUri();
  if (!uri) return;
  const pakiet = await ratujPlikiBazy(uri, msg);
  if (pakiet) markStorageUnavailable(msg, pakiet, 'pliki-bazy');
}

export interface SchemaMigration {
  version: number;
  description: string;
  run: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

export const SCHEMA_MIGRATIONS: SchemaMigration[] = [
  {
    version: 1,
    description: 'Initial artisan bread schema v1.0',
    run: async (db) => {
      await db.execAsync(`
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
          trial_days INTEGER NOT NULL DEFAULT 14,
          subscription_tier TEXT NOT NULL DEFAULT 'none',
          subscription_expires_at INTEGER,
          completed_bakes_count INTEGER NOT NULL DEFAULT 0,
          signature TEXT
        );

        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pending_ops (
          id TEXT PRIMARY KEY NOT NULL,
          op_type TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING'
        );

        CREATE INDEX IF NOT EXISTS idx_bakes_started_at ON bakes(started_at DESC);
        CREATE INDEX IF NOT EXISTS idx_starters_last_fed_at ON starters(last_fed_at DESC);
        CREATE INDEX IF NOT EXISTS idx_recipes_is_built_in ON recipes(is_built_in, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_flour_inventory_name ON flour_inventory(name);
        CREATE INDEX IF NOT EXISTS idx_pending_ops_status ON pending_ops(status, created_at ASC);
      `);
    },
  },
  {
    version: 2,
    description: 'Sensory crumb scores and starter feeding ratio v1.1',
    run: async (db) => {
      const bakesCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(bakes);');
      const startersCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(starters);');

      if (!bakesCols.some((c) => c.name === 'crumb_score')) {
        await db.execAsync('ALTER TABLE bakes ADD COLUMN crumb_score INTEGER;');
      }
      if (!bakesCols.some((c) => c.name === 'crust_score')) {
        await db.execAsync('ALTER TABLE bakes ADD COLUMN crust_score INTEGER;');
      }
      if (!bakesCols.some((c) => c.name === 'taste_profile')) {
        await db.execAsync('ALTER TABLE bakes ADD COLUMN taste_profile TEXT;');
      }
      if (!bakesCols.some((c) => c.name === 'sensory_profile')) {
        await db.execAsync('ALTER TABLE bakes ADD COLUMN sensory_profile TEXT;');
      }
      if (!startersCols.some((c) => c.name === 'feeding_ratio')) {
        await db.execAsync("ALTER TABLE starters ADD COLUMN feeding_ratio TEXT DEFAULT '1:1:1';");
      }
    },
  },
  {
    version: 3,
    description: 'Cryptographic tamper seal signature for app_access v2.0',
    run: async (db) => {
      const accessCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(app_access);');
      if (!accessCols.some((c) => c.name === 'signature')) {
        await db.execAsync('ALTER TABLE app_access ADD COLUMN signature TEXT;');
      }
    },
  },
  {
    // Proporcja ostatniego dokarmiania; pusta = nieznana (predyktor: 1:2:2). Stara feeding_ratio ma u każdego
    // domyślne '1:1:1', którego aplikacja nigdy nie zapisała, więc zostaje nieczytana [M1-audytor-generalny-023].
    version: 4,
    description: 'Last feeding ratio of a starter',
    run: async (db) => {
      const startersCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(starters);');
      if (!startersCols.some((c) => c.name === 'last_feed_ratio')) {
        await db.execAsync('ALTER TABLE starters ADD COLUMN last_feed_ratio TEXT;');
      }
    },
  },
  {
    // Dziennik wpisów zakwasu (ADR-008): pierwszy klucz obcy; same CREATE i ADD COLUMN, bez przebudowy tabel.
    // Każde istniejące last_fed_at przechodzi jako wpis feeding (id 'v5-<zakwas>') [M1-audytor-generalny-104].
    version: 5,
    description: 'Starter entry log (ADR-008)',
    run: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS starter_entries (
          id TEXT PRIMARY KEY NOT NULL,
          starter_id TEXT NOT NULL REFERENCES starters(id) ON DELETE CASCADE,
          kind TEXT NOT NULL CHECK (kind IN ('feeding', 'observation')),
          occurred_at INTEGER NOT NULL CHECK (occurred_at > 0),
          feed_ratio TEXT,
          flour_grams REAL CHECK (flour_grams IS NULL OR flour_grams > 0),
          water_grams REAL CHECK (water_grams IS NULL OR water_grams > 0),
          signs TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(signs) AND json_type(signs) = 'array'),
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          CHECK (kind = 'feeding' OR (feed_ratio IS NULL AND flour_grams IS NULL AND water_grams IS NULL))
        );
        CREATE INDEX IF NOT EXISTS idx_starter_entries_starter_kind_at ON starter_entries(starter_id, kind, occurred_at DESC);
      `);
      const startersCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(starters);');
      if (!startersCols.some((c) => c.name === 'setup_started_at')) {
        await db.execAsync('ALTER TABLE starters ADD COLUMN setup_started_at INTEGER;');
      }
      if (!startersCols.some((c) => c.name === 'setup_completed_at')) {
        await db.execAsync('ALTER TABLE starters ADD COLUMN setup_completed_at INTEGER;');
      }
      await db.runAsync(`INSERT INTO starter_entries (id, starter_id, kind, occurred_at, feed_ratio, created_at, updated_at)
        SELECT 'v5-' || id, id, 'feeding', last_fed_at, last_feed_ratio, last_fed_at, last_fed_at
        FROM starters WHERE last_fed_at IS NOT NULL AND last_fed_at > 0
        ON CONFLICT (id) DO NOTHING;`);
    },
  },
];

export async function applySchemaMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Wersja przed czymkolwiek innym: bazy nowszej niż aplikacja nie zmienia nawet PRAGMA journal_mode [M1-audytor-generalny-061]
  const known = Math.max(...SCHEMA_MIGRATIONS.map((m) => m.version));
  const found = (await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;'))?.user_version ?? 0;
  if (found > known) throw new NewerDatabaseError(found, known);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);

  const currentVersion = found;

  const pendingMigrations = SCHEMA_MIGRATIONS.filter((m) => m.version > currentVersion);
  if (pendingMigrations.length === 0) return;

  // Kopia przed migracją przez VACUUM INTO: spójna także z danymi z pliku -wal; bez kopii nie migrujemy
  // [M1-audytor-generalny-004]. Nieudana migracja wycofuje swoją transakcję — plik bazy nie jest podmieniany.
  const backupPath = preMigrationBackupPath(db.databasePath, currentVersion);
  await db.runAsync('VACUUM INTO ?;', backupPath);

  for (const m of pendingMigrations) {
    try {
      await db.execAsync('BEGIN TRANSACTION;');
      await m.run(db);
      await db.runAsync(
        'INSERT INTO schema_migrations (version, applied_at, description) VALUES (?, ?, ?);',
        m.version,
        new Date().toISOString(),
        m.description
      );
      await db.execAsync(`PRAGMA user_version = ${m.version};`);
      await db.execAsync('COMMIT;');
    } catch (err: unknown) {
      await db.execAsync('ROLLBACK;').catch(() => {});
      throw new MigrationError(err, backupPath);
    }
  }
}

/** Baza zapisana przez nowszą wersję aplikacji (user_version > najwyższa znana migracja). */
export class NewerDatabaseError extends Error {
  constructor(readonly dbVersion: number, readonly appVersion: number) {
    super(`Database version ${dbVersion} is newer than the app (${appVersion})`);
    this.name = 'NewerDatabaseError';
  }
}

export class MigrationError extends Error {
  constructor(cause: unknown, readonly backupPath: string) {
    super(cause instanceof Error ? cause.message : String(cause));
    this.name = 'MigrationError';
  }
}

/** Ścieżka kopii obok pliku bazy: backup_pre_migration-v<wersja>-<czas>.db. */
export function preMigrationBackupPath(databasePath: string, fromVersion: number, now: number = Date.now()): string {
  const cut = Math.max(databasePath.lastIndexOf('/'), databasePath.lastIndexOf('\\'));
  return `${databasePath.slice(0, cut + 1)}${PRE_MIGRATION_BACKUP_NAME}-v${fromVersion}-${now}.db`;
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

  // Zakwas i mąki pokazowe tylko bez bazy (testy w pamięci); z bazą pusta tabela to pusta lista [M1-audytor-generalny-003]
  if (!db && memStore.starters.length === 0) {
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

  if (!db && memStore.flourInventory.length === 0) {
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
    await applySchemaMigrations(db);
  } catch (err: unknown) {
    if (err instanceof NewerDatabaseError) {
      // Tylko odczyt: SQLite odrzuca zapisy na tym połączeniu, warstwa magazynu rzuca StorageReadOnlyError
      await db.execAsync('PRAGMA query_only = ON;');
      markStorageNewer(err.dbVersion, err.appVersion);
      return;
    }
    // Błąd migracji albo kopii nie jest przemilczany: ekran błędu z kopią do udostępnienia [M1-audytor-generalny-004]
    const msg = err instanceof Error ? err.message : String(err);
    if (err instanceof MigrationError) {
      markStorageUnavailable(msg, err.backupPath);
      return;
    }
    // Inny błąd (np. uszkodzony nagłówek: pierwszy odczyt pliku): surowe kopie przed zamknięciem połączenia,
    // potem zamknięcie, plik ratunkowy i pakiet do udostępnienia [M1-audytor-generalny-122; 12-niezawodnosc-503]
    markStorageUnavailable(msg);
    await ratunekPoBledzie(msg);
    await db.closeAsync().catch(() => undefined);
    if (dbInstance === db) dbInstance = null;
    return;
  }

  try {
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
      } catch {
        // Wbudowana receptura jest też w kodzie (MASTER_RECIPES): nieudany wpis do bazy nie usuwa jej z listy
      }
    }
  } catch {
    // Memory fallback handles errors in non-native contexts
  }
  markStorageReady();
}
