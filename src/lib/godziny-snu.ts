// ============================================================================
// Piekarz — godziny snu z Ustawień (D-066 1a; BR-HARMO-002, BR-HARMO-004) [M1-audytor-generalny-130]
// Wybór profilu zapisany w `app_settings` (klucz `godziny_snu`, bez migracji); domyślnie „Standard” 23:00–07:00
// (BRD BR-HARMO-002, OP-45 rozstrzygnięte D-066). „Bez godzin snu” = brak okna: plan nie sprawdza nocy.
// Wartość w pamięci z subskrypcją, jak jednostki (unit-converter.ts).
// ============================================================================

import { useEffect, useState } from 'react';
import { getAppSetting, setAppSetting } from '../data/sqlite-store';
import { guardSave } from './save-guard';
import type { OknoSnu } from './plan-bez-nocy';

export const KLUCZ_GODZIN_SNU = 'godziny_snu';

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

let biezacy: ProfilSnuId | null = null;
const sluchacze = new Set<(id: ProfilSnuId) => void>();

export async function wczytajProfilSnu(): Promise<ProfilSnuId> {
  if (biezacy === null) biezacy = parsujProfilSnu(await getAppSetting(KLUCZ_GODZIN_SNU).catch(() => undefined));
  return biezacy;
}

export async function zapiszProfilSnu(id: ProfilSnuId): Promise<void> {
  biezacy = id;
  sluchacze.forEach((fn) => fn(id));
  await guardSave(() => setAppSetting(KLUCZ_GODZIN_SNU, id))();
}

/** Bieżący profil z subskrypcją; do wczytania z bazy — domyślny. */
export function useProfilSnu(): ProfilSnuId {
  const [id, setId] = useState<ProfilSnuId>(biezacy ?? DOMYSLNY_PROFIL_SNU);
  useEffect(() => {
    let zywy = true;
    void wczytajProfilSnu().then((v) => { if (zywy) setId(v); });
    const fn = (v: ProfilSnuId) => { if (zywy) setId(v); };
    sluchacze.add(fn);
    return () => { zywy = false; sluchacze.delete(fn); };
  }, []);
  return id;
}

/** Stan modułu dla testów (pamięć bez wartości, odczyt z bazy przy następnym użyciu). */
export function _resetGodzinySnu(): void {
  biezacy = null;
}
