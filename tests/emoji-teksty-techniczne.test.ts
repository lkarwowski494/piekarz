// 088: emoji nie są ikonami, w interfejsie nie ma tekstów technicznych ani angielskich wstawek
// (docs/design/design-spec.md §4 i §8) [M1-audytor-generalny-088; 04-studio-projektowe-015]
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const rootDir = path.resolve(__dirname, '..');

function walk(dir: string): string[] {
  let res: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__' && entry.name !== 'node_modules') res = res.concat(walk(full));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
      res.push(full);
    }
  }
  return res;
}

const rel = (f: string) => path.relative(rootDir, f).split(path.sep).join('/');
const pliki = ['app', 'src'].flatMap((d) => walk(path.join(rootDir, d)));

/** Emoji: znak piktograficzny Unicode albo flaga (para wskaźników regionalnych). */
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/u;

/** Teksty widoczne: literały napisów, części szablonów i tekst JSX (bez komentarzy i identyfikatorów). */
function teksty(plik: string): { tekst: string; linia: number }[] {
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

/** Teksty techniczne i angielskie wstawki w tekstach polskich (§8: kody, wersje, ścieżki, nazwy z kodu). */
const ZAKAZANE_WSZEDZIE = [
  'True Baker',
  '4-DDT',
  'matematyka lodu',
  '(Seed)',
  '[v1.1',
  'Wersja 1.1',
  'Preview',
  'Offline-First',
  'Documents/Backup',
];
/** Angielskie nazwy funkcji w nawiasach w tekstach PL (słownik EN tłumaczy je sam). */
const ZAKAZANE_W_PL = ['(Sleep Guard)', '(Peak Timer)', '(Peak Countdown)', '(Preferments)', '(Timeline)'];

describe('088: emoji i teksty techniczne', () => {
  it('pliki produkcyjne app/ i src/ (z słownikiem EN) nie mają ani jednego emoji', () => {
    const znalezione: string[] = [];
    for (const f of pliki) {
      fs.readFileSync(f, 'utf8').split('\n').forEach((linia, i) => {
        if (EMOJI.test(linia)) znalezione.push(`${rel(f)}:${i + 1}: ${linia.trim().slice(0, 80)}`);
      });
    }
    expect(znalezione).toEqual([]);
  });

  it('teksty widoczne nie zawierają kodów, wersji, ścieżek ani nazw z kodu', () => {
    const znalezione: string[] = [];
    for (const f of pliki) {
      const r = rel(f);
      const slownikEn = r.startsWith('src/lib/i18n-en/');
      for (const { tekst, linia } of teksty(f)) {
        const lista = slownikEn ? ZAKAZANE_WSZEDZIE : [...ZAKAZANE_WSZEDZIE, ...ZAKAZANE_W_PL];
        for (const fraza of lista) if (tekst.includes(fraza)) znalezione.push(`${r}:${linia}: „${fraza}” w „${tekst.slice(0, 70)}”`);
      }
    }
    expect(znalezione).toEqual([]);
  });

  it('klucze słownika EN (teksty PL) nie mają angielskich nazw funkcji w nawiasach', () => {
    const katalog = path.join(rootDir, 'src/lib/i18n-en');
    const klucze: string[] = [];
    for (const f of fs.readdirSync(katalog)) {
      for (const m of fs.readFileSync(path.join(katalog, f), 'utf8').matchAll(/^\s*'((?:[^'\\]|\\.)*)':/gm)) klucze.push(m[1]);
    }
    expect(klucze.length).toBeGreaterThan(500);
    const zle = klucze.filter((k) => [...ZAKAZANE_WSZEDZIE, ...ZAKAZANE_W_PL].some((z) => k.includes(z)));
    expect(zle).toEqual([]);
  });

  it('test wykrywa emoji, flagi i frazy techniczne (kontrola wzorców)', () => {
    expect(EMOJI.test('🥖 Rozpocznij')).toBe(true);
    expect(EMOJI.test('🇵🇱 PL:')).toBe(true);
    expect(EMOJI.test('⚙️')).toBe(true);
    expect(EMOJI.test('Bochenki 2 × 900 g, 25 °C – 1/5')).toBe(false);
    expect(teksty(path.join(rootDir, 'src/components/ui.tsx')).length).toBeGreaterThan(0);
  });
});
