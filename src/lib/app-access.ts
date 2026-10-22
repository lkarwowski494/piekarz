// ============================================================================
// Piekarz — dostęp Basic/Pro (useAppAccess) [M1-audytor-generalny-008, -009; 02-monetyzacja-001, -002; D-112, D-113, D-116]
// Źródłem prawdy o Piekarz Pro są transakcje StoreKit (src/lib/platnosci): subskrypcja albo zakup dożywotni, bez
// okresu próbnego. Basic działa zawsze (lista BASIC i limity w src/lib/platnosci/konfiguracja.ts). Baza aplikacji
// nie nadaje dostępu: kolumny app_access z dawnej symulacji i triala nie są czytane.
// Ekran Pro otwiera tylko stuknięcie funkcji Pro (strażnik niżej) i Ustawienia; nigdy start aplikacji, pierwsze
// użycie ani krok wypieku (kontrakt docs/monetyzacja.md, zakazane wzorce).
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { Plan, Funkcja, Pojemnosc } from './platnosci/konfiguracja';
import { dozwolona, mozeDodac, Decyzja } from './platnosci/dostep';
import { pobierzStan, subskrybujStan, odswiezDostep, ustalDostep, StanDostepu } from './platnosci/stan';
import { kup, przywroc } from './platnosci/sklep';
import { czyEkranZakupu, subskrybujEkranZakupu, ustawEkranZakupu } from './platnosci/ekran';
import { liczbaZapisanych } from './limity-basic';

export type AccessStatus = 'dostep' | 'bez_uprawnienia';

export interface AppAccessInfo {
  status: AccessStatus;
  /** Decyzja ze sklepu albo z pamięci ostatniego udanego odczytu. */
  zakup: Decyzja;
  /** Piekarz Pro aktywny (nazwa historyczna; Basic zaczyna wypieki bez Pro, D-112). */
  canCreateNewBake: boolean;
}

/**
 * Build E2E na symulatorze bez StoreKit (.github/workflows/e2e-ios.yml, EXPO_PUBLIC_E2E=1 wstawiane przez Metro przy
 * budowaniu): pełny dostęp, żeby scenariusze przeszły główny przepływ. Wydanie TestFlight odrzuca tę flagę w kroku
 * „Guard against test/mock flags” (testflight.yml); test: tests/e2e-ios-workflow.test.ts (wybór P-037 a) [M1-audytor-generalny-037].
 */
const DOSTEP_E2E = process.env.EXPO_PUBLIC_E2E === '1';

/** Czysta ocena: Pro wyłącznie z uprawnienia App Store (subskrypcja albo dożywotni). */
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
  const pro = access.canCreateNewBake;
  const setPaywallVisible = useCallback((v: boolean) => ustawEkranZakupu(v), []);

  // Zakup przychodzi przez nasłuch transakcji: po nadaniu dostępu ekran zakupu się zamyka.
  useEffect(() => {
    if (pro) ustawEkranZakupu(false);
  }, [pro]);

  /** Czy funkcja działa teraz: Basic zawsze, Pro z uprawnieniem [M1-audytor-generalny-027; D-116]. */
  const moze = useCallback((funkcja: Funkcja) => dozwolona(funkcja, pro), [pro]);

  /** Jedyny strażnik akcji: funkcja Basic albo Pro z uprawnieniem wykonuje akcję, funkcja Pro bez niego otwiera ekran Pro. */
  const requireActionAccess = useCallback(
    (funkcja: Funkcja, action?: () => void | Promise<void>): boolean => {
      if (moze(funkcja)) {
        if (action) void action();
        return true;
      }
      ustawEkranZakupu(true);
      return false;
    },
    [moze]
  );

  /** Akcja przez strażnika (do onPress). */
  const chron = useCallback(
    (funkcja: Funkcja, action: () => void | Promise<void>) => () => {
      requireActionAccess(funkcja, action);
    },
    [requireActionAccess]
  );

  /** Właściwości BlokadaFunkcji dla obszaru ekranu. */
  const blokada = useCallback(
    (funkcja: Funkcja) => ({ funkcja, odblokowane: moze(funkcja), onZablokowane: () => requireActionAccess(funkcja) }),
    [moze, requireActionAccess]
  );

  /**
   * Dodanie nowej rzeczy z limitem Basic (własna receptura, zakwas): liczba z bazy w chwili dodawania; ponad limitem
   * bez Pro ekran Pro, poniżej limitu albo z Pro akcja. Zapisane ponad limitem (import) działają (kontrakt).
   */
  // Zwraca obietnicę zakończoną po akcji (albo po otwarciu ekranu Pro), żeby zapis dało się poczekać [M3 P-a-fix]
  const dodaj = useCallback(
    async (rodzaj: Pojemnosc, action: () => void | Promise<void>): Promise<void> => {
      if (pro) {
        await action();
        return;
      }
      const n = await liczbaZapisanych(rodzaj);
      if (n === null || mozeDodac(rodzaj, n, false)) await action();
      else ustawEkranZakupu(true);
    },
    [pro]
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
    dodaj,
    subscribe,
    restorePurchases,
  };
}
