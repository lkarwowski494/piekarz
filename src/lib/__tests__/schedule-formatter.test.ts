import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  formatStageTime,
  formatStageDateBadge,
  formatScheduleToText,
  copyScheduleToClipboard,
} from '../schedule-formatter';
import { ReverseScheduleResult } from '../../scheduler/reverse-scheduler';
import * as announceModule from '../announce';

describe('Schedule Formatter & Clipboard Specification (lib/schedule-formatter)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatStageTime', () => {
    it('formats hours and minutes with leading zeros', () => {
      const d1 = new Date(2026, 9, 15, 8, 5);
      expect(formatStageTime(d1)).toBe('08:05');

      const d2 = new Date(2026, 9, 15, 23, 59);
      expect(formatStageTime(d2)).toBe('23:59');
    });
  });

  describe('formatStageDateBadge', () => {
    const ref = new Date(2026, 9, 15, 12, 0); // 15 Oct 2026

    it('returns Dziś for same calendar day', () => {
      const target = new Date(2026, 9, 15, 20, 0);
      expect(formatStageDateBadge(target, ref)).toBe('Dziś');
    });

    it('returns Jutro for next calendar day', () => {
      const target = new Date(2026, 9, 16, 8, 0);
      expect(formatStageDateBadge(target, ref)).toBe('Jutro');
    });

    it('returns Pojutrze for 2 days in the future', () => {
      const target = new Date(2026, 9, 17, 8, 0);
      expect(formatStageDateBadge(target, ref)).toBe('Pojutrze');
    });

    it('returns Wczoraj for previous day', () => {
      const target = new Date(2026, 9, 14, 22, 0);
      expect(formatStageDateBadge(target, ref)).toBe('Wczoraj');
    });

    it('returns DD.MM for dates beyond 2 days', () => {
      const target = new Date(2026, 9, 25, 10, 0);
      expect(formatStageDateBadge(target, ref)).toBe('25.10');
    });
  });

  describe('formatScheduleToText', () => {
    const refDate = new Date(2026, 9, 15, 10, 0);
    const mockSchedule: ReverseScheduleResult = {
      targetReadyTime: new Date(2026, 9, 16, 12, 0),
      hasSleepCollision: false,
      stages: [
        {
          id: 'starter_feed',
          namePl: 'Dokarmienie zakwasu',
          category: 'starter_feed',
          startTime: new Date(2026, 9, 15, 11, 0),
          endTime: new Date(2026, 9, 15, 16, 0),
          durationMinutes: 300,
          isPassive: false,
          isSleepCollision: false,
          instructionsPl: 'Dokarm zakwas',
        },
        {
          id: 'bake',
          namePl: 'Wypiek z parą',
          category: 'bake',
          startTime: new Date(2026, 9, 16, 11, 15),
          endTime: new Date(2026, 9, 16, 12, 0),
          durationMinutes: 45,
          isPassive: false,
          isSleepCollision: false,
          instructionsPl: 'Piecz w garnku',
        },
      ],
    };

    it('produces structured timeline including stages, target, and metadata', () => {
      const formatted = formatScheduleToText(mockSchedule, {
        ambientTempC: 23.5,
        coldRetardHours: 14,
        referenceDate: refDate,
      });

      expect(formatted).toContain('⏱️ Harmonogram: Piekarz (Crust)');
      expect(formatted).toContain('🎯 Godzina gotowości chleba do krojenia: 12:00 (Jutro)');
      expect(formatted).toContain('23.5°C');
      expect(formatted).toContain('14h');
      expect(formatted).toContain('1. 🥣 11:00 (Dziś) — Dokarmienie zakwasu (5h)');
      expect(formatted).toContain('2. ♨️ 11:15 (Jutro) — Wypiek z parą (45 min)');
      expect(formatted).toContain('Apps4Craft Studio');
    });

    it('includes sleep collision alert when collision is detected', () => {
      const collisionSchedule: ReverseScheduleResult = {
        ...mockSchedule,
        hasSleepCollision: true,
        collisionDetailsPl: 'Formowanie wypada o 02:30 w nocy',
      };

      const formatted = formatScheduleToText(collisionSchedule, { referenceDate: refDate });
      expect(formatted).toContain('⚠️ Kolizja ze snem (Sleep Guard): Formowanie wypada o 02:30 w nocy');
    });
  });

  describe('copyScheduleToClipboard', () => {
    it('writes text to clipboard, triggers haptics, and announces via VoiceOver', async () => {
      const announceSpy = jest.spyOn(announceModule, 'announce').mockImplementation(() => {});
      const mockSchedule: ReverseScheduleResult = {
        targetReadyTime: new Date(2026, 9, 16, 12, 0),
        hasSleepCollision: false,
        stages: [],
      };

      const success = await copyScheduleToClipboard(mockSchedule, { ambientTempC: 22 });

      expect(success).toBe(true);
      expect(Clipboard.setStringAsync).toHaveBeenCalled();
      expect(announceSpy).toHaveBeenCalledWith('Skopiowano harmonogram do schowka');
    });
  });
});
