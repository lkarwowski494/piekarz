// ============================================================================
// Piekarz — sprawdzenie kopii ratunkowej bazy przed udostępnieniem [M1-audytor-generalny-033; 12-niezawodnosc-004,
// wariant a: import pakietu w aplikacji, DEC-17 a]. Sprawdzana kopia zostaje nietknięta: .db i -wal trafiają do kopii
// roboczej w Caches (otwarcie i zamknięcie robi checkpoint i kasuje -wal — przegląd ścieżki wrażliwej 033), tam
// `PRAGMA integrity_check` („ok” przy zdrowej bazie, sqlite.org/pragma.html) i wersja schematu, potem kopia robocza znika.
// ============================================================================

import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';

const NAZWA = 'sprawdzenie-kopii.db';

/** ok = integralna baza Piekarza; pusta = integralna bez schematu (user_version 0); bledy = uszkodzona albo nie baza. */
export type WynikSprawdzenia = 'ok' | 'pusta' | 'bledy' | 'nie-sprawdzono';

const USZKODZENIE = /malformed|not a database|corrupt|disk image|SQLITE_(CORRUPT|NOTADB)/i;

export async function sprawdzKopieBazy(uriKopii: string): Promise<WynikSprawdzenia> {
  const cache = FileSystem.cacheDirectory;
  if (!cache || !uriKopii.includes('/')) return 'nie-sprawdzono';
  const zrodlo = uriKopii.startsWith('file://') ? uriKopii : `file://${uriKopii}`;
  const dir = `${cache}sprawdzenie-kopii-${Date.now()}/`;
  let db: SQLite.SQLiteDatabase | null = null;
  try {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    await FileSystem.copyAsync({ from: zrodlo, to: `${dir}${NAZWA}` });
    if ((await FileSystem.getInfoAsync(`${zrodlo}-wal`)).exists) await FileSystem.copyAsync({ from: `${zrodlo}-wal`, to: `${dir}${NAZWA}-wal` });
    // expo-sqlite bierze katalog jako ścieżkę bez file:// (jak import-pakietu.ts)
    db = await SQLite.openDatabaseAsync(NAZWA, { useNewConnection: true }, decodeURI(dir.replace(/^file:\/\//, '')).replace(/\/$/, ''));
    const wynik = await db.getAllAsync<{ integrity_check: string }>('PRAGMA integrity_check;');
    if (wynik.length !== 1 || wynik[0].integrity_check !== 'ok') return 'bledy';
    const wersja = (await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;'))?.user_version ?? 0;
    return wersja >= 1 ? 'ok' : 'pusta';
  } catch (e) {
    return USZKODZENIE.test(e instanceof Error ? e.message : String(e)) ? 'bledy' : 'nie-sprawdzono';
  } finally {
    await db?.closeAsync().catch(() => undefined);
    await FileSystem.deleteAsync(dir, { idempotent: true }).catch(() => undefined);
  }
}
