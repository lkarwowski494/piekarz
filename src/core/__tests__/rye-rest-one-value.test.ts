/**
 * Jeden czas odpoczynku chleba żytniego przed krojeniem: 24 h według King Arthur Baking (ZYT-STU-001,
 * zalecenie z atrybucją, nie minimum). Wycofane: 8 h, „minimum 12–24 h”, 12 h [M1-audytor-generalny-043; 06-tresci-006].
 * Zdania dosłownie z docs/tresci/{pl,en}/chleb-zytni-studzenie.md.
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '../../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const register = (lang: 'pl' | 'en') =>
  read(`docs/tresci/${lang}/chleb-zytni-studzenie.md`)
    .split('\n')
    .filter((l) => l.includes('[T:ZYT-STU-001]'))
    .map((l) => l.replace('[T:ZYT-STU-001]', '').trim());

const FILES = [
  'src/doctor/diagnostics.ts',
  'src/core/techniques/shaping-baking-techniques.ts',
  'src/core/bread-school-lessons.ts',
  'src/recipes/presets.ts',
];

describe('odpoczynek chleba żytniego: jedna wartość ze źródłem', () => {
  it('brak wycofanych wartości (8 h, minimum 12–24 h, 12 h)', () => {
    const retired = [/min\. 8h/, /12[–-]24 ?(h|godzin|hours)/i, /po 12 godzinach od upieczenia/];
    const hits = FILES.flatMap((f) => retired.filter((r) => r.test(read(f))).map((r) => `${f}: ${r}`));
    expect(hits).toEqual([]);
  });

  it('zdania PL i EN z rejestru są w Doktorze, technice, lekcji i presecie', () => {
    const code = FILES.map(read).join('\n');
    for (const s of [...register('pl'), ...register('en')]) expect(code).toContain(s);
  });
});
