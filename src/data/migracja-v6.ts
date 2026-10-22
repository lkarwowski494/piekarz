// ============================================================================
// Piekarz — migracja v6: trwająca sesja z app_settings do tabeli bake_sessions (D-102, D1-1, D1-4, D1-6) [M3 D1]
// Schemat (tabela, kolumny) jest w SCHEMA_MIGRATIONS (sqlite-schema.ts); tu są kroki na danych:
// - przed BEGIN: surowa stara sesja do pliku Backup/kopie-ratunkowe/sesja-przed-migracja-<czas>.json (obok kopii
//   VACUUM INTO). Nieudany zapis pliku = migracja nie rusza, aplikacja zostaje na v5 (D1-6);
// - w transakcji: sesja v1/v2 jako wiersz 'active', potem skasowanie starego klucza (po udanym INSERT).
// ============================================================================

import * as FileSystem from 'expo-file-system/legacy';
import type * as SQLite from 'expo-sqlite';
import { AUTO_DIR, RESCUE_DIR, stampOf } from '../lib/backup';
import { BAKE_SESSION_KEY, idSesji, parseBakeSession } from './bake-session-store';
import { zachowajUszkodzony } from './uszkodzone-wiersze';

const PLIK_RE = /^sesja-przed-migracja-.*\.json$/;

/** Surowa wartość starego klucza; '' = brak albo pusta; null = baza bez app_settings (niepełna baza sprzed migracji 1). */
async function surowaSesja(db: SQLite.SQLiteDatabase): Promise<string | null> {
  const tab = await db.getFirstAsync<{ c: unknown }>("SELECT count(*) AS c FROM sqlite_master WHERE type = 'table' AND name = 'app_settings';");
  if (tab?.c !== 1) return null;
  const row = await db.getFirstAsync<{ value: unknown }>('SELECT value FROM app_settings WHERE key = ?;', BAKE_SESSION_KEY);
  const v = row?.value;
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  // Wartość, która nie jest tekstem (BLOB, liczba): surowo jako JSON do pliku ratunkowego, nie jak pusta [M3 D1b, P2-5]
  return JSON.stringify(v instanceof Uint8Array ? Array.from(v) : v);
}

/** Plik ratunkowy z surową starą sesją; pusta albo brak sesji = bez pliku; ta sama treść z poprzedniej próby = bez drugiego. */
export async function zapiszSesjePrzedMigracja(db: SQLite.SQLiteDatabase): Promise<void> {
  const surowe = await surowaSesja(db);
  if (surowe === null || surowe === '') return;
  const docDir = FileSystem.documentDirectory;
  if (!docDir) throw new Error('Brak katalogu dokumentów: plik ratunkowy sesji przed migracją się nie zapisze');
  const dir = `${docDir}${AUTO_DIR}${RESCUE_DIR}`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  for (const n of (await FileSystem.readDirectoryAsync(dir)).filter((x) => PLIK_RE.test(x))) {
    try {
      if (Reflect.get(Object(JSON.parse(await FileSystem.readAsStringAsync(`${dir}${n}`))), 'surowe') === surowe) return;
    } catch {
      // Nieczytelny plik zostaje nietknięty; zapisujemy nowy
    }
  }
  const body = { format: 'piekarz-sesja-przed-migracja', klucz: BAKE_SESSION_KEY, zapisano: new Date().toISOString(), surowe };
  await FileSystem.writeAsStringAsync(`${dir}sesja-przed-migracja-${stampOf(new Date())}.json`, JSON.stringify(body, null, 2));
}

/**
 * W transakcji migracji: poprawna sesja (v2 albo v1) jako wiersz trwający; nieczytelna nie daje wiersza, a jej
 * surowa treść jest w pliku z kroku przed BEGIN, w kopii VACUUM INTO i na liście uszkodzonych (kopie zapasowe).
 */
export async function przeniesSesjeV6(db: SQLite.SQLiteDatabase): Promise<void> {
  const surowe = await surowaSesja(db);
  if (surowe === null) return;
  const sesja = parseBakeSession(surowe);
  if (sesja) {
    const teraz = Date.now();
    await db.runAsync(
      `INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at) VALUES (?, 'active', ?, ?, ?)
       ON CONFLICT(id) DO NOTHING;`,
      idSesji(sesja),
      JSON.stringify(sesja),
      teraz,
      teraz
    );
  } else if (surowe !== '') {
    zachowajUszkodzony({ tabela: 'app_settings', id: BAKE_SESSION_KEY, surowe });
  }
  await db.runAsync('DELETE FROM app_settings WHERE key = ?;', BAKE_SESSION_KEY);
}
