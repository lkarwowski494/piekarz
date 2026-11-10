// ============================================================================
// Piekarz — runner migracji schematu SQLite (wydzielony z sqlite-schema.ts bez zmiany zachowania, limit 20 480 B)
// [M1-audytor-generalny-019]. Lista migracji aplikacji: SCHEMA_MIGRATIONS w sqlite-schema.ts.
// ============================================================================

import type * as SQLite from 'expo-sqlite';
import { kopiaPrzedMigracja } from './kopie-przed-migracja';

export interface SchemaMigration {
  version: number;
  description: string;
  /** Po kopii, przed BEGIN; błąd = migracja nie rusza (D1-6). */
  przed?: (db: SQLite.SQLiteDatabase) => Promise<void>;
  run: (db: SQLite.SQLiteDatabase) => Promise<void>;
  /**
   * Przebudowa tabeli z kluczami obcymi (12 kroków, sqlite.org/lang_altertable.html §8): runner wyłącza klucze przed
   * BEGIN (w transakcji pragma nic nie robi, sqlite.org/pragma.html), sprawdza `foreign_key_check` przed COMMIT
   * i włącza klucze po COMMIT albo ROLLBACK. Bez flagi DROP rodzica skasowałby dzieci kaskadą [M1-audytor-generalny-019].
   */
  przebudowa?: boolean;
}

/** Wykonuje oczekujące migracje z listy (aplikacja: migracje w sqlite-schema.ts). */
export async function uruchomMigracje(db: SQLite.SQLiteDatabase, migracje: readonly SchemaMigration[], przygotowanie: string): Promise<void> {
  // Wersja przed czymkolwiek innym: bazy nowszej niż aplikacja nie zmienia nawet PRAGMA journal_mode [M1-audytor-generalny-061]
  const known = Math.max(...migracje.map((m) => m.version));
  const found = (await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;'))?.user_version ?? 0;
  if (found > known) throw new NewerDatabaseError(found, known);

  // Pragmy i tabela schema_migrations z sqlite-schema.ts (jedno źródło schematu, 062)
  await db.execAsync(przygotowanie);

  const currentVersion = found;

  const pendingMigrations = migracje.filter((m) => m.version > currentVersion);
  if (pendingMigrations.length === 0) return;

  // Kopia przed migracją przez VACUUM INTO: spójna także z danymi z pliku -wal; bez kopii nie migrujemy
  // [M1-audytor-generalny-004]. Nieudana migracja wycofuje swoją transakcję — plik bazy nie jest podmieniany.
  const backupPath = await kopiaPrzedMigracja(db, currentVersion);

  for (const m of pendingMigrations) {
    try {
      if (m.przed) await m.przed(db);
      if (m.przebudowa) await db.execAsync('PRAGMA foreign_keys = OFF;');
      await db.execAsync('BEGIN TRANSACTION;');
      await m.run(db);
      if (m.przebudowa) {
        const naruszenia = await db.getAllAsync<unknown>('PRAGMA foreign_key_check;');
        if (naruszenia.length > 0) throw new Error(`foreign_key_check: ${naruszenia.length} naruszeń po przebudowie`);
      }
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
    } finally {
      if (m.przebudowa) await db.execAsync('PRAGMA foreign_keys = ON;');
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

