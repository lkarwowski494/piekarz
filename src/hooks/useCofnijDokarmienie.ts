// ============================================================================
// Piekarz — „Przywróć” po „Zapisz dokarmienie” na karcie zakwasu (04-studio-projektowe-009, decyzja M1 wg rekomendacji;
// wzorzec D-051 1a jak „Zrobione” przy karmieniu na „Dziś”) [M3 W-fix2]. Zamiast okna do zamknięcia mokrą ręką pasek
// „Zapisano dokarmienie zakwasu {zakwas}.” z „Przywróć”: cofnięcie usuwa wpis tego dokarmienia i przywraca poprzedni
// czas i proporcję ostatniego dokarmienia; inne pola zakwasu (np. edycja w międzyczasie) zostają.
// ============================================================================

import { useCallback, useMemo, useState } from 'react';
import type { StoredStarter } from '../data/db';
import { getStarters, saveStarter } from '../data/sqlite-store';
import { deleteStarterEntry } from '../data/starter-entries-store';
import { resyncNotifications } from '../lib/notifications';
import { guardSave } from '../lib/save-guard';
import { t } from '../lib/i18n';

interface DoCofniecia {
  starterId: string;
  nazwa: string;
  /** Id wpisu, który zapisuje saveStarter przy nowym lastFedAt (src/data/sqlite-store.ts, feedEntry). */
  wpisId: string;
  poprzedni: Pick<StoredStarter, 'lastFedAt' | 'feedingRatio'>;
}

/** Id wpisu dokarmienia tworzonego przez saveStarter dla nowego czasu dokarmienia. */
export const idWpisuDokarmienia = (starterId: string, at: number) => `feed-${starterId}-${at}`;

export function useCofnijDokarmienie(onPrzywrocono: (starterId: string) => Promise<void> | void) {
  const [cofnij, ustaw] = useState<DoCofniecia | null>(null);
  /** Po zapisie dokarmienia: stan zakwasu sprzed zapisu i chwila dokarmienia. */
  const zapamietaj = useCallback((przed: StoredStarter, at: number) => {
    ustaw({ starterId: przed.id, nazwa: przed.name, wpisId: idWpisuDokarmienia(przed.id, at), poprzedni: { lastFedAt: przed.lastFedAt, feedingRatio: przed.feedingRatio } });
  }, []);
  const ukryj = useCallback(() => ustaw(null), []);
  const przywroc = useCallback(() => {
    if (!cofnij) return;
    const c = cofnij;
    ustaw(null);
    void guardSave(async () => {
      await deleteStarterEntry(c.wpisId);
      const teraz = (await getStarters()).find((s) => s.id === c.starterId);
      if (teraz) await saveStarter({ ...teraz, lastFedAt: c.poprzedni.lastFedAt, feedingRatio: c.poprzedni.feedingRatio });
      void resyncNotifications();
      await onPrzywrocono(c.starterId);
    })();
  }, [cofnij, onPrzywrocono]);
  const pasek = useMemo(
    () => (cofnij ? { tekst: t('Zapisano dokarmienie zakwasu {zakwas}.', { zakwas: cofnij.nazwa }), onPrzywroc: przywroc, onUkryj: ukryj } : null),
    [cofnij, przywroc, ukryj]
  );
  return { zapamietaj, pasek };
}
