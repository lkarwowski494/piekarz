/**
 * M1-audytor-generalny-089 (06-tresci-602; DEC-21 a; zmienia D-309 → opcja d, do weta D-289): brioszka na Lievito Madre
 * nie dostaje „Ułóż plan” ani „Zacznij wypiek”/„Zaplanuj” z „Piecz ponownie”, dopóki czasy rośnięcia nie mają źródła
 * (PIE-BRI-900 otwarte). Ten sam `powodBezPlanu` blokuje ekran receptury i plan wypieku (harmonogram). Pozostałe
 * receptury katalogu: plan bez zmian.
 */
import { CATALOG_RECIPES } from '../src/recipes/katalog';
import { powodBezPlanu } from '../src/lib/plan-receptury';
import { setLang, t } from '../src/lib/i18n';
import { BRIOCHE_RECIPE_IDS } from '../src/core/brioche-stages';
import * as fs from 'node:fs';
import * as path from 'node:path';

/** Sekcja brioszki w pliku treści powody-bez-planu.md (089) bez znacznika [T:…]. */
function powodZTresci(jezyk: 'pl' | 'en'): string {
  const plik = fs.readFileSync(path.join(__dirname, '..', 'docs', 'tresci', jezyk, 'powody-bez-planu.md'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const blok = plik.split('\n## ').find((b) => b.startsWith('lievito_madre_panettone_brioche'))!;
  return blok.split('\n').slice(1).filter((l) => l.trim()).map((l) => l.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim()).join(' ');
}

const BRIOSZKA = 'lievito_madre_panettone_brioche';
const POWOD = 'Plan dla tej receptury na zakwasie czeka na czasy rośnięcia ciasta. Ilości i wskazówki są wyżej.';
const receptura = (id: string) => CATALOG_RECIPES.find((r) => r.id === id)!;

/** Receptury z planem przed 089 (D-3: z zakwasem), bez brioszki. */
const Z_PLANEM_BEZ_ZMIAN = [
  'borodinsky_rye', 'country_loaf_72', 'durum_semolina_sourdough', 'graham_bread_honey', 'latvian_scalded_rye',
  'pain_de_campagne', 'rye_100_pan', 'san_francisco_sourdough', 'spelt_ancient_seeded', 'tartine_high_hydration_80',
];

describe('089: brioszka na Lievito Madre bez planu do zamknięcia PIE-BRI-900', () => {
  beforeEach(() => setLang('pl'));

  it('powodBezPlanu dla brioszki zwraca powód: czasy rośnięcia bez źródła, ilości i wskazówki wyżej', () => {
    const r = receptura(BRIOSZKA);
    expect(r.formula.starterPercentage).toBeGreaterThan(0);
    expect(powodBezPlanu(r.formula, { recipeId: BRIOSZKA })).toBe(POWOD);
    // „Piecz ponownie” z Dziennika przekazuje wersję zakwasową albo brak wersji — w obu przypadkach blokada
    expect(powodBezPlanu(r.formula, { recipeId: BRIOSZKA, wersja: 'zakwas' })).toBe(POWOD);
    expect(BRIOCHE_RECIPE_IDS).toEqual([BRIOSZKA]);
  });

  it('katalog: brioszka bez planu, pozostałe receptury z zakwasem z planem bez zmian, bez zakwasu jak D-3', () => {
    const zPlanem = CATALOG_RECIPES.filter((r) => powodBezPlanu(r.formula, { recipeId: r.id }) === null).map((r) => r.id).sort();
    expect(zPlanem).toEqual(Z_PLANEM_BEZ_ZMIAN);
    for (const r of CATALOG_RECIPES.filter((x) => x.formula.starterPercentage <= 0)) {
      expect(powodBezPlanu(r.formula, { recipeId: r.id })).toBe(t('Plan wypieku jest tylko dla chleba na zakwasie, a ta receptura nie ma zakwasu.'));
    }
  });

  it('PL i EN dosłownie z docs/tresci/pl|en/powody-bez-planu.md', () => {
    expect(powodZTresci('pl')).toBe(POWOD);
    setLang('en');
    expect(powodBezPlanu(receptura(BRIOSZKA).formula, { recipeId: BRIOSZKA })).toBe(powodZTresci('en'));
  });
});
