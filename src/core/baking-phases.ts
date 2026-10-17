// ============================================================================
// Piekarz (Crust) — Dutch Oven Two-Phase Baking Physics & Steam Management
// Standard: 20 min @ 240°C (Lid On / Steam) -> 25 min @ 210°C (Lid Off / Maillard)
// Apps4Craft Studio — 100% Offline-First.
// ============================================================================

export interface BakeStep {
  id: string;
  name: string;
  desc: string;
  timerMin: number;
}

export const BAKE_STEPS: BakeStep[] = [
  {
    id: 'step_1',
    name: 'Autoliza',
    desc: 'Połącz mąkę z wodą, nie dodawaj jeszcze zakwasu ani soli. Pozwól glutenowi i enzymom samoczynnie rozwinąć strukturę ciasta.',
    timerMin: 45,
  },
  {
    id: 'step_2',
    name: 'Mieszanie i zaszczepienie',
    desc: 'Dodaj aktywny zakwas i sól. Wyrabiaj techniką Rubaud lub delikatnym podwijaniem aż ciasto stanie się gładkie i elastyczne.',
    timerMin: 15,
  },
  {
    id: 'step_3',
    name: 'Składanie 1 (Stretch & Fold)',
    desc: 'Mokrymi dłońmi podciągnij 4 brzegi ciasta ku górze i złóż do środka miski.',
    timerMin: 30,
  },
  {
    id: 'step_4',
    name: 'Składanie 2 (Coil Fold)',
    desc: 'Delikatnie podłóż obie dłonie pod środek ciasta, unieś i pozwól końcom zawinąć się pod spód.',
    timerMin: 30,
  },
  {
    id: 'step_5',
    name: 'Składanie 3 (Coil Fold)',
    desc: 'Ostatnie składanie budujące napięcie powierzchniowe. Ciasto powinno być puszyste i trzymać kształt kuli.',
    timerMin: 30,
  },
  {
    id: 'step_6',
    name: 'Formowanie wstępne (Pre-shape)',
    desc: 'Wyłóż ciasto na blat, podtocz delikatnie w kulę skrobakiem bez nadmiaru mąki. Zostaw na 20 min odpoczynku.',
    timerMin: 20,
  },
  {
    id: 'step_7',
    name: 'Formowanie do koszyka i chłód',
    desc: 'Nadaj ostateczny kształt (baton lub bochenek okrągły), umieść w oprószonym koszyku i schowaj do lodówki (4°C) na 12–16h.',
    timerMin: 720,
  },
  {
    id: 'step_8',
    name: 'Wypiek w garnku z parą',
    desc: '20 min w nagrzanym garnku żeliwnym (240°C) pod pokrywką + 22–25 min bez pokrywki (210°C) do głębokiego zbrązowienia.',
    timerMin: 45,
  },
];

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
