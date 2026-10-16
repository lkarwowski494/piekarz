import * as fc from 'fast-check';
import { calculateBakeStatistics, filterBakeLogs } from '../bake-statistics';
import { StoredBakeLog } from '../../data/db';

describe('Bake Statistics & History Engine (src/core/bake-statistics.ts)', () => {
  const sampleLogs: StoredBakeLog[] = [
    {
      id: 'bake_1',
      recipeName: 'Wiejski chleb 72%',
      startedAt: 1000,
      ratingStars: 5,
      crumbScore: 5,
      crustScore: 4,
      tasteProfile: 'balanced',
      notes: 'Super pęcherzykowaty miękisz',
    },
    {
      id: 'bake_2',
      recipeName: 'Wiejski chleb 72%',
      startedAt: 2000,
      ratingStars: 4,
      crumbScore: 3,
      crustScore: 5,
      tasteProfile: 'sour',
      notes: 'Lekko przekwaszony',
    },
    {
      id: 'bake_3',
      recipeName: 'Bagietki tradycyjne',
      startedAt: 3000,
      ratingStars: 3,
      crumbScore: 4,
      crustScore: 3,
      tasteProfile: 'mild',
    },
  ];

  it('handles empty logs gracefully', () => {
    const res = calculateBakeStatistics([]);
    expect(res.totalBakes).toBe(0);
    expect(res.averageRating).toBe(0);
    expect(res.averageCrumbScore).toBe(0);
    expect(res.averageCrustScore).toBe(0);
    expect(res.hasEnoughData).toBe(false);
  });

  it('calculates aggregate averages and identifies most frequent recipe', () => {
    const res = calculateBakeStatistics(sampleLogs);

    expect(res.totalBakes).toBe(3);
    // (5 + 4 + 3) / 3 = 4.0
    expect(res.averageRating).toBe(4.0);
    // (5 + 3 + 4) / 3 = 4.0
    expect(res.averageCrumbScore).toBe(4.0);
    // (4 + 5 + 3) / 3 = 4.0
    expect(res.averageCrustScore).toBe(4.0);

    expect(res.mostBakedRecipeName).toBe('Wiejski chleb 72%');
    expect(res.tasteDistribution.balanced).toBe(1);
    expect(res.tasteDistribution.sour).toBe(1);
    expect(res.tasteDistribution.mild).toBe(1);
    expect(res.tasteDistribution.tangy).toBe(0);
    expect(res.hasEnoughData).toBe(true);
  });

  describe('filterBakeLogs', () => {
    it('filters by recipe name and note text query', () => {
      const byName = filterBakeLogs(sampleLogs, { searchQuery: 'bagietki' });
      expect(byName.length).toBe(1);
      expect(byName[0].id).toBe('bake_3');

      const byNote = filterBakeLogs(sampleLogs, { searchQuery: 'przekwaszony' });
      expect(byNote.length).toBe(1);
      expect(byNote[0].id).toBe('bake_2');
    });

    it('filters by taste profile', () => {
      const sourOnly = filterBakeLogs(sampleLogs, { tasteProfile: 'sour' });
      expect(sourOnly.length).toBe(1);
      expect(sourOnly[0].id).toBe('bake_2');
    });

    it('filters by minimum star rating', () => {
      const fourStarsOrMore = filterBakeLogs(sampleLogs, { minRating: 4 });
      expect(fourStarsOrMore.length).toBe(2);
    });

    it('returns all logs when filter is empty', () => {
      const all = filterBakeLogs(sampleLogs, {});
      expect(all.length).toBe(sampleLogs.length);
    });
  });

  // Property-based testing
  it('maintains valid metric ranges across arbitrary bake logs (property-based)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            recipeName: fc.constantFrom('Chleb wiejski', 'Bagietka', 'Pizza'),
            startedAt: fc.integer({ min: 1000, max: 100000 }),
            ratingStars: fc.integer({ min: 1, max: 5 }),
            crumbScore: fc.integer({ min: 1, max: 5 }),
            crustScore: fc.integer({ min: 1, max: 5 }),
            tasteProfile: fc.constantFrom('mild' as const, 'balanced' as const, 'sour' as const, 'tangy' as const),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        (logs) => {
          const stats = calculateBakeStatistics(logs);

          if (logs.length > 0) {
            expect(stats.averageRating).toBeGreaterThanOrEqual(1.0);
            expect(stats.averageRating).toBeLessThanOrEqual(5.0);
            expect(stats.averageCrumbScore).toBeGreaterThanOrEqual(1.0);
            expect(stats.averageCrumbScore).toBeLessThanOrEqual(5.0);
            expect(stats.averageCrustScore).toBeGreaterThanOrEqual(1.0);
            expect(stats.averageCrustScore).toBeLessThanOrEqual(5.0);
            expect(stats.totalBakes).toBe(logs.length);
          } else {
            expect(stats.totalBakes).toBe(0);
          }

          const filtered = filterBakeLogs(logs, {});
          expect(filtered.length).toBe(logs.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
