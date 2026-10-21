/**
 * Dawna nazwa „Crust” nie zostaje w słownikach w formie odmienionej („Crusti”, „Crustin”, „Crustban”): generator
 * zamieniał tylko całe słowo (\bCrust\b), więc et, fi i hu pokazywały starą nazwę zamiast nazwy lokalnej (D-053:
 * et „Pagar”, fi „Leipuri”, hu „Pék”) [audyt-niezalezny F-6].
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..');
const dir = path.join(root, 'src/lib/i18n-slowniki');

describe('„Crust” w żadnej formie w słownikach (F-6)', () => {
  it.each(fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory()))('%s: bez „Crust…”', (kod) => {
    const linie = fs
      .readdirSync(path.join(dir, kod))
      .filter((f) => /^czesc-\d+\.ts$/.test(f))
      .flatMap((f) => fs.readFileSync(path.join(dir, kod, f), 'utf8').split('\n'))
      .filter((l) => /: '.*Crust/i.test(l));
    expect(linie).toEqual([]);
  });
});
