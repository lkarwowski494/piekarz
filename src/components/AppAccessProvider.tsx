// ============================================================================
// Piekarz — dostawca stanu dostępu i jedyny ekran zakupu (ADR-002, MON-05)
// [M1-audytor-generalny-025; 02-monetyzacja-005, 05-architekt-008]. Montowany raz w app/_layout.tsx.
// Stan zakupu (platnosci/stan.ts) i widoczność ekranu zakupu (platnosci/ekran.ts) są jedne na proces:
// zakup albo zwrot zmienia każdą zamontowaną zakładkę bez restartu, a strażnik z dowolnego ekranu
// otwiera ten sam ekran zakupu. Z Pro ekran (z Ustawień) pokazuje stan i zarządzanie subskrypcją [M3 P-b].
// ============================================================================

import React from 'react';
import { useAppAccess } from '../lib/app-access';
import { SUBSKRYPCJE } from '../lib/platnosci/konfiguracja';
import { PaywallModal } from './PaywallModal';

export function AppAccessProvider({ children }: { children: React.ReactNode }) {
  const { access, isPaywallVisible, setPaywallVisible, subscribe, restorePurchases } = useAppAccess();
  const aktywny = access.status === 'dostep' ? { subskrypcja: access.zakup.pamiec?.produkty.some((p) => SUBSKRYPCJE.includes(p)) ?? false } : null;
  return (
    <>
      {children}
      <PaywallModal
        visible={isPaywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSubscribe={subscribe}
        onRestore={restorePurchases}
        aktywny={aktywny}
      />
    </>
  );
}
