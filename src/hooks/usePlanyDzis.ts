// ============================================================================
// Piekarz — zaplanowane wypieki na „Dziś”: arkusz planu, start i usunięcie (BR-KAL-009, D-104, D-108) [M3 D5]
// Start tylko z dostępem i z pytaniem z D-104: przy jednym trwającym „Prowadź oba” / „Wróć do: …” / „Anuluj”, przy
// dwóch „Prowadzisz już 2 wypieki”. Usunięcie rutynowe według słownika interakcji (design-spec §5, D-051 1a): bez
// pytania, pasek „Usunięto plan wypieku” z „Przywróć”. Nieudany zapis: „Nie zapisano” (guardSave), nic nie znika po cichu.
// ============================================================================

import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { PlannedBake } from '../data/bake-sessions-store';
import { MAX_TRWAJACYCH_WYPIEKOW } from '../core/limity-wypiekow';
import { confirmLimitPlanow, confirmLimitWypiekow, confirmStartPrzyTrwajacym } from '../lib/confirm';
import { trwajaceWypieki, utrwalWypiekZPamieci } from '../lib/przerwij-wypiek';
import { przywrocPlan, usunPlan, zacznijPlan } from '../lib/plany-akcje';
import { guardSave } from '../lib/save-guard';
import { t } from '../lib/i18n';

export function usePlanyDzis({ onZmiana, otworzWypiek, requireActionAccess }: {
  onZmiana: () => void;
  otworzWypiek: (id: string) => void;
  requireActionAccess: (fn: () => void) => void;
}) {
  const [otwarty, ustawOtwarty] = useState<string | null>(null);
  const [usuniety, ustawUsuniety] = useState<PlannedBake | null>(null);
  const zamknij = useCallback(() => ustawOtwarty(null), []);
  const wroc = useCallback((id: string) => {
    ustawOtwarty(null);
    otworzWypiek(id);
  }, [otworzWypiek]);

  const zacznij = useCallback((p: PlannedBake) => {
    const start = () =>
      void guardSave(async () => {
        const r = await zacznijPlan(p, Date.now());
        onZmiana();
        if (r.ok) return wroc(p.id);
        if (r.error.kind === 'limit') return confirmLimitWypiekow(await trwajaceWypieki(), wroc);
        ustawOtwarty(null);
        Alert.alert(t('Tego planu już nie ma.'));
      })();
    requireActionAccess(() => {
      void trwajaceWypieki().then((trwajace) => {
        const [trwa] = trwajace;
        if (!trwa) return start();
        if (trwajace.length >= MAX_TRWAJACYCH_WYPIEKOW) return confirmLimitWypiekow(trwajace, wroc);
        // Wypiek z pamięci bez zapisu najpierw do zapisu (jak start z planu, D-104)
        confirmStartPrzyTrwajacym(trwa, () => void utrwalWypiekZPamieci().then((ok) => ok && start()), wroc);
      });
    });
  }, [onZmiana, requireActionAccess, wroc]);

  const usun = useCallback((p: PlannedBake) => {
    void guardSave(async () => {
      await usunPlan(p.id);
      ustawOtwarty(null);
      ustawUsuniety(p);
      onZmiana();
    })();
  }, [onZmiana]);

  const ukryj = useCallback(() => ustawUsuniety(null), []);
  const przywroc = useCallback(() => {
    if (!usuniety) return;
    const p = usuniety;
    ustawUsuniety(null);
    void guardSave(async () => {
      const r = await przywrocPlan(p);
      // W międzyczasie dodano piąty plan: limit, nic nie nadpisane
      if (!r.ok) confirmLimitPlanow(() => undefined);
      onZmiana();
    })();
  }, [usuniety, onZmiana]);

  const cofnij = useMemo(() => (usuniety ? { tekst: t('Usunięto plan wypieku'), przywroc, ukryj } : null), [usuniety, przywroc, ukryj]);
  return { otwarty, otworz: ustawOtwarty, zamknij, zacznij, usun, cofnij };
}
