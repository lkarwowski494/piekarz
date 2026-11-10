// ============================================================================
// Piekarz — niski ekran (token `uklad.niskiEkran`, rola 04 p4b) [M1-audytor-generalny-005; 04-studio-projektowe-001]
// Okno niższe niż próg (iPhone SE 568 i 667 pt, „Powiększenie ekranu” 320×568) przy tekście mniejszym niż AX
// (fontScale < 2): prowadzenie ma zwarty pas i pasek kciuka w jednym rzędzie, żeby karta kroku z ostrzeżeniem była
// w pierwszym ekranie. Przy dużym tekście układ zwykły (zawija się i przewija): nic nie znika (karty/README.md §7b).
// ============================================================================

import { useWindowDimensions } from 'react-native';
import { uklad } from './tokeny';

/** Duży tekst jak w PasZakladki i na Stolnicy (fontScale ≥ 2). */
const DUZY_TEKST = 2;

/** Czy okno o danej wysokości (pt) i skali tekstu dostaje zwarty układ prowadzenia. */
export function czyNiskiEkran(wysokosc: number, fontScale: number): boolean {
  return wysokosc < uklad.niskiEkran && fontScale < DUZY_TEKST;
}

/** Niski ekran dla bieżącego okna (aktualizuje się przy zmianie rozmiaru i Dynamic Type). */
export function useNiskiEkran(): boolean {
  const { height, fontScale } = useWindowDimensions();
  return czyNiskiEkran(height, fontScale);
}
