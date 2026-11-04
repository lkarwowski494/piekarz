/**
 * 06z (D-237, D-248): wektor katalogu p8 (docs/tresci/wektory/katalog-m3-2026-11-03.json) zgodny z kodem w soli.
 * Wartość liczbowa w wektorze = `formula.saltPercentage` receptury o tym samym `id` i stoi na potwierdzonym
 * twierdzeniu rejestru; `null` dopuszczalne tylko z twierdzeniem `otwarte` w rejestrze (kod ma wtedy 0).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { KATALOG_M3_RECIPES } from '../src/recipes/katalog';

const root = path.join(__dirname, '..');
interface Sol { wartosc: number | null; twierdzenie: string | null; otwarte?: string }
const WEKTOR: { receptury: { id: string; formula: { sol_proc: Sol } }[] } = JSON.parse(
  fs.readFileSync(path.join(root, 'docs', 'tresci', 'wektory', 'katalog-m3-2026-11-03.json'), 'utf8'),
);
const REJESTR: { id: string; status: string }[] = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'tresci', 'rejestr.json'), 'utf8'));
const status = (id: string | null | undefined) => REJESTR.find((t) => t.id === id)?.status;

describe('06z (D-248): sól w wektorze katalogu = sól w kodzie', () => {
  it('wektor i kod mają te same receptury katalogu p8', () => {
    expect(WEKTOR.receptury.map((r) => r.id).sort()).toEqual(KATALOG_M3_RECIPES.map((r) => r.id).sort());
  });

  it.each(WEKTOR.receptury.map((r) => [r.id, r.formula.sol_proc] as const))('%s: sol_proc zgodne z kodem i rejestrem', (id, sol) => {
    const kod = KATALOG_M3_RECIPES.find((r) => r.id === id)!.formula.saltPercentage;
    if (sol.wartosc === null) {
      expect(status(sol.otwarte)).toBe('otwarte');
      expect(kod).toBe(0);
    } else {
      expect(kod).toBe(sol.wartosc);
      expect(status(sol.twierdzenie)).toBe('potwierdzone');
    }
  });

  it('karelian_rye_pasties: 2,1% z KAT-KAR-010 (KAT-KAR-007 wycofane w D-237)', () => {
    const r = WEKTOR.receptury.find((x) => x.id === 'karelian_rye_pasties')!;
    expect(r.formula.sol_proc).toMatchObject({ wartosc: 2.1, twierdzenie: 'KAT-KAR-010' });
    expect(status('KAT-KAR-007')).toBe('wycofane');
  });
});
