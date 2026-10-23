// ============================================================================
// Piekarz — uprzedzenie o końcu Piekarz Pro (D-113 pkt 3, kontrakt docs/monetyzacja.md „Wygaśnięcie Pro”, D-116).
// Czyste decyzje: (1) 3 dni przed końcem subskrypcji, która się nie odnowi (sklep podał koniec i odnawianie
// wyłączone), raz dla tej daty końca; (2) w chwili wygaśnięcia (udany odczyt sklepu bez dostępu po pamięci z dostępem),
// raz. Jedno zdanie „przypomnienia o dokarmianiu wyłączą się”, bez odliczania i bez „ostatniej szansy”.
// Gdy sklep nie podał stanu odnawiania (OP-M03), uprzedzenia przed końcem nie ma: nie straszy odnawiającego.
// ============================================================================

import type { Decyzja, Odczyt, Pamiec, Uprawnienie } from './dostep';
import { ODBLOKOWUJA } from './konfiguracja';

/** app_settings: data końca Pro (ms), dla której uprzedzenie „przed” już pokazano. */
export const KLUCZ_UPRZEDZENIA = 'uprzedzenie_konca_pro';
/** app_settings: „1”, gdy Pro wygasło, a komunikatu jeszcze nie pokazano (raz). */
export const KLUCZ_KONCA_PRO = 'koniec_pro_do_pokazania';
/** Okno przed końcem Pro (D-039 pkt 2, D-113: 3 dni). */
export const OKNO_UPRZEDZENIA_MS = 72 * 3600_000;

/** Uprzedzenie przed końcem Pro: data końca (ms). */
export type UprzedzenieKonca = { koniec: number };

/**
 * Uprzedzenie przed końcem Pro: wszystkie dające Pro uprawnienia to subskrypcje z datą końca i wyłączonym odnawianiem,
 * a najpóźniejszy koniec wypada w oknie 72 h; raz dla tej daty końca (`pokazanoDla`). Dożywotni, odnawiająca się albo
 * o nieznanym odnawianiu subskrypcja — bez uprzedzenia.
 */
export function uprzedzenieKoncaPro(a: { uprawnienia: Uprawnienie[] | null; pokazanoDla: number | null; teraz: number }): UprzedzenieKonca | null {
  if (!a.uprawnienia) return null;
  const dajace = a.uprawnienia.filter((u) => !u.odebrane && ODBLOKOWUJA.includes(u.produkt) && (u.wygasa === null || u.wygasa > a.teraz));
  const konce: number[] = [];
  for (const u of dajace) {
    if (u.wygasa === null || u.odnawia !== false) return null;
    konce.push(u.wygasa);
  }
  if (konce.length === 0) return null;
  const koniec = Math.max(...konce);
  if (koniec - a.teraz > OKNO_UPRZEDZENIA_MS || a.pokazanoDla === koniec) return null;
  return { koniec };
}

/** Pro wygasło: pamięć sprzed odczytu dawała dostęp, a udany odczyt sklepu go nie daje (błąd odczytu to nie wygaśnięcie). */
export function wygaslPro(poprzednia: Pamiec, d: Decyzja, zrodlo: Odczyt['zrodlo']): boolean {
  return zrodlo === 'sklep' && poprzednia !== null && poprzednia.produkty.some((p) => ODBLOKOWUJA.includes(p)) && !d.dostep;
}
