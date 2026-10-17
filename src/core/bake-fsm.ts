// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Finite State Machine (FSM) for Artisan Bread Baking Lifecycle (ADR-004)
// Pure TypeScript Domain Service — 100% Deterministic & Offline Resilient
// ============================================================================

import { BakePhase, BakeEvent, FlavourProfile } from './domain/types';

export interface BakeFSMContext {
  phase: BakePhase;
  recipeId?: string;
  ddt?: number;
  ambientTemp?: number;
  foldIndex: number;
  startedAt?: number;
  stepStartedAt?: number;
  stepTargetDurationMin?: number;
  completedAt?: number;
  evaluation?: {
    crumbScore: number;
    crustScore: number;
    taste: FlavourProfile;
    notes?: string;
  };
}

export class BakeTransitionError extends Error {
  constructor(public currentPhase: BakePhase, public eventType: BakeEvent['type']) {
    super(`Illegal transition: cannot handle event '${eventType}' in state '${currentPhase}'`);
    this.name = 'BakeTransitionError';
  }
}

export const INITIAL_BAKE_STATE: BakeFSMContext = {
  phase: 'IDLE',
  foldIndex: 0,
};

export const PHASE_DEFAULT_DURATIONS_MIN: Record<BakePhase, number> = {
  IDLE: 0,
  AUTOLYSE: 45,
  MIXING_BASSINAGE: 15,
  BULK_FERMENTATION: 180,
  PRE_SHAPE: 15,
  BENCH_REST: 20,
  FINAL_SHAPE: 15,
  COLD_RETARD: 720, // 12h
  SCORING: 5,
  BAKING_STEAM: 20, // 20 min lid on @ 240°C
  BAKING_VENT: 25,  // 25 min lid off @ 210°C
  COOLING: 120,     // 2h
  COMPLETED: 0,
};

export const PHASE_METADATA_PL: Record<
  BakePhase,
  { name: string; desc: string; temperatureC?: number }
> = {
  IDLE: {
    name: 'Brak aktywnego wypieku',
    desc: 'Wybierz recepturę i rozpocznij proces wypieku.',
  },
  AUTOLYSE: {
    name: 'Autoliza',
    desc: 'Połączenie mąki z wodą bez zakwasu i soli w celu samoczynnego rozwoju siatki glutenowej.',
  },
  MIXING_BASSINAGE: {
    name: 'Mieszanie i Bassinage',
    desc: 'Dodanie aktywnego zakwasu, soli oraz rezerwy wody metodą bassinage.',
  },
  BULK_FERMENTATION: {
    name: 'Fermentacja burzliwa (Bulk)',
    desc: 'Rozwój kwasowości i struktury z cyklicznymi składaniami (Coil Fold / Stretch & Fold).',
  },
  PRE_SHAPE: {
    name: 'Formowanie wstępne (Pre-shape)',
    desc: 'Podtoczenie ciasta w luźną kulę skrobakiem w celu wstępnego napięcia powierzchniowego.',
  },
  BENCH_REST: {
    name: 'Odpoczynek na desce (Bench Rest)',
    desc: 'Relaksacja glutenu przed ostatecznym uformowaniem bochenka.',
  },
  FINAL_SHAPE: {
    name: 'Formowanie ostateczne (Final Shape)',
    desc: 'Nadanie ostatecznego kształtu (boule lub batard) i przełożenie do koszyka rozrostowego.',
  },
  COLD_RETARD: {
    name: 'Garowanie na zimno (Cold Retard)',
    desc: 'Spowolniony rozrost w chłodni (4°C) sprzyjający fermentacji kwasu mlekowego i octowego.',
    temperatureC: 4,
  },
  SCORING: {
    name: 'Nacinanie (Scoring)',
    desc: 'Wykonanie precyzyjnego nacięcia żyletką pod kątem 30° w celu otwarcia ucha bochenka.',
  },
  BAKING_STEAM: {
    name: 'Wypiek pod pokrywą (Para)',
    desc: 'Maksymalne rozprężenie w piecu (Oven Spring) w garnku żeliwnym w 240°C.',
    temperatureC: 240,
  },
  BAKING_VENT: {
    name: 'Dopiekanie bez pokrywy (Karmelizacja)',
    desc: 'Odparowanie wilgoci, chrupkość i rumienienie w reakcji Maillarda w 210°C.',
    temperatureC: 210,
  },
  COOLING: {
    name: 'Studzenie na kratce',
    desc: 'Stabilizacja miękiszu i odparowanie wilgoci. Bezwzględny zakaz krojenia przed upływem 2h.',
  },
  COMPLETED: {
    name: 'Wypiek zakończony',
    desc: 'Ocena sensoryczna i zapis parametrów wypieku w kronice.',
  },
};

/**
 * Pure state transition function for the 12-stage bread baking FSM.
 */
export function bakeTransition(
  context: BakeFSMContext,
  event: BakeEvent,
  nowMs: number = Date.now()
): BakeFSMContext {
  if (event.type === 'ABORT_BAKE') {
    return {
      ...INITIAL_BAKE_STATE,
    };
  }

  switch (context.phase) {
    case 'IDLE': {
      if (event.type === 'START_BAKE') {
        return {
          phase: 'AUTOLYSE',
          recipeId: event.recipeId,
          ddt: event.ddt,
          ambientTemp: event.ambientTemp,
          foldIndex: 0,
          startedAt: nowMs,
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.AUTOLYSE,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'AUTOLYSE': {
      if (event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'MIXING_BASSINAGE',
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.MIXING_BASSINAGE,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'MIXING_BASSINAGE': {
      if (event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'BULK_FERMENTATION',
          foldIndex: 0,
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.BULK_FERMENTATION,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'BULK_FERMENTATION': {
      if (event.type === 'RECORD_FOLD') {
        return {
          ...context,
          foldIndex: event.foldIndex,
          stepStartedAt: nowMs,
        };
      }
      if (event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'PRE_SHAPE',
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.PRE_SHAPE,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'PRE_SHAPE': {
      if (event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'BENCH_REST',
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.BENCH_REST,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'BENCH_REST': {
      if (event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'FINAL_SHAPE',
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.FINAL_SHAPE,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'FINAL_SHAPE': {
      if (event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'COLD_RETARD',
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.COLD_RETARD,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'COLD_RETARD': {
      if (event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'SCORING',
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.SCORING,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'SCORING': {
      if (event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'BAKING_STEAM',
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.BAKING_STEAM,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'BAKING_STEAM': {
      if (event.type === 'DUTCH_OVEN_LID_OFF' || event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'BAKING_VENT',
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.BAKING_VENT,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'BAKING_VENT': {
      if (event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'COOLING',
          stepStartedAt: nowMs,
          stepTargetDurationMin: PHASE_DEFAULT_DURATIONS_MIN.COOLING,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'COOLING': {
      if (event.type === 'FINISH_BAKE') {
        return {
          ...context,
          phase: 'COMPLETED',
          completedAt: nowMs,
          stepTargetDurationMin: 0,
          evaluation: {
            crumbScore: event.crumbScore,
            crustScore: event.crustScore,
            taste: event.taste,
            notes: event.notes,
          },
        };
      }
      if (event.type === 'NEXT_STEP') {
        return {
          ...context,
          phase: 'COMPLETED',
          completedAt: nowMs,
          stepTargetDurationMin: 0,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    case 'COMPLETED': {
      if (event.type === 'NEXT_STEP') {
        return {
          ...INITIAL_BAKE_STATE,
        };
      }
      throw new BakeTransitionError(context.phase, event.type);
    }

    default:
      throw new BakeTransitionError(context.phase, event.type);
  }
}

/**
 * Checks if a bake is actively running on the bench (not idle or finished).
 */
export function isBakeActive(phase: BakePhase): boolean {
  return phase !== 'IDLE' && phase !== 'COMPLETED';
}
