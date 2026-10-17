-- ============================================================================
-- Apps4Craft Studio — Piekarz (Crust)
-- Canonical SQLite Relational Schema DDL v2.0 (Target Blueprint)
-- 100% Offline-First, Zero Telemetry, ACID Compliant
-- ============================================================================

-- Pragmaty wykonawcze (Ochrona przed błędem iOS 0xDEAD10CC i blokadą wątków)
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
PRAGMA temp_store = MEMORY;
PRAGMA cache_size = -64000; -- 64MB cache w pamięci RAM

-- ----------------------------------------------------------------------------
-- 1. Tabela Wersjonowania Migracji (Standard T-012)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  applied_at TEXT NOT NULL,
  description TEXT NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. Dziennik Wypieków i Notatki Sensoryczne (Bakes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bakes (
  id TEXT PRIMARY KEY NOT NULL,
  recipe_name TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  ambient_temp REAL,
  actual_ddt REAL,
  rating_stars INTEGER CHECK (rating_stars IS NULL OR (rating_stars >= 1 AND rating_stars <= 5)),
  notes TEXT,
  crumb_score INTEGER CHECK (crumb_score IS NULL OR (crumb_score >= 1 AND crumb_score <= 5)),
  crust_score INTEGER CHECK (crust_score IS NULL OR (crust_score >= 1 AND crust_score <= 5)),
  taste_profile TEXT,
  sensory_profile TEXT, -- JSON z wartościami 6-osiowego radaru sensorycznego
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- ----------------------------------------------------------------------------
-- 3. Kultury Zakwasu Piekarskiego (Starters)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS starters (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  flour_type TEXT NOT NULL,
  hydration REAL NOT NULL DEFAULT 100.0 CHECK (hydration >= 30.0 AND hydration <= 300.0),
  birth_date INTEGER NOT NULL,
  storage_state TEXT NOT NULL DEFAULT 'ROOM_TEMP' CHECK (storage_state IN ('ROOM_TEMP', 'FRIDGE', 'FREEZER', 'DRIED')),
  last_fed_at INTEGER,
  feeding_ratio TEXT NOT NULL DEFAULT '1:1:1', -- DEC-46 (1:1:1, 1:2:2, 1:5:5)
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- ----------------------------------------------------------------------------
-- 4. Receptury Piekarskie (Recipes - Wbudowane Master i Własne)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  formula_json TEXT NOT NULL, -- Pełna specyfikacja DoughRecipeInput w JSON
  target_ddt REAL NOT NULL DEFAULT 25.0 CHECK (target_ddt >= 15.0 AND target_ddt <= 35.0),
  notes TEXT,
  is_built_in INTEGER NOT NULL DEFAULT 0 CHECK (is_built_in IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- ----------------------------------------------------------------------------
-- 5. Magazyn Spiżarni Mąk (Flour Inventory)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flour_inventory (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  stock_grams REAL NOT NULL DEFAULT 0.0 CHECK (stock_grams >= 0.0),
  brand TEXT,
  protein_pct REAL CHECK (protein_pct IS NULL OR (protein_pct >= 5.0 AND protein_pct <= 25.0)),
  updated_at INTEGER NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. Ścieżka Edukacyjna / Lekcje (Lesson Progress)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_progress (
  level_id INTEGER PRIMARY KEY NOT NULL,
  completed_at INTEGER NOT NULL
);

-- ----------------------------------------------------------------------------
-- 7. Uprawnienia i Stan Monetyzacji (App Access - "Cheaper than Espresso")
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_access (
  id TEXT PRIMARY KEY NOT NULL,
  trial_started_at INTEGER NOT NULL,
  trial_days INTEGER NOT NULL DEFAULT 7,
  subscription_tier TEXT NOT NULL DEFAULT 'none' CHECK (subscription_tier IN ('none', 'monthly', 'yearly', 'lifetime')),
  subscription_expires_at INTEGER,
  completed_bakes_count INTEGER NOT NULL DEFAULT 0 CHECK (completed_bakes_count >= 0)
);

-- ----------------------------------------------------------------------------
-- 8. Ustawienia Aplikacji i Stan Aktywnej Sesji (App Settings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

-- ----------------------------------------------------------------------------
-- 9. Kolejka Zdarzeń Asynchronicznych Outbox (DEC-45 - Apple Watch & Offline)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pending_ops (
  id TEXT PRIMARY KEY NOT NULL,
  op_type TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON ze zdarzeniem
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SYNCED', 'FAILED'))
);

-- ============================================================================
-- INDEKSY B-TREE POD ZAPYTANIA O ZŁOŻONOŚCI O(log N) I CZASIE < 5ms
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_bakes_started_at ON bakes(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_starters_last_fed_at ON starters(last_fed_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_is_built_in ON recipes(is_built_in, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flour_inventory_name ON flour_inventory(name);
CREATE INDEX IF NOT EXISTS idx_pending_ops_status ON pending_ops(status, created_at ASC);

-- ============================================================================
-- WYZWALACZE (TRIGGERS) DLA AUTOMATYCZNEJ AKTUALIZACJI updated_at
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS trg_bakes_updated_at
AFTER UPDATE ON bakes
FOR EACH ROW
BEGIN
  UPDATE bakes SET updated_at = (strftime('%s', 'now') * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_starters_updated_at
AFTER UPDATE ON starters
FOR EACH ROW
BEGIN
  UPDATE starters SET updated_at = (strftime('%s', 'now') * 1000) WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_recipes_updated_at
AFTER UPDATE ON recipes
FOR EACH ROW
BEGIN
  UPDATE recipes SET updated_at = (strftime('%s', 'now') * 1000) WHERE id = OLD.id;
END;
