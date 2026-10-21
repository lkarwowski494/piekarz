import { markStorageUnavailable } from './storage-status';
import { ratunekPoBledzie } from './sqlite-schema';

/** Uszkodzony plik bazy (SQLITE_CORRUPT / SQLITE_NOTADB), nie np. brak tabeli. */
const USZKODZENIE = /malformed|not a database|SQLITE_CORRUPT|SQLITE_NOTADB/i;
let ratunekWTymUruchomieniu = false;

/**
 * Błąd odczytu z otwartej bazy: ekran błędu (StorageGate) i pusta lista zamiast danych z pamięci,
 * które wyglądałyby jak dane użytkownika [M1-audytor-generalny-003; 12-niezawodnosc-508].
 * Uszkodzona strona tabeli przy dobrym nagłówku: ten sam ratunek co błąd otwarcia (surowe kopie, plik
 * ratunkowy, pakiet do udostępnienia), raz na uruchomienie [M1-audytor-generalny-187; 12-niezawodnosc-601].
 */
export function odczytNieudany<T>(e: unknown): T[] {
  const msg = e instanceof Error ? e.message : String(e);
  markStorageUnavailable(msg);
  if (USZKODZENIE.test(msg) && !ratunekWTymUruchomieniu) {
    ratunekWTymUruchomieniu = true;
    void ratunekPoBledzie(msg).catch(() => undefined);
  }
  return [];
}
