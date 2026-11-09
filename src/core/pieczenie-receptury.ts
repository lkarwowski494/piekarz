// ============================================================================
// Piekarz — pieczenie z danych receptury w planie wypieku (D-304, DEC-03 a) [M1-audytor-generalny-008; 06-tresci-001]
// Czyste funkcje. Kroki „preheat_oven” i „bake” planu biorą czas pieczenia i naczynie z receptury; teksty dosłownie
// z docs/tresci/pl/pieczenie-receptur.md. Migawka kroku w sesji niesie tekst jako klucz PL dla t(), więc tekst jest
// literałem profilu naczynia, a tests/pieczenie-receptur-008.test.ts pilnuje, że liczby w tekście = dane receptury.
// ============================================================================

import type { RecipePreset } from '../recipes/presets-types';

/** Pieczenie receptury: naczynie, temperatury (°C) i czasy (min) obu faz z danych receptury. */
export interface PieczenieReceptury {
  naczynie: RecipePreset['recommendedVessel'];
  tempParaC: number;
  tempRumienienieC: number;
  minPara: number;
  minRumienienie: number;
  /** Kroki planu z treści brioszki (D-309), tylko dla receptury brioszki — nie dla każdej keksówki [M2-012]. */
  szablon?: 'brioszka';
  /**
   * Keksówka i stal: tekst nagrzewania i pieczenia z liczbami ze źródła tylko dla receptur wektora D-304 (brioszka,
   * durum); brak = tekst bez liczb z odesłaniem do „O recepturze” (żytnie z żytem ≤ 50%, łotewska) [M1-audytor-generalny-088].
   */
  tekstZrodla?: boolean;
}

type PolaPieczenia = 'recommendedVessel' | 'bakeTempSteamC' | 'bakeTempBrowningC' | 'bakeTimeSteamMinutes' | 'bakeTimeBrowningMinutes';

export function pieczenieZReceptury(r: Pick<RecipePreset, PolaPieczenia>): PieczenieReceptury {
  return {
    naczynie: r.recommendedVessel,
    tempParaC: r.bakeTempSteamC,
    tempRumienienieC: r.bakeTempBrowningC,
    minPara: r.bakeTimeSteamMinutes,
    minRumienienie: r.bakeTimeBrowningMinutes,
  };
}

/**
 * Plan bez receptury (albo receptury bez danych pieczenia): bochenek w garnku według PIE-GAR-001 — 232 °C, 20 min pod
 * pokrywką i 25 min bez (górna granica 20–25 min źródła, ten sam łączny czas co dotychczasowy szablon).
 */
export const PIECZENIE_DOMYSLNE: PieczenieReceptury = { naczynie: 'dutch_oven', tempParaC: 232, tempRumienienieC: 232, minPara: 20, minRumienienie: 25 };

/** Krok planu z pieczenia: id, nazwa i instrukcja (klucze PL), czas w minutach. */
export interface KrokPieczenia {
  id: string;
  namePl: string;
  durationMinutes: number;
  instructionsPl: string;
}

/** Id kroku pieczenia poza garnkiem (keksówka, stal): bez zegara dwóch faz garnka (isDutchOvenStep). */
export const ID_PIECZENIA_BEZ_GARNKA: readonly string[] = ['bake_forma', 'bake_stal'];

/**
 * Nagrzewanie: garnek 45 min w 260 °C (PIE-GAR-001); keksówka i stal bez czasu w źródle — 45 min to rezerwa planu
 * bez liczby w tekście (PIE-BRI-900, jak DRO-PLN-900).
 */
const NAGRZEWANIE_MIN = 45;

/**
 * Kroki nagrzewania i pieczenia dla naczynia receptury. Id pieczenia poza garnkiem (`bake_forma`, `bake_stal`) wyłącza
 * zegar dwóch faz garnka (isDutchOvenStep): fazy garnka tylko przy `dutch_oven` (D-304). Inne naczynie niż keksówka
 * i stal: profil garnka (receptury na zakwasie z planem pieką dziś tylko w tych trzech naczyniach).
 */
export function krokiPieczenia(p: PieczenieReceptury): { nagrzewanie: KrokPieczenia; pieczenie: KrokPieczenia } {
  const czas = p.minPara + p.minRumienienie;
  // Keksówka albo stal bez tekstu ze źródła: krok bez liczb, temperatura i czas w „O recepturze” (06-tresci-601, opcja a)
  if ((p.naczynie === 'bread_pan' || p.naczynie === 'baking_steel') && !p.tekstZrodla) {
    return {
      nagrzewanie: { id: 'preheat_oven', namePl: 'Nagrzewanie piekarnika', durationMinutes: NAGRZEWANIE_MIN, instructionsPl: 'Nagrzej piekarnik do temperatury pieczenia podanej w „O recepturze”.' },
      pieczenie: {
        id: p.naczynie === 'bread_pan' ? 'bake_forma' : 'bake_stal', namePl: 'Pieczenie', durationMinutes: czas,
        instructionsPl: 'Piecz w temperaturze i przez czas podane w „O recepturze”.',
      },
    };
  }
  if (p.naczynie === 'bread_pan') {
    return {
      nagrzewanie: {
        id: 'preheat_oven', namePl: 'Nagrzewanie piekarnika', durationMinutes: NAGRZEWANIE_MIN,
        instructionsPl: 'Nagrzej piekarnik do 204 °C, a przed włożeniem keksówki obniż temperaturę do 177 °C.',
      },
      pieczenie: {
        id: 'bake_forma', namePl: 'Pieczenie', durationMinutes: czas,
        instructionsPl: 'Posmaruj brioszkę roztrzepanym jajkiem i piecz 20 minut, potem obróć keksówkę i piecz jeszcze 8–10 minut, aż brioszka będzie złotobrązowa. Od razu wyjmij brioszkę z keksówki na kratkę.',
      },
    };
  }
  if (p.naczynie === 'baking_steel') {
    return {
      nagrzewanie: { id: 'preheat_oven', namePl: 'Nagrzewanie piekarnika', durationMinutes: NAGRZEWANIE_MIN, instructionsPl: 'Nagrzej piekarnik ze stalą do 250 °C.' },
      pieczenie: { id: 'bake_stal', namePl: 'Pieczenie', durationMinutes: czas, instructionsPl: 'Piecz w 250 °C.' },
    };
  }
  return {
    nagrzewanie: {
      id: 'preheat_oven', namePl: 'Nagrzewanie piekarnika i garnka', durationMinutes: NAGRZEWANIE_MIN,
      instructionsPl: 'Wstaw garnek do piekarnika i nagrzewaj go 45 minut w 260 °C.',
    },
    pieczenie: {
      id: 'bake', namePl: 'Wypiek z parą i rumienienie', durationMinutes: czas,
      instructionsPl: 'Przełóż bochenek na papier do pieczenia i natnij go, trzymając ostrze pod kątem około 30° do powierzchni ciasta. Na papierze przenieś bochenek do garnka, przykryj pokrywką i od razu obniż temperaturę do 232 °C. Piecz 20 minut pod pokrywką, potem 20–25 minut bez pokrywki, aż skórka będzie głęboko złotobrązowa.',
    },
  };
}
