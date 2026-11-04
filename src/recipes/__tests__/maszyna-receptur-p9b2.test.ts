/**
 * p9b-2: tryb maszyny na recepturach katalogu — dostępność (BR-MASZ-001, D-156), wersja drożdżowa przy zakwasie,
 * składniki do RD-38 (cała receptura, OP-73) i cechy do RD-39 z danych receptury [M3 p9b2].
 */
import { CATALOG_RECIPES } from '../katalog';
import { trybMaszynyDostepny, formulaMaszyny, skladnikiMaszyny, cechyProgramuReceptury, DODATKI_MASZYNY } from '../maszyna-receptur';
import { opoznionyStart, podpowiedzProgramu } from '../../core/maszyna';

const r = (id: string) => {
  const x = CATALOG_RECIPES.find((p) => p.id === id);
  if (!x) throw new Error(id);
  return x;
};
const program = (id: string) => {
  const rec = r(id);
  return podpowiedzProgramu(cechyProgramuReceptury(rec, formulaMaszyny(rec).formula));
};

describe('BR-MASZ-001: wybór „piekarnik / maszyna” tylko przy recepturach drożdżowych i z wersją drożdżową', () => {
  it('receptura drożdżowa i receptura na zakwasie z wersją drożdżową: tak; zakwas bez wersji, pierożki bez drożdży, brak receptury: nie', () => {
    expect(trybMaszynyDostepny(r('white_pan_loaf'))).toBe(true);
    expect(trybMaszynyDostepny(r('pizza_napoletana_48h'))).toBe(true);
    expect(trybMaszynyDostepny(r('graham_bread_honey'))).toBe(true);
    expect(trybMaszynyDostepny(r('country_loaf_72'))).toBe(false);
    expect(trybMaszynyDostepny(r('lievito_madre_panettone_brioche'))).toBe(false);
    expect(trybMaszynyDostepny(r('karelian_rye_pasties'))).toBe(false);
    expect(trybMaszynyDostepny(undefined)).toBe(false);
  });

  it('zakwas z wersją drożdżową: tryb używa formuły wersji drożdżowej (bez zakwasu) i oznacza to dla zdania machine.sourdough', () => {
    const f = formulaMaszyny(r('graham_bread_honey'));
    expect(f.przezWersjeDrozdzowa).toBe(true);
    expect(f.formula.starterPercentage).toBe(0);
    expect(f.formula.extraYeastPercentage).toBe(2);
    expect(formulaMaszyny(r('white_pan_loaf'))).toEqual({ formula: r('white_pan_loaf').formula, przezWersjeDrozdzowa: false });
  });

  it('każda receptura z trybem maszyny ma wpis dodatków (bez wpisu RD-38 dałby błąd danych)', () => {
    const zTrybem = CATALOG_RECIPES.filter((x) => trybMaszynyDostepny(x)).map((x) => x.id).sort();
    expect(Object.keys(DODATKI_MASZYNY).sort()).toEqual(zTrybem);
  });
});

describe('RD-38 na recepturach katalogu (cała receptura, OP-67/OP-73 otwarte → blokada)', () => {
  it('chałka (jajko do posmarowania), bułki na mleku z jajkiem, kołacz z serem: zablokowany z nazwą składnika', () => {
    expect(opoznionyStart(skladnikiMaszyny(r('sweet_chalka')))).toEqual({ ok: true, dostepny: false, psujace: ['jajka'] });
    expect(opoznionyStart(skladnikiMaszyny(r('milk_dinner_rolls')))).toEqual({ ok: true, dostepny: false, psujace: ['mleko', 'jajka'] });
    const kolacz = opoznionyStart(skladnikiMaszyny(r('cheese_crumble_yeast_cake')));
    expect(kolacz.ok && !kolacz.dostepny && kolacz.psujace).toEqual(['mleko', 'jajka', 'ser']);
  });
  it('chleb w formie z wodą, cukrem, solą i olejem; wersja drożdżowa grahama: dostępny', () => {
    expect(opoznionyStart(skladnikiMaszyny(r('white_pan_loaf')))).toEqual({ ok: true, dostepny: true });
    expect(opoznionyStart(skladnikiMaszyny(r('graham_bread_honey')))).toEqual({ ok: true, dostepny: true });
  });
  it('receptura spoza listy (np. własna) nie ma składników: błąd danych, nie „dostępny”', () => {
    expect(skladnikiMaszyny({ ...r('white_pan_loaf'), id: 'moja_1' })).toBeNull();
    expect(opoznionyStart(skladnikiMaszyny({ ...r('white_pan_loaf'), id: 'moja_1' }))).toEqual({ ok: false, blad: 'brak-skladnikow' });
  });
});

describe('RD-39 na recepturach katalogu', () => {
  it('pieczone poza formą maszyny (blacha, kamień): ciasto — pizza, bagietka, chałka, bułki', () => {
    for (const id of ['pizza_napoletana_48h', 'baguette_tradition_poolish', 'sweet_chalka', 'milk_dinner_rolls']) expect({ id, p: program(id) }).toEqual({ id, p: { ok: true, program: 'ciasto' } });
  });
  it('w formie: chleb z cukrem i olejem → podstawowy; pół na pół z razową i z żytnią → pełnoziarnisty; graham i żyto na drożdżach → pełnoziarnisty', () => {
    expect(program('white_pan_loaf')).toEqual({ ok: true, program: 'podstawowy' });
    expect(program('half_whole_wheat_loaf')).toEqual({ ok: true, program: 'pelnoziarnisty' });
    expect(program('half_rye_loaf')).toEqual({ ok: true, program: 'pelnoziarnisty' });
    expect(program('graham_bread_honey')).toEqual({ ok: true, program: 'pelnoziarnisty' });
    expect(program('rye_100_pan')).toEqual({ ok: true, program: 'pelnoziarnisty' });
  });
  it('w garnku, bez cukru i tłuszczu, poniżej progu: francuski (chleb bez wyrabiania, tartine na drożdżach)', () => {
    expect(program('no_knead_night')).toEqual({ ok: true, program: 'francuski' });
    expect(program('tartine_high_hydration_80')).toEqual({ ok: true, program: 'francuski' });
  });
});
