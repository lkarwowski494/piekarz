// 112: teksty widoczne w PL bez nawiasów z angielskim terminem (kroki planu, Doktor, testy kuchenne, pogotowie ciasta);
// EN może mieć termin angielski (design-spec §8) [M1-audytor-generalny-112; 04-studio-projektowe-027]
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { EN } from '../src/lib/i18n.en';
import { DEFAULT_STAGE_TEMPLATES } from '../src/scheduler/reverse-scheduler';
import { diagnoseBreadDefect } from '../src/doctor/diagnostics';
import { DOUGH_RECOVERY_PROTOCOLS } from '../src/doctor/dough-recovery';

const rootDir = path.resolve(__dirname, '..');

function walk(dir: string): string[] {
  let res: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['__tests__', 'node_modules', 'i18n-en'].includes(entry.name)) res = res.concat(walk(full));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
      res.push(full);
    }
  }
  return res;
}
const rel = (f: string) => path.relative(rootDir, f).split(path.sep).join('/');

/** Terminy z audytu 04-studio-projektowe-027 i z przeglądu tekstów widocznych (grep nawiasów). */
const WSTAWKI = [
  '(Under-proofed / Flying Crust)', '(Peak)', '(Poke Test)', '(Bassinage)', '(Cold Retard', '(Pre-shape)',
  '(Bench Rest)', '(Levain)', '(Dutch Oven)', '(Cloche)', '(Pullman)',
  '(Stretch & Fold / Coil Fold)', '(Gummy Crumb)', '(Over-proofed)', '(Side Blow-out)', '(Lack of Ear)',
  'Surface Tension)', '(Pale Crust)', '(Excessively Sour)', '(DDT ', '(Bland Flavor)', '(Dense Crumb)',
  '(Blowout)', '(Tin Loaf)', '(Coil Fold)', '(dimpling)', '(bassinage)', '(Oven Spring)',
];

/**
 * Pliki bez wejścia w 1.0 albo poza zakresem 112 (nazwane, z powodem):
 * - Akademia (wejscieWidoczne('akademia') = false, F-44): lekcje i biblioteka technik;
 * - druk (wejscieWidoczne('druk') = false, F-50): karta PDF;
 * - stare sesje: zamrożone kroki LEGACY_STEPS_V1 (zapis sprzed wersji 2);
 * - receptury bazowe: znalezisko 04-studio-projektowe-039 (rola 06).
 */
const POZA_ZAKRESEM = [
  'src/core/bread-school-lessons.ts',
  'src/core/techniques/prep-ferment-techniques.ts',
  'src/core/techniques/shaping-baking-techniques.ts',
  'src/lib/pdf-sheet-generator.ts',
  'src/core/legacy-steps-v1.ts',
  'src/recipes/presets.ts',
];

function napisy(plik: string): { tekst: string; linia: number }[] {
  const sf = ts.createSourceFile(plik, fs.readFileSync(plik, 'utf8'), ts.ScriptTarget.Latest, true,
    plik.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out: { tekst: string; linia: number }[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) ||
      ts.isTemplateMiddle(n) || ts.isTemplateTail(n) || ts.isJsxText(n)) {
      out.push({ tekst: n.text, linia: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1 });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

describe('M1-audytor-generalny-112: bez angielskich wstawek w nawiasach w tekstach PL', () => {
  const pliki = ['app', 'src'].flatMap((d) => walk(path.join(rootDir, d))).filter((f) => !POZA_ZAKRESEM.includes(rel(f)));

  it('teksty w app/ i src/ (poza plikami bez wejścia w 1.0) nie mają wstawek z listy', () => {
    expect(pliki.length).toBeGreaterThan(100);
    const znalezione: string[] = [];
    for (const f of pliki) {
      for (const { tekst, linia } of napisy(f)) {
        for (const w of WSTAWKI) if (tekst.includes(w)) znalezione.push(`${rel(f)}:${linia}: „${w}” w „${tekst.slice(0, 70)}”`);
      }
    }
    expect(znalezione).toEqual([]);
  });

  it('nazwy i instrukcje kroków planu bez wstawek; każda ma wpis EN', () => {
    for (const s of DEFAULT_STAGE_TEMPLATES) {
      for (const tekst of [s.namePl, s.instructionsPl]) {
        expect(WSTAWKI.filter((w) => tekst.includes(w))).toEqual([]);
        expect(typeof EN[tekst]).toBe('string');
      }
    }
  });

  it('diagnozy Doktora bez wstawek; liczby w nawiasie zostają; każdy tekst ma wpis EN', () => {
    const wyniki = [
      { cutImmediatelyWhileSteamingHot: true }, { crumbHasHugeTopHolesWithDenseBottom: true }, { loafIsFlatLikeDisk: true },
      { loafBurstAtBottomSide: true }, { crustLacksEarCutDidNotOpen: true }, { crustIsPaleLackColor: true },
      { breadIsExcessivelySour: true }, { breadIsBlandNoFlavor: true }, {},
    ].map((s) => diagnoseBreadDefect(s));
    const teksty = wyniki.flatMap((d) => [d.titlePl, d.subtitlePl, d.biologicalCausePl, ...d.actionChecklistPl]);
    for (const tekst of teksty) {
      expect(WSTAWKI.filter((w) => tekst.includes(w))).toEqual([]);
      expect(typeof EN[tekst]).toBe('string');
    }
    expect(teksty).toContain('Wprowadź garowanie chłodnicze w lodówce (12–16 godzin w 4°C).');
    expect(teksty).toContain('Skróć fermentację burzliwą i pilnuj temperatury ciasta (24–26°C).');
  });

  it('pogotowie ciasta (Doktor) bez wstawek; każdy zmieniony tekst ma wpis EN', () => {
    const teksty = DOUGH_RECOVERY_PROTOCOLS.flatMap((p) => [p.immediateActionPl, p.scientificReasoningPl, ...p.stepByStepPl]);
    for (const tekst of teksty) expect(WSTAWKI.filter((w) => tekst.includes(w))).toEqual([]);
    for (const tekst of teksty.filter((x) => /wgłębienia|foremki keksowej\.|złożenie, aby|roztworu pozwala/.test(x))) {
      expect(typeof EN[tekst]).toBe('string');
    }
  });

  it('kontrola wzorca: lista wykrywa terminy z audytu', () => {
    expect(WSTAWKI.some((w) => 'Formowanie wstępne (Pre-shape)'.includes(w))).toBe(true);
    expect(WSTAWKI.some((w) => 'Wprowadź garowanie chłodnicze w lodówce (Cold Retard, 12–16 godzin w 4°C).'.includes(w))).toBe(true);
    expect(WSTAWKI.some((w) => 'Formowanie wstępne'.includes(w))).toBe(false);
  });
});
