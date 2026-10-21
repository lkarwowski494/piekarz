/**
 * Pola tekstowe bez etykiety VoiceOver czytały się jako „pole tekstowe” albo treść podpowiedzi, która znika
 * po wpisaniu. Każdy TextInput w app/ i src/ ma accessibilityLabel (tekst widocznej etykiety pola przez t());
 * wyjątek: NumInput, który przekazuje etykietę z propsów wywołującego (…rest) [audyt-niezalezny G-7].
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

const root = path.join(__dirname, '..');
const WYJATKI = new Set(['src/components/NumInput.tsx']);

function pliki(dir: string): string[] {
  return fs.readdirSync(path.join(root, dir)).flatMap((f) => {
    const rel = `${dir}/${f}`;
    if (f === '__tests__' || f === 'node_modules') return [];
    if (fs.statSync(path.join(root, rel)).isDirectory()) return pliki(rel);
    return /\.tsx$/.test(f) ? [rel] : [];
  });
}

describe('G-7: pola tekstowe z etykietą VoiceOver', () => {
  it('każdy TextInput ma accessibilityLabel', () => {
    const braki: string[] = [];
    for (const rel of [...pliki('src'), ...pliki('app')]) {
      if (WYJATKI.has(rel)) continue;
      const src = fs.readFileSync(path.join(root, rel), 'utf8');
      if (!src.includes('<TextInput')) continue;
      const sf = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const v = (n: ts.Node) => {
        if ((ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n)) && n.tagName.getText() === 'TextInput') {
          const nazwy = n.attributes.properties.map((a) => (ts.isJsxAttribute(a) ? a.name.getText() : '...'));
          if (!nazwy.includes('accessibilityLabel')) braki.push(`${rel}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`);
        }
        ts.forEachChild(n, v);
      };
      v(sf);
    }
    expect(braki).toEqual([]);
  });
});
