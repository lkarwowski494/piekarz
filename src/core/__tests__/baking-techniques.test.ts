import fc from 'fast-check';
import {
  BAKING_TECHNIQUES,
  getBakingTechniques,
  filterTechniques,
  searchTechniques,
  TechniqueCategory,
} from '../baking-techniques';

describe('Artisan Baking Techniques Library (Z-091…098 / BIB)', () => {
  it('contains exactly 12 complete artisan technique cards from BIB-01 to BIB-12', () => {
    const list = getBakingTechniques();
    expect(list.length).toBe(12);

    const codes = list.map((t) => t.code);
    expect(codes).toEqual([
      'BIB-01',
      'BIB-02',
      'BIB-03',
      'BIB-04',
      'BIB-05',
      'BIB-06',
      'BIB-07',
      'BIB-08',
      'BIB-09',
      'BIB-10',
      'BIB-11',
      'BIB-12',
    ]);
  });

  it('verifies all cards have non-empty physical principle, execution steps, mistakes, and pro tips', () => {
    for (const tech of BAKING_TECHNIQUES) {
      expect(tech.titlePl.length).toBeGreaterThan(5);
      expect(tech.titleEn.length).toBeGreaterThan(5);
      expect(tech.physicalPrinciplePl.length).toBeGreaterThan(20);
      expect(tech.physicalPrincipleEn.length).toBeGreaterThan(20);
      expect(tech.executionStepsPl.length).toBeGreaterThanOrEqual(4);
      expect(tech.executionStepsEn.length).toBeGreaterThanOrEqual(4);
      expect(tech.commonMistakesPl.length).toBeGreaterThanOrEqual(2);
      expect(tech.commonMistakesEn.length).toBeGreaterThanOrEqual(2);
      expect(tech.proTipsPl.length).toBeGreaterThan(15);
      expect(tech.proTipsEn.length).toBeGreaterThan(15);
    }
  });

  describe('Search and Filtering', () => {
    it('filters techniques by category properly', () => {
      const shaping = filterTechniques('shaping');
      expect(shaping.length).toBe(3); // BIB-06, BIB-07, BIB-08
      expect(shaping.map((s) => s.code)).toEqual(['BIB-06', 'BIB-07', 'BIB-08']);

      const all = filterTechniques('all');
      expect(all.length).toBe(12);
    });

    it('searches for coil fold technique by code and keywords', () => {
      const byCode = searchTechniques('BIB-03');
      expect(byCode.length).toBe(1);
      expect(byCode[0].id).toBe('bib_03_coil_fold');

      const byKeyword = searchTechniques('zwojowe');
      expect(byKeyword.length).toBeGreaterThanOrEqual(1);
      expect(byKeyword[0].id).toBe('bib_03_coil_fold');
    });

    it('returns empty list for nonexistent search terms', () => {
      expect(searchTechniques('nonexistentkeyword123')).toEqual([]);
    });
  });

  describe('Property-Based Testing (fast-check)', () => {
    it('category filtering is always a partition of the total techniques array', () => {
      const categories: (TechniqueCategory | 'all')[] = [
        'all',
        'dough_prep',
        'bulk_fermentation',
        'shaping',
        'proofing',
        'baking_cooling',
      ];

      fc.assert(
        fc.property(fc.constantFrom(...categories), (cat) => {
          const res = filterTechniques(cat);
          expect(res.length).toBeLessThanOrEqual(BAKING_TECHNIQUES.length);
          if (cat !== 'all') {
            expect(res.every((t) => t.category === cat)).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
