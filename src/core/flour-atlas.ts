// ============================================================================
// Piekarz (Crust) — Flour Atlas & Water Absorption Engine (BR-MĄKA-001…003)
// Technical parameters of European & Polish flour classifications.
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import { FlourItemInput } from './domain-rules';

export type FlourBlendEntry = FlourItemInput;

export interface FlourProfile {
  id: string;
  namePl: string;
  grain: 'wheat' | 'rye' | 'spelt';
  ashTyp: number; // e.g. 500, 750, 2000
  proteinPercent: number; // e.g. 12.0
  typicalAbsorptionPercent: number; // baseline water absorption %
  optimalHydrationRange: [number, number]; // [min%, max%]
  wStrength?: number; // Chopin Alveograph W index (e.g. 240)
  descriptionPl: string;
  /**
   * Szacunek: typ potwierdzony (MAK-TYP-004/005), ale parametry liczbowe bez źródła (p4-002 roli 06),
   * skopiowane z profilu tego samego zboża o najbliższym numerze typu, tu podanym.
   * Decyzja właściciela 2026-10-20 D-A [M1-audytor-generalny-091].
   */
  estimatedFromTyp?: number;
}

export const FLOUR_PROFILES: FlourProfile[] = [
  {
    id: 'wheat_450',
    namePl: 'Mąka pszenna typ 450 (Tortowa)',
    grain: 'wheat',
    ashTyp: 450,
    proteinPercent: 9.5,
    typicalAbsorptionPercent: 58.0,
    optimalHydrationRange: [56.0, 62.0],
    wStrength: 140,
    descriptionPl: 'Niska zawartość popiołu i białka. Szybka autoliza, delikatny gluten, mała chłonność wody.',
  },
  {
    id: 'wheat_500',
    namePl: 'Mąka pszenna typ 500 (Wrocławska / Poznańska)',
    grain: 'wheat',
    ashTyp: 500,
    proteinPercent: 10.5,
    typicalAbsorptionPercent: 60.0,
    optimalHydrationRange: [58.0, 64.0],
    wStrength: 180,
    descriptionPl: 'Uniwersalna mąka pszenna. Dobra do bułek, chałek i wypieków drożdżowych.',
  },
  {
    id: 'wheat_650',
    namePl: 'Mąka pszenna typ 650 (Bułkowa)',
    grain: 'wheat',
    ashTyp: 650,
    proteinPercent: 11.5,
    typicalAbsorptionPercent: 64.0,
    optimalHydrationRange: [62.0, 68.0],
    wStrength: 220,
    descriptionPl: 'Średnia zawartość minerałów, elastyczny gluten. Bardzo dobra do chlebów pszennych i bagietek.',
  },
  {
    id: 'wheat_750',
    namePl: 'Mąka pszenna chlebowa typ 750',
    grain: 'wheat',
    ashTyp: 750,
    proteinPercent: 12.2,
    typicalAbsorptionPercent: 68.0,
    optimalHydrationRange: [66.0, 74.0],
    wStrength: 250,
    descriptionPl: 'Klasyczna polska mąka chlebowa. Znakomity balans między rozciągliwością a siłą ciasta.',
  },
  {
    id: 'wheat_850',
    namePl: 'Mąka pszenna typ 850',
    grain: 'wheat',
    ashTyp: 850,
    proteinPercent: 12.8,
    typicalAbsorptionPercent: 71.0,
    optimalHydrationRange: [68.0, 76.0],
    wStrength: 260,
    // MAK-TYP-003 (docs/tresci/pl/maki-typy.md) [M1-audytor-generalny-091]
    descriptionPl: 'Typ 850 nie jest wymieniony w normie PN-A-74022:2003: młyny produkują go według własnej specyfikacji technicznej. Ciemniejsza mąka chlebowa o wyższej aktywności enzymatycznej i orzechowym aromacie.',
  },
  {
    id: 'wheat_1050',
    namePl: 'Mąka pszenna typ 1050',
    grain: 'wheat',
    ashTyp: 1050,
    proteinPercent: 13.0,
    typicalAbsorptionPercent: 74.0,
    optimalHydrationRange: [70.0, 78.0],
    wStrength: 270,
    descriptionPl: 'Wysoka zawartość łuski ziarna, znaczna absorpcja wody, głęboki rustykalny profil skórki.',
  },
  {
    id: 'wheat_1850',
    namePl: 'Mąka pszenna typ 1850 (Graham)',
    grain: 'wheat',
    ashTyp: 1850,
    proteinPercent: 13.5,
    typicalAbsorptionPercent: 78.0,
    optimalHydrationRange: [74.0, 84.0],
    descriptionPl: 'Grubo mielona mąka ze wszystkimi częściami ziarna. Otręby przecinają gluten, wymaga delikatnego składania.',
  },
  {
    id: 'wheat_2000',
    namePl: 'Mąka pszenna razowa typ 2000',
    grain: 'wheat',
    ashTyp: 2000,
    proteinPercent: 13.8,
    typicalAbsorptionPercent: 82.0,
    optimalHydrationRange: [78.0, 88.0],
    descriptionPl: 'Pełny przemiał pszenicy. Potężna chłonność wody, przyspieszona fermentacja dzięki obfitości minerałów.',
  },
  {
    id: 'rye_720',
    namePl: 'Mąka żytnia chlebowa typ 720',
    grain: 'rye',
    ashTyp: 720,
    proteinPercent: 8.5,
    typicalAbsorptionPercent: 70.0,
    optimalHydrationRange: [68.0, 78.0],
    descriptionPl: 'Brak struktury glutenowej (funkcję szkieletu pełnią śluzy arabinoksylany). Wymaga zakwasu (pH < 4.5).',
  },
  {
    id: 'rye_2000',
    namePl: 'Mąka żytnia razowa typ 2000',
    grain: 'rye',
    ashTyp: 2000,
    proteinPercent: 10.0,
    typicalAbsorptionPercent: 82.0,
    optimalHydrationRange: [78.0, 90.0],
    descriptionPl: 'Idealna baza do prowadzenia zakwasu matki. Bogata w dzikie drożdże i bakterie kwasu mlekowego.',
  },
  {
    id: 'wheat_manitoba',
    namePl: 'Mąka Manitoba / Forte (W > 350)',
    grain: 'wheat',
    ashTyp: 550,
    proteinPercent: 14.5,
    typicalAbsorptionPercent: 78.0,
    optimalHydrationRange: [75.0, 88.0],
    wStrength: 360,
    descriptionPl: 'Super-silna mąka z pszenicy wysokobiałkowej. Utrzymuje gigantyczną hydratację (80%+) i wielogodzinny chłód.',
  },
  {
    id: 'spelt_630',
    namePl: 'Mąka orkiszowa jasna typ 630',
    grain: 'spelt',
    ashTyp: 630,
    proteinPercent: 12.0,
    typicalAbsorptionPercent: 63.0,
    optimalHydrationRange: [60.0, 68.0],
    descriptionPl: 'Orkisz pradawny. Gluten bardzo rozciągliwy, ale podatny na osłabienie przy intensywnym wyrabianiu mechanicznym.',
  },
  {
    id: 'spelt_2000',
    namePl: 'Mąka orkiszowa razowa typ 2000',
    grain: 'spelt',
    ashTyp: 2000,
    proteinPercent: 13.5,
    typicalAbsorptionPercent: 80.0,
    optimalHydrationRange: [76.0, 86.0],
    descriptionPl: 'Pełnoziarnisty orkisz. Wyraźny orzechowo-słodki smak, wysokie zapotrzebowanie na wodę.',
  },
  // Profile szacunkowe: decyzja właściciela 2026-10-20 D-A; typ z MAK-TYP-004 (405, 550, żytnia 500)
  // i MAK-TYP-005 (żytnia 1400); parametry bez źródła (p4-002 roli 06), kopia z najbliższego typu.
  // Bez opisu, bo opis byłby twierdzeniem bez źródła. Na końcu listy: indeksy istniejących profili bez zmian.
  {
    id: 'wheat_405',
    namePl: 'Mąka pszenna typ 405',
    grain: 'wheat',
    ashTyp: 405,
    proteinPercent: 9.5,
    typicalAbsorptionPercent: 58.0,
    optimalHydrationRange: [56.0, 62.0],
    wStrength: 140,
    descriptionPl: '',
    estimatedFromTyp: 450,
  },
  {
    id: 'wheat_550',
    namePl: 'Mąka pszenna typ 550 (Luksusowa)',
    grain: 'wheat',
    ashTyp: 550,
    proteinPercent: 10.5,
    typicalAbsorptionPercent: 60.0,
    optimalHydrationRange: [58.0, 64.0],
    wStrength: 180,
    descriptionPl: '',
    estimatedFromTyp: 500,
  },
  {
    id: 'rye_500',
    namePl: 'Mąka żytnia typ 500',
    grain: 'rye',
    ashTyp: 500,
    proteinPercent: 8.5,
    typicalAbsorptionPercent: 70.0,
    optimalHydrationRange: [68.0, 78.0],
    descriptionPl: '',
    estimatedFromTyp: 720,
  },
  {
    id: 'rye_1400',
    namePl: 'Mąka żytnia typ 1400',
    grain: 'rye',
    ashTyp: 1400,
    proteinPercent: 10.0,
    typicalAbsorptionPercent: 82.0,
    optimalHydrationRange: [78.0, 90.0],
    descriptionPl: '',
    estimatedFromTyp: 2000,
  },
];

/**
 * Maps a flour name string (e.g. "Mąka pszenna chlebowa t750") to closest known FlourProfile.
 */
export function matchFlourProfile(flourName: string): FlourProfile {
  const normalized = flourName.toLowerCase();

  // Explicit check for manitoba
  if (normalized.includes('manitoba') || normalized.includes('forte')) {
    return FLOUR_PROFILES.find((p) => p.id === 'wheat_manitoba')!;
  }

  // Spelt checks
  if (normalized.includes('orkisz')) {
    if (normalized.includes('2000') || normalized.includes('razow')) {
      return FLOUR_PROFILES.find((p) => p.id === 'spelt_2000')!;
    }
    return FLOUR_PROFILES.find((p) => p.id === 'spelt_630')!;
  }

  // Rye checks
  if (normalized.includes('żytn') || normalized.includes('zytn') || normalized.includes('rye')) {
    if (normalized.includes('2000') || normalized.includes('razow')) {
      return FLOUR_PROFILES.find((p) => p.id === 'rye_2000')!;
    }
    if (normalized.includes('1400')) {
      return FLOUR_PROFILES.find((p) => p.id === 'rye_1400')!;
    }
    if (normalized.includes('500')) {
      return FLOUR_PROFILES.find((p) => p.id === 'rye_500')!;
    }
    return FLOUR_PROFILES.find((p) => p.id === 'rye_720')!;
  }

  // Wheat checks by typ numbers (longer typ numbers first to avoid substring collision)
  if (normalized.includes('2000') || normalized.includes('razow')) {
    return FLOUR_PROFILES.find((p) => p.id === 'wheat_2000')!;
  }
  if (normalized.includes('1850') || normalized.includes('graham')) {
    return FLOUR_PROFILES.find((p) => p.id === 'wheat_1850')!;
  }
  if (normalized.includes('1050')) {
    return FLOUR_PROFILES.find((p) => p.id === 'wheat_1050')!;
  }
  if (normalized.includes('850')) {
    return FLOUR_PROFILES.find((p) => p.id === 'wheat_850')!;
  }
  if (normalized.includes('650') || normalized.includes('bułkow')) {
    return FLOUR_PROFILES.find((p) => p.id === 'wheat_650')!;
  }
  if (normalized.includes('550') || normalized.includes('luksus')) {
    return FLOUR_PROFILES.find((p) => p.id === 'wheat_550')!;
  }
  if (normalized.includes('500') || normalized.includes('poznań') || normalized.includes('wrocł')) {
    return FLOUR_PROFILES.find((p) => p.id === 'wheat_500')!;
  }
  if (normalized.includes('450') || normalized.includes('tortow')) {
    return FLOUR_PROFILES.find((p) => p.id === 'wheat_450')!;
  }
  if (normalized.includes('405')) {
    return FLOUR_PROFILES.find((p) => p.id === 'wheat_405')!;
  }

  // Default fallback: Typ 750 bread flour
  return FLOUR_PROFILES.find((p) => p.id === 'wheat_750')!;
}

export interface BlendAbsorptionAnalysis {
  weightedAbsorptionPercent: number;
  recommendedHydrationRange: [number, number];
  estimatedProteinPercent: number;
  ryePercentage: number;
  wholeGrainPercentage: number;
  doughFeelAdvicePl: string;
}

/**
 * Calculates weighted water absorption capacity and hydration advice for a custom flour blend.
 */
export function analyzeFlourBlendAbsorption(
  flours: FlourBlendEntry[],
  currentHydrationPercent: number
): BlendAbsorptionAnalysis {
  if (!flours || flours.length === 0) {
    return {
      weightedAbsorptionPercent: 68.0,
      recommendedHydrationRange: [66.0, 74.0],
      estimatedProteinPercent: 12.0,
      ryePercentage: 0,
      wholeGrainPercentage: 0,
      doughFeelAdvicePl: 'Standardowa mąka chlebowa.',
    };
  }

  const totalPercentage = flours.reduce((acc, f) => acc + f.percentage, 0);
  const factor = totalPercentage > 0 ? 100 / totalPercentage : 1;

  let weightedAbs = 0;
  let weightedMinHyd = 0;
  let weightedMaxHyd = 0;
  let weightedProtein = 0;
  let ryePercent = 0;
  let wholeGrainPercent = 0;

  for (const f of flours) {
    const profile = matchFlourProfile(f.name);
    const normalizedShare = (f.percentage * factor) / 100;

    weightedAbs += profile.typicalAbsorptionPercent * normalizedShare;
    weightedMinHyd += profile.optimalHydrationRange[0] * normalizedShare;
    weightedMaxHyd += profile.optimalHydrationRange[1] * normalizedShare;
    weightedProtein += profile.proteinPercent * normalizedShare;

    if (profile.grain === 'rye') {
      ryePercent += f.percentage * factor;
    }
    if (profile.ashTyp >= 1850) {
      wholeGrainPercent += f.percentage * factor;
    }
  }

  weightedAbs = Math.round(weightedAbs * 10) / 10;
  const recommendedRange: [number, number] = [
    Math.round(weightedMinHyd * 10) / 10,
    Math.round(weightedMaxHyd * 10) / 10,
  ];
  weightedProtein = Math.round(weightedProtein * 10) / 10;
  ryePercent = Math.round(ryePercent * 10) / 10;
  wholeGrainPercent = Math.round(wholeGrainPercent * 10) / 10;

  // Determine dough feel advice relative to current hydration
  let doughFeelAdvicePl = '';
  if (currentHydrationPercent < recommendedRange[0] - 2.0) {
    doughFeelAdvicePl = 'Ciasto będzie bardzo zwarte i sztywne. Możesz śmiało dolać więcej wody.';
  } else if (currentHydrationPercent > recommendedRange[1] + 3.0) {
    doughFeelAdvicePl =
      'Uwaga: bardzo wysoka hydratacja dla tej mieszanki! Ciasto może być luźne i wymagać wprawnej techniki coil fold.';
  } else if (currentHydrationPercent >= recommendedRange[0] && currentHydrationPercent <= recommendedRange[1]) {
    doughFeelAdvicePl = 'Idealny balans chłonności i hydratacji dla tej kompozycji mąk.';
  } else {
    doughFeelAdvicePl = 'Dobra sprężystość ciasta z zachowaniem odpowiedniej wilgotności miękiszu.';
  }

  if (ryePercent >= 40) {
    doughFeelAdvicePl += ' Wysoki udział żyta — ciasto będzie kleiste, unikaj agresywnego wyrabiania.';
  }

  return {
    weightedAbsorptionPercent: weightedAbs,
    recommendedHydrationRange: recommendedRange,
    estimatedProteinPercent: weightedProtein,
    ryePercentage: ryePercent,
    wholeGrainPercentage: wholeGrainPercent,
    doughFeelAdvicePl,
  };
}

export interface FlourBlendValidationResult {
  isValid: boolean;
  sumPercentage: number;
  remainingPercentage: number;
  errorPl?: string;
  /** Szablon komunikatu + parametry do t() przy wyświetlaniu [M1-audytor-generalny-047] */
  errorTemplatePl?: string;
  errorParams?: Record<string, number>;
}

/**
 * Validates that flour percentages sum strictly to 100% (within 0.05% tolerance).
 */
export function validateFlourBlend(flours: FlourBlendEntry[]): FlourBlendValidationResult {
  if (!flours || flours.length === 0) {
    return {
      isValid: false,
      sumPercentage: 0,
      remainingPercentage: 100.0,
      errorPl: 'Mieszanka musi zawierać co najmniej jedną mąkę.',
      errorTemplatePl: 'Mieszanka musi zawierać co najmniej jedną mąkę.',
      errorParams: {},
    };
  }

  const sum = Math.round(flours.reduce((acc, f) => acc + (Number(f.percentage) || 0), 0) * 10) / 10;
  const remaining = Math.round((100.0 - sum) * 10) / 10;
  const isValid = Math.abs(sum - 100.0) <= 0.05;

  let errorTemplatePl: string | undefined;
  // Liczby zostają liczbami: t() formatuje je według języka aplikacji [M1-audytor-generalny-070]
  let errorParams: Record<string, number> | undefined;
  if (!isValid) {
    if (sum < 100.0) {
      errorTemplatePl = 'Suma procentów wynosi {suma}% — brakuje jeszcze {reszta}%.';
      errorParams = { suma: sum, reszta: remaining };
    } else {
      errorTemplatePl = 'Suma procentów wynosi {suma}% — przekracza 100% o {reszta}%.';
      errorParams = { suma: sum, reszta: Math.abs(remaining) };
    }
  }
  const errorPl =
    errorTemplatePl && errorParams
      ? Object.entries(errorParams).reduce((s, [k, v]) => s.split(`{${k}}`).join(`${v}`), errorTemplatePl)
      : undefined;

  return {
    isValid,
    sumPercentage: sum,
    remainingPercentage: remaining,
    errorPl,
    errorTemplatePl,
    errorParams,
  };
}

/**
 * Normalizes flour blend percentages proportionally so they sum to exactly 100%.
 */
export function normalizeFlourBlend(flours: FlourBlendEntry[]): FlourBlendEntry[] {
  if (!flours || flours.length === 0) return [];
  const sum = flours.reduce((acc, f) => acc + (Number(f.percentage) || 0), 0);
  if (sum <= 0) return flours.map((f) => ({ ...f, percentage: 0 }));

  const factor = 100.0 / sum;
  let runningSum = 0;
  const result = flours.map((f, idx) => {
    if (idx === flours.length - 1) {
      const lastPct = Math.round((100.0 - runningSum) * 10) / 10;
      return { ...f, percentage: lastPct };
    }
    const normalized = Math.round(f.percentage * factor * 10) / 10;
    runningSum += normalized;
    return { ...f, percentage: normalized };
  });

  return result;
}

