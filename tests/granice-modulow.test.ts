/**
 * Granice modułów (ADR-006: „domena bez importów Expo/React”) [M1-audytor-generalny-020; 05-architekt-003].
 * Logika skryptu `granice.mjs` z wzorców roli 05 (biblioteka prompts, role/05-architekt/wzorce.md, „Granice modułów”):
 * domena `src/core` importuje tylko siebie (poza `import type`); warstwa danych `src/data` bez cykli importów
 * [M1-audytor-generalny-021; 05-architekt-004].
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';

const ROOT = resolve(__dirname, '..', 'src');
const EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const pomin = (p: string) => /\.(test|spec)\.|\.d\.ts$|__tests__|node_modules/.test(p);
const IMPORT = /(?:import|export)\s+(type\s+)?(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]|(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function pliki(d: string): string[] {
  return readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    if (statSync(p).isDirectory()) return pliki(p);
    return EXT.some((e) => n.endsWith(e)) && !pomin(p) ? [p] : [];
  });
}
const znajdz = (baza: string) => [baza, ...EXT.map((e) => baza + e), ...EXT.map((e) => join(baza, 'index' + e))].find((p) => existsSync(p) && statSync(p).isFile());

/** Krawędzie importów (bez `import type`) i naruszenia domeny dla katalogu domeny względem src. */
export function granice(domena: string) {
  const dom = resolve(ROOT, domena) + sep;
  const graf = new Map<string, string[]>();
  const naruszenia: string[] = [];
  for (const p of pliki(ROOT)) {
    const krawedzie: string[] = [];
    for (const m of readFileSync(p, 'utf8').matchAll(IMPORT)) {
      const spec = m[2] ?? m[3];
      const tylkoTyp = Boolean(m[1]);
      const baza = spec.startsWith('.') ? resolve(dirname(p), spec) : null;
      const cel = baza ? znajdz(baza) : undefined;
      const wolno = cel ? cel.startsWith(dom) : false;
      if (p.startsWith(dom) && !tylkoTyp && !wolno) naruszenia.push(`DOMENA ${relative(ROOT, p)} importuje '${spec}'`);
      if (cel && !tylkoTyp) krawedzie.push(cel);
    }
    graf.set(p, krawedzie);
  }
  return { graf, naruszenia };
}

/** Cykle importów (DFS jak granice.mjs), ścieżki względem src. */
export function cykle(graf: Map<string, string[]>): string[] {
  const stan = new Map<string, number>();
  const sciezka: string[] = [];
  const out = new Set<string>();
  const dfs = (u: string) => {
    stan.set(u, 1);
    sciezka.push(u);
    for (const v of graf.get(u) ?? []) {
      if (stan.get(v) === 1) out.add(sciezka.slice(sciezka.indexOf(v)).concat(v).map((x) => relative(ROOT, x)).join(' -> '));
      else if (!stan.has(v)) dfs(v);
    }
    sciezka.pop();
    stan.set(u, 2);
  };
  for (const p of graf.keys()) if (!stan.has(p)) dfs(p);
  return [...out];
}

describe('Granice modułów (granice.mjs, roli 05)', () => {
  it('warstwa danych src/data bez cykli importów (cykl tylko z plików data)', () => {
    const wData = cykle(granice('core').graf).filter((c) => c.split(' -> ').every((n) => n.startsWith('data/')));
    expect(wData).toEqual([]);
  });

  it('domena src/core nie importuje i18n, formatowania, katalogu receptur ani harmonogramu (poza import type)', () => {
    expect(granice('core').naruszenia).toEqual([]);
  });
});
