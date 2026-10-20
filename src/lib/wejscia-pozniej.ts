// ============================================================================
// Piekarz — wejścia funkcji z etapu PÓŹNIEJ (D-034; ZM-08, ZM-14) [M1-audytor-generalny-032]
// Ukryte jest tylko wejście z interfejsu: kod, testy modułów i dane użytkownika zostają.
// Powrót funkcji: BR z dowodem od roli 01 i nowy wpis ZM, potem `true` tutaj.
// ============================================================================

/** Funkcje PÓŹNIEJ z kodem w aplikacji (docs/scope-contract.md). */
export type WejsciePozniej =
  | 'slownik-mak' // F-46
  | 'odrzut-zakwasu' // F-47
  | 'strata-piecowa' // F-48
  | 'konwerter-zakwasu' // F-49
  | 'druk' // F-50: karta PDF i etykieta słoika poza 1.0 (D-043) [M1-audytor-generalny-072]
  | 'rodzina-apps4craft'; // F-52 (ZM-14)

/** Jedno miejsce decyzji: czy wejście do funkcji jest widoczne. */
export const WEJSCIA_WIDOCZNE: Readonly<Record<WejsciePozniej, boolean>> = {
  'slownik-mak': false,
  'odrzut-zakwasu': false,
  'strata-piecowa': false,
  'konwerter-zakwasu': false,
  druk: false,
  'rodzina-apps4craft': false,
};

export function wejscieWidoczne(wejscie: WejsciePozniej): boolean {
  return WEJSCIA_WIDOCZNE[wejscie];
}
