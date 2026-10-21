// ============================================================================
// Piekarz — zakwas planu wypieku (BR-ZAKW-006, D-052) [M1-audytor-generalny-104]
// Plan wypieku nie ma własnego wyboru zakwasu (makiety: brak); bierze zakwas wybrany na zakładce Zakwasy,
// a bez wyboru pierwszy z listy — tak samo jak domyślny zakwas na zakładce Zakwasy.
// ============================================================================

import type { StoredStarter } from '../data/db';
import type { SessionStep } from '../core/bake-steps';
import type { ScheduledStage } from '../scheduler/reverse-scheduler';

let wybranyId: string | null = null;

/** Zapamiętuje zakwas wybrany na zakładce Zakwasy (null = brak wyboru). */
export function ustawZakwasPlanu(id: string | null): void {
  wybranyId = id;
}

/** Zakwas do planu: wybrany, jeśli jest na liście; inaczej pierwszy; pusta lista = null. */
export function zakwasPlanu(lista: readonly StoredStarter[]): StoredStarter | null {
  return lista.find((s) => s.id === wybranyId) ?? lista[0] ?? null;
}

/**
 * Etapy do osi czasu planu z kroków planu (po withFridgeWake): etap z harmonogramu, gdy krok z niego pochodzi;
 * krok dokarmienia z lodówki dostaje etap z własnymi godzinami. Krok bez godzin pominięty (plan zawsze je ma).
 */
export function etapyPlanu(steps: readonly SessionStep[], stages: readonly ScheduledStage[]): ScheduledStage[] {
  const out: ScheduledStage[] = [];
  for (const s of steps) {
    const etap = stages.find((st) => st.id === s.id);
    if (etap) out.push(etap);
    else if (s.plannedStart !== null && s.plannedEnd !== null) {
      out.push({
        id: s.id,
        namePl: s.name,
        category: s.category,
        startTime: new Date(s.plannedStart),
        endTime: new Date(s.plannedEnd),
        durationMinutes: s.durationMin ?? Math.round((s.plannedEnd - s.plannedStart) / 60_000),
        isPassive: s.isPassive,
        ...(s.rekaNaStarcie ? { rekaNaStarcie: true } : {}),
        isSleepCollision: false,
        instructionsPl: s.instructions,
      });
    }
  }
  return out;
}
