import * as FileSystem from 'expo-file-system/legacy';

/**
 * Strażnik startu [M1-audytor-generalny-018]: licznik startów, które nie doszły do kamienia milowego.
 * Zapis w pliku, nie w bazie — to baza może być przyczyną awarii. Po dwóch nieudanych startach z rzędu
 * kolejny start otwiera tryb awaryjny (eksport danych bez migracji).
 */
export const STARTUP_FAILURES_FOR_RESCUE = 2;
/** Czas bez awarii po starcie bazy, po którym start uznajemy za udany. */
export const STARTUP_MILESTONE_MS = 5000;

const guardPath = (): string | null =>
  FileSystem.documentDirectory ? `${FileSystem.documentDirectory}.piekarz/start-guard.json` : null;

async function readFailures(): Promise<number> {
  const path = guardPath();
  if (!path) return 0;
  try {
    if (!(await FileSystem.getInfoAsync(path)).exists) return 0;
    const parsed: unknown = JSON.parse(await FileSystem.readAsStringAsync(path));
    const n = typeof parsed === 'object' && parsed !== null ? Reflect.get(parsed, 'failedStarts') : undefined;
    return typeof n === 'number' && Number.isInteger(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

async function writeFailures(n: number): Promise<void> {
  const path = guardPath();
  if (!path) return;
  try {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}.piekarz/`, { intermediates: true });
    await FileSystem.writeAsStringAsync(path, JSON.stringify({ failedStarts: n }));
  } catch {
    // Strażnik nie może sam zablokować startu
  }
}

/** Wywołaj na początku startu: zapisuje start jako niedokończony i mówi, czy otworzyć tryb awaryjny. */
export async function beginStartup(): Promise<{ rescue: boolean }> {
  const previous = await readFailures();
  await writeFailures(previous + 1);
  return { rescue: previous >= STARTUP_FAILURES_FOR_RESCUE };
}

/** Wywołaj po kamieniu milowym (baza gotowa i aplikacja działa STARTUP_MILESTONE_MS). */
export async function markStartupSucceeded(): Promise<void> {
  await writeFailures(0);
}
