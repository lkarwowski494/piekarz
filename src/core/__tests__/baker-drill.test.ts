import fc from 'fast-check';
import {
  BIOCHEMICAL_FLASHCARDS,
  getBiochemicalFlashcards,
  generateDrillQuestion,
  DrillLevel,
} from '../baker-drill';

describe('Mental Baker Drill & Biochemical Flashcards (BR-TRE-001…002)', () => {
  it('contains at least 6 scientific flashcards with valid literature citations', () => {
    const cards = getBiochemicalFlashcards();
    expect(cards.length).toBeGreaterThanOrEqual(6);

    for (const card of BIOCHEMICAL_FLASHCARDS) {
      expect(card.titlePl.length).toBeGreaterThan(5);
      expect(card.frontSummaryPl.length).toBeGreaterThan(10);
      expect(card.backDeepDivePl.length).toBeGreaterThan(20);
      expect(card.keyTakeawayPl.length).toBeGreaterThan(10);
      expect(card.citation.length).toBeGreaterThan(10);
      expect([1, 2, 3]).toContain(card.box);
    }
  });

  describe('generateDrillQuestion', () => {
    it('generates level 1 question with correct option among 4 choices', () => {
      const q = generateDrillQuestion(1);
      expect(q.level).toBe(1);
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correctAnswer);
      expect(q.explanationPl.length).toBeGreaterThan(5);
    });

    it('generates level 2 question with correct flour blend', () => {
      const q = generateDrillQuestion(2);
      expect(q.level).toBe(2);
      expect(q.options).toContain(q.correctAnswer);
      expect(q.correctAnswer).toBeGreaterThan(0);
    });

    it('generates level 3 question testing true baker % starter integration', () => {
      const q = generateDrillQuestion(3);
      expect(q.level).toBe(3);
      expect(q.correctAnswer).toBe(550); // 500g + 50g starter flour
      expect(q.options).toContain(550);
    });

    it('property-based: generated question always contains positive correct answer and valid options', () => {
      const levels: DrillLevel[] = [1, 2, 3];
      fc.assert(
        fc.property(fc.constantFrom(...levels), (lvl) => {
          const q = generateDrillQuestion(lvl);
          expect(q.correctAnswer).toBeGreaterThan(0);
          expect(q.options).toContain(q.correctAnswer);
          expect(q.questionPl).toBeTruthy();
          expect(q.questionEn).toBeTruthy();
        }),
        { numRuns: 100 }
      );
    });
  });
});
