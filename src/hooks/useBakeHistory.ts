// ============================================================================
// Piekarz — historia wypieków: wpisy, filtr smaku, statystyki, usunięcie i „Piecz ponownie”
// Wydzielone ze Stolnicy (limit 20 KB), żeby ten sam dziennik mógł pokazać inny ekran (D-051 2a).
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { guardSave } from '../lib/save-guard';
import { tapHaptic } from '../lib/haptics';
import { confirmDeleteBakeLog } from '../lib/confirm';
import { getBakeLogs, deleteBakeLog, getRecipes } from '../data/sqlite-store';
import { StoredBakeLog } from '../data/db';
import { bazowaZmienionaOdWypieku, prepareBakeAgainRecipe } from '../lib/recipe-navigation';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { calculateDoughRecipe } from '../core/domain-rules';
import { calculateBakeStatistics, filterBakeLogs } from '../core/bake-statistics';
import type { Funkcja } from '../lib/platnosci/konfiguracja';

/** Masa ciasta, gdy receptura jej nie ma: jak domyślnie na ekranie receptury (2 bochenki po 850 g). */
const MASA_DOMYSLNA_G = 2 * 850;

export type FiltrSmaku = 'all' | 'mild' | 'balanced' | 'sour' | 'tangy';

/** Dziennik wypieków z bazy; `requireActionAccess` to jedyny strażnik dostępu ekranu (useAppAccess). */
export function useBakeHistory(requireActionAccess: (funkcja: Funkcja, action?: () => void | Promise<void>) => boolean) {
  const router = useRouter();
  const [bakeHistory, setBakeHistory] = useState<StoredBakeLog[]>([]);
  const [selectedTasteFilter, setSelectedTasteFilter] = useState<FiltrSmaku>('all');

  const bakeStats = useMemo(() => calculateBakeStatistics(bakeHistory), [bakeHistory]);
  const filteredHistory = useMemo(() => {
    return filterBakeLogs(bakeHistory, { tasteProfile: selectedTasteFilter });
  }, [bakeHistory, selectedTasteFilter]);

  const loadHistory = useCallback(async () => {
    const logs = await getBakeLogs();
    setBakeHistory(logs);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // „Piecz ponownie” w Basic (BR-RECP-003, D-113)
  const handleBakeAgain = async (log: StoredBakeLog) => {
    requireActionAccess('historia', async () => {
      tapHaptic(Haptics.ImpactFeedbackStyle.Medium);

      // BR-RECP-003 „Następny wypiek z wpisu”: plan wypieku (PR-02) z tą samą recepturą i notatką z wpisu
      // (wariant BRD, D-070) [M1-audytor-generalny-146]
      try {
        const custom = await getRecipes();
        const pending = prepareBakeAgainRecipe(log, custom);
        // Receptury z tą nazwą już nie ma: lista receptur zamiast zmyślonej formuły [audyt-niezalezny D-10]
        if (!pending) {
          router.navigate('/receptury');
          return;
        }
        const recipeFormula = { ...pending.formula, targetDoughWeightGrams: pending.formula.targetDoughWeightGrams ?? MASA_DOMYSLNA_G };
        ustawRecepturePlanu({
          recipeName: pending.name,
          // Id receptury do wypieku i informacja o zmianie receptury bazowej (D-10 pełne, 217) [M3 D3a]
          ...(pending.id !== undefined ? { recipeId: pending.id } : {}),
          ...(bazowaZmienionaOdWypieku(log, pending) ? { bazowaZmieniona: true } : {}),
          calculatedRecipe: calculateDoughRecipe(recipeFormula),
          recipeFormula,
          notatka: log.notes?.trim() || undefined,
        });
        router.navigate('/receptury/harmonogram');
      } catch {
        router.navigate('/receptury');
      }
    });
  };

  const handleDeleteBakeLog = (id: string) => {
    confirmDeleteBakeLog(guardSave(async () => {
      await deleteBakeLog(id);
      await loadHistory();
    }));
  };

  return {
    bakeHistory,
    bakeStats,
    filteredHistory,
    selectedTasteFilter,
    setSelectedTasteFilter,
    loadHistory,
    handleBakeAgain,
    handleDeleteBakeLog,
  };
}
