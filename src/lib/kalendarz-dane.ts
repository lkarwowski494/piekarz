// ============================================================================
// Piekarz — dane kalendarza z bazy (cienka warstwa nad zdarzeniaKalendarza; BR-KAL-002, BR-KAL-006, BR-KAL-007) [M3 D4a]
// Tylko odczyt: trwające i zaplanowane wypieki (bake_sessions), zakwasy z wpisami, Dziennik, pominięcia i dostęp.
// ============================================================================

import type { DaneKalendarza } from '../core/kalendarz-zdarzenia';
import { idSesji, zaczetyZDostepem } from '../data/bake-session-store';
import { loadActiveBakeSessions, loadPlannedBakes } from '../data/bake-sessions-store';
import { collectBackupData } from '../data/sqlite-store';
import { wczytajPominiecia } from '../data/pominiecia-store';
import { pobierzStan } from './platnosci/stan';
import { przypomnieniaZDostepem } from './notifications';
import { czyPrzypomnieniaKarmienia } from './przypomnienia-karmienia';

/**
 * Dane kalendarza do zdarzeniaKalendarza; niczego nie zapisuje. Terminy karmienia tak jak plan powiadomień (przełącznik
 * przypomnień; w Basic tylko zakładanie, D-113). Kroki trwających wypieków i zapisane plany zawsze: widok kalendarza
 * jest w Basic, a plan zapisany z Pro da się zacząć bez niego (kontrakt Basic/Pro, D-116); nowe plany tworzy tylko Pro.
 */
export async function wczytajDaneKalendarza(now: number): Promise<DaneKalendarza> {
  const [sesje, zaplanowane, kopia, pominiecia, przypomnienia] = await Promise.all([
    loadActiveBakeSessions(),
    loadPlannedBakes(),
    collectBackupData(),
    wczytajPominiecia(now),
    czyPrzypomnieniaKarmienia(),
  ]);
  const pro = przypomnieniaZDostepem(pobierzStan());
  return {
    wypieki: sesje.map((s) => ({
      id: idSesji(s),
      recipeName: s.recipeName,
      steps: s.steps,
      stepIdx: s.stepIdx,
      timerEndsAt: s.timerEndsAt,
      pausedLeftSec: s.pausedLeftSec,
      zaczetyZDostepem: zaczetyZDostepem(s.bake),
      ...(s.bake?.starterId ? { starterId: s.bake.starterId } : {}),
    })),
    // Zakwas planu: kolejne karmienie budzące z lodówki (RD-33) [M3 D5]
    zaplanowane: zaplanowane.map((p) => ({ id: p.id, recipeName: p.recipeName, steps: p.steps, ...(p.bake?.starterId ? { starterId: p.bake.starterId } : {}) })),
    zakwasy: kopia.starters,
    wpisyZakwasow: kopia.starterEntries ?? [],
    dziennik: kopia.bakes,
    pominiecia,
    dostep: { terminyKarmienia: przypomnienia, przyszleWypieki: true, karmieniePro: pro },
  };
}
