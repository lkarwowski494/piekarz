// ============================================================================
// Piekarz — dostęp do płatnej części (useAppAccess) [M1-audytor-generalny-008, -009; 02-monetyzacja-001, -002]
// Źródłem prawdy są transakcje StoreKit (src/lib/platnosci). Okres próbny to wyłącznie oferta
// wprowadzająca App Store (aktywna subskrypcja w currentEntitlements); aplikacja nie liczy dni.
// Baza aplikacji nie nadaje dostępu: kolumny app_access z dawnej symulacji i triala nie są czytane.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { Plan, Funkcja } from './platnosci/konfiguracja';
import { dozwolona, Decyzja } from './platnosci/dostep';
import { pobierzStan, subskrybujStan, odswiezDostep, ustalDostep, StanDostepu } from './platnosci/stan';
import { kup, przywroc } from './platnosci/sklep';
import { czyEkranZakupu, subskrybujEkranZakupu, ustawEkranZakupu } from './platnosci/ekran';

export type AccessStatus = 'dostep' | 'bez_uprawnienia';

export interface AppAccessInfo {
  status: AccessStatus;
  /** Decyzja ze sklepu albo z pamięci ostatniego udanego odczytu. */
  zakup: Decyzja;
  canCreateNewBake: boolean;
}

/**
 * Build E2E na symulatorze bez StoreKit (.github/workflows/e2e-ios.yml, EXPO_PUBLIC_E2E=1 wstawiane przez Metro przy
 * budowaniu): pełny dostęp, żeby scenariusze przeszły główny przepływ. Wydanie TestFlight odrzuca tę flagę w kroku
 * „Guard against test/mock flags” (testflight.yml); test: tests/e2e-ios-workflow.test.ts (wybór P-037 a) [M1-audytor-generalny-037].
 */
const DOSTEP_E2E = process.env.EXPO_PUBLIC_E2E === '1';

/** Czysta ocena: dostęp wyłącznie z uprawnienia App Store (subskrypcja, oferta wprowadzająca, dożywotni). */
export function evaluateAppAccess(zakup: Decyzja): AppAccessInfo {
  const dostep = zakup.dostep || DOSTEP_E2E;
  return { status: dostep ? 'dostep' : 'bez_uprawnienia', zakup, canCreateNewBake: dostep };
}

/**
 * „Przywróć zakupy” na żądanie użytkownika: synchronizacja ze sklepem, potem bieżące uprawnienia
 * we wspólnym stanie. Zwraca, czy jest dostęp [M1-audytor-generalny-010].
 */
export async function przywrocZakupy(): Promise<boolean> {
  const d = await ustalDostep(await przywroc());
  return d.dostep;
}

/**
 * Stan dostępu dla ekranu. Stan zakupu jest wspólny dla całej aplikacji (platnosci/stan.ts),
 * więc zakup na jednym ekranie odblokowuje pozostałe bez restartu.
 */
export function useAppAccess() {
  const [zakup, setZakup] = useState<StanDostepu>(pobierzStan);
  // Jeden ekran zakupu na aplikację (AppAccessProvider w app/_layout.tsx) [M1-audytor-generalny-025]
  const [isPaywallVisible, setWidoczny] = useState<boolean>(czyEkranZakupu);

  useEffect(() => {
    const off = subskrybujStan(setZakup);
    const offEkran = subskrybujEkranZakupu(setWidoczny);
    setZakup(pobierzStan());
    setWidoczny(czyEkranZakupu());
    if (!pobierzStan().gotowe) void odswiezDostep();
    return () => {
      off();
      offEkran();
    };
  }, []);

  const access = evaluateAppAccess(zakup.decyzja);
  const setPaywallVisible = useCallback((v: boolean) => ustawEkranZakupu(v), []);

  // Zakup przychodzi przez nasłuch transakcji: po nadaniu dostępu ekran zakupu się zamyka.
  useEffect(() => {
    if (access.canCreateNewBake) ustawEkranZakupu(false);
  }, [access.canCreateNewBake]);

  /** Jedyny strażnik akcji: bez dostępu otwiera ekran zakupu i nie wykonuje akcji. */
  const requireActionAccess = useCallback(
    (action?: () => void | Promise<void>): boolean => {
      if (access.canCreateNewBake) {
        if (action) void action();
        return true;
      }
      ustawEkranZakupu(true);
      return false;
    },
    [access.canCreateNewBake]
  );

  /** Czy funkcja działa teraz (lista BEZ_UPRAWNIENIA w konfiguracji) [M1-audytor-generalny-027]. */
  const moze = useCallback((funkcja: Funkcja) => dozwolona(funkcja, access.canCreateNewBake), [access.canCreateNewBake]);

  /** Akcja przez strażnika: funkcja z listy bez uprawnienia działa, inna otwiera ekran zakupu. */
  const chron = useCallback(
    (funkcja: Funkcja, action: () => void | Promise<void>) => () => {
      if (moze(funkcja)) void action();
      else requireActionAccess();
    },
    [moze, requireActionAccess]
  );

  /** Właściwości BlokadaFunkcji dla obszaru ekranu. */
  const blokada = useCallback(
    (funkcja: Funkcja) => ({ funkcja, odblokowane: moze(funkcja), onZablokowane: () => requireActionAccess() }),
    [moze, requireActionAccess]
  );

  // 'oczekuje': zakup czeka na zatwierdzenie (Ask to Buy) [audyt-niezalezny C-4]
  const subscribe = useCallback((plan: Plan) => kup(plan), []);

  const restorePurchases = useCallback(przywrocZakupy, []);

  return {
    access,
    loading: !zakup.gotowe,
    isPaywallVisible,
    setPaywallVisible,
    requireActionAccess,
    moze,
    chron,
    blokada,
    subscribe,
    restorePurchases,
  };
}
