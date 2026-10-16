// ============================================================================
// Piekarz (Crust) — Flour Inventory & Stock Depletion Engine
// 100% Offline-First, Zero Cloud Dependencies.
// ============================================================================

import { StoredFlourInventoryItem } from '../data/db';
import { matchFlourProfile, FLOUR_PROFILES, FlourProfile } from './flour-atlas';

export interface FlourStockCheckItem {
  recipeFlourName: string;
  requiredGrams: number;
  availableGrams: number;
  deficitGrams: number;
  status: 'sufficient' | 'low_stock' | 'missing';
  matchedInventoryId?: string;
  substituteSuggestionPl?: string;
}

export interface InventoryCheckResult {
  allSufficient: boolean;
  totalRequiredGrams: number;
  totalDeficitGrams: number;
  items: FlourStockCheckItem[];
  warningMessagePl?: string;
}

/**
 * Finds the closest substitute for a given flour profile among candidate profiles.
 */
function findClosestSubstituteProfile(profile: FlourProfile): FlourProfile | undefined {
  const sameGrain = FLOUR_PROFILES.filter((p) => p.grain === profile.grain && p.id !== profile.id);
  if (sameGrain.length === 0) return undefined;

  // Sort by closest ashTyp
  return sameGrain.sort((a, b) => Math.abs(a.ashTyp - profile.ashTyp) - Math.abs(b.ashTyp - profile.ashTyp))[0];
}

/**
 * Checks recipe flour requirements against available pantry inventory.
 */
export function checkFlourInventory(
  recipeFlours: Array<{ name: string; weightGrams: number }>,
  inventory: StoredFlourInventoryItem[]
): InventoryCheckResult {
  let totalRequired = 0;
  let totalDeficit = 0;
  let allSufficient = true;

  const items: FlourStockCheckItem[] = recipeFlours.map((rf) => {
    const required = Math.round(rf.weightGrams);
    totalRequired += required;

    // 1. Exact or normalized string match
    let matched = inventory.find(
      (inv) => inv.name.trim().toLowerCase() === rf.name.trim().toLowerCase()
    );

    // 2. Profile-based matching if not matched by string
    if (!matched) {
      const rfProfile = matchFlourProfile(rf.name);
      matched = inventory.find((inv) => matchFlourProfile(inv.name).id === rfProfile.id);
    }

    const available = matched ? Math.round(matched.stockGrams) : 0;
    const deficit = Math.max(0, required - available);
    totalDeficit += deficit;

    let status: 'sufficient' | 'low_stock' | 'missing' = 'sufficient';
    if (deficit > 0) {
      allSufficient = false;
      status = available > 0 ? 'low_stock' : 'missing';
    }

    let substituteSuggestionPl: string | undefined;
    if (deficit > 0) {
      const rfProfile = matchFlourProfile(rf.name);

      // Check if user has an alternative flour in inventory with the same grain and enough stock
      const altInStock = inventory.find((inv) => {
        if (inv.id === matched?.id) return false;
        const invProfile = matchFlourProfile(inv.name);
        return invProfile.grain === rfProfile.grain && inv.stockGrams >= deficit;
      });

      if (altInStock) {
        substituteSuggestionPl = `W spiżarni posiadasz ${altInStock.name} (${Math.round(altInStock.stockGrams)}g) — możesz użyć jej jako zamiennika.`;
      } else {
        const closest = findClosestSubstituteProfile(rfProfile);
        if (closest) {
          substituteSuggestionPl = `Sugerowany zamiennik ze Spiżarni: ${closest.namePl}.`;
        }
      }
    }

    return {
      recipeFlourName: rf.name,
      requiredGrams: required,
      availableGrams: available,
      deficitGrams: deficit,
      status,
      matchedInventoryId: matched?.id,
      substituteSuggestionPl,
    };
  });

  let warningMessagePl: string | undefined;
  if (!allSufficient) {
    const deficitItems = items.filter((i) => i.deficitGrams > 0);
    const deficitNames = deficitItems.map((i) => `${i.recipeFlourName} (-${i.deficitGrams}g)`).join(', ');
    warningMessagePl = `Uwaga: W spiżarni brakuje ${totalDeficit}g mąki (${deficitNames}).`;
  }

  return {
    allSufficient,
    totalRequiredGrams: totalRequired,
    totalDeficitGrams: totalDeficit,
    items,
    warningMessagePl,
  };
}

/**
 * Deducts used flour amounts from the inventory, clamping stock to zero.
 */
export function deductFlourStocks(
  recipeFlours: Array<{ name: string; weightGrams: number }>,
  inventory: StoredFlourInventoryItem[]
): StoredFlourInventoryItem[] {
  const updated = inventory.map((item) => ({ ...item }));

  for (const rf of recipeFlours) {
    let matched = updated.find(
      (inv) => inv.name.trim().toLowerCase() === rf.name.trim().toLowerCase()
    );
    if (!matched) {
      const rfProfile = matchFlourProfile(rf.name);
      matched = updated.find((inv) => matchFlourProfile(inv.name).id === rfProfile.id);
    }

    if (matched) {
      matched.stockGrams = Math.max(0, Math.round(matched.stockGrams - rf.weightGrams));
      matched.updatedAt = Date.now();
    }
  }

  return updated;
}
