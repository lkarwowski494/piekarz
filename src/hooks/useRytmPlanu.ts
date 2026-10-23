// ============================================================================
// Piekarz — podpowiedź rytmu z historii dla planu wypieku (BR-KAL-014; D-114) [M3 D7]
// Cienka warstwa: Dziennik z bazy (z recipe_id, D1) → dzienRytmu → przesunięcie dnia „gotowe”. Bez skrótu z arkusza
// dnia (ten ma pierwszeństwo) i bez historii nic nie proponuje. Nieudany odczyt = brak propozycji.
// ============================================================================

import { useEffect, useState } from 'react';
import { getBakeLogs } from '../data/sqlite-store';
import { dzienRytmu, przesuniecieRytmu } from '../core/rytm-wypiekow';
import { nazwaDniaTygodnia } from '../lib/kalendarz-widok';
import { t } from '../lib/i18n';

export interface RytmPlanu {
  /** Przesunięcie dnia „gotowe” (1–7). */
  offset: number;
  /** Zdanie pod wyborem dnia: skąd propozycja i że można ją zmienić. */
  tekst: string;
}

/** `wczytany` = odczyt skończony (z propozycją albo bez); do tej chwili plan nie ustala domyślnej godziny na stałe. */
export function useRytmPlanu(wlaczony: boolean, recipeId: string | null | undefined): { rytm: RytmPlanu | null; wczytany: boolean } {
  const [stan, ustawStan] = useState<{ rytm: RytmPlanu | null; wczytany: boolean }>({ rytm: null, wczytany: !wlaczony });
  useEffect(() => {
    if (!wlaczony) return undefined;
    let zywy = true;
    void getBakeLogs()
      .then((wpisy) => {
        const dzien = dzienRytmu(wpisy, recipeId);
        if (!zywy) return;
        if (dzien === null) {
          ustawStan({ rytm: null, wczytany: true });
          return;
        }
        // Nazwa dnia z Intl (getDay 0 = niedziela → ISO 7)
        const nazwa = nazwaDniaTygodnia(dzien || 7);
        ustawStan({
          rytm: { offset: przesuniecieRytmu(dzien, Date.now()), tekst: t('Propozycja z Dziennika: {dzien}, jak ostatnie wypieki. Możesz wybrać inny dzień.', { dzien: nazwa }) },
          wczytany: true,
        });
      })
      .catch(() => {
        if (zywy) ustawStan({ rytm: null, wczytany: true });
      });
    return () => {
      zywy = false;
    };
  }, [wlaczony, recipeId]);
  return stan;
}
