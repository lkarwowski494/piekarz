import {
  calculateDoughRecipe,
  calculateDoughRecipeFromFlour,
  calculateDoughRecipeForLoaves,
  getHydrationDifficulty,
  calculateDDTWaterTemp,
  calculateIceRequirement,
  calculateFermentationAdaptation,
  convertYeast,
  calculateStarterFeeding,
  calculateStarterPhase,
  calculateBakedWeight,
  evaluateSourdoughSafety,
} from '../domain-rules';
import { RYE_VARIANT_THRESHOLD_PCT } from '../rye-stages';

describe('Piekarz Core Domain Rules (RD-00…RD-15)', () => {
  describe('RD-02: True Baker\'s Percentage & Mass Balance', () => {
    it('TV-01: Correctly balances recipe with 100% hydration starter', () => {
      // 1000g flour, 700g water (70%), 200g starter (20% at 100% hydr), 20g salt (2%) => Total 1920g
      const result = calculateDoughRecipe({
        flours: [{ name: 'Mąka pszenna chlebowa', percentage: 100.0 }],
        waterPercentage: 70.0,
        saltPercentage: 2.0,
        starterPercentage: 20.0,
        starterHydration: 100.0,
        targetDoughWeightGrams: 1920,
      });

      expect(result.baseFlourWeightGrams).toBe(1000);
      expect(result.waterGrams).toBe(700);
      expect(result.saltGrams).toBe(20.0);
      expect(result.starterGrams).toBe(200);
      expect(result.starterFlourGrams).toBe(100);
      expect(result.starterWaterGrams).toBe(100);

      // Total Flour = 1000 + 100 = 1100g
      // Total Water = 700 + 100 = 800g
      // Overall Hydration = 800 / 1100 = 72.73%
      expect(result.totalFlourGrams).toBe(1100);
      expect(result.totalWaterGrams).toBe(800);
      expect(result.overallHydrationPercent).toBe(72.73);
      expect(result.sumCheckGrams).toBe(1920);
    });

    it('TV-02: Correctly balances recipe with stiff starter (Lievito Madre 50% hydration)', () => {
      // 500g flour, 350g water (70%), 100g starter (20% at 50% hydr), 10g salt (2%) => Total 960g
      const result = calculateDoughRecipe({
        flours: [{ name: 'Mąka Tipo 00', percentage: 100.0 }],
        waterPercentage: 70.0,
        saltPercentage: 2.0,
        starterPercentage: 20.0,
        starterHydration: 50.0,
        targetDoughWeightGrams: 960,
      });

      expect(result.baseFlourWeightGrams).toBe(500);
      expect(result.starterGrams).toBe(100);
      // In 100g of 50% hydration starter: Flour = 100 / 1.5 = 66.67g, Water = 33.33g
      expect(result.starterFlourGrams).toBe(67);
      expect(result.starterWaterGrams).toBe(33);

      // Total Flour = 500 + 66.67 = 566.67g
      // Total Water = 350 + 33.33 = 383.33g
      // Overall Hydration = 383.33 / 566.67 = 67.65%
      expect(result.overallHydrationPercent).toBe(67.65);
    });

    it('TV-07: Scales recipe correctly to 3 loaves of 750g (2250g total)', () => {
      // Recipe: 100% flour, 68% water, 20% starter, 2% salt (Sum = 190%)
      const result = calculateDoughRecipe({
        flours: [{ name: 'Mąka pszenna T65', percentage: 100.0 }],
        waterPercentage: 68.0,
        saltPercentage: 2.0,
        starterPercentage: 20.0,
        targetDoughWeightGrams: 2250,
      });

      // Base Flour = 2250 / 1.9 = 1184.21g => 1184g
      expect(result.baseFlourWeightGrams).toBe(1184);
      // Water = 1184.21 * 0.68 = 805.26g => 805g
      expect(result.waterGrams).toBe(805);
      // Starter = 1184.21 * 0.20 = 236.84g => 237g
      expect(result.starterGrams).toBe(237);
      // Salt = 1184.21 * 0.02 = 23.68g => 23.7g
      expect(result.saltGrams).toBe(23.7);

      // Sum of rounded integers is 1184 + 805 + 237 + 24 = 2250g
      expect(result.sumCheckGrams).toBe(2250);
    });

    it('rye variant threshold: more than 50% rye flour (ZYT-GRA-001); 50% stays wheat, 50.1% and 51% are rye (BR-KALK-005 Granica 50%)', () => {
      const ryeFlag = (rye: number) =>
        calculateDoughRecipe({
          flours: [
            { name: 'Mąka żytnia razowa typ 2000', percentage: rye },
            { name: 'Mąka pszenna chlebowa', percentage: Math.round((100 - rye) * 10) / 10 },
          ],
          waterPercentage: 75.0,
          saltPercentage: 2.0,
          starterPercentage: 25.0,
          targetDoughWeightGrams: 1000,
        }).isHighRye;
      expect(RYE_VARIANT_THRESHOLD_PCT).toBe(50);
      expect(ryeFlag(49.8)).toBe(false);
      expect(ryeFlag(50)).toBe(false);
      expect(ryeFlag(50.1)).toBe(true);
      expect(ryeFlag(51)).toBe(true);
      expect(ryeFlag(100)).toBe(true);
    });

    it('Detects high rye ratio (>50%) and sets isHighRye flag (BR-KALK-005 Udział żyta wybiera wariant)', () => {
      const result = calculateDoughRecipe({
        flours: [
          { name: 'Mąka żytnia razowa typ 2000', percentage: 60.0 },
          { name: 'Mąka pszenna chlebowa', percentage: 40.0 },
        ],
        waterPercentage: 75.0,
        saltPercentage: 2.0,
        starterPercentage: 25.0,
        targetDoughWeightGrams: 1000,
      });

      expect(result.isHighRye).toBe(true);
      expect(result.flours[0].weightGrams).toBeGreaterThan(result.flours[1].weightGrams);
    });
  });

  describe('RD-05: Desired Dough Temperature (DDT)', () => {
    it('TV-05: Computes water temperature using 4-factor DDT formula', () => {
      // Target DDT: 26°C, Flour: 21°C, Room: 23°C, Starter: 22°C, Friction: 4°C
      // Water = 4 * 26 - (21 + 23 + 22 + 4) = 104 - 70 = 34.0°C
      const result = calculateDDTWaterTemp({
        targetDDT: 26.0,
        flourTemp: 21.0,
        roomTemp: 23.0,
        starterTemp: 22.0,
        frictionFactor: 4.0,
      });

      expect(result.waterTempTarget).toBe(34.0);
      expect(result.status).toBe('normal');
    });

    it('Alerts with too_hot_danger when water temp exceeds 45°C', () => {
      // Target DDT: 28°C, Flour: 12°C, Room: 14°C, Starter: 14°C, Friction: 0°C
      // Water = 4 * 28 - 40 = 112 - 40 = 72.0°C (>45°C)
      const result = calculateDDTWaterTemp({
        targetDDT: 28.0,
        flourTemp: 12.0,
        roomTemp: 14.0,
        starterTemp: 14.0,
        frictionFactor: 0.0,
      });

      expect(result.status).toBe('too_hot_danger');
      expect(result.warningMessagePl).toContain('przekracza 45°C');
    });

    it('Alerts with requires_ice when water temp drops below 4°C', () => {
      // Hot kitchen in summer: Target DDT 23°C, Flour 28°C, Room 30°C, Starter 28°C, Friction 8°C
      // Water = 4 * 23 - (28 + 30 + 28 + 8) = 92 - 94 = -2.0°C
      const result = calculateDDTWaterTemp({
        targetDDT: 23.0,
        flourTemp: 28.0,
        roomTemp: 30.0,
        starterTemp: 28.0,
        frictionFactor: 8.0,
      });

      expect(result.status).toBe('requires_ice');
      expect(result.waterTempTarget).toBe(-2.0);
    });

    // [M1-audytor-generalny-005; 07-jakosc-002 M3] granica: dokładnie 4,0°C to jeszcze woda bez lodu.
    it('Water at exactly 4.0°C is normal; 3.9°C requires ice (boundary)', () => {
      // 3 * 20 - (20 + 34 + 2) = 4.0°C
      const at = calculateDDTWaterTemp({ targetDDT: 20.0, flourTemp: 20.0, roomTemp: 34.0, frictionFactor: 2.0 });
      expect(at.waterTempTarget).toBe(4.0);
      expect(at.status).toBe('normal');
      // 3 * 20 - (20 + 34.1 + 2) = 3.9°C
      const below = calculateDDTWaterTemp({ targetDDT: 20.0, flourTemp: 20.0, roomTemp: 34.1, frictionFactor: 2.0 });
      expect(below.waterTempTarget).toBe(3.9);
      expect(below.status).toBe('requires_ice');
    });
  });

  describe('RD-07: Ice Calculation', () => {
    it('TV-06: Computes ice weight correctly for water cooling', () => {
      // Total water: 400g, tap temp: 20°C, target water temp: 5°C
      // Ice = 400 * (20 - 5) / (80 + 20) = 400 * 15 / 100 = 60g ice
      const result = calculateIceRequirement(400, 20.0, 5.0);

      expect(result.iceGrams).toBe(60);
      expect(result.waterGrams).toBe(340);
      expect(result.totalWaterGrams).toBe(400);
    });

    it('Returns zero ice if target temp is higher than or equal to tap temp', () => {
      const result = calculateIceRequirement(350, 18.0, 25.0);
      expect(result.iceGrams).toBe(0);
      expect(result.waterGrams).toBe(350);
    });
  });

  // Q10 = 3,0 w 20–26 °C (FER-Q10-002, DEC-08 c); wektory z wyniku roli 06 [M1-audytor-generalny-041]
  describe('RD-08: Fermentation Temperature Adaptation (Q10 = 3.0, FER-Q10-002)', () => {
    it('Adapts time correctly for cooler environment (21°C vs 24°C baseline)', () => {
      // 4.0 h * 3^(3/10) = 5.56 h
      const result = calculateFermentationAdaptation(4.0, 21.0, 24.0);

      expect(result.adaptedHours).toBeCloseTo(5.56, 2);
      expect(result.diffMinutes).toBeGreaterThan(0);
      expect(result.messagePl).toContain('wydłużony');
    });

    it('Adapts time correctly for warmer environment (26°C vs 24°C baseline)', () => {
      // 4.0 h * 3^(-2/10) = 3.21 h
      const result = calculateFermentationAdaptation(4.0, 26.0, 24.0);

      expect(result.adaptedHours).toBeCloseTo(3.21, 2);
      expect(result.diffMinutes).toBeLessThan(0);
      expect(result.messagePl).toContain('skrócony');
    });
  });

  // RD-19 (S-40, S-39: × 0,4) zamiast 3:1 [M1-audytor-generalny-130]
  describe('RD-19: Yeast Conversion (× 0,4)', () => {
    it('TV-04: Converts 42g fresh yeast to 16.8g dry yeast', () => {
      const result = convertYeast(42, 'fresh');
      expect(result.instantGrams).toBe(16.8);
    });

    it('Converts 7g dry yeast to 17.5g fresh yeast', () => {
      const result = convertYeast(7, 'instant');
      expect(result.freshGrams).toBe(17.5);
    });
  });

  describe('RD-11: Sourdough Starter Feeding', () => {
    it('Calculates 1:2:2 feeding ratio for target 200g starter', () => {
      // Total 5 parts: 1 part starter (40g), 2 parts flour (80g), 2 parts water (80g)
      const result = calculateStarterFeeding(200, [1, 2, 2]);

      expect(result.starterGrams).toBe(40);
      expect(result.flourGrams).toBe(80);
      expect(result.waterGrams).toBe(80);
      expect(result.starterGrams + result.flourGrams + result.waterGrams).toBe(200);
    });
  });

  describe('RD-10: Bake Loss Estimation', () => {
    it('Computes baked weight with default 14% loss', () => {
      const baked = calculateBakedWeight(900, 14.0);
      expect(baked).toBe(774);
    });
  });

  // [M1-audytor-generalny-013] werdykty według DEC-10 (a) i rejestru treści (docs/tresci/rejestr.json);
  // wcześniej test utrwalał wadę: kożuch „bezpieczny”, hooch „zdrowy”, isEdible: true.
  describe('RD-13: Sourdough Safety Evaluation', () => {
    it('Mold or discoloration means discard', () => {
      const safety = evaluateSourdoughSafety({ hasFuzzySpots: true, hasColoredSpots: true });
      expect(safety.status).toBe('discard');
      expect(safety.titlePl).toBe('Wyrzuć zakwas');
    });

    it('A white film is not judged harmless: discard (precaution, ZAK-NAL-001)', () => {
      const safety = evaluateSourdoughSafety({ hasWhiteWrinkledFilm: true });
      expect(safety.status).toBe('discard');
      expect(safety.actionPl).not.toMatch(/nieszkodliw|bezpieczn/i);
    });

    it('Hooch alone is described with attribution, without a "healthy" verdict', () => {
      const safety = evaluateSourdoughSafety({ hasHoochLiquid: true });
      expect(safety.status).toBe('hooch');
      expect(safety.actionPl).toContain('Według CSU Extension');
      expect(`${safety.titlePl} ${safety.actionPl}`).not.toMatch(/zdrow/i);
    });
  });

  describe('RD-16 & RD-17: Scaling from Base Flour & Loaves', () => {
    it('scales recipe from base flour weight 500g', () => {
      const recipe = calculateDoughRecipeFromFlour(500, {
        flours: [{ name: 'Mąka pszenna', percentage: 100.0 }],
        waterPercentage: 70.0,
        saltPercentage: 2.0,
        starterPercentage: 20.0,
        starterHydration: 100.0,
      });

      // 500g flour * 1.92 = 960g target dough
      expect(recipe.baseFlourWeightGrams).toBe(500);
      expect(recipe.waterGrams).toBe(350);
      expect(recipe.saltGrams).toBe(10);
      expect(recipe.starterGrams).toBe(100);
      expect(recipe.targetDoughWeightGrams).toBe(960);
    });

    it('scales recipe for 2 loaves of 800g each', () => {
      const recipe = calculateDoughRecipeForLoaves(2, 800, {
        flours: [{ name: 'Mąka pszenna', percentage: 100.0 }],
        waterPercentage: 70.0,
        saltPercentage: 2.0,
        starterPercentage: 20.0,
        starterHydration: 100.0,
      });

      expect(recipe.targetDoughWeightGrams).toBe(1600);
      expect(recipe.baseFlourWeightGrams).toBe(833);
      expect(recipe.waterGrams).toBe(583);
      expect(recipe.starterGrams).toBe(167);
      expect(recipe.saltGrams).toBe(16.7);
    });
  });

  describe('RD-18: Hydration Difficulty Classification', () => {
    it('correctly maps hydration percentage to artisan difficulty tiers', () => {
      expect(getHydrationDifficulty(65).level).toBe('easy');
      expect(getHydrationDifficulty(72).level).toBe('artisan_standard');
      expect(getHydrationDifficulty(78).level).toBe('high_open_crumb');
      expect(getHydrationDifficulty(85).level).toBe('expert_sticky');
    });
  });

  describe('RD-19: Sourdough Metabolic Phase and Peak Activity', () => {
    const now = 1700000000000;

    // Faza z okna predyktora (domyślnie 22 °C, 1:2:2, żyto: okno 5,3–7,5 h), nie z samego czasu
    // (ZAK-SZC-901 wycofane) [M1-audytor-generalny-044]
    it('identifies peak phase for starter fed 6 hours ago at room temp', () => {
      const fed6hAgo = now - 6 * 3600 * 1000;
      const result = calculateStarterPhase(fed6hAgo, 'ROOM_TEMP', now);
      expect(result.phase).toBe('peak');
      expect(result.labelPl).toBe('W szacowanym oknie szczytu');
    });

    it('identifies phase before the peak window for starter fed 1 hour ago', () => {
      const fed1hAgo = now - 1 * 3600 * 1000;
      const result = calculateStarterPhase(fed1hAgo, 'ROOM_TEMP', now);
      expect(result.phase).toBe('before');
      expect(result.labelPl).toBe('Przed szacowanym szczytem');
    });

    it('identifies phase after the peak window for starter fed 18 hours ago at room temp', () => {
      const fed18hAgo = now - 18 * 3600 * 1000;
      const result = calculateStarterPhase(fed18hAgo, 'ROOM_TEMP', now);
      expect(result.phase).toBe('after');
      expect(result.labelPl).toBe('Po szacowanym szczycie');
    });

    it('correctly evaluates fridge storage', () => {
      const fed2DaysAgo = now - 2 * 24 * 3600 * 1000;
      const result = calculateStarterPhase(fed2DaysAgo, 'FRIDGE', now);
      expect(result.phase).toBe('lag');
      expect(result.labelPl).toContain('Uśpiony w lodówce');

      const fed7DaysAgo = now - 7 * 24 * 3600 * 1000;
      const hungryResult = calculateStarterPhase(fed7DaysAgo, 'FRIDGE', now);
      expect(hungryResult.phase).toBe('hungry');
    });
  });
});


