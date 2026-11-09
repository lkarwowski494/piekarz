/**
 * Kroki brioszki tylko dla brioszki: receptura żytnia w keksówce z żytem zmniejszonym do ≤ 50% (isHighRye = false)
 * nie dostaje „Wyrabianie ciasta z masłem” ani pieczenia brioszki [M2-012; przegląd ścieżki danych M2, P2; D-309].
 */
import { pieczenieDlaId } from '../src/lib/pieczenie-planu';
import { calculateReverseSchedule } from '../src/core/reverse-scheduler';
import { BRIOCHE_RECIPE_IDS, BRIOCHE_STAGE_IDS } from '../src/core/brioche-stages';

describe('M2-012: szablon brioszki tylko dla receptury brioszki', () => {
  it.each(['borodinsky_rye', 'rye_100_pan'])('%s z żytem ≤ 50%%: pieczenie z receptury, ale bez kroków brioszki', (id) => {
    const p = pieczenieDlaId(id, false);
    expect(p?.szablon).toBeUndefined();
    const plan = calculateReverseSchedule(new Date(2026, 10, 12, 12), { pieczenie: p });
    expect(plan.stages.filter((s: { id: string }) => BRIOCHE_STAGE_IDS.includes(s.id) && s.id !== 'preheat_oven' && s.id !== 'cool' && s.id !== 'starter_feed')).toEqual([]);
  });
  it('brioszka nadal dostaje swoje kroki', () => {
    const p = pieczenieDlaId('lievito_madre_panettone_brioche', false);
    expect(p?.naczynie).toBe('bread_pan');
    expect(BRIOCHE_RECIPE_IDS).toEqual(['lievito_madre_panettone_brioche']);
    expect(p?.szablon).toBe('brioszka');
    const plan = calculateReverseSchedule(new Date(2026, 10, 12, 12), { pieczenie: p });
    expect(plan.stages.map((s: { id: string }) => s.id)).toContain('brioche_cold');
  });
});
