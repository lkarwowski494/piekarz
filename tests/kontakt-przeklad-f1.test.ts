/**
 * Karta „Kontakt” w Ustawieniach jest widoczna w 1.0 (poza ukrytą rodziną Apps4Craft F-52), więc jej teksty nie mogą
 * być na liście PÓŹNIEJ (docs/lokalizacja/pozniej-poza-przekladem.json), która zwalnia je z przekładu: w 33 językach
 * pokazywały się po angielsku. Każdy tekst karty ma w każdym języku własny przekład albo wpis „czeka na przekład”
 * (docs/lokalizacja/czeka-na-przeklad.json), który przebieg przekładu M1 zamyka [audyt-niezalezny F-1].
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EN } from '../src/lib/i18n.en';
import { getAllSupportedLocaleCodes } from '../src/lib/i18n-locales';

const root = path.join(__dirname, '..');
const json = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const KARTA = ['Kontakt', 'Polityka prywatności', 'Oceń w App Store', 'Ocena wymaga połączenia z App Store.', 'Napisz do nas'];
/** Przekład noc3 równy tekstowi EN, bo to słowo języka docelowego (fr, ro, nl „Contact”), nie brak przekładu. */
const TAKIE_JAK_EN: Record<string, string[]> = { fr: ['Kontakt'], ro: ['Kontakt'], nl: ['Kontakt'] };

function slownik(kod: string): Map<string, string> {
  const dir = path.join(root, 'src/lib/i18n-slowniki', kod);
  const m = new Map<string, string>();
  const un = (s: string) => JSON.parse(s.startsWith("'") ? `"${s.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"` : s);
  for (const f of fs.readdirSync(dir).filter((x) => /^czesc-\d+\.ts$/.test(x))) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const [, k, v] of src.matchAll(/^\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"):\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"),?$/gm)) m.set(un(k), un(v));
  }
  return m;
}

describe('karta „Kontakt” w językach przekładu (F-1)', () => {
  it('teksty karty są w kodzie StudioEcosystemSection poza blokiem rodziny F-52', () => {
    const src = fs.readFileSync(path.join(root, 'src/components/settings/StudioEcosystemSection.tsx'), 'utf8');
    const poRodzinie = src.slice(src.indexOf("{t('Kontakt')}"));
    for (const k of KARTA) expect({ k, jest: poRodzinie.includes(`t('${k}')`) }).toEqual({ k, jest: true });
  });

  it('żaden tekst karty nie jest na liście PÓŹNIEJ (zwolnienie z przekładu)', () => {
    const pozniej = (json('docs/lokalizacja/pozniej-poza-przekladem.json').klucze as Array<{ klucz: string }>).map((x) => x.klucz);
    expect(KARTA.filter((k) => pozniej.includes(k))).toEqual([]);
  });

  it.each(getAllSupportedLocaleCodes().filter((k) => k !== 'pl' && k !== 'en'))('%s: każdy tekst karty ma przekład albo wpis „czeka na przekład”', (kod) => {
    const s = slownik(kod);
    const czeka = json('docs/lokalizacja/czeka-na-przeklad.json').klucze as Array<{ klucz: string; jezyki?: string[] }>;
    const brak = KARTA.filter((k) => {
      const v = s.get(k);
      if (v && (v !== EN[k] || TAKIE_JAK_EN[kod]?.includes(k))) return false;
      const w = czeka.find((x) => x.klucz === k);
      return !(w && (!w.jezyki || w.jezyki.includes(kod)));
    });
    expect(brak).toEqual([]);
  });
});
