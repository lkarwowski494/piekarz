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

// Zmiana 216 (M2 p20, tor P): 5 kluczy wyboru rodzaju drożdży czeka na wspólny przebieg przekładu M1; po przebiegu
// usuń wpisy i tę stałą [M1-audytor-generalny-216].
const CZEKAJA_216 = [
  'Drożdże suche',
  'Drożdże do odważenia',
  'świeże|drożdże',
  'suche|drożdże',
  'Procent drożdży w recepturze to drożdże świeże. Drożdży suchych (instant albo aktywnych) odważysz 0,4 tej masy.',
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
  // Zmiana a1b (M3 p1b): 4 klucze pytania przy starcie drugiego wypieku czekają na przebieg przekładu a5; zmiana
  // testu tylko o ten wyjątek (inny klucz na liście nadal czerwony). Po przebiegu a5 usuń wpisy i tę stałą.
  const CZEKAJA_A1B = [
    'Trwa już inny wypiek',
    'Nowy wypiek zastąpi trwający. Jego postęp i powiadomienia znikną.',
    'Nowy wypiek zastąpi trwający: „{nazwa}”. Jego postęp i powiadomienia znikną.',
    'Wróć do trwającego',
    'Przerwij tamten i zacznij nowy',
    'W tym dniu zmienia się czas, a wybranej godziny nie ma. Chleb będzie gotowy o {godzina}.',
  ];
  it('lista czekających jest pusta (poza 5 kluczami a1b i kluczem D-13 do przebiegu a5)', () => {
    const j = JSON.parse(fs.readFileSync(path.join(root, 'docs/lokalizacja/czeka-na-przeklad.json'), 'utf8'));
    expect((j.klucze as { klucz: string }[]).map((x) => x.klucz).filter((k) => !CZEKAJA_A1B.includes(k) && !CZEKAJA_216.includes(k))).toEqual([]);
  });

  it.each(getAllSupportedLocaleCodes().filter((k) => k !== 'pl' && k !== 'en'))('%s: każdy z 12 kluczy ma własny tekst', (kod) => {
    const s = slownik(kod);
    const brak = KLUCZE.filter((k) => !s.get(k) || s.get(k) === EN[k]);
    expect(brak).toEqual([]);
  });
});
