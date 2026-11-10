// ============================================================================
// Piekarz (Crust) — Dutch Oven Two-Phase Baking Physics & Steam Management
// Fazy garnka ze źródła (PIE-GAR-001, D-304): 20 min pod pokrywką i 20–25 min bez niej, obie w 232 °C; czas fazy bez
// pokrywki z danych receptury przez czas kroku pieczenia (fazyGarnka) [M1-audytor-generalny-008]
// Apps4Craft Studio — 100% Offline-First.
// ============================================================================

// Kroki Stolnicy: plan Harmonogramu (bake-steps.ts); dawna lista 8 kroków tylko do odczytu starych
// zapisów jako LEGACY_STEPS_V1 (legacy-steps-v1.ts) [M1-audytor-generalny-030].

export type DutchOvenBakePhase = 'lid_on' | 'lid_off';

export interface DutchOvenPhaseConfig {
  id: DutchOvenBakePhase;
  phaseNumber: 1 | 2;
  namePl: string;
  durationMin: number;
  temperatureC: number;
  descriptionPl: string;
  tipPl: string;
  alertHeadlinePl?: string;
  /** Ostrzeżenie bezpieczeństwa przy tym kroku (klucz PL dla t()); tekst z docs/tresci, przegląd człowieka. */
  safetyWarningPl?: string;
}

// Teksty dosłownie z docs/tresci/pl/pieczenie-receptur.md (faza lid_on, faza lid_off); stare klucze zostają w słowniku EN.
export const DUTCH_OVEN_PHASES: Record<DutchOvenBakePhase, DutchOvenPhaseConfig> = {
  lid_on: {
    id: 'lid_on',
    phaseNumber: 1,
    namePl: 'Faza 1: Pod pokrywką (Para)',
    durationMin: 20, // PIE-GAR-001
    temperatureC: 232, // PIE-GAR-001
    descriptionPl: 'Pokrywka zamknięta: 20 minut w 232 °C.',
    tipPl: 'Para w garnku dłużej utrzymuje skórkę miękką, więc bochenek może jeszcze rosnąć.', // KRO-POC-013
  },
  lid_off: {
    id: 'lid_off',
    phaseNumber: 2,
    namePl: 'Faza 2: Bez pokrywki (Karmelizacja)',
    durationMin: 25, // PIE-GAR-001 (20–25 min); plan bez receptury, PIECZENIE_DOMYSLNE
    temperatureC: 232, // PIE-GAR-001: dalej w tej samej temperaturze
    descriptionPl: 'Pokrywka zdjęta: 20–25 minut w 232 °C, aż skórka będzie głęboko złotobrązowa.',
    tipPl: 'Chleb piecze się bez pokrywki, aż w pełni się zrumieni.', // KRO-POC-014
    alertHeadlinePl: 'Zdejmij pokrywkę garnka i piecz dalej w tej samej temperaturze.',
    // BEZ-OPA-001, BEZ-OPA-002, BEZ-OPA-003 (RD-23-W1): dosłownie z docs/tresci/pl/wypiek-bezpieczenstwo.md
    // [M1-audytor-generalny-086; 01-odkrywanie-019]
    safetyWarningPl: 'Załóż suche rękawice kuchenne i unoś pokrywkę od siebie, bo spod niej uchodzi gorąca para.',
  },
};

export function getDutchOvenPhase(phase: DutchOvenBakePhase): DutchOvenPhaseConfig {
  return DUTCH_OVEN_PHASES[phase] || DUTCH_OVEN_PHASES.lid_on;
}

export function getNextBakePhase(current: DutchOvenBakePhase): DutchOvenBakePhase | null {
  if (current === 'lid_on') return 'lid_off';
  return null;
}

export function calculateTotalDutchOvenTimeMin(phases?: DutchOvenBakePhase[]): number {
  const list = phases || (['lid_on', 'lid_off'] as DutchOvenBakePhase[]);
  return list.reduce((acc, p) => acc + DUTCH_OVEN_PHASES[p].durationMin, 0);
}

/**
 * Fazy garnka dla kroku pieczenia z planu: faza bez pokrywki trwa resztę czasu kroku (czas kroku = bakeTimeSteamMinutes
 * + bakeTimeBrowningMinutes receptury, D-304), więc zegar i powiadomienia mają czas receptury. Krok bez czasu albo
 * krótszy niż faza z pokrywką (stary zapis): czasy domyślne.
 */
export function fazyGarnka(krok: { durationMin: number | null } | undefined): Record<DutchOvenBakePhase, DutchOvenPhaseConfig> {
  const reszta = krok && krok.durationMin !== null ? krok.durationMin - DUTCH_OVEN_PHASES.lid_on.durationMin : 0;
  if (reszta <= 0) return DUTCH_OVEN_PHASES;
  return { ...DUTCH_OVEN_PHASES, lid_off: { ...DUTCH_OVEN_PHASES.lid_off, durationMin: reszta } };
}
