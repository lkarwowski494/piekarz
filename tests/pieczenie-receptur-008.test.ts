/**
 * M1-audytor-generalny-008 (06-tresci-001, D-304, DEC-03 a): plan i prowadzenie pieką według danych receptury,
 * a dane receptur pszennych na zakwasie mają źródło. Test akceptacyjny: dane receptury = wektor roli 06
 * (docs/tresci/wektory/pieczenie-receptur-2026-11-09.json), a kroki planu „preheat_oven” i „bake” oraz fazy
 * garnka mają czasy, temperatury i naczynie z danych receptury; teksty dosłownie z docs/tresci/pl/pieczenie-receptur.md.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CATALOG_RECIPES } from '../src/recipes/katalog';
import type { RecipePreset } from '../src/recipes/presets';
import { calculateReverseSchedule, DEFAULT_STAGE_TEMPLATES } from '../src/core/reverse-scheduler';
import { stepsFromSchedule, isDutchOvenStep, type SessionStep } from '../src/core/bake-steps';
import { fazyGarnka } from '../src/core/baking-phases';
import { pieczenieZReceptury, krokiPieczenia, PIECZENIE_DOMYSLNE, ID_PIECZENIA_BEZ_GARNKA } from '../src/core/pieczenie-receptury';
import { pieczenieDlaId, pieczenieDlaPlanu } from '../src/lib/pieczenie-planu';
import type { RecepturaPlanu } from '../src/lib/plan-receptury';
import { stepDurationSec } from '../src/core/bake-session';
import { TIME_SENSITIVE_STEPS } from '../src/core/notification-config';

const root = path.join(__dirname, '..');
interface Param { parametr: string; wartosc?: number | string | null; granica: string; min?: number; max?: number; twierdzenie: string }
const WEKTOR: { parametry: Param[] } = JSON.parse(
  fs.readFileSync(path.join(root, 'docs', 'tresci', 'wektory', 'pieczenie-receptur-2026-11-09.json'), 'utf8'),
);
const wektor = (nazwa: string) => WEKTOR.parametry.find((p) => p.parametr === nazwa)!;

/** Sekcja pliku treści (nagłówek „## …” zaczyna się od `naglowek`): zdania bez znacznika [T:…], złączone spacją. */
function sekcja(naglowek: string): string {
  const t0 = fs.readFileSync(path.join(root, 'docs', 'tresci', 'pl', 'pieczenie-receptur.md'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const blok = t0.split('\n## ').find((b) => b.startsWith(naglowek));
  if (!blok) throw new Error(`brak sekcji ${naglowek}`);
  return blok.split('\n').slice(1).filter((l) => l.trim()).map((l) => l.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim()).join(' ');
}

const POLA = ['bakeTempSteamC', 'bakeTempBrowningC', 'bakeTimeSteamMinutes', 'bakeTimeBrowningMinutes', 'recommendedVessel'] as const;
const recepturaWektora = WEKTOR.parametry.filter((p) => (POLA as readonly string[]).includes(p.parametr.split('.')[1] ?? ''));
const ID_Z_WEKTORA = [...new Set(recepturaWektora.map((p) => p.parametr.split('.')[0]))];
const receptura = (id: string) => CATALOG_RECIPES.find((r) => r.id === id)!;

/** Receptury pszenne na zakwasie, które mają plan (zakwas, bez żyta); pizza na drożdżach nie ma planu zakwasowego. */
const Z_PLANEM = ID_Z_WEKTORA.filter((id) => receptura(id).formula.starterPercentage > 0);

function planDla(r: RecipePreset): SessionStep[] {
  return stepsFromSchedule(calculateReverseSchedule(new Date(2026, 10, 10, 12, 0), { pieczenie: pieczenieDlaId(r.id, false) }));
}
const krok = (kroki: SessionStep[], kat: string) => kroki.find((s) => s.category === kat)!;

describe('008 (D-304): dane receptury = wektor roli 06', () => {
  it('wektor obejmuje 6 receptur w garnku, brioszkę, durum i pizzę', () => {
    expect(ID_Z_WEKTORA.sort()).toEqual([
      'country_loaf_72', 'durum_semolina_sourdough', 'graham_bread_honey', 'lievito_madre_panettone_brioche', 'pain_de_campagne',
      'pizza_napoletana_48h', 'san_francisco_sourdough', 'spelt_ancient_seeded', 'tartine_high_hydration_80',
    ]);
  });

  it.each(recepturaWektora.map((p) => [p.parametr, p] as const))('%s zgodne z wektorem', (nazwa, p) => {
    const [id, pole] = nazwa.split('.') as [string, (typeof POLA)[number]];
    const v = receptura(id)[pole];
    if (p.granica === 'przedział') {
      expect(v).toBeGreaterThanOrEqual(p.min!);
      expect(v).toBeLessThanOrEqual(p.max!);
    } else {
      expect(v).toBe(p.wartosc);
    }
  });
});

describe('008 (D-304): plan bierze nagrzewanie i pieczenie z receptury', () => {
  it.each(Z_PLANEM)('%s: krok „bake” trwa bakeTimeSteamMinutes + bakeTimeBrowningMinutes receptury', (id) => {
    const r = receptura(id);
    expect(krok(planDla(r), 'bake').durationMin).toBe(r.bakeTimeSteamMinutes + r.bakeTimeBrowningMinutes);
  });

  it.each(Z_PLANEM.filter((id) => receptura(id).recommendedVessel === 'dutch_oven'))('%s (garnek): kroki i fazy z PIE-GAR-001 i danych receptury', (id) => {
    const r = receptura(id);
    const kroki = planDla(r);
    const nag = krok(kroki, 'preheat_oven');
    const piec = krok(kroki, 'bake');
    expect(nag.name).toBe(sekcja('plan, krok preheat_oven, receptury w garnku (namePl)'));
    expect(nag.instructions).toBe(sekcja('plan, krok preheat_oven, receptury w garnku (instructionsPl)'));
    expect(nag.durationMin).toBe(wektor('plan.preheat_oven.dutch_oven.durationMinutes').wartosc);
    expect(nag.instructions).toContain(`${wektor('plan.preheat_oven.dutch_oven.tempC').wartosc} °C`);
    expect(piec.instructions).toBe(sekcja('plan, krok bake, receptury w garnku'));
    expect(piec.instructions).toContain(`${r.bakeTempSteamC} °C`);
    expect(piec.instructions).toContain(`${r.bakeTimeSteamMinutes} minut pod pokrywką`);
    expect(isDutchOvenStep(piec)).toBe(true);
    const fazy = fazyGarnka(piec);
    expect([fazy.lid_on.durationMin, fazy.lid_on.temperatureC]).toEqual([r.bakeTimeSteamMinutes, r.bakeTempSteamC]);
    expect([fazy.lid_off.durationMin, fazy.lid_off.temperatureC]).toEqual([r.bakeTimeBrowningMinutes, r.bakeTempBrowningC]);
    expect(stepDurationSec(piec, 'lid_off')).toBe(r.bakeTimeBrowningMinutes * 60);
    expect(fazy.lid_on.descriptionPl).toBe(sekcja('faza lid_on (descriptionPl'));
    expect(fazy.lid_on.tipPl).toBe(sekcja('faza lid_on (tipPl)'));
    expect(fazy.lid_off.descriptionPl).toBe(sekcja('faza lid_off (descriptionPl'));
    expect(fazy.lid_off.tipPl).toBe(sekcja('faza lid_off (tipPl)'));
    expect(fazy.lid_off.alertHeadlinePl).toBe(sekcja('faza lid_off (alertHeadlinePl)'));
  });

  it('brioszka (keksówka): nagrzewanie do 204 °C, pieczenie 177 °C, bez faz garnka (PIE-BRI-001)', () => {
    const r = receptura('lievito_madre_panettone_brioche');
    const kroki = planDla(r);
    const nag = krok(kroki, 'preheat_oven');
    const piec = krok(kroki, 'bake');
    expect(nag.name).toBe(sekcja('plan, krok preheat_oven, brioszka w keksówce (namePl)'));
    expect(nag.instructions).toBe(sekcja('plan, krok preheat_oven, brioszka w keksówce (instructionsPl)'));
    expect(nag.instructions).toContain(`${wektor('plan.preheat_oven.bread_pan.tempC').wartosc} °C`);
    expect(nag.instructions).toContain(`${r.bakeTempSteamC} °C`);
    expect(piec.instructions).toBe(sekcja('plan, krok bake, brioszka w keksówce'));
    expect(isDutchOvenStep(piec)).toBe(false);
    expect(TIME_SENSITIVE_STEPS).toContain(piec.id);
  });

  it('durum (stal): 250 °C z danych receptury, bez faz garnka (KAT-ALT-005)', () => {
    const r = receptura('durum_semolina_sourdough');
    const kroki = planDla(r);
    const tekst = sekcja('plan, krok preheat_oven i bake, chleb z semoliny durum na stali').split('. ');
    expect(krok(kroki, 'preheat_oven').instructions).toBe(`${tekst[0]}.`);
    expect(krok(kroki, 'bake').instructions).toBe(tekst[1]);
    expect(krok(kroki, 'preheat_oven').instructions).toContain(`${r.bakeTempSteamC} °C`);
    expect(isDutchOvenStep(krok(kroki, 'bake'))).toBe(false);
    expect(TIME_SENSITIVE_STEPS).toContain(krok(kroki, 'bake').id);
  });

  it('plan bez receptury: profil garnka ze źródła, bez szablonu 240/210 °C (odrzucony w D-304)', () => {
    const kroki = stepsFromSchedule(calculateReverseSchedule(new Date(2026, 10, 10, 12, 0)));
    expect(krok(kroki, 'bake').instructions).toBe(sekcja('plan, krok bake, receptury w garnku'));
    expect(JSON.stringify(DEFAULT_STAGE_TEMPLATES)).not.toMatch(/240°C|210°C/);
    expect(fazyGarnka(krok(kroki, 'bake')).lid_off.durationMin).toBe(krok(kroki, 'bake').durationMin! - 20);
    expect(PIECZENIE_DOMYSLNE).toEqual({ naczynie: 'dutch_oven', tempParaC: 232, tempRumienienieC: 232, minPara: 20, minRumienienie: 25 });
    expect(ID_PIECZENIA_BEZ_GARNKA.every((id) => TIME_SENSITIVE_STEPS.includes(id))).toBe(true);
  });

  it('pieczenieDlaId: receptura żytnia, na drożdżach albo nieznana nie zmienia planu (bez pieczenia z receptury)', () => {
    expect(pieczenieDlaId('rye_100_pan', true)).toBeUndefined();
    expect(pieczenieDlaId('pizza_napoletana_48h', false)).toBeUndefined();
    expect(pieczenieDlaId('nie-ma-takiej', false)).toBeUndefined();
    expect(pieczenieDlaId(undefined, false)).toBeUndefined();
    expect(pieczenieDlaId('pain_de_campagne', false)).toEqual(pieczenieZReceptury(receptura('pain_de_campagne')));
  });

  it('krokiPieczenia: id pieczenia według naczynia (garnek „bake”, keksówka i stal bez faz garnka)', () => {
    const id = (naczynie: RecipePreset['recommendedVessel']) => krokiPieczenia({ ...PIECZENIE_DOMYSLNE, naczynie }).pieczenie.id;
    expect([id('dutch_oven'), id('bread_pan'), id('baking_steel'), id('baking_sheet')]).toEqual(['bake', 'bake_forma', 'bake_stal', 'bake']);
    expect(krokiPieczenia({ ...PIECZENIE_DOMYSLNE, minRumienienie: 22 }).pieczenie.durationMinutes).toBe(42);
  });

  it('pieczenieDlaPlanu: receptura z „Ułóż plan”; wersja drożdżowa i żyto bez pieczenia z receptury', () => {
    const r = receptura('pain_de_campagne');
    const plan = (zmiany: Partial<RecepturaPlanu>, zytni = false): RecepturaPlanu => ({
      recipeName: r.namePl, recipeId: r.id, recipeFormula: r.formula,
      calculatedRecipe: { isHighRye: zytni } as RecepturaPlanu['calculatedRecipe'], ...zmiany,
    });
    expect(pieczenieDlaPlanu(null)).toBeUndefined();
    expect(pieczenieDlaPlanu(plan({}))).toEqual(pieczenieZReceptury(r));
    expect(pieczenieDlaPlanu(plan({ wersja: 'drozdze' }))).toBeUndefined();
    expect(pieczenieDlaPlanu(plan({}, true))).toBeUndefined();
  });
});
