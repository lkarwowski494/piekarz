// ============================================================================
// Piekarz — parametry receptury na ekranie receptury (app/(tabs)/receptury/receptura.tsx): tryb liczenia, bochenki,
// masy, mąki, proporcje, zaczyn, DDT i wspólne ustawienie formuły wczytanej receptury (applyFormula). Wydzielone
// z ekranu bez zmiany zachowania (M3 p3, limit 20 480 B): te same wartości startowe i ta sama kolejność ustawień.
// ============================================================================

import { useCallback, useState } from 'react';
import type { FlourItemInput } from '../core/domain-rules';
import type { PrefermentType } from '../core/preferments';
import type { PendingRecipeFormula } from '../lib/recipe-navigation';
import { MASTER_RECIPES } from '../recipes/presets';

export type CalculationMode = 'loaves' | 'flour';

export function useParametryReceptury() {
  const [calcMode, setCalcMode] = useState<CalculationMode>('loaves');
  const [loavesCount, setLoavesCount] = useState<number>(2);
  const [loafWeightGrams, setLoafWeightGrams] = useState<number>(850);
  const [flourGrams, setFlourGrams] = useState<number>(500);

  // Recipe parameters
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MASTER_RECIPES[0].id);
  const [recipeName, setRecipeName] = useState<string>(MASTER_RECIPES[0].namePl);
  const [flourBlend, setFlourBlend] = useState<FlourItemInput[]>([
    { name: 'Mąka pszenna typ 750 (chlebowa)', percentage: 80.0, type: 'pszenna_750' },
    { name: 'Mąka żytnia typ 720', percentage: 20.0, type: 'zytnia_720' },
  ]);
  const [waterPct, setWaterPct] = useState<number>(68.0);
  const [starterPct, setStarterPct] = useState<number>(20.0);
  const [saltPct, setSaltPct] = useState<number>(2.0);
  const [yeastPct, setYeastPct] = useState<number>(0); // drożdże z receptury [M1-audytor-generalny-092]
  const [starterHydration, setStarterHydration] = useState<number>(100.0);

  // DDT parameters
  const [targetDdt, setTargetDdt] = useState<number>(25.0);

  // Artisan Preferments state
  const [prefermentType, setPrefermentType] = useState<PrefermentType>('direct');
  const [prefermentFlourPct, setPrefermentFlourPct] = useState<number>(20.0);

  // Unified recipe setter
  const applyFormula = useCallback((id: string, name: string, formula: PendingRecipeFormula, ddt?: number) => {
    setSelectedPresetId(id);
    setRecipeName(name);
    setFlourBlend(formula.flours);
    setWaterPct(formula.waterPercentage);
    setStarterPct(formula.starterPercentage);
    setSaltPct(formula.saltPercentage);
    setYeastPct(formula.extraYeastPercentage ?? 0);
    setStarterHydration(formula.starterHydration ?? 100.0);
    if (ddt !== undefined) setTargetDdt(ddt);
  }, []);

  return {
    calcMode, setCalcMode, loavesCount, setLoavesCount, loafWeightGrams, setLoafWeightGrams, flourGrams, setFlourGrams,
    selectedPresetId, setSelectedPresetId, recipeName, setRecipeName, flourBlend, setFlourBlend,
    waterPct, setWaterPct, starterPct, setStarterPct, saltPct, setSaltPct, yeastPct, setYeastPct,
    starterHydration, setStarterHydration, targetDdt, setTargetDdt,
    prefermentType, setPrefermentType, prefermentFlourPct, setPrefermentFlourPct,
    applyFormula,
  };
}
