// ============================================================================
// Piekarz — sprawdzenie kopii ratunkowej bazy przed udostępnieniem [M1-audytor-generalny-033; 12-niezawodnosc-004,
// wariant a: import pakietu w aplikacji, DEC-17 a]. Otwiera KOPIĘ (nigdy bazy aplikacji) osobnym połączeniem i czyta
// `PRAGMA integrity_check` („ok” przy zdrowej bazie, sqlite.org/pragma.html) oraz wersję schematu.
// ============================================================================

import * as SQLite from 'expo-sqlite';

/** ok = integralna baza Piekarza; pusta = integralna bez schematu (user_version 0); bledy = uszkodzona albo nie baza. */
export type WynikSprawdzenia = 'ok' | 'pusta' | 'bledy' | 'nie-sprawdzono';

const USZKODZENIE = /malformed|not a database|corrupt|disk image|SQLITE_(CORRUPT|NOTADB)/i;

export async function sprawdzKopieBazy(uriKopii: string): Promise<WynikSprawdzenia> {
  const sciezka = decodeURI(uriKopii.replace(/^file:\/\//, ''));
  const i = sciezka.lastIndexOf('/');
  if (i <= 0) return 'nie-sprawdzono';
  let db: SQLite.SQLiteDatabase | null = null;
  try {
    db = await SQLite.openDatabaseAsync(sciezka.slice(i + 1), { useNewConnection: true }, sciezka.slice(0, i));
    const wynik = await db.getAllAsync<{ integrity_check: string }>('PRAGMA integrity_check;');
    if (wynik.length !== 1 || wynik[0].integrity_check !== 'ok') return 'bledy';
    const wersja = (await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;'))?.user_version ?? 0;
    return wersja >= 1 ? 'ok' : 'pusta';
  } catch (e) {
    return USZKODZENIE.test(e instanceof Error ? e.message : String(e)) ? 'bledy' : 'nie-sprawdzono';
  } finally {
    await db?.closeAsync().catch(() => undefined);
  }
}
