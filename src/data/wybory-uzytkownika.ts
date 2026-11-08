// ============================================================================
// Piekarz — wybory użytkownika w app_settings bez zmiany schematu (D-242, plan danych p9 §1) [M3 p9b]
// Z1 b: `wersje_receptur` = JSON {"<recipeId>":"drozdze"} (tylko odstępstwa od domyślnej wersji na zakwasie).
// Z4 a: `maszyna` = JSON dane maszyny z wersją formatu `v` (BR-MASZ-002, BR-MASZ-003, D-189).
// Odczyt z `unknown`: zły kształt = typowany błąd, brak = brak (prośba o dane, nie liczba domyślna). Oba klucze są
// na liście kopii (ustawienia-kopii.ts, D-250).
// ============================================================================

import { getAppSetting, setAppSetting } from './settings-store';
import { zachowajUszkodzony, zapisUszkodzonychLubBlad } from './uszkodzone-wiersze';
import { KLUCZ_MASZYNY, KLUCZ_WERSJI_RECEPTUR, parseMaszyna, parseWersjeReceptur, type DaneMaszyny, type WersjaWypieku, type WynikWyboru } from './wybory-parsery';

export * from './wybory-parsery';

/**
 * Wersja receptury przy otwarciu: zapamiętana albo domyślna „na zakwasie” (preferencja interfejsu). Nieczytelna mapa
 * też daje domyślną; jej surowa treść trafia do pliku ratunkowego przed nadpisaniem przy następnym wyborze.
 */
export async function wczytajWersjeReceptury(recipeId: string): Promise<WersjaWypieku> {
  const r = parseWersjeReceptur(await getAppSetting(KLUCZ_WERSJI_RECEPTUR));
  return r.ok ? r.value[recipeId] ?? 'zakwas' : 'zakwas';
}

/** Zapis wyboru: odstępstwo do mapy, „na zakwasie” usuwa wpis receptury; inne receptury bez zmian. */
export async function zapiszWersjeReceptury(recipeId: string, wersja: WersjaWypieku): Promise<void> {
  const surowe = await getAppSetting(KLUCZ_WERSJI_RECEPTUR);
  const r = parseWersjeReceptur(surowe);
  if (!r.ok && typeof surowe === 'string') {
    // Nieczytelna mapa przed nadpisaniem do pliku ratunkowego (121): bez cichej utraty zapisu
    zachowajUszkodzony({ tabela: 'app_settings', id: KLUCZ_WERSJI_RECEPTUR, surowe });
    await zapisUszkodzonychLubBlad();
  }
  const mapa: Record<string, WersjaWypieku> = r.ok ? { ...r.value } : {};
  if (wersja === 'drozdze') mapa[recipeId] = 'drozdze';
  else delete mapa[recipeId];
  await setAppSetting(KLUCZ_WERSJI_RECEPTUR, JSON.stringify(mapa));
}

export async function wczytajMaszyne(): Promise<WynikWyboru<DaneMaszyny | null>> {
  return parseMaszyna(await getAppSetting(KLUCZ_MASZYNY));
}

/** Zapis danych maszyny; nieczytelna poprzednia wartość najpierw do pliku ratunkowego (121), bez cichej utraty [M3 p9b2]. */
export async function zapiszMaszyne(m: DaneMaszyny): Promise<void> {
  const surowe = await getAppSetting(KLUCZ_MASZYNY);
  if (typeof surowe === 'string' && !parseMaszyna(surowe).ok) {
    zachowajUszkodzony({ tabela: 'app_settings', id: KLUCZ_MASZYNY, surowe });
    await zapisUszkodzonychLubBlad();
  }
  await setAppSetting(KLUCZ_MASZYNY, JSON.stringify(m));
}
