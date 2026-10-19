// ============================================================================
// Apps4Brew Studio — usePendingRecipeLoader
// Kalkulator: wczytanie receptury przekazanej z innego ekranu (start i subskrypcja).
// ============================================================================

import { useEffect } from 'react';
import {
  getPendingRecipeToLoad,
  clearPendingRecipeToLoad,
  subscribePendingRecipe,
  PendingRecipeToLoad,
} from '../lib/recipe-navigation';

export function usePendingRecipeLoader(
  applyPending: (pending: PendingRecipeToLoad) => void,
  onMount: () => void,
  deps: unknown[],
) {
  useEffect(() => {
    onMount();

    const initialPending = getPendingRecipeToLoad();
    if (initialPending) {
      applyPending(initialPending);
      clearPendingRecipeToLoad();
    }

    const unsubscribe = subscribePendingRecipe((pending) => {
      applyPending(pending);
      clearPendingRecipeToLoad();
    });

    return unsubscribe;
  }, deps);
}
