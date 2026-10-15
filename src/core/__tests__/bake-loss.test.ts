import {
  calculateBakeLossMetrics,
  calculateRequiredRawDoughWeight,
  calculateBakedWeight,
  BAKE_LOSS_PRESETS,
} from '../domain-rules';

describe('RD-10 & RD-10b: Bake Loss & Crumb Moisture Mechanics', () => {
  describe('Presets Configuration', () => {
    it('defines 5 standard baking presets with realistic physical ranges', () => {
      expect(BAKE_LOSS_PRESETS.length).toBe(5);

      const batard = BAKE_LOSS_PRESETS.find((p) => p.id === 'batard_boule');
      expect(batard).toBeDefined();
      expect(batard?.defaultLossPercent).toBe(14.0);
      expect(batard?.minLossPercent).toBe(12.0);
      expect(batard?.maxLossPercent).toBe(16.0);

      const tinRye = BAKE_LOSS_PRESETS.find((p) => p.id === 'tin_rye');
      expect(tinRye?.defaultLossPercent).toBe(11.0);

      const baguette = BAKE_LOSS_PRESETS.find((p) => p.id === 'baguette_roll');
      expect(baguette?.defaultLossPercent).toBe(18.0);

      const focaccia = BAKE_LOSS_PRESETS.find((p) => p.id === 'pan_focaccia');
      expect(focaccia?.defaultLossPercent).toBe(13.0);
    });
  });

  describe('calculateBakeLossMetrics', () => {
    it('computes exact baked mass and evaporated steam for a standard 850g batard at 14% loss', () => {
      const res = calculateBakeLossMetrics(850, 14.0, 350, 1);

      // 850 * 0.86 = 731g
      expect(res.bakedWeightGrams).toBe(731);
      expect(res.evaporatedWaterGrams).toBe(119);
      expect(res.bakeLossPercent).toBe(14.0);
      expect(res.singleLoafBakedGrams).toBe(731);

      // Retained moisture: (350 - 119) / 731 = 231 / 731 * 100 = 31.6%
      expect(res.retainedMoisturePercent).toBe(31.6);
      expect(res.crumbMoistureCategory).toBe('dry');
      expect(res.categoryLabelPl).toContain('Suchy');
    });

    it('identifies custardy / wet crumb for very high hydration doughs', () => {
      // 1000g dough with 550g water (80%+ hydration), 12% loss (covered Dutch oven)
      // Baked: 1000 * 0.88 = 880g. Evaporated = 120g. Retained water = 430g.
      // Retained moisture = 430 / 880 * 100 = 48.9%
      const res = calculateBakeLossMetrics(1000, 12.0, 550, 1);

      expect(res.bakedWeightGrams).toBe(880);
      expect(res.retainedMoisturePercent).toBe(48.9);
      expect(res.crumbMoistureCategory).toBe('custardy_wet');
      expect(res.categoryLabelPl).toContain('kremowy');
      expect(res.coolingAdvicePl).toContain('4–6 godzin');
    });

    it('identifies balanced artisanal crumb for typical 72% hydration country loaves', () => {
      // 900g dough with 400g water, 13% loss
      // Baked: 900 * 0.87 = 783g. Evaporated = 117g. Retained water = 283g.
      // Moisture = 283 / 783 * 100 = 36.1% -> Let's test with 430g water:
      // Retained = 430 - 117 = 313g -> 313 / 783 * 100 = 40.0%
      const res = calculateBakeLossMetrics(900, 13.0, 430, 1);

      expect(res.crumbMoistureCategory).toBe('balanced');
      expect(res.categoryLabelPl).toContain('Równomierny');
      expect(res.coolingAdvicePl).toContain('min. 2 godziny');
    });

    it('correctly splits final weight across multiple loaves in batch', () => {
      // 3 loaves of 600g raw dough each = 1800g total, 15% loss
      // Baked total: 1800 * 0.85 = 1530g. Single loaf = 1530 / 3 = 510g.
      const res = calculateBakeLossMetrics(1800, 15.0, 750, 3);

      expect(res.doughWeightGrams).toBe(1800);
      expect(res.bakedWeightGrams).toBe(1530);
      expect(res.singleLoafBakedGrams).toBe(510);
    });

    it('throws error for invalid dough weight <= 0 or loss out of bounds', () => {
      expect(() => calculateBakeLossMetrics(0, 14.0)).toThrow('Masa ciasta');
      expect(() => calculateBakeLossMetrics(-100, 14.0)).toThrow('Masa ciasta');
      expect(() => calculateBakeLossMetrics(800, 0)).toThrow('Strata piecowa');
      expect(() => calculateBakeLossMetrics(800, 50)).toThrow('Strata piecowa');
    });
  });

  describe('calculateRequiredRawDoughWeight', () => {
    it('calculates necessary raw dough mass to achieve exact target baked loaf weight', () => {
      // Want 750g baked loaf at 14% loss: raw = 750 / (1 - 0.14) = 750 / 0.86 = 872g
      const rawSingle = calculateRequiredRawDoughWeight(750, 14.0, 1);
      expect(rawSingle).toBe(872);

      // Verify round-trip: 872 * 0.86 = 749.92 -> 750g
      expect(calculateBakedWeight(rawSingle, 14.0)).toBe(750);
    });

    it('calculates total batch raw dough mass for 4 baguettes of 250g baked weight at 18% loss', () => {
      // Target 250g baked per baguette, 18% loss -> raw per baguette = 250 / 0.82 = 304.88g
      // 4 baguettes = 304.88 * 4 = 1219.5 -> 1220g
      const rawBatch = calculateRequiredRawDoughWeight(250, 18.0, 4);
      expect(rawBatch).toBe(1220);
    });

    it('throws on invalid target baked weight or out-of-range loss', () => {
      expect(() => calculateRequiredRawDoughWeight(0, 14.0)).toThrow();
      expect(() => calculateRequiredRawDoughWeight(500, -2.0)).toThrow();
      expect(() => calculateRequiredRawDoughWeight(500, 55.0)).toThrow();
    });
  });

  describe('calculateBakedWeight (legacy backward compatibility)', () => {
    it('returns 0 for negative or zero weight', () => {
      expect(calculateBakedWeight(0)).toBe(0);
      expect(calculateBakedWeight(-500)).toBe(0);
    });

    it('matches calculateBakeLossMetrics baked weight output exactly', () => {
      const w = 920;
      const loss = 13.5;
      expect(calculateBakedWeight(w, loss)).toBe(calculateBakeLossMetrics(w, loss).bakedWeightGrams);
    });
  });
});
