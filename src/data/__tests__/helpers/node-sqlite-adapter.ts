/**
 * Adapter expo-sqlite na prawdziwym SQLite (node:sqlite) dla testów danych [M1-audytor-generalny-005].
 *
 * Użycie w pliku testu (fabryka jest.mock nie może sięgać do zmiennych z zewnątrz, więc require):
 *   jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());
 *
 * Pliki bazy trafiają do katalogu tymczasowego z useTempDbDir(); restartApp() symuluje ponowne
 * uruchomienie aplikacji (nowe moduły i połączenie, te same pliki bazy i ta sama makieta plików).
 */
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

type SqlValue = string | number | null | bigint | Uint8Array;

interface NodeSqliteModule {
  DatabaseSync: typeof DatabaseSyncType;
}

export interface AdapterControl {
  /** Katalog z plikami baz bieżącego testu. */
  dir: string;
  /** Wymusza błąd zapisu (INSERT/UPDATE/DELETE/REPLACE) — np. pełny dysk. */
  failWrites: boolean;
  /** Wymusza błąd zapisu tylko dla zapytań pasujących do wzorca. */
  failWritesMatching: RegExp | null;
  /** Wymusza błąd odczytu (SELECT) dla zapytań pasujących do wzorca [audyt-niezalezny B-8]. */
  failReadsMatching: RegExp | null;
  /** Wymusza błąd otwarcia bazy. */
  failOpen: boolean;
  /** Ścieżki otwartych plików baz (do sprawdzeń w testach). */
  opened: string[];
}

const KEY = '__piekarzSqliteAdapter';
type GlobalWithControl = typeof globalThis & { [KEY]?: AdapterControl };

export function control(): AdapterControl {
  const g = globalThis as GlobalWithControl;
  if (!g[KEY]) {
    g[KEY] = { dir: '', failWrites: false, failWritesMatching: null, failReadsMatching: null, failOpen: false, opened: [] };
  }
  return g[KEY];
}

function nodeSqlite(): NodeSqliteModule {
  // getBuiltinModule omija resolver Jest 29, który nie zna modułów tylko z prefiksem node:
  return process.getBuiltinModule('node:sqlite') as NodeSqliteModule;
}

/** Nowy pusty katalog baz dla testu; zeruje przełączniki awarii. */
export function useTempDbDir(): string {
  const c = control();
  c.dir = fs.mkdtempSync(path.join(os.tmpdir(), 'piekarz-sqlite-'));
  c.failWrites = false;
  c.failWritesMatching = null;
  c.failReadsMatching = null;
  c.failOpen = false;
  c.opened = [];
  return c.dir;
}

export const IOS_DEFAULT_DIR = '/var/mobile/Containers/Data/Application/TEST/Documents/SQLite';

/** Plik bazy, który aplikacja otwiera dla nazwy i katalogu (jak na iOS: Library/SQLite albo Documents/SQLite). */
export function dbFilePath(name = 'piekarz.db', iosDir?: string): string {
  const sub = iosDir && iosDir.includes('/Library/SQLite') ? 'Library/SQLite' : 'Documents/SQLite';
  return path.join(control().dir, sub, name);
}

const isWrite = (sql: string) => /^\s*(INSERT|UPDATE|DELETE|REPLACE)/i.test(sql);

function params(ps: unknown[]): SqlValue[] {
  const flat = ps.length === 1 && Array.isArray(ps[0]) ? (ps[0] as unknown[]) : ps;
  return flat.map((v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'bigint' || v instanceof Uint8Array) return v;
    throw new Error(`Nieobsługiwany parametr SQL: ${typeof v}`);
  });
}

/**
 * Baza otwierana jak SQLite w aplikacji: bez kluczy obcych (node:sqlite domyślnie je włącza), więc testy
 * sprawdzają, że włącza je aplikacja (05-architekt-fix-p5-003) [M1-audytor-generalny-104].
 */
export function openRaw(file: string): DatabaseSyncType {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const { DatabaseSync } = nodeSqlite();
  return new DatabaseSync(file, { enableForeignKeyConstraints: false });
}

function wrap(file: string) {
  const db = openRaw(file);
  const c = control();
  c.opened.push(file);
  const guardWrite = (sql: string) => {
    if (!isWrite(sql)) return;
    if (c.failWrites || (c.failWritesMatching && c.failWritesMatching.test(sql))) {
      throw new Error('SQLITE_FULL: database or disk is full');
    }
  };
  const guardRead = (sql: string) => {
    if (c.failReadsMatching && c.failReadsMatching.test(sql)) throw new Error('SQLITE_IOERR_READ: disk I/O error');
  };
  let inTx = false;
  const self = {
    databasePath: file,
    execAsync: async (sql: string): Promise<void> => {
      guardWrite(sql);
      db.exec(sql);
    },
    runAsync: async (sql: string, ...ps: unknown[]) => {
      guardWrite(sql);
      const r = db.prepare(sql).run(...params(ps));
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    getAllAsync: async <T>(sql: string, ...ps: unknown[]): Promise<T[]> => {
      guardRead(sql);
      return db.prepare(sql).all(...params(ps)) as T[];
    },
    getFirstAsync: async <T>(sql: string, ...ps: unknown[]): Promise<T | null> => {
      guardRead(sql);
      return (db.prepare(sql).get(...params(ps)) as T | undefined) ?? null;
    },
    withTransactionAsync: async (fn: () => Promise<void>): Promise<void> => {
      if (inTx) throw new Error('Zagnieżdżona transakcja');
      inTx = true;
      db.exec('BEGIN');
      try {
        await fn();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      } finally {
        inTx = false;
      }
    },
    closeAsync: async (): Promise<void> => {
      db.close();
    },
  };
  return self;
}

/** Fabryka modułu 'expo-sqlite' dla jest.mock. */
export function createExpoSqliteMock() {
  return {
    defaultDatabaseDirectory: IOS_DEFAULT_DIR,
    openDatabaseAsync: async (name: string, _options?: unknown, directory?: string) => {
      const c = control();
      if (c.failOpen) throw new Error('unable to open database file');
      if (!c.dir) throw new Error('Adapter SQLite: wywołaj useTempDbDir() w beforeEach');
      return wrap(dbFilePath(name, directory));
    },
  };
}

/** Liczności wszystkich tabel użytkownika w bazie. */
export function tableCounts(db: DatabaseSyncType): Record<string, number> {
  const tabs = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all() as Array<{ name: string }>;
  const out: Record<string, number> = {};
  for (const { name } of tabs) {
    const row = db.prepare(`SELECT count(*) AS c FROM "${name}"`).get() as { c: number };
    out[name] = Number(row.c);
  }
  return out;
}

/** Symulacja ponownego uruchomienia: świeże moduły aplikacji, te same pliki bazy. */
export function restartApp() {
  jest.resetModules();
  return {
    store: require('../../sqlite-store') as typeof import('../../sqlite-store'),
    schema: require('../../sqlite-schema') as typeof import('../../sqlite-schema'),
    backup: require('../../../lib/backup') as typeof import('../../../lib/backup'),
    status: require('../../storage-status') as typeof import('../../storage-status'),
  };
}
