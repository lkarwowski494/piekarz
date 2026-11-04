// ============================================================================
// Piekarz — „Zapisz plan” w trybie maszyny (D-242 Z6 a, karty/README.md wiersz D-138): zaplanowany wypiek w
// bake_sessions z `tryb: 'maszyna'` (wpis Dziennika dostaje bake_method, D-260), widoczny na „Dziś”, w limicie 5
// zaplanowanych. Jeden krok programu maszyny z istniejącej kategorii `bake` (warunek G4: build 1021 odczyta sesję),
// bierny, od startu programu do gotowości; bez prowadzenia krok po kroku (BRD go nie wymaga) [M3 p9b2].
// ============================================================================

import type { SessionStep } from '../core/bake-steps';
import { calculateDoughRecipeFromFlour, type DoughRecipeInput } from '../core/domain-rules';
import { savePlannedBake, type PlannedBake, type ZapisSesji } from '../data/bake-sessions-store';

/** Id kroku programu: prefiks `maszyna_` wyłącza zegar dwóch faz garnka (isDutchOvenStep). */
export const ID_KROKU_MASZYNY = 'maszyna_program';
/** Instrukcja kroku: zdanie machine.order (rola 06, MAS-060); tłumaczone przy wyświetlaniu. */
export const INSTRUKCJA_KROKU_MASZYNY = 'Kolejność wkładania składników podaje instrukcja Twojej maszyny.';

export interface WejsciePlanuMaszyny {
  recipeId: string;
  recipeName: string;
  formula: DoughRecipeInput;
  makaG: number;
  /** Wersja drożdżowa receptury na zakwasie (D-156): do sesji i wpisu (bakes.leaven). */
  przezWersjeDrozdzowa: boolean;
  startMs: number;
  czasProgramuMin: number;
  nowMs: number;
}

export function planMaszyny(w: WejsciePlanuMaszyny): PlannedBake {
  const id = `bake_${w.nowMs}`;
  const krok: SessionStep = {
    id: ID_KROKU_MASZYNY,
    name: 'Program i godzina',
    category: 'bake',
    durationMin: w.czasProgramuMin,
    isPassive: true,
    instructions: INSTRUKCJA_KROKU_MASZYNY,
    plannedStart: w.startMs,
    plannedEnd: w.startMs + w.czasProgramuMin * 60_000,
  };
  return {
    version: 1,
    id,
    recipeName: w.recipeName,
    recipeId: w.recipeId,
    plannedStartAt: w.startMs,
    steps: [krok],
    bake: {
      id,
      recipeName: w.recipeName,
      startedAt: w.startMs,
      currentStageId: krok.id,
      isHighRye: false,
      steps: [krok],
      calculatedRecipe: calculateDoughRecipeFromFlour(w.makaG, w.formula),
      recipeFormula: w.formula,
      recipeId: w.recipeId,
      tryb: 'maszyna',
      ...(w.przezWersjeDrozdzowa ? { wersja: 'drozdze' as const } : {}),
    },
  };
}

export function zapiszPlanMaszyny(w: WejsciePlanuMaszyny): Promise<ZapisSesji> {
  return savePlannedBake(planMaszyny(w));
}
