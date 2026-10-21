// ============================================================================
// Piekarz — jedno źródło oferty (MON-12) [M1-audytor-generalny-008; 02-monetyzacja-001]
// Identyfikatory produktów App Store. Ceny, regiony i okresy próbne ustawia właściciel
// w App Store Connect; aplikacja pokazuje je z produktu StoreKit (displayPrice), nigdy z kodu.
// ============================================================================

/** Plan zakupu: subskrypcja miesięczna i roczna (jedna grupa) albo zakup dożywotni (Non-Consumable). */
export type Plan = 'monthly' | 'yearly' | 'lifetime';

export const PRODUKTY: Readonly<Record<Plan, string>> = {
  monthly: 'com.apps4brew.baker.pro.monthly',
  yearly: 'com.apps4brew.baker.pro.yearly',
  lifetime: 'com.apps4brew.baker.pro.lifetime',
};

/** Kolejność planów na ekranie zakupu. */
export const PLANY: readonly Plan[] = ['yearly', 'monthly', 'lifetime'];

/** Subskrypcje odnawiane automatycznie (jedna grupa w App Store Connect). */
export const SUBSKRYPCJE: readonly string[] = [PRODUKTY.monthly, PRODUKTY.yearly];

/** Produkty, które odblokowują pełny dostęp. */
export const ODBLOKOWUJA: readonly string[] = [PRODUKTY.monthly, PRODUKTY.yearly, PRODUKTY.lifetime];

/** Funkcje aplikacji, o których decyduje strażnik dostępu [M1-audytor-generalny-027]. */
export type Funkcja =
  | 'historia'
  | 'dane'
  | 'kalkulator'
  | 'zakwas'
  | 'stolnica'
  | 'harmonogram'
  | 'doktor'
  | 'spizarnia'
  | 'receptury'
  | 'import'
  | 'udostepnianie';

/**
 * Jedyna lista funkcji dostępnych bez subskrypcji, oferty wprowadzającej i zakupu dożywotniego
 * (decyzja właściciela 2026-10-19, DEC-01.podzial). „dane” = odczyt, eksport i usunięcie własnych danych.
 * „import” = import kopii i receptury z pliku danych, zawsze, także po okresie próbnym bez zakupu (D-039)
 * [M1-audytor-generalny-026].
 */
export const BEZ_UPRAWNIENIA: readonly Funkcja[] = ['historia', 'dane', 'import'];

/** Klucz w app_settings: pamięć ostatniego udanego odczytu sklepu (nie jest w kopii zapasowej). */
export const KLUCZ_PAMIECI = 'platnosci_pamiec';
/**
 * Klucz w app_settings: „1”, gdy sklep choć raz dał dostęp (próba, subskrypcja, zakup) na tym telefonie. Baner
 * „tylko historia” mówi o końcu próby tylko wtedy [M1-audytor-generalny-143; 02-monetyzacja-504].
 */
export const KLUCZ_HISTORII_DOSTEPU = 'platnosci_byl_dostep';

export function planProduktu(id: string): Plan | null {
  const plan = (Object.keys(PRODUKTY) as Plan[]).find((p) => PRODUKTY[p] === id);
  return plan ?? null;
}
