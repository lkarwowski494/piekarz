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
 * Dane kalendarza do zdarzeniaKalendarza; niczego nie zapisuje. Terminy karmienia tak jak plan powiadomień (dostęp
 * i przełącznik przypomnień, BR-KAL-006 „Bez terminów karmienia”), przyszłe wypieki tylko z dostępem albo dla wypieku
 * zaczętego z dostępem (D-039 pkt 3).
 */
export async function wczytajDaneKalendarza(now: number): Promise<DaneKalendarza> {
  const [sesje, zaplanowane, kopia, pominiecia, przypomnienia] = await Promise.all([
    loadActiveBakeSessions(),
    loadPlannedBakes(),
    collectBackupData(),
    wczytajPominiecia(now),
    czyPrzypomnieniaKarmienia(),
  ]);
  const dostep = przypomnieniaZDostepem(pobierzStan());
  return {
    wypieki: sesje.map((s) => ({
      id: idSesji(s),
      recipeName: s.recipeName,
      steps: s.steps,
      stepIdx: s.stepIdx,
      timerEndsAt: s.timerEndsAt,
      pausedLeftSec: s.pausedLeftSec,
      zaczetyZDostepem: zaczetyZDostepem(s.bake),
    })),
    zaplanowane: zaplanowane.map((p) => ({ id: p.id, recipeName: p.recipeName, steps: p.steps })),
    zakwasy: kopia.starters,
    wpisyZakwasow: kopia.starterEntries ?? [],
    dziennik: kopia.bakes,
    pominiecia,
    dostep: { terminyKarmienia: dostep && przypomnienia, przyszleWypieki: dostep },
  };
}
