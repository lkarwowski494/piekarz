/**
 * Makiety EN mówią „Baker Pro” jak aplikacja (D-063), a komunikat `.blad` w makietach zawija tekst
 * i skaluje ikonę jak aplikacja przy AX5 [M1-audytor-generalny-204; 04-studio-projektowe-601, -605, -606].
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..');
const czytaj = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('204: makiety EN i .blad', () => {
  it('teksty.js (en-US) bez „Piekarz Pro”', () => {
    const linie = czytaj('docs/design/ekrany/teksty.js').split('\n').filter((l) => l.includes('Piekarz Pro'));
    expect(linie).toEqual([]);
  });

  it('kolumna EN tabel design-spec bez „Piekarz Pro”', () => {
    const zle = czytaj('docs/design/design-spec.md')
      .split('\n')
      .filter((l) => l.startsWith('|'))
      .map((l) => l.split('|')[2] ?? '')
      .filter((en) => /\b(Without|requires|require)\b/.test(en) && en.includes('Piekarz Pro'));
    expect(zle).toEqual([]);
  });

  it('.blad: tekst z min-width: 0, ikona rośnie z --ax', () => {
    const css = czytaj('docs/design/ekrany/wspolne.css');
    expect(css).toMatch(/\.blad > span:not\(\[data-ikona\]\)\s*\{[^}]*min-width:\s*0/);
    expect(css).toMatch(/\.blad svg\s*\{[^}]*width:\s*calc\(20px \+ [^)]*var\(--ax\)\)/);
  });
});
