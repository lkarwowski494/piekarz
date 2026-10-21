// ============================================================================
// Piekarz — godzina „gotowe” trwającego wypieku, jedna dla prowadzenia (tekst pod „Krok n z N”), etykiety
// VoiceOver Spirali i karty „Trwa wypiek” na Starcie [reaudit-noc N-4; M1-audytor-generalny-151; 08-programista-504].
// ============================================================================

import { stepHasTimer } from '../core/bake-session';
import type { SessionStep } from '../core/bake-steps';

export interface WejscieGotowe {
  steps: readonly SessionStep[];
  stepIdx: number;
  /** Koniec zegara bieżącego kroku (ms), także po jego upływie; null = zegar nie biegnie albo krok bez zegara. */
  koniecKrokuMs: number | null;
  teraz: number;
}

/**
 * Koniec planu (ms) albo null, gdy plan nie ma godzin. Krok po czasie: następny rusza od „Zrobione” (BR-HARMO-005),
 * więc gotowe = teraz + pozostała długość planu (od planowanego końca kroku do końca planu), nigdy wcześniej niż plan.
 */
export function gotoweMs(w: WejscieGotowe): number | null {
  const koniecPlanu = w.steps[w.steps.length - 1]?.plannedEnd ?? null;
  const krok = w.steps[w.stepIdx];
  const zegar = krok && stepHasTimer(krok) ? w.koniecKrokuMs : null;
  const poCzasie = zegar !== null && zegar <= w.teraz;
  return koniecPlanu !== null && poCzasie && krok?.plannedEnd != null
    ? Math.max(koniecPlanu, w.teraz + (koniecPlanu - krok.plannedEnd))
    : koniecPlanu;
}
