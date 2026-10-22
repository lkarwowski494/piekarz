// ============================================================================
// Piekarz — lista sesji wypieków: trwające i zaplanowane, wiersz na wypiek w bake_sessions (D-102, D1-1) [M3 D1]
// Zapis jednego wiersza UPSERT-em nie dotyka cudzych wierszy; uszkodzony wiersz jest pomijany przy odczycie,
// a jego surowa treść trafia do pliku ratunkowego i kopii (121). Limity: src/core/limity-wypiekow.ts.
// Ekrany pracują per id wypieku: start saveActiveBakeSession, krok zapiszPostepWypieku (tylko istniejący wiersz),
// koniec finishBake({ sessionId }), przerwanie deleteBakeSession(id) [M3 D3a].
// ============================================================================

import type * as SQLite from 'expo-sqlite';
import type { SessionStep } from '../core/bake-steps';
import { MAX_TRWAJACYCH_WYPIEKOW, MAX_ZAPLANOWANYCH_WYPIEKOW } from '../core/limity-wypiekow';
import { startPlanuAt } from '../core/plany-wypiekow';
import { getDb, memStore } from './sqlite-schema';
import { assertWritable, writeOrThrow } from './storage-status';
import { zachowajUszkodzony, zapisUszkodzonych } from './uszkodzone-wiersze';
import { isObj, isNum, isStr } from './row-parsers';
import { idSesji, isActiveBakeState, isSessionStep, parseBakeSession, type BakeSession } from './bake-session-store';
import type { ActiveBakeState } from './sqlite-schema';

export type StatusSesji = 'active' | 'planned';

/** Wypiek zaplanowany na później (kroki planu z godzinami). */
export interface PlannedBake {
  version: 1;
  id: string;
  recipeName: string;
  recipeId?: string;
  plannedStartAt: number;
  steps: readonly SessionStep[];
  /**
   * Dane wypieku z planu (receptura z ilościami, zakwas, temperatura): start planu prowadzi je na Stolnicę jak
   * „Zacznij wypiek” w planie. Pole opcjonalne w JSON-ie wiersza (bez zmiany schematu); id = id planu [M3 D5].
   */
  bake?: ActiveBakeState;
}

export type BladLimitu = { kind: 'limit'; status: StatusSesji; max: number };
/** Wypiek do zapisu kroku już nie trwa (koniec albo przerwanie wcześniej) [M3 D3a]. */
export type BladBraku = { kind: 'brak'; id: string };
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
  // Dane wypieku planu: zepsute albo z innym id → cały plan nieczytelny (do pliku ratunkowego), nie zgadnięte [M3 D5]
  if (v.bake !== undefined && !(isActiveBakeState(v.bake) && v.bake.id === v.id)) return null;
  const recipeId = isStr(v.recipeId) ? { recipeId: v.recipeId } : {};
  const bake = v.bake !== undefined ? { bake: v.bake } : {};
  return { version: 1, id: v.id, recipeName: v.recipeName, ...recipeId, plannedStartAt: v.plannedStartAt, steps, ...bake };
}

/** Wiersze jednego id albo jednego statusu. */
type Filtr = { id: string } | { status: StatusSesji };

/** Warunek SQL z zamkniętej listy kolumn i jego parametry (wartości zawsze jako `?`). */
function gdzie(filtr: Filtr): { sql: string; params: string[] } {
  return 'id' in filtr ? { sql: 'id = ?', params: [filtr.id] } : { sql: 'status = ?', params: [filtr.status] };
}

async function wiersze(filtr: Filtr): Promise<WierszSesji[]> {
  const db = await getDb();
  const pasuje = (w: WierszSesji) => ('id' in filtr ? w.id === filtr.id : w.status === filtr.status);
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
  return (await loadActiveBakeSessionsZWersja()).map((w) => w.sesja);
}

/** Trwający wypiek z wersją wiersza (updated_at), od której ekran zapisuje kolejne kroki [M3 D3a-fix, P1-1]. */
export interface ZapisanyWypiek {
  sesja: BakeSession;
  wersja: number;
}

/** Trwające wypieki z wersją wiersza, od najstarszego. */
export async function loadActiveBakeSessionsZWersja(): Promise<ZapisanyWypiek[]> {
  const out: ZapisanyWypiek[] = [];
  for (const w of await wiersze({ status: 'active' })) {
    const sesja = parseBakeSession(w.session_json);
    if (sesja) out.push({ sesja, wersja: w.updated_at });
    else zachowajUszkodzony({ tabela: 'bake_sessions', id: w.id, surowe: w.session_json });
  }
  return out;
}

/**
 * Zaplanowane wypieki: planowany start rosnąco (pierwszy krok, inaczej `plannedStartAt`), potem id. Czas zapisu wiersza
 * nie rozstrzyga: dwa zapisy w jednej milisekundzie dawały kolejność zależną od id i od przebiegu [M3 TZ Matrix].
 */
export async function loadPlannedBakes(): Promise<PlannedBake[]> {
  return odczytaj(await wiersze({ status: 'planned' }), parsePlannedBake).sort(
    (a, b) => startPlanuAt(a) - startPlanuAt(b) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
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
 * Warunek limitu (parametry: status, id, max): wiersz z nieczytelnym JSON-em (`json_valid` = 0) nie liczy się do
 * limitu, bo nie da się go prowadzić ani pokazać; jego surowa treść jest w pliku ratunkowym (P2-2, wybór: nie liczyć,
 * zamiast blokować start wypiekiem, którego użytkownik nie widzi) [M3 D3a-fix].
 */
const POZA_LIMITEM = '(SELECT count(*) FROM bake_sessions WHERE status = ? AND id <> ? AND json_valid(session_json)) < ?';

/**
 * UPSERT jednego wiersza z limitem w JEDNEJ instrukcji, bez własnej transakcji [M3 D1b, przegląd danych D1 P2-1]:
 * withTransactionAsync w expo-sqlite 57 po nieudanym BEGIN (zapis kroku w trakcie transakcji finishBake na tym samym
 * połączeniu) robi ROLLBACK, który cofał cudzą transakcję. Jedna instrukcja jest atomowa sama, a w cudzej transakcji
 * staje się jej częścią (jak zapis klucza sesji do v5). Aktualizacja istniejącego id nie jest nadmiarem. Cudzych
 * wierszy zapis nie dotyka (bez dawnego „zastąp”, przegląd danych D1 P2-3) [M3 D3a].
 */
async function zapisz(id: string, status: StatusSesji, json: string): Promise<ZapisSesji> {
  assertWritable();
  const teraz = Date.now();
  const limit: ZapisSesji = { ok: false, error: { kind: 'limit', status, max: MAX[status] } };
  const db = await getDb();
  if (!db) {
    const zostaja = memStore.bakeSessions.filter((w) => w.id !== id);
    if (zostaja.filter((w) => w.status === status).length >= MAX[status]) return limit;
    const byl = memStore.bakeSessions.find((w) => w.id === id);
    memStore.bakeSessions = [...zostaja, { id, status, session_json: json, created_at: byl?.created_at ?? teraz, updated_at: teraz }];
    return { ok: true };
  }
  const r = await writeOrThrow(() =>
    db.runAsync(
      `INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at)
       SELECT ?, ?, ?, ?, ? WHERE ${POZA_LIMITEM}
       ON CONFLICT(id) DO UPDATE SET status = excluded.status, session_json = excluded.session_json, updated_at = excluded.updated_at;`,
      id,
      status,
      json,
      teraz,
      teraz,
      status,
      id,
      MAX[status]
    )
  );
  return r.changes === 0 ? limit : { ok: true };
}

/** Start (pierwszy zapis) albo zapis jednego trwającego wypieku; trzeci trwający → błąd limitu, nic nie zapisane (BR-ETAP-006). */
export function saveActiveBakeSession(s: BakeSession): Promise<ZapisSesji> {
  return zapisz(idSesji(s), 'active', JSON.stringify(s));
}

/** Wiersz już jest (utworzenie) albo ma nowszy stan niż odczytany przez ekran (zapis kroku) [M3 D3a-fix]. */
export type BladStanu = { kind: 'istnieje' | 'nieaktualny'; id: string };
/** Wynik zapisu z wersją wiersza: ekran zapisuje następny krok od tej wersji. */
export type ZapisWersji = { ok: true; wersja: number } | { ok: false; error: BladLimitu | BladBraku | BladStanu };

async function istniejeAktywny(db: Db | null, id: string): Promise<boolean> {
  if (!db) return memStore.bakeSessions.some((w) => w.id === id && w.status === 'active');
  return (await db.getAllAsync<unknown>("SELECT id FROM bake_sessions WHERE id = ? AND status = 'active';", id)).length > 0;
}

/**
 * Pierwszy zapis nowego wypieku z planu: tylko gdy wiersza tego id nie ma (bez UPSERT-u), z limitem trwających,
 * jedną instrukcją. Wiersz już jest (np. nieczytelny przy odczycie, a ekran wziął wypiek z pamięci jako nowy):
 * `istnieje`, nic nie nadpisane (P2-1) [M3 D3a-fix].
 */
export async function utworzWypiek(s: BakeSession): Promise<ZapisWersji> {
  assertWritable();
  const id = idSesji(s);
  const json = JSON.stringify(s);
  const teraz = Date.now();
  const db = await getDb();
  let utworzono: boolean;
  // Wypiek z wpisem w Dzienniku (id wpisu = id wypieku, M3 P1-1) już się skończył: nie wraca z pamięci jako trwający
  const zakonczony = db
    ? (await db.getAllAsync<unknown>('SELECT 1 FROM bakes WHERE id = ?;', id)).length > 0
    : memStore.logs.some((l) => l.id === id);
  if (zakonczony) return { ok: false, error: { kind: 'brak', id } };
  if (!db) {
    const zajete = memStore.bakeSessions.filter((w) => w.status === 'active' && w.id !== id).length >= MAX.active;
    utworzono = !zajete && !memStore.bakeSessions.some((w) => w.id === id);
    if (utworzono) memStore.bakeSessions = [...memStore.bakeSessions, { id, status: 'active', session_json: json, created_at: teraz, updated_at: teraz }];
  } else {
    const r = await writeOrThrow(() =>
      db.runAsync(
        `INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at)
         SELECT ?, 'active', ?, ?, ? WHERE ${POZA_LIMITEM} AND NOT EXISTS (SELECT 1 FROM bakes WHERE id = ?)
         ON CONFLICT(id) DO NOTHING;`,
        id, json, teraz, teraz, 'active', id, MAX.active, id
      )
    );
    utworzono = r.changes > 0;
  }
  if (utworzono) return { ok: true, wersja: teraz };
  if (db ? (await db.getAllAsync<unknown>('SELECT id FROM bake_sessions WHERE id = ?;', id)).length > 0 : memStore.bakeSessions.some((w) => w.id === id)) {
    return { ok: false, error: { kind: 'istnieje', id } };
  }
  return { ok: false, error: { kind: 'limit', status: 'active', max: MAX.active } };
}

/**
 * Zapis kroku, fazy i zegara wypieku, który już trwa: UPDATE istniejącego wiersza `active` tylko z wersji, którą ekran
 * odczytał albo zapisał (P1-1: druga instancja Stolnicy ze starym stanem nie cofa postępu) [M3 D3a-fix]. Nowa wersja
 * rośnie zawsze, także w tej samej milisekundzie. Wiersza nie ma (koniec albo przerwanie wcześniej): `brak`, nic nie
 * tworzy (wyścig z przeglądu danych D1); nowszy stan: `nieaktualny`. Jedna instrukcja bez własnej transakcji (P2-1).
 */
export async function zapiszPostepWypieku(s: BakeSession, wersja: number): Promise<ZapisWersji> {
  assertWritable();
  const id = idSesji(s);
  const json = JSON.stringify(s);
  const nowa = Math.max(wersja + 1, Date.now());
  const db = await getDb();
  let zmieniono: boolean;
  if (!db) {
    const byl = memStore.bakeSessions.find((w) => w.id === id && w.status === 'active' && w.updated_at === wersja);
    if (byl) memStore.bakeSessions = memStore.bakeSessions.map((w) => (w === byl ? { ...w, session_json: json, updated_at: nowa } : w));
    zmieniono = byl !== undefined;
  } else {
    const r = await writeOrThrow(() =>
      db.runAsync("UPDATE bake_sessions SET session_json = ?, updated_at = ? WHERE id = ? AND status = 'active' AND updated_at = ?;", json, nowa, id, wersja)
    );
    zmieniono = r.changes > 0;
  }
  if (zmieniono) return { ok: true, wersja: nowa };
  return { ok: false, error: { kind: (await istniejeAktywny(db, id)) ? 'nieaktualny' : 'brak', id } };
}

/** Zapis planu; szósty zaplanowany → błąd limitu (BR-KAL-009). */
export function savePlannedBake(p: PlannedBake): Promise<ZapisSesji> {
  return zapisz(p.id, 'planned', JSON.stringify(p));
}

/**
 * Start zaplanowanego wypieku (BR-KAL-009, D-108): wiersz planu (id = id wypieku) przechodzi w trwający jedną
 * instrukcją UPDATE z limitem trwających — bez kasowania i ponownego wstawiania, więc nic nie ginie w połowie, a inne
 * plany zostają. Limit: nic się nie zmienia; wiersza planu już nie ma (usunięty, zaczęty gdzie indziej): `brak` [M3 D5].
 */
export async function zacznijZaplanowany(s: BakeSession): Promise<ZapisWersji> {
  assertWritable();
  const id = idSesji(s);
  const json = JSON.stringify(s);
  const teraz = Date.now();
  const db = await getDb();
  let zmieniono: boolean;
  if (!db) {
    const plan = memStore.bakeSessions.find((w) => w.id === id && w.status === 'planned');
    const wolne = memStore.bakeSessions.filter((w) => w.status === 'active' && w.id !== id).length < MAX.active;
    zmieniono = plan !== undefined && wolne;
    if (zmieniono) memStore.bakeSessions = memStore.bakeSessions.map((w) => (w === plan ? { ...w, status: 'active', session_json: json, updated_at: teraz } : w));
  } else {
    const r = await writeOrThrow(() =>
      db.runAsync(
        `UPDATE bake_sessions SET status = 'active', session_json = ?, updated_at = ? WHERE id = ? AND status = 'planned' AND ${POZA_LIMITEM};`,
        json, teraz, id, 'active', id, MAX.active
      )
    );
    zmieniono = r.changes > 0;
  }
  if (zmieniono) return { ok: true, wersja: teraz };
  const jestPlan = db
    ? (await db.getAllAsync<unknown>("SELECT id FROM bake_sessions WHERE id = ? AND status = 'planned';", id)).length > 0
    : memStore.bakeSessions.some((w) => w.id === id && w.status === 'planned');
  return { ok: false, error: jestPlan ? { kind: 'limit', status: 'active', max: MAX.active } : { kind: 'brak', id } };
}

/**
 * Przerwanie albo odrzucenie jednego wypieku (trwającego lub planu): tylko jego wiersz; nieczytelny wiersz trafia
 * najpierw do pliku ratunkowego (P2-4) [M3 D3a].
 */
export async function deleteBakeSession(id: string): Promise<void> {
  assertWritable();
  const db = await getDb();
  if (db) await writeOrThrow(() => usunZRatunkiem(db, { id }));
  memStore.bakeSessions = memStore.bakeSessions.filter((w) => w.id !== id);
}

/**
 * Tylko testy i przygotowanie danych: najstarszy trwający wypiek. Ekrany używają listy i id (test D3a pilnuje, że
 * app/ i src/ tego nie wołają, przegląd danych D1 P2-3).
 */
export async function loadBakeSession(): Promise<BakeSession | null> {
  const [pierwsza] = await loadActiveBakeSessions();
  return pierwsza ?? null;
}

/**
 * Tylko testy i przygotowanie danych: zapis JEDNEGO wypieku (UPSERT po id, inne trwające nietknięte; nadmiar ponad
 * limit rzuca błąd), a null kasuje wszystkie trwające (sprzątanie przed testem). Ekrany: saveActiveBakeSession,
 * zapiszPostepWypieku i deleteBakeSession [M3 D3a, P2-3].
 */
export async function saveBakeSession(session: BakeSession | null): Promise<void> {
  if (session) {
    const r = await zapisz(idSesji(session), 'active', JSON.stringify(session));
    if (!r.ok) throw new Error(`saveBakeSession: ${r.error.kind}`);
    return;
  }
  assertWritable();
  const db = await getDb();
  if (db) await writeOrThrow(() => usunZRatunkiem(db, { status: 'active' }));
  memStore.bakeSessions = memStore.bakeSessions.filter((w) => w.status !== 'active');
}

type Db = SQLite.SQLiteDatabase;
/**
 * Koniec jednego wypieku: `sessionId` = id jego wiersza (BR-KAL-016); bez id żadna sesja nie znika [M3 D3a].
 * `wymagajSesji`: ekran wie, że wypiek był zapisany; gdy wiersza już nie ma (koniec w drugiej instancji Stolnicy),
 * koniec nic nie zapisuje — bez drugiego wpisu i drugiego odliczenia mąki (P1-1) [M3 D3a-fix].
 */
export type KoniecSesji = { sessionId?: string; wymagajSesji?: boolean };

/**
 * W transakcji końca wypieku (finishBake): czy wiersz kończonego wypieku był, receptura z jego sesji i skasowanie tylko
 * tego wiersza (`sessionId`).
 */
export async function zakonczSesjeWTransakcji(db: Db | null, opts: KoniecSesji): Promise<{ trwal: boolean; recipeId?: string }> {
  const filtr: Filtr | null = opts.sessionId !== undefined ? { id: opts.sessionId } : null;
  if (!filtr) return { trwal: false };
  const lista = await wiersze(filtr);
  const recipeId = odczytaj(lista, (raw) => parseBakeSession(raw)).find((s) => s.bake?.recipeId !== undefined)?.bake?.recipeId;
  const wynik = { trwal: lista.length > 0, ...(recipeId !== undefined ? { recipeId } : {}) };
  if (!db || lista.length === 0) return wynik;
  // Nieczytelne wiersze (zgłoszone przez odczytaj) w pliku ratunkowym, zanim DELETE je skasuje (P2-4)
  await zapisUszkodzonych();
  const w = gdzie(filtr);
  await db.runAsync(`DELETE FROM bake_sessions WHERE ${w.sql};`, ...w.params);
  return wynik;
}

/** Pamięć po zatwierdzeniu transakcji końca wypieku (albo bez bazy). */
export function zakonczSesjeWPamieci(opts: KoniecSesji): void {
  if (opts.sessionId !== undefined) memStore.bakeSessions = memStore.bakeSessions.filter((w) => w.id !== opts.sessionId);
}
