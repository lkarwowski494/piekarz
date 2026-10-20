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

/** Stopień przemiału słowami źródła: MAK-OGL-001 (nisko- i wysokowyciągowa), MAK-OGL-007 (razowa). */
export type PrzemialMaki = 'niskowyciągowa' | 'wysokowyciągowa' | 'razowa';

export interface OpisOgolnyMaki {
  /** Nazwa bez numeru typu (klucz słownika EN i przekładu): zboże, przemiał i białko, gdy mają źródło. */
  nazwaPl: string;
  /** Opis ogólny (klucz słownika EN); pusty, gdy profil nie ma ani białka, ani przemiału ze źródłem. */
  opisPl: string;
  /** Stopień przemiału z twierdzeniem; null = brak źródła (MAK-OGL-901 otwarte). */
  przemial: { stopien: PrzemialMaki; twierdzenia: readonly string[] } | null;
  /** Białko w badanych próbkach (%; najmniejsza i największa wartość z twierdzeń); null = brak źródła (MAK-OGL-900). */
  bialko: { odPct: number; doPct: number; twierdzenia: readonly string[] } | null;
  /** Twierdzenia potwierdzone, na których stoją nazwa i opis. */
  twierdzenia: readonly string[];
  /** Twierdzenia otwarte [DO USTALENIA] dla tego profilu. */
  otwarte: readonly string[];
}

const NISKO = { stopien: 'niskowyciągowa', twierdzenia: ['MAK-OGL-001'] } as const;
const WYSOKO = { stopien: 'wysokowyciągowa', twierdzenia: ['MAK-OGL-001'] } as const;
const B = (odPct: number, doPct: number, ...twierdzenia: string[]) => ({ odPct, doPct, twierdzenia });

/**
 * Nazwa i opis ogólny dla każdego profilu FLOUR_PROFILES (id bez zmian: receptury przechowują id).
 * Białko to wynik badanych próbek handlowych (jedna do trzech próbek na typ), nie wymaganie; opis to mówi.
 * Profile bez źródła białka i przemiału (wheat_1850, wheat_manitoba, rye_500, spelt_630) mają tylko zboże.
 */
export const OPIS_OGOLNY_MAK: Readonly<Record<string, OpisOgolnyMaki>> = {
  wheat_450: {
    nazwaPl: 'Mąka pszenna niskowyciągowa, białko 9,8%',
    opisPl: 'Mąka niskowyciągowa. Białko w badanej próbce: 9,8%.',
    przemial: NISKO, bialko: B(9.8, 9.8, 'MAK-OGL-002'),
    twierdzenia: ['MAK-TYP-004', 'MAK-OGL-001', 'MAK-OGL-002'], otwarte: [],
  },
  wheat_500: {
    nazwaPl: 'Mąka pszenna niskowyciągowa, białko 10,6–14,3%',
    opisPl: 'Mąka niskowyciągowa. Białko w badanych próbkach: 10,6–14,3%.',
    przemial: NISKO, bialko: B(10.6, 14.3, 'MAK-OGL-002', 'MAK-OGL-006'),
    twierdzenia: ['MAK-TYP-004', 'MAK-OGL-001', 'MAK-OGL-002', 'MAK-OGL-006'], otwarte: [],
  },
  wheat_650: {
    nazwaPl: 'Mąka pszenna niskowyciągowa, białko 10,2–13,8%',
    opisPl: 'Mąka niskowyciągowa. Białko w badanych próbkach: 10,2–13,8%.',
    przemial: NISKO, bialko: B(10.2, 13.8, 'MAK-OGL-002', 'MAK-OGL-003', 'MAK-OGL-006'),
    twierdzenia: ['MAK-TYP-004', 'MAK-OGL-001', 'MAK-OGL-002', 'MAK-OGL-003', 'MAK-OGL-006'], otwarte: [],
  },
  wheat_750: {
    nazwaPl: 'Mąka pszenna wysokowyciągowa, białko 12,4–15,5%',
    opisPl: 'Mąka wysokowyciągowa. Białko w badanych próbkach: 12,4–15,5%.',
    przemial: WYSOKO, bialko: B(12.4, 15.5, 'MAK-OGL-002', 'MAK-OGL-006'),
    twierdzenia: ['MAK-TYP-004', 'MAK-OGL-001', 'MAK-OGL-002', 'MAK-OGL-006'], otwarte: [],
  },
  wheat_850: {
    nazwaPl: 'Mąka pszenna wysokowyciągowa, białko 11,9%',
    opisPl: 'Mąka wysokowyciągowa. Białko w badanej próbce: 11,9%.',
    przemial: WYSOKO, bialko: B(11.9, 11.9, 'MAK-OGL-002'),
    twierdzenia: ['MAK-TYP-004', 'MAK-OGL-001', 'MAK-OGL-002'], otwarte: [],
  },
  // Typ 1050 bez potwierdzenia w obrocie (MAK-TYP-902), ale zbadany jako mąka handlowa (MAK-OGL-001, MAK-OGL-002).
  wheat_1050: {
    nazwaPl: 'Mąka pszenna wysokowyciągowa, białko 13,1%',
    opisPl: 'Mąka wysokowyciągowa. Białko w badanej próbce: 13,1%.',
    przemial: WYSOKO, bialko: B(13.1, 13.1, 'MAK-OGL-002'),
    twierdzenia: ['MAK-OGL-001', 'MAK-OGL-002'], otwarte: ['MAK-TYP-902'],
  },
  wheat_1850: {
    nazwaPl: 'Mąka pszenna', opisPl: '', przemial: null, bialko: null,
    twierdzenia: ['MAK-TYP-004'], otwarte: ['MAK-OGL-900', 'MAK-OGL-901'],
  },
  wheat_2000: {
    nazwaPl: 'Mąka pszenna razowa, białko 8,7–9,6%',
    opisPl: 'Mąka razowa. Białko w badanych próbkach: 8,7–9,6%. Popiół według polskich norm: najwyżej 2%.',
    przemial: { stopien: 'razowa', twierdzenia: ['MAK-OGL-007'] }, bialko: B(8.7, 9.6, 'MAK-OGL-003'),
    twierdzenia: ['MAK-OGL-003', 'MAK-OGL-004', 'MAK-OGL-007'], otwarte: ['MAK-TYP-902'],
  },
  rye_720: {
    nazwaPl: 'Mąka żytnia, białko 6,3%',
    opisPl: 'Białko w badanej próbce: 6,3%. Popiół według polskich norm: 0,59–0,78%.',
    przemial: null, bialko: B(6.3, 6.3, 'MAK-OGL-003'),
    twierdzenia: ['MAK-TYP-004', 'MAK-OGL-003', 'MAK-OGL-004'], otwarte: ['MAK-OGL-901'],
  },
  rye_2000: {
    nazwaPl: 'Mąka żytnia, białko 8,4%',
    opisPl: 'Białko w badanej próbce: 8,4%. Popiół według polskich norm: najwyżej 2%.',
    przemial: null, bialko: B(8.4, 8.4, 'MAK-OGL-003'),
    twierdzenia: ['MAK-TYP-004', 'MAK-OGL-003', 'MAK-OGL-004'], otwarte: ['MAK-OGL-901'],
  },
  // Manitoba to nazwa stylu, nie polski typ; liczba W z nazwy profilu bez źródła (p4-002), więc jej nie ma.
  wheat_manitoba: {
    nazwaPl: 'Mąka pszenna Manitoba', opisPl: '', przemial: null, bialko: null,
    twierdzenia: [], otwarte: ['MAK-OGL-900', 'MAK-OGL-901'],
  },
  spelt_630: {
    nazwaPl: 'Mąka orkiszowa', opisPl: '', przemial: null, bialko: null,
    twierdzenia: [], otwarte: ['MAK-OGL-900', 'MAK-OGL-901', 'MAK-TYP-902'],
  },
  spelt_2000: {
    nazwaPl: 'Mąka orkiszowa, białko 12,6%',
    opisPl: 'Białko w badanej próbce: 12,6%. Popiół według polskich norm: najwyżej 2%.',
    przemial: null, bialko: B(12.6, 12.6, 'MAK-OGL-003'),
    twierdzenia: ['MAK-OGL-003', 'MAK-OGL-004'], otwarte: ['MAK-OGL-901', 'MAK-TYP-902'],
  },
  wheat_405: {
    nazwaPl: 'Mąka pszenna, białko 13,8%',
    opisPl: 'Białko w badanej próbce: 13,8%.',
    przemial: null, bialko: B(13.8, 13.8, 'MAK-OGL-006'),
    twierdzenia: ['MAK-TYP-004', 'MAK-OGL-006'], otwarte: ['MAK-OGL-901'],
  },
  wheat_550: {
    nazwaPl: 'Mąka pszenna niskowyciągowa, białko 7,8–14,8%',
    opisPl: 'Mąka niskowyciągowa. Białko w badanych próbkach: 7,8–14,8%. Popiół według polskich norm: 0,51–0,58%.',
    przemial: NISKO, bialko: B(7.8, 14.8, 'MAK-OGL-002', 'MAK-OGL-003', 'MAK-OGL-006'),
    twierdzenia: ['MAK-TYP-004', 'MAK-OGL-001', 'MAK-OGL-002', 'MAK-OGL-003', 'MAK-OGL-004', 'MAK-OGL-006'], otwarte: [],
  },
  rye_500: {
    nazwaPl: 'Mąka żytnia', opisPl: '', przemial: null, bialko: null,
    twierdzenia: ['MAK-TYP-004'], otwarte: ['MAK-OGL-900', 'MAK-OGL-901'],
  },
  rye_1400: {
    nazwaPl: 'Mąka żytnia, białko 8,1%',
    opisPl: 'Białko w badanej próbce: 8,1%. Popiół według polskich norm: 1,31–1,60%.',
    przemial: null, bialko: B(8.1, 8.1, 'MAK-OGL-003'),
    twierdzenia: ['MAK-TYP-005', 'MAK-OGL-003', 'MAK-OGL-004'], otwarte: ['MAK-OGL-901'],
  },
};
