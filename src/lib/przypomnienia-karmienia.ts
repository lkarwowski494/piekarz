// ============================================================================
// Piekarz — przełącznik przypomnień o karmieniu zakwasu (DEC-22 a) [M1-audytor-generalny-179; 11-wzrost-503].
// Wybór w app_settings (domyślnie włączone); wyłączenie zabiera z planu tylko karmienie, kroki wypieku zostają.
// ============================================================================

import { useEffect, useState } from 'react';
import { getAppSetting, setAppSetting } from '../data/sqlite-store';
import { guardSave } from './save-guard';

export const KLUCZ_PRZYPOMNIEN_KARMIENIA = 'przypomnienia_karmienia';

let biezacy: boolean | null = null;
const sluchacze = new Set<(v: boolean) => void>();

/** Wartość z bazy (`unknown`) → wybór; brak albo nieznana wartość = włączone. */
export function parsujPrzypomnieniaKarmienia(v: unknown): boolean {
  return v !== '0';
}

export async function czyPrzypomnieniaKarmienia(): Promise<boolean> {
  if (biezacy === null) biezacy = parsujPrzypomnieniaKarmienia(await getAppSetting(KLUCZ_PRZYPOMNIEN_KARMIENIA).catch(() => undefined));
  return biezacy;
}

/** Zapis wyboru; nieudany zapis pokazuje „Nie zapisano” (guardSave), wybór działa w tej sesji. */
export async function zapiszPrzypomnieniaKarmienia(v: boolean): Promise<void> {
  biezacy = v;
  sluchacze.forEach((fn) => fn(v));
  await guardSave(() => setAppSetting(KLUCZ_PRZYPOMNIEN_KARMIENIA, v ? '1' : '0'))();
}

/** Bieżący wybór z subskrypcją; do wczytania z bazy — włączone. */
export function usePrzypomnieniaKarmienia(): boolean {
  const [v, setV] = useState<boolean>(biezacy ?? true);
  useEffect(() => {
    let zywy = true;
    sluchacze.add(setV);
    void czyPrzypomnieniaKarmienia().then((x) => zywy && setV(x));
    return () => {
      zywy = false;
      sluchacze.delete(setV);
    };
  }, []);
  return v;
}

/** Tylko testy: nowy proces bez wczytanego wyboru. */
export function _resetPrzypomnieniaKarmienia(): void {
  biezacy = null;
}
