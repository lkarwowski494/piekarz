/**
 * Czasy we wspólnym formacie (design-spec §7, §11c 116): bez skrótów „14h”, „2d temu”, „3-4h” w tekstach PL;
 * zakresy z półpauzą i spacją przed „h”; „2 dni temu” z formą liczby [M1-audytor-generalny-162; 04-studio-projektowe-508].
 */
import fs from 'fs';
import path from 'path';
import { EN } from '../src/lib/i18n.en';
import { setLang } from '../src/lib/i18n';
import { dniTemu, godzinTemu } from '../src/lib/czas-temu';
import { prepareBakeAgainRecipe } from '../src/lib/recipe-navigation';

const rootDir = path.resolve(__dirname, '..');

function walk(dir: string): string[] {
  let res: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['__tests__', 'node_modules', 'i18n-en', 'i18n-slowniki'].includes(entry.name)) res = res.concat(walk(full));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name)) res.push(full);
  }
  return res;
}
const rel = (f: string) => path.relative(rootDir, f).split(path.sep).join('/');

/** Pliki bez wejścia w 1.0 (Akademia F-44, druk F-50, zamrożone kroki starych sesji, przelicznik F-45). */
const BEZ_WEJSCIA = [
  'src/core/bread-school-lessons.ts',
  'src/core/techniques/prep-ferment-techniques.ts',
  'src/core/techniques/shaping-baking-techniques.ts',
  'src/lib/pdf-sheet-generator.ts',
  'src/core/legacy-steps-v1.ts',
];

/** Teksty bez wejścia w 1.0: czas dojrzewania yudane (tangzhong i yudane nie ma w menu zaczynów, 131; klucz z przebiegu 093). */
const BEZ_WEJSCIA_TEKSTY = ['Min. 4h lub przez noc w lodówce'];

/** Skrót czasu bez spacji („14h”, „2d”, „{n}h”) albo zakres z dywizem („3-4h”). */
const SKROT = /(\d|\})[hd]\b|\d-\d+\s?h\b/;

describe('162: czasy bez skrótów w tekstach PL', () => {
  it('kontrola wzorca', () => {
    expect(SKROT.test('1:1:1 (Szybki 3-4h)')).toBe(true);
    expect(SKROT.test('{days}d temu')).toBe(true);
    expect(SKROT.test('{n}h')).toBe(true);
    expect(SKROT.test('14h')).toBe(true);
    expect(SKROT.test('1:1:1 (szybki, 3–4 h)')).toBe(false);
    expect(SKROT.test('{n} h')).toBe(false);
  });

  it('klucze t() w kodzie z wejściem w 1.0 i teksty PL z wpisem EN bez skrótów czasu', () => {
    const pliki = ['app', 'src'].flatMap((d) => walk(path.join(rootDir, d))).filter((f) => !BEZ_WEJSCIA.includes(rel(f)));
    const zle: string[] = [];
    for (const f of pliki) {
      // Bez komentarzy: apostrof w komentarzu („Baker's”) rozjeżdżał wzorzec literałów i plik wypadał ze
      // sprawdzenia (reaudit nocny 2026-10-22, presets.ts) [M1-audytor-generalny-162]
      const src = fs
        .readFileSync(f, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      for (const m of src.matchAll(/'((?:[^'\\]|\\.)*)'/g)) {
        const s = m[1];
        if ((s in EN || /\bt\(\s*$/.test(src.slice(Math.max(0, m.index - 6), m.index))) && SKROT.test(s) && !BEZ_WEJSCIA_TEKSTY.includes(s)) zle.push(`${rel(f)}: ${s}`);
      }
    }
    expect([...new Set(zle)]).toEqual([]);
  });

  it('wpis Dziennika z dawną nazwą pizzy „(48h)” dalej trafia do tej receptury w „Piecz ponownie”', () => {
    const r = prepareBakeAgainRecipe({ id: 'b', recipeName: 'Pizza Napoletana Verace (48h)', startedAt: 1 }, []);
    expect(r.id).toBe('pizza_napoletana_48h');
  });

  it('„… temu” z formą liczby: 1 dzień temu, 2 dni temu, 5 dni temu (PL i EN)', () => {
    setLang('pl');
    expect([1, 2, 5, 22].map(dniTemu)).toEqual(['1 dzień temu', '2 dni temu', '5 dni temu', '22 dni temu']);
    expect(godzinTemu(3)).toBe('3 h temu');
    setLang('en');
    expect([1, 3].map(dniTemu)).toEqual(['1 day ago', '3 days ago']);
    expect(godzinTemu(3)).toBe('3 h ago');
    setLang('pl');
  });
});
