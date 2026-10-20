import {
  calculateDoughRecipe,
  calculateDoughRecipeFromFlour,
  calculateDoughRecipeForLoaves,
  calculateDDTWaterTemp,
  calculateIceRequirement,
  calculateFermentationAdaptation,
  calculateBakedWeight,
  evaluateSourdoughSafety,
  getHydrationDifficulty,
  convertYeast,
  DoughRecipeInput,
} from '../domain-rules';

describe('Exhaustive Domain Math & Physics Invariants (BR-MATH-EXHAUSTIVE)', () => {
  // --------------------------------------------------------------------------
  // 1. Conservation of Flour Mass across Flours Blend Splits
  // --------------------------------------------------------------------------
  describe('Flour Blend Split Mass Conservation Invariant', () => {
    it('accurately conserves flour mass for complex multi-flour ratios (65% / 18% / 12% / 5%)', () => {
      const input: DoughRecipeInput = {
        flours: [
          { name: 'Mąka pszenna chlebowa t.750', percentage: 65.0 },
          { name: 'Mąka żytnia t.720', percentage: 18.0 },
          { name: 'Mąka orkiszowa jasna', percentage: 12.0 },
          { name: 'Mąka pszenna razowa t.2000', percentage: 5.0 },
        ],
        waterPercentage: 74.0,
        starterPercentage: 20.0,
        starterHydration: 100.0,
        saltPercentage: 2.1,
        targetDoughWeightGrams: 2450,
      };

      const result = calculateDoughRecipe(input);

      expect(result.flours.length).toBe(4);
      const sumFlours = result.flours.reduce((acc, f) => acc + f.weightGrams, 0);
      expect(Math.abs(sumFlours - result.baseFlourWeightGrams)).toBeLessThanOrEqual(1.0);
      expect(result.sumCheckGrams).toBe(2450);
    });

    it('conserves flour mass when scaling from flour amount with calculateDoughRecipeFromFlour', () => {
      const result = calculateDoughRecipeFromFlour(1500, {
        flours: [
          { name: 'Flour A', percentage: 50.0 },
          { name: 'Flour B', percentage: 30.0 },
          { name: 'Flour C', percentage: 20.0 },
        ],
        waterPercentage: 72.0,
        starterPercentage: 20.0,
        starterHydration: 100.0,
        saltPercentage: 2.0,
      });

      expect(result.baseFlourWeightGrams).toBe(1500);
      const sumFlours = result.flours.reduce((acc, f) => acc + f.weightGrams, 0);
      expect(sumFlours).toBe(1500);
      expect(result.flours[0].weightGrams).toBe(750);
      expect(result.flours[1].weightGrams).toBe(450);
      expect(result.flours[2].weightGrams).toBe(300);
    });

    it('conserves flour mass with 3-way split (33.33% / 33.33% / 33.34%)', () => {
      const result = calculateDoughRecipeFromFlour(1000, {
        flours: [
          { name: 'T65', percentage: 33.3333 },
          { name: 'Żyto', percentage: 33.3333 },
          { name: 'Orkisz', percentage: 33.3334 },
        ],
        waterPercentage: 70.0,
        starterPercentage: 20.0,
        saltPercentage: 2.0,
      });

      expect(result.baseFlourWeightGrams).toBe(1000);
      const sumFlours = result.flours.reduce((acc, f) => acc + f.weightGrams, 0);
      expect(Math.abs(sumFlours - 1000)).toBeLessThanOrEqual(1.0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. True Baker's Hydration Invariant (Accounting for Starter Flour and Water)
  // --------------------------------------------------------------------------
  describe('True Baker\'s Hydration & Water Balance across Hydrations', () => {
    it('verifies true overall hydration for 50% stiff hydration (Bagels / Pretzels)', () => {
      const result = calculateDoughRecipeFromFlour(1000, {
        flours: [{ name: 'Mąka pszenna', percentage: 100.0 }],
        waterPercentage: 50.0,
        starterPercentage: 15.0,
        starterHydration: 100.0,
        saltPercentage: 2.0,
      });

      // 1000g flour + 150g starter (75g flour, 75g water)
      // Added water: 500g, Starter water: 75g => Total water: 575g
      // Base flour: 1000g, Starter flour: 75g => Total flour: 1075g
      // Overall True Baker's hydration: 575 / 1075 = 53.49%
      expect(result.waterGrams).toBe(500);
      expect(result.starterGrams).toBe(150);
      expect(result.starterFlourGrams).toBe(75);
      expect(result.starterWaterGrams).toBe(75);
      expect(result.totalFlourGrams).toBe(1075);
      expect(result.totalWaterGrams).toBe(575);
      expect(result.overallHydrationPercent).toBe(53.49);
    });

    it('verifies true overall hydration for 85% high hydration artisan loaf', () => {
      const result = calculateDoughRecipeFromFlour(1000, {
        flours: [{ name: 'Mąka chlebowa', percentage: 100.0 }],
        waterPercentage: 85.0,
        starterPercentage: 20.0,
        starterHydration: 100.0,
        saltPercentage: 2.2,
      });

      // Added water: 850g, Starter: 200g (100g flour + 100g water)
      // Total water: 850 + 100 = 950g, Total flour: 1000 + 100 = 1100g
      // Overall True Baker's hydration: 950 / 1100 = 86.36%
      expect(result.waterGrams).toBe(850);
      expect(result.starterGrams).toBe(200);
      expect(result.totalFlourGrams).toBe(1100);
      expect(result.totalWaterGrams).toBe(950);
      expect(result.overallHydrationPercent).toBe(86.36);
    });

    it('verifies extreme 100% hydration (Pan de Cristal / High open crumb ciabatta)', () => {
      const result = calculateDoughRecipeFromFlour(500, {
        flours: [{ name: 'Mąka Manitoba', percentage: 100.0 }],
        waterPercentage: 100.0,
        starterPercentage: 20.0,
        starterHydration: 100.0,
        saltPercentage: 2.5,
      });

      // Added water: 500g, Starter: 100g (50g flour + 50g water)
      // Total water: 550g, Total flour: 550g
      // Overall hydration: 550 / 550 = 100.0%
      expect(result.waterGrams).toBe(500);
      expect(result.totalFlourGrams).toBe(550);
      expect(result.totalWaterGrams).toBe(550);
      expect(result.overallHydrationPercent).toBe(100.0);
    });

    it('verifies stiff levain (Pasta Madre / Lievito Madre at 50% hydration)', () => {
      const result = calculateDoughRecipeFromFlour(1000, {
        flours: [{ name: 'Mąka Manitoba', percentage: 100.0 }],
        waterPercentage: 75.0,
        starterPercentage: 20.0,
        starterHydration: 50.0, // stiff 50% starter
        saltPercentage: 2.0,
      });

      // Starter: 200g. At 50% hydration: Flour = 200 / 1.5 = 133g, Water = 67g
      expect(result.starterGrams).toBe(200);
      expect(result.starterFlourGrams).toBe(133);
      expect(result.starterWaterGrams).toBe(67);
      expect(result.waterGrams).toBe(750);
      expect(result.totalFlourGrams).toBe(1133);
      expect(result.totalWaterGrams).toBe(817);
      expect(result.overallHydrationPercent).toBe(72.06);
    });

    it('verifies liquid levain (Poolish / liquid sourdough at 150% hydration)', () => {
      const result = calculateDoughRecipeFromFlour(1000, {
        flours: [{ name: 'Mąka T65', percentage: 100.0 }],
        waterPercentage: 72.0,
        starterPercentage: 20.0,
        starterHydration: 150.0, // 150% liquid starter
        saltPercentage: 2.0,
      });

      // Starter: 200g. At 150%: Flour = 200 / 2.5 = 80g, Water = 120g
      expect(result.starterGrams).toBe(200);
      expect(result.starterFlourGrams).toBe(80);
      expect(result.starterWaterGrams).toBe(120);
      expect(result.waterGrams).toBe(720);
      expect(result.totalFlourGrams).toBe(1080);
      expect(result.totalWaterGrams).toBe(840);
      expect(result.overallHydrationPercent).toBe(77.78);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Dough Scaling & Loaves Multipliers
  // --------------------------------------------------------------------------
  describe('Dough Scaling & Loaves Multipliers', () => {
    it('scales linearly when doubling number of loaves (1x800g vs 2x800g vs 4x800g)', () => {
      const single = calculateDoughRecipeForLoaves(1, 800, {
        flours: [{ name: 'Mąka', percentage: 100.0 }],
        waterPercentage: 70.0,
        starterPercentage: 20.0,
        saltPercentage: 2.0,
      });

      const double = calculateDoughRecipeForLoaves(2, 800, {
        flours: [{ name: 'Mąka', percentage: 100.0 }],
        waterPercentage: 70.0,
        starterPercentage: 20.0,
        saltPercentage: 2.0,
      });

      const quad = calculateDoughRecipeForLoaves(4, 800, {
        flours: [{ name: 'Mąka', percentage: 100.0 }],
        waterPercentage: 70.0,
        starterPercentage: 20.0,
        saltPercentage: 2.0,
      });

      expect(double.targetDoughWeightGrams).toBe(single.targetDoughWeightGrams * 2);
      expect(quad.targetDoughWeightGrams).toBe(single.targetDoughWeightGrams * 4);
      expect(Math.abs(double.baseFlourWeightGrams - single.baseFlourWeightGrams * 2)).toBeLessThanOrEqual(1);
      expect(Math.abs(quad.baseFlourWeightGrams - single.baseFlourWeightGrams * 4)).toBeLessThanOrEqual(1);
    });

    it('estimates baked loaf weight correctly across varying baking loss percentages', () => {
      expect(calculateBakedWeight(1000, 14)).toBe(860);
      expect(calculateBakedWeight(800, 14)).toBe(688);
      expect(calculateBakedWeight(500, 12)).toBe(440);
      expect(calculateBakedWeight(500, 18)).toBe(410);
      expect(calculateBakedWeight(0, 14)).toBe(0);
      expect(calculateBakedWeight(-100, 14)).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // 4. DDT (Desired Dough Temperature) & Thermodynamics of Ice
  // --------------------------------------------------------------------------
  describe('DDT 4-Factor Equation & Ice Thermodynamics', () => {
    it('calculates standard water temp for 25°C DDT with 22°C room, 21°C flour, 4°C friction', () => {
      // 4-factor DDT: Water = (4 * 25) - (22 + 21 + 22[starter=room] + 4) = 100 - 69 = 31°C
      const ddt = calculateDDTWaterTemp({
        targetDDT: 25.0,
        roomTemp: 22.0,
        flourTemp: 21.0,
        starterTemp: 22.0,
        frictionFactor: 4.0,
      });

      expect(ddt.waterTempTarget).toBe(31.0);
      expect(ddt.status).toBe('normal');
    });

    it('triggers too_hot_danger when calculated water exceeds 45°C (thermal kill zone for yeast)', () => {
      // Freezing cold kitchen & flour: target 26°C, room 10°C, flour 8°C, starter 10°C, friction 1°C
      // Water = 104 - 29 = 75°C
      const ddt = calculateDDTWaterTemp({
        targetDDT: 26.0,
        roomTemp: 10.0,
        flourTemp: 8.0,
        starterTemp: 10.0,
        frictionFactor: 1.0,
      });

      expect(ddt.waterTempTarget).toBe(75.0);
      expect(ddt.status).toBe('too_hot_danger');
      expect(ddt.warningMessagePl).toContain('przekracza 45°C');
    });

    it('triggers requires_ice when calculated water temp is below 4°C', () => {
      // Summer heatwave: target DDT 24°C, room 30°C, flour 29°C, starter 30°C, spiral friction 15°C
      // Water = (4 * 24) - (30 + 29 + 30 + 15) = 96 - 104 = -8°C
      const ddt = calculateDDTWaterTemp({
        targetDDT: 24.0,
        roomTemp: 30.0,
        flourTemp: 29.0,
        starterTemp: 30.0,
        frictionFactor: 15.0,
      });

      expect(ddt.waterTempTarget).toBe(-8.0);
      expect(ddt.status).toBe('requires_ice');
    });

    it('calculates ice weight correctly for latent heat equation: Ice = water * (tap - target) / (80 + tap)', () => {
      // 500g total water, tap temp 20°C, desired water temp 0°C
      // Ice = 500 * (20 - 0) / (80 + 20) = 500 * 20 / 100 = 100g ice
      const iceResult = calculateIceRequirement(500, 20.0, 0.0);
      expect(iceResult.iceGrams).toBe(100);
      expect(iceResult.waterGrams).toBe(400);
      expect(iceResult.totalWaterGrams).toBe(500);
    });

    it('returns zero ice when target temperature is higher than tap water', () => {
      const iceResult = calculateIceRequirement(600, 18.0, 24.0);
      expect(iceResult.iceGrams).toBe(0);
      expect(iceResult.waterGrams).toBe(600);
      expect(iceResult.totalWaterGrams).toBe(600);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Q10 Kinetic Fermentation Factors
  // --------------------------------------------------------------------------
  describe('Kinetic Temperature Adaptation (Q10 = 2.0)', () => {
    it('returns baseline duration when current temp equals baseline (24°C)', () => {
      const adapt = calculateFermentationAdaptation(4.0, 24.0, 24.0);
      expect(adapt.adaptedHours).toBe(4.0);
      expect(adapt.diffMinutes).toBe(0);
      expect(adapt.adaptedMinutesFormatted).toBe('4h 0m');
    });

    it('shortens fermentation duration in warm environment (28°C vs 24°C)', () => {
      const adapt = calculateFermentationAdaptation(4.0, 28.0, 24.0);
      // At 28°C (4°C warmer): 4.0 * 2^(-0.4) ≈ 3.03h
      expect(adapt.adaptedHours).toBeLessThan(4.0);
      expect(adapt.diffMinutes).toBeLessThan(0);
    });

    it('lengthens fermentation duration in cold environment (18°C vs 24°C)', () => {
      const adapt = calculateFermentationAdaptation(4.0, 18.0, 24.0);
      // At 18°C (6°C colder): 4.0 * 2^(0.6) ≈ 6.06h
      expect(adapt.adaptedHours).toBeGreaterThan(4.0);
      expect(adapt.diffMinutes).toBeGreaterThan(0);
    });

    it('adapts monotonically across temperature spectrum (16°C to 30°C)', () => {
      const temps = [16, 18, 20, 22, 24, 26, 28, 30];
      const durations = temps.map((t) => calculateFermentationAdaptation(4.0, t, 24.0).adaptedHours);

      for (let i = 0; i < durations.length - 1; i++) {
        expect(durations[i]).toBeGreaterThan(durations[i + 1]);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 6. Biological Safety Priority Ordering
  // --------------------------------------------------------------------------
  describe('Sourdough Biological Safety Conflict Hierarchy', () => {
    // [M1-audytor-generalny-013] DEC-10 (a): każdy objaw poza samym płynem → discard; wcześniej test utrwalał
    // werdykty „bezpieczny kożuch” i „zakwas zdrowy” bez źródła.
    it('ensures mold strictly overrides hooch and film: discard', () => {
      const safety = evaluateSourdoughSafety({
        hasHoochLiquid: true,
        hasWhiteWrinkledFilm: true,
        hasFuzzySpots: true,
      });

      expect(safety.status).toBe('discard');
      expect(safety.titlePl).toBe('Wyrzuć zakwas');
      expect(safety.actionPl).toContain('nie próbuj go ratować');
    });

    it('ensures rotten smell means discard even without visible spots', () => {
      const safety = evaluateSourdoughSafety({
        hasRottenSmell: true,
      });

      expect(safety.status).toBe('discard');
    });

    it('evaluates pure hooch as hooch, with attribution and no health verdict', () => {
      const safety = evaluateSourdoughSafety({
        hasHoochLiquid: true,
      });

      expect(safety.status).toBe('hooch');
      expect(safety.titlePl).toBe('Płyn na powierzchni (hooch)');
    });

    it('evaluates a white film as discard (no "harmless" verdict)', () => {
      const safety = evaluateSourdoughSafety({
        hasWhiteWrinkledFilm: true,
      });

      expect(safety.status).toBe('discard');
    });

    it('evaluates no marked symptoms as no observation, not as healthy', () => {
      const safety = evaluateSourdoughSafety({});
      expect(safety.status).toBe('no_observation');
      expect(safety.titlePl).toBe('Nie zaznaczono żadnego objawu');
    });
  });

  // --------------------------------------------------------------------------
  // 7. Commercial Yeast Conversions (Fresh vs Instant Dry vs Active Dry)
  // --------------------------------------------------------------------------
  describe('Yeast Conversion Equivalences (Fresh 3x vs Instant 1x)', () => {
    it('converts instant to fresh yeast with 3x multiplier', () => {
      const res = convertYeast(5.0, 'instant');
      expect(res.freshGrams).toBe(15.0);
      expect(res.instantGrams).toBe(5.0);
    });

    it('converts fresh to instant yeast with 1/3 divisor', () => {
      const res = convertYeast(15.0, 'fresh');
      expect(res.instantGrams).toBe(5.0);
      expect(res.freshGrams).toBe(15.0);
    });

    it('throws error when negative yeast weight is provided (BR-KALK-009 Ujemna masa)', () => {
      expect(() => convertYeast(-5.0, 'fresh')).toThrow('Masa drożdży nie może być ujemna');
    });
  });

  // --------------------------------------------------------------------------
  // 8. Hydration Difficulty Tiers
  // --------------------------------------------------------------------------
  describe('Hydration Handling Difficulty Classification', () => {
    it('classifies low hydrations (<68%) as easy', () => {
      expect(getHydrationDifficulty(60).level).toBe('easy');
      expect(getHydrationDifficulty(65).level).toBe('easy');
      expect(getHydrationDifficulty(67.9).level).toBe('easy');
    });

    it('classifies standard artisan hydrations (68% - 75%) as artisan_standard', () => {
      expect(getHydrationDifficulty(68.0).level).toBe('artisan_standard');
      expect(getHydrationDifficulty(72.0).level).toBe('artisan_standard');
      expect(getHydrationDifficulty(75.0).level).toBe('artisan_standard');
    });

    it('classifies high open crumb hydrations (75.1% - 82%) as high_open_crumb', () => {
      expect(getHydrationDifficulty(76.0).level).toBe('high_open_crumb');
      expect(getHydrationDifficulty(80.0).level).toBe('high_open_crumb');
      expect(getHydrationDifficulty(82.0).level).toBe('high_open_crumb');
    });

    it('classifies extreme hydrations (>82%) as expert_sticky', () => {
      expect(getHydrationDifficulty(82.1).level).toBe('expert_sticky');
      expect(getHydrationDifficulty(88.0).level).toBe('expert_sticky');
      expect(getHydrationDifficulty(100.0).level).toBe('expert_sticky');
    });
  });
});
