/**
 * M1-audytor-generalny-088 (06-tresci-601; opcja a): krok nagrzewania i pieczenia w keksówce i na stali ma tekst ze
 * źródła z liczbami tylko dla receptur wektora D-304 (brioszka, durum); pozostałe receptury (żytnie po zmianie mąk
 * do żyta ≤ 50%, łotewska) dostają krok bez liczb z odesłaniem do „O recepturze” — bez cudzych temperatur i bez
 * „brioszki”. Test akceptacyjny z raportu reaudytu 06-tresci (sekcja 06-tresci-601).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CATALOG_RECIPES } from '../src/recipes/katalog';
import type { RecipePreset } from '../src/recipes/presets';
import { calculateReverseSchedule } from '../src/core/reverse-scheduler';
import { stepsFromSchedule, type SessionStep } from '../src/core/bake-steps';
import { calculateDoughRecipe } from '../src/core/domain-rules';
import { pieczenieDlaId, pieczenieDlaPlanu, TEKST_PIECZENIA_ZE_ZRODLA } from '../src/lib/pieczenie-planu';
import { poCoTenKrok } from '../src/core/po-co-ten-krok';
import { setLang, t } from '../src/lib/i18n';

const root = path.join(__dirname, '..');
const WEKTOR: { parametry: { parametr: string }[] } = JSON.parse(
  fs.readFileSync(path.join(root, 'docs', 'tresci', 'wektory', 'pieczenie-receptur-2026-11-09.json'), 'utf8'),
);
/** Receptury wektora D-304: teksty ze źródła dosłownie z pieczenie-receptur.md (sprawdza je test 008). */
const Z_WEKTORA = new Set(WEKTOR.parametry.map((p) => p.parametr.split('.')[0]));
/** Zdania pliku treści pieczenia (bez znaczników): tekst kroku receptury wektora musi być jednym z nich złożonym. */
const SEKCJE = fs.readFileSync(path.join(root, 'docs', 'tresci', 'pl', 'pieczenie-receptur.md'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '')
  .split('\n## ')
  .map((b) => b.split('\n').slice(1).filter((l) => l.trim()).map((l) => l.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim()));
/** Tekst sekcji (zdania złączone spacją) albo pojedyncze zdanie sekcji (stal: nagrzewanie i pieczenie w jednej sekcji). */
const TRESC = [...SEKCJE.map((z) => z.join(' ')), ...SEKCJE.flat()];

/** Liczby przy °C i minutach w tekście (zakres „8–10” daje obie liczby). */
function liczbyTempICzasu(tekst: string): number[] {
  const out: number[] = [];
  for (const m of tekst.matchAll(/(\d+)(?:[–-](\d+))?\s*(?:°C|°\s?C|minut\w*|min\b)/g)) {
    out.push(Number(m[1]));
    if (m[2]) out.push(Number(m[2]));
  }
  return out;
}

const danePieczenia = (r: RecipePreset) => [
  r.bakeTempSteamC, r.bakeTempBrowningC, r.bakeTimeSteamMinutes, r.bakeTimeBrowningMinutes, r.bakeTimeSteamMinutes + r.bakeTimeBrowningMinutes,
];
const krokiPieczenia = (kroki: SessionStep[]) => kroki.filter((s) => s.category === 'preheat_oven' || s.id.startsWith('bake'));
const plan = (p: ReturnType<typeof pieczenieDlaId>) => stepsFromSchedule(calculateReverseSchedule(new Date(2026, 10, 12, 12), { pieczenie: p }));

const Z_ZAKWASEM = CATALOG_RECIPES.filter((r) => r.formula.starterPercentage > 0 && pieczenieDlaId(r.id, false));

describe('088: tekst pieczenia bez cudzych liczb i bez brioszki poza brioszką', () => {
  it('TEKST_PIECZENIA_ZE_ZRODLA = receptury wektora D-304 w keksówce i na stali (brioszka, durum)', () => {
    const pozaGarnkiem = CATALOG_RECIPES.filter((r) => Z_WEKTORA.has(r.id) && r.formula.starterPercentage > 0 && r.recommendedVessel !== 'dutch_oven');
    expect([...TEKST_PIECZENIA_ZE_ZRODLA].sort()).toEqual(pozaGarnkiem.map((r) => r.id).sort());
    expect([...TEKST_PIECZENIA_ZE_ZRODLA].sort()).toEqual(['durum_semolina_sourdough', 'lievito_madre_panettone_brioche']);
  });

  it('katalog ma receptury z zakwasem spoza wektora D-304 (żytnie w keksówce, łotewska na stali)', () => {
    expect(Z_ZAKWASEM.filter((r) => !Z_WEKTORA.has(r.id)).map((r) => r.id).sort()).toEqual(['borodinsky_rye', 'latvian_scalded_rye', 'rye_100_pan']);
  });

  it.each(Z_ZAKWASEM.map((r) => [r.id, r] as const))('%s: liczby °C i min w krokach nagrzewania i pieczenia = dane receptury albo brak liczb', (id, r) => {
    for (const k of krokiPieczenia(plan(pieczenieDlaId(id, false)))) {
      const tekst = `${k.name} ${k.instructions}`;
      if (Z_WEKTORA.has(id)) {
        // Wektor D-304: tekst dosłownie ze źródła (liczby z twierdzeń PIE-GAR-001, PIE-BRI-001, KAT-ALT-005; test 008)
        expect(TRESC).toContain(k.instructions);
      } else {
        for (const n of liczbyTempICzasu(tekst)) expect(danePieczenia(r)).toContain(n);
      }
      if (id !== 'lievito_madre_panettone_brioche') expect(tekst.toLowerCase()).not.toContain('brioszk');
    }
  });

  it.each(['rye_100_pan', 'borodinsky_rye', 'latvian_scalded_rye'])('%s przy 50%% żyta: plan bez „brioszk” i bez obcych temperatur', (id) => {
    const r = CATALOG_RECIPES.find((x) => x.id === id)!;
    const zyto = r.formula.flours[0]!;
    const recipeFormula = { ...r.formula, flours: [{ ...zyto, percentage: 50 }, { name: 'Mąka pszenna typ 650 (bułkowa)', percentage: 50, type: 'pszenna_650' }] };
    const calculatedRecipe = calculateDoughRecipe(recipeFormula as typeof r.formula);
    expect(calculatedRecipe.isHighRye).toBe(false);
    const p = pieczenieDlaPlanu({ recipeName: r.namePl, recipeId: id, calculatedRecipe, recipeFormula: recipeFormula as typeof r.formula });
    expect(p).toBeDefined();
    for (const k of krokiPieczenia(plan(p))) {
      const tekst = `${k.name} ${k.instructions}`;
      expect(tekst.toLowerCase()).not.toContain('brioszk');
      for (const n of liczbyTempICzasu(tekst)) expect(danePieczenia(r)).toContain(n);
    }
  });

  it('tekst bez liczb dosłownie z pieczenie-receptur.md (PL i EN), nagrzewanie bez zdania o garnku', () => {
    const sekcjaZ = (jezyk: 'pl' | 'en', poczatek: string) => {
      const plik = fs.readFileSync(path.join(root, 'docs', 'tresci', jezyk, 'pieczenie-receptur.md'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
      const blok = plik.split('\n## ').find((b) => b.startsWith(poczatek))!;
      return blok.split('\n').slice(1).filter((l) => l.trim()).map((l) => l.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim()).join(' ');
    };
    const kroki = krokiPieczenia(plan(pieczenieDlaId('latvian_scalded_rye', false)));
    const nag = kroki.find((k) => k.category === 'preheat_oven')!;
    const piec = kroki.find((k) => k.id === 'bake_stal')!;
    expect(nag.instructions).toBe(sekcjaZ('pl', 'plan, krok preheat_oven, keksówka i stal poza wektorem D-304'));
    expect(piec.instructions).toBe(sekcjaZ('pl', 'plan, krok bake, keksówka i stal poza wektorem D-304'));
    expect(poCoTenKrok(nag)).toBeNull();
    setLang('en');
    try {
      expect(t(nag.instructions)).toBe(sekcjaZ('en', 'plan, step preheat_oven, loaf pan and steel outside the D-304 vector'));
      expect(t(piec.instructions)).toBe(sekcjaZ('en', 'plan, step bake, loaf pan and steel outside the D-304 vector'));
    } finally {
      setLang('pl');
    }
  });
});
