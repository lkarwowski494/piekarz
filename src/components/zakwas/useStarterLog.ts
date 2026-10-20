// ============================================================================
// Piekarz — dziennik wpisów zakwasu na ekranie (ADR-008; BR-ZAKW-005, BR-ZAKW-007) [M1-audytor-generalny-104]
// Cienka warstwa nad src/data/starter-entries-store.ts: odczyt wpisów, obserwacja, poprawa godziny jednego wpisu,
// usunięcie z „Przywróć” (D-051 1a), „Zacznij od nowa”. Po każdej zmianie powiadomienia (resyncNotifications, ADR-006).
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import type { StoredStarterEntry } from '../../data/db';
import {
  addStarterEntry,
  deleteStarterEntry,
  getStarterEntries,
  restartStarterSetup,
  restoreStarterEntry,
  updateStarterEntry,
  type StarterPatch,
} from '../../data/starter-entries-store';
import type { StarterSign } from '../../core/starter-log';
import { resyncNotifications } from '../../lib/notifications';

const nowyId = (starterId: string, at: number, rodzaj: string) => `${rodzaj}-${starterId}-${at}`;

export function nowyWpis(starterId: string, kind: StoredStarterEntry['kind'], at: number, signs: StarterSign[] = []): StoredStarterEntry {
  return { id: nowyId(starterId, at, kind === 'feeding' ? 'feed' : 'obs'), starterId, kind, occurredAt: at, signs, createdAt: at, updatedAt: at };
}

export function useStarterLog(starterId: string) {
  const [entries, setEntries] = useState<StoredStarterEntry[]>([]);
  const [usuniety, setUsuniety] = useState<StoredStarterEntry | null>(null);

  const reload = useCallback(async () => {
    setEntries(starterId ? await getStarterEntries(starterId) : []);
  }, [starterId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const zmiana = useCallback(async () => {
    await reload();
    void resyncNotifications();
  }, [reload]);

  /** Obserwacja (np. „Podwoił objętość”); zmiana zakwasu w tej samej transakcji. */
  const zapiszObserwacje = useCallback(
    async (signs: StarterSign[], at: number, patch?: StarterPatch) => {
      await addStarterEntry(nowyWpis(starterId, 'observation', at, signs), patch);
      await zmiana();
    },
    [starterId, zmiana]
  );

  /** Poprawa godziny jednego wpisu w miejscu; pozostałe wpisy bez zmian (BR-ZAKW-007). */
  const popraw = useCallback(
    async (wpis: StoredStarterEntry, occurredAt: number, at: number) => {
      await updateStarterEntry({ ...wpis, occurredAt, updatedAt: at });
      await zmiana();
    },
    [zmiana]
  );

  /** Usunięcie bez pytania; wiersz zostaje do „Przywróć”. */
  const usun = useCallback(
    async (id: string) => {
      const removed = await deleteStarterEntry(id);
      setUsuniety(removed);
      await zmiana();
    },
    [zmiana]
  );

  const przywroc = useCallback(async () => {
    if (!usuniety) return;
    await restoreStarterEntry(usuniety);
    setUsuniety(null);
    await zmiana();
  }, [usuniety, zmiana]);

  const schowajPasek = useCallback(() => setUsuniety(null), []);

  /** Zacznij od nowa (pleśń, BR-ZAKW-005): wpisy tego zakwasu usunięte, dzień 1 od dokarmienia teraz. */
  const zacznijOdNowa = useCallback(
    async (at: number) => {
      await restartStarterSetup(starterId, nowyWpis(starterId, 'feeding', at));
      await zmiana();
    },
    [starterId, zmiana]
  );

  return { entries, reload, zapiszObserwacje, popraw, usun, usuniety, przywroc, schowajPasek, zacznijOdNowa };
}
