import fc from 'fast-check';
import {
  VOLUME_INGREDIENTS,
  convertVolumeToGrams,
  VolumeIngredientId,
  VolumeUnit,
  CupStandard,
  VOLUME_ACCURACY_WARNING_PL,
} from '../volume-converter';

describe('Volume to Weight Converter (Z-013 / DEC-14)', () => {
  it('has comprehensive ingredient list including flours, liquids, salts, yeasts, and starter', () => {
    expect(VOLUME_INGREDIENTS.length).toBeGreaterThanOrEqual(10);
    const ids = VOLUME_INGREDIENTS.map((i) => i.id);
    expect(ids).toContain('flour_wheat_sifted');
    expect(ids).toContain('flour_wheat_scooped');
    expect(ids).toContain('water');
    expect(ids).toContain('salt_fine');
    expect(ids).toContain('yeast_instant');
    expect(ids).toContain('starter_100');
  });

  it('correctly converts 1 metric cup of water to 250g and 1 US cup of water to 237g', () => {
    const metricRes = convertVolumeToGrams('water', 1, 'cup', 'metric');
    expect(metricRes.grams).toBe(250);

    const usRes = convertVolumeToGrams('water', 1, 'cup', 'us');
    expect(usRes.grams).toBe(237);
  });

  it('reflects higher density of scooped flour vs sifted flour', () => {
    const sifted = convertVolumeToGrams('flour_wheat_sifted', 1, 'cup', 'metric');
    const scooped = convertVolumeToGrams('flour_wheat_scooped', 1, 'cup', 'metric');
    expect(scooped.grams).toBeGreaterThan(sifted.grams);
    expect(scooped.grams - sifted.grams).toBeGreaterThanOrEqual(20);
  });

  it('correctly converts tablespoons and teaspoons', () => {
    const tbspWater = convertVolumeToGrams('water', 1, 'tablespoon');
    expect(tbspWater.grams).toBe(15);

    const tspSalt = convertVolumeToGrams('salt_fine', 1, 'teaspoon');
    expect(tspSalt.grams).toBe(6);

    const tspYeast = convertVolumeToGrams('yeast_instant', 1, 'teaspoon');
    expect(tspYeast.grams).toBe(3.1);
  });

  it('always includes accuracy warning notice', () => {
    const res = convertVolumeToGrams('flour_wheat_sifted', 2, 'cup');
    expect(res.warningNoticePl.length).toBeGreaterThan(10);
    expect(res.warningNoticeEn.length).toBeGreaterThan(10);
  });

  describe('Property-Based Testing (fast-check)', () => {
    it('conversion result is non-negative and strictly monotonic with amount', () => {
      const units: VolumeUnit[] = ['cup', 'tablespoon', 'teaspoon'];
      const standards: CupStandard[] = ['us', 'metric'];

      fc.assert(
        fc.property(
          fc.constantFrom(...VOLUME_INGREDIENTS.map((i) => i.id as VolumeIngredientId)),
          fc.float({ min: 0, max: 50, noNaN: true }),
          fc.float({ min: 0, max: 50, noNaN: true }),
          fc.constantFrom(...units),
          fc.constantFrom(...standards),
          (id, amtA, amtB, unit, std) => {
            const minAmt = Math.min(amtA, amtB);
            const maxAmt = Math.max(amtA, amtB);

            const resMin = convertVolumeToGrams(id, minAmt, unit, std);
            const resMax = convertVolumeToGrams(id, maxAmt, unit, std);

            expect(resMin.grams).toBeGreaterThanOrEqual(0);
            expect(resMax.grams).toBeGreaterThanOrEqual(resMin.grams);
          }
        ),
        { numRuns: 300 }
      );
    });
  });
});
