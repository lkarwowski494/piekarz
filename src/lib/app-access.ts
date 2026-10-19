// ============================================================================
// Piekarz — dostęp do płatnej części (useAppAccess) [M1-audytor-generalny-008, -009; 02-monetyzacja-001, -002]
// Źródłem prawdy są transakcje StoreKit (src/lib/platnosci). Okres próbny to wyłącznie oferta
// wprowadzająca App Store (aktywna subskrypcja w currentEntitlements); aplikacja nie liczy dni.
// Baza aplikacji nie nadaje dostępu: kolumny app_access z dawnej symulacji i triala nie są czytane.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { Plan } from './platnosci/konfiguracja';
import type { Decyzja } from './platnosci/dostep';
import { pobierzStan, subskrybujStan, odswiezDostep, ustalDostep, StanDostepu } from './platnosci/stan';
import { kup, przywroc } from './platnosci/sklep';

export type AccessStatus = 'dostep' | 'bez_uprawnienia';

export interface AppAccessInfo {
  status: AccessStatus;
  /** Decyzja ze sklepu albo z pamięci ostatniego udanego odczytu. */
  zakup: Decyzja;
  canCreateNewBake: boolean;
}

/** Czysta ocena: dostęp wyłącznie z uprawnienia App Store (subskrypcja, oferta wprowadzająca, dożywotni). */
export function evaluateAppAccess(zakup: Decyzja): AppAccessInfo {
  return { status: zakup.dostep ? 'dostep' : 'bez_uprawnienia', zakup, canCreateNewBake: zakup.dostep };
}

/**
 * Stan dostępu dla ekranu. Stan zakupu jest wspólny dla całej aplikacji (platnosci/stan.ts),
 * więc zakup na jednym ekranie odblokowuje pozostałe bez restartu.
 */
export function useAppAccess() {
  const [zakup, setZakup] = useState<StanDostepu>(pobierzStan);
  const [isPaywallVisible, setPaywallVisible] = useState<boolean>(false);

  useEffect(() => {
    const off = subskrybujStan(setZakup);
    if (!pobierzStan().gotowe) void odswiezDostep();
    return off;
  }, []);

  const access = evaluateAppAccess(zakup.decyzja);

  // Zakup przychodzi przez nasłuch transakcji: po nadaniu dostępu ekran zakupu się zamyka.
  useEffect(() => {
    if (access.canCreateNewBake) setPaywallVisible(false);
  }, [access.canCreateNewBake]);

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
