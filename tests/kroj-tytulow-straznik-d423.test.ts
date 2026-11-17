// Strażnik kroju tytułów (KO-070, D-419, D-423): `get fontFamily()` w stylach liczy się leniwie, więc styl z poprzedniego
// renderu po zmianie języka daje już nowy krój i natywny widok nie dostaje zmiany. Krój tytułów wolno czytać tylko
// wewnątrz funkcji: fabryki `stylePoKroju(() => StyleSheet.create({...}))` (osobny arkusz na krój) albo przy renderze.
// Dlaczego test, a nie linia w CLAUDE.md: kontrolę, którą agent może pominąć, wymusza test (zasada wspólna 21).
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const root = path.resolve(__dirname, '..');
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' || e.name === 'node_modules' ? [] : walk(full);
    return /\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name) ? [full] : [];
  });
const rel = (f: string) => path.relative(root, f).split(path.sep).join('/');
const pliki = ['app', 'src'].flatMap((d) => walk(path.join(root, d)));
/** Definicje kroju: motyw (getter `krojTytulow` w `theme.typography`) i moduł kroju. */
const DEFINICJE = new Set(['src/ui/theme.ts', 'src/ui/kroj-tytulow.ts']);

function skan(f: string) {
  const text = fs.readFileSync(f, 'utf8');
  const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const getery: string[] = [];
  const poza: string[] = [];
  const v = (n: ts.Node) => {
    const linia = () => `${rel(f)}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`;
    if (ts.isGetAccessorDeclaration(n) && n.name.getText(sf) === 'fontFamily') getery.push(linia());
    const odczyt =
      (ts.isPropertyAccessExpression(n) && n.name.text === 'krojTytulow') ||
      (ts.isIdentifier(n) && n.text === 'krojTytulowDlaJezyka' && !ts.isImportSpecifier(n.parent));
    if (odczyt && !DEFINICJE.has(rel(f))) {
      let p: ts.Node | undefined = n.parent;
      let wFunkcji = false;
      while (p) {
        if (ts.isArrowFunction(p) || ts.isFunctionDeclaration(p) || ts.isFunctionExpression(p) || ts.isMethodDeclaration(p)) { wFunkcji = true; break; }
        p = p.parent;
      }
      if (!wFunkcji) poza.push(linia());
    }
    ts.forEachChild(n, v);
  };
  v(sf);
  return { getery, poza };
}

describe('strażnik kroju tytułów (D-423)', () => {
  const wyniki = pliki.map((f) => ({ f, ...skan(f) }));

  it('brak `get fontFamily()` w app/ i src/', () => {
    expect(wyniki.flatMap((w) => w.getery)).toEqual([]);
  });

  it('krój tytułów czytany tylko wewnątrz funkcji (fabryka stylePoKroju albo render), nie przy ładowaniu modułu', () => {
    expect(wyniki.flatMap((w) => w.poza)).toEqual([]);
  });

  it('strażnik widzi wzorzec błędu (kontrola negatywna)', () => {
    const tmp = path.join(root, 'node_modules', '.cache-d423-neg.ts');
    fs.mkdirSync(path.dirname(tmp), { recursive: true });
    fs.writeFileSync(tmp, "const s = { get fontFamily() { return theme.typography.krojTytulow; } };\nconst z = { fontFamily: theme.typography.krojTytulow };\n");
    try {
      const w = skan(tmp);
      expect(w.getery).toHaveLength(1);
      expect(w.poza.length).toBeGreaterThan(0);
    } finally {
      fs.rmSync(tmp);
    }
  });
});
