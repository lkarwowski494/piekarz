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
import { zachowajUszkodzony } from './uszkodzone-wiersze';
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

type Filtr = { id: string } | { status: StatusSesji };

async function wiersze(filtr: Filtr): Promise<WierszSesji[]> {
  const db = await getDb();
  const pasuje = (w: WierszSesji) => ('id' in filtr ? w.id === filtr.id : w.status === filtr.status);
  if (!db) return memStore.bakeSessions.filter(pasuje).sort(kolejnosc);
  const out: WierszSesji[] = [];
  // Nazwa kolumny z zamkniętej listy (id albo status), wartość jako parametr
  const sql = `${SELECT} WHERE ${'id' in filtr ? 'id' : 'status'} = ? ORDER BY created_at, id;`;
  for (const r of await db.getAllAsync<unknown>(sql, 'id' in filtr ? filtr.id : filtr.status)) {
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
 * UPSERT jednego wiersza z limitem w tej samej transakcji; aktualizacja istniejącego id nie jest nadmiarem.
 * `zastap`: inne wiersze tego statusu kasowane w tej samej transakcji (ekrany jednej sesji, jak przed D1).
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
  let wynik: ZapisSesji = { ok: true };
  await writeOrThrow(() =>
    db.withTransactionAsync(async () => {
      if (zastap) await db.runAsync('DELETE FROM bake_sessions WHERE status = ? AND id <> ?;', status, id);
      const n = await db.getFirstAsync<{ c: unknown }>('SELECT count(*) AS c FROM bake_sessions WHERE status = ? AND id <> ?;', status, id);
      if (!isNum(n?.c)) throw new Error('bake_sessions: count(*) bez liczby');
      if (n.c >= MAX[status]) {
        wynik = limit;
        return;
      }
      await db.runAsync(
        `INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET status = excluded.status, session_json = excluded.session_json, updated_at = excluded.updated_at;`,
        id,
        status,
        json,
        teraz,
        teraz
      );
    })
  );
  return wynik;
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
  if (db) await writeOrThrow(() => db.runAsync("DELETE FROM bake_sessions WHERE status = 'active';"));
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
  if (db) await db.runAsync(`DELETE FROM bake_sessions WHERE ${'id' in filtr ? 'id' : 'status'} = ?;`, 'id' in filtr ? filtr.id : filtr.status);
  return recipeId;
}

/** Pamięć po zatwierdzeniu transakcji końca wypieku (albo bez bazy). */
export function zakonczSesjeWPamieci(opts: KoniecSesji): void {
  if (opts.sessionId !== undefined) memStore.bakeSessions = memStore.bakeSessions.filter((w) => w.id !== opts.sessionId);
  else if (opts.clearSession) memStore.bakeSessions = memStore.bakeSessions.filter((w) => w.status !== 'active');
}
