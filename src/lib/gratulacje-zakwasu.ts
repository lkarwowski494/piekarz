// ============================================================================
// Piekarz — gratulacje po zakończeniu zakładania pierwszego zakwasu, raz (kontrakt docs/monetyzacja.md BR-ZAKW-005,
// W-10; D-113: „gratulacje twój pierwszy zakwas jest gotowy”) [M3 P-b, D-117]. Znacznik w app_settings: komunikat
// widzi się przy pierwszym zakończonym zakładaniu; kolejne zakwasy (Pro) i ponowne zakładanie już go nie pokazują.
// Nieudany odczyt pokazuje gratulacje (mniejsza szkoda niż ich brak); nieudany zapis może pokazać je jeszcze raz.
// ============================================================================

import { getAppSetting, setAppSetting } from '../data/settings-store';

/** app_settings: „1”, gdy gratulacje po pierwszym zakwasie już pokazano. */
export const KLUCZ_GRATULACJI = 'gratulacje_pierwszego_zakwasu';

/** Czy pokazać gratulacje teraz; przy „tak” zapisuje, że pokazano. */
export async function pierwszeGratulacje(): Promise<boolean> {
  if ((await getAppSetting(KLUCZ_GRATULACJI).catch(() => null)) === '1') return false;
  await setAppSetting(KLUCZ_GRATULACJI, '1').catch(() => undefined);
  return true;
}
