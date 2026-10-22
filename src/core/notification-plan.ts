// ============================================================================
// Piekarz — plan powiadomień jako czysta funkcja zapisanego stanu (ADR-006) [M1-audytor-generalny-006]
// Adapter (src/lib/notifications.ts) porównuje plan z listą oczekujących i kasuje albo planuje różnicę.
// Od D2 plan obejmuje wiele wypieków naraz: identyfikatory z id wypieku, nazwa wypieku w parametrach, start
// zaplanowanych i limit 40 z priorytetem [M3 D2; BR-KAL-009, BR-KAL-010, BR-KAL-016].
// ============================================================================

import { SessionStep, isDutchOvenStep } from './bake-steps';
import { DUTCH_OVEN_PHASES } from './baking-phases';
import { planFeedingNotifications } from './notification-feeding';
import {
  MAX_PENDING_NOTIFICATIONS,
  NOTIF_PREFIX,
  TIME_SENSITIVE_STEPS,
  notifBakePrefix,
} from './notification-config';

export { planFeedingNotifications };

export type NotificationKind = 'krok' | 'karmienie';
export type NotificationLevel = 'active' | 'timeSensitive';
export type NotificationTextKey =
  | 'krok.start'
  | 'krok.koniec'
  | 'krok.zdejmijPokrywke'
  | 'krok.wypiekGotowy'
  | 'karmienie.blat'
  | 'karmienie.lodowkaTermin'
  | 'karmienie.lodowkaDzien';

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

/** Cel dotknięcia: Stolnica wybranego wypieku (id), Stolnica bez id (powiadomienie sprzed D3a) albo Zakwasy. */
export type CelPowiadomienia = { pathname: '/stolnica'; params: { wypiek: string } } | TrasaPowiadomienia;

/**
 * Cel z danych dotkniętego powiadomienia (`unknown`): krok z id wypieku otwiera Stolnicę tego wypieku (BR-KAL-016
 * „Który krok czyj”); powiadomienie bez id (zaplanowane przed D3a) — Stolnicę jak dotąd [M3 D3a].
 */
export function celZPowiadomienia(data: unknown, identyfikator?: string): CelPowiadomienia | null {
  if (typeof data !== 'object' || data === null) return null;
  const trasa = trasaZPowiadomienia(Reflect.get(data, 'route'));
  const zDanych: unknown = Reflect.get(data, 'wypiek');
  // Powiadomienie zaplanowane przed D3a nie ma `wypiek` w danych, ale ma id wypieku w identyfikatorze (D2) [D3a-fix, P2-6]
  const zIdentyfikatora = identyfikator?.startsWith(NOTIF_WYPIEK) ? identyfikator.slice(NOTIF_WYPIEK.length).split('.')[0] : undefined;
  const wypiek = typeof zDanych === 'string' && zDanych !== '' ? zDanych : zIdentyfikatora;
  if (trasa === '/stolnica' && wypiek) return { pathname: '/stolnica', params: { wypiek } };
  return trasa;
}

/** Początek identyfikatorów powiadomień wypieku: `piekarz.wypiek.<id>.` (notifBakePrefix). */
const NOTIF_WYPIEK = `${NOTIF_PREFIX}wypiek.`;

export interface PlannedNotification {
  id: string;
  kind: NotificationKind;
  triggerAt: number;
  level: NotificationLevel;
  textKey: NotificationTextKey;
  params: Record<string, string>;
  route: TrasaPowiadomienia;
  /** Id wypieku (wiersz bake_sessions) powiadomienia kroku albo startu: dotknięcie otwiera ten wypiek [M3 D3a]. */
  wypiekId?: string;
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
  /** Stały dzień karmienia w lodówce: dzień ISO 1–7 i minuta doby lokalnej (BR-KAL-010); brak albo null = co 7 dni. */
  fridgeFeedDay?: { weekday: number; minuteOfDay: number } | null;
  /** Zakwas w trakcie zakładania ma początek, ale nie ma końca (RD-31): stałego dnia nie stosujemy. */
  setupStartedAt?: number;
  setupCompletedAt?: number;
  /** Ostatnie „Pomiń” zaległego karmienia (D-094): następny termin liczy się od tej chwili, gdy jest po dokarmieniu [M3 D4a]. */
  pominietoAt?: number;
}
export interface PlanBakeSession {
  /** Id wypieku (wiersz bake_sessions): z niego identyfikatory powiadomień; dwa wypieki nie nadpisują się. */
  id: string;
  /** Nazwa receptury; trafia do treści, gdy trwa więcej niż jeden wypiek (BR-KAL-016). */
  recipeName: string;
  /** Kroki sesji: nazwa i rodzaj kroku z planu, nie ze stałej listy [M1-audytor-generalny-030]; koniec z planu, gdy jest. */
  steps: readonly (Pick<SessionStep, 'id' | 'name' | 'category'> & Partial<Pick<SessionStep, 'plannedEnd'>>)[];
  stepIdx: number;
  dutchOvenPhase: 'lid_on' | 'lid_off';
  timerEndsAt: number | null;
}

/** Nazwa wypieku do parametrów powiadomienia, tylko gdy trwa ich więcej niż jeden (BR-KAL-016 Który krok czyj). */
const nazwaWypieku = (s: Pick<PlanBakeSession, 'recipeName'>, nazwij: boolean): Record<string, string> =>
  nazwij ? { recipeName: s.recipeName } : {};

/** Powiadomienie o końcu bieżącego kroku; brak, gdy zegar stoi albo termin minął. */
export function planBakeNotification(session: PlanBakeSession | null, now: number, nameBake = false): PlannedNotification | null {
  if (!session || session.timerEndsAt === null || session.timerEndsAt <= now) return null;
  const step = session.steps[session.stepIdx];
  if (!step) return null;
  const textKey: NotificationTextKey =
    isDutchOvenStep(step) ? (session.dutchOvenPhase === 'lid_on' ? 'krok.zdejmijPokrywke' : 'krok.wypiekGotowy') : 'krok.koniec';
  return {
    id: `${notifBakePrefix(session.id)}krok`,
    kind: 'krok',
    triggerAt: session.timerEndsAt,
    level: TIME_SENSITIVE_STEPS.includes(step.id) ? 'timeSensitive' : 'active',
    textKey,
    params: { stepId: step.id, stepName: step.name, ...parametryNastepnego(session.steps, session.stepIdx), ...nazwaWypieku(session, nameBake) },
    route: '/stolnica',
    wypiekId: session.id,
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
 * Identyfikatory: `piekarz.wypiek.<id wypieku>.krok[.<i>[.pokrywka]]` i `.start` [M3 D2].
 */
export function planBakeStepNotifications(session: PlanBakeSessionWithPlan | null, now: number, nameBake = false): PlannedNotification[] {
  if (!session) return [];
  const prefix = notifBakePrefix(session.id);
  const nazwa = nazwaWypieku(session, nameBake);
  const current = planBakeNotification(session, now, nameBake);
  const out: PlannedNotification[] = current ? [current] : [];
  // Wypiek zaczęty przed godziną startu planu: powiadomienie o starcie kroku 1 [audyt-niezalezny D-5]
  const pierwszy = session.steps[0];
  if (session.stepIdx === 0 && pierwszy && pierwszy.plannedStart !== null && pierwszy.plannedStart > now) {
    out.push({
      id: `${prefix}start`, kind: 'krok', triggerAt: pierwszy.plannedStart, level: 'active', textKey: 'krok.start',
      params: { stepId: pierwszy.id, stepName: pierwszy.name, ...(pierwszy.plannedEnd !== null ? { stepEnd: String(pierwszy.plannedEnd) } : {}), ...nazwa },
      route: '/stolnica',
      wypiekId: session.id,
    });
  }
  session.steps.forEach((step, i) => {
    if (i <= session.stepIdx || step.plannedEnd === null) return;
    const oven = isDutchOvenStep(step);
    if (!oven && step.durationMin === null) return;
    const level: NotificationLevel = TIME_SENSITIVE_STEPS.includes(step.id) ? 'timeSensitive' : 'active';
    const params = { stepId: step.id, stepName: step.name, ...nazwa };
    const base = { kind: 'krok' as const, level, params, route: '/stolnica' as const, wypiekId: session.id };
    const lidAt = oven && step.plannedStart !== null ? step.plannedStart + DUTCH_OVEN_PHASES.lid_on.durationMin * 60_000 : null;
    if (lidAt !== null && lidAt > now) out.push({ ...base, id: `${prefix}krok.${i}.pokrywka`, triggerAt: lidAt, textKey: 'krok.zdejmijPokrywke' });
    if (step.plannedEnd > now) {
      out.push({
        ...base, id: `${prefix}krok.${i}`, triggerAt: step.plannedEnd, textKey: oven ? 'krok.wypiekGotowy' : 'krok.koniec',
        params: { ...params, ...parametryNastepnego(session.steps, i) },
      });
    }
  });
  return out;
}

/** Wypiek zaplanowany na później (wiersz `planned`): pierwszy krok planu z godziną startu. */
export interface PlanPlannedBake {
  id: string;
  recipeName: string;
  plannedStartAt: number;
  steps: readonly Pick<SessionStep, 'id' | 'name' | 'plannedStart' | 'plannedEnd'>[];
}

/**
 * Powiadomienie o starcie pierwszego kroku zaplanowanego wypieku, z nazwą receptury (BR-KAL-009): te same zdania co
 * „czas zacząć” po kroku 1. Godzina z kroku 1 planu, a bez niej `plannedStartAt`; plan bez kroków i start, który minął, pomijamy.
 */
export function planPlannedStartNotifications(planned: readonly PlanPlannedBake[], now: number): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  for (const p of planned) {
    const pierwszy = p.steps[0];
    if (!pierwszy) continue;
    const startAt = pierwszy.plannedStart ?? p.plannedStartAt;
    if (startAt <= now) continue;
    out.push({
      id: `${notifBakePrefix(p.id)}start`, kind: 'krok', triggerAt: startAt, level: 'active', textKey: 'krok.start',
      params: { stepId: pierwszy.id, stepName: pierwszy.name, ...(pierwszy.plannedEnd !== null ? { stepEnd: String(pierwszy.plannedEnd) } : {}), recipeName: p.recipeName },
      route: '/stolnica',
      wypiekId: p.id,
    });
  }
  return out;
}

/**
 * Pełna lista powiadomień, które powinny czekać, najwyżej MAX_PENDING_NOTIFICATIONS [M1-audytor-generalny-102; M3 D2].
 * Przy nadmiarze zostają: najbliższe kroki trwających wypieków (obu), potem starty zaplanowanych, potem karmienia; w każdej
 * grupie wcześniejszy termin przed późniejszym. Reszta wraca przy uzgadnianiu po otwarciu aplikacji. Nazwa wypieku
 * w treści, gdy trwa więcej niż jeden (BR-KAL-016).
 */
export function planNotifications(
  input: { sessions: readonly PlanBakeSessionWithPlan[]; planned?: readonly PlanPlannedBake[]; starters: readonly PlanStarter[] },
  now: number
): PlannedNotification[] {
  const nameBake = input.sessions.length > 1;
  const grupy: PlannedNotification[][] = [
    input.sessions.flatMap((s) => planBakeStepNotifications(s, now, nameBake)),
    planPlannedStartNotifications(input.planned ?? [], now),
    planFeedingNotifications(input.starters, now),
  ];
  return grupy
    .flatMap((lista, grupa) => lista.map((p) => ({ p, grupa })))
    .sort((a, b) => a.grupa - b.grupa || a.p.triggerAt - b.p.triggerAt)
    .slice(0, MAX_PENDING_NOTIFICATIONS)
    .map((x) => x.p)
    .sort((a, b) => a.triggerAt - b.triggerAt);
}

/**
 * Identyfikator powiadomienia kroku zaplanowanego przez wersję 1014 (bez id wypieku): `piekarz.krok`, `piekarz.krok.<i>`,
 * `piekarz.krok.<i>.pokrywka`, `piekarz.krok.start`. Po aktualizacji uzgadnianie je kasuje i planuje nowe [M3 D2].
 */
export function isLegacyBakeNotificationId(id: string): boolean {
  return /^piekarz\.krok(\.|$)/.test(id);
}

/**
 * Odcisk zawiera język treści: tekst powstaje przy planowaniu, więc po zmianie języka
 * oczekujące planujemy na nowo [M1-audytor-generalny-136; 09-lokalizacja-503].
 */
export function notificationFingerprint(p: PlannedNotification, lang = ''): string {
  // Id wypieku w odcisku: oczekujące sprzed D3a (bez `wypiek` w danych) planujemy na nowo z nim [M3 D3a-fix, P2-6]
  return `${p.triggerAt}|${p.level}|${p.textKey}|${JSON.stringify(p.params)}|${lang}${p.wypiekId ? `|${p.wypiekId}` : ''}`;
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
