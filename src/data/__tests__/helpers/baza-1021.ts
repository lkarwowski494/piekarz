/**
 * Kopia bazy buildu 1021 (v1.0.0-b1021 = 39f3890; schemat v6, ten sam kod src/data od 1017 = 49ab67a, `git diff
 * v1.0.0-b1017 v1.0.0-b1021 -- src/data src/lib/backup.ts` pusty) do testów partii danych p9 (D-221; zasada wspólna 10:
 * test na kopii bazy poprzedniej wersji) [M3 p9a].
 *
 * Fixture zamiast generatora z bieżącego kodu: tests/fixtures/baza-1021-39f3890.sql to zrzut bazy zapisanej kodem
 * zapisu buildu 1021 (migracja v6 z kopii 1014, potem utworzWypiek, savePlannedBake, saveBakeLog z recipeId,
 * saveStarter ze stałym dniem), zrobiony 2026-11-04 na d24ea87 (src/data bez zmian od 1021). Migracja p9b zmieni
 * kod, a kopia, na której się ją sprawdza, zostaje taka jak u właściciela.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { openRaw, tableCounts } from './node-sqlite-adapter';

const FIXTURES = path.join(__dirname, '..', '..', '..', '..', 'tests', 'fixtures');

/** Plik zrzutu w tests/fixtures. */
export const PLIK_1021 = 'baza-1021-39f3890.sql';

/** Wersja schematu bazy buildów 1017–1021 (i 1022 z d24ea87). */
export const WERSJA_SCHEMATU_1021 = 6;

type Raw = ReturnType<typeof openRaw>;

/** Wartość SQL jako literał zrzutu (jak sqlite3 .dump: tekst w apostrofach, NULL, liczby). */
function literal(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
  throw new Error(`Zrzut bazy: nieobsługiwany typ wartości ${typeof v}`);
}

/** Zrzut schematu i danych bazy jako SQL (tabele, potem indeksy), z user_version; bez tabel sqlite_*. */
export function zrzutBazy(raw: Raw, naglowek: string): string {
  const out: string[] = [naglowek.trim(), 'PRAGMA journal_mode = WAL;', 'BEGIN;'];
  const tabele = raw.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid").all() as Array<{ name: string; sql: string }>;
  for (const t of tabele) {
    out.push(`${t.sql};`);
    const kolumny = (raw.prepare(`PRAGMA table_info("${t.name}")`).all() as Array<{ name: string }>).map((c) => c.name);
    for (const w of raw.prepare(`SELECT * FROM "${t.name}" ORDER BY rowid`).all() as Array<Record<string, unknown>>) {
      out.push(`INSERT INTO "${t.name}" (${kolumny.join(', ')}) VALUES (${kolumny.map((k) => literal(w[k])).join(', ')});`);
    }
  }
  const indeksy = raw.prepare("SELECT sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL ORDER BY rowid").all() as Array<{ sql: string }>;
  for (const i of indeksy) out.push(`${i.sql};`);
  const { user_version: v } = raw.prepare('PRAGMA user_version').get() as { user_version: number };
  out.push(`PRAGMA user_version = ${Number(v)};`, 'COMMIT;', '');
  return out.join('\n');
}

/** Zrzut bazy buildu 1021 (SQL). */
export function zrzutBazy1021(): string {
  return fs.readFileSync(path.join(FIXTURES, PLIK_1021), 'utf8');
}

/** Ścieżka zrzutu (generator). */
export function sciezkaZrzutu1021(): string {
  return path.join(FIXTURES, PLIK_1021);
}

/** Zakłada w `plik` bazę buildu 1021 (tryb WAL jak w aplikacji) i zwraca liczności tabel. */
export function zalozBaze1021(plik: string): Record<string, number> {
  const raw = openRaw(plik);
  raw.exec(zrzutBazy1021());
  const liczby = tableCounts(raw);
  raw.close();
  return liczby;
}
