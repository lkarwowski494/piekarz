// D-154/D-173: przełącznik „na zakwasie / na drożdżach” tylko w 4 recepturach; dane wersji z treści roli 06
// (docs/tresci/pl/wersje-drozdzowe.md: procent drożdży świeżych względem mąki, D-100, D-178) [M3 p9b]
import { readFileSync } from 'fs';
import { join } from 'path';
import { MASTER_RECIPES } from '../presets';
import { CATALOG_RECIPES } from '../katalog';
import { WERSJE_DROZDZOWE, wersjaDrozdzowa, formulaWersji, wersjaZWpisu } from '../wersje-drozdzowe';

const preset = (id: string) => MASTER_RECIPES.find((r) => r.id === id)!;
const tresc = readFileSync(join(__dirname, '../../../docs/tresci/pl/wersje-drozdzowe.md'), 'utf8');
const akapit = (id: string) =>
  (tresc.split(`## ${id}.yeastVersion.notesPl\n`)[1] ?? '').split('\n## ')[0].trim().split('\n')
    .map((l) => l.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim()).filter(Boolean).join(' ');

describe('D-154/D-173 wersje drożdżowe receptur', () => {
  it('przełącznik mają dokładnie 4 receptury z D-173', () => {
    expect(Object.keys(WERSJE_DROZDZOWE).sort()).toEqual(['graham_bread_honey', 'rye_100_pan', 'spelt_ancient_seeded', 'tartine_high_hydration_80']);
    const bez = CATALOG_RECIPES.filter((r) => wersjaDrozdzowa(r.id) !== null).map((r) => r.id).sort();
    expect(bez).toEqual(['graham_bread_honey', 'rye_100_pan', 'spelt_ancient_seeded', 'tartine_high_hydration_80']);
    expect(wersjaDrozdzowa('country_loaf_72')).toBeNull();
    expect(wersjaDrozdzowa('pizza_napoletana_48h')).toBeNull();
  });

  it('procent drożdży świeżych (i woda, sól żyta) z treści roli 06', () => {
    expect(formulaWersji(preset('spelt_ancient_seeded').formula, 'spelt_ancient_seeded', 'drozdze')).toMatchObject({ starterPercentage: 0, extraYeastPercentage: 3, waterPercentage: 68, saltPercentage: 2 });
    expect(formulaWersji(preset('graham_bread_honey').formula, 'graham_bread_honey', 'drozdze')).toMatchObject({ starterPercentage: 0, extraYeastPercentage: 2, waterPercentage: 72 });
    expect(formulaWersji(preset('rye_100_pan').formula, 'rye_100_pan', 'drozdze')).toMatchObject({ starterPercentage: 0, extraYeastPercentage: 3, waterPercentage: 76, saltPercentage: 1.2 });
    expect(formulaWersji(preset('tartine_high_hydration_80').formula, 'tartine_high_hydration_80', 'drozdze')).toMatchObject({ starterPercentage: 0, extraYeastPercentage: 1.7, waterPercentage: 76 });
  });

  it('wersja na zakwasie i receptura bez wersji drożdżowej: formuła bez zmian, mąki bez zmian', () => {
    const f = preset('rye_100_pan').formula;
    expect(formulaWersji(f, 'rye_100_pan', 'zakwas')).toEqual(f);
    expect(formulaWersji(preset('country_loaf_72').formula, 'country_loaf_72', 'drozdze')).toEqual(preset('country_loaf_72').formula);
    expect(formulaWersji(f, 'rye_100_pan', 'drozdze').flours).toEqual(f.flours);
  });

  it('wskazówki wersji to zdania z docs/tresci/pl/wersje-drozdzowe.md bez znaczników źródeł', () => {
    for (const id of Object.keys(WERSJE_DROZDZOWE)) {
      expect(wersjaDrozdzowa(id)?.notesPl).toBe(akapit(id));
    }
  });

  it('wersjaZWpisu: wersja z bakes.leaven tylko dla receptury z przełącznikiem; NULL zostaje brakiem', () => {
    expect(wersjaZWpisu('yeast', 'graham_bread_honey')).toBe('drozdze');
    expect(wersjaZWpisu('sourdough', 'graham_bread_honey')).toBe('zakwas');
    expect(wersjaZWpisu(null, 'graham_bread_honey')).toBeUndefined();
    expect(wersjaZWpisu(undefined, 'graham_bread_honey')).toBeUndefined();
    expect(wersjaZWpisu('yeast', 'country_loaf_72')).toBeUndefined();
    expect(wersjaZWpisu('yeast', undefined)).toBeUndefined();
  });
});
