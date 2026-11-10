// ============================================================================
// Piekarz — wersje drożdżowe receptur na zakwasie: przełącznik „na zakwasie / na drożdżach” (D-154) w 4 recepturach
// (D-173). Dane z treści roli 06: docs/tresci/pl|en/wersje-drozdzowe.md (procent drożdży świeżych względem mąki,
// D-100; rodzaj drożdży nieokreślony w źródłach orkiszu i żyta liczony jako świeże, D-178; tartine z przelicznika
// D-172). Woda i sól zmieniają się tylko tam, gdzie treść je podaje (żyto, ZYT-DRO-001); mąki zostają z receptury.
// Czasy etapów planu: src/recipes/yeast-stages.ts (D-155, D-174). Wskazówki to klucze PL dla t() [M3 p9b].
// ============================================================================

import type { DoughRecipeInput } from '../core/domain-rules';
import type { WersjaWypieku } from '../data/wybory-parsery';

export interface WersjaDrozdzowa {
  /** Drożdże świeże, % masy mąki (DoughRecipeInput.extraYeastPercentage, D-100). */
  drozdzeSwiezeProc: number;
  /** Woda i sól wersji, % masy mąki; brak = jak w recepturze (treść ich nie podaje). */
  wodaProc?: number;
  solProc?: number;
  /** Wskazówki wersji zamiast wskazówek receptury na zakwasie (zdania treści bez znaczników źródeł). */
  notesPl: string;
}

export const WERSJE_DROZDZOWE: Readonly<Record<string, WersjaDrozdzowa>> = {
  // DRO-WER-SP-001, DRO-WER-SP-002, DRO-MOD-016; D-178
  spelt_ancient_seeded: {
    drozdzeSwiezeProc: 3,
    notesPl:
      'Na drożdżach: 3% drożdży względem mąki (badanie nie podaje ich rodzaju, Piekarz liczy je jako świeże), a od zarobienia ciasta do wstawienia chleba do pieca mijają około 3 godziny w temperaturze pokojowej. Z nocą w lodówce: 1% drożdży, ciasto stoi 18 godzin w lodówce w 4 °C, a potem jeszcze 3 godziny w temperaturze pokojowej. Ilość drożdży i czasy pochodzą z badania chleba z pełnoziarnistej mąki orkiszowej. Czasy są wskazówką: gotowość ciasta ocenia się wyglądem i testem palca.',
  },
  // DRO-WER-GR-001, DRO-MOD-016
  graham_bread_honey: {
    drozdzeSwiezeProc: 2,
    notesPl:
      'Na drożdżach: 2% drożdży świeżych względem mąki. W badaniu chleba z mąki pszennej razowej ciasto fermentowało 15 minut, po podziale jeszcze 15 minut, a w formie rosło 70 minut w komorze o temperaturze 32 °C. W chłodniejszym pomieszczeniu ciasto rośnie dłużej, więc gotowość ocenia się wyglądem i testem palca, nie czasem.',
  },
  // ZYT-DRO-001, ZYT-DRO-002; D-178
  rye_100_pan: {
    drozdzeSwiezeProc: 3,
    wodaProc: 76,
    solProc: 1.2,
    notesPl:
      'Na drożdżach, bez zakwasu: 3% drożdży (badanie nie podaje ich rodzaju, Piekarz liczy je jako świeże), 76% wody i 1,2% soli względem mąki. W badaniu ciasto odpoczywało 60 minut w 28 °C, a bochenki rosły w formie 60 minut w 37 °C w komorze garowniczej. Chleb pieczono 10 minut w 240 °C i 35 minut w 220 °C. W dniu wypieku chleby z pełnoziarnistej mąki żytniej były zbyt lepkie do oceny, dlatego badano je następnego dnia.',
  },
  // DRO-WER-TA-001 (szczebel 4, atrybucja „według jednego przepisu”), przelicznik D-172
  tartine_high_hydration_80: {
    drozdzeSwiezeProc: 1.7,
    notesPl:
      'Na drożdżach, według jednego przepisu na chleb bez wyrabiania o podobnej ilości wody: 1 łyżeczka drożdży instant, czyli według przelicznika Piekarza około 1,7% drożdży świeżych względem mąki. Ciasto stoi w temperaturze pokojowej przez noc, co najmniej 8 godzin, a uformowany bochenek rośnie potem około 90 minut.',
  },
};

/** Wersja drożdżowa receptury; null = receptura bez przełącznika (D-154: bez źródła wersji nie ma przełącznika). */
export function wersjaDrozdzowa(recipeId: string | undefined): WersjaDrozdzowa | null {
  return recipeId !== undefined && Object.prototype.hasOwnProperty.call(WERSJE_DROZDZOWE, recipeId) ? WERSJE_DROZDZOWE[recipeId] ?? null : null;
}

/**
 * Wersja do „Piecz ponownie” z wpisu Dziennika (bakes.leaven, D-242 Z3): tylko dla receptury z przełącznikiem;
 * wpis bez wersji (NULL, sprzed p9) albo receptura bez przełącznika = brak (bez zgadywania) [M3 p9b].
 */
export function wersjaZWpisu(leaven: 'sourdough' | 'yeast' | null | undefined, recipeId: string | undefined): WersjaWypieku | undefined {
  if (!wersjaDrozdzowa(recipeId)) return undefined;
  if (leaven === 'yeast') return 'drozdze';
  if (leaven === 'sourdough') return 'zakwas';
  return undefined;
}

/**
 * Formuła wybranej wersji: „na drożdżach” = bez zakwasu, drożdże świeże wersji (oraz woda i sól, jeśli treść je podaje);
 * „na zakwasie” albo receptura bez wersji drożdżowej = formuła receptury bez zmian.
 */
export function formulaWersji<F extends Pick<DoughRecipeInput, 'starterPercentage' | 'waterPercentage' | 'saltPercentage' | 'extraYeastPercentage'>>(
  formula: F,
  recipeId: string | undefined,
  wersja: WersjaWypieku,
): F {
  const w = wersjaDrozdzowa(recipeId);
  if (wersja !== 'drozdze' || !w) return formula;
  return {
    ...formula,
    starterPercentage: 0,
    extraYeastPercentage: w.drozdzeSwiezeProc,
    ...(w.wodaProc !== undefined ? { waterPercentage: w.wodaProc } : {}),
    ...(w.solProc !== undefined ? { saltPercentage: w.solProc } : {}),
  };
}
