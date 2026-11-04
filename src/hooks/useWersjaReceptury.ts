// ============================================================================
// Piekarz — wybór wersji „na zakwasie / na drożdżach” na ekranie receptury (D-154, D-173): wersja zapamiętana
// dla receptury (D-242 Z1 b, `wersje_receptur` w app_settings), przy wyborze zapis przez guardSave („Nie zapisano”,
// wybór działa w tej sesji). Receptura bez wersji drożdżowej: brak wyboru (null) [M3 p9b].
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { wczytajWersjeReceptury, zapiszWersjeReceptury, type WersjaWypieku } from '../data/wybory-uzytkownika';
import { wersjaDrozdzowa } from '../recipes/wersje-drozdzowe';
import { guardSave } from '../lib/save-guard';

/**
 * Wersja receptury `recipeId`: null = receptura bez przełącznika. `zastosuj` dostaje wersję po odczycie zapamiętanej
 * i po każdym wyborze (ekran ustawia wtedy formułę wersji).
 */
export function useWersjaReceptury(recipeId: string, zastosuj: (w: WersjaWypieku) => void) {
  const ma = wersjaDrozdzowa(recipeId) !== null;
  const [wersja, setWersja] = useState<WersjaWypieku>('zakwas');
  useEffect(() => {
    if (!ma) return;
    let zywy = true;
    setWersja('zakwas');
    // Błąd odczytu: domyślna „na zakwasie” (preferencja interfejsu), formuła receptury bez zmian
    void wczytajWersjeReceptury(recipeId).catch((): WersjaWypieku => 'zakwas').then((w) => {
      if (!zywy) return;
      setWersja(w);
      if (w === 'drozdze') zastosuj(w);
    });
    return () => {
      zywy = false;
    };
  }, [recipeId, ma]); // eslint-disable-line react-hooks/exhaustive-deps
  const wybierz = useCallback(
    (w: WersjaWypieku) => {
      setWersja(w);
      zastosuj(w);
      void guardSave(() => zapiszWersjeReceptury(recipeId, w))();
    },
    [recipeId, zastosuj],
  );
  return { wersja: ma ? wersja : null, wybierz };
}
