// Strażnik kroju tytułów (KO-070, KO-071, D-419, D-423, D-424): `get fontFamily()` w stylach liczy się leniwie, więc styl z
// poprzedniego renderu po zmianie języka daje już nowy krój i natywny widok nie dostaje zmiany. Krój tytułów wolno czytać
// tylko (1) w fabryce `stylePoKroju(() => StyleSheet.create({...}))` (osobny arkusz na krój) albo (2) w funkcji z listy
// WYJATKI (opcje nagłówka liczone przy każdym wywołaniu). Samo „wewnątrz jakiejś funkcji” nie wystarcza: funkcja wywołana
// raz przy imporcie (`const styles = zrob()`) zamraża krój języka źródłowego (recenzja AB-03). Statyczna stała
// `typografia.krojTytulow` jest dozwolona tylko w src/ui/kroj-tytulow.ts (w fabryce dawała Sofię w każdym języku).
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
/** Definicje kroju: motyw (getter `krojTytulow` w `theme.typography`) i moduł kroju (jedyne miejsce ze statyczną stałą). */
const DEFINICJE = new Set(['src/ui/theme.ts', 'src/ui/kroj-tytulow.ts']);
/** Funkcje czytające krój przy każdym wywołaniu (nie przy imporcie): `plik:nazwa`. */
const WYJATKI = new Set(['src/ui/naglowek.ts:opcjeNaglowka']);

const jestFunkcja = (p: ts.Node): p is ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression | ts.MethodDeclaration =>
  ts.isArrowFunction(p) || ts.isFunctionDeclaration(p) || ts.isFunctionExpression(p) || ts.isMethodDeclaration(p);

function skan(f: string) {
  const text = fs.readFileSync(f, 'utf8');
  const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const getery: string[] = [];
  const poza: string[] = [];
  const statyczne: string[] = [];
  const v = (n: ts.Node) => {
    const linia = () => `${rel(f)}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`;
    if (ts.isGetAccessorDeclaration(n) && n.name.getText(sf) === 'fontFamily') getery.push(linia());
    const odczytWlasciwosci = ts.isPropertyAccessExpression(n) && n.name.text === 'krojTytulow';
    const odczyt = odczytWlasciwosci || (ts.isIdentifier(n) && n.text === 'krojTytulowDlaJezyka' && !ts.isImportSpecifier(n.parent));
    if (odczytWlasciwosci && n.expression.getText(sf) === 'typografia' && rel(f) !== 'src/ui/kroj-tytulow.ts') statyczne.push(linia());
    if (odczyt && !DEFINICJE.has(rel(f))) {
      // Najbliższa funkcja: musi być fabryką stylePoKroju (argument wywołania) albo funkcją z WYJATKI
      let p: ts.Node | undefined = n.parent;
      while (p && !jestFunkcja(p)) p = p.parent;
      const fabryka = !!p && ts.isArrowFunction(p) && ts.isCallExpression(p.parent) && p.parent.expression.getText(sf) === 'stylePoKroju';
      const wyjatek = !!p && ts.isFunctionDeclaration(p) && !!p.name && WYJATKI.has(`${rel(f)}:${p.name.text}`);
      if (!fabryka && !wyjatek) poza.push(linia());
    }
    ts.forEachChild(n, v);
  };
  v(sf);
  return { getery, poza, statyczne };
}

describe('strażnik kroju tytułów (D-423)', () => {
  const wyniki = pliki.map((f) => ({ f, ...skan(f) }));

  it('brak `get fontFamily()` w app/ i src/', () => {
    expect(wyniki.flatMap((w) => w.getery)).toEqual([]);
  });

  it('krój tytułów czytany tylko w fabryce stylePoKroju (albo w funkcji z listy WYJATKI), nie przy ładowaniu modułu', () => {
    expect(wyniki.flatMap((w) => w.poza)).toEqual([]);
  });

  it('statyczna stała `typografia.krojTytulow` tylko w src/ui/kroj-tytulow.ts', () => {
    expect(wyniki.flatMap((w) => w.statyczne)).toEqual([]);
  });

  describe('strażnik widzi wzorce błędu (kontrola negatywna)', () => {
    const sprawdz = (nazwa: string, kod: string) => {
      const tmp = path.join(root, 'node_modules', `.cache-d423-neg-${nazwa}.ts`);
      fs.mkdirSync(path.dirname(tmp), { recursive: true });
      fs.writeFileSync(tmp, kod);
      try {
        return skan(tmp);
      } finally {
        fs.rmSync(tmp);
      }
    };

    it('getter fontFamily', () => {
      expect(sprawdz('getter', 'const s = { get fontFamily() { return theme.typography.krojTytulow; } };\n').getery).toHaveLength(1);
    });

    it('odczyt na poziomie modułu', () => {
      expect(sprawdz('modul', 'const z = { fontFamily: theme.typography.krojTytulow };\n').poza.length).toBeGreaterThan(0);
    });

    it('arkusz z fabryki wywołany raz przy imporcie (AB-03 a)', () => {
      const w = sprawdz('import', 'const zrob = () => StyleSheet.create({ a: { fontFamily: theme.typography.krojTytulow } });\nconst styles = zrob();\n');
      expect(w.poza.length).toBeGreaterThan(0);
    });

    it('statyczne typografia.krojTytulow w fabryce stylePoKroju (AB-03 b)', () => {
      const w = sprawdz('statyczne', 'const styles = stylePoKroju(() => StyleSheet.create({ a: { fontFamily: typografia.krojTytulow } }));\n');
      expect(w.statyczne.length).toBeGreaterThan(0);
    });

    it('poprawna fabryka stylePoKroju nie jest błędem', () => {
      const w = sprawdz('ok', 'const styles = stylePoKroju(() => StyleSheet.create({ a: { fontFamily: theme.typography.krojTytulow } }));\n');
      expect([w.getery, w.poza, w.statyczne]).toEqual([[], [], []]);
    });
  });
});
