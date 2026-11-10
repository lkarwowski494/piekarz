// ============================================================================
// Piekarz — stan kopii zapasowej z podanego połączenia [M1-audytor-generalny-003; 12-niezawodnosc-001]
// Osobna baza z pakietu plików bazy (tryb awaryjny) czytana tymi samymi czytelnikami co baza aplikacji, żeby import
// pakietu szedł istniejącą ścieżką kopii (parseAndValidateBackup, restoreFromBackupData). Błąd odczytu leci dalej:
// wywołujący odrzuca pakiet bez zmian w danych aplikacji.
// Trwające i zaplanowane wypieki (bake_sessions) jadą w polu `bakeSessions` jak w kopii przed czyszczeniem (023), a import
// dopisuje je z limitami i „telefon wygrywa” [M1-audytor-generalny-087; 12-niezawodnosc-601]. Jedyny wywołujący to import
// pakietu; eksport i kopie (collectBackupData) pola nie mają (D-102 bez zmian).
// ============================================================================

import type * as SQLite from 'expo-sqlite';
import type { PiekarzBackupData } from '../lib/backup';
import { readStarters } from './sqlite-store';
import { czytajReceptury } from './recipes-store';
import { czytajMaki } from './flour-store';
import { czytajWpisyZakwasow } from './starter-entries-store';
import { czytajUstawieniaILekcje } from './ustawienia-kopii';
import { czytajWpisy } from './wpisy-wypiekow';
import { czytajSesjeDoKopii } from './sesje-kopii';

/** Pełny stan do kopii z bazy pod `db` (bez receptur wbudowanych): collectBackupData dla bazy aplikacji plus sesje wypieków. */
export async function zbierzDaneZBazy(db: SQLite.SQLiteDatabase): Promise<PiekarzBackupData> {
  const bakes = await czytajWpisy(db);
  const starters = await readStarters(db);
  const receptury = (await czytajReceptury(db)) ?? [];
  const starterEntries = await czytajWpisyZakwasow(db);
  const flourInventory = await czytajMaki(db);
  const { settings, lessonProgress } = await czytajUstawieniaILekcje(db);
  const bakeSessions = await czytajSesjeDoKopii(db);
  return { bakes, starters, customRecipes: receptury.filter((r) => !r.isBuiltIn), starterEntries, flourInventory, settings, lessonProgress, bakeSessions };
}
