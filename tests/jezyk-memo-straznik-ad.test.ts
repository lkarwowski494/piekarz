// Strażnik useMemo z tekstem z t() (KO-072, recenzja AC-01, D-427): `t()` nie subskrybuje języka, a `useMemo` zwraca zapamiętaną
// wartość, więc `useMemo(() => t('…'), [dane])` zostawia tekst w starym języku po zmianie języka (ekran przerysowuje się,
// D-424, ale wartość nie). Każdy `useMemo`, którego ciało woła `t`, `tPlural`, `godzinTemu` albo `dniTemu`, ma `jezyk` w tablicy
// zależności (`const jezyk = useLang();`). Zakres: `app/` i `src/` bez `__tests__`; `useCallback` pominięty, bo `t()` w jego ciele
// liczy się przy wywołaniu (aktualny język), a `useState(t(…))` to celowa wartość początkowa pola (zmiana języka nie kasuje wpisu).
// Dlaczego test, a nie linia w CLAUDE.md: kontrolę, którą agent może pominąć, wymusza test (zasada wspólna 21).
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const root = path.resolve(__dirname, '..');
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : walk(full);
    return /\.tsx?$/.test(e.name) ? [full] : [];
  });
const rel = (f: string) => path.relative(root, f).split(path.sep).join('/');

/** Funkcje tłumaczące tekst w chwili wywołania (język z `currentLang`, bez subskrypcji). */
const WOLAJACE_T = new Set(['t', 'tPlural', 'godzinTemu', 'dniTemu']);
/** Nazwa zmiennej z `useLang()` w tablicy zależności. */
const JEZYK = 'jezyk';

const jestUseMemo = (n: ts.CallExpression): boolean =>
  (ts.isIdentifier(n.expression) && n.expression.text === 'useMemo') ||
  (ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'useMemo');

const wolaT = (n: ts.Node): boolean => {
  if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && WOLAJACE_T.has(n.expression.text)) return true;
  return ts.forEachChild(n, (c) => (wolaT(c) ? true : undefined)) ?? false;
};

/** Miejsca (`plik:linia`) `useMemo` z `t()` w ciele i bez `jezyk` w zależnościach. */
export function memoBezJezyka(f: string): string[] {
  const sf = ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const wynik: string[] = [];
  const odwiedz = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && jestUseMemo(n)) {
      const [ciało, zaleznosci] = n.arguments;
      const maJezyk = !!zaleznosci && ts.isArrayLiteralExpression(zaleznosci) && zaleznosci.elements.some((e) => ts.isIdentifier(e) && e.text === JEZYK);
      if (ciało && wolaT(ciało) && !maJezyk) wynik.push(`${rel(f)}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`);
    }
    ts.forEachChild(n, odwiedz);
  };
  odwiedz(sf);
  return wynik;
}

describe('useMemo z t() ma język w zależnościach (D-427)', () => {
  const pliki = ['app', 'src'].flatMap((d) => walk(path.join(root, d)));

  it('jest co sprawdzać', () => {
    expect(pliki.length).toBeGreaterThan(200);
  });

  it('żaden useMemo z t() nie pomija języka w zależnościach', () => {
    expect(pliki.flatMap(memoBezJezyka)).toEqual([]);
  });

  const tmp = (nazwa: string, kod: string) => {
    const f = path.join(root, 'node_modules', nazwa);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, kod);
    return f;
  };

  it.each([
    ['t w ciele, zależności bez języka', "const a = useMemo(() => t('x'), [dane]);"],
    ['godzinTemu w bloku', "const a = useMemo(() => { return godzinTemu(3); }, [dane]);"],
    ['tPlural w funkcji zagnieżdżonej', "const a = useMemo(() => lista.map((x) => tPlural(x, S)), [lista]);"],
    ['brak tablicy zależności', "const a = useMemo(() => t('x'));"],
    ['React.useMemo', "const a = React.useMemo(() => t('x'), []);"],
  ])('kontrola negatywna: %s = czerwone', (_nazwa, kod) => {
    const f = tmp('.cache-d427-neg.tsx', `${kod}\n`);
    try {
      expect(memoBezJezyka(f)).toHaveLength(1);
    } finally {
      fs.rmSync(f);
    }
  });

  it.each([
    ['t w ciele i jezyk w zależnościach', "const a = useMemo(() => t('x'), [dane, jezyk]);"],
    ['bez t() w ciele', "const a = useMemo(() => dane.length, [dane]);"],
    ['useCallback z t() (liczy się przy wywołaniu)', "const a = useCallback(() => t('x'), []);"],
  ])('kontrola pozytywna: %s = zielone', (_nazwa, kod) => {
    const f = tmp('.cache-d427-ok.tsx', `${kod}\n`);
    try {
      expect(memoBezJezyka(f)).toEqual([]);
    } finally {
      fs.rmSync(f);
    }
  });
});
