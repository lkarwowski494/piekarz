// ============================================================================
// Piekarz (Crust) — Artisan Baking Techniques Library (Z-091…098 / BIB)
// 12 technique cards with physical principles, step-by-step cues, and pitfalls.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import { PREP_FERMENT_TECHNIQUES } from './techniques/prep-ferment-techniques';
import { SHAPING_BAKING_TECHNIQUES } from './techniques/shaping-baking-techniques';

export type TechniqueCategory =
  | 'dough_prep'
  | 'bulk_fermentation'
  | 'shaping'
  | 'proofing'
  | 'baking_cooling';

export interface TechniqueCard {
  id: string;
  code: string; // e.g. BIB-01
  category: TechniqueCategory;
  titlePl: string;
  titleEn: string;
  icon: string;
  physicalPrinciplePl: string;
  physicalPrincipleEn: string;
  executionStepsPl: string[];
  executionStepsEn: string[];
  commonMistakesPl: string[];
  commonMistakesEn: string[];
  proTipsPl: string;
  proTipsEn: string;
}

export const BAKING_TECHNIQUES: TechniqueCard[] = [
  ...PREP_FERMENT_TECHNIQUES,
  ...SHAPING_BAKING_TECHNIQUES,
];

/**
 * Returns all baking techniques.
 */
export function getBakingTechniques(): TechniqueCard[] {
  return BAKING_TECHNIQUES;
}

/**
 * Filter techniques by category.
 */
export function filterTechniques(
  category: TechniqueCategory | 'all'
): TechniqueCard[] {
  if (category === 'all') return BAKING_TECHNIQUES;
  return BAKING_TECHNIQUES.filter((t) => t.category === category);
}

/**
 * Search techniques by query string.
 */
export function searchTechniques(query: string): TechniqueCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return BAKING_TECHNIQUES;

  return BAKING_TECHNIQUES.filter((t) => {
    return (
      t.titlePl.toLowerCase().includes(q) ||
      t.titleEn.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.physicalPrinciplePl.toLowerCase().includes(q) ||
      t.physicalPrincipleEn.toLowerCase().includes(q)
    );
  });
}
