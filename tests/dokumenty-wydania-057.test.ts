/**
 * M1-audytor-generalny-057 (02-monetyzacja-005, MON-12 z MON-17; DEC-08 a, D-286): dokumenty wydania zgodne ze stanem.
 * - `docs/wydanie/ceny.json` powołuje D-112 (ceny bez zmian, przegląd po 6 miesiącach od premiery), nie D-038
 *   „bez propozycji zmian” (D-112 odrzuciła model D-038 i zapisała przegląd cen).
 * - Z-1 (usunięcie „Free Trial 2 Weeks” z `.pro.monthly` i `.pro.yearly` w App Store Connect) jest zrobione
 *   2026-11-03 (słowa właściciela „Obie usuenięte.”, docs/wznowienie-M3.md): B2 w droga-do-app-store.md i W1-05
 *   w plan-wydania-1.0.md z datą, wpis w dzienniku; żaden dokument wydania nie każe go robić drugi raz.
 * - `grep -rn "D-038" docs/wydanie` trafia tylko w historię (dziennik i zdania o usuniętej ofercie).
 * Dlaczego trwała kontrola: kolejna rola czyta dokumenty wydania, nie pamięć; „bez propozycji zmian” pomijało Z-10.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8').replace(/\r\n/g, '\n');
const WYDANIE = 'docs/wydanie';

function pliki(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((n) => {
    const p = `${dir}/${n}`;
    return statSync(join(root, p)).isDirectory() ? pliki(p) : /\.(md|json)$/.test(n) ? [p] : [];
  });
}

describe('dokumenty wydania po D-112 i po Z-1 (057)', () => {
  it('ceny.json: opis i źródła z D-112 i przeglądem cen, bez D-038 i „bez propozycji zmian”', () => {
    const c = JSON.parse(read(`${WYDANIE}/ceny.json`)) as { opis: string; zrodla: string[]; bezOfertyWprowadzajacej: string };
    const naglowek = [c.opis, ...c.zrodla].join('\n');
    expect(naglowek).not.toMatch(/D-038/);
    expect(naglowek).not.toMatch(/bez propozycji zmian/);
    expect(c.opis).toMatch(/D-112/);
    expect(c.opis).toMatch(/6 miesięcy|6 miesiącach/);
    expect(c.zrodla[0]).toMatch(/D-112/);
    expect(c.bezOfertyWprowadzajacej).toMatch(/2026-11-03/);
  });

  it('grep D-038 w docs/wydanie: tylko dziennik i zdania o usuniętej ofercie', () => {
    const trafienia = pliki(WYDANIE)
      .filter((p) => !p.endsWith('/dziennik.md'))
      .flatMap((p) => read(p).split('\n').map((l, i) => ({ miejsce: `${relative(root, join(root, p))}:${i + 1}`, l })))
      .filter(({ l }) => /D-038/.test(l) && !/usunięt/.test(l));
    expect(trafienia.map((t) => t.miejsce)).toEqual([]);
  });

  it('Z-1 zrobione 2026-11-03: B2 i W1-05 z datą, wpis w dzienniku', () => {
    const droga = read(`${WYDANIE}/droga-do-app-store.md`);
    const b2 = droga.split('\n').find((l) => l.startsWith('| B2 ')) ?? '';
    expect(b2).not.toMatch(/nie wykonane/);
    expect(b2).toMatch(/2026-11-03/);
    expect(b2).toMatch(/Obie usuenięte/);
    const plan = read(`${WYDANIE}/plan-wydania-1.0.md`);
    expect(plan).toMatch(/^- \[x\] \*\*W1-05\*\*[^\n]*2026-11-03/m);
    const dziennik = read(`${WYDANIE}/dziennik.md`);
    expect(dziennik).toMatch(/2026-11-03[^\n]*Z-1[^\n]*Obie usuenięte/);
  });

  it('żaden dokument wydania nie każe usuwać oferty drugi raz', () => {
    const zle = pliki(WYDANIE)
      .flatMap((p) => read(p).split('\n').map((l, i) => ({ miejsce: `${p}:${i + 1}`, l })))
      .filter(({ l }) => /usuwa M1 w App Store Connect|\*\*nie wykonane\*\*|prawdziwe w sklepie dopiero po Z-1|Krok ASC rano: usunięcie Free Trial/.test(l));
    expect(zle.map((t) => t.miejsce)).toEqual([]);
  });
});
