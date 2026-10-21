// Suma wierszy karty „Do miski” = masa docelowa ±1 g (DEC-11 (a), bloker BRD C4a nr 1).
// Test DEC-11 w domain-property-based liczył mąkę bazową razem, a karta pokazuje każdą mąkę osobno,
// zaokrągloną niezależnie. Ten test liczy tak jak karta [M1-audytor-generalny-040; 07-jakosc-004].
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as fc from 'fast-check';
import { DoMiski, DoMiskiProps } from '../DoMiski';
import { calculateDoughRecipe } from '../../../core/domain-rules';

const PBT_SEED: number | undefined = fc.readConfigureGlobal().seed;

type Wejscie = {
  weight: number;
  parts: number[];
  hydr: number;
  salt: number;
  starter: number;
  starterHydr: number;
  yeast: number;
};

const licz = (r: Wejscie) => {
  const suma = r.parts.reduce((a, b) => a + b, 0);
  const flours = r.parts.map((p, i) => ({ name: `Mąka ${i + 1}`, percentage: (p / suma) * 100 }));
  return {
    flours,
    calc: calculateDoughRecipe({
      targetDoughWeightGrams: r.weight,
      flours,
      waterPercentage: r.hydr,
      saltPercentage: r.salt,
      starterPercentage: r.starter,
      starterHydration: r.starterHydr,
      extraYeastPercentage: r.yeast,
    }),
  };
};

// Wiersze karty: każda mąka osobno w pełnych gramach, woda i zakwas w pełnych gramach, sól i drożdże z 0,1 g.
const sumaKartyDziesiate = (c: ReturnType<typeof licz>['calc']): number =>
  c.flours.reduce((a, f) => a + Math.round(f.weightGrams) * 10, 0) +
  Math.round(c.waterGrams) * 10 +
  (c.starterGrams > 0 ? Math.round(c.starterGrams) * 10 : 0) +
  Math.round(c.saltGrams * 10) +
  Math.round(c.yeastGrams * 10);

const props = (calc: ReturnType<typeof licz>['calc'], w: Wejscie): DoMiskiProps => ({
  calculations: calc,
  waterPct: w.hydr,
  starterPct: w.starter,
  starterHydration: w.starterHydr,
  saltPct: w.salt,
  yeastPct: w.yeast,
  calcMode: 'loaves',
  loavesCount: 1,
  onLoavesChange: jest.fn(),
  loafWeightGrams: w.weight,
  onLoafWeightChange: jest.fn(),
  flourGrams: 500,
  onFlourGramsChange: jest.fn(),
  prefermentType: 'direct',
  prefermentBreakdown: null,
});

describe('DoMiski: suma wierszy karty = masa docelowa ±1 g (DEC-11 (a))', () => {
  it('własność: 10 000 losowych receptur z mieszanką 1–4 mąk (ziarno wypisywane przy porażce)', () => {
    try {
      fc.assert(
        fc.property(
          fc.integer({ min: 200, max: 20000 }),
          fc.array(fc.integer({ min: 1, max: 60 }), { minLength: 1, maxLength: 4 }),
          fc.double({ min: 50.0, max: 100.0, noNaN: true }),
          fc.double({ min: 0.5, max: 3.5, noNaN: true }),
          fc.double({ min: 0.0, max: 40.0, noNaN: true }),
          fc.double({ min: 60.0, max: 160.0, noNaN: true }),
          fc.double({ min: 0.0, max: 2.0, noNaN: true }),
          (weight, parts, hydr, salt, starter, starterHydr, yeast) => {
            const { calc } = licz({ weight, parts, hydr, salt, starter, starterHydr, yeast });
            const odchylka = Math.abs(sumaKartyDziesiate(calc) - weight * 10) / 10;
            expect(odchylka).toBeLessThanOrEqual(1);
          },
        ),
        { numRuns: 10000, ...(PBT_SEED !== undefined ? { seed: PBT_SEED } : {}) },
      );
    } catch (error: unknown) {
      console.warn(`[040 PBT FAILURE] ziarno: ${PBT_SEED ?? 'losowe: patrz raport fast-check (seed)'}`);
      throw error;
    }
  });

  it('wektor 1067 g, mąki 30/70, woda 50%, sól 3,5%: suma wierszy ≤ 1 g od 1067', () => {
    const w: Wejscie = { weight: 1067, parts: [30, 70], hydr: 50, salt: 3.5, starter: 0, starterHydr: 100, yeast: 0 };
    const { calc } = licz(w);
    expect(Math.abs(sumaKartyDziesiate(calc) - 10670) / 10).toBeLessThanOrEqual(1);
  });

  describe('przez ekran: wiersze scale-item-* karty DoMiski', () => {
    let tree: renderer.ReactTestRenderer | null = null;
    afterEach(() => {
      if (tree) act(() => tree?.unmount());
      tree = null;
    });
    const gramy = (s: string): number => {
      const m = s.replace(/[^0-9.,g]/g, '').replace(/ | /g, '').match(/(\d+(?:[.,]\d+)?)g$/);
      if (!m) throw new Error(`nie rozpoznano masy: ${s}`);
      return Number((m[1] ?? '').replace(',', '.'));
    };
    const sumaWierszyEkranu = async (w: Wejscie): Promise<number> => {
      const { calc } = licz(w);
      await act(async () => {
        tree = renderer.create(<DoMiski {...props(calc, w)} />);
      });
      const wiersze = tree!.root.findAll(
        (n) => typeof n.type === 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('scale-item-'),
      );
      return wiersze.reduce((a, wiersz) => {
        const teksty = wiersz
          .findAll((c) => (c.type as unknown) === 'Text')
          .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)));
        return a + gramy(teksty[teksty.length - 1] ?? '');
      }, 0);
    };

    it.each<[string, Wejscie]>([
      ['1067 g, 30/70, woda 50%, sól 3,5%', { weight: 1067, parts: [30, 70], hydr: 50, salt: 3.5, starter: 0, starterHydr: 100, yeast: 0 }],
      ['1000 g, trzy mąki, zakwas 20%, drożdże 0,3%', { weight: 1000, parts: [1, 1, 1], hydr: 72, salt: 2, starter: 20, starterHydr: 100, yeast: 0.3 }],
      ['1721 g, 33/33/34, woda 68%, sól 2,2%', { weight: 1721, parts: [33, 33, 34], hydr: 68, salt: 2.2, starter: 0, starterHydr: 100, yeast: 0 }],
    ])('%s: suma wierszy ±1 g od masy docelowej', async (_nazwa, w) => {
      const suma = await sumaWierszyEkranu(w);
      expect(Math.abs(suma - w.weight)).toBeLessThanOrEqual(1.0001);
    });
  });
});
