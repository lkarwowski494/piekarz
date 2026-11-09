// ============================================================================
// Piekarz — pieczenie receptury dla planu wypieku (D-304, DEC-03 a) [M1-audytor-generalny-008; 06-tresci-001]
// Plan i Stolnica biorą nagrzewanie i pieczenie z danych receptury bazowej (src/core/pieczenie-receptury.ts).
// ============================================================================

import { CATALOG_RECIPES } from '../recipes/katalog';
import { pieczenieZReceptury, type PieczenieReceptury } from '../core/pieczenie-receptury';
import type { RecepturaPlanu } from './plan-receptury';

/**
 * Pieczenie receptury bazowej o tym id dla planu zakwasowego; brak (undefined) = plan z profilem garnka jak dotąd:
 * receptura spoza katalogu (własna), bez zakwasu (plan jej nie prowadzi) albo żytnia (etapy żytnie z rye-stages.ts,
 * dane pieczenia żyta bez źródła, D-256 — poza zakresem D-304).
 */
export function pieczenieDlaId(recipeId: string | null | undefined, zytni: boolean): PieczenieReceptury | undefined {
  if (zytni || !recipeId) return undefined;
  const r = CATALOG_RECIPES.find((x) => x.id === recipeId);
  return r && r.formula.starterPercentage > 0 ? pieczenieZReceptury(r) : undefined;
}

/** Pieczenie dla receptury z „Ułóż plan”: wersja drożdżowa ma własne kroki (yeast-stages.ts), więc bez pieczenia. */
export function pieczenieDlaPlanu(r: RecepturaPlanu | null): PieczenieReceptury | undefined {
  if (!r || r.wersja === 'drozdze') return undefined;
  return pieczenieDlaId(r.recipeId, r.calculatedRecipe.isHighRye);
}
