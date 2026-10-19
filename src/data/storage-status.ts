/**
 * Stan magazynu danych i typowany błąd zapisu [M1-audytor-generalny-003].
 * Gdy bazy nie da się otworzyć, aplikacja nie udaje pracy na danych użytkownika: stan „unavailable”
 * pokazuje ekran błędu (StorageGate), a zapisy rzucają StorageWriteError zamiast połykać błąd.
 */
export type StorageState = 'ok' | 'unavailable';

export class StorageWriteError extends Error {
  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause));
    this.name = 'StorageWriteError';
  }
}

let state: StorageState = 'ok';
let lastError: string | null = null;
const listeners = new Set<(s: StorageState) => void>();

export function getStorageState(): StorageState {
  return state;
}

export function getStorageError(): string | null {
  return lastError;
}

export function markStorageUnavailable(message: string): void {
  state = 'unavailable';
  lastError = message;
  listeners.forEach((fn) => fn(state));
}

export function resetStorageState(): void {
  state = 'ok';
  lastError = null;
  listeners.forEach((fn) => fn(state));
}

export function subscribeStorageState(fn: (s: StorageState) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Wykonuje zapis do bazy; błąd SQLite zamienia na StorageWriteError (ekran pokazuje komunikat). */
export async function writeOrThrow<T>(op: () => Promise<T>): Promise<T> {
  try {
    return await op();
  } catch (e) {
    throw new StorageWriteError(e);
  }
}
