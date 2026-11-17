// Strażnik subskrypcji języka w trasach (KO-071, recenzja AB-04, D-424): ekrany nawigatora są za `StaticContainer`
// (expo-router/build/react-navigation/core/SceneView.js), a `t()` nie subskrybuje zmian języka. Każda trasa w `app/`
// (ekran i układ) woła `useLang()` (albo `useEkranZPasem()`, który go woła) w komponencie domyślnym, więc po zmianie języka w Ustawieniach przerysowuje się razem
// z nowymi tekstami i krojem tytułu (stylePoKroju), bez remontowania i bez utraty stanu. Nowa trasa bez `useLang()` = czerwone.
// Zachowanie sprawdza src/__tests__/jezyk-zamontowane-ekrany-ac.test.tsx. Dlaczego test, a nie linia w CLAUDE.md:
// kontrolę, którą agent może pominąć, wymusza test (zasada wspólna 21).
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const root = path.resolve(__dirname, '..');
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.tsx$/.test(e.name) ? [full] : [];
  });
const rel = (f: string) => path.relative(root, f).split(path.sep).join('/');

/** Hooki, które same wołają `useLang()` (definicję sprawdza osobny test). */
const HOOKI_Z_JEZYKIEM = ['useLang', 'useEkranZPasem'];

/** Zwraca nazwę funkcji domyślnej trasy bez `useLang()` albo `null`, gdy trasa subskrybuje język (brak domyślnego eksportu: 'brak default'). */
function bezUseLang(f: string): string | null {
  const sf = ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let wynik: string | null = 'brak default';
  const wolaUseLang = (n: ts.Node): boolean => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && HOOKI_Z_JEZYKIEM.includes(n.expression.text)) return true;
    return ts.forEachChild(n, (c) => (wolaUseLang(c) ? true : undefined)) ?? false;
  };
  for (const st of sf.statements) {
    const domyslna = ts.isFunctionDeclaration(st) && st.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
    if (domyslna && ts.isFunctionDeclaration(st)) wynik = wolaUseLang(st) ? null : st.name?.text ?? 'anonimowa';
  }
  return wynik;
}

describe('trasy w app/ subskrybują język (D-424)', () => {
  const trasy = walk(path.join(root, 'app'));

  it('jest co sprawdzać', () => {
    expect(trasy.length).toBeGreaterThanOrEqual(15);
  });

  it('każda trasa (ekran i układ) woła useLang() w komponencie domyślnym', () => {
    const bez = trasy.map((f) => [rel(f), bezUseLang(f)] as const).filter(([, w]) => w !== null);
    expect(bez).toEqual([]);
  });

  it('useEkranZPasem woła useLang() i usePasekStanuJasny()', () => {
    const tekst = fs.readFileSync(path.join(root, 'src/components/nawigacja/EkranZPasem.tsx'), 'utf8');
    const [, cialo = ''] = /export function useEkranZPasem\(\)[^{]*\{([^}]*)\}/.exec(tekst) ?? [];
    expect(cialo).toContain('useLang()');
    expect(cialo).toContain('usePasekStanuJasny()');
  });

  it('strażnik widzi trasę bez useLang() (kontrola negatywna)', () => {
    const tmp = path.join(root, 'node_modules', '.cache-d424-neg.tsx');
    fs.mkdirSync(path.dirname(tmp), { recursive: true });
    fs.writeFileSync(tmp, "import { t } from '../src/lib/i18n';\nexport default function Ekran() { return t('x'); }\n");
    try {
      expect(bezUseLang(tmp)).toBe('Ekran');
    } finally {
      fs.rmSync(tmp);
    }
  });

  it('strażnik przyjmuje trasę z useLang()', () => {
    const tmp = path.join(root, 'node_modules', '.cache-d424-ok.tsx');
    fs.mkdirSync(path.dirname(tmp), { recursive: true });
    fs.writeFileSync(tmp, "import { useLang } from '../src/lib/i18n';\nexport default function Ekran() { useLang(); return null; }\n");
    try {
      expect(bezUseLang(tmp)).toBeNull();
    } finally {
      fs.rmSync(tmp);
    }
  });
});
