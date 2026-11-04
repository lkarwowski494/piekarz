// ============================================================================
// Piekarz — wiersz Dziennika (tabela bakes): odczyt wszystkich wpisów i jeden zapis wiersza dla zapisu i importu
// (wydzielone z sqlite-store.ts bez zmiany zachowania, limit 20 KB) [M3 p9b]
// ============================================================================

import type * as SQLite from 'expo-sqlite';
import type { Leaven, StoredBakeLog } from './db';
import { zachowajUszkodzony } from './uszkodzone-wiersze';
import { isLeaven } from './row-parsers';

/** Wszystkie wpisy od najnowszego; uszkodzony profil smaku = brak profilu, surowa treść do pliku ratunkowego. */
export async function czytajWpisy(db: SQLite.SQLiteDatabase): Promise<StoredBakeLog[]> {
  const rows = await db.getAllAsync<{
    id: string;
    recipeName: string;
    startedAt: number;
    finishedAt: number | null;
    ambientTemp: number | null;
    actualDDT: number | null;
    ratingStars: number | null;
    notes: string | null;
    crumbScore: number | null;
    crustScore: number | null;
    tasteProfile: string | null;
    sensoryProfileRaw: string | null;
    recipeId: string | null;
    leaven: unknown;
  }>(
    'SELECT id, recipe_name as recipeName, started_at as startedAt, finished_at as finishedAt, ambient_temp as ambientTemp, actual_ddt as actualDDT, rating_stars as ratingStars, notes, crumb_score as crumbScore, crust_score as crustScore, taste_profile as tasteProfile, sensory_profile as sensoryProfileRaw, recipe_id as recipeId, leaven FROM bakes ORDER BY started_at DESC;'
  );
  return rows.map((r) => {
    let sensoryProfile: StoredBakeLog['sensoryProfile'] = undefined;
    if (r.sensoryProfileRaw) {
      try {
        sensoryProfile = JSON.parse(r.sensoryProfileRaw);
      } catch {
        // Uszkodzony JSON profilu: brak zostaje brakiem (undefined), bez zgadywania wartości;
        // surowa treść do pliku ratunkowego i kopii [M1-audytor-generalny-121]
        zachowajUszkodzony({ tabela: 'bakes', id: r.id, surowe: r.sensoryProfileRaw });
      }
    }
    return {
      id: r.id,
      recipeName: r.recipeName,
      startedAt: r.startedAt,
      finishedAt: r.finishedAt ?? undefined,
      ambientTemp: r.ambientTemp ?? undefined,
      actualDDT: r.actualDDT ?? undefined,
      ratingStars: r.ratingStars ?? undefined,
      notes: r.notes ?? undefined,
      crumbScore: r.crumbScore ?? undefined,
      crustScore: r.crustScore ?? undefined,
      tasteProfile: (r.tasteProfile as StoredBakeLog['tasteProfile']) ?? undefined,
      sensoryProfile,
      ...(r.recipeId === null ? {} : { recipeId: r.recipeId }),
      ...(isLeaven(r.leaven) ? { leaven: r.leaven } : {}),
    };
  });
}

/**
 * Jeden zapis wiersza wypieku dla zapisu i przywracania kopii — wszystkie kolumny [M1-audytor-generalny-002].
 * UPSERT, nie INSERT OR REPLACE (zasada wspólna 10): REPLACE usuwał wiersz, więc ocena po wypieku zerowała
 * recipe_id. Wpis bez recipeId zostawia recipe_id w bazie [M3 D1], bez leaven — leaven (v7) [M3 p9b].
 */
export async function writeBakeRow(db: SQLite.SQLiteDatabase, log: StoredBakeLog): Promise<void> {
  await db.runAsync(
    `INSERT INTO bakes (id, recipe_name, started_at, finished_at, ambient_temp, actual_ddt, rating_stars, notes, crumb_score, crust_score, taste_profile, sensory_profile, recipe_id, leaven)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET recipe_name = excluded.recipe_name, started_at = excluded.started_at, finished_at = excluded.finished_at,
       ambient_temp = excluded.ambient_temp, actual_ddt = excluded.actual_ddt, rating_stars = excluded.rating_stars, notes = excluded.notes,
       crumb_score = excluded.crumb_score, crust_score = excluded.crust_score, taste_profile = excluded.taste_profile,
       sensory_profile = excluded.sensory_profile, recipe_id = COALESCE(excluded.recipe_id, bakes.recipe_id),
       leaven = COALESCE(excluded.leaven, bakes.leaven);`,
    log.id,
    log.recipeName,
    log.startedAt,
    log.finishedAt ?? null,
    log.ambientTemp ?? null,
    log.actualDDT ?? null,
    log.ratingStars ?? null,
    log.notes ?? null,
    log.crumbScore ?? null,
    log.crustScore ?? null,
    log.tasteProfile ?? null,
    log.sensoryProfile ? JSON.stringify(log.sensoryProfile) : null,
    log.recipeId ?? null,
    log.leaven ?? null
  );
}


/**
 * Wpis końca wypieku z danymi sesji: receptura (D1) i wersja (D-242 Z3) z sesji, gdy wpis ich nie niesie. Sesja bez
 * wersji (sprzed p9) daje wpis bez wersji: brak zostaje brakiem [M3 p9b].
 */
export function wpisZSesji(log: StoredBakeLog, s: { recipeId?: string; wersja?: 'zakwas' | 'drozdze' }): StoredBakeLog {
  const recipe = log.recipeId === undefined && s.recipeId !== undefined ? { recipeId: s.recipeId } : {};
  const leaven: { leaven?: Leaven } = log.leaven === undefined && s.wersja !== undefined ? { leaven: s.wersja === 'drozdze' ? 'yeast' : 'sourdough' } : {};
  return { ...log, ...recipe, ...leaven };
}
