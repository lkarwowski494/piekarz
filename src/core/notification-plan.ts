// ============================================================================
// Piekarz — plan powiadomień jako czysta funkcja zapisanego stanu (ADR-006) [M1-audytor-generalny-006]
// Adapter (src/lib/notifications.ts) porównuje plan z listą oczekujących i kasuje albo planuje różnicę.
// ============================================================================

import { SessionStep, isDutchOvenStep } from './bake-steps';
import {
  NOTIF_PREFIX,
  NOTIF_ID_BAKE,
  FEED_ROOM_TEMP_AFTER_MS,
  FEED_FRIDGE_REMIND_AFTER_MS,
  FEED_FRIDGE_DUE_AFTER_MS,
  MAX_PENDING_NOTIFICATIONS,
  TIME_SENSITIVE_STEPS,
} from './notification-config';

export type NotificationKind = 'krok' | 'karmienie';
export type NotificationLevel = 'active' | 'timeSensitive';
export type NotificationTextKey =
  | 'krok.koniec'
  | 'krok.zdejmijPokrywke'
  | 'krok.wypiekGotowy'
  | 'karmienie.blat'
  | 'karmienie.lodowkaPrzypomnienie'
  | 'karmienie.lodowkaTermin';

/** Ekran otwierany z powiadomienia: prowadzenie wypieku (bieżący krok, F-58) albo zakładka Zakwasy (D-051 2a). */
export type TrasaPowiadomienia = '/stolnica' | '/zakwasy';

/**
 * Trasa z danych dotkniętego powiadomienia (dane z zewnątrz, `unknown`). Powiadomienia zaplanowane przez wersję
 * sprzed 4 zakładek niosą '/stolnica' i '/zakwasy' — prowadzą w te same miejsca; inna wartość → null.
 * [M1-audytor-generalny-101]
 */
export function trasaZPowiadomienia(v: unknown): TrasaPowiadomienia | null {
  if (v === '/stolnica' || v === '/(tabs)/stolnica') return '/stolnica';
  if (v === '/zakwasy' || v === '/(tabs)/zakwas') return '/zakwasy';
  return null;
}
export interface PlannedNotification {
  id: string;
  kind: NotificationKind;
  triggerAt: number;
  level: NotificationLevel;
  textKey: NotificationTextKey;
  params: Record<string, string>;
  route: TrasaPowiadomienia;
}
export interface PendingNotification {
  id: string;
  fingerprint: string | null;
}
export interface PlanStarter {
  id: string;
  name: string;
  storageState: 'ROOM_TEMP' | 'FRIDGE';
  lastFedAt?: number;
}
export interface PlanBakeSession {
  /** Kroki sesji: nazwa i rodzaj kroku z planu, nie ze stałej listy [M1-audytor-generalny-030]. */
  steps: readonly Pick<SessionStep, 'id' | 'name' | 'category'>[];
  stepIdx: number;
  dutchOvenPhase: 'lid_on' | 'lid_off';
  timerEndsAt: number | null;
}

/** Powiadomienie o końcu bieżącego kroku; brak, gdy zegar stoi albo termin minął. */
export function planBakeNotification(session: PlanBakeSession | null, now: number): PlannedNotification | null {
  if (!session || session.timerEndsAt === null || session.timerEndsAt <= now) return null;
  const step = session.steps[session.stepIdx];
  if (!step) return null;
  const textKey: NotificationTextKey =
    isDutchOvenStep(step) ? (session.dutchOvenPhase === 'lid_on' ? 'krok.zdejmijPokrywke' : 'krok.wypiekGotowy') : 'krok.koniec';
  return {
    id: NOTIF_ID_BAKE,
    kind: 'krok',
    triggerAt: session.timerEndsAt,
    level: TIME_SENSITIVE_STEPS.includes(step.id) ? 'timeSensitive' : 'active',
    textKey,
    params: { stepId: step.id, stepName: step.name },
    route: '/stolnica',
  };
}

/** Przypomnienia o karmieniu: blat +24 h; lodówka +6 d i +7 d; minione terminy pominięte. */
export function planFeedingNotifications(starters: readonly PlanStarter[], now: number): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  for (const s of starters) {
    if (s.lastFedAt === undefined) continue;
    const plan: Array<[number, NotificationTextKey, number]> =
      s.storageState === 'ROOM_TEMP'
        ? [[1, 'karmienie.blat', s.lastFedAt + FEED_ROOM_TEMP_AFTER_MS]]
        : [
            [1, 'karmienie.lodowkaPrzypomnienie', s.lastFedAt + FEED_FRIDGE_REMIND_AFTER_MS],
            [2, 'karmienie.lodowkaTermin', s.lastFedAt + FEED_FRIDGE_DUE_AFTER_MS],
          ];
    for (const [n, textKey, triggerAt] of plan) {
      if (triggerAt <= now) continue;
      out.push({
        id: `${NOTIF_PREFIX}karmienie.${s.id}.${n}`,
        kind: 'karmienie',
        triggerAt,
        level: 'active',
        textKey,
        params: { starterName: s.name },
        route: '/zakwasy',
      });
    }
  }
  return out;
}

/** Pełna lista powiadomień, które powinny czekać: krok zawsze zostaje, reszta po czasie do limitu. */
export function planNotifications(
  input: { session: PlanBakeSession | null; starters: readonly PlanStarter[] },
  now: number
): PlannedNotification[] {
  const bake = planBakeNotification(input.session, now);
  const feeding = planFeedingNotifications(input.starters, now).sort((a, b) => a.triggerAt - b.triggerAt);
  const room = MAX_PENDING_NOTIFICATIONS - (bake ? 1 : 0);
  return [...(bake ? [bake] : []), ...feeding.slice(0, Math.max(0, room))].sort((a, b) => a.triggerAt - b.triggerAt);
}

export function notificationFingerprint(p: PlannedNotification): string {
  return `${p.triggerAt}|${p.level}|${p.textKey}|${JSON.stringify(p.params)}`;
}

/** Różnica między oczekującymi a planem; obcych identyfikatorów (bez prefiksu) nie dotyka. */
export function diffNotifications(
  pending: readonly PendingNotification[],
  desired: readonly PlannedNotification[]
): { cancel: string[]; schedule: PlannedNotification[] } {
  const ours = pending.filter((p) => p.id.startsWith(NOTIF_PREFIX));
  const wanted = new Map(desired.map((d) => [d.id, d]));
  const cancel = ours.filter((p) => !wanted.has(p.id)).map((p) => p.id);
  const have = new Map(ours.map((p) => [p.id, p.fingerprint]));
  const schedule = desired.filter((d) => have.get(d.id) !== notificationFingerprint(d));
  return { cancel, schedule };
}
