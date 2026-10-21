// 055: duży tekst bez ucięć (AX5, 320 pt) i krój tytułów Sofia Sans Semi Condensed (D-050)
// (docs/design/design-spec.md §3: „Żaden tekst nie ma limitu linii… nigdy nie są ucinane”)
// [M1-audytor-generalny-055; 04-studio-projektowe-010]
//
// Reguła statyczna: <Text> w app/ i src/ nie ma numberOfLines, adjustsFontSizeToFit, minimumFontScale,
// maxFontSizeMultiplier ani allowFontScaling={false} (poza wyjątkami z powodem). Style tytułów, czasów i cen
// (klucz stylu: …title/…Title…, …Heading…, …Clock…, …Price…) mają fontFamily z theme.typography.krojTytulow.
// Pole wpisywania (TextInput multiline numberOfLines) to początkowa wysokość pola, nie limit tekstu — poza regułą.
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { theme } from '../src/ui/theme';
import { typografia } from '../src/ui/tokeny';

const rootDir = path.resolve(__dirname, '..');
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' || e.name === 'node_modules' ? [] : walk(full);
    return /\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name) ? [full] : [];
  });
const rel = (f: string) => path.relative(rootDir, f).split(path.sep).join('/');
const pliki = ['app', 'src'].flatMap((d) => walk(path.join(rootDir, d)));
const parse = (f: string) =>
  ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

const LIMITY = ['numberOfLines', 'adjustsFontSizeToFit', 'minimumFontScale', 'maxFontSizeMultiplier'];
/** Nazwane wyjątki: plik → powód. */
const WYJATKI_SKALI: Record<string, string> = {
  'src/components/TabIcon.tsx':
    'etykieta paska zakładek: na iOS pasek systemowy nie powiększa etykiet z Dynamic Type, przy dużym tekście pokazuje je przytrzymanie (Large Content Viewer); allowFontScaling={false}',
};
const STYL_TYTULU = /^(title|heading)$|Title|Heading|Clock|Price/;

describe('055: duży tekst i krój tytułów', () => {
  it('<Text> nie ma limitu linii ani ograniczenia powiększenia (poza nazwanymi wyjątkami)', () => {
    const znalezione: string[] = [];
    for (const f of pliki.filter((x) => x.endsWith('.tsx'))) {
      const sf = parse(f);
      const v = (n: ts.Node) => {
        const el = ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : undefined;
        if (el && /^(Text|Animated\.Text)$/.test(el.tagName.getText(sf))) {
          for (const a of el.attributes.properties) {
            if (!ts.isJsxAttribute(a)) continue;
            const nazwa = a.name.getText(sf);
            const linia = sf.getLineAndCharacterOfPosition(a.getStart(sf)).line + 1;
            // Wyjątek nazwany (201, 04-studio-projektowe-609): maxFontSizeMultiplier równy stosunkowi tokenów AX5 / pt
            // tego samego stylu (czas 99 / 56) — rozmiar przy AX5 z tokenów, nie dowolny limit [M1-audytor-generalny-201]
            const zTokenow = nazwa === 'maxFontSizeMultiplier' &&
              /^\{\s*typografia\.style\.(\w+)\.ax5\s*\/\s*typografia\.style\.\1\.pt\s*\}$/.test(a.initializer?.getText(sf) ?? '');
            if (LIMITY.includes(nazwa) && !zTokenow) znalezione.push(`${rel(f)}:${linia} ${nazwa}`);
            if (nazwa === 'allowFontScaling' && /false/.test(a.initializer?.getText(sf) ?? '') && !WYJATKI_SKALI[rel(f)]) {
              znalezione.push(`${rel(f)}:${linia} allowFontScaling={false}`);
            }
          }
        }
        ts.forEachChild(n, v);
      };
      v(sf);
    }
    expect(znalezione).toEqual([]);
  });

  it('wyjątki istnieją i mają powód', () => {
    for (const [plik, powod] of Object.entries(WYJATKI_SKALI)) {
      expect(fs.existsSync(path.join(rootDir, plik))).toBe(true);
      expect(powod.length).toBeGreaterThan(40);
    }
  });

  it('motyw ma krój tytułów z tokenów (Sofia Sans Semi Condensed, D-050)', () => {
    expect(theme.typography.krojTytulow).toBe('Sofia Sans Semi Condensed');
    expect(theme.typography.krojTytulow).toBe(typografia.krojTytulow);
  });

  it('style tytułów, czasów i cen mają fontFamily z theme.typography.krojTytulow; nigdzie krój „System”', () => {
    const bez: string[] = [];
    let liczba = 0;
    for (const f of pliki) {
      const sf = parse(f);
      const v = (n: ts.Node) => {
        if (ts.isCallExpression(n) && n.expression.getText(sf) === 'StyleSheet.create' && n.arguments[0] && ts.isObjectLiteralExpression(n.arguments[0])) {
          for (const p of n.arguments[0].properties) {
            if (!ts.isPropertyAssignment(p) || !ts.isObjectLiteralExpression(p.initializer)) continue;
            const klucz = p.name.getText(sf);
            // Krój czytany przy renderze: `get fontFamily() { return theme.typography.krojTytulow; }` to ta sama wartość
            // co przypisanie, liczona po zmianie języka (vi, CJK: krój systemowy) [M1-audytor-generalny-171]
            const ff = p.initializer.properties.find((q) => (ts.isPropertyAssignment(q) || ts.isGetAccessorDeclaration(q)) && q.name.getText(sf) === 'fontFamily');
            const zwrot = ff && ts.isGetAccessorDeclaration(ff) && ff.body?.statements.length === 1 ? ff.body.statements[0] : undefined;
            const wartosc =
              ff && ts.isPropertyAssignment(ff) ? ff.initializer.getText(sf) : zwrot && ts.isReturnStatement(zwrot) ? zwrot.expression?.getText(sf) ?? '' : '';
            if (/'System'/.test(wartosc)) bez.push(`${rel(f)}: ${klucz} ma fontFamily 'System'`);
            if (!STYL_TYTULU.test(klucz)) continue;
            liczba++;
            if (wartosc !== 'theme.typography.krojTytulow') bez.push(`${rel(f)}: ${klucz}`);
          }
        }
        ts.forEachChild(n, v);
      };
      v(sf);
    }
    expect(liczba).toBeGreaterThan(30);
    expect(bez).toEqual([]);
  });

  it('plik kroju i licencja OFL są w assets/fonts i w wtyczce expo-font w app.json; expo-font jest zależnością', () => {
    const plik = 'assets/fonts/SofiaSansSemiCondensed-wght.ttf';
    expect(fs.existsSync(path.join(rootDir, plik))).toBe(true);
    const licencja = fs.readFileSync(path.join(rootDir, 'assets/fonts/OFL-sofiasanssemicondensed.txt'), 'utf8');
    expect(licencja).toMatch(/SIL OPEN FONT LICENSE/i);
    const app = JSON.parse(fs.readFileSync(path.join(rootDir, 'app.json'), 'utf8'));
    const wtyczka = (app.expo.plugins as unknown[]).find((p) => Array.isArray(p) && p[0] === 'expo-font') as [string, { fonts?: string[] }] | undefined;
    expect(wtyczka?.[1].fonts).toContain(`./${plik}`);
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    expect(pkg.dependencies['expo-font']).toMatch(/^~57\./);
  });
});
