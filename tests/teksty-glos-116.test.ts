/**
 * Głos tekstów interfejsu (design-spec §8, §11c „116”, test akceptacyjny 1) [M1-audytor-generalny-116; 04-studio-projektowe-034]:
 * w tekstach t() i literałach renderowanych w app/ i src/ (PL i słownik EN) brak wykrzyknika na końcu tekstu
 * (regex `!\s*['"`]`), „➔”, „✓” sklejonego z tekstem i „Uwaga:”. W kluczach t() pisanych wprost nie ma „!” nigdzie.
 * Wyjątki są nazwane niżej, każdy z powodem (treści roli 06 i miejsca toru 106 / PÓŹNIEJ).
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import * as ts from 'typescript';
import { EN } from '../src/lib/i18n.en';
import { calculateReverseSchedule } from '../src/scheduler/reverse-scheduler';

const ROOT = join(__dirname, '..');

/** Wyjątki: plik + początek tekstu → powód. */
const WYJATKI: { plik: string; tekst: string; powod: string }[] = [
  { plik: 'src/core/bread-school-lessons.ts', tekst: 'Mix flour, water, dry yeast', powod: 'treść lekcji roli 06 (Akademia bez wejścia, §11 „100”)' },
  { plik: 'src/core/bread-school-lessons.ts', tekst: 'NIGDY nie używaj wałka', powod: 'treść lekcji roli 06' },
  { plik: 'src/core/bread-school-lessons.ts', tekst: 'NEVER use a rolling pin', powod: 'treść lekcji roli 06' },
  { plik: 'src/core/techniques/prep-ferment-techniques.ts', tekst: 'Po prawidłowej autolizie', powod: 'treść techniki roli 06' },
  { plik: 'src/core/techniques/prep-ferment-techniques.ts', tekst: 'Proper autolyse transforms', powod: 'treść techniki roli 06' },
  { plik: 'src/core/volume-converter.ts', tekst: 'Czerpanie szklanką', powod: 'przelicznik objętości F-45 PÓŹNIEJ, ostrzeżenie roli 06' },
  { plik: 'src/core/volume-converter.ts', tekst: 'Scooping directly from the bag', powod: 'przelicznik objętości F-45 PÓŹNIEJ, ostrzeżenie roli 06' },
  { plik: 'src/core/domain-rules.ts', tekst: 'Uwaga: Obliczona temperatura wody', powod: 'ostrzeżenie dziedzinowe roli 06 (temperatura wody, tor 106: arkusz „Temperatura wody”)' },
  { plik: 'src/core/flour-atlas.ts', tekst: 'Uwaga: bardzo wysoka hydratacja', powod: 'ostrzeżenie dziedzinowe roli 06 (mieszanki mąk, tor 106: arkusz „Składniki”)' },
  { plik: 'src/core/inventory.ts', tekst: 'Uwaga: W spiżarni brakuje', powod: 'spiżarnia F-30 PÓŹNIEJ; tekst braku do roli 04 przy powrocie spiżarni' },
  { plik: 'src/components/FlourBlendModal.tsx', tekst: '✓ ', powod: 'tor 106: FlourBlendModal przechodzi do arkusza „Składniki”' },
];

const ZNAKI = [
  { nazwa: 'wykrzyknik na końcu', test: (s: string) => /!\s*$/.test(s) },
  { nazwa: '➔', test: (s: string) => s.includes('➔') },
  // „✓” sam w osobnym elemencie (znacznik pola wyboru, punktor) to ikona, nie część tekstu
  { nazwa: '✓ sklejony z tekstem', test: (s: string) => s.includes('✓') && s.trim() !== '✓' },
  { nazwa: 'Uwaga:', test: (s: string) => s.includes('Uwaga:') },
];

function plikiKodu(dir: string): string[] {
  const out: string[] = [];
  for (const nazwa of readdirSync(dir)) {
    const p = join(dir, nazwa);
    if (statSync(p).isDirectory()) {
      if (nazwa === '__tests__' || nazwa === 'node_modules') continue;
      out.push(...plikiKodu(p));
    } else if (/\.tsx?$/.test(nazwa) && !/\.test\.tsx?$/.test(nazwa) && !/\.d\.ts$/.test(nazwa)) {
      out.push(p);
    }
  }
  return out;
}

interface Literal { plik: string; tekst: string; kluczT: boolean }

function literaly(): Literal[] {
  const out: Literal[] = [];
  for (const p of [...plikiKodu(join(ROOT, 'app')), ...plikiKodu(join(ROOT, 'src'))]) {
    const plik = relative(ROOT, p).replace(/\\/g, '/');
    if (plik.startsWith('src/lib/i18n-en/') || plik.startsWith('src/lib/i18n-slowniki/') || plik === 'src/lib/i18n-locales.ts') continue; // słowniki: wartości EN sprawdza test niżej; klucze słowników 093 = te same teksty PL co w kodzie
    const sf = ts.createSourceFile(p, readFileSync(p, 'utf-8'), ts.ScriptTarget.Latest, true, p.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const odwiedz = (n: ts.Node) => {
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
        const rodzic = n.parent;
        const kluczT = ts.isCallExpression(rodzic) && ts.isIdentifier(rodzic.expression) && rodzic.expression.text === 't' && rodzic.arguments[0] === n;
        if (!ts.isImportDeclaration(rodzic) && !ts.isExportDeclaration(rodzic)) out.push({ plik, tekst: n.text, kluczT });
      } else if (ts.isTemplateExpression(n)) {
        // wstawki ${…} zostają znacznikiem: „✓ ${t(…)}” to znak sklejony z tekstem
        out.push({ plik, tekst: [n.head.text, ...n.templateSpans.map((s) => s.literal.text)].join('{…}'), kluczT: false });
      } else if (ts.isJsxText(n) && n.text.trim()) {
        const rodzenstwo = ts.isJsxElement(n.parent) ? n.parent.children.filter((c) => c !== n && !(ts.isJsxText(c) && !c.text.trim())) : [];
        out.push({ plik, tekst: n.text.trim() + (rodzenstwo.length > 0 ? ' {…}' : ''), kluczT: false });
      }
      ts.forEachChild(n, odwiedz);
    };
    odwiedz(sf);
  }
  return out;
}

const wyjatek = (l: Literal) => WYJATKI.some((w) => w.plik === l.plik && l.tekst.startsWith(w.tekst));

describe('116: teksty interfejsu bez „!”, „➔”, „✓” i „Uwaga:” (§8, §11c)', () => {
  const wszystkie = literaly();

  it('literały w app/ i src/: zero naruszeń poza nazwanymi wyjątkami', () => {
    const naruszenia = wszystkie
      .filter((l) => !wyjatek(l))
      .flatMap((l) => ZNAKI.filter((z) => z.test(l.tekst)).map((z) => `${l.plik}: [${z.nazwa}] ${l.tekst}`));
    expect(naruszenia).toEqual([]);
  });

  it('klucze t() pisane wprost: bez „!” w środku; ich wartości EN bez „!”, „➔”, „✓”, „Warning:”', () => {
    const klucze = [...new Set(wszystkie.filter((l) => l.kluczT).map((l) => l.tekst))];
    expect(klucze.length).toBeGreaterThan(500);
    expect(klucze.filter((k) => k.includes('!'))).toEqual([]);
    const en = klucze
      .map((k) => [k, EN[k]] as const)
      .filter(([, v]) => typeof v === 'string' && (/[!➔✓]/.test(v) || v.startsWith('Warning:')));
    expect(en).toEqual([]);
  });

  it('nazwy kroków planu (klucze t() z harmonogramu) bez „!”', () => {
    const plan = calculateReverseSchedule(new Date(2026, 9, 22, 10, 0), { ambientTemperatureC: 23, coldRetardHours: 14 });
    const nazwy = plan.stages.map((s) => s.namePl);
    expect(nazwy).toContain('Studzenie na kratce');
    expect(nazwy.filter((n) => /[!]/.test(n) || /[!]/.test(EN[n] ?? ''))).toEqual([]);
  });

  it('wyjątki są aktualne: każdy wskazuje istniejący tekst', () => {
    for (const w of WYJATKI) expect(wszystkie.some((l) => l.plik === w.plik && l.tekst.startsWith(w.tekst))).toBe(true);
  });
});
