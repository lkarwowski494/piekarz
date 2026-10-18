// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Open Artisan Exchange Format (.piekarz / .crust) — Specification v2.0
// 100% Offline-First, Portable, Checksum-Validated Sourdough Recipe Container
// ============================================================================

import { StoredRecipe, StoredBakeLog } from '../core/domain/types';

export interface PiekarzPackage {
  formatVersion: '2.0';
  generator: string;
  exportedAt: number;
  recipe: StoredRecipe;
  bakeLog?: StoredBakeLog;
  starterMetadata?: {
    name: string;
    hydration: number;
    flourType: string;
  };
  notes?: string;
  checksum: string;
}

export interface PiekarzValidationResult {
  isValid: boolean;
  package?: PiekarzPackage;
  error?: string;
}

/**
 * Computes a deterministic FNV-1a 32-bit checksum for integrity verification.
 */
export function computePiekarzChecksum(content: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Serializes recipe and optional bake log into a canonical .piekarz JSON package.
 */
export function serializePiekarzPackage(
  recipe: StoredRecipe,
  bakeLog?: StoredBakeLog,
  starterMetadata?: { name: string; hydration: number; flourType: string },
  notes?: string
): string {
  const payloadToHash = JSON.stringify({
    recipe,
    bakeLog,
    starterMetadata,
    notes,
  });

  const checksum = computePiekarzChecksum(payloadToHash);

  const pkg: PiekarzPackage = {
    formatVersion: '2.0',
    generator: 'Piekarz (Crust) Apps4Craft Studio',
    exportedAt: Date.now(),
    recipe,
    bakeLog,
    starterMetadata,
    notes,
    checksum,
  };

  return JSON.stringify(pkg, null, 2);
}

/**
 * Validates and parses a .piekarz package string, enforcing schema invariants.
 */
export function parsePiekarzPackage(jsonString: string): PiekarzValidationResult {
  try {
    const raw = JSON.parse(jsonString);

    if (!raw || typeof raw !== 'object') {
      return { isValid: false, error: 'Pakiet nie jest prawidłowym obiektem JSON' };
    }

    if (raw.formatVersion !== '2.0') {
      return { isValid: false, error: `Nieobsługiwana wersja formatu: ${raw.formatVersion}` };
    }

    if (!raw.recipe || typeof raw.recipe.name !== 'string' || !raw.recipe.formula) {
      return { isValid: false, error: 'Pakiet nie zawiera poprawnej struktury receptury' };
    }

    const payloadToHash = JSON.stringify({
      recipe: raw.recipe,
      bakeLog: raw.bakeLog,
      starterMetadata: raw.starterMetadata,
      notes: raw.notes,
    });

    const expectedChecksum = computePiekarzChecksum(payloadToHash);
    if (raw.checksum !== expectedChecksum) {
      return { isValid: false, error: 'Błąd sumy kontrolnej pakietu (plik uszkodzony lub zmodyfikowany)' };
    }

    return {
      isValid: true,
      package: raw as PiekarzPackage,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      error: `Błąd parsowania JSON: ${msg}`,
    };
  }
}
