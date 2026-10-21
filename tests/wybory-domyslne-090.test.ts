/**
 * M1-audytor-generalny-090 (04-studio-projektowe-018, DEC-07 → D-045): wybory domyślne z decyzją, zero wyborów
 * z kalibracji bez decyzji (design-spec §12, §12a). Testy grep z §12a w app/ i src/ (bez testów) = 0:
 * gradient i rozmycie, wersaliki (textTransform 'uppercase', letterSpacing), znak „ · ” w tekstach; wartości
 * domyślne: przypomnienie zakwasu na blacie 12 h (D-043, OP-38), prośba o ocenę od 4★ (D-042), jednostki według
 * regionu (D-044). Wartości w kodzie mają w komentarzu ID decyzji (zasada 11 roli 08).
 */
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { FEED_ROOM_TEMP_AFTER_MS } from '../src/core/notification-config';
import { PROSBA_O_OCENE, czyProsicOOcene } from '../src/lib/prosba-o-ocene';
import { domyslnyUkladJednostek } from '../src/lib/unit-converter';

const ROOT = path.join(__dirname, '..');

function pliki(dir: string, out: string[] = []): string[] {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== '__tests__' && f !== 'node_modules') pliki(p, out);
    } else if (/\.(ts|tsx)$/.test(f) && !/\.test\./.test(f)) out.push(p);
  }
  return out;
}
const KOD = [...pliki(path.join(ROOT, 'app')), ...pliki(path.join(ROOT, 'src'))];

interface Znalezisko {
  gdzie: string;
  co: string;
}

/** Przegląd składni (bez komentarzy): style, importy, teksty w literałach i JSX. */
function skanuj(test: (n: ts.Node, src: ts.SourceFile) => string | null): Znalezisko[] {
  const out: Znalezisko[] = [];
  for (const plik of KOD) {
    const src = ts.createSourceFile(plik, fs.readFileSync(plik, 'utf8'), ts.ScriptTarget.Latest, true, plik.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const odwiedz = (n: ts.Node) => {
      const co = test(n, src);
      if (co) out.push({ gdzie: `${path.relative(ROOT, plik)}:${src.getLineAndCharacterOfPosition(n.getStart()).line + 1}`, co });
      ts.forEachChild(n, odwiedz);
    };
    odwiedz(src);
  }
  return out;
}
const nazwaWlasciwosci = (n: ts.Node): string | null =>
  ts.isPropertyAssignment(n) && (ts.isIdentifier(n.name) || ts.isStringLiteral(n.name)) ? n.name.text : null;
const tekstLiteralu = (n: ts.Node): string | null =>
  ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) ? n.text
    : ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n) ? n.text
    : ts.isJsxText(n) ? n.text : null;
/** Tekst, który trafia na ekran: tekst JSX, literał w wyrażeniu JSX albo w atrybucie JSX i klucz t('…'); bez SQL i kluczy danych. */
const tekstNaEkranie = (n: ts.Node): string | null => {
  if (ts.isJsxText(n)) return n.text;
  if (!(ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))) return null;
  const r = n.parent;
  if (ts.isJsxExpression(r) || ts.isJsxAttribute(r)) return n.text;
  if (ts.isCallExpression(r) && ts.isIdentifier(r.expression) && /^t(Plural)?$/.test(r.expression.text) && r.arguments[0] === n) return n.text;
  return null;
};

describe('090: wybory z kalibracji bez decyzji (design-spec §12a) = 0', () => {
  it('D-049: bez gradientów i rozmycia (LinearGradient, BlurView, expo-blur)', () => {
    const z = skanuj((n) => {
      if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier) && /expo-blur|linear-gradient/.test(n.moduleSpecifier.text)) return n.moduleSpecifier.text;
      if (ts.isIdentifier(n) && /^(LinearGradient|BlurView)$/.test(n.text)) return n.text;
      return null;
    });
    expect(z).toEqual([]);
  });

  it('02-kierunki: bez wersalików z rozstrzeleniem (textTransform „uppercase”, letterSpacing)', () => {
    const z = skanuj((n) => {
      const nazwa = nazwaWlasciwosci(n);
      if (!nazwa || !ts.isPropertyAssignment(n)) return null;
      if (nazwa === 'textTransform' && ts.isStringLiteral(n.initializer) && n.initializer.text === 'uppercase') return 'textTransform: uppercase';
      if (nazwa === 'letterSpacing') return `letterSpacing: ${n.initializer.getText()}`;
      return null;
    });
    expect(z).toEqual([]);
  });

  it('02-kierunki: bez „A · B” w tekstach (literały, JSX)', () => {
    const z = skanuj((n) => {
      const s = tekstLiteralu(n);
      return s !== null && s.includes(' · ') ? s.trim().slice(0, 60) : null;
    });
    expect(z).toEqual([]);
  });

  // Wiersz §12a „WERSALIKI …, „A · B”, „→” na przyciskach, mono na etykietach” mówi „brak”: grep stylów nie widzi
  // wersalików wpisanych literami („APPS4CRAFT PASS”), separatora „•” ani strzałki w tekście
  // [M1-audytor-generalny-090; 04-studio-projektowe-018].
  it('02-kierunki: bez wersalików wpisanych literami (dwa słowa wielkimi literami z rzędu)', () => {
    const z = skanuj((n) => {
      const s = tekstNaEkranie(n);
      return s !== null && /\b[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ0-9]{3,}\W+[A-ZĄĆĘŁŃÓŚŹŻ]{4,}\b/u.test(s) ? s.trim().slice(0, 60) : null;
    });
    expect(z).toEqual([]);
  });

  it('02-kierunki: bez separatora „A • B” i bez „→” w tekstach na ekranie (JSX, t())', () => {
    const z = skanuj((n) => {
      const s = tekstNaEkranie(n);
      return s !== null && (/\S\s*•\s*\S/.test(s.trim()) || s.includes('→')) ? s.trim().slice(0, 60) : null;
    });
    expect(z).toEqual([]);
  });

  it('02-kierunki: bez kroju mono na etykietach (fontFamily „monospace”, „Courier”, „Menlo”)', () => {
    // Wyjątek nazwany: pole wklejania kodu receptury to dane (kod do skopiowania), nie etykieta.
    const WYJATKI = ['src/components/ImportRecipeModal.tsx'];
    const z = skanuj((n) => {
      const nazwa = nazwaWlasciwosci(n);
      if (nazwa !== 'fontFamily' || !ts.isPropertyAssignment(n)) return null;
      return /mono|courier|menlo/i.test(n.initializer.getText()) ? `fontFamily: ${n.initializer.getText()}` : null;
    }).filter((x) => !WYJATKI.includes(x.gdzie.split(':')[0].replace(/\\/g, '/')));
    expect(z).toEqual([]);
  });
});

describe('090: wartości domyślne z decyzją (design-spec §12)', () => {
  const zrodlo = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

  it('D-043 (OP-38): przypomnienie o zakwasie na blacie po 12 h od dokarmienia; komentarz z ID decyzji', () => {
    expect(FEED_ROOM_TEMP_AFTER_MS).toBe(12 * 60 * 60 * 1000);
    expect(zrodlo('src/core/notification-config.ts')).toMatch(/OP-38[^\n]*\n[^\n]*FEED_ROOM_TEMP_AFTER_MS|FEED_ROOM_TEMP_AFTER_MS[^\n]*OP-38/);
  });

  it('D-042 (OP-49): prośba o ocenę tylko przy ocenie ≥ 4★; komentarz z ID decyzji', () => {
    expect(PROSBA_O_OCENE.minOcenaGwiazdki).toBe(4);
    const we = (ocena: number) => czyProsicOOcene({ ocenaWypieku: ocena, datyPoprzednichProsb: [], teraz: 1_800_000_000_000 });
    expect([1, 2, 3, 4, 5].map(we)).toEqual([false, false, false, true, true]);
    expect(zrodlo('src/lib/prosba-o-ocene.ts')).toMatch(/minOcenaGwiazdki: 4, \/\/ D-042/);
  });

  it('D-044: region US → imperialne, inne → metryczne; komentarz z ID decyzji', () => {
    expect(domyslnyUkladJednostek({ regionCode: 'US', measurementSystem: 'us' })).toBe('imperial');
    for (const regionCode of ['PL', 'DE', 'GB', 'FR', 'CA', 'LR', 'MM']) {
      expect(domyslnyUkladJednostek({ regionCode })).toBe('metric');
    }
    // „inne → metryczne” także gdy system miar telefonu to „us” (LR, MM) albo „uk” (GB)
    expect(domyslnyUkladJednostek({ regionCode: 'LR', measurementSystem: 'us' })).toBe('metric');
    expect(domyslnyUkladJednostek({ regionCode: 'MM', measurementSystem: 'us' })).toBe('metric');
    expect(domyslnyUkladJednostek({ regionCode: 'GB', measurementSystem: 'uk' })).toBe('metric');
    expect(zrodlo('src/lib/unit-converter.ts')).toMatch(/D-044[\s\S]{0,400}export function domyslnyUkladJednostek/);
  });
});
