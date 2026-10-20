/**
 * Warunek systemowej prośby o ocenę (BR-OPIN-001, DEC-13 a) [M1-audytor-generalny-082; 11-wzrost-004].
 * Specyfikacja: docs/wzrost/petla-opinii.md §1.2; wektory: docs/wzrost/wektory-prosba-o-ocene.json.
 * Czysta funkcja: bez importów z React Native, czas i daty dostaje jako argumenty.
 */
export const PROSBA_O_OCENE = {
  minOcenaGwiazdki: 4, // D-042: udany wypiek = co najmniej 4★
  maksProsbWOknie: 3, // S-63: „a maximum of three times within a 365-day period”
  oknoDni: 365, // S-63
} as const;

export interface WarunekProsby {
  /** Gwiazdki wybrane przez użytkownika; null, gdy nie dotknął gwiazdki w oknie zapisu. */
  ocenaWypieku: number | null;
  /** Daty poprzednich wywołań requestReview() w ms od epoki (NaN = uszkodzony zapis). */
  datyPoprzednichProsb: readonly number[];
  teraz: number;
}

const MS_DOBY = 86_400_000;

export function czyProsicOOcene(we: WarunekProsby): boolean {
  const ocena = we.ocenaWypieku;
  if (ocena === null || !Number.isInteger(ocena) || ocena < 1 || ocena > 5) return false;
  if (ocena < PROSBA_O_OCENE.minOcenaGwiazdki) return false;
  const granica = we.teraz - PROSBA_O_OCENE.oknoDni * MS_DOBY;
  // Data w przyszłości i uszkodzony zapis liczą się do limitu: przy wątpliwości nie prosimy.
  const wOknie = we.datyPoprzednichProsb.filter((d) => !Number.isFinite(d) || d > granica).length;
  return wOknie < PROSBA_O_OCENE.maksProsbWOknie;
}
