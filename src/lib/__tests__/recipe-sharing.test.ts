// ============================================================================
// Piekarz (Crust) — Recipe Sharing & Serialization Tests
// Unit tests and fast-check property-based round-trip invariants.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import * as fc from 'fast-check';
import {
  exportRecipeToJson,
  parseAndValidateRecipeJson,
  encodeRecipeToShareUrl,
  decodeRecipeFromShareUrl,
  utf8ToBase64,
  RECIPE_SHARE_PREFIX,
  PIEKARZ_RECIPE_SCHEMA_V1,
} from '../recipe-sharing';
import { MASTER_RECIPES } from '../../recipes/presets';
import { StoredRecipe } from '../../data/db';

describe('Recipe Sharing & JSON Serialization', () => {
  describe('exportRecipeToJson', () => {
    it('serializes a MasterRecipe to compliant JSON schema', () => {
      const master = MASTER_RECIPES[0];
      const json = exportRecipeToJson(master);
      const parsed = JSON.parse(json);

      expect(parsed.schema).toBe(PIEKARZ_RECIPE_SCHEMA_V1);
      expect(parsed.appName).toBe('Piekarz');
      expect(parsed.recipe.name).toBe(master.namePl);
      expect(parsed.recipe.formula.flours.length).toBe(master.formula.flours.length);
      expect(parsed.recipe.formula.waterPercentage).toBe(master.formula.waterPercentage);
      expect(parsed.recipe.targetDDT).toBe(master.targetDDT);
    });

    it('serializes a custom StoredRecipe accurately', () => {
      const custom: StoredRecipe = {
        id: 'recipe_123',
        name: 'Autorski Wiejski 75%',
        targetDDT: 24.5,
        notes: 'Wydłużona autoliza 60 min',
        isBuiltIn: false,
        createdAt: 1700000000000,
        formula: {
          flours: [
            { name: 'Mąka pszenna T650', percentage: 90.0, type: 'pszenna_650' },
            { name: 'Mąka żytnia T720', percentage: 10.0, type: 'zytnia_720' },
          ],
          waterPercentage: 75.0,
          saltPercentage: 2.1,
          starterPercentage: 18.0,
          starterHydration: 100.0,
          targetDoughWeightGrams: 900,
        },
      };

      const json = exportRecipeToJson(custom);
      const parsed = JSON.parse(json);

      expect(parsed.recipe.name).toBe('Autorski Wiejski 75%');
      expect(parsed.recipe.notes).toBe('Wydłużona autoliza 60 min');
      expect(parsed.recipe.targetDDT).toBe(24.5);
      expect(parsed.recipe.formula.flours[0].percentage).toBe(90);
      expect(parsed.recipe.formula.flours[1].percentage).toBe(10);
    });
  });

  describe('parseAndValidateRecipeJson', () => {
    it('successfully parses wrapped schema payload', () => {
      const json = exportRecipeToJson(MASTER_RECIPES[1]);
      const result = parseAndValidateRecipeJson(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.recipe.name).toBe(MASTER_RECIPES[1].namePl);
        expect(result.recipe.formula.waterPercentage).toBe(MASTER_RECIPES[1].formula.waterPercentage);
        expect(result.recipe.formula.saltPercentage).toBe(MASTER_RECIPES[1].formula.saltPercentage);
        expect(result.recipe.isBuiltIn).toBe(false);
      }
    });

    it('successfully parses a flat unwrapped recipe object', () => {
      const flat = JSON.stringify({
        name: 'Prosty chleb testowy',
        targetDDT: 26,
        formula: {
          flours: [{ name: 'Mąka chlebowa', percentage: 100 }],
          waterPercentage: 70,
          saltPercentage: 2,
          starterPercentage: 20,
        },
      });

      const result = parseAndValidateRecipeJson(flat);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.recipe.name).toBe('Prosty chleb testowy');
        expect(result.recipe.formula.flours[0].percentage).toBe(100);
        expect(result.recipe.formula.waterPercentage).toBe(70);
      }
    });

    it('rejects invalid JSON syntax', () => {
      const result = parseAndValidateRecipeJson('{ invalid json format');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Błąd składni JSON');
      }
    });

    it('rejects non-object or empty payload', () => {
      expect(parseAndValidateRecipeJson('').success).toBe(false);
      expect(parseAndValidateRecipeJson('[]').success).toBe(false);
      expect(parseAndValidateRecipeJson('"test"').success).toBe(false);
      expect(parseAndValidateRecipeJson('123').success).toBe(false);
    });

    it('rejects missing or empty recipe name', () => {
      const json = JSON.stringify({
        formula: {
          flours: [{ name: 'Mąka', percentage: 100 }],
          waterPercentage: 70,
          saltPercentage: 2,
          starterPercentage: 20,
        },
      });
      const result = parseAndValidateRecipeJson(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('nazwę');
      }
    });

    it('rejects out of bounds DDT temperature', () => {
      const json = JSON.stringify({
        name: 'Chleb zły DDT',
        targetDDT: 55, // too hot
        formula: {
          flours: [{ name: 'Mąka', percentage: 100 }],
          waterPercentage: 70,
          saltPercentage: 2,
          starterPercentage: 20,
        },
      });
      const result = parseAndValidateRecipeJson(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('10–40°C');
      }
    });

    it('rejects flour sum outside tolerance', () => {
      const json = JSON.stringify({
        name: 'Chleb zły udział mąk',
        formula: {
          flours: [
            { name: 'Mąka 1', percentage: 50 },
            { name: 'Mąka 2', percentage: 20 }, // sums to 70%, invalid
          ],
          waterPercentage: 70,
          saltPercentage: 2,
          starterPercentage: 20,
        },
      });
      const result = parseAndValidateRecipeJson(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('100%');
      }
    });

    it('rejects extreme water percentages', () => {
      const json = JSON.stringify({
        name: 'Zupa chlebowa',
        formula: {
          flours: [{ name: 'Mąka', percentage: 100 }],
          waterPercentage: 150, // 150% is beyond physical bound
          saltPercentage: 2,
          starterPercentage: 20,
        },
      });
      const result = parseAndValidateRecipeJson(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Hydratacja wody');
      }
    });

    it('rejects excessive salt percentage', () => {
      const json = JSON.stringify({
        name: 'Solony chleb',
        formula: {
          flours: [{ name: 'Mąka', percentage: 100 }],
          waterPercentage: 70,
          saltPercentage: 12, // 12% is toxic
          starterPercentage: 20,
        },
      });
      const result = parseAndValidateRecipeJson(json);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('soli');
      }
    });
  });

  describe('Property-Based Testing (fast-check)', () => {
    it('round-trip invariant: any exported recipe successfully deserializes with matching parameters', () => {
      const recipeArbitrary = fc.record({
        name: fc.string({ minLength: 2, maxLength: 50 }).filter((s) => s.trim().length > 0),
        targetDDT: fc.float({ min: 18, max: 30, noNaN: true }),
        flour1Pct: fc.integer({ min: 40, max: 100 }),
        waterPct: fc.float({ min: 55, max: 88, noNaN: true }),
        saltPct: fc.float({ min: 1.5, max: 2.5, noNaN: true }),
        starterPct: fc.float({ min: 5, max: 35, noNaN: true }),
      });

      fc.assert(
        fc.property(recipeArbitrary, (data) => {
          const flours =
            data.flour1Pct === 100
              ? [{ name: 'Mąka Podstawowa', percentage: 100 }]
              : [
                  { name: 'Mąka Podstawowa', percentage: data.flour1Pct },
                  { name: 'Mąka Dodatkowa', percentage: 100 - data.flour1Pct },
                ];

          const recipe: StoredRecipe = {
            id: 'test_pbt',
            name: data.name,
            targetDDT: data.targetDDT,
            isBuiltIn: false,
            createdAt: 1700000000000,
            formula: {
              flours,
              waterPercentage: data.waterPct,
              saltPercentage: data.saltPct,
              starterPercentage: data.starterPct,
              starterHydration: 100,
              targetDoughWeightGrams: 850,
            },
          };

          const json = exportRecipeToJson(recipe);
          const result = parseAndValidateRecipeJson(json);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.recipe.name).toBe(data.name.trim());
            expect(Math.abs(result.recipe.targetDDT - data.targetDDT)).toBeLessThanOrEqual(0.1);
            expect(Math.abs(result.recipe.formula.waterPercentage - data.waterPct)).toBeLessThanOrEqual(0.1);
            expect(Math.abs(result.recipe.formula.saltPercentage - data.saltPct)).toBeLessThanOrEqual(0.1);
            expect(Math.abs(result.recipe.formula.starterPercentage - data.starterPct)).toBeLessThanOrEqual(0.1);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('resilience fuzz invariant: arbitrary text never throws uncaught exceptions', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 500 }), (rawString) => {
          const result = parseAndValidateRecipeJson(rawString);
          expect(typeof result.success).toBe('boolean');
          if (!result.success) {
            expect(typeof result.error).toBe('string');
          }
        }),
        { numRuns: 200 }
      );
    });
  });

  describe('Recipe share payload without URL scheme (M1-audytor-generalny-029)', () => {
    // Aplikacja nie ma trasy `recipe`: udostępniany ładunek to tekst, nie link.
    const legacyData = (recipe: (typeof MASTER_RECIPES)[number]) =>
      encodeURIComponent(utf8ToBase64(JSON.stringify(JSON.parse(exportRecipeToJson(recipe)))));

    it('encodes a MasterRecipe into a text payload without any URL scheme', () => {
      for (const master of MASTER_RECIPES) {
        const payload = encodeRecipeToShareUrl(master);
        expect(payload).not.toContain('://');
        expect(payload).not.toMatch(/https?:/i);
        expect(payload.startsWith(RECIPE_SHARE_PREFIX)).toBe(true);
        expect(RECIPE_SHARE_PREFIX).not.toContain('://');
        expect(payload.length).toBeGreaterThan(50);
      }
    });

    it('decodes the whole shared message (name, sentence, payload) pasted into import', () => {
      const master = MASTER_RECIPES[1];
      const message = `${master.namePl} — Receptura piekarska z aplikacji Piekarz:\n${encodeRecipeToShareUrl(master)}`;
      const decoded = decodeRecipeFromShareUrl(message);

      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.recipe.name).toBe(master.namePl);
      }
    });

    it('still decodes a piekarz://recipe link sent by an older version', () => {
      const master = MASTER_RECIPES[2];
      const decoded = decodeRecipeFromShareUrl(`piekarz://recipe?v=1&d=${legacyData(master)}`);

      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.recipe.name).toBe(master.namePl);
      }
    });

    it('round-trips encode and decode from share payload correctly', () => {
      const master = MASTER_RECIPES[2];
      const url = encodeRecipeToShareUrl(master);
      const decoded = decodeRecipeFromShareUrl(url);

      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.recipe.name).toBe(master.namePl);
        expect(decoded.recipe.formula.waterPercentage).toBe(master.formula.waterPercentage);
        expect(decoded.recipe.formula.saltPercentage).toBe(master.formula.saltPercentage);
      }
    });

    it('still decodes a web link sent by an older version (M1-audytor-generalny-028)', () => {
      const master = MASTER_RECIPES[3];
      const decoded = decodeRecipeFromShareUrl(`https://piekarz.app/recipe?v=1&d=${legacyData(master)}`);

      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.recipe.name).toBe(master.namePl);
      }
    });

    it('decodes raw JSON string as fallback', () => {
      const json = exportRecipeToJson(MASTER_RECIPES[0]);
      const decoded = decodeRecipeFromShareUrl(json);

      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.recipe.name).toBe(MASTER_RECIPES[0].namePl);
      }
    });

    it('handles empty or corrupted input safely', () => {
      expect(decodeRecipeFromShareUrl('').success).toBe(false);
      expect(decodeRecipeFromShareUrl('not_a_valid_url').success).toBe(false);
      expect(decodeRecipeFromShareUrl('piekarz://recipe?v=1&d=corrupted_data').success).toBe(false);
    });
  });
});
