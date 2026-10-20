// ============================================================================
// Piekarz — historia wypieków: wpisy, filtr smaku, statystyki, usunięcie i „Piecz ponownie”
// Wydzielone ze Stolnicy (limit 20 KB), żeby ten sam dziennik mógł pokazać inny ekran (D-051 2a).
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { t } from '../lib/i18n';
import { guardSave } from '../lib/save-guard';
import { tapHaptic } from '../lib/haptics';
import { confirmDeleteBakeLog } from '../lib/confirm';
import { getBakeLogs, deleteBakeLog, getRecipes } from '../data/sqlite-store';
import { StoredBakeLog } from '../data/db';
import { setPendingRecipeToLoad, prepareBakeAgainRecipe } from '../lib/recipe-navigation';
import { calculateBakeStatistics, filterBakeLogs } from '../core/bake-statistics';

export type FiltrSmaku = 'all' | 'mild' | 'balanced' | 'sour' | 'tangy';

/** Dziennik wypieków z bazy; `requireActionAccess` to jedyny strażnik dostępu ekranu (useAppAccess). */
export function useBakeHistory(requireActionAccess: (action?: () => void | Promise<void>) => boolean) {
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

  const handleBakeAgain = async (log: StoredBakeLog) => {
    requireActionAccess(async () => {
      tapHaptic(Haptics.ImpactFeedbackStyle.Medium);

      try {
        const custom = await getRecipes();
        const pending = prepareBakeAgainRecipe(log, custom);
        setPendingRecipeToLoad(pending);

        router.navigate('/(tabs)');
        Alert.alert(
          t('Załadowano recepturę'),
          t('Parametry bochenka „{name}” zostały załadowane do kalkulatora.', {
            name: log.recipeName,
          })
        );
      } catch {
        router.navigate('/(tabs)');
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
