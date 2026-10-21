/**
 * Krój tytułów (D-050) a znaki języka: w językach, których liter nie ma w pliku kroju (cmap), tytuł idzie krojem
 * systemowym, zamiast mieszać dwa kroje w jednym słowie (vi) [M1-audytor-generalny-171; 09-lokalizacja-508].
 * Pokrycie liczone z pliku kroju i tekstów 35 języków, więc nowy przekład z brakującym znakiem przewróci test.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { StyleSheet } from 'react-native';
import { EN } from '../../lib/i18n.en';
import { ACTIVE_LANGS, setLang, t } from '../../lib/i18n';
import { JEZYKI_POZA_KROJEM_TYTULOW } from '../kroj-tytulow';
import { typografia } from '../tokeny';
import { naglowekZwykly } from '../naglowek';

const ROOT = join(__dirname, '..', '..', '..');

/** Znaki z glifem w tabeli cmap (format 4 albo 12) pliku TrueType. */
function znakiKroju(plik: string): Set<number> {
  const b = readFileSync(plik);
  const n = b.readUInt16BE(4);
  let cmap = -1;
  for (let i = 0; i < n; i++) if (b.toString('latin1', 12 + i * 16, 16 + i * 16) === 'cmap') cmap = b.readUInt32BE(12 + i * 16 + 8);
  const out = new Set<number>();
  const tabele = b.readUInt16BE(cmap + 2);
  for (let i = 0; i < tabele; i++) {
    const off = cmap + b.readUInt32BE(cmap + 4 + i * 8 + 4);
    const format = b.readUInt16BE(off);
    if (format === 12) {
      const grupy = b.readUInt32BE(off + 12);
      for (let g = 0; g < grupy; g++) {
        const [od, doZ, glif] = [0, 4, 8].map((d) => b.readUInt32BE(off + 16 + g * 12 + d));
        for (let c = od; c <= doZ; c++) if (glif + (c - od) !== 0) out.add(c);
      }
    } else if (format === 4) {
      const seg = b.readUInt16BE(off + 6) / 2;
      const end = off + 14, start = end + seg * 2 + 2, delta = start + seg * 2, ro = delta + seg * 2;
      for (let s = 0; s < seg; s++) {
        const e = b.readUInt16BE(end + s * 2), st = b.readUInt16BE(start + s * 2);
        const d = b.readInt16BE(delta + s * 2), r = b.readUInt16BE(ro + s * 2);
        for (let c = st; c <= e && c !== 0xffff; c++) {
          const g = r === 0 ? (c + d) & 0xffff : b.readUInt16BE(ro + s * 2 + r + (c - st) * 2);
          if (g !== 0) out.add(c);
        }
      }
    }
  }
  return out;
}

const KROJ = znakiKroju(join(ROOT, 'assets/fonts/SofiaSansSemiCondensed-wght.ttf'));

function brakujace(l: (typeof ACTIVE_LANGS)[number]): string[] {
  setLang(l);
  const brak = new Set<string>();
  for (const k of Object.keys(EN)) for (const ch of t(k)) if (!/\s/.test(ch) && !KROJ.has(ch.codePointAt(0)!)) brak.add(ch);
  return [...brak];
}

function plikiTs(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === '__tests__' ? [] : plikiTs(p);
    return /\.tsx?$/.test(f) ? [p] : [];
  });
}

describe('krój tytułów a litery języka (171)', () => {
  afterEach(() => setLang('pl'));

  it('języki poza krojem = języki z literami spoza cmap pliku kroju', () => {
    const poza = ACTIVE_LANGS.filter((l) => brakujace(l).length > 0);
    expect(KROJ.size).toBeGreaterThan(500);
    expect([...poza].sort()).toEqual([...JEZYKI_POZA_KROJEM_TYTULOW].sort());
  });

  it('tytuł: krojem tytułów w pl, krojem systemowym w vi, ja, ko, zh-Hant (przy renderze, po zmianie języka)', () => {
    const tytul = () => StyleSheet.flatten(naglowekZwykly.headerTitleStyle).fontFamily;
    setLang('pl');
    expect(tytul()).toBe(typografia.krojTytulow);
    for (const l of JEZYKI_POZA_KROJEM_TYTULOW) {
      setLang(l);
      expect(tytul()).toBeUndefined();
    }
    setLang('de');
    expect(tytul()).toBe(typografia.krojTytulow);
  });

  it('żaden styl nie zapisuje kroju tytułów na stałe przy ładowaniu modułu', () => {
    const stale = [...plikiTs(join(ROOT, 'src')), ...plikiTs(join(ROOT, 'app'))]
      .filter((p) => /fontFamily:\s*(theme\.typography|typografia)\.krojTytulow/.test(readFileSync(p, 'utf8')))
      .map((p) => relative(ROOT, p));
    expect(stale).toEqual([]);
  });
});
