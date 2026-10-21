// ============================================================================
// Piekarz — ustawienia i postęp lekcji w kopii zapasowej [M1-audytor-generalny-139; 05-architekt-504, 05-architekt-602]
// BR-DANE-003 „Pełny eksport”: ustawienia z listy dozwolonych kluczy i lekcje Szkoły chleba jako pola opcjonalne
// formatu v2. Sesja wypieku, pamięć zakupu i daty próśb o ocenę zostają w telefonie (to stan tego urządzenia
// i sklepu, nie dane do przeniesienia). Kopia bez tych pól nie zmienia ustawień ani lekcji w telefonie.
// ============================================================================

import type * as SQLite from 'expo-sqlite';

/**
 * Klucze app_settings przenoszone kopią: język, jednostki, godziny snu, naczynie, profil, wprowadzenie i przełącznik
 * przypomnień o karmieniu (D-068) [audyt-niezalezny B-6]. Kopia bez klucza nie zmienia wartości w telefonie.
 */
export const KLUCZE_USTAWIEN_KOPII = [
  'language',
  'unit_system',
  'godziny_snu',
  'selected_baking_vessel',
  'baker_ritual_profile',
  'has_completed_onboarding',
  'przypomnienia_karmienia',
] as const;

export interface LekcjaKopii {
  levelId: number;
  completedAt: number;
}

export const dozwolony = (k: string) => KLUCZE_USTAWIEN_KOPII.some((x) => x === k);

/** Ustawienia z pliku: tylko dozwolone klucze z tekstową wartością; brak pola albo zły kształt → undefined. */
export function parseUstawienia(v: unknown): Record<string, string> | undefined {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return undefined;
  return Object.fromEntries(Object.entries(v).filter(([k, w]) => dozwolony(k) && typeof w === 'string'));
}

/** Lekcje z pliku: wpisy z całkowitym numerem i czasem; brak tablicy → undefined. */
export function parseLekcje(v: unknown): LekcjaKopii[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v
    .filter((x) => Number.isInteger(x?.levelId) && typeof x?.completedAt === 'number' && Number.isFinite(x.completedAt))
    .map((x) => ({ levelId: x.levelId, completedAt: x.completedAt }));
}

/** Odczyt do kopii z bazy. */
export async function czytajUstawieniaILekcje(db: SQLite.SQLiteDatabase): Promise<{ settings: Record<string, string>; lessonProgress: LekcjaKopii[] }> {
  const znaki = KLUCZE_USTAWIEN_KOPII.map(() => '?').join(', ');
  const ust = await db.getAllAsync<{ key: string; value: string }>(`SELECT key, value FROM app_settings WHERE key IN (${znaki}) ORDER BY key;`, ...KLUCZE_USTAWIEN_KOPII);
  const lek = await db.getAllAsync<{ level_id: number; completed_at: number }>('SELECT level_id, completed_at FROM lesson_progress ORDER BY level_id ASC;');
  return {
    settings: Object.fromEntries(ust.map((r) => [r.key, r.value])),
    lessonProgress: lek.map((r) => ({ levelId: r.level_id, completedAt: r.completed_at })),
  };
}

/** Zapis z kopii w transakcji importu: tylko pola, które kopia niesie; lekcje zastępują lekcje w telefonie. */
export async function zapiszUstawieniaILekcje(db: SQLite.SQLiteDatabase, settings?: Record<string, unknown>, lekcje?: LekcjaKopii[]): Promise<void> {
  for (const [k, w] of Object.entries(settings ?? {})) {
    if (dozwolony(k) && typeof w === 'string') await db.runAsync('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;', k, w);
  }
  if (!lekcje) return;
  await db.execAsync('DELETE FROM lesson_progress;');
  for (const l of lekcje) await db.runAsync('INSERT INTO lesson_progress (level_id, completed_at) VALUES (?, ?) ON CONFLICT(level_id) DO UPDATE SET completed_at = excluded.completed_at;', l.levelId, l.completedAt);
}
