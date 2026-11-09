// ============================================================================
// Piekarz — trwające i zaplanowane wypieki w kopii przed czyszczeniem [M1-audytor-generalny-023; 05-architekt-504]
// DEC-11 a (D-286): „Usuń wszystkie dane” kasuje bake_sessions, więc kopia przed czyszczeniem niesie ich surowe wiersze
// w polu opcjonalnym formatu 2 (`bakeSessions`), a import je przywraca. Eksport, kopie po wypieku i przed importem pola
// nie mają (D-102 bez zmian); kopia bez pola nie rusza sesji w telefonie, jak dotąd.
// Import dopisuje, nie zastępuje: kopia przed importem sesji nie niesie, więc import nie kasuje żadnego wypieku. Wiersz
// tego samego id zostaje z telefonu; limity trwających i zaplanowanych jak przy zapisie; wypiek z wpisem w Dzienniku
// (id wpisu = id wypieku) nie wraca jako trwający. Wiersz pominięty przez limit zostaje w pliku kopii.
// ============================================================================

import type * as SQLite from 'expo-sqlite';
import { MAX_TRWAJACYCH_WYPIEKOW, MAX_ZAPLANOWANYCH_WYPIEKOW } from '../core/limity-wypiekow';
import { parsePlannedBake, type StatusSesji, type WierszSesji } from './bake-sessions-store';
import { parseBakeSession } from './sesja-parsery';
import { isObj, isNum, isStr } from './row-parsers';
import { memStore } from './sqlite-schema';
import { zachowajUszkodzony } from './uszkodzone-wiersze';

const MAX: Record<StatusSesji, number> = { active: MAX_TRWAJACYCH_WYPIEKOW, planned: MAX_ZAPLANOWANYCH_WYPIEKOW };

/** Kształt wiersza bake_sessions; zły typ kolumny = null. */
function wiersz(v: unknown): WierszSesji | null {
  if (!isObj(v) || !isStr(v.id) || (v.status !== 'active' && v.status !== 'planned')) return null;
  if (!isStr(v.session_json) || !isNum(v.created_at) || !isNum(v.updated_at)) return null;
  return { id: v.id, status: v.status, session_json: v.session_json, created_at: v.created_at, updated_at: v.updated_at };
}

/**
 * Wszystkie wiersze bake_sessions do kopii przed czyszczeniem, także z nieczytelnym JSON-em (surowa treść zostaje
 * w pliku). Wiersz o złym kształcie idzie do pliku ratunkowego (uszkodzoneWiersze). Błąd odczytu leci dalej: bez kopii
 * nic się nie usuwa.
 */
export async function czytajSesjeDoKopii(db: SQLite.SQLiteDatabase | null): Promise<WierszSesji[]> {
  if (!db) return memStore.bakeSessions.map((w) => ({ ...w }));
  const out: WierszSesji[] = [];
  for (const r of await db.getAllAsync<unknown>('SELECT id, status, session_json, created_at, updated_at FROM bake_sessions ORDER BY created_at, id;')) {
    const w = wiersz(r);
    if (w) out.push(w);
    else zachowajUszkodzony({ tabela: 'bake_sessions', id: isObj(r) && isStr(r.id) ? r.id : JSON.stringify(r), surowe: JSON.stringify(r) });
  }
  return out;
}

/** Pole `bakeSessions` z pliku kopii: brak tablicy = brak pola (null); wiersz nieczytelny jest pomijany i liczony. */
export function parseSesjeKopii(v: unknown): { rows: WierszSesji[]; skipped: number } | null {
  if (!Array.isArray(v)) return null;
  const rows: WierszSesji[] = [];
  let skipped = 0;
  for (const r of v) {
    const w = wiersz(r);
    const czytelny = w && (w.status === 'active' ? parseBakeSession(w.session_json) : parsePlannedBake(w.session_json));
    if (w && czytelny) rows.push(w);
    else skipped++;
  }
  return { rows, skipped };
}

/** Warunek limitu jak w bake-sessions-store (nieczytelny wiersz się nie liczy) i brak wpisu tego id w Dzienniku. */
const WOLNE = `(SELECT count(*) FROM bake_sessions WHERE status = ? AND json_valid(session_json)) < ?
  AND NOT EXISTS (SELECT 1 FROM bakes WHERE id = ?)`;

/** Import w transakcji wywołującego (`tx`), po zapisie wpisów Dziennika z kopii. */
export async function wstawSesjeZKopii(tx: SQLite.SQLiteDatabase, rows: readonly WierszSesji[]): Promise<void> {
  for (const w of rows) {
    await tx.runAsync(
      `INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at)
       SELECT ?, ?, ?, ?, ? WHERE ${WOLNE}
       ON CONFLICT(id) DO NOTHING;`,
      w.id, w.status, w.session_json, w.created_at, w.updated_at, w.status, MAX[w.status], w.id
    );
  }
}

/** Ta sama reguła w trybie pamięci (bez bazy). */
export function wstawSesjeWPamieci(rows: readonly WierszSesji[]): void {
  for (const w of rows) {
    const zajete = memStore.bakeSessions.filter((x) => x.status === w.status).length >= MAX[w.status];
    if (zajete || memStore.bakeSessions.some((x) => x.id === w.id) || memStore.logs.some((l) => l.id === w.id)) continue;
    memStore.bakeSessions = [...memStore.bakeSessions, { ...w }];
  }
}
