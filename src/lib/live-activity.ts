// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// iOS ActivityKit & Dynamic Island Live Activity Bridge
// Displays Dutch Oven steam baking countdown and fold timers on lock screen
// ============================================================================

export type LiveActivityBakePhase =
  | 'autolyse'
  | 'bulk_fold'
  | 'cold_retard'
  | 'dutch_oven_steam'
  | 'dutch_oven_vent'
  | 'cooling';

export interface BakeLiveActivityAttributes {
  recipeName: string;
  totalDurationMin: number;
}

export interface BakeLiveActivityContentState {
  stageNamePl: string;
  stageNameEn: string;
  phase: LiveActivityBakePhase;
  targetEndMs: number;
  temperatureC?: number;
  isLidOn?: boolean;
  progressPercent: number;
  callToActionPl?: string;
  callToActionEn?: string;
}

/**
 * Builds Live Activity payload for Dutch Oven 2-phase baking.
 */
export function buildDutchOvenLiveActivityState(
  phase: 'steam' | 'vent',
  startedAtMs: number,
  durationMin: number,
  nowMs: number = Date.now()
): BakeLiveActivityContentState {
  const targetEndMs = startedAtMs + durationMin * 60 * 1000;
  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const totalMs = durationMin * 60 * 1000;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

  if (phase === 'steam') {
    return {
      stageNamePl: 'Faza 1: Pod pokrywką (Para)',
      stageNameEn: 'Phase 1: Lid On (Steam)',
      phase: 'dutch_oven_steam',
      targetEndMs,
      temperatureC: 240,
      isLidOn: true,
      progressPercent,
      callToActionPl: 'Zdejmij pokrywkę garnka, gdy zegar osiągnie zero!',
      callToActionEn: 'Remove Dutch oven lid when timer reaches zero!',
    };
  }

  return {
    stageNamePl: 'Faza 2: Bez pokrywki (Karmelizacja)',
    stageNameEn: 'Phase 2: Lid Off (Browning)',
    phase: 'dutch_oven_vent',
    targetEndMs,
    temperatureC: 210,
    isLidOn: false,
    progressPercent,
    callToActionPl: 'Dopiekaj do głębokiego brązu i wyjmij na kratkę.',
    callToActionEn: 'Bake to deep golden brown and remove to rack.',
  };
}

/**
 * Builds Live Activity payload for bulk fermentation coil fold cycle.
 */
export function buildFoldLiveActivityState(
  foldIndex: number,
  maxFolds: number = 3,
  startedAtMs: number,
  intervalMin: number = 30,
  nowMs: number = Date.now()
): BakeLiveActivityContentState {
  const targetEndMs = startedAtMs + intervalMin * 60 * 1000;
  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const totalMs = intervalMin * 60 * 1000;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

  return {
    stageNamePl: `Składanie ciasta (${foldIndex}/${maxFolds})`,
    stageNameEn: `Coil Fold (${foldIndex}/${maxFolds})`,
    phase: 'bulk_fold',
    targetEndMs,
    progressPercent,
    callToActionPl: 'Podwiń brzegi ciasta mokrymi dłońmi (Coil Fold).',
    callToActionEn: 'Tuck edges underneath with wet hands (Coil Fold).',
  };
}
