// ============================================================================
// Piekarz — rodzaj drożdży do odważenia (BR-KALK-009, DEC-26 a) [M1-audytor-generalny-216].
// Procent drożdży w recepturze to drożdże świeże (jak drożdże zaczynu, D-060); wybór „suche” przelicza
// gramy × 0,4 (RD-19, convertYeast). Wybór w app_settings (domyślnie świeże, bez migracji).
// ============================================================================

import { useEffect, useState } from 'react';
import { getAppSetting, setAppSetting } from '../data/sqlite-store';
import { guardSave } from './save-guard';
import { convertYeast } from '../core/domain-rules';
import { t } from './i18n';

export type RodzajDrozdzy = 'swieze' | 'suche';

export const KLUCZ_RODZAJU_DROZDZY = 'rodzaj_drozdzy';

let biezacy: RodzajDrozdzy | null = null;
const sluchacze = new Set<(v: RodzajDrozdzy) => void>();

/** Wartość z bazy (`unknown`) → wybór; brak albo nieznana wartość = świeże. */
export function parsujRodzajDrozdzy(v: unknown): RodzajDrozdzy {
  return v === 'suche' ? 'suche' : 'swieze';
}

export async function rodzajDrozdzy(): Promise<RodzajDrozdzy> {
  if (biezacy === null) biezacy = parsujRodzajDrozdzy(await getAppSetting(KLUCZ_RODZAJU_DROZDZY).catch(() => undefined));
  return biezacy;
}

/** Wybór bez czekania na bazę (kopia tekstowa); do wczytania — świeże. */
export function biezacyRodzajDrozdzy(): RodzajDrozdzy {
  return biezacy ?? 'swieze';
}

/** Zapis wyboru; nieudany zapis pokazuje „Nie zapisano” (guardSave), wybór działa w tej sesji. */
export async function zapiszRodzajDrozdzy(v: RodzajDrozdzy): Promise<void> {
  biezacy = v;
  sluchacze.forEach((fn) => fn(v));
  await guardSave(() => setAppSetting(KLUCZ_RODZAJU_DROZDZY, v))();
}

/** Bieżący wybór z subskrypcją; do wczytania z bazy — świeże. */
export function useRodzajDrozdzy(): RodzajDrozdzy {
  const [v, setV] = useState<RodzajDrozdzy>(biezacyRodzajDrozdzy());
  useEffect(() => {
    let zywy = true;
    sluchacze.add(setV);
    void rodzajDrozdzy().then((x) => zywy && setV(x));
    return () => {
      zywy = false;
      sluchacze.delete(setV);
    };
  }, []);
  return v;
}

/** Gramy drożdży świeżych z receptury → gramy wybranego rodzaju (RD-19: suche × 0,4). */
export function gramyDrozdzy(gramySwiezych: number, rodzaj: RodzajDrozdzy): number {
  return rodzaj === 'suche' ? convertYeast(gramySwiezych, 'fresh').instantGrams : gramySwiezych;
}

/** Nazwa wiersza drożdży dla wybranego rodzaju. */
export function nazwaDrozdzy(rodzaj: RodzajDrozdzy): string {
  return rodzaj === 'suche' ? t('Drożdże suche') : t('Drożdże świeże (prasowane)');
}

/** Tylko testy: nowy proces bez wczytanego wyboru. */
export function _resetRodzajDrozdzy(): void {
  biezacy = null;
}
