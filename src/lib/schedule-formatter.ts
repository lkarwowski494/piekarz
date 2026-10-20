import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { ReverseScheduleResult } from '../scheduler/reverse-scheduler';
import { t } from './i18n';
import { announce } from './announce';

export function formatStageTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
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
  let totalHours = 0;
  if (stages.length > 0) {
    const startMs = stages[0].startTime.getTime();
    const endMs = stages[stages.length - 1].endTime.getTime();
    totalHours = Math.round(((endMs - startMs) / (1000 * 60 * 60)) * 10) / 10;
  }

  const lines: string[] = [];
  lines.push(`${t('Harmonogram')}: Piekarz (Crust)`);
  lines.push(`${t('Godzina gotowości chleba do krojenia')}: ${targetTimeStr}`);
  lines.push(`${t('Łączny czas')}: ${totalHours}h`);

  if (options?.ambientTempC !== undefined || options?.coldRetardHours !== undefined) {
    const metaParts: string[] = [];
    if (options.ambientTempC !== undefined) {
      metaParts.push(`${t('Temperatura otoczenia')}: ${options.ambientTempC}°C`);
    }
    if (options.coldRetardHours !== undefined) {
      metaParts.push(`${t('Garowanie chłodnicze')}: ${options.coldRetardHours}h`);
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
    const durStr =
      s.durationMinutes >= 60
        ? `${Math.floor(s.durationMinutes / 60)}h${s.durationMinutes % 60 > 0 ? ` ${s.durationMinutes % 60}m` : ''}`
        : `${s.durationMinutes} min`;

    lines.push(`${idx + 1}. ${startStr} — ${s.namePl} (${durStr})`);
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
