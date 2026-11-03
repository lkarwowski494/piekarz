// ============================================================================
// Piekarz — wspólny próg dużego tekstu dla systemu kart (design-spec §14, D-141) [M3 p1]
// fontScale ≥ 2 to ten sam próg co pas (PasZakladki), kafle „Dziś” i wiersz okresu kalendarza (AX3 i większe).
// Reguła roli 04 (zadanie 04-fix-AX5): przy dużym tekście elementy leżące obok tekstu (ikona, znacznik Pro,
// wartość, szewron) przechodzą nad tekst w stosie pionowym; żaden tekst nie ma limitu linii.
// Dlaczego jedna stała: cztery kopie progu rozjechałyby się przy pierwszej zmianie.
// ============================================================================

import { useWindowDimensions } from 'react-native';

export const PROG_DUZEGO_TEKSTU = 2;

/** Czy system pokazuje tekst co najmniej w rozmiarze AX3 (fontScale ≥ 2). */
export function useDuzyTekst(): boolean {
  return useWindowDimensions().fontScale >= PROG_DUZEGO_TEKSTU;
}
