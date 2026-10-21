// ============================================================================
// Piekarz — receptura przekazana z „Ułóż plan” do planu wypieku (design-spec §5: „Ułóż plan / Zacznij
// wypiek | receptura / plan”). Plan wstecz liczy godziny; „Zacznij wypiek” na planie zapisuje wypiek
// z ilościami tej receptury, a nie z przykładowej nazwy planu. [M1-audytor-generalny-057]
// ============================================================================

import type { DoughRecipeInput, DoughRecipeResult } from '../core/domain-rules';
import { t } from './i18n';

export interface RecepturaPlanu {
  recipeName: string;
  calculatedRecipe: DoughRecipeResult;
  recipeFormula: DoughRecipeInput;
  /** Notatka z wpisu dziennika przy „Piecz ponownie” (BR-RECP-003) [M1-audytor-generalny-146] */
  notatka?: string;
  /**
   * Temperatura kuchni z arkusza „Temperatura wody” receptury (°C): plan pokazuje tę samą liczbę; `wybrana` = wpisana
   * przez użytkownika (tylko wtedy trafia do wypieku i dziennika) [audyt-niezalezny D-4].
   */
  temperaturaKuchni?: { c: number; wybrana: boolean };
}

let biezaca: RecepturaPlanu | null = null;

/** Zapamiętuje recepturę, z którą użytkownik otwiera plan wypieku (null = plan bez receptury). */
export function ustawRecepturePlanu(r: RecepturaPlanu | null): void {
  biezaca = r;
}

/** Ostatnia receptura z „Ułóż plan” albo null (plan otwarty bez receptury). */
export function recepturaPlanu(): RecepturaPlanu | null {
  return biezaca;
}

/**
 * Plan wypieku i prowadzenie są ułożone dla chleba na zakwasie (dokarmienie zakwasu, garowanie w lodówce), więc
 * receptura bez zakwasu nie dostaje planu: powód pod nieaktywnym „Ułóż plan” i „Zacznij wypiek”; null = plan
 * dostępny [audyt-niezalezny D-3].
 */
export function powodBezZakwasu(formula: Pick<DoughRecipeInput, 'starterPercentage'>): string | null {
  return formula.starterPercentage > 0 ? null : t('Plan wypieku jest tylko dla chleba na zakwasie, a ta receptura nie ma zakwasu.');
}
