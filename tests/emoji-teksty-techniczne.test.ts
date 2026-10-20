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
const ZAKAZANE_W_PL = [
  '(Sleep Guard)', '(Peak Timer)', '(Peak Countdown)', '(Preferments)', '(Timeline)',
  // etykiety interfejsu (Ustawienia, plan, zakwas), nie treść dziedzinowa roli 06 [M1-audytor-generalny-088; 04-studio-projektowe-027]
  'Garnek żeliwny (Dutch Oven)', 'Klosz ceramiczny (Cloche)', 'Foremka z pokrywą (Pullman)',
  'Czas w lodówce (Cold Retard)', 'Potrzebny zaczyn (Levain)', 'masę zaczynu (Levain)',
];

/**
 * Teksty techniczne w interfejsie (§8: nazwy bazy, ścieżki, tryby zapisu, marka spoza projektu) — w tekstach
 * widocznych: tekst JSX i napisy w t(), oraz w kluczach i wartościach słownika EN [M1-audytor-generalny-088; 04-studio-projektowe-027].
 */
const ZAKAZANE_TECHNICZNE = ['SQLite', 'WAL mode', 'ACID', '/Library/', 'piekarz.db', 'Apps4Craft Studio'];
/** Wyjątki nazwane: tekst w sekcji ukrytej (F-52 PÓŹNIEJ, wejscieWidoczne('rodzina-apps4craft') = false; nazwa marki do decyzji). */
const WYJATKI_TECHNICZNE = ['Rodzina Apps4Craft Studio', 'Apps4Craft Studio Family'];
/** Kod z programu w tekście widocznym (np. UNDER_PROOFED): wielkie litery z podkreśleniem. */
const KOD = /\b[A-Z]{2,}_[A-Z_]{2,}\b/;

/** Teksty widoczne: tekst JSX, napisy w JSX ({'…'}) i pierwszy argument t()/tPlural(). */
function tekstyWidoczne(plik: string): { tekst: string; linia: number }[] {
  const sf = ts.createSourceFile(plik, fs.readFileSync(plik, 'utf8'), ts.ScriptTarget.Latest, true,
    plik.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out: { tekst: string; linia: number }[] = [];
  const dodaj = (n: ts.Node, tekst: string) => out.push({ tekst, linia: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1 });
  const napis = (n: ts.Node | undefined): n is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral =>
    !!n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n));
  const visit = (n: ts.Node) => {
    if (ts.isJsxText(n) && n.text.trim()) dodaj(n, n.text);
    if (ts.isJsxExpression(n) && napis(n.expression)) dodaj(n, n.expression.text);
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && ['t', 'tPlural'].includes(n.expression.text) && napis(n.arguments[0])) {
      dodaj(n, n.arguments[0].text);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

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

  it('M1-audytor-generalny-088: teksty widoczne bez nazwy bazy, ścieżki, trybu zapisu, obcej marki i kodów z programu', () => {
    const znalezione: string[] = [];
    for (const f of pliki) {
      const r = rel(f);
      if (r.startsWith('src/lib/i18n-en/')) continue;
      for (const { tekst, linia } of tekstyWidoczne(f)) {
        if (WYJATKI_TECHNICZNE.includes(tekst)) continue;
        for (const fraza of ZAKAZANE_TECHNICZNE) if (tekst.includes(fraza)) znalezione.push(`${r}:${linia}: „${fraza}” w „${tekst.slice(0, 70)}”`);
        if (KOD.test(tekst)) znalezione.push(`${r}:${linia}: kod w „${tekst.slice(0, 70)}”`);
      }
      // kod diagnozy wstawiony wprost do JSX (np. {diagnosis.defectCode})
      fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
        if (/\{\s*[\w.?]*\.defectCode\s*\}/.test(l)) znalezione.push(`${r}:${i + 1}: kod diagnozy w JSX: ${l.trim().slice(0, 70)}`);
      });
    }
    expect(znalezione).toEqual([]);
  });

  it('M1-audytor-generalny-088: słownik EN (klucze PL i wartości EN) bez tekstów technicznych', () => {
    const katalog = path.join(rootDir, 'src/lib/i18n-en');
    const zle: string[] = [];
    for (const f of fs.readdirSync(katalog)) {
      for (const m of fs.readFileSync(path.join(katalog, f), 'utf8').matchAll(/'((?:[^'\\]|\\.)*)'/g)) {
        const tekst = m[1];
        if (WYJATKI_TECHNICZNE.includes(tekst)) continue;
        if (ZAKAZANE_TECHNICZNE.some((z) => tekst.includes(z))) zle.push(`${f}: ${tekst.slice(0, 80)}`);
      }
    }
    expect(zle).toEqual([]);
  });

  it('kontrola wzorców 088: wykrywa kod, ścieżkę i tekst w t()', () => {
    expect(KOD.test('UNDER_PROOFED')).toBe(true);
    expect(KOD.test('Plan wypieku: 13 kroków')).toBe(false);
    const probny = path.join(rootDir, 'src/components/settings/StudioEcosystemSection.tsx');
    expect(tekstyWidoczne(probny).some((x) => x.tekst === 'Polityka prywatności')).toBe(true);
  });

  it('test wykrywa emoji, flagi i frazy techniczne (kontrola wzorców)', () => {
    expect(EMOJI.test('🥖 Rozpocznij')).toBe(true);
    expect(EMOJI.test('🇵🇱 PL:')).toBe(true);
    expect(EMOJI.test('⚙️')).toBe(true);
    expect(EMOJI.test('Bochenki 2 × 900 g, 25 °C – 1/5')).toBe(false);
    expect(teksty(path.join(rootDir, 'src/components/ui.tsx')).length).toBeGreaterThan(0);
  });
});
