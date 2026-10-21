import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  ReverseScheduleResult,
  ScheduledStage,
  SleepCollision,
  SLEEP_COLLISION_TEMPLATE_PL,
  sleepCollisionParams,
} from '../scheduler/reverse-scheduler';

/**
 * Plan do „Kopiuj harmonogram” z etapów i kolizji pokazanych na ekranie (np. kroki żytnie), nie z planu
 * pszennego liczonego w tle [M1-audytor-generalny-197; 03-zakres-601].
 */
export function planDoKopii(
  schedule: ReverseScheduleResult,
  stages: ScheduledStage[],
  kolizje: SleepCollision[] = schedule.sleepCollisions,
): ReverseScheduleResult {
  return {
    ...schedule,
    stages,
    hasSleepCollision: kolizje.length > 0,
    sleepCollisions: kolizje,
    collisionDetailsPl:
      kolizje.length > 0
        ? kolizje
            .map((c) => Object.entries(sleepCollisionParams(c)).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), SLEEP_COLLISION_TEMPLATE_PL))
            .join('; ')
        : undefined,
  };
}
import { t } from './i18n';
import { announce } from './announce';
import { formatTemperature } from './unit-converter';
import { appLocale, formatDate, formatTime } from './format';
import { czasTrwania } from './czas-trwania';

/** Godzina etapu w formacie regionu (PL 24 h, en-US 12 h; design-spec §7) [M1-audytor-generalny-096]. */
export function formatStageTime(d: Date): string {
  return formatTime(d);
}

export function formatStageDateBadge(d: Date, refDate = new Date()): string {
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const refDay = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()).getTime();
  const diffDays = Math.round((dDay - refDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('Dziś');
  if (diffDays === 1) return t('Jutro');
  if (diffDays === 2) return t('Pojutrze');
  if (diffDays === -1) return t('Wczoraj');
  // Dzień i miesiąc w formacie języka (PL 25.10, EN-US 10/25), nie zawsze „DD.MM” [audyt-niezalezny F-3]
  return formatDate(d, appLocale(), { day: '2-digit', month: '2-digit' });
}

export function formatScheduleToText(
  schedule: ReverseScheduleResult,
  options?: { ambientTempC?: number; coldRetardHours?: number; referenceDate?: Date }
): string {
  const ref = options?.referenceDate ?? new Date();
  const targetTimeStr = `${formatStageTime(schedule.targetReadyTime)} (${formatStageDateBadge(schedule.targetReadyTime, ref)})`;

  const stages = schedule.stages;
  // Czasy trwania we wspólnym formacie („35 h 40 min”, bez ułamków godzin; §11c 116) [M1-audytor-generalny-116]
  let totalMin = 0;
  if (stages.length > 0) {
    totalMin = (stages[stages.length - 1].endTime.getTime() - stages[0].startTime.getTime()) / 60_000;
  }

  const lines: string[] = [];
  lines.push(`${t('Plan wypieku')}: ${t('Piekarz')}`);
  lines.push(`${t('Godzina gotowości chleba do krojenia')}: ${targetTimeStr}`);
  lines.push(`${t('Łączny czas')}: ${czasTrwania(totalMin).tekst}`);

  if (options?.ambientTempC !== undefined || options?.coldRetardHours !== undefined) {
    const metaParts: string[] = [];
    if (options.ambientTempC !== undefined) {
      metaParts.push(`${t('Temperatura otoczenia')}: ${formatTemperature(options.ambientTempC)}`);
    }
    if (options.coldRetardHours !== undefined) {
      metaParts.push(`${t('Garowanie chłodnicze')}: ${czasTrwania(options.coldRetardHours * 60).tekst}`);
    }
    lines.push(metaParts.join(' | '));
  }

  if (schedule.hasSleepCollision) {
    // Opis kolizji w języku interfejsu, jak baner Sleep Guard (szablon i nazwa etapu przez t()) [M2-koordynator-napraw-632 (p12c)]
    const opis = schedule.sleepCollisions.length > 0
      ? schedule.sleepCollisions
          .map((c) => t(SLEEP_COLLISION_TEMPLATE_PL, { ...sleepCollisionParams(c), etap: t(c.stageNamePl) }))
          .join('; ')
      : schedule.collisionDetailsPl || '';
    lines.push(`${t('Kolizja ze snem')}: ${opis}`);
  }

  lines.push('');
  lines.push(`${t('Etapy wypieku')}:`);

  stages.forEach((s, idx) => {
    const startStr = `${formatStageTime(s.startTime)} (${formatStageDateBadge(s.startTime, ref)})`;
    lines.push(`${idx + 1}. ${startStr} — ${t(s.namePl)} (${czasTrwania(s.durationMinutes).tekst})`);
  });

  lines.push('');
  // Stopka marką aplikacji w języku (PL „Piekarz”, EN „Baker”), bez marki studia i bez „•” (§12a) [M2-koordynator-napraw-401 (p12b)]
  lines.push(`— ${t('Piekarz')}`);
  return lines.join('\n');
}

export async function copyScheduleToClipboard(
  schedule: ReverseScheduleResult,
  options?: { ambientTempC?: number; coldRetardHours?: number }
): Promise<boolean> {
  const text = formatScheduleToText(schedule, options);
  await Clipboard.setStringAsync(text);
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Non-native fallback
  }
  announce(t('Skopiowano plan wypieku do schowka'));
  return true;
}
