// ============================================================================
// Piekarz — dane Startu z bazy: trwające wypieki (te same sesje, które przywraca prowadzenie) i to, czy
// użytkownik ma własne dane. Odświeżane przy każdym wejściu na zakładkę „Dziś”. [M1-audytor-generalny-101]
// Od D3a lista trwających (najwyżej 2, D-092): żaden nie znika z „Dziś” [M3 D3a].
// ============================================================================

import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { restoreTimerState, type TimerState } from '../core/bake-session';
import { idSesji, sesjeDoPokazania, type BakeSession } from '../data/bake-session-store';
import { loadActiveBakeSessionsZWersja } from '../data/bake-sessions-store';
import { getActiveBake, getBakeLogs, getRecipes, getStarters } from '../data/sqlite-store';
import { wykonajOdlozonaProsbeOOcene } from '../lib/prosba-o-ocene-odlozona';

export interface TrwajacyNaStarcie {
  id: string;
  sesja: BakeSession;
  zegar: TimerState;
}

export interface DaneStartu {
  gotowe: boolean;
  /** Trwające wypieki od najstarszego (pusta lista = nic nie trwa). */
  wypieki: TrwajacyNaStarcie[];
  teraz: number;
  maDane: boolean;
}

export function useStanStartu(): DaneStartu {
  const [dane, ustaw] = useState<DaneStartu>({ gotowe: false, wypieki: [], teraz: Date.now(), maDane: false });

  useFocusEffect(
    useCallback(() => {
      let aktywny = true;
      // Wejście na „Dziś”: odłożona prośba o ocenę po wypieku ≤ 2★ (D-089) [reaudit-noc N-12]
      wykonajOdlozonaProsbeOOcene();
      void (async () => {
        // Nieudany odczyt zapisu to brak sesji, nie zgadnięty krok (bake-session-store parsuje z unknown)
        const zapis = await loadActiveBakeSessionsZWersja().catch(() => []);
        const sesje = sesjeDoPokazania(getActiveBake(), zapis);
        const [wpisy, zakwasy, receptury] = await Promise.all([
          getBakeLogs().catch(() => []),
          getStarters().catch(() => []),
          getRecipes().catch(() => []),
        ]);
        const teraz = Date.now();
        if (!aktywny) return;
        ustaw({
          gotowe: true,
          wypieki: sesje.map(({ sesja }) => ({ id: idSesji(sesja), sesja, zegar: restoreTimerState(sesja, teraz) })),
          teraz,
          maDane: wpisy.length > 0 || zakwasy.length > 0 || receptury.some((r) => !r.isBuiltIn),
        });
      })();
      return () => {
        aktywny = false;
      };
    }, [])
  );

  return dane;
}
