// ============================================================================
// Piekarz — dostęp do płatnej części (useAppAccess) [M1-audytor-generalny-008; 02-monetyzacja-001]
// Źródłem prawdy są transakcje StoreKit (src/lib/platnosci). Baza aplikacji nie nadaje dostępu:
// kolumny subscription_tier / subscription_expires_at z dawnej symulacji nie są czytane.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { getAppAccess } from '../data/sqlite-store';
import { StoredAppAccess } from '../data/db';
import type { Plan } from './platnosci/konfiguracja';
import type { Decyzja } from './platnosci/dostep';
import { pobierzStan, subskrybujStan, odswiezDostep, ustalDostep, StanDostepu } from './platnosci/stan';
import { kup, przywroc } from './platnosci/sklep';

export type AccessStatus = 'trial_active' | 'trial_expired' | 'subscribed';

export interface AppAccessInfo {
  status: AccessStatus;
  /** Dostęp ze sklepu albo z pamięci ostatniego udanego odczytu. */
  zakup: Decyzja;
  canCreateNewBake: boolean;
}

export const TRIAL_DURATION_DAYS = 14;

/** Czysta ocena: uprawnienie ze sklepu albo (do zadania 009) lokalny okres próbny. */
export function evaluateAppAccess(
  stored: StoredAppAccess | null,
  zakup: Decyzja,
  now: number = Date.now()
): AppAccessInfo {
  if (zakup.dostep) return { status: 'subscribed', zakup, canCreateNewBake: true };
  const days = stored ? (now - stored.trialStartedAt) / (1000 * 60 * 60 * 24) : 0;
  const active = stored !== null && days < (stored.trialDays || TRIAL_DURATION_DAYS);
  return { status: active ? 'trial_active' : 'trial_expired', zakup, canCreateNewBake: active };
}

/**
 * Stan dostępu dla ekranu. Stan zakupu jest wspólny dla całej aplikacji (platnosci/stan.ts),
 * więc zakup na jednym ekranie odblokowuje pozostałe bez restartu.
 */
export function useAppAccess() {
  const [zakup, setZakup] = useState<StanDostepu>(pobierzStan);
  const [stored, setStored] = useState<StoredAppAccess | null>(null);
  const [isPaywallVisible, setPaywallVisible] = useState<boolean>(false);

  useEffect(() => {
    const off = subskrybujStan(setZakup);
    if (!pobierzStan().gotowe) void odswiezDostep();
    void getAppAccess().then(setStored);
    return off;
  }, []);

  const access = evaluateAppAccess(stored, zakup.decyzja);

  // Zakup przychodzi przez nasłuch transakcji: po nadaniu dostępu ekran zakupu się zamyka.
  useEffect(() => {
    if (access.zakup.dostep) setPaywallVisible(false);
  }, [access.zakup.dostep]);

  /** Jedyny strażnik akcji: bez dostępu otwiera ekran zakupu i nie wykonuje akcji. */
  const requireActionAccess = useCallback(
    (action?: () => void | Promise<void>): boolean => {
      if (access.canCreateNewBake) {
        if (action) void action();
        return true;
      }
      setPaywallVisible(true);
      return false;
    },
    [access.canCreateNewBake]
  );

  const subscribe = useCallback(async (plan: Plan) => {
    await kup(plan);
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    const d = await ustalDostep(await przywroc());
    return d.dostep;
  }, []);

  return {
    access,
    loading: !zakup.gotowe,
    isPaywallVisible,
    setPaywallVisible,
    requireActionAccess,
    subscribe,
    restorePurchases,
  };
}
