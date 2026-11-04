// ============================================================================
// Piekarz — czy formularz w arkuszu zmieniono od otwarcia (04-007, M3 p7)
// Zdjęcie wartości przy otwarciu arkusza (pierwszy render z `visible`); zmieniony = obecne wartości inne niż
// zdjęcie. Arkusz pyta wtedy „Odrzucić zmiany?” przy „Anuluj” i przesunięciu w dół (ArkuszKart, confirmDiscard).
// Tylko stan interfejsu: nie czyta ani nie zapisuje danych.
// ============================================================================

import { useRef } from 'react';

export function useZmienionyFormularz(visible: boolean, wartosci: readonly unknown[]): boolean {
  const klucz = JSON.stringify(wartosci);
  const zdjecie = useRef<string | null>(null);
  if (!visible) {
    zdjecie.current = null;
    return false;
  }
  if (zdjecie.current === null) zdjecie.current = klucz;
  return zdjecie.current !== klucz;
}
