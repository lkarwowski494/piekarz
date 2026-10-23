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
const WYJATKI_SKALI: Record<string, string> = {};
/**
 * Nazwany wyjątek (audyt niezależny G-9): podpis zakładki był bez skalowania (allowFontScaling={false}) z założeniem,
 * że pokaże go Large Content Viewer — własny TabLabel go nie ma, więc podpis został 10 pt. Teraz rośnie z Dynamic
 * Type do 1,5× (pasek zakładek ma stałą wysokość), bez limitu linii i bez zmniejszania kroju (reguła 054,
 * tests/pasek-zakladek.test.tsx) — tylko ta wartość.
 */
const WYJATKI_ZAKLADKI: Record<string, Record<string, string>> = {
  'src/components/TabIcon.tsx': { maxFontSizeMultiplier: '{1.5}' },
  // Nazwany wyjątek (PRZ-07, przegląd roli 04, D-107): tekst przycisku w pasku nawigacji (prawy róg Stolnicy: „Doktor” +
  // „Plan wypieku”) skaluje się najwyżej 1,5× jak podpisy zakładek; przy 1,5× oba przyciski mają ok. 264 pt, a bez
  // limitu wypychały tytuł i środek paska. Bez limitu linii i bez zmniejszania kroju.
  'src/components/nawigacja/PrzyciskNaglowka.tsx': { maxFontSizeMultiplier: '{1.5}' },
  // Nazwany wyjątek (04-studio-projektowe-003, W-fix M3): tytuł pasa nocy (tytulDuzy 34 pt) najwyżej 1,5× (51 pt) jak
  // przyciski tego samego pasa. Bez limitu przy AX5 i 320 pt łamał słowa („Rece/ptury”) i zajmował cały pierwszy ekran;
  // limit z tokenu (60 pt) łamałby fi „Hapanjuuret” (309 pt przy 288 pt miejsca, pomiar Chromium). Bez limitu linii
  // i bez zmniejszania kroju.
  'src/components/nawigacja/PasZakladki.tsx': { maxFontSizeMultiplier: '{1.5}' },
};
/**
 * Nazwany wyjątek (reaudit-noc N-2, 201): godzina „gotowe” i czas kroku w tokenie `czas` (99 pt przy AX5) w jednym
 * wierszu z dopasowaniem rozmiaru — tylko numberOfLines={1}, adjustsFontSizeToFit i minimumFontScale={0.5}. Bez tego
 * en-US „9:45 AM” i „1:05:00” przy 320 pt łamią cyfry w dwa wiersze. Najdłuższy tekst („12:45 PM”, 8 znaków) przy 0,5
 * (ok. 50 pt) ma ok. 200 pt przy ok. 260 pt pola, więc nic nie jest ucinane (cel reguły §3 zostaje).
 */
const WYJATKI_JEDEN_WIERSZ: Record<string, string> = {
  'src/components/harmonogram/TargetReadyCard.tsx': 'godzina „gotowe” na planie (token czas)',
  'src/components/stolnica/StrefaKroku.tsx': 'czas kroku w prowadzeniu (token czas)',
};
const JEDEN_WIERSZ: Record<string, string> = { numberOfLines: '{1}', adjustsFontSizeToFit: '', minimumFontScale: '{0.5}' };
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
            const jedenWiersz = !!WYJATKI_JEDEN_WIERSZ[rel(f)] && JEDEN_WIERSZ[nazwa] === (a.initializer?.getText(sf) ?? '');
            const zakladka = WYJATKI_ZAKLADKI[rel(f)]?.[nazwa] === (a.initializer?.getText(sf) ?? '');
            if (LIMITY.includes(nazwa) && !zTokenow && !jedenWiersz && !zakladka) znalezione.push(`${rel(f)}:${linia} ${nazwa}`);
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
