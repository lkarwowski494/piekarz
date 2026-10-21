/**
 * Tekst „Kopiuj jako tekst” planu wypieku (p13a):
 * - [M2-koordynator-napraw-401 (p12b)] stopka marką aplikacji, bez „Apps4Craft” i bez separatora „•” (design-spec §12a);
 * - [M2-koordynator-napraw-632 (p12c)] w EN nazwy etapów i opis kolizji ze snem ze słownika, bez polskich liter.
 */
import { formatScheduleToText, planDoKopii } from '../schedule-formatter';
import { calculateReverseSchedule } from '../../scheduler/reverse-scheduler';
import { setLang } from '../i18n';

describe('kopia planu wypieku (p13a)', () => {
  afterEach(() => setLang('pl'));
  const cel = new Date(2026, 9, 23, 9, 45);
  const ref = new Date(2026, 9, 21, 8, 0);
  const plan = calculateReverseSchedule(cel, { ambientTemperatureC: 22 });

  it('401: stopka „— Piekarz” w PL i „— Baker” w EN, bez Apps4Craft i „•”', () => {
    setLang('pl');
    const pl = formatScheduleToText(plan, { referenceDate: ref });
    expect(pl).not.toMatch(/Apps4Craft|•/);
    expect(pl.split('\n').pop()).toBe('— Piekarz');
    setLang('en');
    const en = formatScheduleToText(plan, { referenceDate: ref });
    expect(en).not.toMatch(/Apps4Craft|•/);
    expect(en.split('\n').pop()).toBe('— Baker');
  });
});
