// 052: statyczny pomiar celów dotykowych ze stylów (DEC-15 a, tokeny `cele`: 48 / 44 / 64)
// [M1-audytor-generalny-052; 04-studio-projektowe-006, 01-odkrywanie-020]
//
// Reguła: wysokość celu to największa wartość `minHeight` (albo `height`) w stylach bazowych elementu
// dotykowego, czyli w stylach, które nie zależą od warunku (`a && styles.x`, `a ? styles.x : …` się nie liczą).
// Wartość to liczba albo token `theme.cele.*` / `cele.*`. `hitSlop` liczymy osobno i NIE dolicza się do progu:
// rozszerza tylko obszar reakcji poza widoczny przycisk, a próg dotyczy widocznego celu (HIG, DEC-15 a).
import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { cele } from '../../src/ui/tokeny';

export const ROOT = path.resolve(__dirname, '../..');
const DOTYKOWE = new Set(['Pressable', 'TouchableOpacity', 'TouchableHighlight']);
const TOKENY: Record<string, number> = {
  glownyPrzeplyw: cele.glownyPrzeplyw,
  pozostale: cele.pozostale,
  przyciskKciuka: cele.przyciskKciuka,
};

export interface Cel {
  plik: string;
  linia: number;
  testID?: string;
  wysokosc: number | null;
  /** Plik i nazwa stylu bazowego (do poprawki), jeśli da się go ustalić. */
  styl?: { plik: string; nazwa: string };
  hitSlop: boolean;
  /** Element dotykowy wewnątrz innego: celem jest zewnętrzny (jego styl mierzymy osobno). */
  zagniezdzony: boolean;
}

const parse = (plik: string) =>
  ts.createSourceFile(plik, fs.readFileSync(plik, 'utf8'), ts.ScriptTarget.Latest, true, plik.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

/** Obiekty stylów z `StyleSheet.create({...})` w pliku: nazwa → literał obiektu. */
function stylePliku(sf: ts.SourceFile): Map<string, ts.ObjectLiteralExpression> {
  const out = new Map<string, ts.ObjectLiteralExpression>();
  const v = (n: ts.Node) => {
    if (ts.isCallExpression(n) && n.expression.getText(sf) === 'StyleSheet.create' && n.arguments[0] && ts.isObjectLiteralExpression(n.arguments[0])) {
      for (const p of n.arguments[0].properties) {
        if (ts.isPropertyAssignment(p) && ts.isObjectLiteralExpression(p.initializer)) out.set(p.name.getText(sf), p.initializer);
      }
    }
    ts.forEachChild(n, v);
  };
  v(sf);
  return out;
}

/** Plik, z którego pochodzi `styles` (lokalny albo importowany moduł stylów). */
function zrodloStylow(sf: ts.SourceFile, plik: string): string {
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && st.importClause?.namedBindings && ts.isNamedImports(st.importClause.namedBindings) &&
      st.importClause.namedBindings.elements.some((e) => e.name.text === 'styles') && ts.isStringLiteral(st.moduleSpecifier)) {
      const base = path.resolve(path.dirname(plik), st.moduleSpecifier.text);
      for (const ext of ['.ts', '.tsx']) if (fs.existsSync(base + ext)) return base + ext;
    }
  }
  return plik;
}

export function wartosc(obj: ts.ObjectLiteralExpression, nazwa: string): number | null {
  for (const p of obj.properties) {
    if (!ts.isPropertyAssignment(p) || p.name.getText() !== nazwa) continue;
    const w = p.initializer;
    if (ts.isNumericLiteral(w)) return Number(w.text);
    const tekst = w.getText();
    const m = /(?:theme\.)?cele\.(\w+)$/.exec(tekst);
    if (m && TOKENY[m[1]] !== undefined) return TOKENY[m[1]];
  }
  return null;
}

const wysokoscObiektu = (o: ts.ObjectLiteralExpression) => {
  const a = wartosc(o, 'minHeight');
  const b = wartosc(o, 'height');
  return a === null && b === null ? null : Math.max(a ?? 0, b ?? 0);
};

export function celeWPliku(plik: string): Cel[] {
  const sf = parse(plik);
  const zrodlo = zrodloStylow(sf, plik);
  const style = stylePliku(zrodlo === plik ? sf : parse(zrodlo));
  const rel = (f: string) => path.relative(ROOT, f).split(path.sep).join('/');
  const out: Cel[] = [];
  const v = (n: ts.Node) => {
    const el = ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : undefined;
    if (el && DOTYKOWE.has(el.tagName.getText(sf))) {
      const attr = (nm: string) => el.attributes.properties.find((a): a is ts.JsxAttribute => ts.isJsxAttribute(a) && a.name.getText(sf) === nm);
      const tid = attr('testID')?.initializer;
      const testID = tid && ts.isStringLiteral(tid) ? tid.text : tid && ts.isJsxExpression(tid) && tid.expression ? tid.expression.getText(sf) : undefined;
      const styl = attr('style');
      let wysokosc: number | null = null;
      let pierwszy: Cel['styl'];
      if (styl?.initializer) {
        const w = (x: ts.Node) => {
          for (let p: ts.Node | undefined = x.parent; p && p !== styl; p = p.parent) {
            if (ts.isConditionalExpression(p) || (ts.isBinaryExpression(p) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(p.operatorToken.kind))) {
              // warunek: część po `?`/`&&` nie jest bazowa (warunek sam w sobie też nie)
              if (!ts.isConditionalExpression(p) || p.condition !== x) return false;
            }
          }
          return true;
        };
        const odwiedz = (x: ts.Node) => {
          if (ts.isPropertyAccessExpression(x) && x.expression.getText(sf) === 'styles' && w(x)) {
            const o = style.get(x.name.text);
            if (!pierwszy) pierwszy = { plik: rel(zrodlo), nazwa: x.name.text };
            const h = o ? wysokoscObiektu(o) : null;
            if (h !== null) wysokosc = Math.max(wysokosc ?? 0, h);
            return;
          }
          if (ts.isObjectLiteralExpression(x) && w(x)) {
            const h = wysokoscObiektu(x);
            if (h !== null) wysokosc = Math.max(wysokosc ?? 0, h);
          }
          ts.forEachChild(x, odwiedz);
        };
        odwiedz(styl.initializer);
      }
      let zagniezdzony = false;
      for (let p: ts.Node | undefined = n.parent; p; p = p.parent) {
        if (ts.isJsxElement(p) && DOTYKOWE.has(p.openingElement.tagName.getText(sf))) { zagniezdzony = true; break; }
        if (ts.isFunctionLike(p)) break;
      }
      out.push({ plik: rel(plik), linia: sf.getLineAndCharacterOfPosition(el.getStart(sf)).line + 1, testID, wysokosc, styl: pierwszy, hitSlop: !!attr('hitSlop'), zagniezdzony });
    }
    ts.forEachChild(n, v);
  };
  v(sf);
  return out;
}

export function plikiTsx(): string[] {
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return e.name === '__tests__' || e.name === 'node_modules' ? [] : walk(full);
      return /\.tsx$/.test(e.name) && !/\.test\./.test(e.name) ? [full] : [];
    });
  return ['app', 'src'].flatMap((d) => walk(path.join(ROOT, d)));
}

/** Prowadzenie wypieku (Stolnica) i akcje główne: próg `cele.glownyPrzeplyw` (48). */
export const PLIKI_PROWADZENIA = [/^app\/stolnica\.tsx$/, /^src\/components\/stolnica\//];
// 057: akcje receptury „Temperatura wody” i „Zmień składniki” to akcje główne 48 pt (design-spec §11b) [M1-audytor-generalny-057]
export const AKCJE_GLOWNE = ['start-bake-btn', 'fast-start-bake-cta-btn', 'save-custom-recipe-btn', 'water-temp-btn', 'edit-ingredients-btn', 'next-or-finish-step-btn'];

export function prog(c: Cel): number {
  if (PLIKI_PROWADZENIA.some((r) => r.test(c.plik))) return cele.glownyPrzeplyw;
  if (c.testID && AKCJE_GLOWNE.includes(c.testID)) return cele.glownyPrzeplyw;
  return cele.pozostale;
}
