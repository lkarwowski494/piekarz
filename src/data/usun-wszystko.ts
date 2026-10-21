// ============================================================================
// Piekarz — „Usuń wszystkie dane” (F-65, BR-DANE-004) [M1-audytor-generalny-124; 03-zakres-502, 05-architekt-505]
// Najpierw obowiązkowa kopia piekarz-przed-czyszczeniem-* z pełnym stanem (z surowymi uszkodzonymi wierszami, 121);
// nieudana kopia nic nie usuwa. Potem jedna transakcja: historia, zakwasy z dziennikiem, receptury własne, spiżarnia,
// postęp lekcji i trwająca sesja. Zostają: ustawienia (język, jednostki), pamięć zakupu i kopie w Plikach (wybór P-124 a).
// ============================================================================

import { safetyBackup } from '../lib/backup';
import { collectBackupData, setActiveBake } from './sqlite-store';
import { getDb, memStore } from './sqlite-schema';
import { BAKE_SESSION_KEY } from './bake-session-store';
import { StorageWriteError, writeOrThrow } from './storage-status';

export async function usunWszystkieDane(): Promise<void> {
  try {
    await safetyBackup('reset', await collectBackupData());
  } catch (e) {
    // Kopia się nie zapisała (np. brak miejsca): „Nie zapisano” i żadnego usunięcia
    throw e instanceof StorageWriteError ? e : new StorageWriteError(e);
  }
  const db = await getDb();
  if (db) {
    await writeOrThrow(() =>
      db.withTransactionAsync(async () => {
        await db.execAsync('DELETE FROM bakes;');
        await db.execAsync('DELETE FROM starter_entries;');
        await db.execAsync('DELETE FROM starters;');
        await db.execAsync('DELETE FROM recipes WHERE is_built_in = 0;');
        await db.execAsync('DELETE FROM flour_inventory;');
        await db.execAsync('DELETE FROM lesson_progress;');
        await db.runAsync("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, '');", BAKE_SESSION_KEY);
      })
    );
  }
  // Pamięć dopiero po zatwierdzeniu transakcji
  memStore.logs = [];
  memStore.starters = [];
  memStore.starterEntries = [];
  memStore.recipes = memStore.recipes.filter((r) => r.isBuiltIn);
  memStore.flourInventory = [];
  memStore.completedLessons = [];
  memStore.settings[BAKE_SESSION_KEY] = '';
  setActiveBake(null);
}
