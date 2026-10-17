import corpusFixture from './fixtures/bakers-corpus.json';
import { calculateDoughRecipe } from '../domain-rules';

describe('True Baker\'s % Python Oracle Cross-Validation (BR-TEST-011..014)', () => {
  it('validates meta header and non-empty corpus dataset', () => {
    expect(corpusFixture.meta.generator).toContain('gen-bakers-corpus.py');
    expect(corpusFixture.cases.length).toBe(200);
  });

  describe('200 True Baker\'s % Cases (Mass Balance & Hydration)', () => {
    corpusFixture.cases.forEach((c, idx) => {
      it(`Case #${idx + 1}: ${c.targetWeight}g dough (water ${c.waterPct}%, starter ${c.starterPct}% @ ${c.starterHydration}% hydr) matches Python reference`, () => {
        const result = calculateDoughRecipe({
          targetDoughWeightGrams: c.targetWeight,
          flours: c.flours.map((f: any) => ({ name: f.name, percentage: f.pct })),
          waterPercentage: c.waterPct,
          saltPercentage: c.saltPct,
          starterPercentage: c.starterPct,
          starterHydration: c.starterHydration,
          extraYeastPercentage: c.extraYeastPct,
        });

        expect(result.targetDoughWeightGrams).toBe(c.targetWeight);
        expect(result.starterGrams).toBe(c.starterWeight);
        expect(result.starterFlourGrams).toBe(c.starterFlour);
        expect(result.starterWaterGrams).toBe(c.starterWater);
        expect(result.waterGrams).toBe(c.recipeWater);
        expect(result.saltGrams).toBe(c.saltWeight);
        expect(result.totalFlourGrams).toBe(c.totalFlour);
        expect(result.totalWaterGrams).toBe(c.totalWater);
        expect(result.baseFlourWeightGrams).toBe(c.baseFlourWeight);
        expect(Math.abs(result.overallHydrationPercent - c.overallHydration)).toBeLessThanOrEqual(0.1);
        expect(result.sumCheckGrams).toBe(c.sumCheck);
      });
    });
  });
});
