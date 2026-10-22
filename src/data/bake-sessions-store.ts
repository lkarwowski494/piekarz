// ============================================================================
// Piekarz — lista sesji wypieków: trwające i zaplanowane, wiersz na wypiek w bake_sessions (D-102, D1-1) [M3 D1]
// Zapis jednego wiersza UPSERT-em nie dotyka cudzych wierszy; uszkodzony wiersz jest pomijany przy odczycie,
// a jego surowa treść trafia do pliku ratunkowego i kopii (121). Limity: src/core/limity-wypiekow.ts.
// Ekrany jednej sesji (do D3) używają loadBakeSession/saveBakeSession: lista widziana jako jedna sesja.
// ============================================================================

import type * as SQLite from 'expo-sqlite';
import type { SessionStep } from '../core/bake-steps';
import { MAX_TRWAJACYCH_WYPIEKOW, MAX_ZAPLANOWANYCH_WYPIEKOW } from '../core/limity-wypiekow';
import { getDb, memStore } from './sqlite-schema';
import { assertWritable, writeOrThrow } from './storage-status';
import { zachowajUszkodzony, zapisUszkodzonych } from './uszkodzone-wiersze';
import { isObj, isNum, isStr } from './row-parsers';
import { idSesji, isSessionStep, parseBakeSession, type BakeSession } from './bake-session-store';

export type StatusSesji = 'active' | 'planned';

/** Wypiek zaplanowany na później (kroki planu z godzinami); szczegóły planu: D5. */
export interface PlannedBake {
  version: 1;
  id: string;
  recipeName: string;
  recipeId?: string;
  plannedStartAt: number;
  steps: readonly SessionStep[];
}

export type BladLimitu = { kind: 'limit'; status: StatusSesji; max: number };
export type ZapisSesji = { ok: true } | { ok: false; error: BladLimitu };

/** Wiersz tabeli bake_sessions (ten sam kształt w pamięci, gdy nie ma bazy). */
export interface WierszSesji {
  id: string;
  status: StatusSesji;
  session_json: string;
  created_at: number;
  updated_at: number;
}

const MAX: Record<StatusSesji, number> = { active: MAX_TRWAJACYCH_WYPIEKOW, planned: MAX_ZAPLANOWANYCH_WYPIEKOW };
const SELECT = 'SELECT id, status, session_json, created_at, updated_at FROM bake_sessions';
const kolejnosc = (a: WierszSesji, b: WierszSesji) => a.created_at - b.created_at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

function parseWiersz(v: unknown): WierszSesji | null {
  if (!isObj(v) || !isStr(v.id) || (v.status !== 'active' && v.status !== 'planned')) return null;
  if (!isStr(v.session_json) || !isNum(v.created_at) || !isNum(v.updated_at)) return null;
  return { id: v.id, status: v.status, session_json: v.session_json, created_at: v.created_at, updated_at: v.updated_at };
}

/** Plan z JSON-a; każdy błąd formatu → null. */
export function parsePlannedBake(raw: string): PlannedBake | null {
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(v) || v.version !== 1 || !isStr(v.id) || !isStr(v.recipeName) || !isNum(v.plannedStartAt)) return null;
  if ((v.recipeId !== undefined && !isStr(v.recipeId)) || !Array.isArray(v.steps) || v.steps.length === 0) return null;
  const steps: SessionStep[] = [];
  for (const s of v.steps) {
    if (!isSessionStep(s)) return null;
    steps.push(s);
  }
  const recipeId = isStr(v.recipeId) ? { recipeId: v.recipeId } : {};
  return { version: 1, id: v.id, recipeName: v.recipeName, ...recipeId, plannedStartAt: v.plannedStartAt, steps };
}

/** Wiersze jednego id albo jednego statusu (opcjonalnie bez wiersza `poza`). */
type Filtr = { id: string } | { status: StatusSesji; poza?: string };

/** Warunek SQL z zamkniętej listy kolumn i jego parametry (wartości zawsze jako `?`). */
function gdzie(filtr: Filtr): { sql: string; params: string[] } {
  if ('id' in filtr) return { sql: 'id = ?', params: [filtr.id] };
  return filtr.poza === undefined ? { sql: 'status = ?', params: [filtr.status] } : { sql: 'status = ? AND id <> ?', params: [filtr.status, filtr.poza] };
}

async function wiersze(filtr: Filtr): Promise<WierszSesji[]> {
  const db = await getDb();
  const pasuje = (w: WierszSesji) => ('id' in filtr ? w.id === filtr.id : w.status === filtr.status && w.id !== filtr.poza);
  if (!db) return memStore.bakeSessions.filter(pasuje).sort(kolejnosc);
  const out: WierszSesji[] = [];
  const w = gdzie(filtr);
  for (const r of await db.getAllAsync<unknown>(`${SELECT} WHERE ${w.sql} ORDER BY created_at, id;`, ...w.params)) {
    const w = parseWiersz(r);
    if (w) out.push(w);
    else zachowajUszkodzony({ tabela: 'bake_sessions', id: isObj(r) && isStr(r.id) ? r.id : JSON.stringify(r), surowe: JSON.stringify(r) });
  }
  return out;
}

function odczytaj<T>(lista: WierszSesji[], parse: (raw: string) => T | null): T[] {
  const out: T[] = [];
  for (const w of lista) {
    const p = parse(w.session_json);
    if (p) out.push(p);
    else zachowajUszkodzony({ tabela: 'bake_sessions', id: w.id, surowe: w.session_json });
  }
  return out;
}

/** Trwające wypieki od najstarszego. */
export async function loadActiveBakeSessions(): Promise<BakeSession[]> {
  return odczytaj(await wiersze({ status: 'active' }), (raw) => parseBakeSession(raw));
}

/** Zaplanowane wypieki od najstarszego wpisu. */
export async function loadPlannedBakes(): Promise<PlannedBake[]> {
  return odczytaj(await wiersze({ status: 'planned' }), parsePlannedBake);
}

/**
 * Skasowanie wierszy filtra; najpierw ich odczyt, a nieczytelne idą do pliku ratunkowego i kopii, zanim znikną
 * (także te, których nikt w tym uruchomieniu nie czytał) [M3 D1b, przegląd danych D1 P2-4].
 */
async function usunZRatunkiem(db: Db, filtr: Filtr): Promise<void> {
  odczytaj(await wiersze(filtr), (raw) => parseBakeSession(raw) ?? parsePlannedBake(raw));
  await zapisUszkodzonych();
  const w = gdzie(filtr);
  await db.runAsync(`DELETE FROM bake_sessions WHERE ${w.sql};`, ...w.params);
}

/**
 * UPSERT jednego wiersza z limitem w JEDNEJ instrukcji, bez własnej transakcji [M3 D1b, przegląd danych D1 P2-1]:
 * withTransactionAsync w expo-sqlite 57 po nieudanym BEGIN (zapis kroku w trakcie transakcji finishBake na tym samym
 * połączeniu) robi ROLLBACK, który cofał cudzą transakcję. Jedna instrukcja jest atomowa sama, a w cudzej transakcji
 * staje się jej częścią (jak zapis klucza sesji do v5). Aktualizacja istniejącego id nie jest nadmiarem.
 * `zastap` (ekrany jednej sesji, jak przed D1): po zapisie kasuje inne wiersze tego statusu; gdy skasowanie się nie
 * uda, zostają dwa wiersze, ale żaden wypiek nie ginie.
 */
async function zapisz(id: string, status: StatusSesji, json: string, zastap = false): Promise<ZapisSesji> {
  assertWritable();
  const teraz = Date.now();
  const limit: ZapisSesji = { ok: false, error: { kind: 'limit', status, max: MAX[status] } };
  const db = await getDb();
  if (!db) {
    const zostaja = memStore.bakeSessions.filter((w) => w.id !== id && !(zastap && w.status === status));
    if (zostaja.filter((w) => w.status === status).length >= MAX[status]) return limit;
    const byl = memStore.bakeSessions.find((w) => w.id === id);
    memStore.bakeSessions = [...zostaja, { id, status, session_json: json, created_at: byl?.created_at ?? teraz, updated_at: teraz }];
    return { ok: true };
  }
  const r = await writeOrThrow(() =>
    db.runAsync(
      `INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at)
       SELECT ?, ?, ?, ?, ? WHERE ? = 1 OR (SELECT count(*) FROM bake_sessions WHERE status = ? AND id <> ?) < ?
       ON CONFLICT(id) DO UPDATE SET status = excluded.status, session_json = excluded.session_json, updated_at = excluded.updated_at;`,
      id,
      status,
      json,
      teraz,
      teraz,
      zastap ? 1 : 0,
      status,
      id,
      MAX[status]
    )
  );
  if (r.changes === 0) return limit;
  if (zastap) await writeOrThrow(() => usunZRatunkiem(db, { status, poza: id }));
  return { ok: true };
}

/** Zapis postępu jednego trwającego wypieku; trzeci trwający → błąd limitu, nic nie zapisane (BR-ETAP-006). */
export function saveActiveBakeSession(s: BakeSession): Promise<ZapisSesji> {
  return zapisz(idSesji(s), 'active', JSON.stringify(s));
}

/** Zapis planu; szósty zaplanowany → błąd limitu (BR-KAL-009). */
export function savePlannedBake(p: PlannedBake): Promise<ZapisSesji> {
  return zapisz(p.id, 'planned', JSON.stringify(p));
}

/** Przerwanie albo odrzucenie jednego wypieku (trwającego lub planu): tylko jego wiersz. */
export async function deleteBakeSession(id: string): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => db.runAsync('DELETE FROM bake_sessions WHERE id = ?;', id));
  memStore.bakeSessions = memStore.bakeSessions.filter((w) => w.id !== id);
}

/** Ekrany jednej sesji (do D3): pierwszy trwający wypiek albo null. */
export async function loadBakeSession(): Promise<BakeSession | null> {
  const [pierwsza] = await loadActiveBakeSessions();
  return pierwsza ?? null;
}

/**
 * Ekrany jednej sesji: zapis zastępuje trwający wypiek jak przed D1 (jedno miejsce na sesję); null kasuje trwające.
 * Ekran z pytaniem przed zastąpieniem (D-091) pyta, zanim tu dojdzie. Ekrany wielu wypieków (D3) używają
 * saveActiveBakeSession i deleteBakeSession.
 */
export async function saveBakeSession(session: BakeSession | null): Promise<void> {
  if (session) {
    await zapisz(idSesji(session), 'active', JSON.stringify(session), true);
    return;
  }
  assertWritable();
  const db = await getDb();
  if (db) await writeOrThrow(() => usunZRatunkiem(db, { status: 'active' }));
  memStore.bakeSessions = memStore.bakeSessions.filter((w) => w.status !== 'active');
}

type Db = SQLite.SQLiteDatabase;
export type KoniecSesji = { sessionId?: string; clearSession?: boolean };

/**
 * W transakcji końca wypieku (finishBake): receptura z sesji kończonego wypieku i skasowanie jej wiersza
 * (`sessionId`) albo wszystkich trwających (`clearSession`, ekrany jednej sesji). Zwraca id receptury albo undefined.
 */
export async function zakonczSesjeWTransakcji(db: Db | null, opts: KoniecSesji): Promise<string | undefined> {
  const filtr: Filtr | null = opts.sessionId !== undefined ? { id: opts.sessionId } : opts.clearSession ? { status: 'active' } : null;
  if (!filtr) return undefined;
  const lista = await wiersze(filtr);
  const recipeId = odczytaj(lista, (raw) => parseBakeSession(raw)).find((s) => s.bake?.recipeId !== undefined)?.bake?.recipeId;
  if (!db) return recipeId;
  // Nieczytelne wiersze (zgłoszone przez odczytaj) w pliku ratunkowym, zanim DELETE je skasuje (P2-4)
  await zapisUszkodzonych();
  const w = gdzie(filtr);
  await db.runAsync(`DELETE FROM bake_sessions WHERE ${w.sql};`, ...w.params);
  return recipeId;
}

/** Pamięć po zatwierdzeniu transakcji końca wypieku (albo bez bazy). */
export function zakonczSesjeWPamieci(opts: KoniecSesji): void {
  if (opts.sessionId !== undefined) memStore.bakeSessions = memStore.bakeSessions.filter((w) => w.id !== opts.sessionId);
  else if (opts.clearSession) memStore.bakeSessions = memStore.bakeSessions.filter((w) => w.status !== 'active');
}
