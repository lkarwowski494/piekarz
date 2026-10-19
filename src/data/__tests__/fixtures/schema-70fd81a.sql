-- Schemat bazy z wydanego buildu 70fd81a (pierwszy workflow TestFlight (2026-10-16)).
-- Źródło: git show 70fd81a:src/data/sqlite-store.ts (DDL inicjalizacji, bez zmian). user_version = 0.
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
  taste_profile TEXT
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
