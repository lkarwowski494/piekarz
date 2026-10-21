// ============================================================================
// Piekarz — receptura przekazana z „Ułóż plan” do planu wypieku (design-spec §5: „Ułóż plan / Zacznij
// wypiek | receptura / plan”). Plan wstecz liczy godziny; „Zacznij wypiek” na planie zapisuje wypiek
// z ilościami tej receptury, a nie z przykładowej nazwy planu. [M1-audytor-generalny-057]
// ============================================================================

import type { DoughRecipeInput, DoughRecipeResult } from '../core/domain-rules';

export interface RecepturaPlanu {
  recipeName: string;
  calculatedRecipe: DoughRecipeResult;
  recipeFormula: DoughRecipeInput;
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
