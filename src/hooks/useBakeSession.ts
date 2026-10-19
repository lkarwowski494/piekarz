// ============================================================================
// Piekarz — przywracanie i zapis trwającego wypieku na Stolnicy [M1-audytor-generalny-019]
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { restoreTimerState, TimerState } from '../core/bake-session';
import { BakeSession, loadBakeSession, pickBakeSession, saveBakeSession } from '../data/bake-session-store';
import { getActiveBake } from '../data/sqlite-store';

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
  const key = snapshot ? JSON.stringify(snapshot) : null;
  useEffect(() => {
    if (!ready || key === null || !snapRef.current) return;
    // Nieudany zapis postępu nie przerywa wypieku; zegar w pamięci działa dalej.
    void saveBakeSession(snapRef.current).catch(() => {});
  }, [ready, key]);

  return ready;
}
