/**
 * D3a: lista trwających wypieków do pokazania (Stolnica, Dziś, pytanie przy starcie): zapisane od najstarszego, a wypiek
 * z planu w pamięci na końcu, tylko gdy nie ma go jeszcze w zapisie; nowy wypiek zaczyna od kroku 1 [M3 D3a].
 */
import { nowaSesja, sesjeDoPokazania, type BakeSession } from '../bake-session-store';
import type { ActiveBakeState } from '../sqlite-schema';

const T = 1_800_000_000_000;
const bake = (id: string, startedAt = T): ActiveBakeState => ({ id, recipeName: id, startedAt, currentStageId: 'mix' });

describe('D3a: sesjeDoPokazania i nowaSesja', () => {
  it('nowaSesja: krok 1, faza pokrywki, bez pauzy, nazwa i start z wypieku; plan od teraz bez końca zegara', () => {
    const s = nowaSesja(bake('bake_a'));
    expect({ stepIdx: s.stepIdx, faza: s.dutchOvenPhase, pauza: s.pausedLeftSec, nazwa: s.recipeName, start: s.startedAt, timer: s.timerEndsAt }).toEqual({
      stepIdx: 0, faza: 'lid_on', pauza: null, nazwa: 'bake_a', start: T, timer: null,
    });
    expect(s.steps.length).toBeGreaterThan(0);
    expect(s.bake?.id).toBe('bake_a');
  });

  it('sesjeDoPokazania: zapisane bez zmian i nie nowe; wypiek z pamięci na końcu jako nowy, a już zapisany nie dubluje się', () => {
    const zapisana: BakeSession = { ...nowaSesja(bake('bake_a')), stepIdx: 3 };
    expect(sesjeDoPokazania(null, [])).toEqual([]);
    expect(sesjeDoPokazania(null, [zapisana])).toEqual([{ sesja: zapisana, nowy: false }]);
    const lista = sesjeDoPokazania(bake('bake_b', T + 1), [zapisana]);
    expect(lista.map((w) => [w.sesja.bake?.id, w.nowy, w.sesja.stepIdx])).toEqual([['bake_a', false, 3], ['bake_b', true, 0]]);
    expect(sesjeDoPokazania(bake('bake_a'), [zapisana])).toEqual([{ sesja: zapisana, nowy: false }]);
  });
});
