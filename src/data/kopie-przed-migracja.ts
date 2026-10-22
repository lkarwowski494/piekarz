// ============================================================================
// Piekarz — kopia bazy przed migracją (VACUUM INTO obok pliku bazy) i sprzątanie starszych kopii tej wersji
// [M1-audytor-generalny-004; M3 D1b, przegląd danych D1 P2-2]
// Każda próba migracji robi nową, spójną kopię (bez kopii nie migrujemy). Ponawiana nieudana migracja (D1-6) nie może
// jednak zapełnić dysku pełnymi kopiami bazy: zostają 2 najnowsze kopie danej wersji. Dlaczego 2, a nie pula 10
// jak przy kopiach JSON (CLAUDE.md §1.3): to pełne pliki bazy, a między nieudanymi próbami dane się nie zmieniają
// (ekran błędu nie pozwala zapisywać), więc najnowsza kopia jest pełna; druga chroni przed kopią z uszkodzonego
// zapisu. Kopie innych wersji (np. v2 sprzed starszej migracji) zostają nietknięte.
// ============================================================================

import * as FileSystem from 'expo-file-system/legacy';
import type * as SQLite from 'expo-sqlite';
import { PRE_MIGRATION_BACKUP_NAME } from '../lib/backup';

/** Ile kopii przed migracją z tej samej wersji zostaje po sprzątaniu (z nową włącznie). */
export const KOPIE_PRZED_MIGRACJA_NA_WERSJE = 2;

/** Ścieżka kopii obok pliku bazy: backup_pre_migration-v<wersja>-<czas>.db. */
export function preMigrationBackupPath(databasePath: string, fromVersion: number, now: number = Date.now()): string {
  const cut = Math.max(databasePath.lastIndexOf('/'), databasePath.lastIndexOf('\\'));
  return `${databasePath.slice(0, cut + 1)}${PRE_MIGRATION_BACKUP_NAME}-v${fromVersion}-${now}.db`;
}

const uri = (p: string) => (p.startsWith('file://') ? p : `file://${p}`);

/** Kasuje starsze kopie wersji `fromVersion` obok `nowa` ponad limit; zwraca nazwy usuniętych. Nowa zostaje zawsze. */
export async function sprzatnijKopiePrzedMigracja(nowa: string, fromVersion: number): Promise<string[]> {
  const cut = Math.max(nowa.lastIndexOf('/'), nowa.lastIndexOf('\\'));
  const dir = nowa.slice(0, cut + 1);
  const nazwa = nowa.slice(cut + 1);
  const re = new RegExp(`^${PRE_MIGRATION_BACKUP_NAME}-v${fromVersion}-(\\d+)\\.db$`);
  const stare = (await FileSystem.readDirectoryAsync(uri(dir)))
    .filter((n) => n !== nazwa)
    .map((n) => ({ n, m: re.exec(n) }))
    .flatMap(({ n, m }) => (m ? [{ n, czas: Number(m[1]) }] : []))
    .sort((a, b) => b.czas - a.czas)
    .slice(KOPIE_PRZED_MIGRACJA_NA_WERSJE - 1);
  for (const { n } of stare) await FileSystem.deleteAsync(uri(`${dir}${n}`), { idempotent: true });
  return stare.map((s) => s.n);
}

/** Kopia przed migracją; błąd kopii przerywa migrację, błąd sprzątania nie (kopia już jest). */
export async function kopiaPrzedMigracja(db: SQLite.SQLiteDatabase, fromVersion: number): Promise<string> {
  const path = preMigrationBackupPath(db.databasePath, fromVersion);
  await db.runAsync('VACUUM INTO ?;', path);
  await sprzatnijKopiePrzedMigracja(path, fromVersion).catch(() => undefined);
  return path;
}
