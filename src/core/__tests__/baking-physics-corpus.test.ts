import corpusFixture from './fixtures/baking-physics-corpus.json';
import {
  calculateDDTWaterTemp,
  calculateIceRequirement,
  calculateFermentationAdaptation,
  calculateStarterFeeding,
} from '../domain-rules';

describe('Apps4Brew Independent Physics Reference Corpus (Python ↔ TypeScript Cross-Validation)', () => {
  it('validates meta header and non-empty corpus datasets', () => {
    expect(corpusFixture.meta.generator).toContain('gen-baking-physics-corpus.py');
    expect(corpusFixture.ddtCases.length).toBeGreaterThan(150);
    expect(corpusFixture.iceCases.length).toBeGreaterThan(100);
    expect(corpusFixture.q10Cases.length).toBeGreaterThan(50);
    expect(corpusFixture.feedingCases.length).toBeGreaterThan(50);
  });

  describe('DDT 3-Factor & 4-Factor Matrix (194 cases)', () => {
    corpusFixture.ddtCases.forEach((c, idx) => {
      it(`DDT case #${idx + 1} (DDT ${c.targetDDT}°C, flour ${c.flourTemp}°C, room ${c.roomTemp}°C, starter ${c.starterTemp ?? 'none'}) matches Python reference`, () => {
        const res = calculateDDTWaterTemp({
          targetDDT: c.targetDDT,
          flourTemp: c.flourTemp,
          roomTemp: c.roomTemp,
          starterTemp: c.starterTemp === null ? undefined : c.starterTemp,
          frictionFactor: c.frictionFactor,
        });

        expect(res.waterTempTarget).toBe(c.expectedWaterTemp);
        expect(res.status).toBe(c.expectedStatus);
      });
    });
  });

  describe('Ice Requirement & Latent Heat Thermodynamics (168 cases)', () => {
    corpusFixture.iceCases.forEach((c, idx) => {
      it(`Ice case #${idx + 1} (${c.totalWaterGrams}g, tap ${c.tapWaterTempC}°C -> target ${c.targetWaterTempC}°C) matches Python reference`, () => {
        const res = calculateIceRequirement(c.totalWaterGrams, c.tapWaterTempC, c.targetWaterTempC);

        expect(res.iceGrams).toBe(c.expectedIceGrams);
        expect(res.waterGrams).toBe(c.expectedWaterGrams);
        expect(res.totalWaterGrams).toBe(c.totalWaterGrams);
      });
    });
  });

  describe('Fermentation Kinetics Q10 Arrhenius Scaling (63 cases)', () => {
    corpusFixture.q10Cases.forEach((c, idx) => {
      it(`Q10 case #${idx + 1} (${c.baseHours}h at ${c.actualTempC}°C) matches Python reference`, () => {
        const res = calculateFermentationAdaptation(c.baseHours, c.actualTempC, c.baseCalibrationTempC);

        expect(res.adaptedHours).toBe(c.expectedAdaptedHours);
        expect(res.diffMinutes).toBe(c.expectedDiffMinutes);
      });
    });
  });

  describe('Starter Feeding Ratios & Mass Allocation (56 cases)', () => {
    corpusFixture.feedingCases.forEach((c, idx) => {
      it(`Feeding case #${idx + 1} (${c.targetYieldGrams}g, ratio ${c.ratio.join(':')}) matches Python reference`, () => {
        const res = calculateStarterFeeding(c.targetYieldGrams, c.ratio as [number, number, number]);

        expect(res.starterGrams).toBe(c.expectedStarterGrams);
        expect(res.flourGrams).toBe(c.expectedFlourGrams);
        expect(res.waterGrams).toBe(c.expectedWaterGrams);
        expect(res.targetYieldGrams).toBe(c.targetYieldGrams);
      });
    });
  });
});
