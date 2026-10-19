// ============================================================================
// Piekarz (Crust) — Sourdough Physics & Kinetics (RD-11, RD-13, RD-19)
// Scientific & Artisanal Literature Citations: docs/BAKING_PHYSICS_BIBLIOGRAPHY.md
// Gänzle & Ripari (2016), Brandt (2007), Hamelman (2012).
// ============================================================================

import { predictStarterPeak } from './starter-peak-predictor';

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

  // Teksty z docs/tresci/pl/zakwas-szczyt.md (ZAK-SZC-003); liczby godzin bez źródła usunięte (ZAK-SZC-900) [044]
  let tipPl = 'Standardowe dokarmienie przed pieczeniem.';
  if (ratio[1] >= 5) {
    tipPl = 'Wysokie rozcieńczenie: mniej zakwasu względem świeżej mąki i wody, więc dłuższy czas do szczytu.';
  } else if (ratio[1] === 1) {
    tipPl = 'Szybkie odświeżenie: więcej zakwasu względem świeżej mąki i wody, więc krótszy czas do szczytu.';
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

/** before/peak/after: względem okna szczytu z predyktora (jeden model, M1-audytor-generalny-044);
 *  lag/hungry: lodówka i brak danych o karmieniu. */
export type SourdoughPhase = 'lag' | 'hungry' | 'before' | 'peak' | 'after';

export interface SourdoughPhaseResult {
  phase: SourdoughPhase;
  elapsedHours: number;
  labelPl: string;
  badgeColor: string;
  advicePl: string;
}

/** Okno szczytu (znaczniki czasu ms) z predictStarterPeak. */
export interface StarterPeakWindow {
  start: number;
  end: number;
}

/**
 * RD-19: faza zakwasu na karcie. W temperaturze pokojowej faza wynika z okna szczytu predyktora
 * (przed / w oknie / po), więc odznaka i komunikat predyktora nie mogą sobie przeczyć. Teksty dosłownie
 * z docs/tresci/pl/zakwas-szczyt.md (ZAK-SZC-001, -002, -004); fazy liczone z samego czasu wycofane
 * (ZAK-SZC-901) [M1-audytor-generalny-044; 06-tresci-007].
 */
export function calculateStarterPhase(
  lastFedAt: number | undefined,
  storageState: 'ROOM_TEMP' | 'FRIDGE' = 'ROOM_TEMP',
  now: number = Date.now(),
  peakWindow?: StarterPeakWindow
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

  const w =
    peakWindow ??
    (() => {
      const p = predictStarterPeak({ lastFedAt, now });
      return { start: p.peakWindowStartTimestamp, end: p.peakWindowEndTimestamp };
    })();

  if (now < w.start) {
    return {
      phase: 'before',
      elapsedHours,
      labelPl: 'Przed szacowanym szczytem',
      badgeColor: '#3B82F6',
      advicePl: 'W niższej temperaturze wzrost i fermentacja zakwasu zwalniają.',
    };
  }
  if (now <= w.end) {
    return {
      phase: 'peak',
      elapsedHours,
      labelPl: 'W szacowanym oknie szczytu',
      badgeColor: '#10B981',
      advicePl: 'Okno szczytu to szacunek: w badaniu 40 zakwasów tempo rośnięcia ciasta wynosiło od 0,1 do 1,5 mm/h.',
    };
  }
  return {
    phase: 'after',
    elapsedHours,
    labelPl: 'Po szacowanym szczycie',
    badgeColor: '#F59E0B',
    advicePl: 'Zakwas po szczycie staje się bardziej kwaśny i wytwarza mniej pęcherzyków gazu.',
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
