// ============================================================================
// Piekarz — przypomnienia o karmieniu zakwasu: blat, lodówka co 7 dni i stały dzień karmienia (ADR-006) [M3 D2]
// Czyste funkcje: czas jako argument (ms UTC), dzień i godzina w strefie urządzenia (src/core/dzien-lokalny.ts, DST).
// ============================================================================

import { addCalendarDays, atLocalTime, calendarDayDiff } from './dzien-lokalny';
import { NOTIF_PREFIX, FEED_ROOM_TEMP_AFTER_MS, FEED_FRIDGE_DUE_AFTER_DAYS } from './notification-config';
import type { PlannedNotification, PlanStarter, NotificationTextKey } from './notification-plan';

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

/**
 * Przypomnienia o karmieniu: jedno na cykl karmienia (DEC-22 a) [M1-audytor-generalny-179; 11-wzrost-503] —
 * blat +12 h, lodówka termin +7 d albo stały dzień karmienia (BR-KAL-010; nie w trakcie zakładania, RD-31);
 * minione terminy pominięte.
 */
export function planFeedingNotifications(starters: readonly PlanStarter[], now: number): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  for (const s of starters) {
    const wZakladaniu = s.setupStartedAt !== undefined && s.setupCompletedAt === undefined;
    const staly = s.storageState === 'FRIDGE' && !wZakladaniu && s.fridgeFeedDay ? nextFixedFeeding(s.fridgeFeedDay, s.lastFedAt, now) : null;
    let triggerAt: number;
    let textKey: NotificationTextKey;
    if (staly !== null) {
      [textKey, triggerAt] = ['karmienie.lodowkaDzien', staly];
    } else {
      if (s.lastFedAt === undefined) continue;
      [textKey, triggerAt] =
        s.storageState === 'ROOM_TEMP'
          ? ['karmienie.blat', s.lastFedAt + FEED_ROOM_TEMP_AFTER_MS]
          : ['karmienie.lodowkaTermin', addCalendarDays(s.lastFedAt, FEED_FRIDGE_DUE_AFTER_DAYS)];
    }
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
