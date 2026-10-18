-- ============================================================================
-- Migracja 003: Podpis kryptograficzny app_access (DEC-10, DEC-49, TASK-R03-03)
-- ============================================================================

ALTER TABLE app_access ADD COLUMN signature TEXT;

INSERT OR REPLACE INTO schema_migrations (version, applied_at, description)
VALUES (3, datetime('now'), 'Cryptographic tamper seal signature for app_access');
