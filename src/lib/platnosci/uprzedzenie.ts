// ============================================================================
// Piekarz — uprzedzenie przed końcem bezpłatnej próby (D-039 pkt 2, design-spec §11d 126, wybór P-126 a)
// [M1-audytor-generalny-126; 02-monetyzacja-502]. Czysta decyzja: czy i który wariant tekstu pokazać raz
// w oknie 72 h przed końcem okresu próbnego. Gdy nie wiadomo, że to próba, albo brak daty końca: nic.
// ============================================================================

import type { Uprawnienie } from './dostep';
import { PRODUKTY, SUBSKRYPCJE } from './konfiguracja';

/** app_settings: data końca próby (ms), dla której uprzedzenie już pokazano (aneks ADR-007). */
export const KLUCZ_UPRZEDZENIA = 'uprzedzenie_proby_pokazane';
/** Okno przed końcem próby (D-039: 3 dni). */
export const OKNO_UPRZEDZENIA_MS = 72 * 3600_000;

export type Wariant = {
  koniec: number;
  /** Zdanie o opłacie: rok/miesiąc z ceną, odnawianie wyłączone albo stan nieznany (§11d 126, tabela wariantów). */
  zdanie: 'rok' | 'miesiac' | 'nie-odnowi' | 'nieznane';
  cena?: string;
  /** Zdanie „Bez zakupu zostaną…”; bez niego, gdy użytkownik ma plan dożywotni. */
  bezZakupu: boolean;
};

export function wariantUprzedzenia(a: {
  uprawnienia: Uprawnienie[] | null;
  pokazanoDla: number | null;
  teraz: number;
  /** Ceny sklepu (displayPrice); null = nieznane (brak sieci). */
  ceny: { yearly: string; monthly: string } | null;
}): Wariant | null {
  if (!a.uprawnienia) return null;
  const proba = a.uprawnienia.find((u) => u.proba === true && !u.odebrane && u.wygasa !== null && SUBSKRYPCJE.includes(u.produkt));
  if (!proba || proba.wygasa === null) return null;
  const zostalo = proba.wygasa - a.teraz;
  if (zostalo <= 0 || zostalo > OKNO_UPRZEDZENIA_MS || a.pokazanoDla === proba.wygasa) return null;
  const dozywotni = a.uprawnienia.some((u) => u.produkt === PRODUKTY.lifetime && !u.odebrane);
  const koniec = proba.wygasa;
  if (proba.odnawia === false) return dozywotni ? null : { koniec, zdanie: 'nie-odnowi', bezZakupu: true };
  const plan = proba.produkt === PRODUKTY.yearly ? 'yearly' : proba.produkt === PRODUKTY.monthly ? 'monthly' : null;
  const cena = plan && a.ceny ? a.ceny[plan] : undefined;
  if (proba.odnawia === true && plan && cena) {
    return { koniec, zdanie: plan === 'yearly' ? 'rok' : 'miesiac', cena, bezZakupu: !dozywotni };
  }
  return { koniec, zdanie: 'nieznane', bezZakupu: !dozywotni };
}
