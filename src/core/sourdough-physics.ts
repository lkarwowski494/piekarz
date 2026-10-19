// ============================================================================
// Piekarz (Crust) — Sourdough Physics & Kinetics (RD-11, RD-13, RD-19)
// Scientific & Artisanal Literature Citations: docs/BAKING_PHYSICS_BIBLIOGRAPHY.md
// Gänzle & Ripari (2016), Brandt (2007), Hamelman (2012).
// ============================================================================

export interface StarterFeedingResult {
  targetYieldGrams: number;
  starterGrams: number;
  flourGrams: number;
  waterGrams: number;
  ratioDescription: string;
  tipPl?: string;
}

/** discard = wyrzuć; hooch = sam płyn; no_observation = nic nie zaznaczono (bez werdyktu) [M1-audytor-generalny-013]. */
export type SourdoughSafetyStatus = 'discard' | 'hooch' | 'no_observation';

export interface SourdoughSafetyCheck {
  status: SourdoughSafetyStatus;
  titlePl: string;
  actionPl: string;
}

/**
 * RD-11: Sourdough Starter Feeding Calculator
 * Calculates starter, flour, and water quantities for a given ratio (e.g. 1:1:1, 1:2:2, 1:5:5).
 */
export function calculateStarterFeeding(
  targetYieldGrams: number,
  ratio: [number, number, number] = [1, 2, 2]
): StarterFeedingResult {
  const [sPart, fPart, wPart] = ratio;
  const totalParts = sPart + fPart + wPart;

  if (totalParts <= 0 || targetYieldGrams <= 0) {
    throw new Error('Parametry dokarmiania muszą być większe od zera');
  }

  const onePart = targetYieldGrams / totalParts;
  const starter = Math.round(onePart * sPart);
  const flour = Math.round(onePart * fPart);
  const water = Math.round(onePart * wPart);

  let tipPl = 'Standardowe dokarmienie przed pieczeniem (4–6h w 24–26°C do szczytu objętości).';
  if (ratio[1] >= 5) {
    tipPl = 'Wysokie rozcieńczenie (1:5:5 lub 1:10:10) — dłuższy czas wyrastania (8–12h), idealne na noc.';
  } else if (ratio[1] === 1) {
    tipPl = 'Szybkie odświeżenie 1:1:1 — krótki czas wyrastania (2–4h), wysoka kwasowość.';
  }

  return {
    targetYieldGrams,
    starterGrams: starter,
    flourGrams: flour,
    waterGrams: water,
    ratioDescription: `${sPart}:${fPart}:${wPart}`,
    tipPl,
  };
}

export type SourdoughPhase = 'lag' | 'rising' | 'peak' | 'declining' | 'hungry';

export interface SourdoughPhaseResult {
  phase: SourdoughPhase;
  elapsedHours: number;
  labelPl: string;
  badgeColor: string;
  advicePl: string;
}

/**
 * RD-19: Sourdough Metabolic Phase and Peak Activity Indicator
 */
export function calculateStarterPhase(
  lastFedAt: number | undefined,
  storageState: 'ROOM_TEMP' | 'FRIDGE' = 'ROOM_TEMP',
  now: number = Date.now()
): SourdoughPhaseResult {
  if (!lastFedAt) {
    return {
      phase: 'hungry',
      elapsedHours: 999,
      labelPl: 'Brak danych o karmieniu',
      badgeColor: '#EF4444',
      advicePl: 'Zarejestruj dokarmienie, aby uruchomić śledzenie szczytu aktywności.',
    };
  }

  const diffMs = Math.max(0, now - lastFedAt);
  const elapsedHours = Number((diffMs / (1000 * 60 * 60)).toFixed(1));

  if (storageState === 'FRIDGE') {
    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays < 5) {
      return {
        phase: 'lag',
        elapsedHours,
        labelPl: `Uśpiony w lodówce (${elapsedDays} dni)`,
        badgeColor: '#3B82F6',
        advicePl: 'W niskiej temperaturze (4°C) metabolizm drożdży zwalnia. Przed pieczeniem wyjmij na 2–3h i dokarm.',
      };
    }
    return {
      phase: 'hungry',
      elapsedHours,
      labelPl: `Wymaga odświeżenia (${elapsedDays} dni w chłodzie)`,
      badgeColor: '#F59E0B',
      advicePl: 'Zakwas w lodówce powyżej 5 dni potrzebuje 1–2 karmień w temperaturze pokojowej przed przygotowaniem ciasta.',
    };
  }

  // Room temperature kinetics (21 - 24°C)
  if (elapsedHours < 2.0) {
    return {
      phase: 'lag',
      elapsedHours,
      labelPl: 'Faza adaptacji (Uśpienie)',
      badgeColor: '#6B7280',
      advicePl: 'Drożdże i bakterie mlekowe adaptują się do świeżej mąki. Brak widocznego wzrostu jest normalny.',
    };
  }
  if (elapsedHours < 5.0) {
    return {
      phase: 'rising',
      elapsedHours,
      labelPl: 'Aktywny rozrost (Wzrost objętości)',
      badgeColor: '#3B82F6',
      advicePl: 'Ciasto podwaja objętość, widać pierwsze pęcherze gazu i wypukłą kopułę.',
    };
  }
  if (elapsedHours <= 9.0) {
    return {
      phase: 'peak',
      elapsedHours,
      labelPl: 'Szczyt aktywności (PEAK) — Idealny moment!',
      badgeColor: '#10B981',
      advicePl: 'Maksymalna objętość i siła pędna drożdży. Najlepszy moment na dodanie do ciasta chlebowego!',
    };
  }
  if (elapsedHours <= 14.0) {
    return {
      phase: 'declining',
      elapsedHours,
      labelPl: 'Wypłaszczenie / Lekki spadek',
      badgeColor: '#F59E0B',
      advicePl: 'Kopuła zaczyna się zapadać, rośnie kwasowość octowa. Chleb będzie wyraźniej kwaskowaty.',
    };
  }
  return {
    phase: 'hungry',
    elapsedHours,
    labelPl: 'Głód / Opadnięcie',
    badgeColor: '#EF4444',
    advicePl: 'Pożywka zużyta. Zlej ewentualny płyn głodowy (Hooch) i dokarm zakwas w proporcji 1:2:2.',
  };
}

/**
 * RD-13: ocena objawów zakwasu według zasady ostrożności DEC-10 (a) [M1-audytor-generalny-013]:
 * każdy nalot, pleśń, przebarwienie albo zgniły zapach → wyrzuć; bez werdyktu „jadalny” i „zdrowy”.
 * Teksty dosłownie z docs/tresci/pl/zakwas-bezpieczenstwo.md (rejestr: ZAK-NAL-001, ZAK-PLE-002,
 * ZAK-KOL-001, ZAK-PLE-003, ZAK-WAC-001, ZAK-NAC-001, ZAK-HOO-001); przegląd człowieka: krok właściciela.
 */
export function evaluateSourdoughSafety(observations: {
  hasHoochLiquid?: boolean;
  hasWhiteWrinkledFilm?: boolean;
  hasFuzzySpots?: boolean;
  hasColoredSpots?: boolean;
  hasRottenSmell?: boolean;
}): SourdoughSafetyCheck {
  if (
    observations.hasWhiteWrinkledFilm ||
    observations.hasFuzzySpots ||
    observations.hasColoredSpots ||
    observations.hasRottenSmell
  ) {
    return {
      status: 'discard',
      titlePl: 'Wyrzuć zakwas',
      actionPl:
        'Nie używaj tego zakwasu i nie próbuj go ratować. Pleśń może sięgać w głąb zakwasu, nawet gdy na powierzchni widać tylko niewielki nalot. Nie wąchaj zakwasu z nalotem, bo może to wywołać problemy z oddychaniem. Przed założeniem nowego zakwasu dokładnie umyj i wypłucz słoik.',
    };
  }

  if (observations.hasHoochLiquid) {
    return {
      status: 'hooch',
      titlePl: 'Płyn na powierzchni (hooch)',
      actionPl:
        'Według CSU Extension warstwa płynu o zapachu alkoholu jest w porządku: to produkt uboczny fermentacji drożdży. Możesz ją zlać albo wmieszać. Jeśli widzisz też nalot lub przebarwienie albo czujesz zgniły zapach, zaznacz to powyżej.',
    };
  }

  return {
    status: 'no_observation',
    titlePl: 'Nie zaznaczono żadnego objawu',
    actionPl: 'Ocena pojawi się po zaznaczeniu tego, co widzisz albo czujesz.',
  };
}
