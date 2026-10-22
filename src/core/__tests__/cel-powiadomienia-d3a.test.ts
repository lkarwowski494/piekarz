/**
 * D3a: powiadomienie kroku otwiera Stolnicę właściwego wypieku (BR-KAL-016 „Który krok czyj”): plan powiadomień niesie
 * id wypieku, a dotknięcie prowadzi na trasę z tym id; powiadomienia sprzed D3a (bez id) otwierają Stolnicę jak dotąd
 * [M3 D3a].
 */
import { celZPowiadomienia, type CelPowiadomienia, planBakeStepNotifications, planPlannedStartNotifications } from '../notification-plan';
import { planBakeSteps } from '../bake-steps';

describe('D3a: cel dotkniętego powiadomienia', () => {
  const now = 1_800_000_000_000;
  const steps = planBakeSteps({ startAt: now, isHighRye: false });

  it('BR-KAL-016 Który krok czyj: każde powiadomienie kroku i startu niesie id swojego wypieku', () => {
    const plan = planBakeStepNotifications({ id: 'bake_pizza', recipeName: 'Pizza', steps, stepIdx: 0, dutchOvenPhase: 'lid_on', timerEndsAt: now + 60_000 }, now, true);
    expect(plan.length).toBeGreaterThan(1);
    expect(new Set(plan.map((p) => p.wypiekId))).toEqual(new Set(['bake_pizza']));
    const sobota = planBakeSteps({ startAt: now + 3_600_000, isHighRye: false });
    const start = planPlannedStartNotifications([{ id: 'plan_sobota', recipeName: 'Chleb', plannedStartAt: now + 3_600_000, steps: sobota }], now);
    expect(start.map((p) => p.wypiekId)).toEqual(['plan_sobota']);
  });

  it('dotknięcie: krok z id → Stolnica tego wypieku; bez id i trasy sprzed 4 zakładek → Stolnica; zakwas → Zakwasy; reszta → brak', () => {
    const doPizzy: CelPowiadomienia = { pathname: '/stolnica', params: { wypiek: 'bake_pizza' } };
    expect(celZPowiadomienia({ route: '/stolnica', wypiek: 'bake_pizza' })).toEqual(doPizzy);
    expect(celZPowiadomienia({ route: '/stolnica' })).toBe('/stolnica');
    expect(celZPowiadomienia({ route: '/(tabs)/stolnica', wypiek: '' })).toBe('/stolnica');
    expect(celZPowiadomienia({ route: '/stolnica', wypiek: 7 })).toBe('/stolnica');
    expect(celZPowiadomienia({ route: '/zakwasy', wypiek: 'bake_pizza' })).toBe('/zakwasy');
    expect(celZPowiadomienia({ route: '/doktor' })).toBeNull();
    expect(celZPowiadomienia(null)).toBeNull();
    expect(celZPowiadomienia('x')).toBeNull();
  });
});
