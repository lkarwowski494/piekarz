// ============================================================================
// Piekarz — zaplanowane wypieki na „Dziś”: arkusz planu, start i usunięcie (BR-KAL-009, D-104, D-108) [M3 D5]
// Start zapisanego planu jest w Basic (kontrakt docs/monetyzacja.md: „zaplanowany wcześniej wypiek da się zacząć”), z pytaniem
// z D-104: przy jednym trwającym „Prowadź oba” (Pro: dwa wypieki naraz, BR-KAL-016) / „Wróć do: …” / „Anuluj”, przy
// dwóch „Prowadzisz już 2 wypieki”. Usunięcie rutynowe według słownika interakcji (design-spec §5, D-051 1a): bez
// pytania, pasek „Usunięto plan wypieku” z „Przywróć”. Nieudany zapis: „Nie zapisano” (guardSave), nic nie znika po cichu.
// ============================================================================

import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { PlannedBake } from '../data/bake-sessions-store';
import type { Funkcja } from '../lib/platnosci/konfiguracja';
import { MAX_TRWAJACYCH_WYPIEKOW } from '../core/limity-wypiekow';
import { confirmLimitPlanow, confirmLimitWypiekow, confirmStartPrzyTrwajacym } from '../lib/confirm';
import { trwajaceWypieki, utrwalWypiekZPamieci } from '../lib/przerwij-wypiek';
import { przywrocPlan, usunPlan, zacznijPlan } from '../lib/plany-akcje';
import { guardSave } from '../lib/save-guard';
import { t } from '../lib/i18n';
import { etykietaPro } from '../lib/platnosci/nazwy-pro';
import { useProPoArkuszu } from './useProPoArkuszu';

export function usePlanyDzis({ onZmiana, otworzWypiek, requireActionAccess, moze }: {
  onZmiana: () => void;
  otworzWypiek: (id: string) => void;
  requireActionAccess: (funkcja: Funkcja, fn: () => void) => void;
  /** Czy funkcja działa teraz: bez Pro „Prowadź oba” ma w pytaniu „Pro” (P2-4) [M3 P-b]. */
  moze?: (funkcja: Funkcja) => boolean;
}) {
  const [otwarty, ustawOtwarty] = useState<string | null>(null);
  const [usuniety, ustawUsuniety] = useState<PlannedBake | null>(null);
  const zamknij = useCallback(() => ustawOtwarty(null), []);
  const { otworzPro, poZamknieciu } = useProPoArkuszu();
  /** Funkcja Pro bez Pro z arkusza planu („Dodaj do kalendarza”): arkusz zamknięty, ekran Pro po nim (D-117). */
  const pro = useCallback((wznow?: () => void | Promise<void>) => otworzPro(zamknij, wznow), [otworzPro, zamknij]);
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
    requireActionAccess('harmonogram', () => {
      void trwajaceWypieki().then((trwajace) => {
        const [trwa] = trwajace;
        if (!trwa) return start();
        if (trwajace.length >= MAX_TRWAJACYCH_WYPIEKOW) return confirmLimitWypiekow(trwajace, wroc);
        // Wypiek z pamięci bez zapisu najpierw do zapisu (jak start z planu, D-104); drugi trwający to Pro: bez Pro
        // najpierw zamknięcie arkusza planu, ekran Pro po nim (D-117) [04-studio-projektowe-005]
        // Po zakupie Pro oba wypieki ruszają same (018, W-fix2)
        const prowadzOba = () => void utrwalWypiekZPamieci().then((ok) => ok && start());
        const oba = () => (moze?.('dwa-wypieki') === false
          ? otworzPro(zamknij, prowadzOba)
          : requireActionAccess('dwa-wypieki', prowadzOba));
        confirmStartPrzyTrwajacym(trwa, oba, wroc, etykietaPro(t('Prowadź oba'), moze?.('dwa-wypieki') ?? true));
      });
    });
  }, [onZmiana, requireActionAccess, moze, wroc, otworzPro, zamknij]);

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
  return { otwarty, otworz: ustawOtwarty, zamknij, zacznij, usun, cofnij, pro, poZamknieciu };
}
