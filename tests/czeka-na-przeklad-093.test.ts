/**
 * Klucze 1.0, które po wpięciu 093 czekały na mały przebieg przekładu M1 (docs/lokalizacja/czeka-na-przeklad.json:
 * 6 szablonów Doktora Chleba, 6 czasów dojrzewania zaczynu). Po wpięciu przebiegu „doktor” lista jest pusta,
 * a w każdym z 33 języków przekładu klucz ma własny tekst, nie angielski [M1-audytor-generalny-093; 09-lokalizacja-093-03].
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EN } from '../src/lib/i18n.en';
import { getAllSupportedLocaleCodes } from '../src/lib/i18n-locales';

const root = path.join(__dirname, '..');
/** 15 kluczy dawnych wyjątków „noc / D-126” (14) i „noc / D-132” (1), przełożone w 014 (przeklad-m2-014-2026-11-09.json). */
const KLUCZE_014: string[] = JSON.parse(fs.readFileSync(path.join(root, 'docs/lokalizacja/przeklad-m2-014-2026-11-09.json'), 'utf8')).pl;

const KLUCZE = [
  'Jaskinie (Niedofermentowany)',
  'Płaski dysk (Przerośnięty)',
  'Gumowaty (Gorący nóż)',
  'Pęknięty bok',
  'Zbyt kwaśny (Octowy)',
  'Płaski smak (Jałowy)',
  '12–16h w 18–20°C (lub 4h w 24°C)',
  '16–24h w 16–18°C (lub 24–48h w lodówce)',
  '12–24h w chłodzie (4–8°C)',
  '4–8h w 24–26°C do szczytu objętości',
  'Do ostygnięcia do temp. pokojowej',
  'Min. 4h lub przez noc w lodówce',
];

/** Słownik języka z wygenerowanych plików (src/lib/i18n-slowniki/<kod>/czesc-N.ts): literały 'klucz': 'wartość'. */
function slownik(kod: string): Map<string, string> {
  const dir = path.join(root, 'src/lib/i18n-slowniki', kod);
  const m = new Map<string, string>();
  for (const f of fs.readdirSync(dir).filter((x) => /^czesc-\d+\.ts$/.test(x))) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const [, k, v] of src.matchAll(/^\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"):\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"),?$/gm)) {
      m.set(JSON.parse(k.startsWith("'") ? `"${k.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"` : k),
        JSON.parse(v.startsWith("'") ? `"${v.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"` : v));
    }
  }
  return m;
}

describe('093: 12 kluczy po małym przebiegu przekładu', () => {
  // Przebieg a5 (M1, 2026-10-23: batche a5, a5b, a5c, 164 klucze × 33 języki, walidacja 0 braków) wpięty przez M3;
  // wyjątki a1b, D-13, 216, P-a/P-b, PRZ, D10, W-fix2 i toru T (F-71, 217) usunięte razem z wpisami listy.
  // Przebieg a5d (M3 T2, D-123: 175 kluczy × 33 języki, M1 2026-10-28) wpięty 2026-10-29; wyjątek „T2 / a5d” usunięty.
  // Mały przebieg M2 p2 (2026-11-09, M1-audytor-generalny-014; 09-lokalizacja-005): 15 kluczy „noc / D-126” i
  // „noc / D-132” oraz nowe klucze D-303…D-307 przełożone (docs/lokalizacja/przeklad-m2-*-2026-11-09.json);
  // wyjątki „noc / D-126”, „noc / D-132” i „M2 p2 / 014” usunięte — lista bez wyjątków.
  it('lista czekających na przekład jest pusta, bez wyjątków (po małym przebiegu M2 p2, 014)', () => {
    const j = JSON.parse(fs.readFileSync(path.join(root, 'docs/lokalizacja/czeka-na-przeklad.json'), 'utf8').replace(/^\uFEFF/, ''));
    expect((j.klucze as { klucz: string }[]).map((x) => x.klucz)).toEqual([]);
  });

  // 014: 15 kluczy z dawnych wyjątków D-126 i D-132 mają w każdym z 33 języków własny tekst, nie angielski
  it.each(getAllSupportedLocaleCodes().filter((k) => k !== 'pl' && k !== 'en'))('%s: 15 kluczy 014 ma własny tekst', (kod) => {
    const s = slownik(kod);
    const brak = KLUCZE_014.filter((k) => !s.get(k) || s.get(k) === EN[k]);
    expect(brak).toEqual([]);
  });

  it.each(getAllSupportedLocaleCodes().filter((k) => k !== 'pl' && k !== 'en'))('%s: każdy z 12 kluczy ma własny tekst', (kod) => {
    const s = slownik(kod);
    const brak = KLUCZE.filter((k) => !s.get(k) || s.get(k) === EN[k]);
    expect(brak).toEqual([]);
  });
});
