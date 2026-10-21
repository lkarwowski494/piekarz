/**
 * 208: zdanie Doktora o temperaturze ciasta po wymieszaniu w trybie imperialnym podaje zakres źródła
 * DIA-DDT-001 (King Arthur Baking: 75–78 °F), a nie 75–79 °F z zaokrąglenia 26 °C; rejestr zgodny z tekstem
 * [M1-audytor-generalny-208; 06-tresci-604].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { diagnoseBreadDefect } from '../diagnostics';
import { setLang, t } from '../../lib/i18n';
import { setUnitSystem } from '../../lib/unit-converter';

const ROOT = join(__dirname, '..', '..', '..');
const rejestr: { id: string; uproszczenie?: string }[] = JSON.parse(readFileSync(join(ROOT, 'docs/tresci/rejestr.json'), 'utf8'));

const zdaniaDDT = () =>
  [{ crumbHasHugeTopHolesWithDenseBottom: true }, { breadIsExcessivelySour: true }]
    .map((o) => diagnoseBreadDefect(o).actionChecklistPl.find((a) => a.includes('King Arthur Baking ciasto pszenne')))
    .map((s) => {
      expect(s).toBeDefined();
      return s as string;
    });

describe('208: DDT Doktora w °F = zakres źródła', () => {
  afterEach(() => {
    setUnitSystem('metric');
    setLang('pl');
  });

  it.each(['pl', 'en'] as const)('%s, tryb imperialny: 75–78 °F, nie 79 °F', (kod) => {
    setLang(kod);
    setUnitSystem('imperial');
    for (const s of zdaniaDDT()) {
      const ekran = t(s);
      expect(ekran).toMatch(/75–78\s?°F/);
      expect(ekran).not.toMatch(/79\s?°F/);
    }
  });

  it('rejestr DIA-DDT-001: uproszczenie mówi o 75–78 °F w trybie imperialnym, bez 75–79 °F', () => {
    const u = rejestr.find((r) => r.id === 'DIA-DDT-001')?.uproszczenie ?? '';
    expect(u).not.toMatch(/75–79/);
    expect(u).toMatch(/75–78 °F/);
  });
});
