// ============================================================================
// Piekarz — pola v6 w zapisie i kopii: bakes.recipe_id i stały dzień karmienia zakwasu (D-102, D1-2, D1-5) [M3 D1]
// Kopia zostaje w formacie 2 z polami opcjonalnymi. Import robi DELETE + INSERT, więc pole, którego kopia nie niesie
// (kopia sprzed D1), bierze wartość z telefonu sprzed importu; pole obecne (także null) rozstrzyga.
// ============================================================================

import type * as SQLite from 'expo-sqlite';
import type { StalyDzienKarmienia, StoredBakeLog, StoredStarter } from './db';
import { isNum, isStr } from './row-parsers';

export interface NowePolaTelefonu {
  recipeId: Map<string, string | null>;
  dzien: Map<string, StalyDzienKarmienia | null>;
}

/** Stały dzień z kolumn bazy: oba pola albo brak (null). */
export function dzienZKolumn(weekday: unknown, minute: unknown): StalyDzienKarmienia | null {
  return isNum(weekday) && isNum(minute) ? { weekday, minuteOfDay: minute } : null;
}

/** Odczyt w transakcji importu, przed DELETE. */
export async function czytajNowePola(db: SQLite.SQLiteDatabase): Promise<NowePolaTelefonu> {
  const bakes = await db.getAllAsync<{ id: unknown; recipe_id: unknown }>('SELECT id, recipe_id FROM bakes;');
  const starters = await db.getAllAsync<{ id: unknown; d: unknown; m: unknown }>(
    'SELECT id, fridge_feed_weekday AS d, fridge_feed_minute AS m FROM starters;'
  );
  const recipeId = new Map<string, string | null>();
  for (const b of bakes) if (isStr(b.id)) recipeId.set(b.id, isStr(b.recipe_id) ? b.recipe_id : null);
  const dzien = new Map<string, StalyDzienKarmienia | null>();
  for (const s of starters) if (isStr(s.id)) dzien.set(s.id, dzienZKolumn(s.d, s.m));
  return { recipeId, dzien };
}

/** Wpis z kopii z recipeId do zapisu: z kopii, gdy go niesie, inaczej z telefonu (brak w telefonie = null). */
export function wpisPoImporcie(b: StoredBakeLog, tel: NowePolaTelefonu): StoredBakeLog {
  return b.recipeId !== undefined ? b : { ...b, recipeId: tel.recipeId.get(b.id) ?? null };
}

/** Stały dzień zakwasu po imporcie, tą samą regułą co recipeId. */
export function dzienPoImporcie(s: StoredStarter, tel: NowePolaTelefonu): StalyDzienKarmienia | null {
  return s.fridgeFeedDay !== undefined ? s.fridgeFeedDay : tel.dzien.get(s.id) ?? null;
}

/** Zapis stałego dnia w transakcji wywołującego (STARTER_UPSERT tych kolumn nie dotyka). */
export async function zapiszStalyDzien(db: SQLite.SQLiteDatabase, starterId: string, d: StalyDzienKarmienia | null): Promise<void> {
  await db.runAsync('UPDATE starters SET fridge_feed_weekday = ?, fridge_feed_minute = ? WHERE id = ?;', d?.weekday ?? null, d?.minuteOfDay ?? null, starterId);
}
