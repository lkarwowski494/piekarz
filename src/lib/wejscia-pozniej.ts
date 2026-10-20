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
  | 'qr' // F-08: skan i udostępnianie kodu QR poza 1.0, bez zgody na aparat (D-043) [M1-audytor-generalny-049]
  | 'rodzina-apps4craft' // F-52 (ZM-14)
  | 'spizarnia' // F-30: spiżarnia mąk poza 1.0 (D-043); zapasy zostają w bazie i w kopii [M1-audytor-generalny-097]
  | 'przelicznik-objetosci'; // F-45: szklanki tylko jako przelicznik na gramy przy wpisywaniu, gdy F-45 wróci [M1-audytor-generalny-098]

/** Jedno miejsce decyzji: czy wejście do funkcji jest widoczne. */
export const WEJSCIA_WIDOCZNE: Readonly<Record<WejsciePozniej, boolean>> = {
  'slownik-mak': false,
  'odrzut-zakwasu': false,
  'strata-piecowa': false,
  'konwerter-zakwasu': false,
  druk: false,
  qr: false,
  'rodzina-apps4craft': false,
  spizarnia: false,
  'przelicznik-objetosci': false,
};

export function wejscieWidoczne(wejscie: WejsciePozniej): boolean {
  return WEJSCIA_WIDOCZNE[wejscie];
}
