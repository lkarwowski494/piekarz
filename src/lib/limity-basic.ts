// ============================================================================
// Piekarz — liczba zapisanych rzeczy do limitów Basic (5 własnych receptur, 1 zakwas; kontrakt docs/monetyzacja.md,
// D-112, D-113, D-116). Cienka warstwa odczytu: liczy z bazy w chwili dodawania, decyzję podejmuje mozeDodac (dostep.ts).
// ============================================================================

import { getRecipes } from '../data/recipes-store';
import { getStarters } from '../data/sqlite-store';
import type { Pojemnosc } from './platnosci/konfiguracja';

/**
 * Liczba zapisanych rzeczy danego rodzaju; receptury bazowe się nie liczą. null = odczyt się nie udał: dodanie
 * nie jest wtedy blokowane (błąd aplikacji nie zamyka funkcji Basic).
 */
export async function liczbaZapisanych(rodzaj: Pojemnosc): Promise<number | null> {
  try {
    if (rodzaj === 'zakwasy') return (await getStarters()).length;
    return (await getRecipes()).filter((r) => !r.isBuiltIn).length;
  } catch {
    return null;
  }
}
