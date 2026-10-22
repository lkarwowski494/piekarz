// ============================================================================
// Piekarz — „Zrobione” i „Pomiń” przy zaległym na „Dziś” i w arkuszu dnia (BR-KAL-003, BR-KAL-007; D-106) [M3 D4b]
// Karmienie: „Zrobione” zapisuje dokarmienie teraz (pasek „Przywróć” cofa ten jeden wpis), „Pomiń” zapisuje decyzję.
// Krok wypieku: „Zrobione” otwiera Stolnicę tego wypieku (kroku nie odhaczamy z paska), „Pomiń” przechodzi do
// następnego kroku jak arkusz „Plan wypieku”. Nieudany zapis: „Nie zapisano” (guardSave), nic nie znika po cichu.
// ============================================================================

import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { ZdarzenieKalendarza } from '../core/kalendarz-zdarzenia';
import { cofnijKarmienie, pominKarmienie, pominKrokWypieku, zrobioneKarmienie } from '../lib/kalendarz-akcje';
import { guardSave } from '../lib/save-guard';
import { t } from '../lib/i18n';

export interface CofnijDzis {
  tekst: string;
  przywroc: () => void;
  ukryj: () => void;
}

export function useAkcjeDzis({ onZmiana, otworzWypiek, otworzPlan }: { onZmiana: () => void; otworzWypiek: (id: string) => void; otworzPlan?: (id: string) => void }) {
  const [cofnij, ustawCofnij] = useState<{ tekst: string; wpisId: string } | null>(null);
  const ukryj = useCallback(() => ustawCofnij(null), []);

  const onZrobione = useCallback(
    (z: ZdarzenieKalendarza) => {
      if (z.zrodlo.typ === 'wypiek') {
        // Zaległy start planu: arkusz planu ze startem (D-104) albo usunięciem [M3 D5]
        if (z.zaplanowany && otworzPlan) otworzPlan(z.zrodlo.id);
        else otworzWypiek(z.zrodlo.id);
        return;
      }
      if (z.zrodlo.typ !== 'zakwas') return;
      const { id } = z.zrodlo;
      void guardSave(async () => {
        const wpis = await zrobioneKarmienie(id, Date.now());
        ustawCofnij({ tekst: t('Zapisano dokarmienie zakwasu {zakwas}.', { zakwas: z.nazwa }), wpisId: wpis.id });
        onZmiana();
      })();
    },
    [onZmiana, otworzWypiek, otworzPlan]
  );

  const onPomin = useCallback(
    (z: ZdarzenieKalendarza) => {
      const { typ, id } = z.zrodlo;
      void guardSave(async () => {
        if (typ === 'zakwas') await pominKarmienie(id, Date.now());
        else if (typ === 'wypiek') {
          const wynik = await pominKrokWypieku(id, Date.now());
          if (wynik === 'brak') Alert.alert(t('Ten wypiek jest już zakończony albo przerwany.'));
          if (wynik === 'ostatni') otworzWypiek(id);
        }
        ustawCofnij(null);
        onZmiana();
      })();
    },
    [onZmiana, otworzWypiek]
  );

  const przywroc = useCallback(() => {
    if (!cofnij) return;
    const { wpisId } = cofnij;
    ustawCofnij(null);
    void guardSave(async () => {
      await cofnijKarmienie(wpisId);
      onZmiana();
    })();
  }, [cofnij, onZmiana]);

  return useMemo(
    () => ({ onZrobione, onPomin, cofnij: cofnij ? { tekst: cofnij.tekst, przywroc, ukryj } : null }),
    [onZrobione, onPomin, cofnij, przywroc, ukryj]
  );
}
