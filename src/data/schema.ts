// ============================================================================
// Piekarz (Crust) — Local SQLite Database Schema (BR-DANE-001…003)
// Transactional, offline-first, WAL mode, ACID compliance.
// Apps4Brew Studio.
// ============================================================================

export const SQLITE_INIT_QUERIES = [
  `PRAGMA journal_mode = WAL;`,
  `PRAGMA foreign_keys = ON;`,

  `CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    target_dough_weight REAL NOT NULL,
    water_pct REAL NOT NULL,
    salt_pct REAL NOT NULL,
    starter_pct REAL NOT NULL,
    starter_hydration REAL NOT NULL DEFAULT 100.0,
    yeast_pct REAL NOT NULL DEFAULT 0.0,
    target_ddt REAL NOT NULL DEFAULT 25.0,
    notes TEXT,
    is_built_in INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS recipe_flours (
    id TEXT PRIMARY KEY NOT NULL,
    recipe_id TEXT NOT NULL,
    flour_name TEXT NOT NULL,
    percentage REAL NOT NULL,
    flour_type TEXT,
    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS starter_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    flour_type TEXT NOT NULL,
    hydration REAL NOT NULL DEFAULT 100.0,
    birth_date INTEGER NOT NULL,
    storage_state TEXT NOT NULL DEFAULT 'ROOM_TEMP',
    last_fed_at INTEGER
  );`,

  `CREATE TABLE IF NOT EXISTS starter_feedings (
    id TEXT PRIMARY KEY NOT NULL,
    starter_id TEXT NOT NULL,
    feed_date INTEGER NOT NULL,
    starter_grams REAL NOT NULL,
    flour_grams REAL NOT NULL,
    water_grams REAL NOT NULL,
    peak_hours REAL,
    notes TEXT,
    FOREIGN KEY(starter_id) REFERENCES starter_profiles(id) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS bake_logs (
    id TEXT PRIMARY KEY NOT NULL,
    recipe_name TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    finished_at INTEGER,
    ambient_temp REAL,
    actual_ddt REAL,
    rating_stars INTEGER,
    notes TEXT,
    image_paths TEXT
  );`
];
