/**
 * M1-audytor-generalny-198 (03-zakres-602): dopóki F-71 (protokoły ratunkowe) jest PÓŹNIEJ
 * z ukrytym wejściem, strona www w `site/` ich nie obiecuje. Dlaczego: tekst o aplikacji
 * mówi tylko o tym, co robi kod tej wersji (ZM-19, wybór 032 b).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { wejscieWidoczne } from '../src/lib/wejscia-pozniej';

const root = path.join(__dirname, '..');
const katalog = path.join(root, 'site');

function pliki(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return pliki(p);
    return /\.(html?|md|txt|json)$/i.test(e.name) ? [p] : [];
  });
}

describe('strona www bez protokołów ratunkowych, gdy F-71 PÓŹNIEJ (198)', () => {
  it('site/ ma strony do sprawdzenia', () => {
    expect(pliki(katalog).length).toBeGreaterThan(0);
  });

  it('żadna strona nie wspomina protokołów ratunkowych', () => {
    if (wejscieWidoczne('protokoly-ratunkowe')) return;
    const trafienia = pliki(katalog).filter((p) =>
      /protok[oó]ł(y)? ratunkow/i.test(fs.readFileSync(p, 'utf8')) ||
      /rescue protocol/i.test(fs.readFileSync(p, 'utf8')),
    );
    expect(trafienia.map((p) => path.relative(root, p))).toEqual([]);
  });
});
