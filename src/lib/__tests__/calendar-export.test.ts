// ============================================================================
// Apps4Craft Studio — Piekarz (Crust)
// Unit Tests for iCalendar (.ics) / EventKit Exporter
// ============================================================================

import { generateIcsCalendar } from '../calendar-export';
import { calculateReverseSchedule } from '../../scheduler/reverse-scheduler';

describe('iCalendar (.ics) EventKit Exporter (RFC 5545)', () => {
  it('generates valid RFC 5545 calendar with events, alarms, and timestamps', () => {
    const targetDate = new Date('2026-10-25T08:30:00Z');
    const schedule = calculateReverseSchedule(targetDate);

    const ics = generateIcsCalendar(schedule, 'Wiejski na zakwasie');

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('X-WR-CALNAME:Wypiek: Wiejski na zakwasie');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART:');
    expect(ics).toContain('DTEND:');
    expect(ics).toContain('SUMMARY:🥖 [Piekarz]');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-PT10M');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('escapes special characters correctly in iCalendar format', () => {
    const targetDate = new Date('2026-10-25T12:00:00Z');
    const schedule = calculateReverseSchedule(targetDate);

    const ics = generateIcsCalendar(schedule, 'Chleb z solą, kminkiem; razowy');
    expect(ics).toContain('Chleb z solą\\, kminkiem\\; razowy');
  });
});
