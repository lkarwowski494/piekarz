// ============================================================================
// Piekarz (Crust) — Bake History & Scoring Statistics Engine
// 100% Offline-First, Zero Cloud Dependencies.
// ============================================================================

import type { StoredBakeLog } from '../data/db';

export interface BakeStatisticsResult {
  totalBakes: number;
  /** Średnia z ocenionych wpisów; null = brak ocen (brak nie jest 5★) [M1-audytor-generalny-026]. */
  averageRating: number | null;
  averageCrumbScore: number;
  averageCrustScore: number;
  tasteDistribution: Record<'mild' | 'balanced' | 'sour' | 'tangy', number>;
  mostBakedRecipeName?: string;
  hasEnoughData: boolean;
}

export interface BakeHistoryFilter {
  searchQuery?: string;
  tasteProfile?: 'mild' | 'balanced' | 'sour' | 'tangy' | 'all';
  minRating?: number;
}

/**
 * Calculates aggregate artisan metrics from user's bake history.
 */
export function calculateBakeStatistics(logs: StoredBakeLog[]): BakeStatisticsResult {
  if (!logs || logs.length === 0) {
    return {
      totalBakes: 0,
      averageRating: null,
      averageCrumbScore: 0,
      averageCrustScore: 0,
      tasteDistribution: { mild: 0, balanced: 0, sour: 0, tangy: 0 },
      hasEnoughData: false,
    };
  }

  let ratingSum = 0;
  let ratingCount = 0;
  let crumbSum = 0;
  let crumbCount = 0;
  let crustSum = 0;
  let crustCount = 0;

  const tasteDistribution: Record<'mild' | 'balanced' | 'sour' | 'tangy', number> = {
    mild: 0,
    balanced: 0,
    sour: 0,
    tangy: 0,
  };

  const recipeCounts: Record<string, number> = {};

  for (const log of logs) {
    if (log.ratingStars !== undefined && log.ratingStars > 0) {
      ratingSum += log.ratingStars;
      ratingCount++;
    }

    if (log.crumbScore !== undefined && log.crumbScore > 0) {
      crumbSum += log.crumbScore;
      crumbCount++;
    }

    if (log.crustScore !== undefined && log.crustScore > 0) {
      crustSum += log.crustScore;
      crustCount++;
    }

    if (log.tasteProfile && tasteDistribution[log.tasteProfile] !== undefined) {
      tasteDistribution[log.tasteProfile]++;
    }

    const rName = log.recipeName.trim();
    recipeCounts[rName] = (recipeCounts[rName] || 0) + 1;
  }

  const avgRating = ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : null;
  const avgCrumb = crumbCount > 0 ? Number((crumbSum / crumbCount).toFixed(1)) : 0;
  const avgCrust = crustCount > 0 ? Number((crustSum / crustCount).toFixed(1)) : 0;

  let mostBakedRecipeName: string | undefined;
  let maxCount = 0;
  for (const [rName, count] of Object.entries(recipeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostBakedRecipeName = rName;
    }
  }

  return {
    totalBakes: logs.length,
    averageRating: avgRating,
    averageCrumbScore: avgCrumb,
    averageCrustScore: avgCrust,
    tasteDistribution,
    mostBakedRecipeName,
    hasEnoughData: logs.length >= 1,
  };
}

/**
 * Filters bake history logs based on search query, taste profile, and minimum rating.
 */
export function filterBakeLogs(logs: StoredBakeLog[], filter: BakeHistoryFilter): StoredBakeLog[] {
  return logs.filter((log) => {
    // 1. Text search
    if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
      const q = filter.searchQuery.trim().toLowerCase();
      const nameMatches = log.recipeName.toLowerCase().includes(q);
      const notesMatches = log.notes ? log.notes.toLowerCase().includes(q) : false;
      if (!nameMatches && !notesMatches) return false;
    }

    // 2. Taste profile filter
    if (filter.tasteProfile && filter.tasteProfile !== 'all') {
      if (log.tasteProfile !== filter.tasteProfile) return false;
    }

    // 3. Min rating filter
    if (filter.minRating !== undefined && filter.minRating > 0) {
      // Wpis bez oceny nie spełnia progu (brak to nie 5★) [M1-audytor-generalny-026]
      if (log.ratingStars === undefined || log.ratingStars < filter.minRating) return false;
    }

    return true;
  });
}
