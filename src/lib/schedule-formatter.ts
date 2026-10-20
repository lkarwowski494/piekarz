import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { ReverseScheduleResult } from '../scheduler/reverse-scheduler';
import { t } from './i18n';
import { announce } from './announce';
import { formatTemperature } from './unit-converter';
import { formatTime } from './format';
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
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}.${month}`;
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
  lines.push(`${t('Harmonogram')}: ${t('Piekarz')}`);
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
    lines.push(`${t('Kolizja ze snem')}: ${schedule.collisionDetailsPl || ''}`);
  }

  lines.push('');
  lines.push(`${t('Etapy wypieku')}:`);

  stages.forEach((s, idx) => {
    const startStr = `${formatStageTime(s.startTime)} (${formatStageDateBadge(s.startTime, ref)})`;
    lines.push(`${idx + 1}. ${startStr} — ${s.namePl} (${czasTrwania(s.durationMinutes).tekst})`);
  });

  lines.push('');
  lines.push('— Apps4Craft Studio • Piekarz');
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
  announce(t('Skopiowano harmonogram do schowka'));
  return true;
}
