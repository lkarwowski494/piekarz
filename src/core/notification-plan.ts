// ============================================================================
// Piekarz — plan powiadomień jako czysta funkcja zapisanego stanu (ADR-006) [M1-audytor-generalny-006]
// Adapter (src/lib/notifications.ts) porównuje plan z listą oczekujących i kasuje albo planuje różnicę.
// ============================================================================

import { SessionStep, isDutchOvenStep } from './bake-steps';
import { DUTCH_OVEN_PHASES } from './baking-phases';
import {
  NOTIF_PREFIX,
  NOTIF_ID_BAKE,
  FEED_ROOM_TEMP_AFTER_MS,
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
  /** Kroki sesji: nazwa i rodzaj kroku z planu, nie ze stałej listy [M1-audytor-generalny-030]; koniec z planu, gdy jest. */
  steps: readonly (Pick<SessionStep, 'id' | 'name' | 'category'> & Partial<Pick<SessionStep, 'plannedEnd'>>)[];
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
    params: { stepId: step.id, stepName: step.name, ...parametryNastepnego(session.steps, session.stepIdx) },
    route: '/stolnica',
  };
}

/**
 * Następny krok do powiadomienia o końcu kroku: nazwa i planowany koniec (ms jako tekst), gdy są
 * (BR-CZAS-002: „powiadomienie z nazwą następnego kroku”; design-spec §10) [M1-audytor-generalny-130].
 */
function parametryNastepnego(steps: PlanBakeSession['steps'], i: number): Record<string, string> {
  const nast = steps[i + 1];
  if (!nast) return {};
  return { nextName: nast.name, ...(nast.plannedEnd != null ? { nextEnd: String(nast.plannedEnd) } : {}) };
}

export interface PlanBakeSessionWithPlan extends Omit<PlanBakeSession, 'steps'> {
  steps: readonly Pick<SessionStep, 'id' | 'name' | 'category' | 'durationMin' | 'plannedStart' | 'plannedEnd'>[];
}

/**
 * Powiadomienia bieżącego i kolejnych kroków (BR-HARMO-005, BR-CZAS-002) [M1-audytor-generalny-102]: bieżący jak
 * planBakeNotification, kolejne na planowany koniec (krok w garnku także zdjęcie pokrywki po fazie 1); krok bez
 * planu godzin albo bez czasu i terminy minione pominięte. Po potwierdzeniu kroku (confirmStep) godziny idą za planem.
 */
export function planBakeStepNotifications(session: PlanBakeSessionWithPlan | null, now: number): PlannedNotification[] {
  if (!session) return [];
  const current = planBakeNotification(session, now);
  const out: PlannedNotification[] = current ? [current] : [];
  session.steps.forEach((step, i) => {
    if (i <= session.stepIdx || step.plannedEnd === null) return;
    const oven = isDutchOvenStep(step);
    if (!oven && step.durationMin === null) return;
    const level: NotificationLevel = TIME_SENSITIVE_STEPS.includes(step.id) ? 'timeSensitive' : 'active';
    const params = { stepId: step.id, stepName: step.name };
    const base = { kind: 'krok' as const, level, params, route: '/stolnica' as const };
    const lidAt = oven && step.plannedStart !== null ? step.plannedStart + DUTCH_OVEN_PHASES.lid_on.durationMin * 60_000 : null;
    if (lidAt !== null && lidAt > now) out.push({ ...base, id: `${NOTIF_PREFIX}krok.${i}.pokrywka`, triggerAt: lidAt, textKey: 'krok.zdejmijPokrywke' });
    if (step.plannedEnd > now) {
      out.push({
        ...base, id: `${NOTIF_PREFIX}krok.${i}`, triggerAt: step.plannedEnd, textKey: oven ? 'krok.wypiekGotowy' : 'krok.koniec',
        params: { ...params, ...parametryNastepnego(session.steps, i) },
      });
    }
  });
  return out;
}

/**
 * Przypomnienia o karmieniu: jedno na cykl karmienia (DEC-22 a) [M1-audytor-generalny-179; 11-wzrost-503] —
 * blat +12 h, lodówka termin +7 d; minione terminy pominięte.
 */
export function planFeedingNotifications(starters: readonly PlanStarter[], now: number): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  for (const s of starters) {
    if (s.lastFedAt === undefined) continue;
    const [textKey, triggerAt]: [NotificationTextKey, number] =
      s.storageState === 'ROOM_TEMP'
        ? ['karmienie.blat', s.lastFedAt + FEED_ROOM_TEMP_AFTER_MS]
        : ['karmienie.lodowkaTermin', s.lastFedAt + FEED_FRIDGE_DUE_AFTER_MS];
    if (triggerAt <= now) continue;
    out.push({
      id: `${NOTIF_PREFIX}karmienie.${s.id}.1`,
      kind: 'karmienie',
      triggerAt,
      level: 'active',
      textKey,
      params: { starterName: s.name },
      route: '/zakwasy',
    });
  }
  return out;
}

/**
 * Pełna lista powiadomień, które powinny czekać: kroki wypieku (bieżący i kolejne z planu, BR-HARMO-005)
 * zawsze zostają, reszta po czasie do limitu [M1-audytor-generalny-102].
 */
export function planNotifications(
  input: { session: PlanBakeSessionWithPlan | null; starters: readonly PlanStarter[] },
  now: number
): PlannedNotification[] {
  const bake = planBakeStepNotifications(input.session, now);
  const feeding = planFeedingNotifications(input.starters, now).sort((a, b) => a.triggerAt - b.triggerAt);
  const room = MAX_PENDING_NOTIFICATIONS - bake.length;
  return [...bake, ...feeding.slice(0, Math.max(0, room))].sort((a, b) => a.triggerAt - b.triggerAt);
}

/**
 * Odcisk zawiera język treści: tekst powstaje przy planowaniu, więc po zmianie języka
 * oczekujące planujemy na nowo [M1-audytor-generalny-136; 09-lokalizacja-503].
 */
export function notificationFingerprint(p: PlannedNotification, lang = ''): string {
  return `${p.triggerAt}|${p.level}|${p.textKey}|${JSON.stringify(p.params)}|${lang}`;
}

/** Różnica między oczekującymi a planem; obcych identyfikatorów (bez prefiksu) nie dotyka. */
export function diffNotifications(
  pending: readonly PendingNotification[],
  desired: readonly PlannedNotification[],
  lang = ''
): { cancel: string[]; schedule: PlannedNotification[] } {
  const ours = pending.filter((p) => p.id.startsWith(NOTIF_PREFIX));
  const wanted = new Map(desired.map((d) => [d.id, d]));
  const cancel = ours.filter((p) => !wanted.has(p.id)).map((p) => p.id);
  const have = new Map(ours.map((p) => [p.id, p.fingerprint]));
  const schedule = desired.filter((d) => have.get(d.id) !== notificationFingerprint(d, lang));
  return { cancel, schedule };
}
