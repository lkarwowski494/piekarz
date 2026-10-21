/**
 * Stan magazynu danych i typowany błąd zapisu [M1-audytor-generalny-003].
 * Gdy bazy nie da się otworzyć, aplikacja nie udaje pracy na danych użytkownika: stan „unavailable”
 * pokazuje ekran błędu (StorageGate), a zapisy rzucają StorageWriteError zamiast połykać błąd.
 * Stan „newer”: bazę zapisała nowsza wersja aplikacji; odczyt działa, każdy zapis rzuca
 * StorageReadOnlyError, żeby starszy build nie zmienił danych nowszego [M1-audytor-generalny-061].
 */
export type StorageState = 'initializing' | 'ok' | 'unavailable' | 'newer';

export class StorageWriteError extends Error {
  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause));
    this.name = 'StorageWriteError';
  }
}

/** Zapis odrzucony, bo baza jest nowsza niż aplikacja (tryb tylko do odczytu). */
export class StorageReadOnlyError extends StorageWriteError {
  constructor(message = 'Database is newer than the app: read-only') {
    super(message);
    this.name = 'StorageReadOnlyError';
  }
}

// Do końca initDatabase (kopia, migracje) ekrany nie czytają bazy: StorageGate czeka [M1-audytor-generalny-003; 05-architekt-502]
let state: StorageState = 'initializing';
let lastError: string | null = null;
let rescueFile: string | null = null;
const listeners = new Set<(s: StorageState) => void>();

export function getStorageState(): StorageState {
  return state;
}

export function getStorageError(): string | null {
  return lastError;
}

/** Plik kopii bazy sprzed nieudanej migracji, który użytkownik może udostępnić [M1-audytor-generalny-004]. */
export function getRescueFile(): string | null {
  return rescueFile;
}

/**
 * Rodzaj pliku do udostępnienia: kopia SQLite sprzed migracji (004) albo komplet surowych plików bazy
 * w jednym pliku JSON po błędzie odczytu uszkodzonej bazy [M1-audytor-generalny-122].
 */
export type RescueKind = 'przed-migracja' | 'pliki-bazy';
let rescueKind: RescueKind = 'przed-migracja';

export function getRescueKind(): RescueKind {
  return rescueKind;
}

export function markStorageUnavailable(message: string, rescue: string | null = null, kind: RescueKind = 'przed-migracja'): void {
  state = 'unavailable';
  lastError = message;
  rescueFile = rescue;
  rescueKind = kind;
  listeners.forEach((fn) => fn(state));
}

/** Koniec initDatabase bez błędu: ekrany mogą czytać bazę (stan błędu albo „newer” zostaje). */
export function markStorageReady(): void {
  if (state !== 'initializing') return;
  state = 'ok';
  listeners.forEach((fn) => fn(state));
}

/** Błąd odczytu z otwartej bazy: ekran błędu zamiast danych z pamięci [M1-audytor-generalny-003]. */
export class StorageReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageReadError';
  }
}

/** Baza w wersji wyższej niż znana aplikacji: tylko odczyt [M1-audytor-generalny-061]. */
export function markStorageNewer(dbVersion: number, appVersion: number): void {
  state = 'newer';
  lastError = `Database version ${dbVersion} is newer than the app (${appVersion})`;
  rescueFile = null;
  listeners.forEach((fn) => fn(state));
}

/** Rzuca StorageReadOnlyError w trybie tylko do odczytu; dla zapisów, które same połykają błędy. */
export function assertWritable(): void {
  if (state === 'newer') throw new StorageReadOnlyError(lastError ?? undefined);
}

export function resetStorageState(): void {
  state = 'ok';
  lastError = null;
  rescueFile = null;
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
  assertWritable();
  try {
    return await op();
  } catch (e) {
    throw new StorageWriteError(e);
  }
}
