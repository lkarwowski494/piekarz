/**
 * Jeden zestaw zakresów pól receptury dla arkusza „Składniki” i importu [M1-audytor-generalny-027; 08-programista-004]:
 * recepturę zapisaną w aplikacji (wartości graniczne arkusza) da się udostępnić i zaimportować; zakresy w jednym
 * miejscu; odrzucony plik receptury mówi dlaczego (komunikat walidacji na ekranie importu).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { exportRecipeToJson } from '../lib/recipe-sharing';
import { rozpoznajPlik } from '../lib/import-z-pliku';
import type { StoredRecipe } from '../data/db';
import { ZAKRESY_RECEPTURY, wZakresie } from '../core/zakresy-receptury';

const ROOT = path.join(__dirname, '..', '..');
const receptura = (f: Partial<StoredRecipe['formula']>): StoredRecipe => ({
  id: 'r1', name: 'Graniczna', isBuiltIn: false, createdAt: 1, targetDDT: 25,
  formula: { flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 900, ...f },
});

describe('M1-audytor-generalny-027: zakresy pól receptury', () => {
  it.each([
    ['woda 0', { waterPercentage: 0 }],
    ['woda 150', { waterPercentage: 150 }],
    ['sól 10', { saltPercentage: 10 }],
    ['zakwas 100', { starterPercentage: 100 }],
    ['hydratacja zakwasu 20 i 200', { starterHydration: 200 }],
    ['drożdże 10', { extraYeastPercentage: 10 }],
  ])('wartość graniczna arkusza (%s): eksport → import rozpoznaje recepturę', (_n, f) => {
    expect(rozpoznajPlik(exportRecipeToJson(receptura(f)))?.rodzaj).toBe('receptura');
  });

  it('ZAKRESY_RECEPTURY i wZakresie: granice włącznie', () => {
    expect(wZakresie(ZAKRESY_RECEPTURY.woda.max, ZAKRESY_RECEPTURY.woda)).toBe(true);
    expect(wZakresie(ZAKRESY_RECEPTURY.woda.max + 0.1, ZAKRESY_RECEPTURY.woda)).toBe(false);
    expect(wZakresie(ZAKRESY_RECEPTURY.sol.min, ZAKRESY_RECEPTURY.sol)).toBe(true);
    expect(Object.keys(ZAKRESY_RECEPTURY)).toEqual(['woda', 'sol', 'zakwas', 'hydratacjaZakwasu', 'drozdze']);
  });

  it('poza zakresem arkusza: plik nierozpoznany z powodem (komunikat walidacji z nazwą pola)', () => {
    const wynik = rozpoznajPlik(exportRecipeToJson(receptura({ waterPercentage: 151 })));
    expect(wynik).toEqual({ rodzaj: 'nierozpoznany', powod: expect.stringContaining('wody') });
  });

  it('zakresy zdefiniowane w jednym miejscu: arkusz i import bez własnych liczb granicznych', () => {
    const arkusz = fs.readFileSync(path.join(ROOT, 'src/components/receptury/SkladnikiSheet.tsx'), 'utf8');
    const pola = arkusz.split('\n').filter((l) => /<PoleProcentu id="(water|starter|starter-hydration|salt|yeast)-pct-input|starter-hydration-input/.test(l));
    expect(pola.length).toBeGreaterThanOrEqual(5);
    for (const l of pola) expect(l).not.toMatch(/(min|max)=\{\d/);
    const imp = fs.readFileSync(path.join(ROOT, 'src/lib/recipe-sharing.ts'), 'utf8');
    expect(imp).not.toMatch(/(waterPct|saltPct|starterPct|starterHydration|y) [<>] \d/);
  });
});
