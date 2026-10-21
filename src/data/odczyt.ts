import { markStorageUnavailable } from './storage-status';

/**
 * Błąd odczytu z otwartej bazy: ekran błędu (StorageGate) i pusta lista zamiast danych z pamięci,
 * które wyglądałyby jak dane użytkownika [M1-audytor-generalny-003; 12-niezawodnosc-508].
 */
export function odczytNieudany<T>(e: unknown): T[] {
  markStorageUnavailable(e instanceof Error ? e.message : String(e));
  return [];
}
