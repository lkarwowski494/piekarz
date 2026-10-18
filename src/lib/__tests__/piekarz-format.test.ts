// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Unit Tests for Open Artisan Exchange Format (.piekarz / .crust)
// ============================================================================

import {
  serializePiekarzPackage,
  parsePiekarzPackage,
  computePiekarzChecksum,
} from '../piekarz-format';
import { StoredRecipe, StoredBakeLog } from '../../core/domain/types';

describe('Open Artisan Exchange Format (.piekarz / .crust)', () => {
  const sampleRecipe: StoredRecipe = {
    id: 'rec_san_francisco',
    name: 'San Francisco Sourdough',
    formula: {
      flours: [{ name: 'Mąka chlebowa t750', percentage: 100 }],
      waterPercentage: 72,
      saltPercentage: 2,
      starterPercentage: 20,
      targetDoughWeightGrams: 900,
    },
    targetDDT: 26,
    isBuiltIn: false,
    createdAt: 1700000000000,
  };

  const sampleLog: StoredBakeLog = {
    id: 'log_01',
    recipeName: 'San Francisco Sourdough',
    startedAt: 1700000000000,
    finishedAt: 1700086400000,
    crumbScore: 5,
    crustScore: 5,
    tasteProfile: 'tangy_lactic',
  };

  it('serializes and validates a complete recipe package with checksum', () => {
    const serialized = serializePiekarzPackage(
      sampleRecipe,
      sampleLog,
      { name: 'Zakwas Żytni Bolesław', hydration: 100, flourType: 'typ 2000' },
      'Wypiek z maksymalnym otwarciem ucha w garnku żeliwnym.'
    );

    expect(serialized).toContain('"formatVersion": "2.0"');
    expect(serialized).toContain('"checksum":');

    const result = parsePiekarzPackage(serialized);
    expect(result.isValid).toBe(true);
    expect(result.package).toBeDefined();
    expect(result.package?.recipe.name).toBe('San Francisco Sourdough');
    expect(result.package?.bakeLog?.tasteProfile).toBe('tangy_lactic');
    expect(result.package?.starterMetadata?.name).toBe('Zakwas Żytni Bolesław');
  });

  it('rejects tampered or corrupted package with invalid checksum', () => {
    const serialized = serializePiekarzPackage(sampleRecipe);
    // Tamper with recipe name in serialized payload
    const tampered = serialized.replace('San Francisco Sourdough', 'Zmanipulowany Chleb');

    const result = parsePiekarzPackage(tampered);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Błąd sumy kontrolnej');
  });

  it('rejects invalid JSON or incompatible version', () => {
    const invalidJsonResult = parsePiekarzPackage('{ broken json ');
    expect(invalidJsonResult.isValid).toBe(false);

    const oldVersion = JSON.stringify({ formatVersion: '0.9', recipe: {} });
    const versionResult = parsePiekarzPackage(oldVersion);
    expect(versionResult.isValid).toBe(false);
    expect(versionResult.error).toContain('Nieobsługiwana wersja');
  });

  it('computes deterministic FNV-1a checksums', () => {
    const sum1 = computePiekarzChecksum('test_string_123');
    const sum2 = computePiekarzChecksum('test_string_123');
    const sum3 = computePiekarzChecksum('different_string');

    expect(sum1).toBe(sum2);
    expect(sum1).not.toBe(sum3);
    expect(sum1.length).toBe(8);
  });
});
