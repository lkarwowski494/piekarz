// Osiągalność komponentów kalkulatora i motywów z app/ (M1-audytor-generalny-149).
// Plik w src/components/calculator/ lub src/ui/, do którego nie prowadzi z app/ żaden import
// wartości (przechodnio; `import type` się nie liczy), jest martwym kodem: jego testy zawyżają
// pokrycie i sprawdzają coś, czego użytkownik nie widzi.
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const EXT = ['.ts', '.tsx', '.js', '.jsx'];

function pliki(dir: string, filtr: (p: string) => boolean): string[] {
  const out: string[] = [];
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '__tests__' || e.name === 'node_modules') continue;
      out.push(...pliki(rel, filtr));
    } else if (filtr(rel)) out.push(rel);
  }
  return out;
}

function rozwiaz(od: string, spec: string): string | null {
  let baza: string;
  if (spec.startsWith('@/')) baza = path.posix.join('src', spec.slice(2));
  else if (spec.startsWith('.')) baza = path.posix.normalize(path.posix.join(path.posix.dirname(od), spec));
  else return null;
  const kandydaci = [baza, ...EXT.map((e) => baza + e), ...EXT.map((e) => path.posix.join(baza, 'index' + e))];
  for (const k of kandydaci) {
    const abs = path.join(ROOT, k);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return k;
  }
  return null;
}

/** Specyfikatory importów wartości (bez `import type` / `export type`). */
function importyWartosci(src: string): string[] {
  const out: string[] = [];
  const re = /\b(import|export)\s+(type\s+)?(?:[^'";]*?\sfrom\s+)?['"]([^'"]+)['"]|\b(?:require|import)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m[4]) out.push(m[4]);
    else if (!m[2]) out.push(m[3]);
  }
  return out;
}

function osiagalneZApp(): Set<string> {
  const start = pliki('app', (p) => EXT.includes(path.extname(p)));
  const seen = new Set<string>();
  const kolejka = [...start];
  while (kolejka.length) {
    const f = kolejka.pop() as string;
    if (seen.has(f)) continue;
    seen.add(f);
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const spec of importyWartosci(src)) {
      const r = rozwiaz(f, spec);
      if (r && !seen.has(r)) kolejka.push(r);
    }
  }
  return seen;
}

describe('osiągalność kalkulatora i motywów z app/ (149)', () => {
  it('parser odróżnia import wartości od import type', () => {
    expect(importyWartosci("import type { A } from './a';\nimport { B } from './b';\nexport { C } from './c';\nexport type { D } from './d';"))
      .toEqual(['./b', './c']);
  });

  it('każdy plik src/components/calculator/** i src/ui/*.ts jest osiągalny z app/ importem wartości', () => {
    const osiagalne = osiagalneZApp();
    const badane = [
      ...pliki('src/components/calculator', (p) => p.endsWith('.tsx') || p.endsWith('.ts')),
      ...pliki('src/ui', (p) => /^src\/ui\/[^/]+\.ts$/.test(p)),
    ];
    expect(badane.length).toBeGreaterThan(0);
    const martwe = badane.filter((p) => !osiagalne.has(p)).sort();
    expect(martwe).toEqual([]);
  });

  it('w src/ nie ma motywów amber-theme ani craft-suite-theme', () => {
    const motywy = pliki('src', (p) => /(amber-theme|craft-suite-theme)\.[jt]sx?$/.test(p));
    expect(motywy).toEqual([]);
  });
});
