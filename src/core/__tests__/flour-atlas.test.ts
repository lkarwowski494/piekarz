import {
  matchFlourProfile,
  analyzeFlourBlendAbsorption,
  validateFlourBlend,
  normalizeFlourBlend,
  FLOUR_PROFILES,
} from '../flour-atlas';

describe('Flour Atlas & Blend Absorption Engine Specification (core/flour-atlas)', () => {
  it('contains comprehensive database of European & Polish flours', () => {
    expect(FLOUR_PROFILES.length).toBeGreaterThanOrEqual(10);
    expect(FLOUR_PROFILES.some((p) => p.id === 'wheat_750')).toBe(true);
    expect(FLOUR_PROFILES.some((p) => p.id === 'rye_2000')).toBe(true);
    expect(FLOUR_PROFILES.some((p) => p.id === 'wheat_manitoba')).toBe(true);
  });

  describe('matchFlourProfile', () => {
    it('matches Manitoba and strong high-W flours', () => {
      const p = matchFlourProfile('Mąka Manitoba Forte W360');
      expect(p.id).toBe('wheat_manitoba');
      expect(p.wStrength).toBe(360);
    });

    it('matches spelt flours correctly', () => {
      const lightSpelt = matchFlourProfile('Orkiszowa jasna 630');
      expect(lightSpelt.id).toBe('spelt_630');

      const wholeSpelt = matchFlourProfile('Mąka orkiszowa razowa typ 2000');
      expect(wholeSpelt.id).toBe('spelt_2000');
    });

    it('matches rye flours correctly', () => {
      const breadRye = matchFlourProfile('Mąka żytnia chlebowa t720');
      expect(breadRye.id).toBe('rye_720');

      const wholeRye = matchFlourProfile('Mąka żytnia razowa 2000');
      expect(wholeRye.id).toBe('rye_2000');
    });

    it('matches specific wheat typ numbers', () => {
      expect(matchFlourProfile('Tortowa typ 450').id).toBe('wheat_450');
      expect(matchFlourProfile('Poznańska typ 500').id).toBe('wheat_500');
      expect(matchFlourProfile('Mąka bułkowa t650').id).toBe('wheat_650');
      expect(matchFlourProfile('Mąka pszenna typ 850').id).toBe('wheat_850');
      expect(matchFlourProfile('Mąka pszenna typ 1050').id).toBe('wheat_1050');
      expect(matchFlourProfile('Graham typ 1850').id).toBe('wheat_1850');
      expect(matchFlourProfile('Pszenna razowa typ 2000').id).toBe('wheat_2000');
    });

    it('falls back to classic typ 750 when name is generic or unclassified', () => {
      const fallback = matchFlourProfile('Mąka ze sklepu');
      expect(fallback.id).toBe('wheat_750');
    });
  });

  describe('analyzeFlourBlendAbsorption', () => {
    it('computes weighted absorption for pure bread flour 750', () => {
      const blend = [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100 }];
      const analysis = analyzeFlourBlendAbsorption(blend, 70.0);

      expect(analysis.weightedAbsorptionPercent).toBe(68.0);
      expect(analysis.recommendedHydrationRange).toEqual([66.0, 74.0]);
      expect(analysis.estimatedProteinPercent).toBe(12.2);
      expect(analysis.ryePercentage).toBe(0);
      expect(analysis.doughFeelAdvicePl).toContain('Idealny balans');
    });

    it('computes weighted metrics for composite 50/50 wheat-rye blend', () => {
      const blend = [
        { name: 'Mąka pszenna chlebowa t750', percentage: 50 },
        { name: 'Mąka żytnia razowa typ 2000', percentage: 50 },
      ];
      const analysis = analyzeFlourBlendAbsorption(blend, 75.0);

      // (68 + 82) / 2 = 75.0
      expect(analysis.weightedAbsorptionPercent).toBe(75.0);
      // Min: (66 + 78)/2 = 72.0, Max: (74 + 90)/2 = 82.0
      expect(analysis.recommendedHydrationRange).toEqual([72.0, 82.0]);
      expect(analysis.ryePercentage).toBe(50.0);
      expect(analysis.wholeGrainPercentage).toBe(50.0);
      expect(analysis.doughFeelAdvicePl).toContain('Wysoki udział żyta');
    });

    it('warns when recipe hydration is excessively high for the flour blend', () => {
      const blend = [{ name: 'Mąka tortowa typ 450', percentage: 100 }]; // Max rec: 62%
      const analysis = analyzeFlourBlendAbsorption(blend, 78.0); // 78% is way too high

      expect(analysis.doughFeelAdvicePl).toContain('bardzo wysoka hydratacja');
    });

    it('warns when recipe hydration is very low and dough will be stiff', () => {
      const blend = [{ name: 'Mąka pszenna razowa typ 2000', percentage: 100 }]; // Min rec: 78%
      const analysis = analyzeFlourBlendAbsorption(blend, 60.0);

      expect(analysis.doughFeelAdvicePl).toContain('bardzo zwarte i sztywne');
    });

    it('handles empty blend gracefully with safe defaults', () => {
      const analysis = analyzeFlourBlendAbsorption([], 70.0);
      expect(analysis.weightedAbsorptionPercent).toBe(68.0);
      expect(analysis.recommendedHydrationRange).toEqual([66.0, 74.0]);
    });
  });

  describe('validateFlourBlend', () => {
    it('approves blend that sums exactly to 100%', () => {
      const res = validateFlourBlend([
        { name: 'Mąka T750', percentage: 70 },
        { name: 'Mąka T2000', percentage: 30 },
      ]);
      expect(res.isValid).toBe(true);
      expect(res.sumPercentage).toBe(100.0);
      expect(res.remainingPercentage).toBe(0);
      expect(res.errorPl).toBeUndefined();
    });

    it('rejects blend summing to less than 100% and calculates remaining', () => {
      const res = validateFlourBlend([
        { name: 'Mąka T750', percentage: 60 },
        { name: 'Mąka T2000', percentage: 20 },
      ]);
      expect(res.isValid).toBe(false);
      expect(res.sumPercentage).toBe(80.0);
      expect(res.remainingPercentage).toBe(20.0);
      expect(res.errorPl).toContain('brakuje jeszcze 20%');
    });

    it('rejects blend exceeding 100%', () => {
      const res = validateFlourBlend([
        { name: 'Mąka T750', percentage: 80 },
        { name: 'Mąka T2000', percentage: 30 },
      ]);
      expect(res.isValid).toBe(false);
      expect(res.sumPercentage).toBe(110.0);
      expect(res.errorPl).toContain('przekracza 100% o 10%');
    });

    it('rejects empty blend', () => {
      const res = validateFlourBlend([]);
      expect(res.isValid).toBe(false);
      expect(res.errorPl).toContain('co najmniej jedną mąkę');
    });
  });

  describe('normalizeFlourBlend', () => {
    it('normalizes arbitrary percentages to exact 100%', () => {
      const normalized = normalizeFlourBlend([
        { name: 'Mąka A', percentage: 50 },
        { name: 'Mąka B', percentage: 25 },
        { name: 'Mąka C', percentage: 25 },
      ]);
      const sum = normalized.reduce((acc, f) => acc + f.percentage, 0);
      expect(sum).toBe(100.0);
      expect(normalized[0].percentage).toBe(50.0);
      expect(normalized[1].percentage).toBe(25.0);
      expect(normalized[2].percentage).toBe(25.0);
    });

    it('handles uneven proportions and absorbs rounding residual in last item', () => {
      const normalized = normalizeFlourBlend([
        { name: 'Mąka A', percentage: 1 },
        { name: 'Mąka B', percentage: 1 },
        { name: 'Mąka C', percentage: 1 },
      ]);
      const sum = normalized.reduce((acc, f) => acc + f.percentage, 0);
      expect(sum).toBe(100.0);
      expect(normalized[0].percentage).toBe(33.3);
      expect(normalized[1].percentage).toBe(33.3);
      expect(normalized[2].percentage).toBe(33.4);
    });
  });
});

