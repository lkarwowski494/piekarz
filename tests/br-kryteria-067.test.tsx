/**
 * M1-audytor-generalny-067 (07-jakosc-014): testy akceptacyjne ze scenariuszy BRD (docs/brd/wymagania-*.md)
 * dla BR, które miały kod, ale żadnego testu z danymi scenariusza. Każdy test ma w nazwie ID BR i nazwę scenariusza.
 * Scenariusze, których kod nie spełnia, są w scripts/br-wyjatki.json („znalezisko”), nie tutaj.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { calculateDoughRecipe, calculateDDTWaterTemp } from '../src/core/domain-rules';
import { PREFERMENT_DEFINITIONS, calculatePrefermentBreakdown } from '../src/core/preferments';
import { calculateReverseSchedule } from '../src/scheduler/reverse-scheduler';
import { DoMiski } from '../src/components/receptury/DoMiski';
import { executeSaveCustomRecipe } from '../src/lib/calculator-actions';
import { MASTER_RECIPES } from '../src/recipes/presets';
import { initDatabase, _resetMemStore, getRecipes } from '../src/data/sqlite-store';

const tekst = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (!n || typeof n !== 'object') return '';
  if (Array.isArray(n)) return n.map(tekst).join('');
  const w = n as { children?: unknown; props?: { children?: unknown } };
  return tekst(w.children ?? w.props?.children);
};
const bezSpacji = (s: string) => s.replace(/[\s  ]+/g, '');

describe('BR-KALK-001: receptura w procentach piekarskich', () => {
  it('BR-KALK-001 Procenty od całej mąki: 1000 g mąki, 700 g wody, 20 g soli → mąka 100%, woda 70%, sól 2%', async () => {
    const calc = calculateDoughRecipe({
      flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }],
      waterPercentage: 70,
      saltPercentage: 2,
      starterPercentage: 0,
      targetDoughWeightGrams: 1720,
    });
    expect([calc.baseFlourWeightGrams, calc.waterGrams, calc.saltGrams]).toEqual([1000, 700, 20]);
    // Ekran receptury pokazuje te liczby w „Do miski” (§11c 106) [M1-audytor-generalny-149]
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <DoMiski
          calculations={calc} waterPct={70} starterPct={0} starterHydration={100} saltPct={2} yeastPct={0}
          calcMode="loaves" loavesCount={1} onLoavesChange={() => undefined} loafWeightGrams={1720} onLoafWeightChange={() => undefined}
          flourGrams={1000} onFlourGramsChange={() => undefined} prefermentType="direct" prefermentBreakdown={null}
        />
      );
    });
    const wiersz = (id: string) => bezSpacji(tekst(tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === id)[0].props.children));
    expect(wiersz('scale-item-flour-0')).toMatch(/100%.*1000g/);
    expect(wiersz('scale-item-water')).toMatch(/70%.*700g/);
    expect(wiersz('scale-item-salt')).toMatch(/2,0%.*20g/);
    expect(bezSpacji(tekst(tree!.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'recipe-hydration')[0].props.children))).toContain('70%');
    act(() => tree!.unmount());
  });
});

describe('BR-KALK-002: hydratacja całkowita z wodą i mąką z zakwasu', () => {
  it('BR-KALK-002 Zakwas o hydratacji 100%: 900 g mąki, 630 g wody, 200 g zakwasu → mąka 1000 g, woda 730 g, 73% (RD-14-W1)', () => {
    const r = calculateDoughRecipe({
      flours: [{ name: 'Mąka pszenna', percentage: 100 }],
      waterPercentage: 70,
      saltPercentage: 0,
      starterPercentage: (200 / 900) * 100,
      starterHydration: 100,
      targetDoughWeightGrams: 1730,
    });
    expect(r.totalFlourGrams).toBe(1000);
    expect(r.totalWaterGrams).toBe(730);
    expect(r.overallHydrationPercent).toBeCloseTo(73, 2);
  });

  it('BR-KALK-002 Zakwas z samej mąki na granicy: 100 g zakwasu 0%, 900 g mąki, 700 g wody → 70% (RD-14-W3)', () => {
    const r = calculateDoughRecipe({
      flours: [{ name: 'Mąka pszenna', percentage: 100 }],
      waterPercentage: (700 / 900) * 100,
      saltPercentage: 0,
      starterPercentage: (100 / 900) * 100,
      starterHydration: 0,
      targetDoughWeightGrams: 1700,
    });
    expect(r.totalFlourGrams).toBe(1000);
    expect(r.overallHydrationPercent).toBeCloseTo(70, 2);
  });
});

describe('BR-KALK-004: temperatura wody dla docelowej temperatury ciasta', () => {
  it('BR-KALK-004 Ciasto bez zaczynu: cel 25 °C, mąka 20 °C, kuchnia 22 °C, tarcie 10 °C → woda 23 °C (RD-16-W1)', () => {
    const r = calculateDDTWaterTemp({ targetDDT: 25, flourTemp: 20, roomTemp: 22, frictionFactor: 10 });
    expect(r.waterTempTarget).toBe(23);
    expect(r.status).toBe('normal');
  });

  it('BR-KALK-004 Ciasto z zaczynem: dane jak wyżej, zaczyn 24 °C → woda 24 °C (RD-16-W2)', () => {
    const r = calculateDDTWaterTemp({ targetDDT: 25, flourTemp: 20, roomTemp: 22, starterTemp: 24, frictionFactor: 10 });
    expect(r.waterTempTarget).toBe(24);
  });
});

describe('BR-KALK-010: zaczyny poolish, biga i levain', () => {
  it('BR-KALK-010 Domyślna hydratacja poolish: bez zmiany hydratacji zaczyn ma 100% (RD-26-W1)', () => {
    expect(PREFERMENT_DEFINITIONS.poolish.defaultHydration).toBe(100);
    const r = calculatePrefermentBreakdown({
      prefermentType: 'poolish',
      prefermentFlourPercentage: 20,
      totalFlourGrams: 1000,
      totalTargetHydration: 70,
      saltPercentage: 2,
    });
    expect(r.prefermentWaterGrams).toBe(r.prefermentFlourGrams);
    expect(r.prefermentFlourGrams).toBe(200);
  });
});

describe('BR-HARMO-003: czas fermentacji z temperatury w planie', () => {
  const fermentacja = (t: number) =>
    calculateReverseSchedule(new Date(2026, 9, 21, 10, 0, 0), { ambientTemperatureC: t }).stages.find((s) => s.category === 'bulk_ferment')!;

  it('BR-HARMO-003 Czas w zakresie modelu: 240 min w 24 °C → plan 333,69 / 372,44 / 192,66 min w 21 / 20 / 26 °C (RD-17-W1…W3, minuty całkowite)', () => {
    const minuty = (t: number) => {
      const s = fermentacja(t);
      return (s.endTime.getTime() - s.startTime.getTime()) / 60000;
    };
    expect(minuty(24)).toBe(240);
    for (const [t, oczekiwane] of [[21, 333.69], [20, 372.44], [26, 192.66]] as const) {
      expect(Math.abs(minuty(t) - oczekiwane)).toBeLessThanOrEqual(0.5);
    }
  });
});

describe('BR-RECP-002: własne receptury', () => {
  beforeEach(async () => {
    _resetMemStore();
    await initDatabase();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('BR-RECP-002 Zapis i edycja: zmieniona receptura bazowa zapisana pod własną nazwą jest na liście, a bazowa się nie zmienia', async () => {
    const baza = MASTER_RECIPES[0];
    const przed = JSON.stringify(baza);
    const f = baza.formula;
    const zapisana = await executeSaveCustomRecipe(
      'Mój chleb',
      f.flours,
      f.waterPercentage + 5,
      f.saltPercentage,
      f.starterPercentage,
      f.starterHydration ?? 100,
      f.targetDoughWeightGrams,
      baza.targetDDT ?? 25
    );
    expect(zapisana?.id).not.toBe(baza.id);
    const wlasne = (await getRecipes()).filter((r) => !r.isBuiltIn);
    expect(wlasne.map((r) => r.name)).toContain('Mój chleb');
    expect(wlasne.find((r) => r.name === 'Mój chleb')?.formula.waterPercentage).toBe(f.waterPercentage + 5);
    expect(JSON.stringify(MASTER_RECIPES[0])).toBe(przed);
  });
});
