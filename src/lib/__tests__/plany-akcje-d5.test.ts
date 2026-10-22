/**
 * Cienka warstwa planów na „Dziś” i pytania planu wypieku (M3 D5; BR-KAL-009, D-104, D-108): sesja z planu niesie dane
 * wypieku (zakwas, receptura) z chwilą startu i zaczęciem z dostępem; start i usunięcie dotykają tylko wiersza planu
 * i uzgadniają powiadomienia, „Przywróć” zapisuje usunięty plan z powrotem (D-051 1a); pytania: limit 5 planów, kolizja
 * z decyzją.
 */
const mockResync = jest.fn(() => Promise.resolve({ status: 'granted', ok: true }));
jest.mock('../notifications', () => ({ ...jest.requireActual('../notifications'), resyncNotifications: () => mockResync() }));

import { Alert } from 'react-native';
import { initDatabase, _resetMemStore } from '../../data/sqlite-store';
import { loadActiveBakeSessions, loadPlannedBakes, savePlannedBake, type PlannedBake } from '../../data/bake-sessions-store';
import { saveBakeSession } from '../../data/bake-session-store';
import type { SessionStep } from '../../core/bake-steps';
import { przywrocPlan, sesjaZPlanu, usunPlan, zacznijPlan } from '../plany-akcje';
import { confirmKolizjaPlanow, confirmLimitPlanow } from '../confirm';

const T0 = 1_800_000_000_000;
const krok = (id: string, start: number): SessionStep => ({ id, name: id, category: 'mix', durationMin: 30, isPassive: false, instructions: '', plannedStart: start, plannedEnd: start + 1_800_000 });
const plan = (id: string, zDanymi = true): PlannedBake => {
  const steps = [krok('mix', T0), krok('bake', T0 + 3_600_000)];
  return {
    version: 1, id, recipeName: 'Chleb', recipeId: 'r1', plannedStartAt: T0, steps,
    ...(zDanymi ? { bake: { id, recipeName: 'Chleb', startedAt: T0, currentStageId: 'mix', steps, starterId: 'z' } } : {}),
  };
};

type Przycisk = { text: string; style?: string; onPress?: () => void };
let alertSpy: jest.SpyInstance;
const ostatni = () => alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string | undefined, Przycisk[]];

describe('D5: akcje planów i pytania', () => {
  beforeEach(async () => {
    _resetMemStore();
    mockResync.mockClear();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => alertSpy.mockRestore());

  it('sesjaZPlanu: id planu, start teraz, zaczęty z dostępem, zakwas i receptura z planu; plan bez danych — nazwa i kroki', () => {
    const s = sesjaZPlanu(plan('p1'), T0 + 60_000);
    expect(s.bake).toEqual(expect.objectContaining({ id: 'p1', startedAt: T0 + 60_000, zaczetyZDostepem: true, starterId: 'z', recipeId: 'r1' }));
    expect(s.stepIdx).toBe(0);
    expect(s.steps.map((k) => k.id)).toEqual(['mix', 'bake']);
    const bez = sesjaZPlanu(plan('p2', false), T0);
    expect(bez.bake).toEqual(expect.objectContaining({ id: 'p2', recipeName: 'Chleb', currentStageId: 'mix', zaczetyZDostepem: true }));
  });

  it('zacznijPlan: plan staje się trwającym (to samo id), resync; usunPlan kasuje tylko swój plan; przywrocPlan oddaje go', async () => {
    await savePlannedBake(plan('p1'));
    await savePlannedBake(plan('p2'));
    expect((await zacznijPlan(plan('p1'), T0)).ok).toBe(true);
    expect((await loadActiveBakeSessions()).map((s) => s.bake?.id)).toEqual(['p1']);
    expect(mockResync).toHaveBeenCalledTimes(1);
    await usunPlan('p2');
    expect(await loadPlannedBakes()).toEqual([]);
    expect(mockResync).toHaveBeenCalledTimes(2);
    // start planu, którego już nie ma: brak, bez resync
    expect(await zacznijPlan(plan('p2'), T0)).toEqual({ ok: false, error: { kind: 'brak', id: 'p2' } });
    expect(mockResync).toHaveBeenCalledTimes(2);
    expect(await przywrocPlan(plan('p2'))).toEqual({ ok: true });
    expect(await loadPlannedBakes()).toEqual([plan('p2')]);
    expect(mockResync).toHaveBeenCalledTimes(3);
  });

  it('pytania: limit planów („Pokaż plany”, „Anuluj”), kolizja (linie, „Anuluj”, „Zaplanuj mimo to”)', () => {
    const pokaz = jest.fn();
    confirmLimitPlanow(pokaz);
    let [tytul, tresc, przyciski] = ostatni();
    expect([tytul, tresc]).toEqual(['Masz już 5 planów', 'Zacznij albo usuń jeden z nich, żeby dodać kolejny.']);
    przyciski[0].onPress?.();
    expect(pokaz).toHaveBeenCalled();
    expect(przyciski[1]).toEqual(expect.objectContaining({ text: 'Anuluj', style: 'cancel' }));

    const zapisz = jest.fn();
    confirmKolizjaPlanow(['A o 8:00: w tym czasie Pizza: B', 'C o 9:00: w tym czasie Pizza: D'], zapisz);
    [tytul, tresc, przyciski] = ostatni();
    expect(tytul).toBe('Kroki nachodzą na siebie');
    expect(tresc).toBe('A o 8:00: w tym czasie Pizza: B\nC o 9:00: w tym czasie Pizza: D');
    expect(przyciski.map((b) => b.text)).toEqual(['Anuluj', 'Zaplanuj mimo to']);
    expect(zapisz).not.toHaveBeenCalled();
    przyciski[1].onPress?.();
    expect(zapisz).toHaveBeenCalled();
  });
});
