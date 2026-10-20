// 051: VoiceOver — każdy element dotykowy ma rolę, etykietę i stan wyboru
// (docs/design/design-spec.md §11, makiety: role i aria-label) [M1-audytor-generalny-051; 04-studio-projektowe-007]
//
// Reguła testu statycznego (AST TypeScript) dla Pressable, TouchableOpacity, TouchableHighlight i Switch
// w app/ i src/ (bez testów):
// 1. ma atrybut accessibilityRole;
// 2. ma accessibilityLabel albo dziecko tekstowe: element <Text> (także głębiej), którego treść zawiera
//    wywołanie t(…) albo dane (zmienną, pole obiektu); sam znak („+”, „−”, „▲”) albo literał nie wystarczy;
// 3. accessibilityLabel nie jest literałem: wyrażenie z t(…) albo wartość przekazana z zewnątrz (prop, zmienna);
// 4. jeśli styl zależy od wyboru (np. `wybrany && styles.chipActive`, `x ? styles.aSelected : styles.a`),
//    element ma accessibilityState (selected albo checked). Wyłączenie (`disabled`) Pressable przekazuje sam.
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const rootDir = path.resolve(__dirname, '..');
const DOTYKOWE = new Set(['Pressable', 'TouchableOpacity', 'TouchableHighlight', 'Switch']);
const STYL_WYBORU = /(Active|Selected|Wybran|Chosen|Checked|Current)\w*$/;

function walk(dir: string): string[] {
  let res: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__' && entry.name !== 'node_modules') res = res.concat(walk(full));
    } else if (/\.tsx$/.test(entry.name) && !/\.test\./.test(entry.name)) {
      res.push(full);
    }
  }
  return res;
}
const rel = (f: string) => path.relative(rootDir, f).split(path.sep).join('/');

type Otwarcie = ts.JsxOpeningElement | ts.JsxSelfClosingElement;
const atrybut = (el: Otwarcie, nazwa: string) =>
  el.attributes.properties.find((p): p is ts.JsxAttribute => ts.isJsxAttribute(p) && p.name.getText() === nazwa);
const maSpread = (el: Otwarcie) => el.attributes.properties.some((p) => ts.isJsxSpreadAttribute(p));

const zawieraT = (n: ts.Node): boolean => {
  let jest = false;
  const v = (x: ts.Node) => {
    if (jest) return;
    if (ts.isCallExpression(x) && ts.isIdentifier(x.expression) && x.expression.text === 't') jest = true;
    else ts.forEachChild(x, v);
  };
  v(n);
  return jest;
};

/** Treść <Text> liczy się jako etykieta, gdy ma t(…) albo dane (nie sam literał). */
const tekstZnaczacy = (textEl: ts.JsxElement): boolean =>
  textEl.children.some((c) => {
    if (ts.isJsxExpression(c) && c.expression) {
      if (zawieraT(c.expression)) return true;
      return !(ts.isStringLiteral(c.expression) || ts.isNoSubstitutionTemplateLiteral(c.expression) || ts.isNumericLiteral(c.expression));
    }
    if (ts.isJsxElement(c)) return c.openingElement.tagName.getText() === 'Text' ? tekstZnaczacy(c) : false;
    return false;
  });

const maDzieckoTekstowe = (el: ts.JsxElement): boolean => {
  let jest = false;
  const v = (x: ts.Node) => {
    if (jest) return;
    if (ts.isJsxElement(x) && x.openingElement.tagName.getText() === 'Text' && tekstZnaczacy(x)) jest = true;
    else ts.forEachChild(x, v);
  };
  el.children.forEach(v);
  return jest;
};

/** Styl zależny od wyboru: `cond && styles.xActive` albo `cond ? styles.xSelected : …`. */
const stylWyboru = (el: Otwarcie): boolean => {
  const styl = atrybut(el, 'style');
  if (!styl?.initializer) return false;
  let jest = false;
  const v = (x: ts.Node) => {
    if (jest) return;
    if (ts.isPropertyAccessExpression(x) && x.expression.getText() === 'styles' && STYL_WYBORU.test(x.name.text)) {
      for (let p: ts.Node | undefined = x.parent; p && p !== styl; p = p.parent) {
        if (ts.isConditionalExpression(p) || (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken)) {
          jest = true;
          return;
        }
      }
    }
    ts.forEachChild(x, v);
  };
  v(styl.initializer);
  return jest;
};

interface Brak { plik: string; linia: number; element: string; co: string }

function sprawdz(plik: string): Brak[] {
  const src = fs.readFileSync(plik, 'utf8');
  const sf = ts.createSourceFile(plik, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const braki: Brak[] = [];
  const v = (n: ts.Node) => {
    const otwarcie: Otwarcie | undefined = ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : undefined;
    if (otwarcie && DOTYKOWE.has(otwarcie.tagName.getText())) {
      const element = otwarcie.tagName.getText();
      const linia = sf.getLineAndCharacterOfPosition(otwarcie.getStart()).line + 1;
      const dodaj = (co: string) => braki.push({ plik: rel(plik), linia, element, co });
      const spread = maSpread(otwarcie);
      if (!atrybut(otwarcie, 'accessibilityRole') && !spread) dodaj('brak accessibilityRole');
      const etykieta = atrybut(otwarcie, 'accessibilityLabel');
      if (etykieta) {
        const w = etykieta.initializer;
        if (!w || ts.isStringLiteral(w)) dodaj('accessibilityLabel jako literał');
        else if (ts.isJsxExpression(w) && w.expression &&
          (ts.isStringLiteral(w.expression) || ts.isNoSubstitutionTemplateLiteral(w.expression) ||
            (ts.isTemplateExpression(w.expression) && !zawieraT(w.expression)))) dodaj('accessibilityLabel bez t()');
      } else if (!spread && !(ts.isJsxElement(n) && maDzieckoTekstowe(n))) {
        dodaj('brak accessibilityLabel i dziecka tekstowego z t()');
      }
      if (stylWyboru(otwarcie) && !atrybut(otwarcie, 'accessibilityState') && !atrybut(otwarcie, 'aria-selected') && !atrybut(otwarcie, 'aria-checked')) {
        dodaj('styl wyboru bez accessibilityState');
      }
    }
    ts.forEachChild(n, v);
  };
  v(sf);
  return braki;
}

const pliki = ['app', 'src'].flatMap((d) => walk(path.join(rootDir, d)));

describe('051: VoiceOver — role, etykiety i stan wyboru', () => {
  it('każdy element dotykowy w app/ i src/ spełnia regułę (rola, etykieta z t(), stan wyboru)', () => {
    const braki = pliki.flatMap(sprawdz).map((b) => `${b.plik}:${b.linia} <${b.element}> ${b.co}`);
    expect(braki).toEqual([]);
  });

  it('test widzi elementy dotykowe (kontrola, że skan działa)', () => {
    let liczba = 0;
    for (const f of pliki) liczba += (fs.readFileSync(f, 'utf8').match(/<(Pressable|TouchableOpacity|Switch)\b/g) || []).length;
    expect(liczba).toBeGreaterThan(150);
  });

  it('reguła łapie brak roli, etykietę-literał, sam znak jako treść i wybór bez stanu (kontrola reguły)', () => {
    const tmp = path.join(rootDir, 'tests', '__tmp_051_wzorzec.tsx');
    fs.writeFileSync(tmp, [
      'const A = () => (<>',
      '  <Pressable onPress={f}><Text>{t("Zapisz")}</Text></Pressable>',
      '  <Pressable accessibilityRole="button" accessibilityLabel="Zamknij" onPress={f} />',
      '  <Pressable accessibilityRole="button" onPress={f}><Text>+</Text></Pressable>',
      '  <Pressable accessibilityRole="button" style={[styles.chip, wyb && styles.chipActive]} onPress={f}><Text>{t("A")}</Text></Pressable>',
      '  <Pressable accessibilityRole="button" accessibilityState={{ selected: wyb }} style={[styles.chip, wyb && styles.chipActive]} onPress={f}><Text>{nazwa}</Text></Pressable>',
      '</>);',
    ].join('\n'));
    try {
      const co = sprawdz(tmp).map((b) => `${b.linia}:${b.co}`);
      expect(co).toEqual([
        '2:brak accessibilityRole',
        '3:accessibilityLabel jako literał',
        '4:brak accessibilityLabel i dziecka tekstowego z t()',
        '5:styl wyboru bez accessibilityState',
      ]);
    } finally {
      fs.unlinkSync(tmp);
    }
  });
});
