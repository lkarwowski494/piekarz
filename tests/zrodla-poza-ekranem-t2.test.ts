/**
 * M3 T2 (D-123, decyzja właściciela 2026-10-23): porady mówią naturalnym językiem, a nazwy źródeł wiedzy są w jednym
 * miejscu — ekranie „Źródła wiedzy” w Ustawieniach (src/core/zrodla-wiedzy.ts). Żaden inny tekst interfejsu nie
 * przypisuje treści do źródła: klucze PL i teksty słownika EN, literały w kodzie app/ i src/ (treści poza t(), np.
 * pola *En lekcji i technik) i treści docs/tresci/pl|en (kod jest im dosłownie równy). Podstawą liczb zostają
 * rejestr twierdzeń (docs/tresci/rejestr.json, pole `zrodla`) i BRD, których ten test nie sprawdza.
 * Wzorzec: nazwy z listy roli 06 (inwentarz M3 t2, sekcja 4) i nazwy, autorzy oraz adresy z ekranu źródeł.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';
import { EN } from '../src/lib/i18n.en';
import { ZRODLA_WIEDZY, kluczeZrodelWiedzy } from '../src/core/zrodla-wiedzy';

const root = path.join(__dirname, '..');
const PLIK_EKRANU = path.join('src', 'core', 'zrodla-wiedzy.ts');

const re = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const NAZWY = [
  'King Arthur', 'Modernist Cuisine', 'Bread Bakers Guild', '\\bBBGA\\b', '\\bFDA\\b', '\\bUSDA\\b', '\\bFSIS\\b',
  'CSU Extension', 'SDSU', 'Colorado State', 'South Dakota', 'PN-(?:A|EN)-?\\d', 'Polsk\\p{L}* Norm', 'polskich norm',
  // „Polish Standards” jako nazwa (przypis); „isn't in the Polish standard” to fakt o typie 850, nie przypis
  'Polish Standards?', 'PeerJ', 'eLife', 'CORDIS', 'Gänzle', 'Achremowicz', 'Sujka', 'Szwedziak', 'Szafrańska',
  'Stępniewska', 'Stolarska', 'Leitsätze', '\\bOest\\b', 'Calvert', 'Landis', 'Burn Center', 'Shriners',
  'Oklahoma State', 'Brown University', 'UofL', 'Tartine', 'Bertinet', 'Arrhenius',
];
// Przypis = „według/according to” z nazwą własną; „według planu”, „according to the plan” to nie przypis
const PRZYPISY = [
  '[Ww]edług \\p{Lu}', '\\b[Aa]ccording to (?:the )?\\p{Lu}', '\\(per ', 'tego samego źródła', 'same source', 'bez źródła',
  '\\bno source\\b', 'badanej próbce', 'badanych próbkach', 'tested samples?', 'modelu badawczego', 'research model',
  'w badaniu \\d', 'in a study of',
];
const ADRESY = [...new Set(ZRODLA_WIEDZY.flatMap((g) => g.zrodla.map((z) => z.adres)))].map(re);
const WZORZEC = new RegExp([...NAZWY, ...PRZYPISY, ...ADRESY].join('|'), 'u');

const EKRAN = new Set(kluczeZrodelWiedzy());
const trafienia = (gdzie: string, teksty: Iterable<string>) => [...teksty].filter((x) => WZORZEC.test(x)).map((x) => `${gdzie}: ${x.slice(0, 120)}`);

function plikiKodu(dir: string, out: string[] = []): string[] {
  for (const f of fs.readdirSync(path.join(root, dir))) {
    const p = path.join(dir, f);
    if (fs.statSync(path.join(root, p)).isDirectory()) {
      if (!['__tests__', 'i18n-en', 'i18n-slowniki', 'node_modules'].includes(f)) plikiKodu(p, out);
    } else if (/\.(ts|tsx)$/.test(f) && !/\.(test|spec)\./.test(f) && !/i18n\.en\.ts$/.test(f) && p !== PLIK_EKRANU) out.push(p);
  }
  return out;
}

/** Literały napisów (bez komentarzy) z pliku kodu: napisy, szablony i tekst JSX. */
function literaly(plik: string): string[] {
  const sf = ts.createSourceFile(plik, fs.readFileSync(path.join(root, plik), 'utf8'), ts.ScriptTarget.Latest, true, plik.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out: string[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) out.push(n.text);
    else if (ts.isTemplateExpression(n)) out.push([n.head, ...n.templateSpans.map((s) => s.literal)].map((x) => x.text).join('…'));
    else if (ts.isJsxText(n)) out.push(n.text);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

/** Treść pliku docs/tresci bez komentarzy HTML i nagłówków (opisy pól dla programisty nie są tekstem UI). */
const trescMd = (plik: string) =>
  fs.readFileSync(path.join(root, plik), 'utf8').replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));

describe('T2 (D-123): nazwy źródeł tylko na ekranie „Źródła wiedzy”', () => {
  it('ekran źródeł ma nazwy, opisy i adresy (wzorzec ma czego szukać)', () => {
    expect(ZRODLA_WIEDZY.flatMap((g) => g.zrodla).length).toBeGreaterThan(20);
    expect(EKRAN.has('King Arthur Baking')).toBe(true);
    // Kontrola wzorca: łapie przypis z dawnego tekstu i nie łapie zdania bez przypisu
    expect(WZORZEC.test('Według King Arthur Baking miarą gotowości jest podwojenie objętości.')).toBe(true);
    expect(WZORZEC.test('Miarą gotowości jest podwojenie objętości.')).toBe(false);
  });

  it('słownik: klucze PL i teksty EN poza ekranem źródeł bez nazw źródeł', () => {
    const poza = Object.entries(EN).filter(([k]) => !EKRAN.has(k));
    expect([...trafienia('PL', poza.map(([k]) => k)), ...trafienia('EN', poza.map(([, v]) => v))]).toEqual([]);
  });

  it('kod app/ i src/: literały (także treści poza t(), np. pola *En) bez nazw źródeł', () => {
    const pliki = [...plikiKodu('app'), ...plikiKodu('src')];
    expect(pliki.length).toBeGreaterThan(100);
    expect(pliki.flatMap((p) => trafienia(p.split(path.sep).join('/'), literaly(p)))).toEqual([]);
  });

  it.each(['pl', 'en'])('docs/tresci/%s: treść bez nazw źródeł', (jez) => {
    const dir = path.join('docs', 'tresci', jez);
    const pliki = fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith('.md'));
    expect(pliki.flatMap((f) => trafienia(`${dir}/${f}`, trescMd(path.join(dir, f))))).toEqual([]);
  });
});
