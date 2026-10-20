// ============================================================================
// Piekarz — atlas mąk: mapa typów per język i nazwy ogólne profili [M1-audytor-generalny-094]
// DEC-06 b (35 języków); decyzja przekładu właściciela 2026-10-20 „Bez numeru”: w językach bez
// sprawdzonej mapy typów nazwa i opis ogólny bez polskiego numeru typu i bez nazw lokalnych typów.
// Teksty: docs/tresci/pl/maki-ogolne.md i docs/tresci/en/maki-ogolne.md (rola 06), EN w słowniku EN.
// Dane, nie wyświetlanie: wybór tekstu według języka należy do roli 08 (przekazanie pod tym samym ID).
// ============================================================================

/**
 * Języki ze sprawdzoną mapą polskich typów mąki: kod → twierdzenia z docs/tresci/rejestr.json.
 * Tylko polski: typy w obrocie (MAK-TYP-004, MAK-TYP-005) i ich podstawa w normach (MAK-TYP-001, MAK-TYP-002).
 * Mapa na oznaczenia innych krajów (FR, IT, DE, USA) nie ma źródła: MAK-EN-900 otwarte.
 */
export const MAPA_TYPOW_MAK: Readonly<Record<string, readonly string[]>> = {
  pl: ['MAK-TYP-001', 'MAK-TYP-002', 'MAK-TYP-004', 'MAK-TYP-005'],
};

export type TrybAtlasuMak = 'mapa-typow' | 'opis-ogolny';

/** Tryb atlasu dla kodu języka: mapa typów tylko tam, gdzie jest w MAPA_TYPOW_MAK; reszta opis ogólny. */
export function trybAtlasuMak(kodJezyka: string): TrybAtlasuMak {
  return Object.prototype.hasOwnProperty.call(MAPA_TYPOW_MAK, kodJezyka) ? 'mapa-typow' : 'opis-ogolny';
}

export interface OpisOgolnyMaki {
  /** Nazwa bez numeru typu (klucz słownika EN i przekładu). */
  nazwaPl: string;
  /** Opis ogólny; pusty, dopóki białko i przemiał nie mają twierdzenia (MAK-OGL-900, MAK-OGL-901). */
  opisPl: string;
  /** Twierdzenia potwierdzone, na których stoi nazwa (zboże profilu z typem w obrocie). */
  twierdzenia: readonly string[];
  /** Twierdzenia otwarte [DO USTALENIA], przez które opis jest pusty. */
  otwarte: readonly string[];
}

const OTWARTE = ['MAK-OGL-900', 'MAK-OGL-901'] as const;
const PSZENNA_004: OpisOgolnyMaki = { nazwaPl: 'Mąka pszenna', opisPl: '', twierdzenia: ['MAK-TYP-004'], otwarte: OTWARTE };
const ZYTNIA_004: OpisOgolnyMaki = { nazwaPl: 'Mąka żytnia', opisPl: '', twierdzenia: ['MAK-TYP-004'], otwarte: OTWARTE };
// Profile bez typu potwierdzonego w obrocie (MAK-TYP-902 otwarte): nazwa = zboże z definicji profilu (pole grain).
const PSZENNA_902: OpisOgolnyMaki = { nazwaPl: 'Mąka pszenna', opisPl: '', twierdzenia: [], otwarte: [...OTWARTE, 'MAK-TYP-902'] };
const ORKISZOWA_902: OpisOgolnyMaki = { nazwaPl: 'Mąka orkiszowa', opisPl: '', twierdzenia: [], otwarte: [...OTWARTE, 'MAK-TYP-902'] };

/** Nazwa i opis ogólny dla każdego profilu FLOUR_PROFILES (id bez zmian: receptury przechowują id). */
export const OPIS_OGOLNY_MAK: Readonly<Record<string, OpisOgolnyMaki>> = {
  wheat_450: PSZENNA_004,
  wheat_500: PSZENNA_004,
  wheat_650: PSZENNA_004,
  wheat_750: PSZENNA_004,
  wheat_850: PSZENNA_004,
  wheat_1050: PSZENNA_902,
  wheat_1850: PSZENNA_004,
  wheat_2000: PSZENNA_902,
  rye_720: ZYTNIA_004,
  rye_2000: ZYTNIA_004,
  // Manitoba to nazwa stylu, nie polski typ; liczba W z nazwy profilu bez źródła (p4-002), więc jej nie ma.
  wheat_manitoba: { nazwaPl: 'Mąka pszenna Manitoba', opisPl: '', twierdzenia: [], otwarte: OTWARTE },
  spelt_630: ORKISZOWA_902,
  spelt_2000: ORKISZOWA_902,
  wheat_405: PSZENNA_004,
  wheat_550: PSZENNA_004,
  rye_500: ZYTNIA_004,
  rye_1400: { nazwaPl: 'Mąka żytnia', opisPl: '', twierdzenia: ['MAK-TYP-005'], otwarte: OTWARTE },
};
