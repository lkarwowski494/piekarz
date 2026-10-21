/**
 * Warunek systemowej prośby o ocenę (BR-OPIN-001; DEC-20 a, D-067 uchyla próg 4★ z D-042)
 * [M1-audytor-generalny-138; 11-wzrost-501, 11-wzrost-502; wcześniej M1-audytor-generalny-082].
 * Specyfikacja: docs/wzrost/petla-opinii.md §1.2; wektory: docs/wzrost/wektory-prosba-o-ocene.json.
 * Czysta funkcja: bez importów z React Native, czas i daty dostaje jako argumenty. Ocena bochenka nie wchodzi
 * do warunku: prośba po zadaniu (ukończony wypiek), nie po nastroju (App Review 5.6.1: „filtered … feedback”).
 */
export const PROSBA_O_OCENE = {
  minWypiekow: 3, // D-067 (DEC-20 a): od 3. ukończonego wypieku
  minOdstepDni: 14, // D-067 (DEC-20 a); HIG Ratings and reviews: „at least a week or two between requests”
  maksProsbWOknie: 3, // S-63: „a maximum of three times within a 365-day period”
  oknoDni: 365, // S-63
} as const;

export interface WarunekProsby {
  /** Liczba ukończonych wypieków w dzienniku, z właśnie zapisanym. */
  zakonczoneWypieki: number;
  /** Daty poprzednich wywołań requestReview() w ms od epoki (NaN = uszkodzony zapis). */
  datyPoprzednichProsb: readonly number[];
  teraz: number;
}

const MS_DOBY = 86_400_000;

export function czyProsicOOcene(we: WarunekProsby): boolean {
  if (!Number.isInteger(we.zakonczoneWypieki) || we.zakonczoneWypieki < PROSBA_O_OCENE.minWypiekow) return false;
  const granica = we.teraz - PROSBA_O_OCENE.oknoDni * MS_DOBY;
  // Data w przyszłości i uszkodzony zapis liczą się do limitu: przy wątpliwości nie prosimy.
  const wOknie = we.datyPoprzednichProsb.filter((d) => !Number.isFinite(d) || d > granica).length;
  if (wOknie >= PROSBA_O_OCENE.maksProsbWOknie) return false;
  // Odstęp: prośba młodsza niż minOdstepDni (także data w przyszłości) wstrzymuje następną.
  const odstep = we.teraz - PROSBA_O_OCENE.minOdstepDni * MS_DOBY;
  return !we.datyPoprzednichProsb.some((d) => Number.isFinite(d) && d > odstep);
}
