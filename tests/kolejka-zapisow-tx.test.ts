/**
 * Trwała kontrola mechanizmu M1-audytor-generalny-001 (05-architekt-001): treść każdej transakcji zapisuje tylko przez
 * `tx` z argumentu. Zapis przez obiekt z kolejki (`db`) albo przez `getDb()` w treści transakcji czekałby na samą
 * transakcję (zakleszczenie), a połączenie spoza kolejki wróciłoby do zapisów wchodzących w cudzą transakcję.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.join(__dirname, '..');

function pliki(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' || e.name === 'node_modules' ? [] : pliki(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

/** Treści callbacków `withTransactionAsync(...)` z nagłówkiem. */
export function transakcje(tekst: string): Array<{ naglowek: string; tresc: string }> {
  const out: Array<{ naglowek: string; tresc: string }> = [];
  const re = /withTransactionAsync\(\s*(async\s*\(([^)]*)\)\s*=>\s*\{)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tekst))) {
    let d = 1;
    let j = m.index + m[0].length;
    for (; j < tekst.length && d; j++) {
      if (tekst[j] === '{') d++;
      else if (tekst[j] === '}') d--;
    }
    out.push({ naglowek: m[2].trim(), tresc: tekst.slice(m.index + m[0].length, j - 1) });
  }
  return out;
}

const zrodla = [...pliki(path.join(ROOT, 'src')), ...pliki(path.join(ROOT, 'app'))].filter((p) => !p.endsWith('kolejka-zapisow.ts'));

describe('M1-audytor-generalny-001: transakcje tylko przez tx', () => {
  it('każde wywołanie withTransactionAsync ma callback z parametrem tx', () => {
    const zle = zrodla.flatMap((p) => {
      const t = fs.readFileSync(p, 'utf8');
      const wszystkie = (t.match(/withTransactionAsync\(/g) ?? []).length;
      const ztx = transakcje(t).filter((x) => x.naglowek === 'tx').length;
      return wszystkie === ztx ? [] : [`${path.relative(ROOT, p)}: ${wszystkie - ztx} bez (tx)`];
    });
    expect(zle).toEqual([]);
  });

  it('treść transakcji nie używa db ani getDb()', () => {
    const zle = zrodla.flatMap((p) =>
      transakcje(fs.readFileSync(p, 'utf8'))
        .filter((x) => /\bdb\b|getDb\(/.test(x.tresc))
        .map((x) => `${path.relative(ROOT, p)}: ${x.tresc.trim().slice(0, 60)}`)
    );
    expect(zle).toEqual([]);
  });

  it('kontrola potrafi paść: wykrywa treść z db i callback bez tx', () => {
    const zly = 'await db.withTransactionAsync(async () => { await db.runAsync("x"); });';
    expect(transakcje(zly).map((x) => x.naglowek)).toEqual(['']);
    const zlyTx = 'await db.withTransactionAsync(async (tx) => { await db.runAsync("x"); });';
    expect(transakcje(zlyTx).filter((x) => /\bdb\b/.test(x.tresc))).toHaveLength(1);
  });
});
