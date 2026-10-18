// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// iCalendar (.ics) / EventKit Schedule Exporter (RFC 5545)
// Exports sourdough reverse schedule stages directly to system calendar
// ============================================================================

import { ReverseScheduleResult, ScheduledStage } from '../scheduler/reverse-scheduler';

function formatDateToIcsUtc(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates an RFC 5545 compliant iCalendar string from a bread schedule.
 */
export function generateIcsCalendar(
  schedule: ReverseScheduleResult,
  recipeName: string = 'Chleb rzemieślniczy'
): string {
  const nowUtc = formatDateToIcsUtc(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apps4Craft Studio//Piekarz Crust//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Wypiek: ${escapeIcsText(recipeName)}`,
  ];

  schedule.stages.forEach((stage: ScheduledStage, idx: number) => {
    const startStr = formatDateToIcsUtc(stage.startTime);
    const endStr = formatDateToIcsUtc(stage.endTime);
    const uid = `piekarz-${stage.id}-${stage.startTime.getTime()}@apps4craft.com`;
    const summary = `🥖 [Piekarz] ${stage.namePl} (${recipeName})`;
    const desc = `${stage.instructionsPl}\\nCzas trwania: ${stage.durationMinutes} min`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(desc)}`,
      `SEQUENCE:${idx}`
    );

    // Alarm for non-passive stages (10 minutes before)
    if (!stage.isPassive) {
      lines.push(
        'BEGIN:VALARM',
        'TRIGGER:-PT10M',
        'ACTION:DISPLAY',
        `DESCRIPTION:Powiadomienie: ${escapeIcsText(stage.namePl)} za 10 minut!`,
        'END:VALARM'
      );
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
