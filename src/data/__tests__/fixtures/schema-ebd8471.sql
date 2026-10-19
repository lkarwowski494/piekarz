-- Schemat bazy z wydanego buildu ebd8471 (v1.0.0-b1013): runner migracji, migracje 1-3, user_version = 3.
-- Źródło: git show ebd8471:src/data/sqlite-schema.ts (migracja 1 bez zmian; migracja 2 to ALTER TABLE z tego pliku; migracja 3 nic nie dodaje, bo app_access.signature jest już w migracji 1).
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL, description TEXT NOT NULL);
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
ALTER TABLE bakes ADD COLUMN crumb_score INTEGER;
ALTER TABLE bakes ADD COLUMN crust_score INTEGER;
ALTER TABLE bakes ADD COLUMN taste_profile TEXT;
ALTER TABLE bakes ADD COLUMN sensory_profile TEXT;
ALTER TABLE starters ADD COLUMN feeding_ratio TEXT DEFAULT '1:1:1';
INSERT INTO schema_migrations (version, applied_at, description) VALUES (1, '2026-10-01T00:00:00.000Z', 'Initial artisan bread schema v1.0'), (2, '2026-10-01T00:00:00.000Z', 'Sensory crumb scores and starter feeding ratio v1.1'), (3, '2026-10-01T00:00:00.000Z', 'Cryptographic tamper seal signature for app_access v2.0');
PRAGMA user_version = 3;
