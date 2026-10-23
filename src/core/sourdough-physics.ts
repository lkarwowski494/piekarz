// ============================================================================
// Piekarz (Crust) — Sourdough Physics & Kinetics (RD-11, RD-13, RD-19)
// Scientific & Artisanal Literature Citations: docs/BAKING_PHYSICS_BIBLIOGRAPHY.md
// Gänzle & Ripari (2016), Brandt (2007), Hamelman (2012).
// ============================================================================

import { predictStarterPeak } from './starter-peak-predictor';
import type { PoziomKomunikatu } from './poziom-komunikatu';

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
  /** Szablon etykiety z parametrami (klucz słownika), gdy labelPl ma wstawioną liczbę [M1-audytor-generalny-093]. */
  labelTemplatePl?: string;
  labelParams?: Record<string, number>;
  /** Liczba dni do parametru {dni} szablonu, odmieniana przy wyświetlaniu formami CLDR [M1-audytor-generalny-071]. */
  labelDni?: number;
  /** Poziom komunikatu; kolor nadaje komponent (mapa-rol.md §3). */
  poziom: PoziomKomunikatu;
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
      poziom: 'info',
      advicePl: 'Zapisz dokarmienie, aby uruchomić śledzenie szczytu aktywności.',
    };
  }

  const diffMs = Math.max(0, now - lastFedAt);
  const elapsedHours = Number((diffMs / (1000 * 60 * 60)).toFixed(1));

  if (storageState === 'FRIDGE') {
    const elapsedDays = Math.floor(elapsedHours / 24);
    // Liczba dni z odmianą (1 dzień, 2 dni, 5 dni), w innych językach formy CLDR przy wyświetlaniu [M1-audytor-generalny-071]
    const dniPl = `${elapsedDays} ${elapsedDays === 1 ? 'dzień' : 'dni'}`;
    // Raz w tygodniu = 7 dni (ZAK-ZAL-012) [M1-audytor-generalny-132; 06-tresci-502]
    if (elapsedDays < 7) {
      return {
        phase: 'lag',
        elapsedHours,
        labelPl: `Uśpiony w lodówce (${dniPl})`,
        labelTemplatePl: 'Uśpiony w lodówce ({dni})',
        labelParams: { elapsedDays },
        labelDni: elapsedDays,
        poziom: 'info',
        // Dosłownie z docs/tresci/pl/zakwas-z-lodowki.md (ZAK-LOD-001) [M1-audytor-generalny-132; 06-tresci-502]
        advicePl:
          'Przed pieczeniem dokarm zakwas z lodówki i zostaw go w temperaturze pokojowej; może potrzebować nawet 12 godzin, żeby pokazać oznaki życia.',
      };
    }
    return {
      phase: 'hungry',
      elapsedHours,
      labelPl: `Wymaga odświeżenia (${dniPl} w chłodzie)`,
      labelTemplatePl: 'Wymaga odświeżenia ({dni} w chłodzie)',
      labelParams: { elapsedDays },
      labelDni: elapsedDays,
      poziom: 'info',
      // Dosłownie z docs/tresci/pl/zakwas-z-lodowki.md (ZAK-ZAL-012, ZAK-LOD-002) [M1-audytor-generalny-132; 06-tresci-502]
      advicePl:
        'Zakwas trzymany w lodówce dokarmia się raz w tygodniu. Przed pieczeniem dokarmiaj go co 12 godzin, aż w ciągu 6–8 godzin po dokarmieniu podwoi albo potroi objętość.',
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
      poziom: 'info',
      advicePl: 'W niższej temperaturze wzrost i fermentacja zakwasu zwalniają.',
    };
  }
  if (now <= w.end) {
    return {
      phase: 'peak',
      elapsedHours,
      labelPl: 'W szacowanym oknie szczytu',
      poziom: 'info',
      advicePl: 'Okno szczytu to tylko szacunek: każdy zakwas pracuje w swoim tempie, a ciasto może rosnąć od 0,1 do 1,5 mm na godzinę.',
    };
  }
  return {
    phase: 'after',
    elapsedHours,
    labelPl: 'Po szacowanym szczycie',
    poziom: 'info',
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
        'Warstwa płynu o zapachu alkoholu jest w porządku: to produkt uboczny pracy drożdży. Możesz ją zlać albo wmieszać. Jeśli widzisz też nalot lub przebarwienie albo czujesz zgniły zapach, zaznacz to powyżej.',
    };
  }

  return {
    status: 'no_observation',
    titlePl: 'Nie zaznaczono żadnego objawu',
    actionPl: 'Ocena pojawi się po zaznaczeniu tego, co widzisz albo czujesz.',
  };
}
