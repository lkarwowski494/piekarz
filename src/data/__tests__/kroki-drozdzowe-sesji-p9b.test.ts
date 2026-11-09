// Przegląd ścieżek wrażliwych p9b-1b (P1): sesja wypieku żyta na drożdżach (isHighRye = true, kroki yeast_*) nie może
// dostać etapów żytnich na zakwasie (dokarmienie, 240 min w formie) przy budowie sesji (stepsForBake, nowaSesja);
// D-155: bez dokarmienia zakwasu, czasy z receptury [M3 p9b].
import { nowaSesja, stepsForBake } from '../bake-session-store';
import { krokiDrozdzowe } from '../../recipes/yeast-stages';
import type { ActiveBakeState } from '../sqlite-schema';

const START = Date.UTC(2026, 10, 4, 8, 0);
const kroki = krokiDrozdzowe('rye_100_pan', START)!;
const bake: ActiveBakeState = { id: 'bake_1', recipeName: 'Żytni', startedAt: START, currentStageId: 'yeast_mix', isHighRye: true, steps: kroki, wersja: 'drozdze', recipeId: 'rye_100_pan' };

describe('p9b: kroki wersji drożdżowej w sesji', () => {
  it('żyto na drożdżach: kroki planu bez zamiany na etapy żytnie na zakwasie', () => {
    expect(stepsForBake(bake)).toEqual(kroki);
    expect(nowaSesja(bake).steps.map((s) => `${s.id}:${s.durationMin}`)).toEqual(kroki.map((s) => `${s.id}:${s.durationMin}`));
  });
  it('żyto na zakwasie bez etapów żytnich: zamiana jak dotąd (030)', () => {
    const pszenne = krokiDrozdzowe('graham_bread_honey', START)!.map((s) => ({ ...s, id: s.id.replace('yeast_', '') }));
    expect(stepsForBake({ ...bake, wersja: 'zakwas', steps: pszenne })[0].id).toBe('rye_starter');
  });
});
