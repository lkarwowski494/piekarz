// ============================================================================
// Apps4Craft Studio — BRD Ground Truth Test Vectors Suite
// Direct Automated Verification of docs/brd/fixtures/test-vectors.json
// Role 1 (Lead BA) & Role 10 (Test Architect) Convergence
// ============================================================================

import { readFileSync } from 'fs';
import { join } from 'path';
import testVectorsFixture from '../../../tests/fixtures/test-vectors.json';
import { Q10_FERMENTATION } from '../fermentation-q10';
import {
  calculateDoughRecipe,
  calculateDDTWaterTemp,
  calculateIceRequirement,
  calculateFermentationAdaptation,
  convertYeast,
  calculateBakeLossMetrics,
  calculateStarterFeeding,
} from '../domain-rules';
import { calculatePrefermentBreakdown } from '../preferments';

describe('BRD Ground Truth Test Vectors (test-vectors.json)', () => {
  it('validates test vectors metadata and citation integrity', () => {
    expect(testVectorsFixture.project).toBe('Piekarz (Crust)');
    expect(testVectorsFixture.standard).toContain('Apps4Craft');
    expect(Object.keys(testVectorsFixture.vectors).length).toBeGreaterThanOrEqual(7);

    // Ensure every vector has tier and source citation
    Object.values(testVectorsFixture.vectors).forEach((categoryList: any) => {
      categoryList.forEach((vec: any) => {
        expect(vec.sourceCitation).toBeDefined();
        expect(typeof vec.sourceCitation).toBe('string');
        expect(vec.tier).toMatch(/^Tier [1-3]$/);
      });
    });
  });

  describe('RD_00_RD_02: Baker\'s Percentage & Mass Balance', () => {
    testVectorsFixture.vectors.RD_00_RD_02_bakers_percentage_and_mass_balance.forEach((v: any) => {
      it(`vector ${v.id} (${v.description}) satisfies formula balance`, () => {
        const res = calculateDoughRecipe({
          targetDoughWeightGrams: v.input.targetDoughWeightGrams,
          flours: v.input.flours,
          waterPercentage: v.input.waterPercentage,
          saltPercentage: v.input.saltPercentage,
          starterPercentage: v.input.starterPercentage,
          starterHydration: v.input.starterHydration,
          extraYeastPercentage: v.input.extraYeastPercentage ?? 0,
        });

        expect(res.baseFlourWeightGrams).toBe(v.expected.baseFlourWeightGrams);
        expect(res.waterGrams).toBe(v.expected.waterGrams);
        expect(res.saltGrams).toBe(v.expected.saltGrams);
        expect(Math.abs(res.starterGrams - v.expected.starterGrams)).toBeLessThanOrEqual(1);
        expect(res.totalFlourGrams).toBe(v.expected.totalFlourGrams);
        expect(res.totalWaterGrams).toBe(v.expected.totalWaterGrams);
        expect(Math.abs(res.overallHydrationPercent - v.expected.overallHydrationPercent)).toBeLessThanOrEqual(0.1);
      });
    });
  });

  describe('RD_05: DDT Water Temperature (Calvel 4-Factor)', () => {
    testVectorsFixture.vectors.RD_05_ddt_water_temperature.forEach((v: any) => {
      it(`vector ${v.id} (${v.description}) matches target water temperature`, () => {
        const res = calculateDDTWaterTemp({
          targetDDT: v.input.targetDDT,
          flourTemp: v.input.flourTemp,
          roomTemp: v.input.roomTemp,
          starterTemp: v.input.starterTemp,
          frictionFactor: v.input.frictionFactor,
        });

        expect(res.waterTempTarget).toBe(v.expected.waterTempTarget);
        expect(res.status).toBe(v.expected.status);
      });
    });
  });

  describe('RD_07: Ice Mass Requirement (Thermodynamics Lf = 334 J/g)', () => {
    testVectorsFixture.vectors.RD_07_ice_mass_requirement.forEach((v: any) => {
      it(`vector ${v.id} (${v.description}) calculates correct ice balance`, () => {
        const res = calculateIceRequirement(
          v.input.totalWaterGrams,
          v.input.tapWaterTempC,
          v.input.targetWaterTempC
        );

        expect(res.iceGrams).toBe(v.expected.iceGrams);
        expect(res.waterGrams).toBe(v.expected.waterGrams);
        expect(res.totalWaterGrams).toBe(v.expected.totalWaterGrams);
      });
    });
  });

  describe('RD_08: Fermentation Temperature Adaptation (Q10 = 3.0, FER-Q10-002)', () => {
    // 041: wektory BRD z tą samą wartością i źródłem co kod i rejestr (FER-Q10-002), w zakresie 20–26 °C
    it('każdy wektor RD_08 ma q10Factor z kodu, temperaturę 20–26 °C i źródło FER-Q10-002', () => {
      for (const v of testVectorsFixture.vectors.RD_08_fermentation_temperature_adaptation as any[]) {
        expect(v.input.q10Factor).toBe(Q10_FERMENTATION);
        expect(v.input.actualTempC).toBeGreaterThanOrEqual(20);
        expect(v.input.actualTempC).toBeLessThanOrEqual(26);
        expect(`${v.description} ${v.sourceCitation}`).not.toMatch(/2\.15|Ripari/);
        expect(v.sourceCitation).toMatch(/FER-Q10-002/);
      }
    });

    it('kopia wektorów w tests/fixtures jest identyczna z BRD, a dokumentacja nie podaje Q10 = 2,15', () => {
      const brd = readFileSync(join(__dirname, '../../../docs/brd/fixtures/test-vectors.json'), 'utf8');
      const kopia = readFileSync(join(__dirname, '../../../tests/fixtures/test-vectors.json'), 'utf8');
      expect(kopia.replace(/\r\n/g, '\n')).toBe(brd.replace(/\r\n/g, '\n'));
      expect(readFileSync(join(__dirname, '../../../docs/system-architecture.md'), 'utf8')).not.toMatch(/Q10\s*=\s*2[.,]15/);
    });

    testVectorsFixture.vectors.RD_08_fermentation_temperature_adaptation.forEach((v: any) => {
      it(`vector ${v.id} (${v.description}) adapts time correctly`, () => {
        const res = calculateFermentationAdaptation(
          v.input.baseHours,
          v.input.actualTempC,
          v.input.baseCalibrationTempC,
          v.input.q10Factor
        );

        expect(res.adaptedHours).toBe(v.expected.adaptedHours);
        expect(res.diffMinutes).toBe(v.expected.diffMinutes);
      });
    });
  });

  describe('RD_04: Yeast Conversion (Fresh <-> Instant 3:1)', () => {
    testVectorsFixture.vectors.RD_04_yeast_conversion.forEach((v: any) => {
      it(`vector ${v.id} (${v.description}) converts accurately`, () => {
        const res = convertYeast(v.input.amountGrams, v.input.from);
        expect(res.freshGrams).toBe(v.expected.freshGrams);
        expect(res.instantGrams).toBe(v.expected.instantGrams);
      });
    });
  });

  describe('RD_PREF_01: Preferments Breakdown (Poolish, Biga, Tangzhong)', () => {
    testVectorsFixture.vectors.RD_PREF_01_preferments_breakdown.forEach((v: any) => {
      it(`vector ${v.id} (${v.description}) computes preferment deduction`, () => {
        const res = calculatePrefermentBreakdown({
          prefermentType: v.input.prefermentType,
          prefermentFlourPercentage: v.input.prefermentFlourPercentage,
          totalFlourGrams: v.input.totalFlourGrams,
          totalTargetHydration: v.input.totalTargetHydration,
          saltPercentage: v.input.saltPercentage,
        });

        expect(res.prefermentFlourGrams).toBe(v.expected.prefermentFlourGrams);
        expect(res.prefermentWaterGrams).toBe(v.expected.prefermentWaterGrams);
        expect(res.doughAddedFlourGrams).toBe(v.expected.doughAddedFlourGrams);
        expect(res.doughAddedWaterGrams).toBe(v.expected.doughAddedWaterGrams);
        expect(res.totalFlourGrams).toBe(v.expected.totalFlourGrams);
        expect(res.totalWaterGrams).toBe(v.expected.totalWaterGrams);
      });
    });
  });

  describe('RD_10: Bake Loss and Moisture Retention', () => {
    testVectorsFixture.vectors.RD_10_bake_loss_and_moisture.forEach((v: any) => {
      it(`vector ${v.id} calculates bake loss percentage`, () => {
        const res = calculateBakeLossMetrics(v.input.doughWeightGrams, v.input.bakeLossPercent, v.input.totalWaterGrams);
        expect(res.bakedWeightGrams).toBe(v.expected.bakedWeightGrams);
        expect(res.evaporatedWaterGrams).toBe(v.expected.evaporatedWaterGrams);
        if (v.expected.crumbMoistureCategory) {
          expect(res.crumbMoistureCategory).toBe(v.expected.crumbMoistureCategory);
        }
      });
    });
  });

  describe('RD_11: Starter Feeding Mass Balance', () => {
    testVectorsFixture.vectors.RD_11_starter_feeding.forEach((v: any) => {
      it(`vector ${v.id} calculates feeding split`, () => {
        const res = calculateStarterFeeding(v.input.targetYieldGrams, v.input.ratio);
        expect(res.starterGrams).toBe(v.expected.starterGrams);
        expect(res.flourGrams).toBe(v.expected.flourGrams);
        expect(res.waterGrams).toBe(v.expected.waterGrams);
      });
    });
  });

});
