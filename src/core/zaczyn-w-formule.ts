// ============================================================================
// Piekarz — zaczyn jako część formuły (D-061, DEC-23 a) [M1-audytor-generalny-182]
// Mąka, woda, sól i drożdże zaczynu mieszczą się w masie docelowej; zaczyn liczony od mąki bazowej
// (bez mąki zakwasu); przy levainie zakwas jest jego zaszczepem, więc nie ma drugiego wiersza zakwasu.
// Wiersze „Do miski” sumują się do masy ±1 g (DEC-11 a).
// ============================================================================

import { PREFERMENT_DEFINITIONS, PrefermentBreakdownResult, PrefermentType } from './preferments';

export interface ZaczynWFormuleInput {
  prefermentType: PrefermentType;
  prefermentFlourPercentage: number; // % mąki bazowej w zaczynie
  waterPercentage: number;
  saltPercentage: number;
  yeastPercentage: number;
  starterPercentage: number;
  starterHydration: number;
}

export interface ProcentyFormuly {
  waterPercentage: number;
  saltPercentage: number;
  yeastPercentage: number;
}

const bezZaczynu = (i: ZaczynWFormuleInput) => i.prefermentType === 'direct' || i.prefermentFlourPercentage <= 0;

const hydratacjaZaczynu = (i: ZaczynWFormuleInput) =>
  i.prefermentType === 'levain' ? i.starterHydration : PREFERMENT_DEFINITIONS[i.prefermentType].defaultHydration;

/** D-061 reguła 1: woda, sól i drożdże formuły nie mniejsze niż w zaczynie. */
export function procentyFormulyZZaczynem(i: ZaczynWFormuleInput): ProcentyFormuly {
  if (bezZaczynu(i)) return { waterPercentage: i.waterPercentage, saltPercentage: i.saltPercentage, yeastPercentage: i.yeastPercentage };
  const def = PREFERMENT_DEFINITIONS[i.prefermentType];
  const p = i.prefermentFlourPercentage / 100;
  return {
    waterPercentage: Math.max(i.waterPercentage, hydratacjaZaczynu(i) * p),
    saltPercentage: Math.max(i.saltPercentage, def.saltPctOfPrefermentFlour * p),
    yeastPercentage: Math.max(i.yeastPercentage, def.yeastPctOfPrefermentFlour * p),
  };
}

export interface ZaczynWFormuleResult extends PrefermentBreakdownResult {
  /** Zakwas w levainie (zaszczep), w gramach; 0 dla innych zaczynów. */
  prefermentStarterGrams: number;
  /** Zakwas dodawany do miski obok zaczynu (poolish, biga, pâte fermentée), w gramach. */
  doughStarterGrams: number;
}

/**
 * Zaokrąglenie wierszy (gramy całe, dawki co 0,1 g) i korekta ±1 g wierszy gramowych o największej reszcie,
 * każdy najwyżej raz, aż suma różni się od celu o ≤ 1 g (DEC-11 a).
 */
function wiersze(gramy: number[], dawki: number[], celDziesiate: number): { g: number[]; d: number[] } {
  const g = gramy.map((x) => Math.round(x));
  const d = dawki.map((x) => Math.round(x * 10) / 10);
  const pokazane = () => 10 * g.reduce((a, x) => a + x, 0) + d.reduce((a, x) => a + Math.round(x * 10), 0);
  const uzyte = new Set<number>();
  for (;;) {
    const off = celDziesiate - pokazane();
    if (Math.abs(off) <= 10) break;
    const kier = Math.sign(off);
    let wybor = -1;
    for (let k = 0; k < g.length; k++) {
      if (uzyte.has(k) || (kier < 0 && g[k] <= 0)) continue;
      if (wybor < 0 || (g[k] - gramy[k]) * kier < (g[wybor] - gramy[wybor]) * kier) wybor = k;
    }
    if (wybor < 0) break;
    g[wybor] += kier;
    uzyte.add(wybor);
  }
  return { g, d };
}

/**
 * Rozkład zaczynu i ciasta końcowego z procentów formuły (po `procentyFormulyZZaczynem`) i masy docelowej,
 * tym samym wzorem mąki bazowej co `calculateDoughRecipe`. Zwraca null bez zaczynu.
 */
export function zaczynWFormule(i: ZaczynWFormuleInput & { targetDoughWeightGrams: number }): ZaczynWFormuleResult | null {
  if (bezZaczynu(i)) return null;
  if (i.prefermentFlourPercentage > 100) throw new Error('Udział mąki w zaczynie musi mieścić się w przedziale 0–100%');
  const def = PREFERMENT_DEFINITIONS[i.prefermentType];
  const M = i.targetDoughWeightGrams;
  const F = M / ((100 + i.waterPercentage + i.saltPercentage + i.starterPercentage + i.yeastPercentage) / 100);
  const W = (F * i.waterPercentage) / 100;
  const S = (F * i.saltPercentage) / 100;
  const Y = (F * i.yeastPercentage) / 100;
  const Z = (F * i.starterPercentage) / 100;
  const h = hydratacjaZaczynu(i);
  const Fz = (F * i.prefermentFlourPercentage) / 100;
  const Wz = (Fz * h) / 100;
  const Yz = (Fz * def.yeastPctOfPrefermentFlour) / 100;
  const Sz = (Fz * def.saltPctOfPrefermentFlour) / 100;
  const levain = i.prefermentType === 'levain';
  const Zl = levain ? Z : 0;
  const zaczynDokladny = Fz + Wz + Yz + Sz + Zl;
  const zaczynG = Math.round(zaczynDokladny);

  // „Do miski”: zaczyn cały (stały), reszta mąki, reszta wody, zakwas (poza levainem); sól i drożdże co 0,1 g.
  const misa = wiersze([F - Fz, W - Wz, Z - Zl], [S - Sz, Y - Yz], Math.round(M * 10) - 10 * zaczynG);
  // „Zaczyn”: mąka, woda, zakwas (levain); sól i drożdże co 0,1 g — razem = wiersz „cały”.
  const zacz = wiersze([Fz, Wz, Zl], [Yz, Sz], 10 * zaczynG);

  const totalFlour = F + Z / (1 + i.starterHydration / 100);
  const totalWater = W + Z - Z / (1 + i.starterHydration / 100);
  return {
    prefermentType: i.prefermentType,
    prefermentFlourGrams: zacz.g[0],
    prefermentWaterGrams: zacz.g[1],
    prefermentStarterGrams: zacz.g[2],
    prefermentYeastGrams: zacz.d[0],
    prefermentSaltGrams: zacz.d[1],
    prefermentTotalWeightGrams: zaczynG,
    prefermentHydration: h,
    doughAddedFlourGrams: misa.g[0],
    doughAddedWaterGrams: misa.g[1],
    doughStarterGrams: misa.g[2],
    doughAddedSaltGrams: misa.d[0],
    doughYeastGrams: misa.d[1],
    totalFlourGrams: Math.round(totalFlour),
    totalWaterGrams: Math.round(totalWater),
    totalSaltGrams: Math.round(S * 10) / 10,
    totalDoughWeightGrams: M,
    overallHydrationPercent: Number(((totalWater / totalFlour) * 100).toFixed(1)),
    fermentationTipPl: `${def.namePl}: Czas dojrzewania ${def.fermentationTimeHours}. ${def.flavorProfilePl}`,
  };
}
