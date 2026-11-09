// ============================================================================
// Piekarz — import pakietu plików bazy z trybu awaryjnego i ekranu błędu bazy [M1-audytor-generalny-003;
// 12-niezawodnosc-001, DEC-17 a, D-286]. Pakiet (`piekarz-pliki-bazy`, kopia-plikow-bazy.ts) niesie .db i -wal jako
// base64. Kopia z pakietu trafia do osobnego katalogu w Caches i otwiera się jako osobna baza (SQLite odtwarza zapisy
// z -wal, -shm pomijamy: SQLite buduje go od nowa); migracje działają tylko na tej kopii. Stan czytają czytelnicy
// bazy aplikacji, a import idzie istniejącą ścieżką kopii (kopia przed importem, restoreFromBackupData).
// Baza aplikacji nie jest dotykana, dopóki użytkownik nie wybierze „Zastąp dane”.
// ============================================================================

import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import { applySchemaMigrations } from '../data/sqlite-schema';
import { zbierzDaneZBazy } from '../data/dane-z-bazy';
import { buildBackup, parseAndValidateBackup } from './backup';
import { PAKIET_FORMAT } from './kopia-plikow-bazy';
import { t } from './i18n';
import type { RozpoznanyPlik } from './import-z-pliku';

export interface PakietPlikow {
  /** Data zapisu pakietu (ISO) albo '' — podgląd kopii bez daty. */
  readonly utworzono: string;
  readonly db: string;
  readonly wal: string | null;
}

const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;
const NAZWA_KOPII = 'import-pakietu.db';

/** Wynik dla pakietu, którego nie da się odczytać: powód na ekranie, dane aplikacji bez zmian. */
export const pakietNieodczytany = (): RozpoznanyPlik => ({
  rodzaj: 'nierozpoznany',
  powod: t('Nie odczytałem danych z tej kopii bazy. Zachowaj plik i napisz do nas.'),
});

/** Pakiet z obiektu JSON (dane z zewnątrz: od `unknown`); null = to nie pakiet, 'uszkodzony' = pakiet bez czytelnej bazy. */
export function pakietZJson(v: unknown): PakietPlikow | 'uszkodzony' | null {
  if (typeof v !== 'object' || v === null || Reflect.get(v, 'format') !== PAKIET_FORMAT) return null;
  const pliki: unknown = Reflect.get(v, 'pliki');
  if (!Array.isArray(pliki)) return 'uszkodzony';
  let db: string | null = null;
  let wal: string | null = null;
  for (const plik of pliki) {
    const nazwa: unknown = typeof plik === 'object' && plik !== null ? Reflect.get(plik, 'nazwa') : undefined;
    const base64: unknown = typeof plik === 'object' && plik !== null ? Reflect.get(plik, 'base64') : undefined;
    if (typeof nazwa !== 'string' || typeof base64 !== 'string' || !BASE64.test(base64)) return 'uszkodzony';
    if (nazwa.endsWith('-shm')) continue;
    if (nazwa.endsWith('-wal')) wal = base64;
    else if (db === null) db = base64;
    else return 'uszkodzony';
  }
  if (!db) return 'uszkodzony';
  const utworzono: unknown = Reflect.get(v, 'utworzono');
  return { utworzono: typeof utworzono === 'string' ? utworzono : '', db, wal };
}

/**
 * Kopia zapasowa z pakietu: kopia plików w Caches, osobne połączenie, sprawdzenie (integrity_check, wersja ≥ 1),
 * migracje kopii, odczyt i walidacja jak plik kopii. Pakiet z nowszej wersji = „nowsza”. Katalog kopii znika zawsze.
 */
export async function kopiaZPakietu(pakiet: PakietPlikow): Promise<RozpoznanyPlik> {
  const cache = FileSystem.cacheDirectory;
  if (!cache) return pakietNieodczytany();
  const dir = `${cache}import-pakietu-${Date.now()}/`;
  let db: SQLite.SQLiteDatabase | null = null;
  try {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    await FileSystem.writeAsStringAsync(`${dir}${NAZWA_KOPII}`, pakiet.db, { encoding: 'base64' });
    if (pakiet.wal) await FileSystem.writeAsStringAsync(`${dir}${NAZWA_KOPII}-wal`, pakiet.wal, { encoding: 'base64' });
    // expo-sqlite bierze katalog jako ścieżkę bez file:// (SQLiteModule.swift, defaultDatabaseDirectory)
    const katalog = decodeURI(dir.replace(/^file:\/\//, '')).replace(/\/$/, '');
    db = await SQLite.openDatabaseAsync(NAZWA_KOPII, { useNewConnection: true }, katalog);
    const integralnosc = await db.getAllAsync<{ integrity_check: string }>('PRAGMA integrity_check;');
    if (integralnosc.length !== 1 || integralnosc[0].integrity_check !== 'ok') return pakietNieodczytany();
    // Pusta albo obca baza (user_version 0): migracje założyłyby puste tabele, a import skasowałby dane
    const wersja = (await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;'))?.user_version ?? 0;
    if (wersja < 1) return pakietNieodczytany();
    await applySchemaMigrations(db);
    const stan = await zbierzDaneZBazy(db);
    const kopia = parseAndValidateBackup(JSON.stringify({ ...buildBackup(stan), exportedAt: pakiet.utworzono }));
    return { rodzaj: 'kopia', kopia };
  } catch (e) {
    return e instanceof Error && e.name === 'NewerDatabaseError' ? { rodzaj: 'nowsza' } : pakietNieodczytany();
  } finally {
    await db?.closeAsync().catch(() => undefined);
    await FileSystem.deleteAsync(dir, { idempotent: true }).catch(() => undefined);
  }
}
