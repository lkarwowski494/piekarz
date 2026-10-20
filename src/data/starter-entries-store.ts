// ============================================================================
// Piekarz — zapis zakwasów i dziennika wpisów (starter_entries, migracja v5, ADR-008) [M1-audytor-generalny-104]
// Rodzic UPSERT-em (nigdy INSERT OR REPLACE: kaskada skasowałaby dziennik), rodzic i dzieci w jednej transakcji
// na głównym połączeniu. Po każdej zmianie wywołujący uzgadnia powiadomienia (resyncNotifications, ADR-006).
// ============================================================================

import type { StoredStarter, StoredStarterEntry } from './db';
import { getDb, memStore } from './sqlite-schema';
import { writeOrThrow } from './storage-status';
import { parseStarterEntryRow } from './row-parsers';

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

/** Zapis profilu zakwasu bez last_fed_at i last_feed_ratio: od v5 te wartości wynikają z wpisów (ADR-008). */
export const STARTER_UPSERT = `INSERT INTO starters (id, name, flour_type, hydration, birth_date, storage_state, setup_started_at, setup_completed_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, flour_type = excluded.flour_type, hydration = excluded.hydration,
    birth_date = excluded.birth_date, storage_state = excluded.storage_state,
    setup_started_at = excluded.setup_started_at, setup_completed_at = excluded.setup_completed_at;`;

export const starterParams = (s: StoredStarter) =>
  [s.id, s.name, s.flourType, s.hydration, s.birthDate, s.storageState, s.setupStartedAt ?? null, s.setupCompletedAt ?? null] as const;

const ENTRY_SELECT =
  'SELECT id, starter_id AS starterId, kind, occurred_at AS occurredAt, feed_ratio AS feedRatio, flour_grams AS flourGrams, water_grams AS waterGrams, signs, created_at AS createdAt, updated_at AS updatedAt FROM starter_entries';

const ENTRY_INSERT = `INSERT INTO starter_entries (id, starter_id, kind, occurred_at, feed_ratio, flour_grams, water_grams, signs, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const entryParams = (e: StoredStarterEntry) =>
  [e.id, e.starterId, e.kind, e.occurredAt, e.feedRatio ?? null, e.flourGrams ?? null, e.waterGrams ?? null, JSON.stringify(e.signs), e.createdAt, e.updatedAt] as const;

const byNewest = (a: StoredStarterEntry, b: StoredStarterEntry) => b.occurredAt - a.occurredAt || (a.id < b.id ? 1 : -1);

function parseEntries(raw: unknown[]): StoredStarterEntry[] {
  const out: StoredStarterEntry[] = [];
  for (const r of raw) {
    const e = parseStarterEntryRow(r);
    if (e) out.push(e);
  }
  return out;
}

/** Wstawienie wpisu w transakcji wywołującego; `ignoreExisting` = przywrócenie tego samego id bez błędu. */
export async function insertStarterEntryRow(db: Db, e: StoredStarterEntry, ignoreExisting = false): Promise<void> {
  await db.runAsync(`${ENTRY_INSERT}${ignoreExisting ? ' ON CONFLICT(id) DO NOTHING' : ''};`, ...entryParams(e));
}

/** Wpisy jednego zakwasu, od najnowszego. */
export async function getStarterEntries(starterId: string, limit?: number): Promise<StoredStarterEntry[]> {
  const db = await getDb();
  if (!db) {
    const mine = memStore.starterEntries.filter((e) => e.starterId === starterId).sort(byNewest);
    return limit === undefined ? mine : mine.slice(0, limit);
  }
  const raw = await db.getAllAsync<unknown>(
    `${ENTRY_SELECT} WHERE starter_id = ? ORDER BY occurred_at DESC, id DESC LIMIT ?;`,
    starterId,
    limit ?? -1
  );
  return parseEntries(raw);
}

/** Wszystkie wpisy (kopia zapasowa). */
export async function getAllStarterEntries(): Promise<StoredStarterEntry[]> {
  const db = await getDb();
  if (!db) return [...memStore.starterEntries].sort(byNewest);
  return parseEntries(await db.getAllAsync<unknown>(`${ENTRY_SELECT} ORDER BY starter_id, occurred_at DESC, id DESC;`));
}

function rememberStarter(s: StoredStarter): void {
  const i = memStore.starters.findIndex((x) => x.id === s.id);
  if (i >= 0) memStore.starters[i] = s;
  else memStore.starters.push(s);
}

/** Nowy zakwas z pierwszym wpisem (start zakładania albo pierwsze dokarmienie) w jednej transakcji. */
export async function createStarterWithEntry(starter: StoredStarter, first: StoredStarterEntry): Promise<void> {
  const db = await getDb();
  if (db) {
    await writeOrThrow(() =>
      db.withTransactionAsync(async () => {
        await db.runAsync(STARTER_UPSERT, ...starterParams(starter));
        await insertStarterEntryRow(db, first);
      })
    );
  }
  rememberStarter(starter);
  memStore.starterEntries = [...memStore.starterEntries.filter((e) => e.id !== first.id), first];
}

export type StarterPatch = Partial<Pick<StoredStarter, 'storageState' | 'setupStartedAt' | 'setupCompletedAt'>>;

/** Nowy wpis; zmiana rodzica (np. ROOM_TEMP po dokarmieniu z lodówki, „gotowy”) w tej samej transakcji. */
export async function addStarterEntry(entry: StoredStarterEntry, patch?: StarterPatch): Promise<void> {
  const db = await getDb();
  if (db) {
    await writeOrThrow(() =>
      db.withTransactionAsync(async () => {
        if (patch?.storageState !== undefined) {
          await db.runAsync('UPDATE starters SET storage_state = ? WHERE id = ?;', patch.storageState, entry.starterId);
        }
        if ('setupStartedAt' in (patch ?? {})) {
          await db.runAsync('UPDATE starters SET setup_started_at = ? WHERE id = ?;', patch?.setupStartedAt ?? null, entry.starterId);
        }
        if ('setupCompletedAt' in (patch ?? {})) {
          await db.runAsync('UPDATE starters SET setup_completed_at = ? WHERE id = ?;', patch?.setupCompletedAt ?? null, entry.starterId);
        }
        await insertStarterEntryRow(db, entry);
      })
    );
  }
  memStore.starterEntries = [...memStore.starterEntries.filter((e) => e.id !== entry.id), entry];
  const s = memStore.starters.find((x) => x.id === entry.starterId);
  if (s && patch) rememberStarter({ ...s, ...patch });
}

/** Poprawa jednego wpisu w miejscu (BR-ZAKW-007): inne wpisy bez zmian; brak wpisu = błąd. */
export async function updateStarterEntry(entry: StoredStarterEntry): Promise<void> {
  const db = await getDb();
  if (db) {
    await writeOrThrow(async () => {
      const r = await db.runAsync(
        'UPDATE starter_entries SET occurred_at = ?, feed_ratio = ?, flour_grams = ?, water_grams = ?, signs = ?, updated_at = ? WHERE id = ? AND starter_id = ?;',
        entry.occurredAt,
        entry.feedRatio ?? null,
        entry.flourGrams ?? null,
        entry.waterGrams ?? null,
        JSON.stringify(entry.signs),
        entry.updatedAt,
        entry.id,
        entry.starterId
      );
      if (r.changes === 0) throw new Error(`Starter entry ${entry.id} not found`);
    });
  } else if (!memStore.starterEntries.some((e) => e.id === entry.id)) {
    throw new Error(`Starter entry ${entry.id} not found`);
  }
  memStore.starterEntries = memStore.starterEntries.map((e) => (e.id === entry.id ? entry : e));
}

/** Usunięcie jednego wpisu (D-051 1a); zwraca usunięty wiersz do „Cofnij”, null gdy go nie było. */
export async function deleteStarterEntry(id: string): Promise<StoredStarterEntry | null> {
  const db = await getDb();
  let removed: StoredStarterEntry | null = memStore.starterEntries.find((e) => e.id === id) ?? null;
  if (db) {
    const found: { row: StoredStarterEntry | null } = { row: null };
    await writeOrThrow(() =>
      db.withTransactionAsync(async () => {
        found.row = parseEntries(await db.getAllAsync<unknown>(`${ENTRY_SELECT} WHERE id = ?;`, id))[0] ?? null;
        await db.runAsync('DELETE FROM starter_entries WHERE id = ?;', id);
      })
    );
    removed = found.row;
  }
  memStore.starterEntries = memStore.starterEntries.filter((e) => e.id !== id);
  return removed;
}

/** „Cofnij” po usunięciu: ten sam wiersz z tym samym id; istniejący wpis zostaje nietknięty. */
export async function restoreStarterEntry(entry: StoredStarterEntry): Promise<void> {
  const db = await getDb();
  if (db) await writeOrThrow(() => insertStarterEntryRow(db, entry, true));
  if (!memStore.starterEntries.some((e) => e.id === entry.id)) memStore.starterEntries = [...memStore.starterEntries, entry];
}

/** Zacznij od nowa (BR-ZAKW-005, pleśń): wpisy tego zakwasu usunięte, nowy dzień 1 od pierwszego wpisu. */
export async function restartStarterSetup(starterId: string, first: StoredStarterEntry): Promise<void> {
  const db = await getDb();
  if (db) {
    await writeOrThrow(() =>
      db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM starter_entries WHERE starter_id = ?;', starterId);
        await db.runAsync(
          'UPDATE starters SET setup_started_at = ?, setup_completed_at = NULL WHERE id = ?;',
          first.occurredAt,
          starterId
        );
        await insertStarterEntryRow(db, first);
      })
    );
  }
  memStore.starterEntries = [...memStore.starterEntries.filter((e) => e.starterId !== starterId), first];
  const s = memStore.starters.find((x) => x.id === starterId);
  if (s) rememberStarter({ ...s, setupStartedAt: first.occurredAt, setupCompletedAt: undefined });
}
