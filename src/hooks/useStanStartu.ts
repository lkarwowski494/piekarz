// ============================================================================
// Piekarz — dane Startu z bazy: trwający wypiek (ta sama sesja, którą przywraca prowadzenie) i to, czy
// użytkownik ma własne dane. Odświeżane przy każdym wejściu na zakładkę „Dziś”. [M1-audytor-generalny-101]
// ============================================================================

import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { restoreTimerState, type TimerState } from '../core/bake-session';
import { loadBakeSession, pickBakeSession, type BakeSession } from '../data/bake-session-store';
import { getActiveBake, getBakeLogs, getRecipes, getStarters } from '../data/sqlite-store';
import { wykonajOdlozonaProsbeOOcene } from '../lib/prosba-o-ocene-odlozona';

export interface DaneStartu {
  gotowe: boolean;
  sesja: BakeSession | null;
  zegar: TimerState | null;
  teraz: number;
  maDane: boolean;
}

export function useStanStartu(): DaneStartu {
  const [dane, ustaw] = useState<DaneStartu>({ gotowe: false, sesja: null, zegar: null, teraz: Date.now(), maDane: false });

  useFocusEffect(
    useCallback(() => {
      let aktywny = true;
      // Wejście na „Dziś”: odłożona prośba o ocenę po wypieku ≤ 2★ (D-089) [reaudit-noc N-12]
      wykonajOdlozonaProsbeOOcene();
      void (async () => {
        // Nieudany odczyt zapisu to brak sesji, nie zgadnięty krok (bake-session-store parsuje z unknown)
        const zapis = await loadBakeSession().catch(() => null);
        const sesja = pickBakeSession(getActiveBake(), zapis);
        const [wpisy, zakwasy, receptury] = await Promise.all([
          getBakeLogs().catch(() => []),
          getStarters().catch(() => []),
          getRecipes().catch(() => []),
        ]);
        const teraz = Date.now();
        if (!aktywny) return;
        ustaw({
          gotowe: true,
          sesja,
          zegar: sesja ? restoreTimerState(sesja, teraz) : null,
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
