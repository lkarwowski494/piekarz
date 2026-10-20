// ============================================================================
// Piekarz (Crust) — Dutch Oven Two-Phase Baking Physics & Steam Management
// Standard: 20 min @ 240°C (Lid On / Steam) -> 25 min @ 210°C (Lid Off / Maillard)
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

export const DUTCH_OVEN_PHASES: Record<DutchOvenBakePhase, DutchOvenPhaseConfig> = {
  lid_on: {
    id: 'lid_on',
    phaseNumber: 1,
    namePl: 'Faza 1: Pod pokrywką (Para)',
    durationMin: 20,
    temperatureC: 240,
    descriptionPl: 'Pokrywka ZAMKNIĘTA. Maksymalna para i rozprężenie w piecu (Oven Spring).',
    tipPl: 'Wysoka wilgotność opóźnia twardnienie skórki, pozwalając na maksymalne otwarcie nacięcia (ucha).',
  },
  lid_off: {
    id: 'lid_off',
    phaseNumber: 2,
    namePl: 'Faza 2: Bez pokrywki (Karmelizacja)',
    durationMin: 25,
    temperatureC: 210,
    descriptionPl: 'Pokrywka ZDJĘTA. Odparowanie wilgoci i głębokie zbrązowienie skórki.',
    tipPl: 'Obniż temperaturę do 210°C. Reakcja Maillarda tworzy chrupiącą, orzechowo-karmelową skórkę.',
    alertHeadlinePl: 'Zdejmij pokrywkę garnka! Wypuść parę i obniż temp. do 210°C.',
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
