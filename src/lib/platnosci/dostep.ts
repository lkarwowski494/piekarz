// ============================================================================
// Piekarz — czysta decyzja o dostępie (wzorzec dostep.ts, moduł storekit-expo)
// [M1-audytor-generalny-008; 02-monetyzacja-001]. Bez importów biblioteki płatności:
// adapter (sklep.ts) zamienia zweryfikowane transakcje StoreKit na Uprawnienie[],
// a pamięć ostatniego udanego odczytu jest JSON-em w app_settings.
// ============================================================================

import { BEZ_UPRAWNIENIA, Funkcja } from './konfiguracja';

/** wygasa: ms; null = bez końca (zakup dożywotni). odebrane: zwrot albo odebranie z Family Sharing. */
export type Uprawnienie = { produkt: string; wygasa: number | null; odebrane: boolean };
/** blad: brak sieci albo sklep niedostępny — to nie jest brak zakupu. */
export type Odczyt = { zrodlo: 'sklep'; uprawnienia: Uprawnienie[] } | { zrodlo: 'blad' };
/** Ostatni udany odczyt sklepu. */
export type Pamiec = { produkty: string[]; wygasa: number | null } | null;
export type Powod = 'sklep' | 'pamiec' | 'brak';
export type Decyzja = { dostep: boolean; powod: Powod; pamiec: Pamiec };

export function decyzja(odczyt: Odczyt, pamiec: Pamiec, teraz: number, odblokowuja: readonly string[]): Decyzja {
  if (odczyt.zrodlo === 'sklep') {
    // Sklep jest źródłem prawdy: zwrot albo odebranie zabiera dostęp, nawet gdy pamięć mówi inaczej.
    const wazne = odczyt.uprawnienia.filter(
      (u) => !u.odebrane && odblokowuja.includes(u.produkt) && (u.wygasa === null || u.wygasa > teraz)
    );
    const nowa: Pamiec = wazne.length
      ? {
          produkty: [...new Set(wazne.map((u) => u.produkt))],
          wygasa: wazne.some((u) => u.wygasa === null) ? null : Math.max(...wazne.map((u) => u.wygasa as number)),
        }
      : null;
    return { dostep: nowa !== null, powod: nowa ? 'sklep' : 'brak', pamiec: nowa };
  }
  // Błąd odczytu to nie brak zakupu: ostatni znany stan, ale nie dłużej niż do końca opłaconego okresu.
  const ok =
    pamiec !== null &&
    pamiec.produkty.some((p) => odblokowuja.includes(p)) &&
    (pamiec.wygasa === null || pamiec.wygasa > teraz);
  return { dostep: ok, powod: ok ? 'pamiec' : 'brak', pamiec };
}

/** Czy funkcja działa: z uprawnieniem zawsze, bez niego tylko z listy BEZ_UPRAWNIENIA [M1-audytor-generalny-027]. */
export function dozwolona(funkcja: Funkcja, dostep: boolean, bez: readonly Funkcja[] = BEZ_UPRAWNIENIA): boolean {
  return dostep || bez.includes(funkcja);
}

export function odczytajPamiec(tekst: unknown): Pamiec {
  if (typeof tekst !== 'string') return null;
  let x: unknown;
  try {
    x = JSON.parse(tekst);
  } catch {
    return null;
  }
  if (typeof x !== 'object' || x === null) return null;
  const produkty: unknown = Reflect.get(x, 'produkty');
  const wygasa: unknown = Reflect.get(x, 'wygasa');
  if (!Array.isArray(produkty) || !produkty.every((p) => typeof p === 'string')) return null;
  if (wygasa !== null && !(typeof wygasa === 'number' && Number.isFinite(wygasa))) return null;
  return { produkty, wygasa };
}

export function zapisPamieci(pamiec: Pamiec): string {
  return pamiec === null ? '' : JSON.stringify({ produkty: pamiec.produkty, wygasa: pamiec.wygasa });
}
