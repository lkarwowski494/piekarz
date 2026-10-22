/**
 * M1-audytor-generalny-217 (DEC-26 a, D-100, RD-19): procent drożdży w presetach to drożdże świeże ze źródła
 * (docs/tresci/rejestr.json, DRO-*-001: wartość i harmonogram), teksty PL i EN z docs/tresci/pl|en/presety-drozdze.md.
 * Pizza nie nazywa się „Verace” i nie ma 46 h w lodówce (przeczy GTS 97/2010, DRO-PIZ-001); „Piecz ponownie” ze starą
 * nazwą z Dziennika dalej znajduje recepturę. Ciabatta i chleb bez wyrabiania: DRO-PRE-900 [DO USTALENIA] [rola 06].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { MASTER_RECIPES } from '../src/recipes/presets';
import { prepareBakeAgainRecipe } from '../src/lib/recipe-navigation';
import { decodeRecipeFromShareUrl, encodeRecipeToShareUrl } from '../src/lib/recipe-sharing';
import { setLang, t } from '../src/lib/i18n';

const ROOT = join(__dirname, '..');
const REJESTR: { id: string; status: string; wartosc?: number; jednostka?: string }[] = JSON.parse(
  readFileSync(join(ROOT, 'docs', 'tresci', 'rejestr.json'), 'utf8'),
);

function sekcje(plik: string): Record<string, string> {
  const wynik: Record<string, string> = {};
  let klucz: string | null = null;
  for (const linia of readFileSync(join(ROOT, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n').split('\n')) {
    if (linia.startsWith('## ')) { klucz = linia.slice(3).trim(); continue; }
    if (!klucz || !linia.trim() || linia.startsWith('<!--')) continue;
    const tekst = linia.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim();
    wynik[klucz] = wynik[klucz] ? `${wynik[klucz]} ${tekst}` : tekst;
  }
  return wynik;
}
const enDla = (pl: string) => { setLang('en'); try { return t(pl); } finally { setLang('pl'); } };

const PL = sekcje('pl/presety-drozdze.md');
const EN = sekcje('en/presety-drozdze.md');
const preset = (id: string) => MASTER_RECIPES.find((r) => r.id === id)!;
const ZE_ZRODLA: [string, string][] = [
  ['pizza_napoletana_48h', 'DRO-PIZ-002'],
  ['sweet_chalka', 'DRO-CHA-001'],
  ['focaccia_genovese', 'DRO-FOC-001'],
  ['baguette_tradition_poolish', 'DRO-BAG-001'],
];

describe('217: drożdże świeże w presetach ze źródła (rola 06)', () => {
  it.each(ZE_ZRODLA)('%s: procent drożdży = wartość twierdzenia %s (drożdże świeże, %%)', (id, tw) => {
    const wpis = REJESTR.find((x) => x.id === tw)!;
    expect(wpis.status).toBe('potwierdzone');
    expect(wpis.jednostka).toBe('% świeżych');
    expect(preset(id).formula.extraYeastPercentage).toBe(wpis.wartosc);
  });

  it('pozostałe dwa presety drożdżowe zostają na liście [DO USTALENIA] (DRO-PRE-900)', () => {
    const otwarte = REJESTR.find((x) => x.id === 'DRO-PRE-900')!;
    expect(otwarte.status).toBe('otwarte');
    expect(preset('ciabatta_con_biga').formula.extraYeastPercentage).toBeGreaterThan(0);
    expect(preset('no_knead_night').formula.extraYeastPercentage).toBeGreaterThan(0);
  });

  it('teksty PL z docs/tresci i ich EN', () => {
    const pola: [string, 'namePl' | 'descriptionPl' | 'notesPl', boolean][] = [
      ['pizza_napoletana_48h', 'namePl', true],
      ['pizza_napoletana_48h', 'descriptionPl', true],
      ['pizza_napoletana_48h', 'notesPl', true],
      ['baguette_tradition_poolish', 'descriptionPl', true],
      ['sweet_chalka', 'notesPl', false],
      ['focaccia_genovese', 'notesPl', false],
      ['baguette_tradition_poolish', 'notesPl', false],
    ];
    for (const [id, pole, calosc] of pola) {
      const klucz = `${id}.${pole}`;
      expect(PL[klucz]).toBeDefined();
      if (calosc) {
        expect(preset(id)[pole]).toBe(PL[klucz]);
        expect(enDla(PL[klucz])).toBe(EN[klucz]);
      } else {
        expect(preset(id)[pole].endsWith(PL[klucz])).toBe(true);
        expect(enDla(preset(id)[pole]).endsWith(EN[klucz])).toBe(true);
      }
    }
  });

  it('pizza nie przeczy GTS „Pizza Napoletana” (DRO-PIZ-001): bez „Verace”, bez 46 h w lodówce', () => {
    const p = preset('pizza_napoletana_48h');
    expect(p.namePl).not.toMatch(/Verace|48 h/);
    expect(`${p.descriptionPl} ${p.notesPl}`).not.toMatch(/46 h|Oryginalne/);
  });

  it('„Piecz ponownie” ze starą nazwą pizzy z Dziennika znajduje tę samą recepturę bazową', () => {
    for (const nazwa of ['Pizza Napoletana Verace (48 h)', 'Pizza Napoletana Verace (48h)']) {
      const r = prepareBakeAgainRecipe({ recipeName: nazwa } as Parameters<typeof prepareBakeAgainRecipe>[0], []);
      expect(r?.id).toBe('pizza_napoletana_48h');
      expect(r?.formula.extraYeastPercentage).toBe(preset('pizza_napoletana_48h').formula.extraYeastPercentage);
    }
  });

  it('każdy preset z drożdżami przechodzi eksport i import (limit procentu drożdży mieści wartości ze źródła)', () => {
    for (const r of MASTER_RECIPES.filter((x) => (x.formula.extraYeastPercentage ?? 0) > 0)) {
      const wynik = decodeRecipeFromShareUrl(encodeRecipeToShareUrl(r));
      expect(wynik.success).toBe(true);
      if (wynik.success) expect(wynik.recipe.formula.extraYeastPercentage).toBe(r.formula.extraYeastPercentage);
    }
  });
});
