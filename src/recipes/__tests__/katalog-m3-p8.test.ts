// M3 p8 (D-157, D-177, D-229): 11 receptur „wchodzi” katalogu. Procenty piekarskie liczone w teście z danych wejściowych źródła
// (dane z docs/tresci/rejestr.json: KAT-ALT, KAT-ILB, KAT-BUL, KAT-SLO, KAT-RUP, KAT-KAR, KAT-OBW, KAT-KOL), nie przepisane z formuły.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { calculateDoughRecipe } from '../../core/domain-rules';
import { EN } from '../../lib/i18n.en';
import { MASTER_RECIPES } from '../presets';
import { CATALOG_RECIPES, KATALOG_M3_RECIPES, filterCatalogRecipes } from '../katalog';

const zaokr1 = (x: number) => Math.round(x * 10 + 1e-9) / 10; // połówki w górę, z poprawką na błąd zmiennoprzecinkowy
const fnaC = (f: number) => Math.round(((f - 32) * 5) / 9);
const sr = (a: number, b: number) => (a + b) / 2;
const porcent = (czesc: number, maka: number) => (czesc / maka) * 100;
const DRO_SUCHE_NA_SWIEZE = 0.35; // D-172: świeże = suche ÷ 0,35

interface Oczek {
  id: string;
  kategoria: 'sourdough' | 'rye' | 'yeast' | 'sweet';
  woda: number; sol: number; drozdze: number; zakwas: number;
  temp: number; minuty: number;
  maki: readonly [string, number][]; // typ mąki, procent
}

const MAKA_650 = 'pszenna_650';
const ILB_WODA = 296.25; // 1 1/4 szklanki wody (KAT-ILB-005)
const OCZEKIWANE: Oczek[] = [
  // Altamura: na 100 kg semoliny 60 l wody, 2 kg soli, 20 kg zakwasu; 250 °C, 15 + 45 min (KAT-ALT-001, -005)
  { id: 'durum_semolina_sourdough', kategoria: 'sourdough', woda: porcent(60, 100), sol: porcent(2, 100), drozdze: 0, zakwas: porcent(20, 100), temp: 250, minuty: 15 + 45, maki: [['durum', 100]] },
  // Illinois: mąka 3,5 szklanki po 125 g; 1 opakowanie drożdży suchych 7,2 g; 1 łyżeczka soli 6 g; 400 °F, 30–40 min
  { id: 'white_pan_loaf', kategoria: 'yeast', woda: zaokr1(porcent(ILB_WODA, 437.5)), sol: zaokr1(porcent(6, 437.5)), drozdze: zaokr1(porcent(7.2 / DRO_SUCHE_NA_SWIEZE, 437.5)), zakwas: 0, temp: fnaC(400), minuty: sr(30, 40), maki: [[MAKA_650, 100]] },
  { id: 'half_whole_wheat_loaf', kategoria: 'yeast', woda: zaokr1(porcent(ILB_WODA, 428.75)), sol: zaokr1(porcent(6, 428.75)), drozdze: zaokr1(porcent(7.2 / DRO_SUCHE_NA_SWIEZE, 428.75)), zakwas: 0, temp: fnaC(400), minuty: sr(30, 40), maki: [[MAKA_650, 50], ['pszenna_razowa', 50]] },
  { id: 'half_rye_loaf', kategoria: 'rye', woda: zaokr1(porcent(ILB_WODA, 397.25)), sol: zaokr1(porcent(6, 397.25)), drozdze: zaokr1(porcent(7.2 / DRO_SUCHE_NA_SWIEZE, 397.25)), zakwas: 0, temp: fnaC(400), minuty: sr(30, 40), maki: [[MAKA_650, 50], ['zytnia_720', 50]] },
  // Rupjmaize: mąka żytnia 10 kg; woda 6–8 l, sól 0,15–0,2 kg, zaczyn 4–16%; drugi etap pieczenia 200–250 °C, łącznie 1–2 h
  { id: 'latvian_scalded_rye', kategoria: 'rye', woda: zaokr1(porcent(sr(6, 8), 10)), sol: zaokr1(porcent(sr(0.15, 0.2), 10)), drozdze: 0, zakwas: sr(4, 16), temp: sr(200, 250), minuty: sr(60, 120), maki: [['zytnia_2000', 100]] },
  // Karjalanpiirakka: 200 g wody na 275–350 g mąki, soli źródło nie podaje; 250–300 °C, 15–20 min (zaokrąglone w górę do pełnej minuty)
  { id: 'karelian_rye_pasties', kategoria: 'rye', woda: zaokr1(porcent(200, sr(275, 350))), sol: 0, drozdze: 0, zakwas: 0, temp: sr(250, 300), minuty: Math.ceil(sr(15, 20)), maki: [['zytnia_720', 100]] },
  // Obwarzanek: na 100 kg mąki 40–48 l wody, 1–2 kg drożdży, 1–1,5 kg soli; 250–320 °C, 10–17 min
  { id: 'boiled_bread_ring', kategoria: 'yeast', woda: porcent(sr(40, 48), 100), sol: zaokr1(porcent(sr(1, 1.5), 100)), drozdze: porcent(sr(1, 2), 100), zakwas: 0, temp: sr(250, 320), minuty: Math.ceil(sr(10, 17)), maki: [[MAKA_650, 100]] },
  // Bułki mleczne: mąka 437,5 g, 1/4 szklanki wody 59,25 g; 400–425 °F, 10–12 min
  { id: 'milk_dinner_rolls', kategoria: 'yeast', woda: zaokr1(porcent(59.25, 437.5)), sol: zaokr1(porcent(6, 437.5)), drozdze: zaokr1(porcent(7.2 / DRO_SUCHE_NA_SWIEZE, 437.5)), zakwas: 0, temp: fnaC(sr(400, 425)), minuty: sr(10, 12), maki: [[MAKA_650, 100]] },
  // Kołacz: mąka 0,8 kg, drożdże 0,05 kg (0,04–0,06), woda 0 (płyn to mleko), soli bez ilości; 180–200 °C, 30–60 min
  { id: 'cheese_crumble_yeast_cake', kategoria: 'sweet', woda: 0, sol: 0, drozdze: zaokr1(porcent(0.05, 0.8)), zakwas: 0, temp: sr(180, 200), minuty: sr(30, 60), maki: [[MAKA_650, 100]] },
  // Słodkie ciasto: mąka 625 g, 1/2 szklanki wody 118,5 g, 2 łyżeczki soli 12 g, 2 opakowania drożdży 14,4 g; 350 °F, 25 min; wieniec 375 °F, 25 min
  { id: 'sweet_yeast_buns', kategoria: 'sweet', woda: zaokr1(porcent(118.5, 625)), sol: zaokr1(porcent(12, 625)), drozdze: zaokr1(porcent(14.4 / DRO_SUCHE_NA_SWIEZE, 625)), zakwas: 0, temp: fnaC(350), minuty: 25, maki: [[MAKA_650, 100]] },
  { id: 'cinnamon_tea_ring', kategoria: 'sweet', woda: zaokr1(porcent(118.5, 625)), sol: zaokr1(porcent(12, 625)), drozdze: zaokr1(porcent(14.4 / DRO_SUCHE_NA_SWIEZE, 625)), zakwas: 0, temp: fnaC(375), minuty: 25, maki: [[MAKA_650, 100]] },
];

const znajdz = (id: string) => CATALOG_RECIPES.find((r) => r.id === id);

describe('M3 p8: katalog 11 receptur — wektory ilości ze źródeł (D-157, D-177)', () => {
  it('katalog ma 11 nowych receptur o unikalnych id, poza 15 istniejącymi', () => {
    expect(KATALOG_M3_RECIPES.map((r) => r.id).sort()).toEqual(OCZEKIWANE.map((o) => o.id).sort());
    expect(CATALOG_RECIPES).toHaveLength(26);
    expect(new Set(CATALOG_RECIPES.map((r) => r.id)).size).toBe(26);
    expect(CATALOG_RECIPES.slice(0, 15)).toEqual(MASTER_RECIPES);
  });

  it.each(OCZEKIWANE)('$id: procenty piekarskie, mąki, rodzaj i pieczenie jak w źródle', (o) => {
    const r = znajdz(o.id);
    expect(r).toBeDefined();
    if (!r) return;
    expect(r.category).toBe(o.kategoria);
    expect(r.formula.waterPercentage).toBeCloseTo(o.woda, 5);
    expect(r.formula.saltPercentage).toBeCloseTo(o.sol, 5);
    expect(r.formula.extraYeastPercentage ?? 0).toBeCloseTo(o.drozdze, 5);
    expect(r.formula.starterPercentage).toBeCloseTo(o.zakwas, 5);
    expect(r.formula.flours.map((f) => [f.type, f.percentage])).toEqual(o.maki);
    expect(r.bakeTempBrowningC).toBe(Math.round(o.temp));
    expect(r.bakeTempSteamC).toBe(Math.round(o.temp));
    expect(r.bakeTimeSteamMinutes + r.bakeTimeBrowningMinutes).toBe(o.minuty);
  });

  it.each(OCZEKIWANE)('$id: liczy się w kalkulatorze i skaluje do masy ciasta (suma mąk 100%)', (o) => {
    const r = znajdz(o.id);
    if (!r) throw new Error('brak ' + o.id);
    expect(r.formula.flours.reduce((s, f) => s + f.percentage, 0)).toBeCloseTo(100, 5);
    for (const masa of [500, 1000, 2500]) {
      const w = calculateDoughRecipe({ ...r.formula, targetDoughWeightGrams: masa });
      expect(w.baseFlourWeightGrams).toBeGreaterThan(0);
      expect(Math.abs(w.sumCheckGrams - masa)).toBeLessThanOrEqual(2);
    }
  });

  it('receptury drożdżowe nie mają zakwasu, a na zakwasie (Altamura) nie mają drożdży (zasada rodzajów D-154)', () => {
    for (const o of OCZEKIWANE) {
      const f = znajdz(o.id)?.formula;
      if (o.id === 'durum_semolina_sourdough') expect([f?.starterPercentage, f?.extraYeastPercentage ?? 0]).toEqual([20, 0]);
      if (o.kategoria === 'yeast') expect(f?.starterPercentage).toBe(0);
    }
  });

  it('pola receptury i formuły są te same co w istniejących presetach (bez nowych pól zapisu)', () => {
    const polaPresetu = new Set(Object.keys(MASTER_RECIPES[0]).concat(['difficulty']));
    const polaFormuly = new Set(['flours', 'waterPercentage', 'saltPercentage', 'starterPercentage', 'starterHydration', 'extraYeastPercentage', 'targetDoughWeightGrams']);
    for (const r of KATALOG_M3_RECIPES) {
      expect(Object.keys(r).filter((k) => !polaPresetu.has(k))).toEqual([]);
      expect(Object.keys(r.formula).filter((k) => !polaFormuly.has(k))).toEqual([]);
    }
  });
});

describe('M3 p8: katalog na liście i w filtrach rodzaju', () => {
  it('filtr „all” zwraca 26 receptur: 15 dotychczasowych w tej samej kolejności, potem 11 nowych', () => {
    expect(filterCatalogRecipes('all')).toEqual(CATALOG_RECIPES);
    expect(filterCatalogRecipes('all').slice(0, 15).map((r) => r.id)).toEqual(MASTER_RECIPES.map((r) => r.id));
  });

  it.each([
    ['sourdough', ['durum_semolina_sourdough']],
    ['rye', ['half_rye_loaf', 'latvian_scalded_rye', 'karelian_rye_pasties']],
    ['yeast', ['white_pan_loaf', 'half_whole_wheat_loaf', 'boiled_bread_ring', 'milk_dinner_rolls']],
    ['pizza_sweet', ['cheese_crumble_yeast_cake', 'sweet_yeast_buns', 'cinnamon_tea_ring']],
  ])('filtr %s obejmuje nowe pozycje', (filtr, nowe) => {
    const ids = filterCatalogRecipes(filtr).map((r) => r.id);
    for (const id of nowe) expect(ids).toContain(id);
    expect(filterCatalogRecipes(filtr).every((r) => (filtr === 'pizza_sweet' ? r.category === 'pizza' || r.category === 'sweet' : r.category === filtr))).toBe(true);
  });
});

// Parser tekstów roli 06: nagłówek „## id.pole”, zdania w osobnych wierszach z końcowym znacznikiem [T:…].
function teksty(plik: string): Record<string, string> {
  const wynik: Record<string, string[]> = {};
  let klucz = '';
  for (const wiersz of readFileSync(join(__dirname, '../../../docs/tresci', plik), 'utf8').replace(/\r/g, '').split('\n')) {
    const h = /^## ([a-z_]+\.(?:name|description|notes))$/.exec(wiersz);
    if (h?.[1]) { klucz = h[1]; wynik[klucz] = []; continue; }
    if (klucz && wiersz.trim() && !wiersz.startsWith('<!--') && !wiersz.startsWith('# ')) wynik[klucz]?.push(wiersz.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim());
  }
  return Object.fromEntries(Object.entries(wynik).map(([k, v]) => [k, v.join(' ')]));
}

describe('M3 p8: teksty receptur dosłownie z docs/tresci (D-190) i przekład EN', () => {
  const PL = teksty('pl/katalog-m3.md');
  const ENT = teksty('en/katalog-m3.md');

  it.each(KATALOG_M3_RECIPES.map((r) => [r.id, r] as const))('%s: nazwa, opis i notatka PL dosłownie z katalog-m3.md', (id, r) => {
    expect([r.namePl, r.descriptionPl, r.notesPl]).toEqual([PL[`${id}.name`], PL[`${id}.description`], PL[`${id}.notes`]]);
    expect(r.notesPl.length).toBeGreaterThan(100);
  });

  it.each(KATALOG_M3_RECIPES.map((r) => [r.id, r] as const))('%s: słownik EN ma nazwę, opis i notatkę dosłownie z en/katalog-m3.md', (id, r) => {
    expect([EN[r.namePl], EN[r.descriptionPl], EN[r.notesPl ?? '']]).toEqual([ENT[`${id}.name`], ENT[`${id}.description`], ENT[`${id}.notes`]]);
  });

  it.each(KATALOG_M3_RECIPES.map((r) => [r.id, r] as const))('%s: bez nazw chronionych w tytule i bez twierdzeń zdrowotnych (D-177, E-8)', (_id, r) => {
    expect(r.namePl).not.toMatch(/Altamura|Karjalanpiirakka|rupjmaize|Obwarzanek krakowski|Kołocz śląski|w stylu/i);
    expect([r.namePl, r.descriptionPl, r.notesPl].filter((s) => /odżywcz|zdrow|dietetycz/i.test(s))).toEqual([]);
    expect(`${EN[r.namePl]} ${EN[r.descriptionPl]}`).not.toMatch(/nourish|nutritious|healthy|wholesome/i);
  });
});
