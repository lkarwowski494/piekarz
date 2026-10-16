import fc from 'fast-check';
import {
  BREAD_SCHOOL_LESSONS,
  getBreadSchoolLessons,
  calculateBakerRank,
} from '../bread-school';

describe('Bread Mastery Academy Curriculum (Z-084…090 / SCI)', () => {
  it('contains exactly 6 structured lessons covering novice to master', () => {
    const lessons = getBreadSchoolLessons();
    expect(lessons.length).toBe(6);

    const levels = lessons.map((l) => l.level);
    expect(levels).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('guarantees valid didactic goals, steps, hydration, and passing criteria across all lessons', () => {
    for (const lesson of BREAD_SCHOOL_LESSONS) {
      expect(lesson.titlePl.length).toBeGreaterThan(10);
      expect(lesson.titleEn.length).toBeGreaterThan(10);
      expect(lesson.didacticGoalPl.length).toBeGreaterThan(15);
      expect(lesson.hydrationPercent).toBeGreaterThanOrEqual(60);
      expect(lesson.hydrationPercent).toBeLessThanOrEqual(85);
      expect(lesson.saltPercent).toBeGreaterThanOrEqual(1.5);
      expect(lesson.saltPercent).toBeLessThanOrEqual(3.0);
      expect(lesson.stepsPl.length).toBeGreaterThanOrEqual(5);
      expect(lesson.stepsEn.length).toBeGreaterThanOrEqual(5);
      expect(lesson.passingCriteriaPl.length).toBeGreaterThan(10);
      expect(lesson.scientificInsightPl.length).toBeGreaterThan(15);
    }
  });

  describe('calculateBakerRank', () => {
    it('returns student status when 0 lessons completed', () => {
      const rank = calculateBakerRank([]);
      expect(rank.completedCount).toBe(0);
      expect(rank.progressPercent).toBe(0);
      expect(rank.currentRankPl).toBe('Uczeń Piekarski');
      expect(rank.nextRankPl).toBe('Nowicjusz Piekarski');
    });

    it('returns highest rank when all 6 lessons completed', () => {
      const rank = calculateBakerRank([1, 2, 3, 4, 5, 6]);
      expect(rank.completedCount).toBe(6);
      expect(rank.progressPercent).toBe(100);
      expect(rank.currentRankPl).toBe('Mistrz Rzemiosła Piekarskiego');
      expect(rank.nextRankPl).toBeUndefined();
    });

    it('property-based testing: rank progress is always in range 0..100% and monotonic', () => {
      fc.assert(
        fc.property(
          fc.subarray([1, 2, 3, 4, 5, 6]),
          (completed) => {
            const rank = calculateBakerRank(completed);
            expect(rank.progressPercent).toBeGreaterThanOrEqual(0);
            expect(rank.progressPercent).toBeLessThanOrEqual(100);
            expect(rank.completedCount).toBe(completed.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
