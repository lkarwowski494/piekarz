/**
 * M1-audytor-generalny-195 (01-odkrywanie-603): RD-28 „Zaczyn w formule” (D-061, D-060) jako wyrocznia BRD
 * dla kodu `src/core/zaczyn-w-formule.ts`; wektory z `tests/wektory/brd.json` (generuje kontrola BRD roli 01).
 */
import * as fs from 'fs';
import * as path from 'path';
import { procentyFormulyZZaczynem, zaczynWFormule } from '../zaczyn-w-formule';
import { calculateDoughRecipe } from '../domain-rules';
import type { PrefermentType } from '../preferments';

const wektory = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../tests/wektory/brd.json'), 'utf8')) as Array<{ regula: string; id: string }>;
const baza = { starterPercentage: 0, starterHydration: 100 };
const procenty = (typ: PrefermentType, p: number, w: number, s: number, y: number) =>
  procentyFormulyZZaczynem({ ...baza, prefermentType: typ, prefermentFlourPercentage: p, waterPercentage: w, saltPercentage: s, yeastPercentage: y });

describe('RD-28: zaczyn w formule (BR-KALK-010)', () => {
  it('wektory RD-28-W1…W7 są w tests/wektory/brd.json', () => {
    expect(wektory.filter((w) => w.regula === 'RD-28').map((w) => w.id)).toEqual(['RD-28-W1', 'RD-28-W2', 'RD-28-W3', 'RD-28-W4', 'RD-28-W5', 'RD-28-W6', 'RD-28-W7']);
  });

  it('BR-KALK-010 Zaczyn w formule: poolish 30%, 1000 g → zaczyn 349, mąka 407, woda 233, sól 11,6, bez wiersza drożdży (RD-28-W1)', () => {
    const f = procenty('poolish', 30, 70, 2, 0);
    expect(f).toEqual({ waterPercentage: 70, saltPercentage: 2, yeastPercentage: expect.closeTo(0.03, 6) });
    const r = zaczynWFormule({ ...baza, prefermentType: 'poolish', prefermentFlourPercentage: 30, ...f, targetDoughWeightGrams: 1000 })!;
    expect([r.prefermentTotalWeightGrams, r.doughAddedFlourGrams, r.doughAddedWaterGrams, r.doughAddedSaltGrams]).toEqual([349, 407, 233, 11.6]);
    // drożdże do miski 0 g (−0 z zaokrąglenia), karta pokazuje wiersz drożdży tylko > 0
    expect(r.doughYeastGrams > 0).toBe(false);
    expect(Math.abs(r.doughYeastGrams)).toBe(0);
    const suma = r.prefermentTotalWeightGrams + r.doughAddedFlourGrams + r.doughAddedWaterGrams + r.doughAddedSaltGrams;
    expect(Math.abs(suma - 1000)).toBeLessThanOrEqual(1);
  });

  it('BR-KALK-010 Drożdże zaczynu większe niż w recepturze: biga 50%, drożdże 0,2% → 0,5% (RD-28-W2)', () => {
    const f = procenty('biga', 50, 60, 2, 0.2);
    expect(f.waterPercentage).toBe(60);
    expect(f.saltPercentage).toBe(2);
    expect(f.yeastPercentage).toBeCloseTo(0.5, 6);
  });

  it('RD-28-W3: pâte fermentée 40% (D-060) → 30 / 0,8 / 0,4', () => {
    const f = procenty('pate_fermentee', 40, 25, 0.5, 0);
    expect(f.waterPercentage).toBeCloseTo(30, 6);
    expect(f.saltPercentage).toBeCloseTo(0.8, 6);
    expect(f.yeastPercentage).toBeCloseTo(0.4, 6);
  });

  it('RD-28-W4 granica: poolish 100% → 100 / 2 / 0,1', () => {
    const f = procenty('poolish', 100, 70, 2, 0);
    expect(f.waterPercentage).toBe(100);
    expect(f.yeastPercentage).toBeCloseTo(0.1, 6);
  });

  it('RD-28-W5 poniżej: p = 0 → procenty receptury i brak rozkładu', () => {
    expect(procenty('poolish', 0, 70, 2, 0)).toEqual({ waterPercentage: 70, saltPercentage: 2, yeastPercentage: 0 });
    expect(zaczynWFormule({ ...baza, prefermentType: 'poolish', prefermentFlourPercentage: 0, waterPercentage: 70, saltPercentage: 2, yeastPercentage: 0, targetDoughWeightGrams: 1000 })).toBeNull();
  });

  it('RD-28-W6 powyżej: p = 101 → błąd danych', () => {
    expect(() => zaczynWFormule({ ...baza, prefermentType: 'poolish', prefermentFlourPercentage: 101, waterPercentage: 70, saltPercentage: 2, yeastPercentage: 0, targetDoughWeightGrams: 1000 })).toThrow();
  });

  it('RD-28-W7 błąd: M = 0 → błąd danych (RD-15)', () => {
    expect(() => calculateDoughRecipe({ targetDoughWeightGrams: 0, flours: [{ name: 'M', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 0, starterHydration: 100 })).toThrow();
  });
});
