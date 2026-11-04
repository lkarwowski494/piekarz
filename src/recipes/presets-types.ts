// ============================================================================
// Piekarz (Crust) — typ receptury bazowej (BR-RECP-001); wydzielony z presets.ts (M3 p8, D-157).
// ============================================================================

import { DoughRecipeInput } from '../core/domain-rules';

export interface RecipePreset {
  id: string;
  namePl: string;
  category: 'sourdough' | 'rye' | 'yeast' | 'pizza' | 'sweet';
  descriptionPl: string;
  formula: DoughRecipeInput;
  targetDDT: number;
  bakeTimeSteamMinutes: number;
  bakeTimeBrowningMinutes: number;
  bakeTempSteamC: number;
  bakeTempBrowningC: number;
  recommendedVessel: 'dutch_oven' | 'bread_pan' | 'baking_steel' | 'baking_sheet';
  notesPl: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'artisan';
}

export type MasterRecipe = RecipePreset;
