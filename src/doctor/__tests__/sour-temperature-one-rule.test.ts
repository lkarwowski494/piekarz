/**
 * Doktor i preset San Francisco mówią jedną regułę: niższą temperaturę fermentacji wiąże się z kwasem
 * octowym (KWA-TEM-001; Calvert i in. 2021). Wycofane: „chłód faworyzuje łagodniejszy kwas mlekowy”
 * (KWA-TEM-900), „sprzyja namnażaniu bakterii octowych” (KWA-OCT-900), „15–20 °C” (KWA-TEM-901)
 * [M1-audytor-generalny-042; 06-tresci-005]. Zdania dosłownie z docs/tresci/pl/kwasowosc-temperatura.md.
 */
import * as fs from 'fs';
import * as path from 'path';
import { MASTER_RECIPES } from '../../recipes/presets';

const ROOT = path.join(__dirname, '../../..');
const register = fs
  .readFileSync(path.join(ROOT, 'docs/tresci/pl/kwasowosc-temperatura.md'), 'utf8')
  .split('\n')
  .filter((l) => /\[T:[^\]]+\]\s*$/.test(l) && !l.startsWith('<!--'))
  .map((l) => l.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim());
const diagnostics = fs.readFileSync(path.join(ROOT, 'src/doctor/diagnostics.ts'), 'utf8');

describe('temperatura a kwasowość: jedna reguła', () => {
  it('Doktor nie zaleca chłodu dla łagodniejszego smaku i nie podaje 15–20 °C jako przyczyny', () => {
    expect(diagnostics).not.toMatch(/łagodniejszy kwas mlekowy/);
    expect(diagnostics).not.toMatch(/fermentacja w temperaturze 15–20°C/);
  });

  it('Doktor mówi zdaniami z rejestru (przyczyna i zalecenie)', () => {
    expect(diagnostics).toContain(register[0]);
    expect(diagnostics).toContain(register[1]);
  });

  it('preset San Francisco mówi tę samą regułę, bez „namnażania bakterii octowych”', () => {
    const sf = MASTER_RECIPES.find((p) => p.id === 'san_francisco_sourdough')!;
    expect(sf.notesPl).not.toMatch(/namnażaniu bakterii octowych/);
    expect(sf.notesPl).toContain(register[2]);
  });
});
