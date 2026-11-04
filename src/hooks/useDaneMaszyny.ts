// ============================================================================
// Piekarz — dane maszyny użytkownika na ekranie receptury (BR-MASZ-002 „Dane maszyny zapamiętane”, D-242 Z4 a):
// odczyt raz na otwarcie trybu, zapis przez guardSave („Nie zapisano”, dane działają w tej sesji). Brak albo
// nieczytelna wartość = brak danych: ekran prosi o granice (brak zostaje brakiem); surowa nieczytelna treść trafia do
// pliku ratunkowego przy zapisie (zapiszMaszyne) [M3 p9b2].
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { wczytajMaszyne, zapiszMaszyne, type DaneMaszyny } from '../data/wybory-uzytkownika';
import { guardSave } from '../lib/save-guard';

export type StanDanychMaszyny = { ladowanie: true } | { ladowanie: false; dane: DaneMaszyny | null };

export function useDaneMaszyny(wlaczony: boolean) {
  const [stan, setStan] = useState<StanDanychMaszyny>({ ladowanie: true });
  useEffect(() => {
    if (!wlaczony) return;
    let zywy = true;
    void wczytajMaszyne()
      .catch(() => null)
      .then((r) => {
        if (zywy) setStan({ ladowanie: false, dane: r && r.ok ? r.value : null });
      });
    return () => {
      zywy = false;
    };
  }, [wlaczony]);
  const zapisz = useCallback((d: DaneMaszyny) => {
    setStan({ ladowanie: false, dane: d });
    void guardSave(() => zapiszMaszyne(d))();
  }, []);
  return { stan, zapisz };
}
