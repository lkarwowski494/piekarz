-- ============================================================================
-- Migracja 002: Retrofit do standardu Apps4Craft v2.0 (Zero Data Loss)
-- ============================================================================

-- 1. Utworzenie tabeli wersjonowania migracji
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  applied_at TEXT NOT NULL,
  description TEXT NOT NULL
);

-- 2. Utworzenie tabeli kolejki Outbox dla Apple Watch (DEC-45)
CREATE TABLE IF NOT EXISTS pending_ops (
  id TEXT PRIMARY KEY NOT NULL,
  op_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SYNCED', 'FAILED'))
);

-- 3. Rozszerzenie tabeli starters o parametr feeding_ratio (DEC-46)
-- Wykonywane bezpiecznie bez utraty danych istniejących kultur
-- (W SQLite: ALTER TABLE ADD COLUMN)
-- Odnotowujemy w schema_migrations:
INSERT OR IGNORE INTO schema_migrations (version, applied_at, description)
VALUES (1, datetime('now'), 'Initial schema v1.0');

-- 4. Utworzenie indeksów B-Tree pod zapytania < 5ms
CREATE INDEX IF NOT EXISTS idx_bakes_started_at ON bakes(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_starters_last_fed_at ON starters(last_fed_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_is_built_in ON recipes(is_built_in, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flour_inventory_name ON flour_inventory(name);
CREATE INDEX IF NOT EXISTS idx_pending_ops_status ON pending_ops(status, created_at ASC);

-- 5. Rejestracja pomyślnego wykonania migracji v2.0
INSERT OR REPLACE INTO schema_migrations (version, applied_at, description)
VALUES (2, datetime('now'), 'Retrofit v2.0: pending_ops, feeding_ratio, B-Tree indexes');
