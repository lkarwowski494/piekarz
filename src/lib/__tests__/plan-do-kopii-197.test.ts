/**
 * M1-audytor-generalny-197: planDoKopii bierze etapy i kolizje pokazane na ekranie, a nie plan liczony w tle.
 */
import { planDoKopii, formatScheduleToText } from '../schedule-formatter';
import { calculateReverseSchedule, type ScheduledStage, type SleepCollision } from '../../scheduler/reverse-scheduler';
import { setLang } from '../i18n';

describe('planDoKopii (197)', () => {
  beforeEach(() => setLang('pl'));
  const cel = new Date(2026, 9, 23, 9, 45);
  const tlo = calculateReverseSchedule(cel, { ambientTemperatureC: 22 });
  const etap = (id: string, namePl: string, odH: number, doH: number): ScheduledStage => ({
    id, namePl, category: 'final_proof', startTime: new Date(2026, 9, 22, odH, 0), endTime: new Date(2026, 9, 22, doH, 0),
    durationMinutes: (doH - odH) * 60, isPassive: true, isSleepCollision: false, instructionsPl: '',
  });
  const zytnie = [etap('rye_proof', 'Rozrost w formie', 6, 8), etap('rye_bake', 'Wypiek w formie', 8, 9)];

  it('etapy z ekranu zastępują etapy planu w tle; łączny czas z nich', () => {
    const p = planDoKopii(tlo, zytnie, []);
    expect(p.stages.map((s) => s.id)).toEqual(['rye_proof', 'rye_bake']);
    const tekst = formatScheduleToText(p, { referenceDate: new Date(2026, 9, 21, 8, 0) });
    expect(tekst).toContain('Rozrost w formie');
    expect(tekst).toMatch(/Łączny czas: 3[\s ]h/);
    expect(tekst).not.toContain('Kolizja ze snem');
  });

  it('kolizje z ekranu: flaga i opis z szablonu Sleep Guard', () => {
    const kol: SleepCollision[] = [{ stageNamePl: 'Rozrost w formie', time: '06:00' }];
    const p = planDoKopii(tlo, zytnie, kol);
    expect(p.hasSleepCollision).toBe(true);
    expect(p.collisionDetailsPl).toBe('Etap "Rozrost w formie" wypada w nocy o 06:00');
  });

  it('bez podanych kolizji zostają kolizje planu', () => {
    expect(planDoKopii(tlo, tlo.stages).sleepCollisions).toBe(tlo.sleepCollisions);
  });
});
