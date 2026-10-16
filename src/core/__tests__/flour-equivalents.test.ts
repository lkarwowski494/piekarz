import fc from 'fast-check';
import {
  FLOUR_EQUIVALENTS,
  getFlourEquivalents,
  searchFlourEquivalents,
  getNearestEquivalentByAshTyp,
  FlourEquivalentEntry,
} from '../flour-equivalents';

describe('Flour Equivalents Dictionary (DEC-25 / Z-052)', () => {
  it('contains at least 6 standard flour classifications covering pastry to whole grain', () => {
    const list = getFlourEquivalents();
    expect(list.length).toBeGreaterThanOrEqual(6);

    const categories = list.map((e) => e.category);
    expect(categories).toContain('pastry');
    expect(categories).toContain('all_purpose');
    expect(categories).toContain('bread_light');
    expect(categories).toContain('bread_standard');
    expect(categories).toContain('semi_whole');
    expect(categories).toContain('whole_grain');
  });

  it('guarantees valid ash percentage ranges, protein %, and absorption % across all entries', () => {
    for (const entry of FLOUR_EQUIVALENTS) {
      expect(entry.ashPercentRange[0]).toBeGreaterThan(0);
      expect(entry.ashPercentRange[1]).toBeGreaterThanOrEqual(entry.ashPercentRange[0]);
      expect(entry.typicalProteinPercent).toBeGreaterThanOrEqual(8.0);
      expect(entry.typicalProteinPercent).toBeLessThanOrEqual(20.0);
      expect(entry.typicalAbsorptionPercent).toBeGreaterThanOrEqual(50.0);
      expect(entry.typicalAbsorptionPercent).toBeLessThanOrEqual(95.0);
      expect(entry.plType.length).toBeGreaterThan(0);
      expect(entry.frType.length).toBeGreaterThan(0);
      expect(entry.itType.length).toBeGreaterThan(0);
      expect(entry.deType.length).toBeGreaterThan(0);
      expect(entry.usType.length).toBeGreaterThan(0);
      expect(entry.bestForPl.length).toBeGreaterThan(0);
      expect(entry.bestForEn.length).toBeGreaterThan(0);
    }
  });

  describe('Search functionality', () => {
    it('finds T65 when searching for French tradition flour', () => {
      const results = searchFlourEquivalents('T65');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe('bread_light');
      expect(results[0].plType).toContain('650');
    });

    it('finds Tipo 00 when searching for Italian pizza flour', () => {
      const results = searchFlourEquivalents('Tipo 00');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('finds Type 550 when searching for German classification', () => {
      const results = searchFlourEquivalents('550');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.deType.includes('550'))).toBe(true);
    });

    it('returns all flours for empty query', () => {
      const results = searchFlourEquivalents('   ');
      expect(results.length).toBe(FLOUR_EQUIVALENTS.length);
    });

    it('returns empty array for non-matching gibberish', () => {
      const results = searchFlourEquivalents('xyz999foobar');
      expect(results).toEqual([]);
    });
  });

  describe('Property-Based Testing (fast-check)', () => {
    it('nearest ash lookup always returns a valid defined equivalent for any ash typ [400..2500]', () => {
      fc.assert(
        fc.property(fc.integer({ min: 400, max: 2500 }), (ashTyp) => {
          const match: FlourEquivalentEntry = getNearestEquivalentByAshTyp(ashTyp);
          expect(match).toBeDefined();
          expect(match.id).toBeTruthy();
          expect(match.plType).toBeTruthy();
          expect(match.typicalAbsorptionPercent).toBeGreaterThan(50);
        }),
        { numRuns: 500 }
      );
    });

    it('search is case-insensitive for all existing regional names', () => {
      for (const entry of FLOUR_EQUIVALENTS) {
        const lowerRes = searchFlourEquivalents(entry.usType.toLowerCase());
        const upperRes = searchFlourEquivalents(entry.usType.toUpperCase());
        expect(lowerRes.length).toBe(upperRes.length);
        expect(lowerRes.some((r) => r.id === entry.id)).toBe(true);
      }
    });
  });
});
