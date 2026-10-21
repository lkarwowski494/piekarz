// ============================================================================
// Piekarz — godziny snu z Ustawień (D-066 1a; BR-HARMO-002, BR-HARMO-004) [M1-audytor-generalny-130]
// Wybór profilu zapisany w `app_settings` (klucz `godziny_snu`, bez migracji); domyślnie „Standard” 23:00–07:00
// (BRD BR-HARMO-002, OP-45 rozstrzygnięte D-066). „Bez godzin snu” = brak okna: plan nie sprawdza nocy.
// Wartość w pamięci z subskrypcją, jak jednostki (unit-converter.ts).
// ============================================================================

import { useEffect, useState } from 'react';
import { getAppSetting, setAppSetting } from '../data/sqlite-store';
import { guardSave } from './save-guard';
import { DOMYSLNY_PROFIL_SNU, parsujProfilSnu, type ProfilSnuId } from './profile-snu';

// Profile i okno snu w czystym module (bez bazy), wspólne z harmonogramem [M1-audytor-generalny-212]
export { PROFILE_SNU, DOMYSLNY_PROFIL_SNU, parsujProfilSnu, oknoSnu, type ProfilSnuId } from './profile-snu';

export const KLUCZ_GODZIN_SNU = 'godziny_snu';

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
