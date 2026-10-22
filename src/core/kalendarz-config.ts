// ============================================================================
// Piekarz — liczby konfiguracyjne kalendarza 1.0 w jednym miejscu (BR-KAL-003, BR-KAL-004, BR-KAL-007) [M3 D4a]
// ============================================================================

/** Linia „Następne”: najwyżej 3 pozycje przyszłe; „Zaległe” ponad limit, reszta pod „+N” (D-094, OP-59, RD-32). */
export const LIMIT_NASTEPNE = 3;

/** Arkusz najbliższych zdarzeń z „+N”: 7 kolejnych dni (BR-KAL-004 „Arkusz najbliższych z +N”). */
export const NAJBLIZSZE_DNI = 7;

/**
 * Plan wypieku: ostatni dzień „gotowe” do wyboru (0 = dziś) i zasięg skrótu „Zaplanuj wypiek na ten dzień”: 14 dni
 * = bieżący i następny tydzień paska (BR-KAL-008), bez liczby z dziedziny (BRD jej nie podaje; D-108, do potwierdzenia).
 */
export const ZASIEG_DNI_PLANU = 14;

/** Decyzje „Pomiń” starsze niż 14 dni są czyszczone przy zapisie (STOP 3 M3, Aktualizacja 4; BR-KAL-007). */
export const POMINIECIA_TRZYMAJ_DNI = 14;
