// 112: wzorzec zamiast listy — w tekstach PL widocznych w 1.0 nawias nie zawiera słowa angielskiego (słowo z tekstów EN,
// którego nie ma w polskich tekstach poza nawiasami); nazwy własne nazwane z powodem. Receptury bazowe (presets.ts)
// i „(hooch)” w zakresie [M1-audytor-generalny-112; 04-studio-projektowe-027, 04-studio-projektowe-507]
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { EN } from '../src/lib/i18n.en';
import { MASTER_RECIPES } from '../src/recipes/presets';
import { prepareBakeAgainRecipe } from '../src/lib/recipe-navigation';
import type { StoredBakeLog } from '../src/data/db';
import { ZRODLA_WIEDZY } from '../src/core/zrodla-wiedzy';

const rootDir = path.resolve(__dirname, '..');
const rel = (f: string) => path.relative(rootDir, f).split(path.sep).join('/');

function walk(dir: string): string[] {
  let res: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['__tests__', 'node_modules', 'i18n-en', 'i18n-slowniki'].includes(entry.name)) res = res.concat(walk(full));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name)) res.push(full);
  }
  return res;
}

/** Pliki bez wejścia w 1.0 (nazwane, z powodem; jak w tests/wstawki-angielskie-112.test.ts, bez wyłączenia presets.ts). */
const BEZ_WEJSCIA = [
  'src/core/bread-school-lessons.ts', // Akademia, F-44 wyłączone
  'src/core/techniques/prep-ferment-techniques.ts', // Akademia
  'src/core/techniques/shaping-baking-techniques.ts', // Akademia
  'src/lib/pdf-sheet-generator.ts', // druk, F-50 wyłączone
  'src/core/legacy-steps-v1.ts', // zamrożone kroki starych sesji
  'src/core/volume-converter.ts', // przelicznik objętości, F-45 wyłączone
  'src/components/VolumeConverterModal.tsx', // przelicznik objętości, F-45 wyłączone
  'src/core/bake-loss.ts', // strata piecowa, F-48 PÓŻNIEJ; jej teksty w „Kopiuj” receptury to zadanie 199 (rola 03)
];

/**
 * Teksty spoza zakresu 04 (nazwane, z powodem):
 * - „(hooch)”: treść krytyczna zakwasu (docs/tresci/<język>/zakwas-bezpieczenstwo.md z przeglądem per język, zadanie 135);
 *   zmiana brzmienia tylko przez rolę 06 z przeglądem treści krytycznej;
 * - „(Acetobacter)”: zdanie Doktora bez twierdzenia, zadanie 163 (rola 06).
 */
const TRESC_ROLI_06 = ['(hooch)', '(Acetobacter)'];

/** Nazwy własne, skróty i słowa obecne w polszczyźnie (naan, semolina) dozwolone w nawiasie. */
const NAZWY_WLASNE = new Set(['tartine', 'king', 'arthur', 'baking', 'ddt', 'pdf', 'csv', 'qr', 'json', 'app', 'store', 'apple', 'ios', 'excel', 'naan', 'semolina']);

function literaly(plik: string): { tekst: string; linia: number }[] {
  const sf = ts.createSourceFile(plik, fs.readFileSync(plik, 'utf8'), ts.ScriptTarget.Latest, true,
    plik.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out: { tekst: string; linia: number }[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isJsxText(n)) {
      out.push({ tekst: n.text, linia: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1 });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

const slowa = (s: string) => (s.toLowerCase().match(/\p{L}+/gu) ?? []);
const bezNawiasow = (s: string) => s.replace(/\([^)]*\)/g, ' ');
const SLOWA_EN = new Set(Object.values(EN).flatMap(slowa));
const SLOWA_PL = new Set(Object.keys(EN).map(bezNawiasow).flatMap(slowa));

/**
 * Terminy angielskie, które występują też w polskim tekście poza nawiasem (porada „technika Coil Fold”), więc lista
 * słów PL by je przepuszczała; w nawiasie tekstu PL to dalej wstawka [reaudit-noc N-9].
 */
const TERMINY_EN = new Set(['coil', 'fold']);

/**
 * Nazwy źródeł na ekranie „Źródła wiedzy” (M3 T2, D-123): opis bibliograficzny z nazwą instytucji albo tytułem w nawiasie
 * (np. „(Colorado State University)”, „(Bread Lines 2009)”) to nazwy własne, nie wstawki; opisy ekranu nadal sprawdzane.
 */
const NAZWY_ZRODEL = new Set(ZRODLA_WIEDZY.flatMap((g) => g.zrodla.map((z) => z.nazwa)));

/** Słowa angielskie w nawiasach tekstu PL. */
function wstawki(tekst: string): string[] {
  const bezParametrow = TRESC_ROLI_06.reduce((s, x) => s.split(x).join(' '), tekst.replace(/\{[^}]*\}/g, ' '));
  return [...bezParametrow.matchAll(/\(([^)]*)\)/g)].flatMap((m) =>
    slowa(m[1]).filter((w) => /^[a-z]{3,}$/.test(w) && SLOWA_EN.has(w) && (!SLOWA_PL.has(w) || TERMINY_EN.has(w)) && !NAZWY_WLASNE.has(w)));
}

describe('M1-audytor-generalny-112: wzorzec nawiasu ze słowem angielskim w tekstach PL', () => {
  it('kontrola wzorca: wykrywa terminy angielskie, przepuszcza polskie, parametry i nazwy własne', () => {
    expect(wstawki('Test okna glutenowego (Windowpane)')).toEqual(['windowpane']);
    expect(wstawki('Bagietka paryska z Poolishem (Baguette de Tradition)').length).toBeGreaterThan(0);
    expect(wstawki('Uśpiony w lodówce ({elapsedDays} dni)')).toEqual([]);
    expect(wstawki('Zbyt kwaśny (Octowy)')).toEqual([]);
    expect(wstawki('Mąka pszenna (typ 750)')).toEqual([]);
    expect(wstawki('Ciasto (według King Arthur Baking)')).toEqual([]);
    expect(wstawki('4 serie składań (Coil Fold) w odstępach 30 minut')).toEqual(['coil', 'fold']);
  });

  it('teksty PL z wpisem EN w plikach z wejściem w 1.0 (w tym receptury bazowe) bez wstawek', () => {
    const pliki = ['app', 'src'].flatMap((d) => walk(path.join(rootDir, d))).filter((f) => !BEZ_WEJSCIA.includes(rel(f)));
    expect(pliki.map(rel)).toContain('src/recipes/presets.ts');
    const znalezione: string[] = [];
    for (const f of pliki) {
      for (const { tekst, linia } of literaly(f)) {
        if (!(tekst in EN) || NAZWY_ZRODEL.has(tekst)) continue;
        const w = wstawki(tekst);
        if (w.length) znalezione.push(`${rel(f)}:${linia}: ${w.join(', ')} w „${tekst.slice(0, 80)}”`);
      }
    }
    expect(znalezione).toEqual([]);
  });

  it('„Piecz ponownie” wpisu z dawną nazwą receptury bazowej wczytuje tę recepturę (dane użytkownika bez zmian)', () => {
    const DAWNE: [string, string][] = [
      ['Mistrzowski wiejski (Tartine Style 80%)', 'Wiejski chleb na zakwasie, 80%'],
      // M3 T2 (D-123): nazwa bez piekarni; wpisy Dziennika z nazwą z lat 2026-10-21…23 dalej znajdują recepturę
      ['Mistrzowski wiejski w stylu Tartine, 80%', 'Wiejski chleb na zakwasie, 80%'],
      ['San Francisco Sourdough (Wyrazista Kwasowość)', 'Chleb w stylu San Francisco o wyrazistej kwasowości'],
      ['Bagietka paryska z Poolishem (Baguette de Tradition)', 'Bagietka paryska na poolishu'],
    ];
    for (const [stara, nowa] of DAWNE) {
      const preset = MASTER_RECIPES.find((r) => r.namePl === nowa);
      expect(preset).toBeDefined();
      const log = { id: 'b1', recipeName: stara, startedAt: 1, finishedAt: 2 } as unknown as StoredBakeLog;
      const p = prepareBakeAgainRecipe(log, [])!;
      expect(p.id).toBe(preset!.id);
      expect(p.formula).toEqual(preset!.formula);
    }
  });
});
