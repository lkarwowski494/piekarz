// ============================================================================
// Apps4Brew Studio — proporcja dokarmiania zakwasu (zakwas : mąka : woda)
// Zapis jako tekst "1:2:2" w starters.last_feed_ratio [M1-audytor-generalny-023].
// ============================================================================

export type FeedingRatio = [number, number, number];

/** Proporcja przyjmowana, gdy zakwas nie ma zapisanej (wcześniejsze zachowanie predyktora). */
export const DEFAULT_FEEDING_RATIO: FeedingRatio = [1, 2, 2];

export function formatFeedingRatio(r: FeedingRatio): string {
  return r.join(':');
}

/** Tekst "a:b:c" z dodatnimi liczbami → proporcja; brak albo niepoprawny zapis → null. */
export function parseFeedingRatio(value: unknown): FeedingRatio | null {
  if (typeof value !== 'string') return null;
  const parts = value.split(':').map((p) => Number(p.trim()));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n) || n <= 0)) return null;
  return [parts[0], parts[1], parts[2]];
}
