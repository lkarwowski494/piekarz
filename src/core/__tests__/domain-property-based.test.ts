import * as fc from 'fast-check';
import {
  calculateDoughRecipe,
  calculateIceRequirement,
  calculateFermentationAdaptation,
  convertYeast,
  calculateStarterFeeding,
  calculateDDTWaterTemp,
  calculateBakeLossMetrics,
  calculateRequiredRawDoughWeight,
} from '../domain-rules';
import { analyzeFlourBlendAbsorption } from '../flour-atlas';
import { Q10_FERMENTATION } from '../fermentation-q10';
import { calculateReverseSchedule } from '../../scheduler/reverse-scheduler';

// Ziarno z globalnej konfiguracji (jest.app-after-env.js → tests/helpers/fc-config.js): zawsze liczba,
// także przy PROP_SEED=random w nightly; Number('random') dawało NaN i stały ciąg [M1-audytor-generalny-064].
const PBT_SEED: number | undefined = fc.readConfigureGlobal().seed;

function assertWithSeed<Ts extends [unknown, ...unknown[]]>(
  property: fc.IProperty<Ts>,
  params?: fc.Parameters<Ts>
) {
  try {
    fc.assert(property, {
      ...params,
      ...(PBT_SEED !== undefined ? { seed: PBT_SEED } : {}),
    });
  } catch (error: unknown) {
    if (PBT_SEED !== undefined) {
      console.warn(`[PBT FAILURE] Seed configured: ${PBT_SEED}`);
    } else {
      console.warn(`[PBT FAILURE] To reproduce, set PROP_SEED=<seed> from fast-check report.`);
    }
    throw error;
  }
}

describe('Property-Based Invariant Verification (fast-check)', () => {
  describe('Dough Scaling & True Baker\'s % Invariants', () => {
    it('preserves mass balance across 1000 randomized dough formulations', () => {
      assertWithSeed(
        fc.property(
          fc.integer({ min: 200, max: 20000 }), // target dough weight in grams
          fc.double({ min: 50.0, max: 100.0, noNaN: true }), // hydration %
          fc.double({ min: 0.5, max: 3.5, noNaN: true }), // salt %
          fc.double({ min: 5.0, max: 40.0, noNaN: true }), // starter %
          fc.double({ min: 60.0, max: 160.0, noNaN: true }), // starter hydration %
          fc.double({ min: 0.0, max: 2.0, noNaN: true }), // extra yeast %
          fc.integer({ min: 10, max: 90 }), // flour 1 % (flour 2 will be 100 - flour 1)
          (weight, hydr, salt, starter, starterHydr, yeast, f1Pct) => {
            const f2Pct = 100 - f1Pct;
            const result = calculateDoughRecipe({
              targetDoughWeightGrams: weight,
              flours: [
                { name: 'Flour A', percentage: f1Pct },
                { name: 'Flour B', percentage: f2Pct },
              ],
              waterPercentage: hydr,
              saltPercentage: salt,
              starterPercentage: starter,
              starterHydration: starterHydr,
              extraYeastPercentage: yeast,
            });

            // 1. Total batch sum conservation: within 1 g (DEC-11 (a), BRD C4a blocker 1) [M1-audytor-generalny-040]
            expect(Math.abs(result.sumCheckGrams - weight)).toBeLessThanOrEqual(1);

            // 2. Base flour split conservation
            const sumFlours = result.flours.reduce((acc, f) => acc + f.weightGrams, 0);
            expect(Math.abs(sumFlours - result.baseFlourWeightGrams)).toBeLessThanOrEqual(2);

            // 3. Starter component conservation
            expect(
              Math.abs(result.starterFlourGrams + result.starterWaterGrams - result.starterGrams)
            ).toBeLessThanOrEqual(2);

            // 4. Total flour and total water consistency
            expect(
              Math.abs(result.totalFlourGrams - (result.baseFlourWeightGrams + result.starterFlourGrams))
            ).toBeLessThanOrEqual(2);
            expect(
              Math.abs(result.totalWaterGrams - (result.waterGrams + result.starterWaterGrams))
            ).toBeLessThanOrEqual(2);

            // 5. True Baker's hydration consistency (accounting for integer rounding on small batches)
            const computedOverallHydr = (result.totalWaterGrams / result.totalFlourGrams) * 100;
            expect(Math.abs(result.overallHydrationPercent - computedOverallHydr)).toBeLessThanOrEqual(1.5);
          }
        ),
        { numRuns: 1000 }
      );
    });

    // DEC-11 (a), bloker BRD C4a nr 1 [M1-audytor-generalny-040; 07-jakosc-004]:
    // suma gramów pokazanych w karcie „Do miski” (mąka dodana + woda + zakwas w pełnych gramach,
    // sól i drożdże z 1 miejscem po przecinku jak formatDoseWeight) różni się od masy docelowej o ≤ 1 g.
    it('DEC-11: displayed ingredient sum stays within 1 g of target across 10 000 random recipes', () => {
      const tenths = (g: number) => Math.round(g * 10);
      assertWithSeed(
        fc.property(
          fc.integer({ min: 200, max: 20000 }),
          fc.double({ min: 50.0, max: 100.0, noNaN: true }),
          fc.double({ min: 0.5, max: 3.5, noNaN: true }),
          fc.double({ min: 0.0, max: 40.0, noNaN: true }),
          fc.double({ min: 60.0, max: 160.0, noNaN: true }),
          fc.double({ min: 0.0, max: 2.0, noNaN: true }),
          fc.integer({ min: 10, max: 90 }),
          (weight, hydr, salt, starter, starterHydr, yeast, f1Pct) => {
            const result = calculateDoughRecipe({
              targetDoughWeightGrams: weight,
              flours: [
                { name: 'Flour A', percentage: f1Pct },
                { name: 'Flour B', percentage: 100 - f1Pct },
              ],
              waterPercentage: hydr,
              saltPercentage: salt,
              starterPercentage: starter,
              starterHydration: starterHydr,
              extraYeastPercentage: yeast,
            });
            const displayedTenths =
              tenths(result.baseFlourWeightGrams) +
              tenths(result.waterGrams) +
              tenths(result.starterGrams) +
              tenths(result.saltGrams) +
              tenths(result.yeastGrams);
            expect(Math.abs(displayedTenths - weight * 10)).toBeLessThanOrEqual(10);
            expect(Math.abs(result.sumCheckGrams - weight)).toBeLessThanOrEqual(1);

            // Korekta nie przerzuca reszty na jeden składnik: każdy odbiega od wartości dokładnej o < 1 g.
            const base = weight / ((100 + hydr + salt + starter + yeast) / 100);
            expect(Math.abs(result.baseFlourWeightGrams - base)).toBeLessThan(1);
            expect(Math.abs(result.waterGrams - (base * hydr) / 100)).toBeLessThan(1);
            expect(Math.abs(result.starterGrams - (base * starter) / 100)).toBeLessThan(1);
          }
        ),
        { numRuns: 10000 } // ziarno stałe: PROP_SEED z jest.app-after-env.js (domyślnie 17102026)
      );
    });
  });

  describe('Ice & DDT Thermodynamics Invariants', () => {
    it('preserves ice + water mass balance and exhibits strict monotonicity', () => {
      assertWithSeed(
        fc.property(
          fc.integer({ min: 100, max: 8000 }), // total water grams
          fc.double({ min: 10.0, max: 35.0, noNaN: true }), // tap water temp °C
          fc.double({ min: -5.0, max: 30.0, noNaN: true }), // target water temp °C
          (waterGrams, tapTemp, targetTemp) => {
            const result = calculateIceRequirement(waterGrams, tapTemp, targetTemp);

            // Conservation of water mass: ice + liquid water === total
            expect(result.iceGrams + result.waterGrams).toBe(waterGrams);
            expect(result.totalWaterGrams).toBe(waterGrams);
            expect(result.iceGrams).toBeGreaterThanOrEqual(0);
            expect(result.waterGrams).toBeGreaterThanOrEqual(0);

            if (targetTemp >= tapTemp) {
              expect(result.iceGrams).toBe(0);
              expect(result.waterGrams).toBe(waterGrams);
            } else {
              expect(result.iceGrams).toBeGreaterThanOrEqual(0);

              // Colder target temp requires greater or equal ice
              const colderTarget = targetTemp - 2.0;
              const resultColder = calculateIceRequirement(waterGrams, tapTemp, colderTarget);
              expect(resultColder.iceGrams).toBeGreaterThanOrEqual(result.iceGrams);
            }
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('DDT water temperature is strictly linear and responds inversely to ambient / flour temperature', () => {
      assertWithSeed(
        fc.property(
          fc.double({ min: 20.0, max: 30.0, noNaN: true }), // target DDT
          fc.double({ min: 15.0, max: 30.0, noNaN: true }), // flour temp
          fc.double({ min: 15.0, max: 35.0, noNaN: true }), // room temp
          fc.double({ min: 15.0, max: 30.0, noNaN: true }), // starter temp
          fc.double({ min: 0.0, max: 6.0, noNaN: true }), // friction factor
          (ddt, flour, room, starter, friction) => {
            const res1 = calculateDDTWaterTemp({
              targetDDT: ddt,
              flourTemp: flour,
              roomTemp: room,
              starterTemp: starter,
              frictionFactor: friction,
            });

            // As kitchen gets 1°C hotter, water must be 1°C colder
            const resWarmerRoom = calculateDDTWaterTemp({
              targetDDT: ddt,
              flourTemp: flour,
              roomTemp: room + 1.0,
              starterTemp: starter,
              frictionFactor: friction,
            });

            expect(Number((res1.waterTempTarget - resWarmerRoom.waterTempTarget).toFixed(1))).toBe(1.0);
          }
        ),
        { numRuns: 500 }
      );
    });
  });

  describe('Fermentation Kinetics (Q10 = Q10_FERMENTATION, FER-Q10-002) Invariants', () => {
    it('fermentation duration decreases monotonically with rising temperature', () => {
      assertWithSeed(
        fc.property(
          fc.double({ min: 1.0, max: 24.0, noNaN: true }), // base hours
          fc.double({ min: 10.0, max: 22.0, noNaN: true }), // temp cool
          fc.double({ min: 25.0, max: 38.0, noNaN: true }), // temp warm
          (baseHours, tempCool, tempWarm) => {
            const coolRes = calculateFermentationAdaptation(baseHours, tempCool, 24.0);
            const baseRes = calculateFermentationAdaptation(baseHours, 24.0, 24.0);
            const warmRes = calculateFermentationAdaptation(baseHours, tempWarm, 24.0);

            // Monotonicity: T_cool < 24 < T_warm => Time_cool > Time_base > Time_warm
            expect(coolRes.adaptedHours).toBeGreaterThan(baseRes.adaptedHours);
            expect(baseRes.adaptedHours).toBeGreaterThan(warmRes.adaptedHours);

            // Invariant: At calibrated temp (24.0°C), diffMinutes is 0
            expect(baseRes.diffMinutes).toBe(0);
            expect(baseRes.adaptedHours).toBe(Number(baseHours.toFixed(2)));
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('satisfies exact Q10 division and multiplication at +10°C and -10°C deltas [M1-audytor-generalny-041]', () => {
      assertWithSeed(
        fc.property(
          fc.double({ min: 2.0, max: 30.0, noNaN: true }), // base hours
          (baseHours) => {
            const resBase = calculateFermentationAdaptation(baseHours, 24.0, 24.0);
            const resPlus10 = calculateFermentationAdaptation(baseHours, 34.0, 24.0);
            const resMinus10 = calculateFermentationAdaptation(baseHours, 14.0, 24.0);

            // +10°C divides the duration by Q10 (FER-Q10-002)
            expect(Math.abs(resPlus10.adaptedHours - baseHours / Q10_FERMENTATION)).toBeLessThanOrEqual(0.05);

            // -10°C multiplies the duration by Q10
            expect(Math.abs(resMinus10.adaptedHours - baseHours * Q10_FERMENTATION)).toBeLessThanOrEqual(0.05);
          }
        ),
        { numRuns: 500 }
      );
    });
  });

  describe('Yeast & Starter Feeding Invariants', () => {
    it('yeast conversions are round-trip isomorphic within rounding precision', () => {
      assertWithSeed(
        fc.property(
          fc.double({ min: 0.1, max: 200.0, noNaN: true }),
          (freshGrams) => {
            const instant = convertYeast(freshGrams, 'fresh').instantGrams;
            const roundTrip = convertYeast(instant, 'instant').freshGrams;

            // RD-19 (× 0,4) round trip with 0.15g rounding delta
            expect(Math.abs(roundTrip - freshGrams)).toBeLessThanOrEqual(0.15);
          }
        ),
        { numRuns: 500 }
      );
    });

    it('starter feeding preserves total yield across arbitrary feeding ratios', () => {
      assertWithSeed(
        fc.property(
          fc.integer({ min: 30, max: 3000 }), // target yield
          fc.integer({ min: 1, max: 10 }), // starter parts
          fc.integer({ min: 1, max: 10 }), // flour parts
          fc.integer({ min: 1, max: 10 }), // water parts
          (yieldGrams, s, f, w) => {
            const res = calculateStarterFeeding(yieldGrams, [s, f, w]);
            const sumParts = res.starterGrams + res.flourGrams + res.waterGrams;

            // Invariant: sum of parts equals target yield +/- 2g due to integer roundings
            expect(Math.abs(sumParts - yieldGrams)).toBeLessThanOrEqual(2);
            expect(res.starterGrams).toBeGreaterThan(0);
            expect(res.flourGrams).toBeGreaterThan(0);
            expect(res.waterGrams).toBeGreaterThan(0);
          }
        ),
        { numRuns: 1000 }
      );
    });
  });

  describe('Reverse Scheduler Process Continuity Invariants', () => {
    it('guarantees chronological stage adjacency and terminal alignment', () => {
      assertWithSeed(
        fc.property(
          fc.date({
            min: new Date(2026, 0, 1),
            max: new Date(2028, 11, 31),
            noInvalidDate: true,
          }), // target ready date
          fc.double({ min: 8.0, max: 24.0, noNaN: true }), // cold retard hours
          (targetDate, retardHours) => {
            const sched = calculateReverseSchedule(targetDate, {
              coldRetardHours: retardHours,
            });

            expect(sched.stages.length).toBeGreaterThan(0);

            // 1. Terminal stage ends exactly at target ready time
            const lastStage = sched.stages[sched.stages.length - 1];
            expect(lastStage.endTime.getTime()).toBe(targetDate.getTime());

            // 2. Strict chronological order and perfect boundary adjacency (stage[i].endTime === stage[i+1].startTime)
            for (let i = 0; i < sched.stages.length; i++) {
              const stage = sched.stages[i];
              expect(stage.startTime.getTime()).toBeLessThan(stage.endTime.getTime());

              if (i < sched.stages.length - 1) {
                const nextStage = sched.stages[i + 1];
                expect(stage.endTime.getTime()).toBe(nextStage.startTime.getTime());
              }
            }

            // 3. Process duration is positive and initial feed is before target
            const firstStage = sched.stages[0];
            expect(firstStage.startTime.getTime()).toBeLessThan(targetDate.getTime());
          }
        ),
        { numRuns: 500 }
      );
    });
  });

  describe('Bake Loss & Evaporation Mechanics Invariants', () => {
    it('preserves dough mass as sum of baked mass and evaporated steam across 1000 configurations', () => {
      assertWithSeed(
        fc.property(
          fc.integer({ min: 100, max: 25000 }), // dough weight in grams
          fc.double({ min: 5.0, max: 35.0, noNaN: true }), // bake loss percent
          fc.integer({ min: 1, max: 12 }), // loaves count
          (doughGrams, lossPct, loaves) => {
            const metrics = calculateBakeLossMetrics(doughGrams, lossPct, undefined, loaves);

            // Invariant 1: Mass conservation (dough === baked + evaporated)
            expect(metrics.bakedWeightGrams + metrics.evaporatedWaterGrams).toBe(doughGrams);

            // Invariant 2: Baked weight is strictly smaller than raw dough
            expect(metrics.bakedWeightGrams).toBeLessThan(doughGrams);
            expect(metrics.evaporatedWaterGrams).toBeGreaterThan(0);

            // Invariant 3: Single loaf mass times loaves count equals total baked mass (+/- loaves delta)
            if (loaves > 1 && metrics.singleLoafBakedGrams) {
              const multiLoafSum = metrics.singleLoafBakedGrams * loaves;
              expect(Math.abs(multiLoafSum - metrics.bakedWeightGrams)).toBeLessThanOrEqual(loaves);
            }

            // Invariant 4: Monotonicity: Higher loss % always results in smaller or equal baked weight
            const higherLossMetrics = calculateBakeLossMetrics(doughGrams, lossPct + 1.0);
            expect(higherLossMetrics.bakedWeightGrams).toBeLessThanOrEqual(metrics.bakedWeightGrams);

            // Invariant 5: Round-trip reversibility with calculateRequiredRawDoughWeight
            const recoveredRaw = calculateRequiredRawDoughWeight(metrics.bakedWeightGrams, lossPct, 1);
            expect(Math.abs(recoveredRaw - doughGrams)).toBeLessThanOrEqual(2);
          }
        ),
        { numRuns: 1000 }
      );
    });
  });

  describe('Flour Blend Absorption Invariants (Flour Atlas)', () => {
    it('preserves weighted absorption bounds and monotonic bounds across 1000 randomized flour blends', () => {
      const flourNames = [
        'Mąka pszenna typ 450 (Tortowa)',
        'Mąka pszenna typ 500',
        'Mąka pszenna typ 650',
        'Mąka pszenna chlebowa typ 750',
        'Mąka pszenna typ 850',
        'Mąka pszenna typ 1050',
        'Mąka pszenna typ 1850 (Graham)',
        'Mąka pszenna razowa typ 2000',
        'Mąka żytnia chlebowa typ 720',
        'Mąka żytnia razowa typ 2000',
        'Mąka Manitoba Forte',
        'Mąka orkiszowa typ 630',
        'Mąka orkiszowa razowa typ 2000',
      ];

      assertWithSeed(
        fc.property(
          fc.integer({ min: 0, max: flourNames.length - 1 }),
          fc.integer({ min: 0, max: flourNames.length - 1 }),
          fc.integer({ min: 1, max: 99 }),
          fc.double({ min: 50.0, max: 95.0, noNaN: true }),
          (idx1, idx2, pct1, hydr) => {
            const blend = [
              { name: flourNames[idx1], percentage: pct1 },
              { name: flourNames[idx2], percentage: 100 - pct1 },
            ];

            const analysis = analyzeFlourBlendAbsorption(blend, hydr);

            // Invariant 1: Weighted absorption is strictly between 58% and 82%
            expect(analysis.weightedAbsorptionPercent).toBeGreaterThanOrEqual(58.0);
            expect(analysis.weightedAbsorptionPercent).toBeLessThanOrEqual(82.0);

            // Invariant 2: Recommended range is well-ordered
            expect(analysis.recommendedHydrationRange[0]).toBeLessThanOrEqual(
              analysis.recommendedHydrationRange[1]
            );

            // Invariant 3: Protein and grain percentages within [0, 100]
            expect(analysis.ryePercentage).toBeGreaterThanOrEqual(0);
            expect(analysis.ryePercentage).toBeLessThanOrEqual(100);
            expect(analysis.wholeGrainPercentage).toBeGreaterThanOrEqual(0);
            expect(analysis.wholeGrainPercentage).toBeLessThanOrEqual(100);
            expect(analysis.estimatedProteinPercent).toBeGreaterThanOrEqual(8.5);
            expect(analysis.estimatedProteinPercent).toBeLessThanOrEqual(14.5);

            // Invariant 4: Non-empty informative advice string
            expect(analysis.doughFeelAdvicePl.length).toBeGreaterThan(10);
          }
        ),
        { numRuns: 1000 }
      );
    });
  });
});

