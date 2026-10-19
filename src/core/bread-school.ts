// ============================================================================
// Piekarz (Crust) — Bread Mastery Academy / Szkoła Chleba (Z-084…090 / SCI)
// 6-step curriculum from beginner no-knead pot bread to artisan sourdough & pizza.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import { BreadSchoolLesson, BREAD_SCHOOL_LESSONS } from './bread-school-lessons';

export type { BreadSchoolLesson };
export { BREAD_SCHOOL_LESSONS };

/**
 * Returns all bread school lessons.
 */
export function getBreadSchoolLessons(): BreadSchoolLesson[] {
  return BREAD_SCHOOL_LESSONS;
}

export type BakerRankInfo = {
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
  currentRankPl: string;
  currentRankEn: string;
  nextRankPl?: string;
  nextRankEn?: string;
};

/**
 * Calculates current baker rank based on number of completed lessons.
 */
export function calculateBakerRank(completedLevelIds: number[]): BakerRankInfo {
  const total = BREAD_SCHOOL_LESSONS.length;
  const count = completedLevelIds.length;
  const percent = Math.round((count / total) * 100);

  if (count === 0) {
    return {
      completedCount: 0,
      totalLessons: total,
      progressPercent: 0,
      currentRankPl: 'Uczeń Piekarski',
      currentRankEn: 'Baking Student',
      nextRankPl: BREAD_SCHOOL_LESSONS[0].rankTitlePl,
      nextRankEn: BREAD_SCHOOL_LESSONS[0].rankTitleEn,
    };
  }

  const latestIndex = Math.min(count - 1, total - 1);
  const currentRank = BREAD_SCHOOL_LESSONS[latestIndex];
  const nextRank = count < total ? BREAD_SCHOOL_LESSONS[count] : undefined;

  return {
    completedCount: count,
    totalLessons: total,
    progressPercent: percent,
    currentRankPl: currentRank.rankTitlePl,
    currentRankEn: currentRank.rankTitleEn,
    nextRankPl: nextRank?.rankTitlePl,
    nextRankEn: nextRank?.rankTitleEn,
  };
}
