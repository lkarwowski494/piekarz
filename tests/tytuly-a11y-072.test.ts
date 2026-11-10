/**
 * Tytuły testów nie obiecują pomiaru pola dotyku ani szerokości 320 pt, gdy test sprawdza tylko styl: każdy taki tytuł
 * ma dopisek „(styl, bez pomiaru)” [M1-audytor-generalny-072; 07-jakosc-008; zgoda właściciela na zmianę nazw].
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');
const PAT = /(≥ ?44|>= ?44 ?pt|44 ?× ?44|≥ ?48|cel ≥|pole dotyku|touch target|320 ?pt)/;
const DEF = /(?:\bit|\btest|\bdescribe)(?:\.each\((?:[^()]|\([^()]*\))*\))?\((['"`])((?:\\.|(?!\1).)*)\1/g;

function pliki(kat: string): string[] {
  return fs.readdirSync(kat, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(kat, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' ? [] : pliki(p);
    return /\.test\.tsx?$/.test(e.name) ? [p] : [];
  });
}

describe('072: tytuły testów a11y mówią prawdę', () => {
  it('tytuł z „44 pt”, „pole dotyku” albo „320 pt” ma dopisek „(styl, bez pomiaru)”', () => {
    const zle: string[] = [];
    for (const f of [...pliki(path.join(ROOT, 'src')), ...pliki(path.join(ROOT, 'tests'))]) {
      for (const m of fs.readFileSync(f, 'utf8').matchAll(DEF)) {
        if (PAT.test(m[2]) && !m[2].includes('(styl, bez pomiaru)')) zle.push(`${path.relative(ROOT, f)}: ${m[2]}`);
      }
    }
    expect(zle).toEqual([]);
  });
});
