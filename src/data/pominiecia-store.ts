// ============================================================================
// Piekarz — zapis decyzji „Pomiń” w app_settings (BR-KAL-007, D-094) [M3 D4a]
// Jeden klucz JSON w istniejącej tabeli ustawień: bez zmiany schematu (PRAGMA user_version bez zmian), poza kopią
// zapasową (klucza nie ma w KLUCZE_USTAWIEN_KOPII), czyszczony przez „Usuń wszystkie dane”.
// ============================================================================

import { dodajPominiecie, oczyscPominiecia, parsujPominiecia, type Pominiecie } from '../core/pominiecia';
import { getAppSetting, setAppSetting } from './settings-store';

/** Klucz app_settings z listą pominięć (JSON). */
export const KLUCZ_POMINIEC = 'kalendarz_pominiecia';

/** Pominięcia z bazy bez wpisów starszych niż 14 dni; nieczytelny zapis → pusta lista. */
export async function wczytajPominiecia(now: number): Promise<Pominiecie[]> {
  return oczyscPominiecia(parsujPominiecia(await getAppSetting(KLUCZ_POMINIEC)), now);
}

/** Zapis decyzji „Pomiń” (z czyszczeniem starych); błąd zapisu to StorageWriteError („Nie zapisano”). */
export async function zapiszPominiecie(zdarzenie: string, now: number): Promise<void> {
  const lista = dodajPominiecie(parsujPominiecia(await getAppSetting(KLUCZ_POMINIEC)), { zdarzenie, at: now }, now);
  await setAppSetting(KLUCZ_POMINIEC, JSON.stringify(lista));
}
