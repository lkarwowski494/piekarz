// ============================================================================
// Piekarz — profile godzin snu bez zależności od bazy (D-066 1a; BR-HARMO-002) [M1-audytor-generalny-212]
// Jedno miejsce okna snu dla Ustawień (godziny-snu.ts) i domyślnego okna harmonogramu
// (reverse-scheduler.ts); moduł czysty, więc rdzeń planu nie importuje warstwy danych.
// ============================================================================

import type { OknoSnu } from './plan-bez-nocy';

/** Profile godzin snu (start i koniec w godzinach; 24 = północ). Nazwy to klucze PL dla t(). */
export const PROFILE_SNU = [
  { id: 'standard', namePl: 'Standard', start: 23.0, end: 7.0 },
  { id: 'early_bird', namePl: 'Ranny ptaszek', start: 22.0, end: 6.0 },
  { id: 'night_owl', namePl: 'Nocny marek', start: 24.0, end: 8.0 },
] as const;

export type ProfilSnuId = (typeof PROFILE_SNU)[number]['id'] | 'brak';
export const DOMYSLNY_PROFIL_SNU: ProfilSnuId = 'standard';

/** Wartość z bazy (`unknown`) → profil; brak albo nieznana wartość = domyślny. */
export function parsujProfilSnu(v: unknown): ProfilSnuId {
  if (v === 'brak') return 'brak';
  return PROFILE_SNU.find((p) => p.id === v)?.id ?? DOMYSLNY_PROFIL_SNU;
}

/** Okno snu profilu; „Bez godzin snu” = null. */
export function oknoSnu(id: ProfilSnuId): OknoSnu | null {
  const p = PROFILE_SNU.find((x) => x.id === id);
  return p ? { startH: p.start % 24, koniecH: p.end } : null;
}
