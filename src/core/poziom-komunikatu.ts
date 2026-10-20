// Poziom komunikatu zwracany przez moduły danych; kolor i ikonę nadaje komponent (docs/design/mapa-rol.md §3).
// 'ostrzezenie' tylko dla bezpieczeństwa (komponent Ostrzeżenie, RD-21…RD-23). [M1-audytor-generalny-050]
export type PoziomKomunikatu = 'info' | 'ostrzezenie' | 'blad';
