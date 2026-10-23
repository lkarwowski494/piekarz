// ============================================================================
// Piekarz — przypomnienia o karmieniu zakwasu: blat, lodówka co 7 dni i stały dzień karmienia (ADR-006) [M3 D2]
// Czyste funkcje: czas jako argument (ms UTC), dzień i godzina w strefie urządzenia (src/core/dzien-lokalny.ts, DST).
// terminKarmienia to jedna reguła terminu dla powiadomień i kalendarza (BR-KAL-002 „Ten sam termin”) [M3 D4a].
// ============================================================================

import { addCalendarDays, atLocalTime, calendarDayDiff } from './dzien-lokalny';
import { NOTIF_PREFIX, FEED_ROOM_TEMP_AFTER_MS, FEED_FRIDGE_DUE_AFTER_DAYS } from './notification-config';
import type { PlannedNotification, PlanStarter, NotificationTextKey } from './notification-plan';
import { nextSetupFeedingAtForStage, setupDay, setupStageForDay } from './starter-log';

/**
 * Najbliższe przypomnienie stałego dnia karmienia (BR-KAL-010, RD-25): ustawiony dzień tygodnia (ISO 1 = poniedziałek …
 * 7 = niedziela) o ustawionej minucie doby lokalnej, ściśle po `now`. Dzień, w którym zakwas już karmiono (`lastFedAt` tego
 * samego dnia kalendarza), jest pomijany, żeby nie przypominać po karmieniu. Godzina, której w tym dniu nie ma (luka
 * wiosennej zmiany czasu), przechodzi na pierwszą istniejącą (02:30 → 03:30, D-13). Niepoprawny dzień → null.
 */
export function nextFixedFeeding(
  day: { weekday: number; minuteOfDay: number },
  lastFedAt: number | null | undefined,
  now: number
): number | null {
  const { weekday, minuteOfDay } = day;
  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) return null;
  if (!Number.isInteger(minuteOfDay) || minuteOfDay < 0 || minuteOfDay > 1439) return null;
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  let offset = (weekday - (new Date(now).getDay() || 7) + 7) % 7;
  let at = atLocalTime(now, offset, hour, minute).ms;
  // Najwyżej dwa przesunięcia o tydzień: termin minął albo tego dnia już karmiono
  for (let i = 0; i < 2 && (at <= now || (lastFedAt != null && calendarDayDiff(lastFedAt, at) === 0)); i++) {
    offset += 7;
    at = atLocalTime(now, offset, hour, minute).ms;
  }
  return at;
}

export type TekstKarmienia = Extract<NotificationTextKey, `karmienie.${string}`>;
/** Termin karmienia zakwasu i rodzaj (blat, lodówka co 7 dni, stały dzień) — wspólny dla powiadomień i kalendarza. */
export interface TerminKarmienia {
  at: number;
  textKey: TekstKarmienia;
}

/** Stały dzień karmienia, gdy obowiązuje: lodówka, nie w trakcie zakładania (BR-KAL-010, RD-31). */
export function stalyDzienKarmienia(s: PlanStarter): { weekday: number; minuteOfDay: number } | null {
  return s.storageState === 'FRIDGE' && !wZakladaniu(s) && s.fridgeFeedDay ? s.fridgeFeedDay : null;
}

/** Zakwas w trakcie zakładania od zera (BR-ZAKW-005): start zapisany, „gotowy” jeszcze nie. */
export function wZakladaniu(s: Pick<PlanStarter, 'setupStartedAt' | 'setupCompletedAt'>): boolean {
  return s.setupStartedAt !== undefined && s.setupCompletedAt === undefined;
}

/**
 * Zakwasy, o których karmieniu przypominać (powiadomienia i terminy w kalendarzu, D-113, D-116): z Piekarz Pro wszystkie;
 * w Basic tylko zakwasy w trakcie zakładania (przypomnienia zakładania), poza nim przypomnienia o dokarmianiu są w Pro.
 */
export function zakwasyDoPrzypomnien<T extends Pick<PlanStarter, 'setupStartedAt' | 'setupCompletedAt'>>(zakwasy: readonly T[], pro: boolean): T[] {
  return pro ? [...zakwasy] : zakwasy.filter(wZakladaniu);
}

const czytelna = (v: number | undefined): v is number => typeof v === 'number' && Number.isFinite(v);

/** Punkt, od którego liczy się następny termin: późniejsze z dokarmienia i pominięcia (D-094); brak = undefined. */
export function punktOdniesieniaKarmienia(s: Pick<PlanStarter, 'lastFedAt' | 'pominietoAt'>): number | undefined {
  const fed = czytelna(s.lastFedAt) ? s.lastFedAt : undefined;
  const pom = czytelna(s.pominietoAt) ? s.pominietoAt : undefined;
  if (fed === undefined) return pom;
  return pom !== undefined && pom > fed ? pom : fed;
}

/**
 * Termin karmienia liczony od chwili `od` (RD-25, D-093, D-094): zakładanie dni 1–2 `od` + 24 h, potem 12 h (dzień z
 * `now`, jak karta zakwasu), blat `od` + 12 h, lodówka `od` + 7 dni kalendarza,
 * stały dzień: najbliższy ustawiony dzień po `od` (bez `od` — po `now`). Bez punktu odniesienia i stałego dnia → null.
 */
export function terminKarmienia(s: PlanStarter, od: number | undefined, now: number): TerminKarmienia | null {
  const staly = stalyDzienKarmienia(s);
  const lastFedAt = czytelna(s.lastFedAt) ? s.lastFedAt : undefined;
  const wDzien = staly ? nextFixedFeeding(staly, lastFedAt, od ?? now) : null;
  // Niepoprawny stały dzień (null) — jak bez stałego dnia, co 7 dni od dokarmienia
  if (wDzien !== null) return { at: wDzien, textKey: 'karmienie.lodowkaDzien' };
  if (od === undefined) return null;
  // W trakcie zakładania na blacie rytm z D0b, jak karta zakwasu: dni 1–2 po 24 h, od dnia 3 co 12 h (ZAK-ZAL-002…004)
  // [M3 D4b]. Zakładanie w lodówce zostaje przy 7 dniach (test D2); karta liczy wtedy 24/12 h — [DO USTALENIA] rola 06.
  if (s.storageState === 'ROOM_TEMP' && czytelna(s.setupStartedAt) && s.setupCompletedAt === undefined) {
    const at = nextSetupFeedingAtForStage(setupStageForDay(setupDay(s.setupStartedAt, now)), [{ kind: 'feeding', occurredAt: od, signs: [] }]);
    if (at !== null) return { at, textKey: 'karmienie.blat' };
  }
  return s.storageState === 'ROOM_TEMP'
    ? { at: od + FEED_ROOM_TEMP_AFTER_MS, textKey: 'karmienie.blat' }
    : { at: addCalendarDays(od, FEED_FRIDGE_DUE_AFTER_DAYS), textKey: 'karmienie.lodowkaTermin' };
}

/**
 * Dane do pytania z BR-KAL-010 „Karmienie w inny dzień” (UI w D7): dokarmienie zakwasu ze stałym dniem w inny dzień
 * tygodnia → dzień stały i dzień dokarmienia (ISO 1 = poniedziałek … 7 = niedziela); inaczej null.
 */
export function pytanieOStalyDzien(s: PlanStarter, fedAt: number): { stalyDzien: number; dzienKarmienia: number } | null {
  const staly = stalyDzienKarmienia(s);
  if (!staly || !Number.isInteger(staly.weekday) || staly.weekday < 1 || staly.weekday > 7 || !Number.isFinite(fedAt)) return null;
  const dzien = new Date(fedAt).getDay() || 7;
  return dzien === staly.weekday ? null : { stalyDzien: staly.weekday, dzienKarmienia: dzien };
}

/**
 * Przypomnienia o karmieniu: jedno na cykl karmienia (DEC-22 a) [M1-audytor-generalny-179; 11-wzrost-503] —
 * blat +12 h, lodówka termin +7 d albo stały dzień karmienia (BR-KAL-010; nie w trakcie zakładania, RD-31);
 * minione terminy pominięte. Termin z terminKarmienia (ten sam co w kalendarzu); po „Pomiń” liczony od chwili
 * pominięcia (D-094) [M3 D4a]. Stały dzień: najbliższy po teraz, więc po minionym dniu przypomnienie za tydzień.
 */
export function planFeedingNotifications(starters: readonly PlanStarter[], now: number): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  for (const s of starters) {
    const odDokarmienia = terminKarmienia(s, punktOdniesieniaKarmienia(s), now);
    const termin = odDokarmienia?.textKey === 'karmienie.lodowkaDzien' && odDokarmienia.at <= now ? terminKarmienia(s, now, now) : odDokarmienia;
    if (!termin || termin.at <= now) continue;
    const { at: triggerAt, textKey } = termin;
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
