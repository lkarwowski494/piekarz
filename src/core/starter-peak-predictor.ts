// ============================================================================
// Piekarz (Crust) — Sourdough Metabolic Peak Predictor Engine
// Biokinetical modeling of sourdough yeast & lactic acid bacteria activity,
// taking into account temperature (Arrhenius), feeding ratios, and flour grains.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import { Q10_FERMENTATION } from './fermentation-q10';

export interface PeakPredictionInput {
  lastFedAt: number;
  currentTempC?: number; // default: 22°C (clamped 15°C - 35°C)
  ratio?: [number, number, number]; // default: [1, 2, 2]
  flourGrain?: 'rye' | 'wheat' | 'spelt'; // default: 'rye'
  hydration?: number; // default: 100%
  now?: number; // default: Date.now()
}

export interface PeakPredictionResult {
  estimatedPeakHoursMin: number;
  estimatedPeakHoursMax: number;
  peakWindowStartTimestamp: number;
  peakWindowEndTimestamp: number;
  progressPercent: number; // 0 - 100%
  isCurrentlyInPeak: boolean;
  hasPassedPeak: boolean;
  remainingMinutesToPeakWindow: number; // 0 if currently in peak or past
  formattedWindowPl: string; // e.g. "14:15 – 16:45"
  statusMessagePl: string;
  /** Szablon komunikatu (klucz t()) i parametry {czas}, {okno}, żeby tłumaczenie nie sklejało tekstu [044]. */
  statusTemplatePl: string;
  statusParams: Record<string, string>;
  /** Minuty z parametru {czas} (do okna albo od jego końca): ekran formatuje je w języku aplikacji (czasTrwania) [audyt-niezalezny F-2]. */
  statusMinuty?: number;
}

export function predictStarterPeak(input: PeakPredictionInput): PeakPredictionResult {
  const now = input.now ?? Date.now();
  const lastFed = Math.min(now, input.lastFedAt);
  const elapsedMs = Math.max(0, now - lastFed);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  const temp = Math.max(15, Math.min(35, input.currentTempC ?? 22.0));
  const grain = input.flourGrain ?? 'rye';
  const ratio = input.ratio ?? [1, 2, 2];

  // 1. Temperature factor via Q10 kinetics (baseline 22°C, Q10 = 3,0 w 20–26 °C, FER-Q10-002)
  const tempFactor = Math.pow(Q10_FERMENTATION, (22.0 - temp) / 10.0);

  // 2. Ratio factor: food-to-inoculum ratio (flour / starter)
  const starterPortion = ratio[0] || 1;
  const flourPortion = ratio[1] || 1;
  const foodRatio = flourPortion / starterPortion;

  let ratioFactor: number;
  if (foodRatio <= 1.0) {
    // 1:1:1
    ratioFactor = 0.72;
  } else if (foodRatio <= 2.0) {
    // 1:2:2
    ratioFactor = 1.0;
  } else if (foodRatio <= 5.0) {
    // 1:5:5
    ratioFactor = 1.45;
  } else {
    // 1:10:10 or higher
    ratioFactor = 1.9;
  }

  // 3. Grain factor (Rye has high amylase & pentosans -> ferments faster)
  let grainFactor: number;
  if (grain === 'rye') {
    grainFactor = 0.88;
  } else if (grain === 'spelt') {
    grainFactor = 0.95;
  } else {
    grainFactor = 1.0; // wheat
  }

  // 4. Baseline peak window for 1:2:2 @ 22°C wheat: 6.0h to 8.5h
  const baseMin = 6.0;
  const baseMax = 8.5;

  const estimatedPeakHoursMin = Math.round(baseMin * tempFactor * ratioFactor * grainFactor * 10) / 10;
  const estimatedPeakHoursMax = Math.round(baseMax * tempFactor * ratioFactor * grainFactor * 10) / 10;

  const peakWindowStartTimestamp = lastFed + Math.round(estimatedPeakHoursMin * 3600 * 1000);
  const peakWindowEndTimestamp = lastFed + Math.round(estimatedPeakHoursMax * 3600 * 1000);

  const isCurrentlyInPeak = now >= peakWindowStartTimestamp && now <= peakWindowEndTimestamp;
  const hasPassedPeak = now > peakWindowEndTimestamp;

  let progressPercent: number;
  if (now <= lastFed) {
    progressPercent = 0;
  } else if (now >= peakWindowStartTimestamp) {
    progressPercent = 100;
  } else {
    progressPercent = Math.min(99, Math.round((elapsedHours / estimatedPeakHoursMin) * 100));
  }

  const remainingMs = Math.max(0, peakWindowStartTimestamp - now);
  const remainingMinutesToPeakWindow = Math.round(remainingMs / (1000 * 60));

  // Format time strings (HH:mm)
  const formatHourMin = (ts: number): string => {
    const d = new Date(ts);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const formattedWindowPl = `${formatHourMin(peakWindowStartTimestamp)} – ${formatHourMin(peakWindowEndTimestamp)}`;

  // Komunikaty dosłownie z docs/tresci/pl/zakwas-szczyt.md; „idealny moment” bez źródła (ZAK-SZC-903) [044]
  const fmtDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h} h ${m} min` : `${m} min`;
  };
  let statusTemplatePl: string;
  let statusParams: Record<string, string> = {};
  let statusMinuty: number | undefined;
  if (isCurrentlyInPeak) {
    statusTemplatePl = 'Według szacunku zakwas jest teraz w oknie szczytu.';
  } else if (hasPassedPeak) {
    statusTemplatePl = 'Szacowane okno szczytu minęło ok. {czas} temu.';
    statusMinuty = Math.round((now - peakWindowEndTimestamp) / (1000 * 60));
    statusParams = { czas: fmtDuration(statusMinuty) };
  } else {
    statusTemplatePl = 'Do szacowanego okna szczytu zostało ok. {czas} (okno: {okno}).';
    statusMinuty = remainingMinutesToPeakWindow;
    statusParams = { czas: fmtDuration(remainingMinutesToPeakWindow), okno: formattedWindowPl };
  }
  const statusMessagePl = Object.entries(statusParams).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), statusTemplatePl);

  return {
    estimatedPeakHoursMin,
    estimatedPeakHoursMax,
    peakWindowStartTimestamp,
    peakWindowEndTimestamp,
    progressPercent,
    isCurrentlyInPeak,
    hasPassedPeak,
    remainingMinutesToPeakWindow,
    formattedWindowPl,
    statusMessagePl,
    statusTemplatePl,
    statusParams,
    statusMinuty,
  };
}
