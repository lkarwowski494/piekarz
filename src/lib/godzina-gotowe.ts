// ============================================================================
// Piekarz — zmiana godziny „gotowe” w planie przyciskami ±30 min i ±2 h (TargetReadyCard, ekran planu)
// [M1-audytor-generalny-128; 04-studio-projektowe-008; weryfikacja W N1]
// ============================================================================

import { ZASIEG_DNI_PLANU } from '../core/kalendarz-config';

export interface CelGotowe {
  dayOffset: number;
  hour: number;
  minute: number;
}

const DOBA_MIN = 24 * 60;
/** Krok, który dochodzi do pełnej albo połówkowej godziny w swoim kierunku (np. 23:50 → 00:00 albo 23:30) (128). */
const KROK_ZAOKRAGLANY_MIN = 30;

/**
 * Nowa godzina „gotowe” po zmianie o `deltaMin` minut. ±30 min dochodzi do pełnej albo połówkowej godziny, inny krok
 * (±2 h) dodaje się wprost (10:30 → 12:30, nie 12:00; N1). Przejście przez północ zmienia dzień. Wynik poza dniami planu
 * (0 = dziś … ZASIEG_DNI_PLANU, D-108; te same dni co chipy dnia) to `null`: przycisk nieaktywny, godzina bez zmian.
 */
export function przesunGotowe(cel: CelGotowe, deltaMin: number, zasiegDni: number = ZASIEG_DNI_PLANU): CelGotowe | null {
  const teraz = cel.hour * 60 + cel.minute;
  const krok = Math.abs(deltaMin);
  const zaokraglaj = krok === KROK_ZAOKRAGLANY_MIN;
  const total = !zaokraglaj
    ? teraz + deltaMin
    : deltaMin > 0
      ? Math.floor(teraz / krok) * krok + krok
      : Math.ceil(teraz / krok) * krok - krok;
  const dni = Math.floor(total / DOBA_MIN);
  const wDobie = total - dni * DOBA_MIN;
  const dayOffset = cel.dayOffset + dni;
  if (dayOffset < 0 || dayOffset > zasiegDni) return null;
  return { dayOffset, hour: Math.floor(wDobie / 60), minute: wDobie % 60 };
}
