// ============================================================================
// Piekarz — przywracanie i zapis trwającego wypieku na Stolnicy [M1-audytor-generalny-019]
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { StorageWriteError } from '../data/storage-status';
import { saveErrorText } from '../lib/save-guard';
import { t } from '../lib/i18n';
import { restoreTimerState, TimerState } from '../core/bake-session';
import { BakeSession, loadBakeSession, pickBakeSession, saveBakeSession } from '../data/bake-session-store';
import { getActiveBake } from '../data/sqlite-store';
import { resyncNotifications } from '../lib/notifications';

/**
 * Przy montowaniu przywraca sesję (wypiek z Kalkulatora albo zapis sprzed zabicia procesu),
 * potem zapisuje każdą zmianę kroku, fazy i zegara. `snapshot` = null, gdy nic nie trwa.
 */
export function useBakeSession(
  snapshot: BakeSession | null,
  onRestore: (session: BakeSession, timer: TimerState) => void
): boolean {
  const [ready, setReady] = useState(false);
  const restoreRef = useRef(onRestore);
  restoreRef.current = onRestore;

  useEffect(() => {
    let alive = true;
    void (async () => {
      const saved = await loadBakeSession().catch(() => null);
      const session = pickBakeSession(getActiveBake(), saved);
      if (alive && session) restoreRef.current(session, restoreTimerState(session, Date.now()));
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const snapRef = useRef(snapshot);
  snapRef.current = snapshot;
  // Wypiek, przy którym już pokazano „Nie zapisano”; po udanym zapisie komunikat może wrócić [M1-audytor-generalny-120]
  const alerted = useRef<string | null>(null);
  const key = snapshot ? JSON.stringify(snapshot) : null;
  useEffect(() => {
    if (!ready || key === null || !snapRef.current) return;
    const bakeId = snapRef.current.bake?.id ?? String(snapRef.current.startedAt);
    // Nieudany zapis postępu nie przerywa wypieku (zegar w pamięci działa dalej), ale nie jest cichy:
    // jeden komunikat „Nie zapisano” na wypiek (05-architekt-501, wybór P-120 a).
    // Po zapisie uzgodnienie powiadomień z bazą (ADR-006) [M1-audytor-generalny-006]
    void saveBakeSession(snapRef.current)
      .then(() => {
        alerted.current = null;
        return resyncNotifications();
      })
      .catch((e: unknown) => {
        if (!(e instanceof StorageWriteError) || alerted.current === bakeId) return;
        alerted.current = bakeId;
        Alert.alert(t('Nie zapisano'), saveErrorText(e));
      });
  }, [ready, key]);

  return ready;
}
