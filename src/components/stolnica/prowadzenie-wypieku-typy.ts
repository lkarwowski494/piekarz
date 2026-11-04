// ============================================================================
// Piekarz — wejście komponentu ProwadzenieWypieku, wydzielone z ProwadzenieWypieku.tsx (limit 20 480 B) [M3 p4b].
// ============================================================================
import type { ReactNode } from 'react';
import type { OdrzuconyZapis } from '../../hooks/useBakeSession';
import type { BakeSession } from '../../data/bake-session-store';

export interface ProwadzenieWypiekuProps {
  /** Udany zapis kroku (ekran zeruje licznik odrzuceń z rzędu) [M3 D3a-fix]. */
  onZapisano?: () => void;
  /** Trwający wypiek z zapisu albo nowy z planu (stan z chwili otwarcia; zegar liczony od zapisanego końca kroku). */
  start: BakeSession;
  /** Wersja wiersza z odczytu; null = wypiek z planu jeszcze bez zapisu (pierwszy zapis go tworzy). */
  wersja: number | null;
  /** Zapis odrzucony (stan w bazie inny niż na ekranie): ekran czyta wypieki od nowa [M3 D3a-fix]. */
  onOdrzucony: (powod: OdrzuconyZapis) => void;
  /** Nad treścią prowadzenia (przełącznik wypieków). */
  naglowek?: ReactNode;
  /** Stały rząd nad paskiem kciuka, poza przewijaniem (przełącznik wypieków przy zwykłym tekście) [E2E-90]. */
  naglowekStaly?: ReactNode;
  /** Koniec albo przerwanie tego wypieku. */
  onKoniec: () => void;
  /** Bieżący krok (nazwa) dla przełącznika. */
  onKrok?: (krok: string) => void;
}
