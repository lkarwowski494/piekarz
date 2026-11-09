import { Q10_FERMENTATION } from './fermentation-q10';
import { DOMYSLNY_PROFIL_SNU, oknoSnu } from './profile-snu';
import { krokiPieczenia, PIECZENIE_DOMYSLNE, type KrokPieczenia, type PieczenieReceptury } from './pieczenie-receptury';
import { BRIOCHE_COLD_STAGE_ID, briocheTemplates } from './brioche-stages';

// Domena bez i18n i formatowania (ADR-006) [M1-audytor-generalny-020]: godzinę kolizji formatuje wstrzyknięta funkcja
// (fasada src/scheduler/reverse-scheduler.ts podaje formatTime języka aplikacji); bez niej HH:MM.
const godzina24 = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** Okno snu bez podanych opcji: profil domyślny z Ustawień (profile-snu.ts). */
const DOMYSLNE_OKNO_SNU = oknoSnu(DOMYSLNY_PROFIL_SNU) ?? { startH: 23, koniecH: 7 };
// ============================================================================
// Piekarz (Crust) — Reverse Scheduler & Sleep Guard (BR-HARMO-001…004)
// Calculates backward timeline from target bread serving hour with sleep guard.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

export type StageCategory =
  | 'starter_feed'
  | 'autolyse'
  | 'mix'
  | 'bulk_ferment'
  | 'pre_shape'
  | 'bench_rest'
  | 'final_shape'
  | 'final_proof'
  | 'preheat_oven'
  | 'bake'
  | 'cool';

export interface StageTemplate {
  id: string;
  namePl: string;
  category: StageCategory;
  durationMinutes: number;
  isPassive: boolean; // True if step does not require user presence (e.g. cold retard, cooling)
  /** Krok bierny, który na starcie wymaga rąk (dokarmienie, autoliza, rozgrzanie piekarnika): ochrona snu sprawdza jego początek [audyt-niezalezny D-6] */
  rekaNaStarcie?: boolean;
  canStretch: boolean;
  minDurationMinutes?: number;
  maxDurationMinutes?: number;
  instructionsPl: string;
}

export interface ScheduledStage {
  id: string;
  namePl: string;
  category: StageCategory;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  isPassive: boolean;
  rekaNaStarcie?: boolean;
  isSleepCollision: boolean;
  instructionsPl: string;
}

export interface ReverseScheduleResult {
  targetReadyTime: Date;
  stages: ScheduledStage[];
  hasSleepCollision: boolean;
  collisionDetailsPl?: string;
  /** Kolizje jako szablon + parametry (t() przy wyświetlaniu) [M1-audytor-generalny-047] */
  sleepCollisions: SleepCollision[];
  suggestedActionPl?: string;
}

/** Etap aktywny w oknie snu: nazwa etapu (klucz PL) i godzina startu HH:MM. */
export interface SleepCollision {
  stageNamePl: string;
  time: string;
}

/** Szablon komunikatu Sleep Guard; parametry {etap} i {godzina} (wzorzec statusTemplatePl). */
export const SLEEP_COLLISION_TEMPLATE_PL = 'Etap "{etap}" wypada w nocy o {godzina}';

export function sleepCollisionParams(c: SleepCollision): Record<string, string> {
  return { etap: c.stageNamePl, godzina: c.time };
}

export interface ScheduleOptions {
  sleepStartHour?: number;   // domyślnie okno profilu domyślnego Ustawień (23:00)
  sleepEndHour?: number;     // domyślnie okno profilu domyślnego Ustawień (07:00)
  customStageDurations?: Record<string, number>;
  ambientTemperatureC?: number; // default 24.0°C
  coldRetardHours?: number;     // default 14.0 (14h in fridge)
  /** Format godziny kolizji ze snem (fasada: formatTime języka aplikacji) [M1-audytor-generalny-020]. */
  formatujGodzine?: (d: Date) => string;
  /** Pieczenie z danych receptury (D-304): kroki „preheat_oven” i „bake”; brak = profil garnka PIECZENIE_DOMYSLNE. */
  pieczenie?: PieczenieReceptury;
}

export interface AutoResolveResult {
  resolvedSchedule: ReverseScheduleResult;
  adjustedColdRetardHours: number;
  originalColdRetardHours: number;
}

/** Szablon etapu z kroku pieczenia: nagrzewanie bierne z rękami na starcie (rozciągane), pieczenie czynne. */
function szablonPieczenia(k: KrokPieczenia, category: 'preheat_oven' | 'bake'): StageTemplate {
  return category === 'preheat_oven'
    ? { ...k, category, isPassive: true, rekaNaStarcie: true, canStretch: true }
    : { ...k, category, isPassive: false, canStretch: false };
}

export const DEFAULT_STAGE_TEMPLATES: StageTemplate[] = [
  {
    id: 'starter_feed',
    namePl: 'Dokarmienie zakwasu (osiągnięcie szczytu)',
    category: 'starter_feed',
    durationMinutes: 360, // 6h
    isPassive: true,
    rekaNaStarcie: true,
    canStretch: false,
    instructionsPl: 'Dokarm zakwas mąką i letnią wodą. Odstaw w ciepłe miejsce do podwojenia objętości.',
  },
  {
    id: 'autolyse',
    namePl: 'Autoliza (mąka + woda)',
    category: 'autolyse',
    durationMinutes: 45,
    isPassive: true,
    rekaNaStarcie: true,
    canStretch: true,
    // Instrukcje autolyse, bulk_ferment, final_proof i podpowiedź kolizji: dosłownie z docs/tresci/pl/teksty-glownego-
    // przeplywu.md (D-305; czasy etapów bez źródła PLN-KRO-900 tylko w logice); stare klucze zostają w słowniku EN dla
    // wypieków zapisanych przed zmianą [M1-audytor-generalny-010]
    instructionsPl: 'Połącz mąkę i wodę, przykryj i odstaw: mąka wchłonie wodę i zacznie się tworzyć gluten.',
  },
  {
    id: 'mix',
    namePl: 'Wymieszanie z solą i zakwasem',
    category: 'mix',
    durationMinutes: 15,
    isPassive: false,
    canStretch: false,
    // Dwa ostatnie zdania: BEZ-SUR-001, BEZ-SUR-002 (RD-22-W1), dosłownie z docs/tresci/pl/wypiek-bezpieczenstwo.md
    // [M1-audytor-generalny-086; 01-odkrywanie-019]
    instructionsPl: 'Dodaj aktywny zakwas i sól. Wyrabiaj do połączenia i uzyskania gładkiej struktury. Nie próbuj surowego ciasta ani mąki. Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.',
  },
  {
    id: 'bulk_ferment',
    namePl: 'Fermentacja burzliwa ze składaniami',
    category: 'bulk_ferment',
    durationMinutes: 240, // 4h
    isPassive: false,
    canStretch: false,
    instructionsPl: 'Rozciągaj i składaj ciasto w czasie fermentacji.',
  },
  {
    id: 'pre_shape',
    namePl: 'Formowanie wstępne',
    category: 'pre_shape',
    durationMinutes: 10,
    isPassive: false,
    canStretch: false,
    instructionsPl: 'Wyłóż ciasto na blat, nadaj wstępny kształt kuli i napnij powierzchnię.',
  },
  {
    id: 'bench_rest',
    namePl: 'Odpoczynek na desce',
    category: 'bench_rest',
    durationMinutes: 20,
    isPassive: true,
    canStretch: true,
    instructionsPl: 'Pozostaw ciasto pod przykryciem, aby gluten się rozluźnił przed ostatecznym formowaniem.',
  },
  {
    id: 'final_shape',
    namePl: 'Formowanie ostateczne i koszyk',
    category: 'final_shape',
    durationMinutes: 15,
    isPassive: false,
    canStretch: false,
    instructionsPl: 'Uformuj batard lub boule, napnij mocno skórkę i przełóż do koszyka oprószonego mąką ryżową.',
  },
  {
    id: 'final_proof',
    namePl: 'Garowanie chłodnicze w lodówce',
    category: 'final_proof',
    durationMinutes: 840, // 14h
    isPassive: true,
    canStretch: true,
    minDurationMinutes: 480,  // 8h
    maxDurationMinutes: 1440, // 24h
    instructionsPl: 'Wstaw koszyk w szczelnej torbie do lodówki. Chłód lodówki spowalnia fermentację, a wolniejsza fermentacja daje głębszy smak.',
  },
  // Nagrzewanie i pieczenie: profil garnka ze źródła (PIE-GAR-001, D-304) zamiast szablonu 240/210 °C bez źródła;
  // z recepturą kroki podmienia calculateReverseSchedule (options.pieczenie) [M1-audytor-generalny-008]
  szablonPieczenia(krokiPieczenia(PIECZENIE_DOMYSLNE).nagrzewanie, 'preheat_oven'),
  szablonPieczenia(krokiPieczenia(PIECZENIE_DOMYSLNE).pieczenie, 'bake'),
  {
    id: 'cool',
    // bez wykrzyknika w nazwie kroku (§11c 116); zdanie o krojeniu przenosi do treści kroku rola 06. Stary klucz
    // zostaje w słowniku EN dla wypieków zapisanych przed zmianą [M1-audytor-generalny-116]
    namePl: 'Studzenie na kratce',
    category: 'cool',
    durationMinutes: 120, // 2h
    isPassive: true,
    canStretch: false,
    // zdanie z KRO-POC-015 zamiast wycofanego „minimum 2 godziny … żelowania”; stary klucz zostaje w słowniku EN
    // dla wypieków zapisanych przed zmianą. durationMinutes bez źródła (KRO-POC-011) — rola 06 [audyt-niezalezny E-3]
    instructionsPl:
      'Wyjmij chleb na metalową kratkę. Chleb oddaje wilgoć, gdy stygnie, a miękisz potrzebuje tego czasu, żeby się ustalić; pokrojony za wcześnie może być gumowaty.',
  },
];

/**
 * Checks if a date time falls into sleeping window
 */
function isDuringSleep(date: Date, sleepStartHour: number, sleepEndHour: number): boolean {
  const hours = date.getHours() + date.getMinutes() / 60.0;
  if (sleepStartHour > sleepEndHour) {
    // e.g. 23:00 to 06:30
    return hours >= sleepStartHour || hours < sleepEndHour;
  }
  return hours >= sleepStartHour && hours < sleepEndHour;
}

/**
 * Calculates backward timeline from target serving hour.
 */
export function calculateReverseSchedule(
  targetReadyTime: Date,
  options: ScheduleOptions = {}
): ReverseScheduleResult {
  // Domyślne okno = profil domyślny Ustawień (D-066 1a, 23:00–07:00), jedno źródło [M1-audytor-generalny-212]
  const sleepStart = options.sleepStartHour ?? DOMYSLNE_OKNO_SNU.startH;
  const sleepEnd = options.sleepEndHour ?? DOMYSLNE_OKNO_SNU.koniecH;

  // Receptura w keksówce na zakwasie (dziś tylko brioszka): kroki brioszki ze źródła zamiast bochenka w koszyku (D-309) [M2-012]
  const szablon = options.pieczenie?.naczynie === 'bread_pan' ? briocheTemplates(DEFAULT_STAGE_TEMPLATES) : DEFAULT_STAGE_TEMPLATES;
  const templates = szablon.map((t) => ({ ...t }));

  // Pieczenie z danych receptury: naczynie, czas i teksty kroków (D-304) [M1-audytor-generalny-008]
  if (options.pieczenie) {
    const k = krokiPieczenia(options.pieczenie);
    const i = templates.findIndex((t) => t.category === 'preheat_oven');
    const j = templates.findIndex((t) => t.category === 'bake');
    if (i >= 0) templates[i] = szablonPieczenia(k.nagrzewanie, 'preheat_oven');
    if (j >= 0) templates[j] = szablonPieczenia(k.pieczenie, 'bake');
  }

  // Adjust cold retard if specified (bochenek: garowanie w lodówce; brioszka: ciasto na noc w lodówce, D-309)
  if (options.coldRetardHours && options.coldRetardHours > 0) {
    const retard = templates.find((t) => t.id === 'final_proof' || t.id === BRIOCHE_COLD_STAGE_ID);
    if (retard) {
      retard.durationMinutes = Math.round(options.coldRetardHours * 60);
    }
  }

  // Adjust bulk ferment if temperature is given (tylko fermentacja w cieple; brioche_cold w lodówce bez Q10, D-309)
  if (options.ambientTemperatureC && options.ambientTemperatureC !== 24.0) {
    const exponent = (24.0 - options.ambientTemperatureC) / 10.0;
    const factor = Math.pow(Q10_FERMENTATION, exponent); // FER-Q10-002
    const bulk = templates.find((t) => t.id === 'bulk_ferment');
    if (bulk) {
      bulk.durationMinutes = Math.round(bulk.durationMinutes * factor);
    }
  }

  // Override custom durations if provided
  if (options.customStageDurations) {
    for (const t of templates) {
      if (options.customStageDurations[t.id]) {
        t.durationMinutes = options.customStageDurations[t.id];
      }
    }
  }

  // Work backwards from targetReadyTime
  let currentTime = new Date(targetReadyTime.getTime());
  const scheduledStagesReversed: ScheduledStage[] = [];
  let hasCollision = false;
  const collisions: SleepCollision[] = [];

  // Reverse iterate
  for (let i = templates.length - 1; i >= 0; i--) {
    const t = templates[i];
    const endTime = new Date(currentTime.getTime());
    const startTime = new Date(currentTime.getTime() - t.durationMinutes * 60 * 1000);

    // Sleep collision check for active steps (steps that require user hands)
    const startInSleep = isDuringSleep(startTime, sleepStart, sleepEnd);
    const endInSleep = isDuringSleep(endTime, sleepStart, sleepEnd);
    // Krok bierny z rękami na starcie (dokarmienie, autoliza, piekarnik): w nocy nie może wypaść jego początek [audyt-niezalezny D-6]
    const isCollision = (!t.isPassive && (startInSleep || endInSleep)) || (!!t.rekaNaStarcie && startInSleep);

    if (isCollision) {
      hasCollision = true;
      const timeStr = (options.formatujGodzine ?? godzina24)(startTime); // według języka aplikacji [M1-audytor-generalny-070]
      collisions.push({ stageNamePl: t.namePl, time: timeStr });
    }

    scheduledStagesReversed.push({
      id: t.id,
      namePl: t.namePl,
      category: t.category,
      startTime,
      endTime,
      durationMinutes: t.durationMinutes,
      isPassive: t.isPassive,
      ...(t.rekaNaStarcie ? { rekaNaStarcie: true } : {}),
      isSleepCollision: isCollision,
      instructionsPl: t.instructionsPl,
    });

    currentTime = startTime;
  }

  // Order chronologically
  const chronologicalStages = scheduledStagesReversed.reverse();

  let suggestion: string | undefined;
  if (hasCollision) {
    suggestion =
      'Sugerowana korekta: wydłuż garowanie w lodówce albo przesuń godzinę dokarmienia zakwasu, aby ominąć nocne etapy stolnicowe.';
  }

  return {
    targetReadyTime,
    stages: chronologicalStages,
    hasSleepCollision: hasCollision,
    collisionDetailsPl:
      collisions.length > 0
        ? collisions
            .map((c) => Object.entries(sleepCollisionParams(c)).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), SLEEP_COLLISION_TEMPLATE_PL))
            .join('; ')
        : undefined,
    sleepCollisions: collisions,
    suggestedActionPl: suggestion,
  };
}

/**
 * Automatically adjusts cold retard duration (8h to 24h) to avoid any sleep collision.
 */
export function autoResolveSleepCollision(
  targetReadyTime: Date,
  options: ScheduleOptions = {}
): AutoResolveResult | null {
  const initialSchedule = calculateReverseSchedule(targetReadyTime, options);
  if (!initialSchedule.hasSleepCollision) {
    return null;
  }

  const initialRetard = options.coldRetardHours ?? 14.0;
  // Try candidate durations from 8h to 24h with 0.5h step, sorting by proximity to initialRetard
  const candidates: number[] = [];
  for (let h = 8; h <= 24; h += 0.5) {
    if (Math.abs(h - initialRetard) > 0.1) candidates.push(h);
  }
  candidates.sort((a, b) => Math.abs(a - initialRetard) - Math.abs(b - initialRetard));

  for (const candidateHours of candidates) {
    const testSchedule = calculateReverseSchedule(targetReadyTime, {
      ...options,
      coldRetardHours: candidateHours,
    });
    if (!testSchedule.hasSleepCollision) {
      return {
        resolvedSchedule: testSchedule,
        adjustedColdRetardHours: candidateHours,
        originalColdRetardHours: initialRetard,
      };
    }
  }

  return null;
}
