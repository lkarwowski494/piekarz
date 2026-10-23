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

/**
 * Przesunięcie palcem w bok o co najmniej tyle punktów (i bardziej w bok niż w pionie) zmienia tydzień albo miesiąc
 * (BR-KAL-008, makieta roli 04 a2 `101-przewijanie`); reguła interfejsu, nie z dziedziny (D-114) [M3 D7].
 */
export const PROG_GESTU_PT = 40;

/**
 * Podpowiedź rytmu z historii (BR-KAL-014): z ostatnich OKNO_RYTMU wypieków co najmniej PROG_RYTMU kończy się tego
 * samego dnia tygodnia. Reguła aplikacji bez liczby z dziedziny (BRD: „ostatnie cztery wypieki”; D-114) [M3 D7].
 */
export const OKNO_RYTMU = 4;
export const PROG_RYTMU = 3;

/**
 * Stały dzień karmienia (BR-KAL-010): dostępny od 7 dni kalendarza po założeniu — dolna granica „7–10 dni od założenia”
 * z rejestru roli 06 (ZAK-ZAL-012), nie w trakcie zakładania (RD-31) [M3 D7].
 */
export const STALY_DZIEN_OD_DNI = 7;

/** Godzina stałego dnia przy pierwszym wyborze dnia (preferencja interfejsu, 10:00 jak w BRD; zmiana ±30 min) [M3 D7]. */
export const STALY_DZIEN_DOMYSLNA_MINUTA = 600;
