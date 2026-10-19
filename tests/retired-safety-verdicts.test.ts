/**
 * Werdykty bezpieczeństwa zakwasu wycofane decyzją DEC-10 (a) (zasada ostrożności:
 * każdy nalot lub przebarwienie → wyrzuć; bez werdyktu „jadalny”, „zdrowy”, „bezpieczny”)
 * nie mogą zostać w słowniku ani w kodzie aplikacji, nawet nieużywane.
 * Źródło wymogu: rejestr treści docs/tresci/rejestr.json (ZAK-NAL-001, ZAK-HOO-001, ZAK-PLE-*).
 */
import * as fs from 'fs';
import * as path from 'path';
import { EN } from '../src/lib/i18n.en';

const RETIRED_EN = [/harmless/i, /safe but hungry/i, /hunger liquid/i, /fuzzy colou?red spots/i, /toxic mold/i];
const RETIRED_PL = [
  'Bezpieczny kożuch drożdżowy',
  'zakwas jest zdrowy, ale głodny',
  'Puszyste kolorowe plamy',
  'Biały matowy kożuch',
  'Ciemny płyn / zapach alkoholu',
  'ALARM: Wykryto niebezpieczną pleśń',
];

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : sourceFiles(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

describe('wycofane werdykty bezpieczeństwa zakwasu (DEC-10 a)', () => {
  it('słownik EN nie zawiera wycofanych werdyktów w kluczach ani wartościach', () => {
    const hits = Object.entries(EN).filter(
      ([pl, en]) => RETIRED_EN.some((r) => r.test(en)) || RETIRED_PL.some((s) => pl.includes(s)),
    );
    expect(hits).toEqual([]);
  });

  it('kod aplikacji (app/, src/) nie zawiera wycofanych tekstów PL', () => {
    const root = path.join(__dirname, '..');
    const files = [...sourceFiles(path.join(root, 'app')), ...sourceFiles(path.join(root, 'src'))];
    const hits = files.flatMap((f) => {
      const text = fs.readFileSync(f, 'utf8');
      return RETIRED_PL.filter((s) => text.includes(s)).map((s) => `${path.relative(root, f)}: ${s}`);
    });
    expect(hits).toEqual([]);
  });
});
