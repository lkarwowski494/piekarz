// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Wireless Bluetooth BLE Thermal Core Probe & Thermodynamics Engine
// Evaluates internal loaf doneness (94°C–98°C) instead of rigid timers
// ============================================================================

export type BreadCrumbTarget = 'wheat' | 'rye' | 'enriched';

export type ThermalProbeStatus =
  | 'warming'
  | 'gelatinizing'
  | 'nearing_done'
  | 'done'
  | 'overbaked';

export interface CoreTargetConfig {
  targetC: number;
  minC: number;
  maxC: number;
  descPl: string;
  descEn: string;
}

export const CORE_TARGETS: Record<BreadCrumbTarget, CoreTargetConfig> = {
  wheat: {
    targetC: 95,
    minC: 94,
    maxC: 98,
    descPl: 'Chleb pszenny / wiejski na zakwasie',
    descEn: 'Wheat / Country sourdough',
  },
  rye: {
    targetC: 98,
    minC: 96,
    maxC: 99,
    descPl: 'Chleb żytni razowy',
    descEn: 'High rye / 100% rye bread',
  },
  enriched: {
    targetC: 90,
    minC: 88,
    maxC: 92,
    descPl: 'Pieczywo maślane / chałka / brioszka',
    descEn: 'Enriched dough / Challah / Brioche',
  },
};

export interface ProbeEvaluation {
  currentTempC: number;
  targetTempC: number;
  isDone: boolean;
  remainingDegreesC: number;
  status: ThermalProbeStatus;
  progressPercent: number;
  estimatedSecondsRemaining?: number;
  recommendationPl: string;
  recommendationEn: string;
}

/**
 * Returns temperature targets for specific bread type.
 */
export function getTargetCoreTemperature(breadType: BreadCrumbTarget): CoreTargetConfig {
  return CORE_TARGETS[breadType] ?? CORE_TARGETS.wheat;
}

/**
 * Evaluates core probe temperature against starch gelatinization and target doneness.
 */
export function evaluateCoreTemperature(
  currentC: number,
  breadType: BreadCrumbTarget = 'wheat',
  elapsedSec?: number
): ProbeEvaluation {
  const cfg = getTargetCoreTemperature(breadType);
  const remaining = Math.max(0, cfg.targetC - currentC);
  const isDone = currentC >= cfg.minC && currentC <= cfg.maxC;
  const isOverbaked = currentC > cfg.maxC;

  // Starch gelatinization occurs between 60°C and 85°C
  let status: ThermalProbeStatus;
  let recPl: string;
  let recEn: string;

  if (currentC < 60) {
    status = 'warming';
    recPl = 'Wstępne ogrzewanie ciasta. Skrobia nie uległa jeszcze kleikowaniu.';
    recEn = 'Initial dough warming. Starch gelatinization has not yet started.';
  } else if (currentC < cfg.minC - 5) {
    status = 'gelatinizing';
    recPl = 'Kleikowanie skrobi i ścinanie białek glutenu. Trzymaj bochenek w piecu.';
    recEn = 'Starch gelatinization and gluten coagulation in progress. Keep in oven.';
  } else if (currentC < cfg.minC) {
    status = 'nearing_done';
    recPl = 'Zbliża się do punktu wypieczenia. Przygotuj kratkę do studzenia.';
    recEn = 'Nearing target doneness. Prepare cooling rack.';
  } else if (isDone) {
    status = 'done';
    recPl = 'Bochenek idealnie upieczony! Wyjmij natychmiast na kratkę do ostygnięcia.';
    recEn = 'Loaf perfectly baked! Remove immediately to cooling rack.';
  } else {
    status = 'overbaked';
    recPl = 'Temperatura przekroczona! Ryzyko przesuszenia miękiszu. Wyjmij z pieca.';
    recEn = 'Target temperature exceeded! Risk of dry crumb. Remove from oven.';
  }

  // Progress from initial room temp (20°C) to target
  const initialTemp = 20;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((currentC - initialTemp) / (cfg.targetC - initialTemp)) * 100))
  );

  // Linear / exponential simple estimate if elapsed time is provided
  let estimatedSecondsRemaining: number | undefined;
  if (elapsedSec && elapsedSec > 120 && currentC > 40 && !isDone && !isOverbaked) {
    const rate = (currentC - initialTemp) / elapsedSec; // °C per sec
    if (rate > 0) {
      estimatedSecondsRemaining = Math.max(0, Math.round(remaining / rate));
    }
  }

  return {
    currentTempC: Math.round(currentC * 10) / 10,
    targetTempC: cfg.targetC,
    isDone,
    remainingDegreesC: Math.round(remaining * 10) / 10,
    status,
    progressPercent,
    estimatedSecondsRemaining,
    recommendationPl: recPl,
    recommendationEn: recEn,
  };
}

/**
 * Parses Bluetooth Low Energy BLE manufacturer or FPP hex payload.
 * Example payload: "0103B600F0" where:
 * - Bytes 0..1: Header
 * - Bytes 2..3: Core temperature in tenths of °C (0x03B6 = 950 -> 95.0°C)
 * - Byte 4: Battery level (0xF0 = 96%)
 */
export function parseBleFoodProbePayload(
  hexString: string
): { tempC: number; batteryPct?: number } | null {
  if (!hexString || hexString.length < 4) return null;
  const clean = hexString.replace(/^0x/, '').toLowerCase();

  try {
    // Read temperature integer (tenths of °C) from bytes 2..3 (or 0..1 if 4 chars)
    const offset = clean.length >= 8 ? 4 : 0;
    const rawVal = parseInt(clean.substring(offset, offset + 4), 16);
    if (isNaN(rawVal)) return null;

    // Handle signed 16-bit
    const signed = rawVal > 0x7fff ? rawVal - 0x10000 : rawVal;
    const tempC = signed / 10.0;

    let batteryPct: number | undefined;
    if (clean.length >= offset + 6) {
      const batRaw = parseInt(clean.substring(offset + 4, offset + 6), 16);
      if (!isNaN(batRaw)) {
        batteryPct = Math.min(100, Math.round((batRaw / 255.0) * 100));
      }
    }

    return {
      tempC: Math.round(tempC * 10) / 10,
      batteryPct,
    };
  } catch {
    return null;
  }
}
